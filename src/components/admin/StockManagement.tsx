import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/lib/checkout-rules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Package, Save } from "lucide-react";

type ProductRow = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock_quantity: number;
  is_active: boolean;
};

export function StockManagement() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, category, price, stock_quantity, is_active")
        .order("name");

      if (error) throw error;
      if (data && data.length > 0) {
        setProducts(data);
      } else {
        setProducts([
          { id: "1", name: "Sabonete Acalanto Lunar", category: "sabonetes", price: 24.0, stock_quantity: 40, is_active: true },
          { id: "2", name: "Sabonete Purificação Etérica", category: "sabonetes", price: 26.0, stock_quantity: 35, is_active: true },
          { id: "3", name: "Sabonete Fartura e Realização", category: "sabonetes", price: 25.0, stock_quantity: 38, is_active: true },
          { id: "4", name: "Escalda-Pés Despertar Energético — Lavanda", category: "escalda_pes", price: 32.0, stock_quantity: 22, is_active: true },
          { id: "5", name: "Escalda-Pés Despertar Energético — Café", category: "escalda_pes", price: 32.0, stock_quantity: 18, is_active: true },
          { id: "6", name: "Água de Lençol Brisa Lunar (250ml)", category: "home_spray", price: 42.0, stock_quantity: 15, is_active: true },
          { id: "7", name: "Kit Alquimia Lunar Completo", category: "kits", price: 110.0, stock_quantity: 8, is_active: true },
        ]);
      }
    } catch {
      toast.error("Erro ao carregar estoque.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const updateProductField = (id: string, field: keyof ProductRow, value: unknown) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
  };

  const handleSaveProduct = async (product: ProductRow) => {
    setSavingId(product.id);
    try {
      const { error } = await supabase
        .from("products")
        .update({
          stock_quantity: Number(product.stock_quantity),
          price: Number(product.price),
          is_active: product.is_active,
        })
        .eq("id", product.id);

      if (error) throw error;
      toast.success(`Estoque de "${product.name}" atualizado!`);
    } catch {
      toast.error("Falha ao salvar produto.");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Controle de Estoque</h2>
          <p className="text-xs text-muted-foreground">
            Ajuste quantidades, preços e visibilidade dos produtos na vitrine.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadProducts}>
          Recarregar
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/50 text-xs font-medium text-muted-foreground">
              <tr>
                <th className="p-4">Produto</th>
                <th className="p-4">Categoria</th>
                <th className="p-4">Preço (R$)</th>
                <th className="p-4">Qtd. em Estoque</th>
                <th className="p-4 text-center">Ativo na Loja</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="p-4">
                    <p className="font-medium text-foreground">{p.name}</p>
                  </td>
                  <td className="p-4">
                    <Badge variant="outline" className="capitalize text-xs">
                      {p.category.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Input
                      type="number"
                      step="0.01"
                      className="w-28 h-8 text-xs"
                      value={p.price}
                      onChange={(e) => updateProductField(p.id, "price", e.target.value)}
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        className="w-24 h-8 text-xs"
                        value={p.stock_quantity}
                        onChange={(e) =>
                          updateProductField(p.id, "stock_quantity", e.target.value)
                        }
                      />
                      {p.stock_quantity <= 5 && (
                        <span className="text-[10px] text-amber-600 font-medium">Baixo</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <Switch
                      checked={p.is_active}
                      onCheckedChange={(checked) => updateProductField(p.id, "is_active", checked)}
                    />
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 gap-1 text-xs"
                      onClick={() => handleSaveProduct(p)}
                      disabled={savingId === p.id}
                    >
                      {savingId === p.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Save className="h-3.5 w-3.5 text-primary" />
                      )}
                      Salvar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

