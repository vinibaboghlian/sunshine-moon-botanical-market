export const SHIPPING_OPTIONS = [
  { id: "PAC", label: "PAC", price: 18.9, eta: "6 a 10 dias úteis" },
  { id: "SEDEX", label: "Sedex", price: 29.9, eta: "2 a 4 dias úteis" },
] as const;
export type ShippingId = (typeof SHIPPING_OPTIONS)[number]["id"];

export const onlyDigits = (v: string) => v.replace(/\D/g, "");

export const maskCep = (v: string) => {
  const d = onlyDigits(v).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
};
export const maskPhone = (v: string) => {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};
export const maskCpf = (v: string) => {
  const d = onlyDigits(v).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
};

export function isValidCpf(value: string): boolean {
  const d = onlyDigits(value);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const calc = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(d[i]) * (len + 1 - i);
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return calc(9) === Number(d[9]) && calc(10) === Number(d[10]);
}

export const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const shippingPrice = (id: ShippingId) =>
  SHIPPING_OPTIONS.find((o) => o.id === id)!.price;

export const round2 = (n: number) => Math.round(n * 100) / 100;

export function computeTotals(items: { price: number; quantity: number }[], shipping: ShippingId) {
  const subtotal = round2(items.reduce((s, i) => s + i.price * i.quantity, 0));
  const shipping_cost = shippingPrice(shipping);
  return { subtotal, shipping_cost, total: round2(subtotal + shipping_cost) };
}

export type PackageCubing = {
  total_weight_grams: number;
  width_cm: number;
  height_cm: number;
  depth_cm: number;
  total_volume_cm3: number;
};

/**
 * Agrega dimensões e peso dos itens do carrinho para despacho e cotação no Melhor Envio.
 */
export function calculatePackageCubing(
  items: Array<{
    quantity: number;
    weight_grams?: number;
    package_width_cm?: number;
    package_height_cm?: number;
    package_depth_cm?: number;
  }>,
): PackageCubing {
  let total_weight_grams = 0;
  let total_volume_cm3 = 0;
  let max_width = 11; // Mínimos dos Correios/Melhor Envio
  let max_depth = 16;
  let accumulated_height = 0;

  for (const item of items) {
    const qty = item.quantity || 1;
    const weight = (item.weight_grams ?? 150) * qty;
    const w = item.package_width_cm ?? 11;
    const h = item.package_height_cm ?? 5;
    const d = item.package_depth_cm ?? 16;

    total_weight_grams += weight;
    total_volume_cm3 += w * h * d * qty;

    if (w > max_width) max_width = w;
    if (d > max_depth) max_depth = d;
    accumulated_height += h * qty;
  }

  // Limite razoável para dimensões empacotadas
  const height_cm = Math.max(2, Math.min(accumulated_height, 100));
  const width_cm = Math.max(11, max_width);
  const depth_cm = Math.max(16, max_depth);

  return {
    total_weight_grams,
    width_cm,
    height_cm,
    depth_cm,
    total_volume_cm3,
  };
}
