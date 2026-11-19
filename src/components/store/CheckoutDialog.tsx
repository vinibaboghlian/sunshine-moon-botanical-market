import { useState, useRef } from "react";
import { CheckCircle2, MessageSquare, Send } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/lib/cart";
import { formatBRL, maskCep, maskPhone, onlyDigits } from "@/lib/checkout-rules";
import { STORE_CONFIG } from "@/config/constants";

type CustomerForm = {
  name: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  notes: string;
};

const emptyForm: CustomerForm = {
  name: "",
  phone: "",
  cep: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  notes: "",
};

export function CheckoutDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const cart = useCart();
  const numberInputRef = useRef<HTMLInputElement>(null);
  const [f, setF] = useState<CustomerForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerForm, string>>>({});
  const [cepLoading, setCepLoading] = useState(false);
  const [sentOrder, setSentOrder] = useState<{
    orderNumber: string;
    items: typeof cart.items;
    subtotal: number;
    customer: CustomerForm;
  } | null>(null);

  const setField = (k: keyof CustomerForm, v: string) => {
    setF((prev) => ({ ...prev, [k]: v }));
    setErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  async function lookupCep(masked: string) {
    setField("cep", masked);
    const cep = onlyDigits(masked);
    if (cep.length !== 8) return;

    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const j = await res.json();
      if (!res.ok || j.erro) throw new Error();
      setF((p) => ({
        ...p,
        street: j.logradouro || p.street,
        neighborhood: j.bairro || p.neighborhood,
        city: j.localidade || "",
        state: j.uf || "",
      }));
      setTimeout(() => {
        numberInputRef.current?.focus();
      }, 50);
    } catch {
      setErrors((p) => ({ ...p, cep: "CEP não encontrado." }));
    } finally {
      setCepLoading(false);
    }
  }

  function validate() {
    const errs: Partial<Record<keyof CustomerForm, string>> = {};
    if (!f.name.trim() || f.name.trim().split(/\s+/).length < 2) {
      errs.name = "Informe seu nome e sobrenome.";
    }
    if (onlyDigits(f.phone).length < 10) {
      errs.phone = "Informe seu telefone / WhatsApp com DDD.";
    }
    return errs;
  }

  function handleSendWhatsApp() {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const orderNumber = `SM-${Date.now().toString(36).toUpperCase()}`;

    // Monta mensagem amigável e estruturada para o WhatsApp
    let msg = `✨ *NOVO PEDIDO DE CATÁLOGO — SUNSHINE MOON* ✨\n\n`;
    msg += `🔖 *Pedido:* #${orderNumber}\n`;
    msg += `👤 *Cliente:* ${f.name.trim()}\n`;
    msg += `📱 *Telefone/WhatsApp:* ${f.phone.trim()}\n`;

    if (f.cep.trim()) {
      msg += `📍 *Endereço para entrega:* ${f.street}, ${f.number || "S/N"}`;
      if (f.complement.trim()) msg += ` (${f.complement})`;
      msg += ` - ${f.neighborhood}, ${f.city}/${f.state} (CEP: ${f.cep})\n`;
    }

    if (f.notes.trim()) {
      msg += `💬 *Observações:* ${f.notes.trim()}\n`;
    }

    msg += `\n🛍️ *ITENS DO PEDIDO:*\n`;
    cart.items.forEach((item, index) => {
      msg += `${index + 1}. *${item.name}*\n   ↳ ${item.quantity}x de ${formatBRL(item.price)} = *${formatBRL(item.price * item.quantity)}*\n`;
    });

    msg += `\n💰 *Total dos Produtos:* ${formatBRL(cart.subtotal)}\n`;
    msg += `🌿 _Gostaria de confirmar a disponibilidade e combinar a forma de envio/pagamento!_`;

    const encodedMsg = encodeURIComponent(msg);
    const whatsappUrl = `https://wa.me/${STORE_CONFIG.whatsapp.phoneNumber}?text=${encodedMsg}`;

    // Salva estado para feedback visual
    setSentOrder({
      orderNumber,
      items: [...cart.items],
      subtotal: cart.subtotal,
      customer: { ...f },
    });

    // Limpa o carrinho
    cart.clear();

    // Abre o WhatsApp
    window.open(whatsappUrl, "_blank");
  }

  const handleClose = (v: boolean) => {
    if (!v) {
      setSentOrder(null);
    }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
        {sentOrder ? (
          <div className="py-6 text-center">
            <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-600" />
            <h2 className="mt-4 font-display text-3xl">Pedido Enviado ao WhatsApp!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Seu pedido foi formatado e direcionado para nossa equipe.
            </p>
            <div className="mx-auto mt-4 max-w-sm rounded-lg border bg-muted/60 p-4 text-left text-sm">
              <p className="font-semibold text-foreground">Pedido #{sentOrder.orderNumber}</p>
              <p className="text-xs text-muted-foreground">Cliente: {sentOrder.customer.name}</p>
              <div className="my-2 border-t pt-2 space-y-1">
                {sentOrder.items.map((i) => (
                  <div key={i.product_id} className="flex justify-between text-xs">
                    <span>{i.quantity}x {i.name}</span>
                    <span className="font-medium">{formatBRL(i.price * i.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Total dos Produtos:</span>
                <span>{formatBRL(sentOrder.subtotal)}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button
                variant="outline"
                className="gap-2 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                onClick={() => {
                  const encodedMsg = encodeURIComponent(
                    `Olá! Estou verificando o pedido #${sentOrder.orderNumber} que enviei anteriormente.`
                  );
                  window.open(`https://wa.me/${STORE_CONFIG.whatsapp.phoneNumber}?text=${encodedMsg}`, "_blank");
                }}
              >
                <MessageSquare className="h-4 w-4" /> Reabrir WhatsApp
              </Button>
              <Button onClick={() => handleClose(false)}>Voltar ao Catálogo</Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-3xl">Finalizar Pedido no WhatsApp</DialogTitle>
              <DialogDescription>
                Informe seus dados para prepararmos seu atendimento personalizado com cálculo de entrega.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Resumo rápido do carrinho */}
              <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                <div className="flex justify-between font-medium">
                  <span>Itens selecionados ({cart.count})</span>
                  <span>{formatBRL(cart.subtotal)}</span>
                </div>
              </div>

              {/* Dados do Cliente */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="name">Seu Nome e Sobrenome *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Ana Clara Silva"
                    value={f.name}
                    onChange={(e) => setField("name", e.target.value)}
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="phone">Seu WhatsApp / Telefone com DDD *</Label>
                  <Input
                    id="phone"
                    placeholder="(11) 99999-9999"
                    value={f.phone}
                    onChange={(e) => setField("phone", maskPhone(e.target.value))}
                  />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="cep">CEP de Entrega (Opcional, para cálculo de frete)</Label>
                  <Input
                    id="cep"
                    placeholder="00000-000"
                    value={f.cep}
                    onChange={(e) => lookupCep(maskCep(e.target.value))}
                  />
                  {cepLoading && <p className="text-xs text-muted-foreground">Buscando endereço...</p>}
                  {errors.cep && <p className="text-xs text-destructive">{errors.cep}</p>}
                </div>

                {f.cep.trim().length >= 8 && (
                  <>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="street">Rua / Logradouro</Label>
                      <Input
                        id="street"
                        value={f.street}
                        onChange={(e) => setField("street", e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="number">Número</Label>
                      <Input
                        id="number"
                        ref={numberInputRef}
                        placeholder="Ex: 120"
                        value={f.number}
                        onChange={(e) => setField("number", e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="complement">Complemento</Label>
                      <Input
                        id="complement"
                        placeholder="Ex: Apto 32"
                        value={f.complement}
                        onChange={(e) => setField("complement", e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="neighborhood">Bairro</Label>
                      <Input
                        id="neighborhood"
                        value={f.neighborhood}
                        onChange={(e) => setField("neighborhood", e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="city">Cidade / UF</Label>
                      <Input
                        id="city"
                        value={f.city ? `${f.city}/${f.state}` : ""}
                        onChange={(e) => setField("city", e.target.value)}
                      />
                    </div>
                  </>
                )}

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="notes">Observações ou Dúvidas sobre o pedido</Label>
                  <Input
                    id="notes"
                    placeholder="Ex: Gostaria de embalagem para presente..."
                    value={f.notes}
                    onChange={(e) => setField("notes", e.target.value)}
                  />
                </div>
              </div>

              {/* Botão de Enviar WhatsApp */}
              <div className="pt-2">
                <Button
                  className="w-full gap-2 bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90 shadow-soft h-12 text-base font-medium"
                  onClick={handleSendWhatsApp}
                  disabled={cart.items.length === 0}
                >
                  <Send className="h-5 w-5" /> Enviar Pedido via WhatsApp
                </Button>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Você será direcionado diretamente para o WhatsApp oficial da Sunshine Moon.
                </p>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
