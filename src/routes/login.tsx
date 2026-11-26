import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import logo from "@/assets/logo.jpg";

export const Route = createFileRoute("/login")({
  component: LoginRoute,
});

function LoginRoute() {
  const { signIn, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-soft">
          <img src={logo} alt="Sunshine Moon" className="mx-auto mb-4 h-9 w-auto mix-blend-multiply" />
          <h1 className="font-display text-3xl">Você já está conectado</h1>
          <p className="mt-2 text-sm text-muted-foreground">{user.email}</p>
          <div className="mt-6 flex flex-col gap-3">
            {isAdmin && (
              <Button onClick={() => navigate({ to: "/admin" })} className="w-full">
                <ShieldCheck className="mr-2 h-4 w-4" /> Painel do Lojista
              </Button>
            )}
            <Button onClick={() => navigate({ to: "/" })} variant="outline" className="w-full">
              Voltar para o Catálogo
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
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message || "Erro ao entrar. Verifique seus dados.");
      } else {
        toast.success("Login realizado com sucesso!");
        navigate({ to: "/admin" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/" })}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao catálogo
        </Button>
      </div>

      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-soft">
        <div className="text-center">
          <img src={logo} alt="Sunshine Moon" className="mx-auto mb-4 h-10 w-auto mix-blend-multiply" />
          <h1 className="font-display text-3xl font-semibold">Painel do Lojista</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Entre com sua conta de administrador para gerenciar o catálogo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">E-mail</Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                required
                placeholder="seu@email.com"
                className="pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password">Senha</Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                className="pl-9"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
