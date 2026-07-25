/* ============================================================
   VALEUM — SCORING Y ASIGNACIÓN DE CALENDARIO
   Vive en el servidor a propósito: el navegador no debe poder
   alterar ni el puntaje ni a quién le llega el lead.
   ============================================================ */

export type Service = "performance" | "consulting" | "product" | "unsure";
export type Stage = "idea" | "operating" | "scaling";
export type Budget = "b1" | "b2" | "b3" | "b4";
export type Owner = "jesus" | "harry";

export const SERVICES: readonly Service[] = ["performance", "consulting", "product", "unsure"];
export const STAGES: readonly Stage[] = ["idea", "operating", "scaling"];
export const BUDGETS: readonly Budget[] = ["b1", "b2", "b3", "b4"];

/** Pesos originales del formulario-filtro. */
const SCORE = {
  service: { performance: 2, consulting: 2, product: 2, unsure: 0 },
  stage: { idea: 0, operating: 1, scaling: 2 },
  budget: { b1: 0, b2: 1, b3: 2, b4: 3 },
} as const;

/** A partir de este puntaje se desbloquea la agenda. */
export const MATCH_THRESHOLD = 3;

export function computeScore(service: Service, stage: Stage, budget: Budget): number {
  return SCORE.service[service] + SCORE.stage[stage] + SCORE.budget[budget];
}

export function isMatch(score: number): boolean {
  return score >= MATCH_THRESHOLD;
}

/**
 * Reparto por tipo de servicio:
 *   Jesús → consultoría y marketing performance
 *   Harry → software a medida y quienes aún no lo tienen claro
 */
export function assignOwner(service: Service): Owner {
  return service === "consulting" || service === "performance" ? "jesus" : "harry";
}

/** Etiquetas legibles para los correos (siempre en español, son internos). */
export const LABELS = {
  service: {
    performance: "Marketing performance",
    consulting: "Consultoría",
    product: "Producto o tecnología a medida",
    unsure: "Aún no está seguro",
  },
  stage: { idea: "Idea", operating: "En operación", scaling: "Escalando" },
  budget: {
    b1: "Menos de $1,000 USD/mes",
    b2: "$1,000 – $5,000 USD/mes",
    b3: "$5,000 – $15,000 USD/mes",
    b4: "Más de $15,000 USD/mes",
  },
  owner: { jesus: "Jesús", harry: "Harry" },
} as const;
