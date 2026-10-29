import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Lock, Mail, User, ShieldCheck } from "lucide-react";
import logo from "@/assets/logo.jpg";

export const Route = createFileRoute("/login")({
  component: LoginRoute,
});

function LoginRoute() {
  const { signIn, signUp, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-soft">
          <img src={logo} alt="Sunshine Moon" className="mx-auto mb-4 h-9 w-auto mix-blend-multiply" />
          <h1 className="font-display text-3xl">Você já está conectado</h1>
          <p className="mt-2 text-sm text-muted-foreground">{user.email}</p>
          <div className="mt-6 flex flex-col gap-3">
            <Button onClick={() => navigate({ to: "/minha-conta" })} className="w-full">
              Ir para Minha Conta
            </Button>
            {isAdmin && (
              <Button onClick={() => navigate({ to: "/admin" })} variant="outline" className="w-full">
                <ShieldCheck className="mr-2 h-4 w-4 text-primary" /> Painel do Lojista
              </Button>
            )}
            <Button onClick={() => navigate({ to: "/" })} variant="ghost" className="w-full">
              Voltar para a Loja
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Informe seu e-mail.");
      return;
    }
    if (!password) {
      toast.error("Informe sua senha.");
      return;
    }

    setLoading(true);
    try {
      if (tab === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message || "Erro ao entrar. Verifique seus dados.");
        } else {
          toast.success("Login realizado com sucesso!");
          navigate({ to: "/minha-conta" });
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          toast.error(error.message || "Erro ao criar conta.");
        } else {
          toast.success("Conta criada com sucesso! Bem-vindo(a).");
          navigate({ to: "/minha-conta" });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/" })}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar à loja
        </Button>
      </div>

      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-soft">
        <div className="text-center">
          <img src={logo} alt="Sunshine Moon" className="mx-auto mb-4 h-10 w-auto mix-blend-multiply" />
          <h1 className="font-display text-3xl font-semibold">
            {tab === "login" ? "Acesse sua conta" : "Crie sua conta"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {tab === "login"
              ? "Acompanhe seus pedidos botânicos e rituais."
              : "Cadastre-se para rastrear pedidos e agilizar suas compras."}
          </p>
        </div>

        <div className="mt-6 flex rounded-lg bg-muted p-1">
          <button
            type="button"
            onClick={() => setTab("login")}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium transition ${
              tab === "login" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setTab("signup")}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium transition ${
              tab === "signup" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Criar conta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {tab === "signup" && (
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Nome completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  placeholder="Seu nome"
                  className="pl-9"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className="pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-9"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={tab === "login" ? "current-password" : "new-password"}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : tab === "login" ? "Entrar" : "Cadastrar"}
          </Button>
        </form>

        <div className="mt-6 border-t pt-4 text-center text-xs text-muted-foreground">
          <p>
            Dica para acesso administrativo: utilize um e-mail com perfil atribuído como administrador no Supabase.
          </p>
        </div>
      </div>
    </div>
  );
}

