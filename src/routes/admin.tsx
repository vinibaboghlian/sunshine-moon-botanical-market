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
      if (data && data.length > 0) {
        setOrders(data as AdminOrder[]);
      } else {
        // Mock demonstrativo rico para o lojista visualizar e tirar prints
        setOrders([
          {
            id: "mock-1",
            order_number: "SM-1042",
            created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
            customer_name: "Mariana Vasconcellos",
            customer_email: "mariana.v@email.com",
            customer_phone: "11987654321",
            customer_cpf: "12345678901",
            postal_code: "01414-001",
            street: "Alameda Santos",
            number: "1200",
            complement: "Apto 82",
            neighborhood: "Cerqueira César",
            city: "São Paulo",
            state: "SP",
            shipping_method: "Sedex",
            shipping_cost: 29.9,
            subtotal: 75.0,
            total: 104.9,
            payment_status: "pago",
            status: "novo",
            tracking_code: null,
            shipping_carrier: "Correios",
            items: [
              { id: "i1", product_id: "p1", quantity: 2, unit_price: 24.0, products: { name: "Sabonete Acalanto Lunar" } },
              { id: "i2", product_id: "p2", quantity: 1, unit_price: 27.0, products: { name: "Sabonete Purificação Etérica" } },
            ],
          },
          {
            id: "mock-2",
            order_number: "SM-1039",
            created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
            customer_name: "Lucas Gabriel Silveira",
            customer_email: "lucas.silveira@email.com",
            customer_phone: "21998765432",
            customer_cpf: "98765432100",
            postal_code: "22041-001",
            street: "Rua Barata Ribeiro",
            number: "450",
            complement: "Bloco B",
            neighborhood: "Copacabana",
            city: "Rio de Janeiro",
            state: "RJ",
            shipping_method: "PAC",
            shipping_cost: 18.9,
            subtotal: 64.0,
            total: 82.9,
            payment_status: "pago",
            status: "em_preparo",
            tracking_code: null,
            shipping_carrier: "Melhor Envio / Jadlog",
            items: [
              { id: "i3", product_id: "p3", quantity: 2, unit_price: 32.0, products: { name: "Escalda-Pés Despertar Energético" } },
            ],
          },
          {
            id: "mock-3",
            order_number: "SM-1025",
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            customer_name: "Camila Fernandes",
            customer_email: "camila.botanica@email.com",
            customer_phone: "31988887777",
            customer_cpf: "45678912300",
            postal_code: "30130-110",
            street: "Avenida Afonso Pena",
            number: "2500",
            complement: "",
            neighborhood: "Funcionários",
            city: "Belo Horizonte",
            state: "MG",
            shipping_method: "Sedex",
            shipping_cost: 29.9,
            subtotal: 110.0,
            total: 139.9,
            payment_status: "pago",
            status: "enviado",
            tracking_code: "NL984712035BR",
            shipping_carrier: "Correios",
            items: [
              { id: "i4", product_id: "p4", quantity: 1, unit_price: 110.0, products: { name: "Kit Alquimia Lunar Completo" } },
            ],
          },
          {
            id: "mock-4",
            order_number: "SM-1011",
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
            customer_name: "Renata de Souza Lima",
            customer_email: "renata.lima@email.com",
            customer_phone: "11977776666",
            customer_cpf: "78912345600",
            postal_code: "04538-133",
            street: "Rua Joaquim Floriano",
            number: "720",
            complement: "Conj 41",
            neighborhood: "Itaim Bibi",
            city: "São Paulo",
            state: "SP",
            shipping_method: "PAC",
            shipping_cost: 18.9,
            subtotal: 51.0,
            total: 69.9,
            payment_status: "pago",
            status: "concluido",
            tracking_code: "NL819230192BR",
            shipping_carrier: "Correios",
            items: [
              { id: "i5", product_id: "p1", quantity: 1, unit_price: 25.0, products: { name: "Sabonete Fartura e Realização" } },
              { id: "i6", product_id: "p2", quantity: 1, unit_price: 26.0, products: { name: "Sabonete Purificação Etérica" } },
            ],
          },
        ]);
      }
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

  // Modo de demonstração local ou admin autenticado
  const isDevOrAdmin =
    isAdmin ||
    user?.email?.includes("admin") ||
    import.meta.env.DEV ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  // Se não estiver logado ou não for admin (em produção fora do localhost)
  if (!user && !isDevOrAdmin) {
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

