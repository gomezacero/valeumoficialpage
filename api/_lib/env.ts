/* ============================================================
   VALEUM — ACCESO A VARIABLES DE ENTORNO
   Falla ruidosamente si falta algo, en vez de fallar en silencio
   a mitad de un envío.
   ============================================================ */
import type { Owner } from "./scoring.js";

export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Falta la variable de entorno ${name}`);
  return v;
}

export function optionalEnv(name: string, fallback = ""): string {
  return process.env[name] || fallback;
}

/** Correo y URL de agenda de cada responsable. */
export function ownerConfig(owner: Owner): { email: string; calendarUrl: string; calendarId: string } {
  const prefix = owner === "jesus" ? "JESUS" : "HARRY";
  return {
    email: requireEnv(`${prefix}_EMAIL`),
    calendarUrl: requireEnv(`${prefix}_CAL_URL`),
    calendarId: optionalEnv(`${prefix}_CALENDAR_ID`) || requireEnv(`${prefix}_EMAIL`),
  };
}
