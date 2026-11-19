import { queryOptions } from "@tanstack/react-query";
import initialProductsData from "@/data/products.json";
import { DEFAULT_CATEGORIES } from "@/data/categories";

import acalanto from "@/assets/acalanto-lunar.jpg";
import purificacao from "@/assets/purificacao-eterica.jpg";
import fartura from "@/assets/fartura-realizacao.jpg";
import lavanda from "@/assets/escalda-lavanda.jpg";
import cafe from "@/assets/escalda-cafe.jpg";
import brisa from "@/assets/brisa-lunar.jpg";

export const IMAGES: Record<string, string> = {
  "acalanto-lunar": acalanto,
  "purificacao-eterica": purificacao,
  "fartura-realizacao": fartura,
  "escalda-lavanda": lavanda,
  "escalda-cafe": cafe,
  "brisa-lunar": brisa,
};

export const CATEGORIES = DEFAULT_CATEGORIES;

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
  image_url?: string | null;
  stock_quantity: number;
  weight_grams: number;
  package_width_cm: number;
  package_height_cm: number;
  package_depth_cm: number;
  is_active: boolean;
};

const PRODUCTS_STORAGE_KEY = "sunshine_moon_catalog_products";
const CATEGORIES_STORAGE_KEY = "sunshine_moon_catalog_categories";

export function getStoredCategories() {
  if (typeof window === "undefined") return DEFAULT_CATEGORIES;
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_CATEGORIES;
}

export function saveStoredCategories(categories: typeof DEFAULT_CATEGORIES) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  } catch {}
}

export function getStoredProducts(): Product[] {
  let list: any[] = initialProductsData;
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (raw) {
        list = JSON.parse(raw);
      }
    } catch {}
  }

  return list.map((p) => ({
    ...p,
    price: Number(p.price),
    package_width_cm: Number(p.package_width_cm || 10),
    package_height_cm: Number(p.package_height_cm || 10),
    package_depth_cm: Number(p.package_depth_cm || 5),
    weight_grams: Number(p.weight_grams || 100),
    stock_quantity: Number(p.stock_quantity ?? 10),
    is_active: p.is_active !== false,
    image: p.image_url || IMAGES[p.slug] || acalanto,
  }));
}

export function saveStoredProducts(products: Product[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  } catch {}
}

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async (): Promise<Product[]> => {
    const all = getStoredProducts();
    return all.filter((p) => p.is_active);
  },
});
