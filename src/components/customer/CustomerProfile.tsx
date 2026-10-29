import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, type UserProfile } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { maskCep, maskPhone, onlyDigits } from "@/lib/checkout-rules";
import { Loader2, Save, UserCheck } from "lucide-react";

export function CustomerProfile({
  profile,
  onProfileUpdated,
}: {
  profile: UserProfile | null;
  onProfileUpdated: () => void;
}) {
  const { user } = useAuth();
  const [f, setF] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone ? maskPhone(profile.phone) : "",
    cpf: profile?.cpf || "",
    postal_code: profile?.postal_code ? maskCep(profile.postal_code) : "",
    street: profile?.street || "",
    number: profile?.number || "",
    complement: profile?.complement || "",
    neighborhood: profile?.neighborhood || "",
    city: profile?.city || "",
    state: profile?.state || "",
  });
  const [loadingCep, setLoadingCep] = useState(false);
  const [saving, setSaving] = useState(false);

  const setField = (field: string, val: string) => {
    setF((prev) => ({ ...prev, [field]: val }));
  };

  const handleLookupCep = async (masked: string) => {
    setField("postal_code", masked);
    const cep = onlyDigits(masked);
    if (cep.length !== 8) return;

    setLoadingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setF((prev) => ({
          ...prev,
          street: data.logradouro || prev.street,
          neighborhood: data.bairro || prev.neighborhood,
          city: data.localidade || prev.city,
          state: data.uf || prev.state,
        }));
      }
    } catch {
      // Ignora erro
    } finally {
      setLoadingCep(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: f.full_name,
        phone: onlyDigits(f.phone),
        cpf: onlyDigits(f.cpf),
        postal_code: onlyDigits(f.postal_code),
        street: f.street,
        number: f.number,
        complement: f.complement,
        neighborhood: f.neighborhood,
        city: f.city,
        state: f.state,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      toast.success("Seus dados foram atualizados!");
      onProfileUpdated();
    } catch {
      toast.error("Erro ao salvar dados.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="rounded-xl border bg-card p-6 shadow-2xs space-y-6">
      <div>
        <h3 className="font-display text-xl font-semibold">Dados Pessoais & Endereço Padrão</h3>
        <p className="text-xs text-muted-foreground">
          Mantenha seu endereço atualizado para agilizar a entrega dos seus pedidos.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="full_name">Nome completo</Label>
          <Input
            id="full_name"
            value={f.full_name}
            onChange={(e) => setField("full_name", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail da Conta</Label>
          <Input id="email" value={user?.email || ""} disabled className="bg-muted/50" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Telefone / WhatsApp</Label>
          <Input
            id="phone"
            value={f.phone}
            onChange={(e) => setField("phone", maskPhone(e.target.value))}
            placeholder="(11) 91234-5678"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cep">CEP</Label>
          <div className="relative">
            <Input
              id="cep"
              value={f.postal_code}
              onChange={(e) => handleLookupCep(maskCep(e.target.value))}
              placeholder="00000-000"
            />
            {loadingCep && (
              <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="street">Rua</Label>
          <Input
            id="street"
            value={f.street}
            onChange={(e) => setField("street", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="number">Número</Label>
          <Input
            id="number"
            value={f.number}
            onChange={(e) => setField("number", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="complement">Complemento</Label>
          <Input
            id="complement"
            value={f.complement}
            onChange={(e) => setField("complement", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="neighborhood">Bairro</Label>
          <Input
            id="neighborhood"
            value={f.neighborhood}
            onChange={(e) => setField("neighborhood", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-[1fr_5rem] gap-2">
          <div className="space-y-1.5">
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              value={f.city}
              onChange={(e) => setField("city", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="state">UF</Label>
            <Input
              id="state"
              maxLength={2}
              value={f.state}
              onChange={(e) => setField("state", e.target.value.toUpperCase())}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar Alterações
        </Button>
      </div>
    </form>
  );
}

