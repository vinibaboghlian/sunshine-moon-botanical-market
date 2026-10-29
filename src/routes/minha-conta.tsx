import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { CustomerOrders } from "@/components/customer/CustomerOrders";
import { CustomerProfile } from "@/components/customer/CustomerProfile";
import type { AdminOrder } from "@/components/admin/OrderDetailsDialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, LogOut, Package, User, ShieldCheck } from "lucide-react";
import logo from "@/assets/logo.jpg";

export const Route = createFileRoute("/minha-conta")({
  component: CustomerAccountRoute,
});

function CustomerAccountRoute() {
  const { user, profile, isAdmin, loading, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"orders" | "profile">("orders");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, loading, navigate]);

  const loadUserOrders = async () => {
    if (!user) return;
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
        .or(`user_id.eq.${user.id},customer_email.eq.${user.email}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders((data as AdminOrder[]) || []);
    } catch {
      // Falha ao carregar
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadUserOrders();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="border-b bg-card/80 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/" })} aria-label="Voltar à loja">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <a href="/" className="flex items-center gap-2">
              <img src={logo} alt="Sunshine Moon" className="h-7 w-auto mix-blend-multiply" />
            </a>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs text-primary"
                onClick={() => navigate({ to: "/admin" })}
              >
                <ShieldCheck className="h-3.5 w-3.5" /> Painel Lojista
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => signOut().then(() => navigate({ to: "/" }))}
            >
              <LogOut className="h-3.5 w-3.5" /> Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Minha Conta</h1>
            <p className="text-xs text-muted-foreground">
              Olá, <strong>{profile?.full_name || user.email}</strong>. Acompanhe seus pedidos e dados.
            </p>
          </div>

          <div className="flex rounded-lg bg-muted p-1">
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                activeTab === "orders" ? "bg-background text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Package className="h-3.5 w-3.5" /> Meus Pedidos ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                activeTab === "profile" ? "bg-background text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <User className="h-3.5 w-3.5" /> Meus Dados & Endereço
            </button>
          </div>
        </div>

        {activeTab === "orders" && (
          loadingOrders ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <CustomerOrders orders={orders} />
          )
        )}

        {activeTab === "profile" && (
          <CustomerProfile profile={profile} onProfileUpdated={refreshProfile} />
        )}
      </main>
    </div>
  );
}

