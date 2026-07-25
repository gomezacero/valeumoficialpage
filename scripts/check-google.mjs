/* ============================================================
   VALEUM — Diagnóstico de la cuenta de servicio de Google
   Comprueba que la delegación de dominio está bien configurada
   y que se pueden leer los calendarios de Jesús y Harry.

   Uso:  npm run check:google
   ============================================================ */
import { JWT } from "google-auth-library";

const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];
const API = "https://www.googleapis.com/calendar/v3";

const ok = (m) => console.log(`  \x1b[32m✓\x1b[0m ${m}`);
const bad = (m) => console.log(`  \x1b[31m✗\x1b[0m ${m}`);
const info = (m) => console.log(`    \x1b[2m${m}\x1b[0m`);

function checkEnv() {
  console.log("\n\x1b[1m1. Variables de entorno\x1b[0m");
  const required = ["GOOGLE_SA_EMAIL", "GOOGLE_SA_PRIVATE_KEY", "JESUS_CALENDAR_ID", "HARRY_CALENDAR_ID"];
  let allPresent = true;

  for (const name of required) {
    if (process.env[name]) {
      const v = process.env[name];
      ok(`${name} = ${name.includes("PRIVATE") ? `(${v.length} caracteres)` : v}`);
    } else {
      bad(`${name} no está definida`);
      allPresent = false;
    }
  }

  const key = process.env.GOOGLE_SA_PRIVATE_KEY || "";
  if (key && !key.includes("BEGIN PRIVATE KEY")) {
    bad("GOOGLE_SA_PRIVATE_KEY no parece una clave PEM (falta '-----BEGIN PRIVATE KEY-----')");
    allPresent = false;
  }
  return allPresent;
}

async function checkCalendar(owner, calendarId) {
  console.log(`\n\x1b[1m${owner} · ${calendarId}\x1b[0m`);

  let token;
  try {
    const client = new JWT({
      email: process.env.GOOGLE_SA_EMAIL,
      key: process.env.GOOGLE_SA_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: SCOPES,
      subject: calendarId,
    });
    ({ token } = await client.getAccessToken());
    ok("Token obtenido: la delegación de dominio funciona");
  } catch (err) {
    const msg = String(err?.message || err);
    bad(`No se pudo obtener el token: ${msg}`);
    if (msg.includes("unauthorized_client")) {
      info("Causa habitual: el Client ID no está autorizado en admin.google.com,");
      info("o el ámbito no coincide EXACTAMENTE con calendar.readonly.");
      info("Si acabas de configurarlo, puede tardar unos minutos en propagarse.");
    } else if (msg.includes("invalid_grant")) {
      info("Causa habitual: el correo suplantado no existe en el dominio,");
      info("o la clave privada está mal copiada.");
    }
    return false;
  }

  const params = new URLSearchParams({
    timeMin: new Date().toISOString(),
    maxResults: "5",
    singleEvents: "true",
    orderBy: "startTime",
  });

  const res = await fetch(`${API}/calendars/${encodeURIComponent(calendarId)}/events?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const body = await res.text();
    bad(`La API respondió ${res.status}`);
    if (res.status === 403 && body.includes("accessNotConfigured")) {
      info("La Google Calendar API no está habilitada en el proyecto de Cloud.");
    } else {
      info(body.slice(0, 300));
    }
    return false;
  }

  const data = await res.json();
  const items = data.items || [];
  ok(`Calendario leído correctamente (${items.length} eventos próximos)`);

  for (const e of items.slice(0, 3)) {
    const when = e.start?.dateTime || e.start?.date || "sin fecha";
    const guests = (e.attendees || []).filter((a) => !a.self).length;
    info(`· ${when} — ${e.summary || "(sin título)"}${guests ? ` · ${guests} invitado(s)` : ""}`);
  }
  if (!items.length) {
    info("Sin eventos próximos. No es un error: el sync detectará las reservas cuando ocurran.");
  }
  return true;
}

console.log("\x1b[1m\nDiagnóstico de Google Calendar — Valeum\x1b[0m");

if (!checkEnv()) {
  console.log("\n\x1b[31mFaltan variables. Complétalas en .env y vuelve a ejecutar.\x1b[0m\n");
  process.exit(1);
}

// Secuencial a propósito: en paralelo los mensajes de ambas cuentas se
// entremezclan y no se sabe qué error pertenece a cuál.
const results = [];
results.push(await checkCalendar("Jesús", process.env.JESUS_CALENDAR_ID));
results.push(await checkCalendar("Harry", process.env.HARRY_CALENDAR_ID));

if (results.every(Boolean)) {
  console.log("\n\x1b[32mTodo correcto: el sync de calendarios puede funcionar.\x1b[0m\n");
} else {
  console.log("\n\x1b[31mHay problemas pendientes. Revisa los mensajes de arriba.\x1b[0m\n");
  process.exit(1);
}
