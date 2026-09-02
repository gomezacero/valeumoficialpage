/* ============================================================
   VALEUM — POST /api/contact
   Formularios simples de contacto (nombre, WhatsApp, email) que
   viven en otros dominios, como la web de marca personal alojada
   en cPanel. Se guardan en la misma tabla que los leads de Valeum,
   distinguidos por la columna source.

   Igual que /api/lead: si la base de datos o el correo fallan, el
   lead queda íntegro en los logs y el visitante nunca ve un error.
   ============================================================ */
import { createHash } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors } from "./_lib/cors.js";
import { requireEnv } from "./_lib/env.js";
import { sendMail } from "./_lib/mailer.js";
import { getSupabase } from "./_lib/supabase.js";
import { contactEmail } from "./_lib/templates.js";

const MAX = { name: 120, email: 200, whatsapp: 40, source: 60, page: 300 } as const;
const MIN_ELAPSED_MS = 3000;
const RATE_LIMIT = { max: 5, windowMinutes: 10 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clientIp(req: VercelRequest): string {
  const fwd = req.headers["x-forwarded-for"];
  const raw = Array.isArray(fwd) ? fwd[0] : fwd || "";
  return raw.split(",")[0].trim() || "unknown";
}

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (applyCors(req, res)) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const body = (typeof req.body === "string" ? safeParse(req.body) : req.body) as Record<string, unknown> | null;
  if (!body) {
    res.status(400).json({ error: "invalid_json" });
    return;
  }

  // Antispam silencioso: al bot se le responde ok para no darle pistas.
  const honeypot = str(body.website, 100);
  const elapsed = Number(body.elapsedMs) || 0;
  if (honeypot || (elapsed > 0 && elapsed < MIN_ELAPSED_MS)) {
    res.status(200).json({ ok: true });
    return;
  }

  const name = str(body.name, MAX.name);
  const email = str(body.email, MAX.email);
  const whatsapp = str(body.whatsapp, MAX.whatsapp);
  const source = str(body.source, MAX.source) || "jesusmontero";
  const page = str(body.page, MAX.page);

  const errors: string[] = [];
  if (!name) errors.push("name");
  if (!EMAIL_RE.test(email)) errors.push("email");
  if (!whatsapp) errors.push("whatsapp");

  if (errors.length) {
    res.status(400).json({ error: "validation_failed", fields: errors });
    return;
  }

  const ipHash = createHash("sha256").update(clientIp(req)).digest("hex");

  const record = {
    name,
    email,
    whatsapp,
    source,
    // Este formulario no hace cuestionario: sin puntaje ni reparto.
    score: 0,
    matched: true,
    owner: "jesus",
    lang: str(body.lang, 4) || "es",
    user_agent: str(req.headers["user-agent"], 500),
    ip_hash: ipHash,
  };

  let stored = false;
  try {
    const supabase = getSupabase();

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
    console.error("[valeum] CONTACTO NO GUARDADO — recuperar de este log:", JSON.stringify(record));
    console.error("[valeum] causa:", err instanceof Error ? err.message : err);
  }

  let notified = false;
  try {
    const mail = contactEmail({ name, email, whatsapp, source, page });
    await sendMail({ to: requireEnv("JESUS_EMAIL"), replyTo: email, ...mail });
    notified = true;
  } catch (err) {
    console.error("[valeum] no se pudo avisar del contacto:", err instanceof Error ? err.message : err);
  }

  console.log(`[valeum] contacto de ${email} (${source}) · guardado=${stored} · notificado=${notified}`);
  res.status(200).json({ ok: true });
}

function safeParse(s: string): Record<string, unknown> | null {
  try {
    return JSON.parse(s) as Record<string, unknown>;
  } catch {
    return null;
  }
}
