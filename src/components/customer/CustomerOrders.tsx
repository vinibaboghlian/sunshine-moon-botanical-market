import { useState, useEffect } from "react";
import { formatBRL } from "@/lib/checkout-rules";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, PackageCheck, Truck, MessageSquare, ExternalLink } from "lucide-react";
import { STORE_CONFIG } from "@/config/constants";
import type { AdminOrder } from "@/components/admin/OrderDetailsDialog";

const TIMELINE_STEPS = [
  { key: "novo", label: "Pedido Realizado" },
  { key: "em_preparo", label: "Em Preparo" },
  { key: "enviado", label: "Enviado" },
  { key: "concluido", label: "Entregue" },
];

export function CustomerOrders({ orders }: { orders: AdminOrder[] }) {
  if (orders.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-12 text-center shadow-2xs">
        <PackageCheck className="mx-auto h-12 w-12 text-muted-foreground/60" />
        <h3 className="mt-4 font-display text-xl font-semibold">Nenhum pedido encontrado</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Você ainda não realizou compras com este e-mail.
        </p>
        <Button className="mt-6" onClick={() => (window.location.href = "/")}>
          Explorar a Vitrine Botânica
        </Button>
      </div>
    );
  }

  const getStepIndex = (status: AdminOrder["status"]) => {
    switch (status) {
      case "novo":
        return 0;
      case "em_preparo":
        return 1;
      case "enviado":
        return 2;
      case "concluido":
        return 3;
      default:
        return 0;
    }
  };

  const openOrderSupport = (orderNumber: string) => {
    const text = encodeURIComponent(
      `Olá! Gostaria de tirar uma dúvida sobre o meu pedido #${orderNumber} na Sunshine Moon.`,
    );
    window.open(`https://wa.me/${STORE_CONFIG.whatsapp.phoneNumber}?text=${text}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {orders.map((order) => {
        const currentStep = getStepIndex(order.status);
        const isCancelled = order.status === "cancelado";

        return (
          <div key={order.id} className="rounded-xl border bg-card p-6 shadow-2xs">
            {/* Header do Pedido */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
              <div>
                <span className="font-display text-xl font-bold text-accent">
                  Pedido #{order.order_number}
                </span>
                <p className="text-xs text-muted-foreground">
                  Comprado em {new Date(order.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={order.payment_status === "pago" ? "default" : "secondary"}>
                  {order.payment_status === "pago" ? "Pagamento Aprovado" : "Aguardando Pagamento"}
                </Badge>
                {isCancelled && <Badge variant="destructive">Cancelado</Badge>}
              </div>
            </div>

            {/* Timeline Visual de Entrega */}
            {!isCancelled && (
              <div className="my-6">
                <p className="mb-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status de Envio
                </p>
                <div className="relative flex items-center justify-between">
                  <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-muted" />
                  <div
                    className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-primary transition-all duration-500"
                    style={{ width: `${(currentStep / (TIMELINE_STEPS.length - 1)) * 100}%` }}
                  />

                  {TIMELINE_STEPS.map((step, idx) => {
                    const isDone = idx <= currentStep;
                    const isCurrent = idx === currentStep;

                    return (
                      <div key={step.key} className="relative z-10 flex flex-col items-center">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium transition-colors ${
                            isDone
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted-foreground/30 bg-background text-muted-foreground"
                          } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                        >
                          {isDone ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                        </div>
                        <span
                          className={`mt-2 text-center text-xs font-medium ${
                            isDone ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Destaque de Rastreio */}
            {order.tracking_code && (
              <div className="my-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" />
                  <span>
                    Código de Rastreio:{" "}
                    <strong className="font-mono text-primary">{order.tracking_code}</strong> (
                    {order.shipping_carrier || "Correios"})
                  </span>
                </div>
                <a
                  href={`https://rastreamento.correios.com.br/app/index.php?codigo=${order.tracking_code}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  Rastrear nos Correios <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            {/* Lista de Itens */}
            <div className="my-4 divide-y border-y text-sm">
              {order.items && order.items.length > 0 ? (
                order.items.map((it) => (
                  <div key={it.id} className="flex justify-between py-2.5">
                    <span>
                      {it.quantity}x {it.products?.name || "Item botânico"}
                    </span>
                    <span className="font-medium">
                      {formatBRL(Number(it.unit_price) * it.quantity)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-2 text-xs text-muted-foreground">Itens do pedido</div>
              )}
            </div>

            {/* Rodapé com Totais e Botão de Suporte */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs text-emerald-700"
                onClick={() => openOrderSupport(order.order_number)}
              >
                <MessageSquare className="h-3.5 w-3.5" /> Preciso de ajuda com este pedido
              </Button>

              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  Frete ({order.shipping_method}): {formatBRL(order.shipping_cost)}
                </p>
                <p className="text-lg font-semibold text-foreground">
                  Total: {formatBRL(order.total)}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

