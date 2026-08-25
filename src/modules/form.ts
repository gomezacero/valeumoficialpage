/* ============================================================
   VALEUM — FORMULARIO-FILTRO MULTI-PASO + AGENDA GATED
   El scoring y la asignación de calendario ocurren EN EL SERVIDOR
   (/api/lead). Aquí solo se recogen las respuestas y se pinta el
   resultado que devuelve el backend.
   ============================================================ */
import { $, $$, esc } from "./dom";
import { getLang, t } from "./i18n";
import { FALLBACK_CAL_URLS, unlockCalendar } from "./calendar";
import { trackStep } from "./track";

const LEAD_ENDPOINT = "/api/lead";

type Field = "biz" | "name" | "email" | "company" | "country";

interface FormState {
  step: number;
  service: string | null; // performance | consulting | product | unsure
  stage: string | null; // idea | operating | scaling
  budget: string | null; // b1 | b2 | b3 | b4
  biz: string;
  name: string;
  email: string;
  company: string;
  country: string;
  matched: boolean | null;
  submitted: boolean;
  sending: boolean;
}

const state: FormState = {
  step: 1,
  service: null,
  stage: null,
  budget: null,
  biz: "",
  name: "",
  email: "",
  company: "",
  country: "",
  matched: null,
  submitted: false,
  sending: false,
};

/** Antispam: momento en que se cargó el formulario. */
const loadedAt = Date.now();
let backAnim = false;

function optBtn(field: "service" | "stage" | "budget", value: string, label: string): string {
  const sel = state[field] === value ? " sel" : "";
  return (
    '<button type="button" class="opt' +
    sel +
    '" data-field="' +
    field +
    '" data-value="' +
    value +
    '" role="radio" aria-checked="' +
    (state[field] === value) +
    '">' +
    '<span class="radio" aria-hidden="true"></span><span>' +
    esc(label) +
    "</span></button>"
  );
}

function fieldHtml(f: Field, label: string, ph: string, type: string): string {
  const autocomplete =
    f === "email" ? "email" : f === "name" ? "name" : f === "company" ? "organization" : "country-name";
  return (
    '<div class="field"><label for="f_' +
    f +
    '">' +
    esc(label) +
    "</label>" +
    '<input id="f_' +
    f +
    '" data-f="' +
    f +
    '" type="' +
    type +
    '" placeholder="' +
    esc(ph) +
    '" value="' +
    esc(state[f]) +
    '" autocomplete="' +
    autocomplete +
    '">' +
    '<span class="fmsg">' +
    esc(t("form.err.req")) +
    "</span></div>"
  );
}

export function renderForm(): void {
  const filterBody = $("#filterBody");
  const stepLabel = $("#stepLabel");
  const progressFill = $("#progressFill");
  const progressBar = $("#progressBar");
  if (!filterBody || !stepLabel || !progressFill || !progressBar) return;

  if (state.submitted) {
    renderResult();
    return;
  }

  const s = state.step;
  // Solo a partir del paso 2: llegar al 1 es simplemente cargar la página,
  // no significa que el visitante haya respondido nada.
  if (s > 1) trackStep(s, getLang());
  stepLabel.textContent = t("form.step").replace("{n}", String(s));
  progressBar.setAttribute("aria-valuenow", String(s));
  progressFill.style.width = (s / 5) * 100 + "%";
  let html = '<div class="fstep on' + (backAnim ? " back-anim" : "") + '" role="radiogroup">';

  if (s === 1) {
    html +=
      '<h3 class="fq">' +
      esc(t("form.q1")) +
      '</h3><div class="opts">' +
      optBtn("service", "performance", t("form.q1o1")) +
      optBtn("service", "consulting", t("form.q1o2")) +
      optBtn("service", "product", t("form.q1o3")) +
      optBtn("service", "unsure", t("form.q1o4")) +
      "</div>";
  } else if (s === 2) {
    html +=
      '<h3 class="fq">' +
      esc(t("form.q2")) +
      '</h3><div class="opts">' +
      optBtn("stage", "idea", t("form.q2o1")) +
      optBtn("stage", "operating", t("form.q2o2")) +
      optBtn("stage", "scaling", t("form.q2o3")) +
      "</div>";
  } else if (s === 3) {
    html +=
      '<h3 class="fq">' +
      esc(t("form.q3")) +
      '</h3><div class="opts">' +
      optBtn("budget", "b1", t("form.q3o1")) +
      optBtn("budget", "b2", t("form.q3o2")) +
      optBtn("budget", "b3", t("form.q3o3")) +
      optBtn("budget", "b4", t("form.q3o4")) +
      "</div>";
  } else if (s === 4) {
    html +=
      '<h3 class="fq">' +
      esc(t("form.q4")) +
      "</h3>" +
      '<div class="fields one"><div class="field">' +
      '<textarea id="f_biz" data-f="biz" rows="4" placeholder="' +
      esc(t("form.ph.biz")) +
      '">' +
      esc(state.biz) +
      "</textarea>" +
      '<span class="fmsg">' +
      esc(t("form.err.req")) +
      "</span>" +
      "</div></div>";
  } else {
    html +=
      '<h3 class="fq">' +
      esc(t("form.q5")) +
      "</h3>" +
      '<div class="fields">' +
      fieldHtml("name", t("form.f.name"), t("form.ph.name"), "text") +
      fieldHtml("email", t("form.f.email"), t("form.ph.email"), "email") +
      fieldHtml("company", t("form.f.company"), t("form.ph.company"), "text") +
      fieldHtml("country", t("form.f.country"), t("form.ph.country"), "text") +
      "</div>" +
      // Honeypot antispam: invisible para personas, irresistible para bots.
      '<input id="f_website" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" ' +
      'style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">';
  }

  html += '<div class="fnav">';
  if (s > 1) html += '<button type="button" class="btn btn-ghost" id="btnBack">' + esc(t("form.back")) + "</button>";
  if (s === 4) html += '<button type="button" class="btn btn-primary" id="btnNext">' + esc(t("form.next")) + "</button>";
  if (s === 5)
    html +=
      '<button type="button" class="btn btn-primary" id="btnSubmit"' +
      (state.sending ? " disabled" : "") +
      ">" +
      esc(state.sending ? t("form.sending") : t("form.submit")) +
      "</button>";
  html += "</div></div>";

  filterBody.innerHTML = html;
  backAnim = false;

  $$(".opt", filterBody).forEach((btn) => {
    btn.addEventListener("click", () => {
      const field = btn.dataset.field as "service" | "stage" | "budget";
      state[field] = btn.dataset.value || null;
      $$(".opt", filterBody).forEach((o) => {
        o.classList.remove("sel");
        o.setAttribute("aria-checked", "false");
      });
      btn.classList.add("sel");
      btn.setAttribute("aria-checked", "true");
      setTimeout(() => {
        state.step = Math.min(5, state.step + 1);
        renderForm();
      }, 320);
    });
  });

  $("#btnBack")?.addEventListener("click", () => {
    state.step = Math.max(1, state.step - 1);
    backAnim = true;
    renderForm();
  });

  $("#btnNext")?.addEventListener("click", () => {
    const ta = $<HTMLTextAreaElement>("#f_biz");
    if (!state.biz.trim()) {
      ta?.classList.add("err");
      ta?.closest(".field")?.classList.add("show-err");
      return;
    }
    state.step = 5;
    renderForm();
  });

  $("#btnSubmit")?.addEventListener("click", onSubmit);

  $$<HTMLInputElement | HTMLTextAreaElement>("input,textarea", filterBody).forEach((inp) => {
    inp.addEventListener("input", () => {
      const f = inp.dataset.f as Field | undefined;
      if (!f) return; // el honeypot no tiene data-f
      state[f] = inp.value;
      inp.classList.remove("err");
      inp.closest(".field")?.classList.remove("show-err");
    });
  });
}

