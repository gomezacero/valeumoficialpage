/* ============================================================
   VALEUM — GET/POST /api/calendar/sync
   Detecta reservas nuevas en los Appointment Schedules de Google,
   las cruza con el lead que llenó el formulario y avisa por correo
   con TODAS sus respuestas (algo que el aviso nativo de Google no trae).

   Idempotente: se apoya en google_event_id (unique) y en el flag
   notified, así que puede ejecutarse cada 15 minutos sin duplicar
   registros ni reenviar correos.
   ============================================================ */
import { timingSafeEqual } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { optionalEnv, ownerConfig, requireEnv } from "../_lib/env";
import { SyncTokenExpired, listAllEvents, type GoogleEvent } from "../_lib/google";
import { sendMail } from "../_lib/mailer";
import type { Budget, Owner, Service, Stage } from "../_lib/scoring";
import { getSupabase, type ValeumClient } from "../_lib/supabase";
import { bookingEmail, type LeadData } from "../_lib/templates";

const OWNERS: Owner[] = ["jesus", "harry"];

/**
 * Patrón opcional del título del evento (variable BOOKING_TITLE_MATCH).
 * Solo se usa para reservas cuyo email NO coincide con ningún lead:
 * sin él, esas reuniones se ignoran para no inundar de avisos con las
 * reuniones internas normales del calendario.
 */
const TITLE_MATCH = optionalEnv("BOOKING_TITLE_MATCH").toLowerCase();

interface SyncSummary {
  owner: Owner;
  events: number;
  bookings: number;
  notified: number;
  fullResync: boolean;
  error?: string;
}

