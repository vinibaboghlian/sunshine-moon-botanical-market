import { useState } from "react";
import { formatBRL } from "@/lib/checkout-rules";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Printer, Truck, MapPin, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type AdminOrder = {
  id: string;
  order_number: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_cpf: string;
  postal_code: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  shipping_method: string;
  shipping_cost: number;
  subtotal: number;
  total: number;
  payment_status: string;
  status: "novo" | "em_preparo" | "enviado" | "concluido" | "cancelado";
  tracking_code: string | null;
  shipping_carrier: string | null;
  items?: Array<{
    id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    products?: { name: string };
  }>;
};

export function OrderDetailsDialog({
  order,
  open,
  onOpenChange,
  onOrderUpdated,
}: {
  order: AdminOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderUpdated?: () => void;
}) {
  const [trackingCode, setTrackingCode] = useState(order?.tracking_code || "");
  const [carrier, setCarrier] = useState(order?.shipping_carrier || "Correios");
  const [savingTracking, setSavingTracking] = useState(false);

  if (!order) return null;

  const handleSaveTracking = async () => {
    setSavingTracking(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          tracking_code: trackingCode.trim() || null,
          shipping_carrier: carrier.trim() || null,
          status: order.status === "novo" || order.status === "em_preparo" ? "enviado" : order.status,
        })
        .eq("id", order.id);

      if (error) throw error;
      toast.success("Código de rastreio atualizado com sucesso!");
      if (onOrderUpdated) onOrderUpdated();
    } catch {
      toast.error("Falha ao salvar código de rastreio.");
    } finally {
      setSavingTracking(false);
    }
  };

  const openWhatsApp = () => {
    const cleanPhone = order.customer_phone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
    const text = encodeURIComponent(
      `Olá, ${order.customer_name}! Aqui é da equipe da Sunshine Moon. Estamos acompanhando o seu pedido #${order.order_number}.`,
    );
    window.open(`https://wa.me/${formattedPhone}?text=${text}`, "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="font-display text-2xl font-semibold">
                Pedido #{order.order_number}
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                Realizado em {new Date(order.created_at).toLocaleString("pt-BR")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={order.payment_status === "pago" ? "default" : "secondary"}>
                {order.payment_status === "pago" ? "Pago" : "Pendente"}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {order.status.replace("_", " ")}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Dados do Cliente */}
          <div className="rounded-xl border bg-muted/40 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Dados do Comprador</h3>
              <Button size="sm" variant="outline" onClick={openWhatsApp} className="h-8 gap-1.5 text-xs text-emerald-700">
                <MessageSquare className="h-3.5 w-3.5" /> Falar no WhatsApp
              </Button>
            </div>
            <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Nome</p>
                <p className="font-medium">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">E-mail</p>
                <p className="font-medium">{order.customer_email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Telefone</p>
                <p className="font-medium">{order.customer_phone}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">CPF</p>
                <p className="font-medium">{order.customer_cpf}</p>
              </div>
            </div>
          </div>

          {/* Endereço de Entrega */}
          <div className="rounded-xl border bg-muted/40 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <MapPin className="h-4 w-4 text-primary" /> Endereço de Destino
            </h3>
            <p className="mt-2 text-sm">
              {order.street}, {order.number}
              {order.complement ? ` - ${order.complement}` : ""}
            </p>
            <p className="text-sm text-muted-foreground">
              {order.neighborhood} — {order.city}/{order.state} · CEP: {order.postal_code}
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Truck className="h-3.5 w-3.5" /> Envio: {order.shipping_method} ({formatBRL(order.shipping_cost)})
            </div>
          </div>

          {/* Rastreamento */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Truck className="h-4 w-4" /> Código de Rastreamento (Melhor Envio / Correios)
            </h3>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <div className="flex-1 space-y-1">
                <Label htmlFor="tracking" className="text-xs">Código de Objeto / Rastreio</Label>
                <Input
                  id="tracking"
                  placeholder="Ex: NL123456789BR"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                />
              </div>
              <div className="w-full sm:w-36 space-y-1">
                <Label htmlFor="carrier" className="text-xs">Transportadora</Label>
                <Input
                  id="carrier"
                  placeholder="Correios"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button size="sm" onClick={handleSaveTracking} disabled={savingTracking} className="w-full sm:w-auto">
                  {savingTracking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
                  Salvar
                </Button>
              </div>
            </div>
          </div>

          {/* Resumo de Itens & Totais */}
          <div className="rounded-xl border p-4">
            <h3 className="text-sm font-semibold">Itens do Pedido</h3>
            <div className="mt-3 divide-y text-sm">
              {order.items && order.items.length > 0 ? (
                order.items.map((it) => (
                  <div key={it.id} className="flex justify-between py-2">
                    <span>
                      {it.quantity}x {it.products?.name || "Produto Botânico"}
                    </span>
                    <span className="font-medium">{formatBRL(Number(it.unit_price) * it.quantity)}</span>
                  </div>
                ))
              ) : (
                <p className="py-2 text-xs text-muted-foreground">Itens detalhados vinculados ao pedido.</p>
              )}
              <div className="flex justify-between pt-2 text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatBRL(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Frete ({order.shipping_method})</span>
                <span>{formatBRL(order.shipping_cost)}</span>
              </div>
              <div className="flex justify-between pt-2 text-base font-semibold">
                <span>Total</span>
                <span>{formatBRL(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between border-t pt-4">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-1.5 h-4 w-4" /> Imprimir Resumo
          </Button>
          <Button size="sm" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

