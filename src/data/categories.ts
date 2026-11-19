export type CategoryItem = {
  id: string;
  label: string;
};

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: "todos", label: "Todos" },
  { id: "sabonetes", label: "Sabonetes" },
  { id: "escalda_pes", label: "Escalda-pés" },
  { id: "home_spray", label: "Linha Home" },
  { id: "kits", label: "Kits" },
];
