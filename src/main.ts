/* ============================================================
   VALEUM — APP LOGIC (bootstrap)
   ============================================================ */
import "./styles.css";
import { $$ } from "./modules/dom";
import { applyLang } from "./modules/i18n";
import { initUI } from "./modules/ui";
import { renderForm } from "./modules/form";
import { renderCalendar } from "./modules/calendar";

/** Todo lo que debe repintarse al cambiar de idioma. */
function rerenderDynamic(): void {
  renderForm();
  renderCalendar();
}

function init(): void {
  initUI();

  $$<HTMLButtonElement>(".lang button").forEach((b) =>
    b.addEventListener("click", () => applyLang(b.dataset.lang || "es", rerenderDynamic))
  );

  renderForm();
  applyLang("es", rerenderDynamic);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
