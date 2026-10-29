import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import acalanto from "@/assets/acalanto-lunar.jpg";
import purificacao from "@/assets/purificacao-eterica.jpg";
import fartura from "@/assets/fartura-realizacao.jpg";
import lavanda from "@/assets/escalda-lavanda.jpg";
import cafe from "@/assets/escalda-cafe.jpg";
import brisa from "@/assets/brisa-lunar.jpg";

const IMAGES: Record<string, string> = {
  "acalanto-lunar": acalanto,
  "purificacao-eterica": purificacao,
  "fartura-realizacao": fartura,
  "escalda-lavanda": lavanda,
  "escalda-cafe": cafe,
  "brisa-lunar": brisa,
};

export const CATEGORIES = [
  { id: "todos", label: "Todos" },
  { id: "sabonetes", label: "Sabonetes" },
  { id: "escalda_pes", label: "Escalda-pés" },
  { id: "home_spray", label: "Água de lençol" },
  { id: "kits", label: "Kits" },
] as const;

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  description: string | null;
  sensory_notes: string | null;
  benefits: string[];
  image: string;
  stock_quantity: number;
  weight_grams: number;
  package_width_cm: number;
  package_height_cm: number;
  package_depth_cm: number;
};

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at");
    if (error) throw error;
    return (data ?? []).map((p) => ({
      ...p,
      price: Number(p.price),
      package_width_cm: Number(p.package_width_cm),
      package_height_cm: Number(p.package_height_cm),
      package_depth_cm: Number(p.package_depth_cm),
      image: p.image_url || IMAGES[p.slug] || acalanto,
    }));
  },
});
