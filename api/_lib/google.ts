/* ============================================================
   VALEUM — GOOGLE CALENDAR API
   Cuenta de servicio con delegación a nivel de dominio: suplanta
   a cada responsable para leer su calendario. Se usa REST directo
   con google-auth-library en vez del paquete googleapis, que pesa
   ~100 MB y no cabe cómodamente en una función serverless.
   ============================================================ */
import { JWT } from "google-auth-library";
import { requireEnv } from "./env";

const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];
const API = "https://www.googleapis.com/calendar/v3";

export interface GoogleEvent {
  id: string;
  status?: string;
  summary?: string;
  description?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  attendees?: Array<{ email?: string; displayName?: string; self?: boolean; organizer?: boolean }>;
  organizer?: { email?: string; self?: boolean };
  eventType?: string;
}

export interface EventsPage {
  items: GoogleEvent[];
  nextPageToken?: string;
  nextSyncToken?: string;
}

/** Token de acceso suplantando al dueño del calendario. */
async function accessTokenFor(subject: string): Promise<string> {
  const client = new JWT({
    email: requireEnv("GOOGLE_SA_EMAIL"),
    // En Vercel la clave se guarda con \n literales.
    key: requireEnv("GOOGLE_SA_PRIVATE_KEY").replace(/\\n/g, "\n"),
    scopes: SCOPES,
    subject,
  });
  const { token } = await client.getAccessToken();
  if (!token) throw new Error(`No se pudo obtener token para ${subject}`);
  return token;
}

/** Se lanza cuando el syncToken caducó y toca rehacer la sincronización completa. */
export class SyncTokenExpired extends Error {
  constructor() {
    super("syncToken expirado (410): se requiere sincronización completa");
    this.name = "SyncTokenExpired";
  }
}

/**
 * Lista eventos de un calendario.
 * Con syncToken devuelve solo los cambios desde la última corrida;
 * sin él, arranca desde ahora hacia adelante.
 */
export async function listEvents(
  calendarId: string,
  opts: { syncToken?: string; pageToken?: string }
): Promise<EventsPage> {
  const token = await accessTokenFor(calendarId);
  const params = new URLSearchParams({ maxResults: "250", showDeleted: "true" });

  if (opts.syncToken) {
    params.set("syncToken", opts.syncToken);
  } else {
    // Primera sincronización: solo de hoy en adelante y ya expandido.
    params.set("timeMin", new Date().toISOString());
    params.set("singleEvents", "true");
    params.set("orderBy", "startTime");
  }
  if (opts.pageToken) params.set("pageToken", opts.pageToken);

  const res = await fetch(`${API}/calendars/${encodeURIComponent(calendarId)}/events?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 410) throw new SyncTokenExpired();
  if (!res.ok) {
    throw new Error(`Google Calendar respondió ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as EventsPage;
  return { items: data.items || [], nextPageToken: data.nextPageToken, nextSyncToken: data.nextSyncToken };
}

/** Recorre todas las páginas y devuelve los eventos junto al syncToken final. */
export async function listAllEvents(
  calendarId: string,
  syncToken?: string
): Promise<{ events: GoogleEvent[]; syncToken: string | null }> {
  const events: GoogleEvent[] = [];
  let pageToken: string | undefined;
  let finalSyncToken: string | null = null;

  do {
    const page: EventsPage = await listEvents(calendarId, { syncToken, pageToken });
    events.push(...page.items);
    pageToken = page.nextPageToken;
    if (page.nextSyncToken) finalSyncToken = page.nextSyncToken;
  } while (pageToken);

  return { events, syncToken: finalSyncToken };
}
