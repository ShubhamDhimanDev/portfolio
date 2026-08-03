export type TechCategory = "Frontend" | "Backend" | "Database" | "Cloud" | "Tools";

export interface TechItem {
  name: string;
  category: TechCategory;
  level: "Advanced" | "Proficient" | "Familiar";
}