async function onSubmit(): Promise<void> {
  if (state.sending) return;

  let ok = true;
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  (["name", "email", "country"] as const).forEach((f) => {
    const inp = $<HTMLInputElement>("#f_" + f);
    const val = state[f].trim();
    let err = "";
    if (!val) err = t("form.err.req");
    else if (f === "email" && !emailRe.test(val)) err = t("form.err.email");
    if (err && inp) {
      ok = false;
      inp.classList.add("err");
      const fld = inp.closest(".field");
      fld?.classList.add("show-err");
      const msg = fld ? $(".fmsg", fld) : null;
      if (msg) msg.textContent = err;
    }
  });
  if (!ok) return;

  // Estado de carga: el veredicto lo da el servidor.
  state.sending = true;
  renderForm();

  const payload = {
    service: state.service,
    stage: state.stage,
    budget: state.budget,
    business: state.biz.trim(),
    name: state.name.trim(),
    email: state.email.trim(),
    company: state.company.trim(),
    country: state.country.trim(),
    lang: getLang(),
    source: "valeum-landing",
    website: $<HTMLInputElement>("#f_website")?.value || "", // honeypot
    elapsedMs: Date.now() - loadedAt,
  };

  let matched = false;
  let calendarUrl = "";

  try {
    const res = await fetch(LEAD_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("lead endpoint " + res.status);
    const data = (await res.json()) as { matched?: boolean; calendarUrl?: string };
    matched = Boolean(data.matched);
    calendarUrl = data.calendarUrl || "";
  } catch (err) {
    // Degradación controlada: si el backend no responde, no perdemos al lead.
    // Se abre la agenda igualmente y el envío queda registrado en consola.
    console.error("[valeum] fallo al enviar el lead:", err);
    matched = true;
    calendarUrl = FALLBACK_CAL_URLS[Math.floor(Math.random() * FALLBACK_CAL_URLS.length)];
  }

  trackStep(6, getLang());

  state.sending = false;
  state.matched = matched;
  state.submitted = true;
  renderResult();
  if (matched) unlockCalendar(calendarUrl);
}

function renderResult(): void {
  const filterBody = $("#filterBody");
  const stepLabel = $("#stepLabel");
  const progressFill = $("#progressFill");
  if (!filterBody || !stepLabel || !progressFill) return;

  stepLabel.textContent = t("form.step").replace("{n}", "5");
  progressFill.style.width = "100%";
  const okIcon =
    '<svg width="30" height="30" viewBox="0 0 30 30" fill="none"><path d="M6 15.5 12.5 22 24 8.5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const mailIcon =
    '<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="3.5" y="6" width="21" height="16" rx="3" stroke="currentColor" stroke-width="2"/><path d="m5 8.5 9 7 9-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  filterBody.innerHTML =
    '<div class="fstep on"><div class="fresult">' +
    '<div class="ficon">' +
    (state.matched ? okIcon : mailIcon) +
    "</div>" +
    "<h3>" +
    esc(state.matched ? t("match.t") : t("nomatch.t")) +
    "</h3>" +
    "<p>" +
    esc(state.matched ? t("match.d") : t("nomatch.d")) +
    "</p>" +
    "</div></div>";
}
