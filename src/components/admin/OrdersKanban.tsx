import { useState } from "react";
import { formatBRL } from "@/lib/checkout-rules";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderDetailsDialog, type AdminOrder } from "./OrderDetailsDialog";
import { ChevronRight, Clock, PackageCheck, Truck, XCircle, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ColumnDef = {
  id: AdminOrder["status"];
  title: string;
  color: string;
};

const COLUMNS: ColumnDef[] = [
  { id: "novo", title: "Novos Pedidos", color: "border-amber-200 bg-amber-50/50 dark:bg-amber-950/20" },
  { id: "em_preparo", title: "Em Preparo / Produção", color: "border-sky-200 bg-sky-50/50 dark:bg-sky-950/20" },
  { id: "enviado", title: "Enviados / Rota", color: "border-indigo-200 bg-indigo-50/50 dark:bg-indigo-950/20" },
  { id: "concluido", title: "Concluídos", color: "border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20" },
  { id: "cancelado", title: "Cancelados", color: "border-rose-200 bg-rose-50/50 dark:bg-rose-950/20" },
];

export function OrdersKanban({
  orders,
  onRefresh,
}: {
  orders: AdminOrder[];
  onRefresh: () => void;
}) {
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draggingOrderId, setDraggingOrderId] = useState<string | null>(null);

  const moveOrder = async (orderId: string, newStatus: AdminOrder["status"]) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;
      toast.success(`Pedido movido para "${COLUMNS.find((c) => c.id === newStatus)?.title}"`);
      onRefresh();
    } catch {
      toast.error("Não foi possível atualizar o status do pedido.");
    }
  };

  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    e.dataTransfer.setData("text/plain", orderId);
    setDraggingOrderId(orderId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: AdminOrder["status"]) => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData("text/plain") || draggingOrderId;
    if (orderId) {
      moveOrder(orderId, targetStatus);
    }
    setDraggingOrderId(null);
  };

  const getNextStatus = (current: AdminOrder["status"]): AdminOrder["status"] | null => {
    if (current === "novo") return "em_preparo";
    if (current === "em_preparo") return "enviado";
    if (current === "enviado") return "concluido";
    return null;
  };

  return (
    <div className="h-full">
      <div className="grid grid-cols-1 gap-4 overflow-x-auto pb-4 md:grid-cols-3 lg:grid-cols-5">
        {COLUMNS.map((col) => {
          const colOrders = orders.filter((o) => o.status === col.id);

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`flex min-h-[480px] flex-col rounded-xl border p-3 transition-colors ${col.color}`}
            >
              {/* Header da Coluna */}
              <div className="mb-3 flex items-center justify-between border-b pb-2">
                <span className="font-medium text-sm text-foreground">{col.title}</span>
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {colOrders.length}
                </Badge>
              </div>

              {/* Lista de Cards */}
              <div className="flex-1 space-y-2.5 overflow-y-auto">
                {colOrders.length === 0 ? (
                  <p className="py-8 text-center text-xs text-muted-foreground">Nenhum pedido nesta etapa.</p>
                ) : (
                  colOrders.map((ord) => {
                    const next = getNextStatus(ord.status);

                    return (
                      <div
                        key={ord.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, ord.id)}
                        onClick={() => {
                          setSelectedOrder(ord);
                          setDialogOpen(true);
                        }}
                        className="group relative cursor-pointer rounded-lg border bg-card p-3 shadow-2xs transition-all hover:border-primary/50 hover:shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-display font-semibold text-sm text-accent">
                            #{ord.order_number}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(ord.created_at).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <p className="mt-1 text-xs font-medium text-foreground line-clamp-1">
                          {ord.customer_name}
                        </p>

                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span className="font-semibold">{formatBRL(ord.total)}</span>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                              ord.payment_status === "pago"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            }`}
                          >
                            {ord.payment_status === "pago" ? "Pago" : "Pendente"}
                          </span>
                        </div>

                        {ord.tracking_code && (
                          <div className="mt-2 flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400">
                            <Truck className="h-3 w-3" />
                            <span className="truncate">{ord.tracking_code}</span>
                          </div>
                        )}

                        {/* Ação rápida de avanço */}
                        {next && (
                          <div className="mt-2.5 pt-2 border-t flex justify-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-1.5 text-[10px] text-muted-foreground hover:text-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveOrder(ord.id, next);
                              }}
                            >
                              Avançar <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      <OrderDetailsDialog
        order={selectedOrder}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onOrderUpdated={onRefresh}
      />
    </div>
  );
}

