/* ============================================================
   VALEUM — POST /api/lead
   Recibe las respuestas crudas del formulario-filtro, decide el
   puntaje y el calendario EN EL SERVIDOR, persiste el lead y avisa
   por correo al responsable asignado.
   ============================================================ */
import { createHash } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ownerConfig } from "./_lib/env.js";
import { sendMail } from "./_lib/mailer.js";
import {
  BUDGETS,
  SERVICES,
  STAGES,
  assignOwner,
  computeScore,
  isMatch,
  type Budget,
  type Service,
  type Stage,
} from "./_lib/scoring.js";
import { getSupabase } from "./_lib/supabase.js";
import { leadEmail, type LeadData } from "./_lib/templates.js";

/** Límites de longitud, alineados con el formulario. */
const MAX = { business: 2000, name: 120, email: 200, company: 200, country: 120 } as const;

/** Antispam: mínimo de tiempo verosímil para completar 5 pasos. */
const MIN_ELAPSED_MS = 3000;
/** Máximo de envíos por IP en la ventana indicada. */
const RATE_LIMIT = { max: 5, windowMinutes: 10 };

function clientIp(req: VercelRequest): string {
  const fwd = req.headers["x-forwarded-for"];
  const raw = Array.isArray(fwd) ? fwd[0] : fwd || "";
  return raw.split(",")[0].trim() || "unknown";
}

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const body = (typeof req.body === "string" ? safeParse(req.body) : req.body) as Record<string, unknown> | null;
  if (!body) {
    res.status(400).json({ error: "invalid_json" });
    return;
  }

  // --- Antispam silencioso -------------------------------------------------
  // Si el honeypot viene lleno o el envío fue instantáneo, respondemos 200
  // con matched:false para no darle señal al bot de que lo detectamos.
  const honeypot = str(body.website, 100);
  const elapsed = Number(body.elapsedMs) || 0;
  if (honeypot || elapsed < MIN_ELAPSED_MS) {
    res.status(200).json({ matched: false, calendarUrl: "" });
    return;
  }

  // --- Validación ----------------------------------------------------------
  const service = str(body.service, 20) as Service;
  const stage = str(body.stage, 20) as Stage;
  const budget = str(body.budget, 20) as Budget;
  const business = str(body.business, MAX.business);
  const name = str(body.name, MAX.name);
  const email = str(body.email, MAX.email);
  const company = str(body.company, MAX.company);
  const country = str(body.country, MAX.country);
  const lang = ["es", "en", "pt"].includes(str(body.lang, 4)) ? str(body.lang, 4) : "es";

  const errors: string[] = [];
  if (!SERVICES.includes(service)) errors.push("service");
  if (!STAGES.includes(stage)) errors.push("stage");
  if (!BUDGETS.includes(budget)) errors.push("budget");
  if (!business) errors.push("business");
  if (!name) errors.push("name");
  if (!EMAIL_RE.test(email)) errors.push("email");
  if (!country) errors.push("country");

  if (errors.length) {
    res.status(400).json({ error: "validation_failed", fields: errors });
    return;
  }

  const ipHash = hashIp(clientIp(req));

  // --- Decisión del servidor ----------------------------------------------
  // Se calcula antes de tocar la base de datos: el veredicto y el calendario
  // no dependen de que la persistencia esté disponible.
  const score = computeScore(service, stage, budget);
  const matched = isMatch(score);
  const owner = assignOwner(service);
  const { email: ownerEmail, calendarUrl } = ownerConfig(owner);

  const record = {
    service,
    stage,
    budget,
    business,
    name,
    email,
    company: company || null,
    country,
    score,
    matched,
    owner,
    calendar_url: calendarUrl,
    lang,
    source: str(body.source, 60) || "valeum-landing",
    user_agent: str(req.headers["user-agent"], 500),
    ip_hash: ipHash,
  };

  // --- Persistencia --------------------------------------------------------
  // Si Supabase no está configurado o falla, el lead NO se pierde: queda
  // completo en los logs de Vercel, de donde se puede recuperar a mano.
  // Nunca se devuelve un error al visitante por un problema de infraestructura.
  let stored = false;
  try {
    const supabase = getSupabase();

    // Límite por IP (solo posible con base de datos disponible).
    const since = new Date(Date.now() - RATE_LIMIT.windowMinutes * 60_000).toISOString();
    const { count, error: countError } = await supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", since);

    if (!countError && (count ?? 0) >= RATE_LIMIT.max) {
      res.status(429).json({ error: "rate_limited" });
      return;
    }

    const { error: insertError } = await supabase.from("leads").insert(record);
    if (insertError) throw insertError;
    stored = true;
  } catch (err) {
    console.error("[valeum] LEAD NO GUARDADO — recuperar de este log:", JSON.stringify(record));
    console.error("[valeum] causa:", err instanceof Error ? err.message : err);
  }

  // --- Aviso por correo ----------------------------------------------------
  // Un fallo de SMTP no invalida el lead ya guardado: se registra y seguimos.
  const leadData: LeadData = {
    service,
    stage,
    budget,
    business,
    name,
    email,
    company,
    country,
    score,
    matched,
    owner,
    calendarUrl,
    lang,
  };

  let notified = false;
  try {
    const mail = leadEmail(leadData);
    await sendMail({ to: ownerEmail, replyTo: email, ...mail });
    notified = true;
  } catch (err) {
    console.error("[valeum] no se pudo enviar el aviso por correo:", err instanceof Error ? err.message : err);
  }

  // Deja rastro del estado real de cada envío, para detectar de un vistazo
  // si falta configuración sin tener que reproducir el caso.
  console.log(`[valeum] lead de ${email} · guardado=${stored} · notificado=${notified}`);

  res.status(200).json({ matched, calendarUrl: matched ? calendarUrl : "" });
}

function safeParse(s: string): Record<string, unknown> | null {
  try {
    return JSON.parse(s) as Record<string, unknown>;
  } catch {
    return null;
  }
}
