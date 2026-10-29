import { useRef, useState } from "react";
import { CheckCircle2, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/lib/cart";
import {
  SHIPPING_OPTIONS, computeTotals, formatBRL, isValidCpf, maskCep, maskCpf, maskPhone, onlyDigits, type ShippingId,
} from "@/lib/checkout-rules";
import { confirmMockPayment, createOrder, type CreatedOrder } from "@/lib/orders.functions";

type Form = {
  name: string; email: string; phone: string; cpf: string; cep: string; street: string;
  number: string; complement: string; neighborhood: string; city: string; state: string;
};
const empty: Form = { name: "", email: "", phone: "", cpf: "", cep: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "" };

function validate(f: Form, cepOk: boolean) {
  const e: Partial<Record<keyof Form, string>> = {};
  if (f.name.trim().split(/\s+/).length < 2) e.name = "Informe nome e sobrenome.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = "Email inválido.";
  if (onlyDigits(f.phone).length !== 11) e.phone = "Telefone com DDD: 11 dígitos.";
  if (!isValidCpf(f.cpf)) e.cpf = "CPF inválido.";
  if (onlyDigits(f.cep).length !== 8 || !cepOk) e.cep = "Informe um CEP válido.";
  if (!f.street.trim()) e.street = "Rua obrigatória.";
  if (!f.number.trim()) e.number = "Número obrigatório.";
  if (!f.neighborhood.trim()) e.neighborhood = "Bairro obrigatório.";
  if (!f.city.trim()) e.city = "Cidade obrigatória.";
  if (!/^[A-Z]{2}$/.test(f.state)) e.state = "UF inválida.";
  return e;
}

export function CheckoutDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const cart = useCart();
  const numberInputRef = useRef<HTMLInputElement>(null);
  const [f, setF] = useState<Form>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [ship, setShip] = useState<ShippingId>("PAC");
  const [cepState, setCepState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [submitting, setSubmitting] = useState(false);
  const [mockOrder, setMockOrder] = useState<CreatedOrder | null>(null);
  const [paid, setPaid] = useState<CreatedOrder | null>(null);
  const [paying, setPaying] = useState(false);

  const totals = computeTotals(cart.items, ship);
  const set = (k: keyof Form, v: string) => {
    setF((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  };

  async function lookupCep(masked: string) {
    set("cep", masked);
    const cep = onlyDigits(masked);
    if (cep.length !== 8) { setCepState("idle"); return; }
    setCepState("loading");
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const j = await res.json();
      if (!res.ok || j.erro) throw new Error();
      setF((p) => ({ ...p, street: j.logradouro || p.street, neighborhood: j.bairro || p.neighborhood, city: j.localidade || "", state: j.uf || "" }));
      setCepState("ok");
      // Foca automaticamente no campo "Número"
      setTimeout(() => {
        numberInputRef.current?.focus();
      }, 50);
    } catch {
      setCepState("error");
      setErrors((p) => ({ ...p, cep: "CEP não encontrado." }));
    }
  }

  async function submit() {
    const e = validate(f, cepState === "ok");
    setErrors(e);
    if (Object.keys(e).length) { toast.error("Revise os campos destacados."); return; }
    setSubmitting(true);
    try {
      const order = await createOrder({
        data: {
          customer_name: f.name.trim(), customer_email: f.email.trim(), customer_phone: onlyDigits(f.phone),
          customer_cpf: onlyDigits(f.cpf), postal_code: onlyDigits(f.cep), street: f.street, number: f.number,
          complement: f.complement, neighborhood: f.neighborhood, city: f.city, state: f.state,
          shipping_method: ship, items: cart.items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
          origin: window.location.origin,
        },
      });
      if (order.checkout_url) { cart.clear(); window.location.href = order.checkout_url; return; }
      setMockOrder(order);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível finalizar o pedido.");
    } finally {
      setSubmitting(false);
    }
  }

  async function payMock() {
    if (!mockOrder) return;
    setPaying(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      await confirmMockPayment({ data: { order_number: mockOrder.order_number } });
      setPaid(mockOrder); setMockOrder(null); cart.clear(); setF(empty); setCepState("idle");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha no pagamento.");
    } finally { setPaying(false); }
  }

  const close = (v: boolean) => { if (!v) { setPaid(null); setMockOrder(null); } onOpenChange(v); };
  const field = (k: keyof Form, label: string, props: React.ComponentProps<typeof Input> = {}) => (
    <div className="space-y-1.5">
      <Label htmlFor={k}>{label}</Label>
      <Input id={k} value={f[k]} onChange={(e) => set(k, e.target.value)} aria-invalid={!!errors[k]} {...props} />
      {errors[k] && <p className="text-xs text-destructive">{errors[k]}</p>}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        {paid ? (
          <div className="py-4 text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
            <h2 className="mt-4 text-3xl">Pedido confirmado</h2>
            <p className="mt-1 text-muted-foreground">Número do pedido</p>
            <p className="font-display text-2xl text-accent">#{paid.order_number}</p>
            <div className="mx-auto mt-6 max-w-sm space-y-2 rounded-lg bg-muted p-4 text-left text-sm">
              {paid.items.map((i) => (
                <div key={i.name} className="flex justify-between"><span>{i.quantity}× {i.name}</span><span>{formatBRL(i.unit_price * i.quantity)}</span></div>
              ))}
              <div className="flex justify-between border-t pt-2"><span>Frete ({paid.shipping_method})</span><span>{formatBRL(paid.shipping_cost)}</span></div>
              <div className="flex justify-between font-semibold"><span>Total</span><span>{formatBRL(paid.total)}</span></div>
            </div>
            <Button className="mt-6" onClick={() => close(false)}>Voltar à loja</Button>
          </div>
        ) : mockOrder ? (
          <div className="py-2">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl"><CreditCard className="h-5 w-5" /> Pagamento seguro</DialogTitle>
              <DialogDescription>Ambiente de teste — nenhum valor real será cobrado.</DialogDescription>
            </DialogHeader>
            <div className="mt-6 rounded-lg border bg-muted p-5">
              <p className="text-sm text-muted-foreground">Pedido #{mockOrder.order_number}</p>
              <p className="mt-1 font-display text-3xl">{formatBRL(mockOrder.total)}</p>
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setMockOrder(null)} disabled={paying}>Voltar</Button>
              <Button className="flex-1" onClick={payMock} disabled={paying}>
                {paying && <Loader2 className="h-4 w-4 animate-spin" />} Simular pagamento
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-3xl">Finalizar compra</DialogTitle>
              <DialogDescription>Seus dados e endereço de entrega.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">{field("name", "Nome completo", { autoComplete: "name" })}</div>
              {field("email", "Email", { type: "email", autoComplete: "email" })}
              <div className="space-y-1.5">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" inputMode="numeric" value={f.phone} placeholder="(11) 91234-5678" onChange={(e) => set("phone", maskPhone(e.target.value))} aria-invalid={!!errors.phone} />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cpf">CPF</Label>
                <Input id="cpf" inputMode="numeric" value={f.cpf} placeholder="000.000.000-00" onChange={(e) => set("cpf", maskCpf(e.target.value))} aria-invalid={!!errors.cpf} />
                {errors.cpf && <p className="text-xs text-destructive">{errors.cpf}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cep">CEP</Label>
                <div className="relative">
                  <Input id="cep" inputMode="numeric" value={f.cep} placeholder="00000-000" onChange={(e) => lookupCep(maskCep(e.target.value))} aria-invalid={!!errors.cep} />
                  {cepState === "loading" && <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
                </div>
                {errors.cep && <p className="text-xs text-destructive">{errors.cep}</p>}
              </div>
              <div className="sm:col-span-2">{field("street", "Rua")}</div>
              {field("number", "Número", { ref: numberInputRef, required: true })}
              {field("complement", "Complemento (opcional)")}
              {field("neighborhood", "Bairro")}
              <div className="grid grid-cols-[1fr_5rem] gap-3">
                {field("city", "Cidade")}
                {field("state", "UF", { maxLength: 2, onChange: (e) => set("state", e.target.value.toUpperCase().replace(/[^A-Z]/g, "")) })}
              </div>
            </div>

            <div className="mt-2">
              <p className="mb-2 text-sm font-medium">Frete</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {SHIPPING_OPTIONS.map((o) => (
                  <button key={o.id} type="button" onClick={() => setShip(o.id)}
                    className={`rounded-lg border p-3 text-left transition ${ship === o.id ? "border-primary bg-primary/10" : "hover:bg-muted"}`}>
                    <div className="flex justify-between font-medium"><span>{o.label}</span><span>{formatBRL(o.price)}</span></div>
                    <p className="text-xs text-muted-foreground">{o.eta}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1 rounded-lg bg-muted p-4 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatBRL(totals.subtotal)}</span></div>
              <div className="flex justify-between"><span>Frete</span><span>{formatBRL(totals.shipping_cost)}</span></div>
              <div className="flex justify-between pt-1 text-base font-semibold"><span>Total</span><span>{formatBRL(totals.total)}</span></div>
            </div>
            <Button size="lg" onClick={submit} disabled={submitting || cart.items.length === 0}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Ir para pagamento
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
