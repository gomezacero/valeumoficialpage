/* ============================================================
   VALEUM — BLOQUE DE AGENDA (Google Calendar)
   La URL del calendario la decide SIEMPRE el servidor (/api/lead)
   según el servicio solicitado. Aquí solo se pinta lo recibido.
   ============================================================ */
import { $, esc, reduceMotion } from "./dom";
import { t } from "./i18n";

/** Opcional: URL de embed oficial (?gv=true) para incrustar en vez de abrir pestaña. */
const BOOKING_EMBED = "";

/**
 * URLs públicas de respaldo. Solo se usan si /api/lead no responde,
 * para no perder la conversión con el usuario ya calificado.
 * En el camino normal esta constante nunca se lee.
 */
export const FALLBACK_CAL_URLS = [
  "https://calendar.app.google/YNJaF7Yd7AWsBsDUA",
  "https://calendar.app.google/eB3x76egVCsjz4YR6",
];

let calUrl = "";

export function getCalUrl(): string {
  return calUrl;
}

/** Repinta el bloque de agenda (se invoca también al cambiar de idioma). */
export function renderCalendar(): void {
  const cal = $("#cal");
  const calBody = $("#calBody");
  if (!cal || !calBody || !cal.classList.contains("unlocked")) return;

  if (BOOKING_EMBED) {
    calBody.innerHTML =
      '<div class="cal-embed"><iframe src="' +
      esc(BOOKING_EMBED) +
      '" title="Agenda Valeum" loading="lazy"></iframe></div>';
    return;
  }

  calBody.innerHTML =
    '<div class="cal-hero">' +
    '<span class="cal-badge"><i aria-hidden="true"></i>' +
    esc(t("cal.badge")) +
    "</span>" +
    '<h3 class="cal-h">' +
    esc(t("cal.h")) +
    "</h3>" +
    '<p class="cal-d">' +
    esc(t("cal.d")) +
    "</p>" +
    '<a class="btn btn-primary btn-xl magnetic" href="' +
    esc(calUrl || FALLBACK_CAL_URLS[0]) +
    '" target="_blank" rel="noopener">' +
    esc(t("cal.open")) +
    '<svg class="btn-arrow" width="17" height="17" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 8h11M9 3.5 13.5 8 9 12.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
    "</a>" +
    '<span class="cal-hint">' +
    esc(t("cal.hint")) +
    "</span>" +
    "</div>";
}

/** Desbloquea la agenda con la URL que asignó el servidor y hace scroll hacia ella. */
export function unlockCalendar(url: string): void {
  const cal = $("#cal");
  if (!cal) return;
  calUrl = url;
  cal.classList.add("unlocked");
  cal.setAttribute("aria-hidden", "false");
  renderCalendar();
  setTimeout(() => {
    cal.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  }, 450);
}
