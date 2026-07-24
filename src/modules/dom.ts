/* ============================================================
   VALEUM — HELPERS DOM
   ============================================================ */

export const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const isTouch = window.matchMedia("(pointer: coarse)").matches;

export function $<T extends Element = HTMLElement>(sel: string, ctx?: ParentNode): T | null {
  return (ctx || document).querySelector<T>(sel);
}

export function $$<T extends Element = HTMLElement>(sel: string, ctx?: ParentNode): T[] {
  return Array.from((ctx || document).querySelectorAll<T>(sel));
}

/** Escapa texto antes de interpolarlo en innerHTML. */
export function esc(s: unknown): string {
  return String(s).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string
  );
}
