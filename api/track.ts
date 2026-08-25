/* ============================================================
   VALEUM — POST /api/track
   Registra hasta dónde llega cada visitante en el formulario.
   Sirve para distinguir "no llega nadie" de "llegan y abandonan",
   y para ver en qué pregunta concreta se cae la gente.

   Deliberadamente silencioso: la analítica nunca debe romper la
   página ni devolver errores al visitante.
   ============================================================ */
import { createHash, randomUUID } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabase } from "./_lib/supabase.js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function clientIp(req: VercelRequest): string {
  const fwd = req.headers["x-forwarded-for"];
  const raw = Array.isArray(fwd) ? fwd[0] : fwd || "";
  return raw.split(",")[0].trim() || "unknown";
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).end();
    return;
  }

  try {
    const body = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) as Record<string, unknown>;

    const session = typeof body.session === "string" && UUID_RE.test(body.session) ? body.session : randomUUID();
    const step = Math.min(6, Math.max(0, Number(body.step) || 0));
    const lang = typeof body.lang === "string" ? body.lang.slice(0, 4) : null;
    const referrer = typeof body.referrer === "string" ? body.referrer.slice(0, 500) : null;

    await getSupabase().rpc("record_progress", {
      p_session: session,
      p_step: step,
      p_lang: lang,
      p_referrer: referrer,
      p_user_agent: String(req.headers["user-agent"] || "").slice(0, 500),
      p_ip_hash: createHash("sha256").update(clientIp(req)).digest("hex"),
    });
  } catch (err) {
    console.error("[valeum] track falló:", err instanceof Error ? err.message : err);
  }

  // Siempre 204: al visitante nunca le importa si la analítica falló.
  res.status(204).end();
}
