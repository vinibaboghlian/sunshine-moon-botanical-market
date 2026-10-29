import { formatBRL } from "@/lib/checkout-rules";
import { DollarSign, ShoppingBag, Clock, TrendingUp } from "lucide-react";
import type { AdminOrder } from "./OrderDetailsDialog";

export function AdminMetrics({ orders }: { orders: AdminOrder[] }) {
  const paidOrders = orders.filter((o) => o.payment_status === "pago");
  const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const openOrdersCount = orders.filter(
    (o) => o.status === "novo" || o.status === "em_preparo",
  ).length;
  const averageTicket = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border bg-card p-5 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Faturamento Confirmado</span>
          <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <DollarSign className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-3 font-display text-3xl font-semibold">{formatBRL(totalRevenue)}</p>
        <p className="mt-1 text-xs text-muted-foreground">{paidOrders.length} pedidos pagos</p>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Pedidos em Andamento</span>
          <div className="rounded-lg bg-amber-100 p-2 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            <Clock className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-3 font-display text-3xl font-semibold">{openOrdersCount}</p>
        <p className="mt-1 text-xs text-muted-foreground">Novos ou em preparo</p>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Ticket Médio</span>
          <div className="rounded-lg bg-indigo-100 p-2 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-3 font-display text-3xl font-semibold">{formatBRL(averageTicket)}</p>
        <p className="mt-1 text-xs text-muted-foreground">Por pedido aprovado</p>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Total de Pedidos</span>
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <ShoppingBag className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-3 font-display text-3xl font-semibold">{orders.length}</p>
        <p className="mt-1 text-xs text-muted-foreground">Histórico total</p>
      </div>
    </div>
  );
}

