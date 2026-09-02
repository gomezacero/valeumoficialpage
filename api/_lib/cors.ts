/* ============================================================
   VALEUM — CORS
   Los formularios de otros dominios (marca personal en cPanel)
   llaman a esta API desde el navegador, así que necesitan permiso
   explícito. Lista blanca cerrada: nada de "*".
   ============================================================ */
import type { VercelRequest, VercelResponse } from "@vercel/node";

const ALLOWED = [
  "https://jesusmontero.co",
  "https://www.jesusmontero.co",
  "https://valeum.co",
  "https://www.valeum.co",
];

/**
 * Aplica las cabeceras CORS y responde al preflight.
 * Devuelve true si la petición ya quedó resuelta (OPTIONS).
 */
export function applyCors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = req.headers.origin || "";

  if (ALLOWED.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  return false;
}
