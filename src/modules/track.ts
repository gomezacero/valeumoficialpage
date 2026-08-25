/* ============================================================
   VALEUM — MEDICIÓN DEL EMBUDO
   Registra hasta qué paso del formulario llega cada visitante.
   Sin cookies ni datos personales: solo un identificador aleatorio
   que vive en esta pestaña y muere al cerrarla.
   ============================================================ */

const ENDPOINT = "/api/track";
const KEY = "valeum_sid";

function sessionId(): string {
  try {
    let id = sessionStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    // Navegación privada o almacenamiento bloqueado: id efímero.
    return crypto.randomUUID();
  }
}

let maxReported = -1;

/**
 * Registra el paso alcanzado. 0 = vio el formulario, 1-5 = pasos, 6 = enviado.
 * Solo informa cuando se supera el máximo anterior, así que una visita
 * genera como mucho siete peticiones minúsculas.
 */
export function trackStep(step: number, lang: string): void {
  if (step <= maxReported) return;
  maxReported = step;

  const payload = JSON.stringify({
    session: sessionId(),
    step,
    lang,
    referrer: document.referrer || "",
  });

  try {
    // sendBeacon sobrevive a que el visitante cierre la pestaña.
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([payload], { type: "application/json" }));
      return;
    }
  } catch {
    // cae al fetch de abajo
  }

  fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {
    // La medición jamás debe estorbar al visitante.
  });
}

/** Marca "vio el formulario" la primera vez que la sección entra en pantalla. */
export function trackFormVisible(lang: () => string): void {
  const section = document.querySelector("#agenda");
  if (!section) return;

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          trackStep(0, lang());
          io.disconnect();
        }
      }
    },
    { threshold: 0.25 }
  );
  io.observe(section);
}
