import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { StockManagement } from "@/components/admin/StockManagement";
import { CategoryManagement } from "@/components/admin/CategoryManagement";
import { Button } from "@/components/ui/button";
import {
  Package,
  Tags,
  LogOut,
  Store,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import logo from "@/assets/logo.jpg";

export const Route = createFileRoute("/admin")({
  component: AdminDashboardRoute,
});

function AdminDashboardRoute() {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"stock" | "categories">("stock");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isDevOrAdmin =
    isAdmin ||
    user?.email?.includes("admin") ||
    user?.email === "vini.baboghlian@gmail.com" ||
    import.meta.env.DEV ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  if (!user && !isDevOrAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <div className="max-w-md rounded-2xl border bg-card p-8 shadow-soft">
          <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="mt-4 font-display text-2xl font-semibold">Acesso Restrito ao Lojista</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Você precisa estar conectado como administrador para gerenciar produtos e categorias da Sunshine Moon.
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
              <span className="font-display text-sm font-semibold text-primary">Painel Lojista</span>
            </div>
          ) : (
            <img src={logo} alt="Sunshine Moon" className="mx-auto h-6 w-auto mix-blend-multiply" />
          )}
        </div>

        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-xs hover:bg-muted"
          aria-label="Alternar barra lateral"
        >
          {sidebarCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>

        {/* Navegação */}
        <nav className="flex-1 space-y-1 p-3">
          <Button
            variant={activeTab === "stock" ? "secondary" : "ghost"}
            className={`w-full justify-start gap-2.5 ${sidebarCollapsed ? "px-2" : ""}`}
            onClick={() => setActiveTab("stock")}
          >
            <Package className="h-4 w-4" />
            {!sidebarCollapsed && <span>Produtos & Kits</span>}
          </Button>

          <Button
            variant={activeTab === "categories" ? "secondary" : "ghost"}
            className={`w-full justify-start gap-2.5 ${sidebarCollapsed ? "px-2" : ""}`}
            onClick={() => setActiveTab("categories")}
          >
            <Tags className="h-4 w-4" />
            {!sidebarCollapsed && <span>Categorias</span>}
          </Button>
        </nav>

        {/* Rodapé da Sidebar */}
        <div className="space-y-1 border-t p-3">
          <Button
            variant="ghost"
            size="sm"
            className={`w-full justify-start gap-2.5 text-xs ${sidebarCollapsed ? "px-2" : ""}`}
            onClick={() => navigate({ to: "/" })}
          >
            <Store className="h-4 w-4" />
            {!sidebarCollapsed && <span>Ver Catálogo</span>}
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
              {activeTab === "stock" ? "Catálogo de Produtos & Kits" : "Gestão de Categorias"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {activeTab === "stock"
                ? "Cadastre, edite preços, descrições, fotos e disponibilidade na vitrine."
                : "Crie, edite os nomes e organize as seções do catálogo da loja."}
            </p>
          </div>
        </header>

        {activeTab === "stock" && <StockManagement />}
        {activeTab === "categories" && <CategoryManagement />}
      </main>
    </div>
  );
}
