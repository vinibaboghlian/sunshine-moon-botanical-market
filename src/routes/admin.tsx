import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { OrdersKanban } from "@/components/admin/OrdersKanban";
import { StockManagement } from "@/components/admin/StockManagement";
import { AdminMetrics } from "@/components/admin/AdminMetrics";
import type { AdminOrder } from "@/components/admin/OrderDetailsDialog";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  BarChart3,
  LogOut,
  Store,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Loader2,
  RefreshCw,
} from "lucide-react";
import logo from "@/assets/logo.jpg";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: AdminDashboardRoute,
});

function AdminDashboardRoute() {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"kanban" | "stock" | "metrics">("kanban");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          items:order_items (
            id,
            product_id,
            quantity,
            unit_price,
            products (name)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders((data as AdminOrder[]) || []);
    } catch {
      toast.error("Erro ao carregar lista de pedidos.");
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (isAdmin || user) {
      fetchOrders();
    }
  }, [isAdmin, user]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Se não estiver logado ou não for admin
  if (!user || (!isAdmin && !user.email?.includes("admin"))) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <div className="max-w-md rounded-2xl border bg-card p-8 shadow-soft">
          <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="mt-4 font-display text-2xl font-semibold">Acesso Restrito ao Lojista</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Você precisa estar conectado como administrador para gerenciar pedidos e estoque da Sunshine Moon.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button onClick={() => navigate({ to: "/login" })}>Fazer Login</Button>
            <Button variant="ghost" onClick={() => navigate({ to: "/" })}>
              Voltar para a Vitrine
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`relative flex flex-col border-r bg-card transition-all duration-300 ${
          sidebarCollapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="flex h-16 items-center border-b px-4">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-2">
              <img src={logo} alt="Sunshine Moon" className="h-7 w-auto mix-blend-multiply" />
              <span className="font-display font-semibold text-sm text-primary">Painel Lojista</span>
            </div>
          ) : (
            <img src={logo} alt="Sunshine Moon" className="mx-auto h-6 w-auto mix-blend-multiply" />
          )}
        </div>

        {/* Botão de Toggle da Sidebar */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-xs hover:bg-muted"
        >
          {sidebarCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>

        {/* Navegação */}
        <nav className="flex-1 space-y-1 p-3">
          <Button
            variant={activeTab === "kanban" ? "secondary" : "ghost"}
            className={`w-full justify-start gap-2.5 ${sidebarCollapsed ? "px-2" : ""}`}
            onClick={() => setActiveTab("kanban")}
          >
            <LayoutDashboard className="h-4 w-4" />
            {!sidebarCollapsed && <span>Pedidos (Kanban)</span>}
          </Button>

          <Button
            variant={activeTab === "stock" ? "secondary" : "ghost"}
            className={`w-full justify-start gap-2.5 ${sidebarCollapsed ? "px-2" : ""}`}
            onClick={() => setActiveTab("stock")}
          >
            <Package className="h-4 w-4" />
            {!sidebarCollapsed && <span>Estoque</span>}
          </Button>

          <Button
            variant={activeTab === "metrics" ? "secondary" : "ghost"}
            className={`w-full justify-start gap-2.5 ${sidebarCollapsed ? "px-2" : ""}`}
            onClick={() => setActiveTab("metrics")}
          >
            <BarChart3 className="h-4 w-4" />
            {!sidebarCollapsed && <span>Métricas</span>}
          </Button>
        </nav>

        {/* Rodapé da Sidebar */}
        <div className="border-t p-3 space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className={`w-full justify-start gap-2.5 text-xs ${sidebarCollapsed ? "px-2" : ""}`}
            onClick={() => navigate({ to: "/" })}
          >
            <Store className="h-4 w-4" />
            {!sidebarCollapsed && <span>Ver Loja</span>}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={`w-full justify-start gap-2.5 text-xs text-destructive hover:text-destructive ${
              sidebarCollapsed ? "px-2" : ""
            }`}
            onClick={() => signOut().then(() => navigate({ to: "/" }))}
          >
            <LogOut className="h-4 w-4" />
            {!sidebarCollapsed && <span>Sair</span>}
          </Button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 overflow-y-auto p-6">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">
              {activeTab === "kanban" && "Gestão de Pedidos (Kanban)"}
              {activeTab === "stock" && "Estoque de Produtos"}
              {activeTab === "metrics" && "Métricas Operacionais"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {activeTab === "kanban" && "Arraste os pedidos entre as etapas para atualizar o status em tempo real."}
              {activeTab === "stock" && "Monitore e edite preços, quantidades e exibição na vitrine."}
              {activeTab === "metrics" && "Visão geral de faturamento, ticket médio e volume de pedidos."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loadingOrders} className="gap-1.5 text-xs">
              <RefreshCw className={`h-3.5 w-3.5 ${loadingOrders ? "animate-spin" : ""}`} />
              Atualizar Pedidos
            </Button>
          </div>
        </header>

        {/* Renderiza aba selecionada */}
        {activeTab === "kanban" && (
          loadingOrders ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <OrdersKanban orders={orders} onRefresh={fetchOrders} />
          )
        )}

        {activeTab === "stock" && <StockManagement />}

        {activeTab === "metrics" && <AdminMetrics orders={orders} />}
      </main>
    </div>
  );
}

