export const CATEGORIES = [
  "Construcción",
  "Tecnología",
  "Salud",
  "Alimentación",
  "Transporte",
  "Educación",
  "Servicios",
  "Equipamiento",
  "Energía",
  "Consultoría",
  "Otros",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const STATUS_LABELS: Record<string, string> = {
  open: "Abierta",
  closed: "Cerrada",
  awarded: "Adjudicada",
  cancelled: "Cancelada",
};