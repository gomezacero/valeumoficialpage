/* ============================================================
   VALEUM — PLANTILLAS DE CORREO
   Internas: siempre en español, sin importar el idioma del lead.
   ============================================================ */
import { LABELS, type Budget, type Owner, type Service, type Stage } from "./scoring.js";

const ACCENT = "#FF4D00";
const INK = "#14140F";
const MUTED = "#6B6B66";
const LINE = "#E9E7E1";

export interface LeadData {
  service: Service;
  stage: Stage;
  budget: Budget;
  business: string;
  name: string;
  email: string;
  company: string;
  country: string;
  score: number;
  matched: boolean;
  owner: Owner;
  calendarUrl: string;
  lang: string;
}

function esc(s: unknown): string {
  return String(s ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string
  );
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid ${LINE};color:${MUTED};font-size:13px;width:180px;vertical-align:top">${esc(label)}</td>
    <td style="padding:10px 0;border-bottom:1px solid ${LINE};color:${INK};font-size:15px;font-weight:500">${esc(value)}</td>
  </tr>`;
}

function shell(title: string, badge: string, badgeColor: string, body: string): string {
  return `<!doctype html><html lang="es"><body style="margin:0;padding:24px;background:#FAF9F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
  <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid ${LINE};border-radius:20px;overflow:hidden">
    <div style="padding:24px 32px;border-bottom:1px solid ${LINE}">
      <span style="display:inline-block;padding:5px 12px;border-radius:999px;background:${badgeColor};color:#fff;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase">${esc(badge)}</span>
      <h1 style="margin:14px 0 0;font-size:24px;line-height:1.2;color:${INK};letter-spacing:-.02em">${esc(title)}</h1>
    </div>
    <div style="padding:24px 32px">${body}</div>
    <div style="padding:16px 32px;border-top:1px solid ${LINE};color:${MUTED};font-size:12px">
      Enviado automáticamente por valeum.com · Los datos completos están en Supabase, schema <code>valeum_web</code>.
    </div>
  </div>
</body></html>`;
}

/** Correo que se dispara al recibir un lead del formulario. */
export function leadEmail(lead: LeadData): { subject: string; html: string; text: string } {
  const who = LABELS.owner[lead.owner];
  const subject = lead.matched
    ? `🔥 Lead calificado (${lead.score}/7): ${lead.name}${lead.company ? " · " + lead.company : ""}`
    : `📋 Lead recibido (${lead.score}/7): ${lead.name}${lead.company ? " · " + lead.company : ""}`;

  const intro = lead.matched
    ? `Este lead superó el filtro y ya tiene la agenda desbloqueada apuntando a tu calendario, ${who}.`
    : `Este lead no superó el umbral, así que no vio la agenda. Se le indicó que le escribiremos. Revísalo por si vale la pena contactarlo igual.`;

  const body = `
    <p style="margin:0 0 20px;color:${MUTED};font-size:15px;line-height:1.6">${esc(intro)}</p>
    <table style="width:100%;border-collapse:collapse">
      ${row("Nombre", lead.name)}
      ${row("Email", lead.email)}
      ${row("Empresa", lead.company || "—")}
      ${row("País", lead.country)}
      ${row("Qué busca", LABELS.service[lead.service])}
      ${row("Etapa", LABELS.stage[lead.stage])}
      ${row("Facturación mensual", LABELS.budget[lead.budget])}
      ${row("Puntaje", `${lead.score} de 7 · ${lead.matched ? "califica" : "no califica"}`)}
      ${row("Asignado a", who)}
      ${row("Idioma", lead.lang.toUpperCase())}
    </table>
    <div style="margin-top:24px;padding:18px;background:#FAF9F6;border-radius:14px">
      <div style="color:${MUTED};font-size:12px;text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px">Su negocio y su principal dolor</div>
      <div style="color:${INK};font-size:15px;line-height:1.6;white-space:pre-wrap">${esc(lead.business)}</div>
    </div>
    <div style="margin-top:24px">
      <a href="mailto:${esc(lead.email)}" style="display:inline-block;padding:13px 26px;background:${ACCENT};color:#fff;border-radius:999px;font-weight:600;font-size:15px;text-decoration:none">Responder a ${esc(lead.name)}</a>
    </div>`;

  const text = [
    intro,
    "",
    `Nombre: ${lead.name}`,
    `Email: ${lead.email}`,
    `Empresa: ${lead.company || "—"}`,
    `País: ${lead.country}`,
    `Qué busca: ${LABELS.service[lead.service]}`,
    `Etapa: ${LABELS.stage[lead.stage]}`,
    `Facturación mensual: ${LABELS.budget[lead.budget]}`,
    `Puntaje: ${lead.score}/7 (${lead.matched ? "califica" : "no califica"})`,
    `Asignado a: ${who}`,
    "",
    "Su negocio y su principal dolor:",
    lead.business,
  ].join("\n");

  return {
    subject,
    text,
    html: shell(
      lead.matched ? "Nuevo lead calificado" : "Nuevo lead (no calificado)",
      lead.matched ? "Califica" : "Sin filtro",
      lead.matched ? ACCENT : MUTED,
      body
    ),
  };
}

export interface BookingData {
  attendeeName: string;
  attendeeEmail: string;
  startsAt: string;
  owner: Owner;
  lead: LeadData | null;
}

/** Correo que se dispara cuando la reserva aparece en Google Calendar. */
export function bookingEmail(b: BookingData): { subject: string; html: string; text: string } {
  const who = LABELS.owner[b.owner];
  const when = formatWhen(b.startsAt);
  const name = b.lead?.name || b.attendeeName || b.attendeeEmail || "Alguien";
  const subject = `📅 Nueva reunión agendada con ${who}: ${name} · ${when}`;

  const detail = b.lead
    ? `<table style="width:100%;border-collapse:collapse">
        ${row("Nombre", b.lead.name)}
        ${row("Email", b.lead.email)}
        ${row("Empresa", b.lead.company || "—")}
        ${row("País", b.lead.country)}
        ${row("Qué busca", LABELS.service[b.lead.service])}
        ${row("Etapa", LABELS.stage[b.lead.stage])}
        ${row("Facturación mensual", LABELS.budget[b.lead.budget])}
        ${row("Puntaje", `${b.lead.score} de 7`)}
      </table>
      <div style="margin-top:24px;padding:18px;background:#FAF9F6;border-radius:14px">
        <div style="color:${MUTED};font-size:12px;text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px">Su negocio y su principal dolor</div>
        <div style="color:${INK};font-size:15px;line-height:1.6;white-space:pre-wrap">${esc(b.lead.business)}</div>
      </div>`
    : `<table style="width:100%;border-collapse:collapse">
        ${row("Nombre en la reserva", b.attendeeName || "—")}
        ${row("Email en la reserva", b.attendeeEmail || "—")}
      </table>
      <p style="margin:20px 0 0;padding:16px;background:#FFF6F2;border-left:3px solid ${ACCENT};border-radius:8px;color:${INK};font-size:14px;line-height:1.6">
        No encontramos un formulario asociado a este correo. Es probable que la persona haya reservado
        con un email distinto al que usó en la web, así que no tenemos sus respuestas.
      </p>`;

  const body = `
    <p style="margin:0 0 20px;color:${MUTED};font-size:15px;line-height:1.6">
      ${esc(name)} reservó una llamada contigo, ${esc(who)}. <strong style="color:${INK}">${esc(when)}</strong>
    </p>
    ${detail}`;

  const text = [
    `${name} reservó una llamada con ${who}.`,
    `Cuándo: ${when}`,
    "",
    b.lead
      ? [
          `Nombre: ${b.lead.name}`,
          `Email: ${b.lead.email}`,
          `Empresa: ${b.lead.company || "—"}`,
          `País: ${b.lead.country}`,
          `Qué busca: ${LABELS.service[b.lead.service]}`,
          `Etapa: ${LABELS.stage[b.lead.stage]}`,
          `Facturación mensual: ${LABELS.budget[b.lead.budget]}`,
          `Puntaje: ${b.lead.score}/7`,
          "",
          "Su negocio y su principal dolor:",
          b.lead.business,
        ].join("\n")
      : `Reserva sin lead asociado (email distinto al del formulario).\nNombre: ${b.attendeeName || "—"}\nEmail: ${b.attendeeEmail || "—"}`,
  ].join("\n");

  return {
    subject,
    text,
    html: shell("Nueva reunión agendada", b.lead ? "Agendado" : "Sin lead asociado", b.lead ? ACCENT : MUTED, body),
  };
}

function formatWhen(iso: string): string {
  if (!iso) return "fecha por confirmar";
  try {
    return new Intl.DateTimeFormat("es-CO", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "America/Bogota",
    }).format(new Date(iso)) + " (hora Colombia)";
  } catch {
    return iso;
  }
}

export interface ContactData {
  name: string;
  email: string;
  whatsapp: string;
  source: string;
  page: string;
}

/** Correo para los formularios simples de contacto (marca personal). */
export function contactEmail(c: ContactData): { subject: string; html: string; text: string } {
  const subject = `💬 Nuevo contacto desde ${c.source}: ${c.name}`;
  const waLink = c.whatsapp ? "https://wa.me/" + c.whatsapp.replace(/[^0-9]/g, "") : "";

  const body = `
    <p style="margin:0 0 20px;color:${MUTED};font-size:15px;line-height:1.6">
      ${esc(c.name)} dejó sus datos en ${esc(c.source)}, desde
      <a href="${esc(c.page)}" style="color:${ACCENT}">${esc(c.page)}</a>.
    </p>
    <table style="width:100%;border-collapse:collapse">
      ${row("Nombre", c.name)}
      ${row("Email", c.email)}
      ${row("WhatsApp", c.whatsapp || "—")}
    </table>
    <div style="margin-top:24px">
      ${
        waLink
          ? `<a href="${esc(waLink)}" style="display:inline-block;padding:13px 26px;background:#25D366;color:#fff;border-radius:999px;font-weight:600;font-size:15px;text-decoration:none;margin-right:10px">Abrir WhatsApp</a>`
          : ""
      }
      <a href="mailto:${esc(c.email)}" style="display:inline-block;padding:13px 26px;background:${ACCENT};color:#fff;border-radius:999px;font-weight:600;font-size:15px;text-decoration:none">Responder por correo</a>
    </div>`;

  const text = [
    `${c.name} dejó sus datos en ${c.source}.`,
    "",
    `Nombre: ${c.name}`,
    `Email: ${c.email}`,
    `WhatsApp: ${c.whatsapp || "—"}`,
    waLink ? `Escribirle: ${waLink}` : "",
    `Página: ${c.page}`,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, text, html: shell("Nuevo contacto", "Marca personal", ACCENT, body) };
}
