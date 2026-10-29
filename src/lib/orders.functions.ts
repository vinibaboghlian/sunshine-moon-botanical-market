import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { computeTotals, isValidCpf, SHIPPING_OPTIONS } from "./checkout-rules";

const OrderInput = z.object({
  customer_name: z.string().trim().min(3).max(120),
  customer_email: z.string().trim().email().max(200),
  customer_phone: z.string().regex(/^\d{11}$/),
  customer_cpf: z.string().regex(/^\d{11}$/).refine(isValidCpf, "CPF inválido"),
  postal_code: z.string().regex(/^\d{8}$/),
  street: z.string().trim().min(2).max(200),
  number: z.string().trim().min(1).max(20),
  complement: z.string().trim().max(100).optional().default(""),
  neighborhood: z.string().trim().min(2).max(120),
  city: z.string().trim().min(2).max(120),
  state: z.string().regex(/^[A-Z]{2}$/),
  shipping_method: z.enum(["PAC", "SEDEX"]),
  items: z
    .array(z.object({ product_id: z.string().uuid(), quantity: z.number().int().min(1).max(50) }))
    .min(1)
    .max(30),
  origin: z.string().url(),
});

export type CreatedOrder = {
  order_number: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  shipping_method: string;
  items: { name: string; quantity: number; unit_price: number }[];
  checkout_url: string | null;
};

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => OrderInput.parse(d))
  .handler(async ({ data }): Promise<CreatedOrder> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ids = data.items.map((i) => i.product_id);
    const { data: products, error: pErr } = await supabaseAdmin
      .from("products")
      .select("id,name,price,stock_quantity,is_active")
      .in("id", ids);
    if (pErr) throw new Error("Não foi possível carregar os produtos.");

    const lines = data.items.map((i) => {
      const p = products?.find((x) => x.id === i.product_id);
      if (!p || !p.is_active) throw new Error("Um dos produtos não está mais disponível.");
      if (p.stock_quantity < i.quantity) throw new Error(`Estoque insuficiente para ${p.name}.`);
      return { product_id: p.id, name: p.name, quantity: i.quantity, unit_price: Number(p.price) };
    });
    const totals = computeTotals(
      lines.map((l) => ({ price: l.unit_price, quantity: l.quantity })),
      data.shipping_method,
    );
    const shipLabel = SHIPPING_OPTIONS.find((o) => o.id === data.shipping_method)!.label;
    const order_number = `SM-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

    const { items: _i, origin, ...customer } = data;
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .insert({ ...customer, ...totals, shipping_method: shipLabel, order_number, payment_status: "pendente", status: "novo" })
      .select("id")
      .single();
    if (error || !order) throw new Error("Não foi possível registrar o pedido.");

    const { error: iErr } = await supabaseAdmin.from("order_items").insert(
      lines.map((l) => ({ order_id: order.id, product_id: l.product_id, quantity: l.quantity, unit_price: l.unit_price })),
    );
    if (iErr) throw new Error("Não foi possível registrar os itens do pedido.");

    // Stripe Checkout: active only once STRIPE_SECRET_KEY is configured.
    let checkout_url: string | null = null;
    const key = process.env['STRIPE_SECRET_KEY'];
    if (key) {
      const body = new URLSearchParams();
      body.set("mode", "payment");
      body.set("customer_email", data.customer_email);
      body.set("client_reference_id", order_number);
      body.set("metadata[order_id]", order.id);
      body.set("metadata[order_number]", order_number);
      body.set("metadata[customer_cpf]", data.customer_cpf);
      body.set("metadata[customer_phone]", data.customer_phone);
      body.set("metadata[postal_code]", data.postal_code);
      body.set("success_url", `${origin}/?pedido=${order_number}&status=sucesso`);
      body.set("cancel_url", `${origin}/?pedido=${order_number}&status=cancelado`);
      [...lines, { name: `Frete ${shipLabel}`, quantity: 1, unit_price: totals.shipping_cost }].forEach((l, idx) => {
        body.set(`line_items[${idx}][quantity]`, String(l.quantity));
        body.set(`line_items[${idx}][price_data][currency]`, "brl");
        body.set(`line_items[${idx}][price_data][unit_amount]`, String(Math.round(l.unit_price * 100)));
        body.set(`line_items[${idx}][price_data][product_data][name]`, l.name);
      });
      const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      if (res.ok) {
        const session = (await res.json()) as { id: string; url: string };
        await supabaseAdmin.from("orders").update({ stripe_session_id: session.id }).eq("id", order.id);
        checkout_url = session.url;
      } else {
        console.error("Stripe error", res.status, await res.text());
      }
    }

    return {
      order_number,
      ...totals,
      shipping_method: shipLabel,
      items: lines.map(({ name, quantity, unit_price }) => ({ name, quantity, unit_price })),
      checkout_url,
    };
  });

// Mock payment confirmation used while Stripe isn't configured.
export const confirmMockPayment = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ order_number: z.string().regex(/^SM-[A-Z0-9]+$/) }).parse(d))
  .handler(async ({ data }) => {
    if (process.env['STRIPE_SECRET_KEY']) throw new Error("Pagamento simulado desativado.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("orders")
      .update({ payment_status: "pago" })
      .eq("order_number", data.order_number)
      .eq("payment_status", "pendente");
    if (error) throw new Error("Falha ao confirmar pagamento.");
    return { ok: true };
  });
