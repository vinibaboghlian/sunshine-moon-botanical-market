import { queryOptions } from "@tanstack/react-query";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import initialProductsData from "@/data/products.json";
import { DEFAULT_CATEGORIES, type CategoryItem } from "@/data/categories";
import { db } from "@/lib/firebase";

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
  unit?: "g" | "ml";
  package_width_cm: number;
  package_height_cm: number;
  package_depth_cm: number;
  is_active: boolean;
};

const PRODUCTS_STORAGE_KEY = "sunshine_moon_catalog_products";
const CATEGORIES_STORAGE_KEY = "sunshine_moon_catalog_categories";

function normalizeProduct(p: Partial<Product> & { id: string; slug?: string; name: string }): Product {
  const slug = p.slug || p.id;
  return {
    id: p.id,
    slug,
    name: p.name,
    category: p.category || "sabonetes",
    price: Number(p.price || 0),
    description: p.description ?? null,
    sensory_notes: p.sensory_notes ?? null,
    benefits: Array.isArray(p.benefits) ? p.benefits : [],
    image_url: p.image_url ?? null,
    image: p.image_url || IMAGES[slug] || acalanto,
    stock_quantity: Number(p.stock_quantity ?? 10),
    weight_grams: Number(p.weight_grams || 100),
    unit: p.unit === "ml" ? "ml" : "g",
    package_width_cm: Number(p.package_width_cm || 10),
    package_height_cm: Number(p.package_height_cm || 10),
    package_depth_cm: Number(p.package_depth_cm || 5),
    is_active: p.is_active !== false,
  };
}

function toFirestoreProduct(p: Product) {
  return {
    id: p.id,
    slug: p.slug || p.id,
    name: p.name,
    category: p.category,
    price: Number(p.price),
    description: p.description ?? null,
    sensory_notes: p.sensory_notes ?? null,
    benefits: Array.isArray(p.benefits) ? p.benefits : [],
    image_url: p.image_url ?? null,
    stock_quantity: Number(p.stock_quantity ?? 0),
    weight_grams: Number(p.weight_grams || 100),
    unit: p.unit || "g",
    package_width_cm: Number(p.package_width_cm || 10),
    package_height_cm: Number(p.package_height_cm || 10),
    package_depth_cm: Number(p.package_depth_cm || 5),
    is_active: p.is_active !== false,
  };
}

export function getStoredCategories(): CategoryItem[] {
  if (typeof window === "undefined") return DEFAULT_CATEGORIES;
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_CATEGORIES;
}

export function saveStoredCategories(categories: CategoryItem[]) {
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

  return list.map(normalizeProduct);
}

export function saveStoredProducts(products: Product[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  } catch {}
}

export async function fetchCatalogProducts(): Promise<Product[]> {
  if (!db) return getStoredProducts();

  try {
    const snap = await getDocs(collection(db, "products"));
    if (snap.empty) {
      return getStoredProducts();
    }
    const list = snap.docs.map((d) => normalizeProduct({ ...(d.data() as Product), id: d.id }));
    saveStoredProducts(list);
    return list;
  } catch (err) {
    console.warn("Falha ao ler produtos do Firestore, usando cache local:", err);
    return getStoredProducts();
  }
}

export async function upsertCatalogProduct(product: Product, allProducts?: Product[]): Promise<void> {
  if (!db) return;

  const snap = await getDocs(collection(db, "products"));
  if (snap.empty && allProducts && allProducts.length > 0) {
    // Seed initial catalog into Firestore on first admin edit so nothing is lost
    const batch = writeBatch(db);
    for (const item of allProducts) {
      batch.set(doc(db, "products", item.id), toFirestoreProduct(item));
    }
    await batch.commit();
    return;
  }

  await setDoc(doc(db, "products", product.id), toFirestoreProduct(product));
}

export async function deleteCatalogProduct(id: string): Promise<void> {
  if (!db) return;
  await deleteDoc(doc(db, "products", id));
}

export async function fetchCatalogCategories(): Promise<CategoryItem[]> {
  if (!db) return getStoredCategories();

  try {
    const snap = await getDocs(collection(db, "categories"));
    if (snap.empty) {
      return getStoredCategories();
    }
    const list = snap.docs.map((d) => d.data() as CategoryItem);
    saveStoredCategories(list);
    return list;
  } catch (err) {
    console.warn("Falha ao ler categorias do Firestore, usando cache local:", err);
    return getStoredCategories();
  }
}

export async function saveCatalogCategories(categories: CategoryItem[]): Promise<void> {
  saveStoredCategories(categories);
  if (!db) return;

  const snap = await getDocs(collection(db, "categories"));
  const batch = writeBatch(db);
  const keepIds = new Set(categories.map((c) => c.id));

  for (const existing of snap.docs) {
    if (!keepIds.has(existing.id)) {
      batch.delete(existing.ref);
    }
  }
  for (const cat of categories) {
    batch.set(doc(db, "categories", cat.id), { id: cat.id, label: cat.label });
  }
  await batch.commit();
}

/**
 * Compresses an uploaded image file to a lightweight WebP/JPEG data URL
 * so it fits comfortably inside a Firestore document (1 MB limit) without needing Firebase Storage.
 */
export function compressImageFile(file: File, maxDimension = 900, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo de imagem."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Arquivo de imagem inválido."));
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const webp = canvas.toDataURL("image/webp", quality);
        resolve(webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async (): Promise<Product[]> => {
    const all = await fetchCatalogProducts();
    return all.filter((p) => p.is_active);
  },
});
