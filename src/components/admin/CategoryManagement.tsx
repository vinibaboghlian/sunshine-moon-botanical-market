import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Plus, Edit2, Trash2, Tags, Save, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export type CategoryItem = {
  id: string;
  label: string;
};

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: "sabonetes", label: "Sabonetes" },
  { id: "escalda_pes", label: "Escalda-pés" },
  { id: "home_spray", label: "Água de lençol" },
  { id: "kits", label: "Kits" },
];

export function CategoryManagement({ onCategoriesChange }: { onCategoriesChange?: () => void }) {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal de edição / criação
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [catName, setCatName] = useState("");
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("created_at");

      if (error || !data || data.length === 0) {
        // Tentar obter do localStorage ou padrão
        const saved = localStorage.getItem("sunshine_categories");
        if (saved) {
          setCategories(JSON.parse(saved));
        } else {
          setCategories(DEFAULT_CATEGORIES);
        }
      } else {
        setCategories(data);
        localStorage.setItem("sunshine_categories", JSON.stringify(data));
      }
    } catch {
      setCategories(DEFAULT_CATEGORIES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setCatName("");
    setOpenModal(true);
  };

  const handleOpenEdit = (c: CategoryItem) => {
    setEditingId(c.id);
    setCatName(c.label);
    setOpenModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      toast.error("Informe o nome da categoria.");
      return;
    }

    setSaving(true);
    try {
      const slug =
        editingId ||
        catName
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/(^_|_$)+/g, "");

      const newCategory: CategoryItem = {
        id: slug,
        label: catName.trim(),
      };

      // Tenta salvar no Supabase
      const { error } = await supabase.from("categories").upsert([newCategory]);

      if (error) {
        console.warn("Categories fallback to local storage:", error.message);
      }

      setCategories((prev) => {
        const filtered = prev.filter((item) => item.id !== slug);
        const updated = [...filtered, newCategory];
        localStorage.setItem("sunshine_categories", JSON.stringify(updated));
        return updated;
      });

      toast.success(
        editingId
          ? `Categoria "${catName}" atualizada!`
          : `Nova categoria "${catName}" criada!`
      );

      setOpenModal(false);
      onCategoriesChange?.();
    } catch {
      toast.error("Erro ao salvar categoria.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, label: string) => {
    if (!window.confirm(`Tem certeza que deseja remover a categoria "${label}"?`)) return;

    try {
      await supabase.from("categories").delete().eq("id", id);
      setCategories((prev) => {
        const updated = prev.filter((item) => item.id !== id);
        localStorage.setItem("sunshine_categories", JSON.stringify(updated));
        return updated;
      });
      toast.success(`Categoria "${label}" excluída com sucesso.`);
      onCategoriesChange?.();
    } catch {
      toast.error("Erro ao excluir categoria.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Tags className="h-5 w-5 text-accent" /> Gerenciamento de Categorias
          </h2>
          <p className="text-xs text-muted-foreground">
            Crie, edite os nomes e organize as seções de produtos da loja Sunshine Moon.
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
          onClick={handleOpenCreate}
        >
          <Plus className="h-4 w-4" /> Nova Categoria
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-2xs">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/50 text-xs font-medium text-muted-foreground">
            <tr>
              <th className="p-4">Identificador (Slug)</th>
              <th className="p-4">Nome da Categoria (Exibido na Loja)</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-muted/30">
                <td className="p-4 font-mono text-xs text-muted-foreground">{c.id}</td>
                <td className="p-4 font-medium text-foreground">{c.label}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1 text-xs"
                      onClick={() => handleOpenEdit(c)}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Editar
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(c.id, c.label)}
                      title="Excluir Categoria"
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

      {/* Modal de Criação / Edição de Categoria */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-xl">
              <Tags className="h-5 w-5 text-accent" />
              {editingId ? "Editar Nome da Categoria" : "Nova Categoria de Produtos"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Altere o título de exibição da categoria na loja."
                : "Defina o nome da categoria que aparecerá no menu e nos filtros da vitrine."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="catName">Nome da Categoria *</Label>
              <Input
                id="catName"
                placeholder="Ex: Óleos Corporais, Velas Aromáticas, Difusores..."
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setOpenModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="gap-1.5">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salvar Categoria
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