function authorized(req: VercelRequest): boolean {
  const expected = requireEnv("SYNC_SECRET");
  const header = req.headers.authorization?.replace(/^Bearer\s+/i, "") || "";
  const query = typeof req.query.secret === "string" ? req.query.secret : "";
  const provided = header || query;
  if (provided.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (!authorized(req)) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  const supabase = getSupabase();
  const summaries: SyncSummary[] = [];

  for (const owner of OWNERS) {
    try {
      summaries.push(await syncOwner(supabase, owner));
    } catch (err) {
      console.error(`[valeum] fallo sincronizando el calendario de ${owner}:`, err);
      summaries.push({
        owner,
        events: 0,
        bookings: 0,
        notified: 0,
        fullResync: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  res.status(200).json({ ok: summaries.every((s) => !s.error), summaries });
}

async function syncOwner(supabase: ValeumClient, owner: Owner): Promise<SyncSummary> {
  const { calendarId, email: ownerEmail } = ownerConfig(owner);

  const { data: stateRow } = await supabase
    .from("calendar_sync_state")
    .select("sync_token")
    .eq("calendar_owner", owner)
    .maybeSingle();

  let fullResync = false;
  let result: { events: GoogleEvent[]; syncToken: string | null };

  try {
    result = await listAllEvents(calendarId, stateRow?.sync_token || undefined);
  } catch (err) {
    if (!(err instanceof SyncTokenExpired)) throw err;
    // El token caducó: se rehace la sincronización desde cero.
    fullResync = true;
    result = await listAllEvents(calendarId, undefined);
  }

  let bookings = 0;
  let notified = 0;

  for (const event of result.events) {
    const processed = await processEvent(supabase, owner, ownerEmail, event);
    if (processed.stored) bookings++;
    if (processed.notified) notified++;
  }

  if (result.syncToken) {
    await supabase
      .from("calendar_sync_state")
      .upsert(
        { calendar_owner: owner, sync_token: result.syncToken, updated_at: new Date().toISOString() },
        { onConflict: "calendar_owner" }
      );
  }

  return { owner, events: result.events.length, bookings, notified, fullResync };
}

async function processEvent(
  supabase: ValeumClient,
  owner: Owner,
  ownerEmail: string,
  event: GoogleEvent
): Promise<{ stored: boolean; notified: boolean }> {
  if (!event.id) return { stored: false, notified: false };

  const startsAt = event.start?.dateTime || event.start?.date || null;
  const endsAt = event.end?.dateTime || event.end?.date || null;

  // Invitado = asistente que no es el propio dueño del calendario.
  const guest = (event.attendees || []).find(
    (a) => !a.self && a.email && a.email.toLowerCase() !== ownerEmail.toLowerCase()
  );
  const attendeeEmail = guest?.email?.toLowerCase() || "";
  const attendeeName = guest?.displayName || "";

  const lead = attendeeEmail ? await findLead(supabase, attendeeEmail) : null;

  // Sin lead asociado solo seguimos si el título coincide con el patrón
  // configurado; de lo contrario sería una reunión interna cualquiera.
  if (!lead) {
    const summary = (event.summary || "").toLowerCase();
    if (!TITLE_MATCH || !summary.includes(TITLE_MATCH)) return { stored: false, notified: false };
    if (!attendeeEmail) return { stored: false, notified: false };
  }

  const cancelled = event.status === "cancelled";

  const { data: existing } = await supabase
    .from("bookings")
    .select("id, notified")
    .eq("google_event_id", event.id)
    .maybeSingle();

  const { data: saved, error } = await supabase
    .from("bookings")
    .upsert(
      {
        google_event_id: event.id,
        calendar_owner: owner,
        lead_id: lead?.id || null,
        attendee_email: attendeeEmail || null,
        attendee_name: attendeeName || null,
        starts_at: startsAt,
        ends_at: endsAt,
        status: event.status || "confirmed",
        updated_at: new Date().toISOString(),
        raw: event as unknown as Record<string, unknown>,
      },
      { onConflict: "google_event_id" }
    )
    .select("id, notified")
    .single();

  if (error) {
    console.error("[valeum] error guardando la reserva:", error);
    return { stored: false, notified: false };
  }

  // Se avisa una sola vez, y nunca de eventos ya cancelados.
  const alreadyNotified = existing?.notified || saved?.notified;
  if (cancelled || alreadyNotified) return { stored: true, notified: false };

  try {
    const mail = bookingEmail({
      attendeeName,
      attendeeEmail,
      startsAt: startsAt || "",
      owner,
      lead: lead ? toLeadData(lead) : null,
    });
    await sendMail({ to: ownerEmail, replyTo: attendeeEmail || undefined, ...mail });

    await supabase.from("bookings").update({ notified: true }).eq("google_event_id", event.id);

    if (lead) {
      await supabase
        .from("leads")
        .update({ booked: true, booked_at: startsAt || new Date().toISOString() })
        .eq("id", lead.id);
    }
    return { stored: true, notified: true };
  } catch (err) {
    // Si el correo falla dejamos notified=false para reintentar en la próxima corrida.
    console.error("[valeum] reserva guardada pero el correo falló:", err);
    return { stored: true, notified: false };
  }
}

interface LeadRecord {
  id: string;
  service: string;
  stage: string;
  budget: string;
  business: string;
  name: string;
  email: string;
  company: string | null;
  country: string;
  score: number;
  matched: boolean;
  owner: string;
  calendar_url: string;
  lang: string;
}

/** Lead más reciente con ese correo en los últimos 90 días. */
async function findLead(supabase: ValeumClient, email: string): Promise<LeadRecord | null> {
  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from("leads")
    .select("id, service, stage, budget, business, name, email, company, country, score, matched, owner, calendar_url, lang")
    .ilike("email", email)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as LeadRecord | null) || null;
}

function toLeadData(lead: LeadRecord): LeadData {
  return {
    service: lead.service as Service,
    stage: lead.stage as Stage,
    budget: lead.budget as Budget,
    business: lead.business,
    name: lead.name,
    email: lead.email,
    company: lead.company || "",
    country: lead.country,
    score: lead.score,
    matched: lead.matched,
    owner: lead.owner as Owner,
    calendarUrl: lead.calendar_url,
    lang: lead.lang,
  };
}
