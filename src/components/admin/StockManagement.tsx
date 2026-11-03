import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/lib/checkout-rules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Plus, Save, Upload, Image as ImageIcon, Sparkles, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type ProductRow = {
  id: string;
  slug?: string;
  name: string;
  category: string;
  price: number;
  stock_quantity: number;
  is_active: boolean;
  image_url?: string | null;
  description?: string | null;
  sensory_notes?: string | null;
  benefits?: string[];
  weight_grams?: number;
  package_width_cm?: number;
  package_height_cm?: number;
  package_depth_cm?: number;
};

export function StockManagement() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Modal de Criação / Edição de Produto Completo
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "sabonetes",
    price: "",
    stock_quantity: "",
    description: "",
    sensory_notes: "",
    benefits: "",
    image_url: "",
    weight_grams: "150",
    package_width_cm: "10",
    package_height_cm: "10",
    package_depth_cm: "5",
  });

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
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

  // Salvar alterações rápidas direto da tabela (Preço, Estoque, Ativo)
  const handleQuickSave = async (product: ProductRow) => {
    setSavingId(product.id);
    try {
      const numericPrice = Number(product.price);
      const numericStock = Number(product.stock_quantity);

      const { data, error } = await supabase
        .from("products")
        .update({
          stock_quantity: numericStock,
          price: numericPrice,
          is_active: product.is_active,
        })
        .eq("id", product.id)
        .select();

      if (error) {
        toast.error(`Erro ao salvar no banco: ${error.message}`);
        return;
      }

      if (data && data.length === 0) {
        toast.warning(`Atenção: execute o script fix-permissions.sql no Supabase para salvar alterações.`);
      } else {
        toast.success(`"${product.name}" atualizado para ${formatBRL(numericPrice)}!`);
      }
    } catch (err: unknown) {
      toast.error("Falha ao salvar produto.");
    } finally {
      setSavingId(null);
    }
  };

  // Upload de Imagem local (converte em base64)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("A imagem deve ter no máximo 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((p) => ({ ...p, image_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Abrir modal para novo produto
  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      name: "",
      category: "sabonetes",
      price: "",
      stock_quantity: "20",
      description: "",
      sensory_notes: "",
      benefits: "",
      image_url: "",
      weight_grams: "150",
      package_width_cm: "10",
      package_height_cm: "10",
      package_depth_cm: "5",
    });
    setOpenModal(true);
  };

  // Abrir modal para editar produto existente (textos, aromas, benefícios, fotos)
  const handleOpenEditModal = (p: ProductRow) => {
    setEditingId(p.id);
    setFormData({
      name: p.name || "",
      category: p.category || "sabonetes",
      price: String(p.price || ""),
      stock_quantity: String(p.stock_quantity ?? "0"),
      description: p.description || "",
      sensory_notes: p.sensory_notes || "",
      benefits: (p.benefits || []).join("\n"),
      image_url: p.image_url || "",
      weight_grams: String(p.weight_grams || "150"),
      package_width_cm: String(p.package_width_cm || "10"),
      package_height_cm: String(p.package_height_cm || "10"),
      package_depth_cm: String(p.package_depth_cm || "5"),
    });
    setOpenModal(true);
  };

  // Salvar no Modal (Criação ou Edição Completa)
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Informe o nome do produto.");
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      toast.error("Informe um preço válido.");
      return;
    }

    setSavingProduct(true);
    try {
      const benefitsArray = formData.benefits
        .split("\n")
        .map((b) => b.trim())
        .filter(Boolean);

      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        price: Number(formData.price),
        stock_quantity: Number(formData.stock_quantity) || 0,
        description: formData.description.trim() || null,
        sensory_notes: formData.sensory_notes.trim() || null,
        benefits: benefitsArray,
        image_url: formData.image_url.trim() || null,
        weight_grams: Number(formData.weight_grams) || 150,
        package_width_cm: Number(formData.package_width_cm) || 10,
        package_height_cm: Number(formData.package_height_cm) || 10,
        package_depth_cm: Number(formData.package_depth_cm) || 5,
        is_active: true,
      };

      if (editingId) {
        // Atualizar produto existente
        const { data, error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editingId)
          .select();

        if (error) {
          toast.error(`Erro ao atualizar: ${error.message}`);
          return;
        }

        setProducts((prev) =>
          prev.map((item) => (item.id === editingId ? { ...item, ...payload } : item))
        );
        toast.success(`Produto "${formData.name}" atualizado com sucesso!`);
      } else {
        // Criar novo produto
        const slug = formData.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "") + "-" + Date.now().toString(36).slice(-4);

        const newRecord = { slug, ...payload };

        const { data, error } = await supabase
          .from("products")
          .insert([newRecord])
          .select();

        if (error) {
          toast.error(`Erro ao cadastrar: ${error.message}`);
          return;
        }

        if (data && data[0]) {
          setProducts((prev) => [data[0], ...prev]);
        } else {
          setProducts((prev) => [{ id: `prod-${Date.now()}`, ...newRecord }, ...prev]);
        }
        toast.success(`Novo produto "${formData.name}" cadastrado na loja!`);
      }

      setOpenModal(false);
    } catch {
      toast.error("Erro inesperado ao salvar produto.");
    } finally {
      setSavingProduct(false);
    }
  };

  // Excluir produto
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Tem certeza que deseja remover "${name}" da loja?`)) return;

    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) {
        toast.error(`Erro ao excluir: ${error.message}`);
        return;
      }
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success(`"${name}" removido com sucesso.`);
    } catch {
      toast.error("Não foi possível excluir o produto.");
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Catálogo e Controle de Produtos</h2>
          <p className="text-xs text-muted-foreground">
            Altere preços, estoque, descrições botânicas, aromas, fotos ou cadastre novas alquimias.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadProducts}>
            Recarregar
          </Button>
          <Button
            size="sm"
            className="gap-1.5 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
            onClick={handleOpenCreateModal}
          >
            <Plus className="h-4 w-4" /> Novo Produto
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/50 text-xs font-medium text-muted-foreground">
              <tr>
                <th className="p-4">Foto</th>
                <th className="p-4">Produto & Aroma</th>
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
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="h-12 w-12 rounded-md object-cover border"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                        <ImageIcon className="h-5 w-5" />
                      </div>
                    )}
                  </td>
                  <td className="p-4 max-w-xs">
                    <p className="font-medium text-foreground">{p.name}</p>
                    {p.sensory_notes && (
                      <p className="text-xs text-muted-foreground line-clamp-1 italic">
                        {p.sensory_notes}
                      </p>
                    )}
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
                      className="w-28 h-8 text-xs font-medium"
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
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1 text-xs"
                        title="Editar textos, foto e dimensões"
                        onClick={() => handleOpenEditModal(p)}
                      >
                        <Edit className="h-3.5 w-3.5 text-foreground" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        className="h-8 gap-1 text-xs bg-primary text-primary-foreground"
                        title="Salvar alterações de preço e estoque"
                        onClick={() => handleQuickSave(p)}
                        disabled={savingId === p.id}
                      >
                        {savingId === p.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Save className="h-3.5 w-3.5" />
                        )}
                        Salvar
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        title="Excluir produto"
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Criação / Edição de Produto Completo */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-2xl">
              <Sparkles className="h-5 w-5 text-accent" />
              {editingId ? "Editar Detalhes do Produto" : "Adicionar Novo Produto Botânico"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Edite o nome, aromas, descrição botânica, benefícios, imagens e dimensões."
                : "Preencha as informações do produto, foto e dimensões para o cálculo de frete."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveModal} className="space-y-4 py-2">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="name">Nome do Produto *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Sabonete Rosa Mosqueta e Argila Branca"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category">Categoria</Label>
                <select
                  id="category"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={formData.category}
                  onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                >
                  <option value="sabonetes">Sabonetes</option>
                  <option value="escalda_pes">Escalda-pés</option>
                  <option value="home_spray">Água de Lençol / Spray</option>
                  <option value="kits">Kits & Rituais</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="price">Preço de Venda (R$) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="28.00"
                  value={formData.price}
                  onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="stock">Estoque Disponível (unidades)</Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="30"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData((p) => ({ ...p, stock_quantity: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="weight">Peso (Gramas)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="150"
                  value={formData.weight_grams}
                  onChange={(e) => setFormData((p) => ({ ...p, weight_grams: e.target.value }))}
                />
              </div>
            </div>

            {/* Imagem do Produto */}
            <div className="space-y-2 rounded-lg border bg-muted/40 p-3">
              <Label className="text-xs font-semibold">Imagem do Produto</Label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {formData.image_url ? (
                  <img
                    src={formData.image_url}
                    alt="Prévia"
                    className="h-20 w-20 rounded-md object-cover border"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-md border-2 border-dashed bg-muted text-muted-foreground">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                )}

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="text-xs file:mr-2 file:rounded-md file:border-0 file:bg-primary file:px-2.5 file:py-1 file:text-xs file:font-medium file:text-primary-foreground hover:file:cursor-pointer"
                    />
                  </div>
                  <Input
                    type="url"
                    placeholder="Ou cole a URL direta da imagem (https://...)"
                    className="text-xs"
                    value={formData.image_url}
                    onChange={(e) => setFormData((p) => ({ ...p, image_url: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Notas Sensoriais / Família Olfativa</Label>
              <Input
                id="notes"
                placeholder="Ex: Rosas selvagens, argila mineral, gerânio e sândalo suave"
                value={formData.sensory_notes}
                onChange={(e) => setFormData((p) => ({ ...p, sensory_notes: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="desc">História Botânica e Modo de Usar (Descrição)</Label>
              <Textarea
                id="desc"
                placeholder="Descreva as propriedades botânicas, intenção energética e ritual de uso..."
                className="h-24 text-xs"
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="benefits">Benefícios (1 por linha)</Label>
              <Textarea
                id="benefits"
                placeholder="Regeneração e firmeza para a pele&#10;Toque aveludado e relaxante&#10;Argila pura biocompatível"
                className="h-20 text-xs"
                value={formData.benefits}
                onChange={(e) => setFormData((p) => ({ ...p, benefits: e.target.value }))}
              />
            </div>

            {/* Dimensões de Embalagem para Envio */}
            <div className="rounded-lg border bg-muted/20 p-3">
              <p className="text-xs font-semibold mb-2 text-muted-foreground">
                Dimensões da Embalagem para Cálculo de Frete dos Correios / Transportadora (cm)
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-[10px]">Largura (cm)</Label>
                  <Input
                    type="number"
                    value={formData.package_width_cm}
                    onChange={(e) => setFormData((p) => ({ ...p, package_width_cm: e.target.value }))}
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-[10px]">Altura (cm)</Label>
                  <Input
                    type="number"
                    value={formData.package_height_cm}
                    onChange={(e) => setFormData((p) => ({ ...p, package_height_cm: e.target.value }))}
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-[10px]">Profundidade (cm)</Label>
                  <Input
                    type="number"
                    value={formData.package_depth_cm}
                    onChange={(e) => setFormData((p) => ({ ...p, package_depth_cm: e.target.value }))}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setOpenModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={savingProduct} className="gap-1.5">
                {savingProduct ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {editingId ? "Salvar Alterações" : "Cadastrar Produto"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
