"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Eye, Plus, Trash2, FolderPlus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useDataStore } from "@/lib/data-store";
import { useAuthStore } from "@/lib/store";
import { generateId } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Recipe, Ingredient, Category } from "@/types";

export default function NewRecipePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { categories, addRecipe, addCategory } = useDataStore();
  const [saving, setSaving] = useState(false);
  const [newCatDialog, setNewCatDialog] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [localCategories, setLocalCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    preparation: "",
    presentation: "",
    cupType: "",
    photo: "",
    allergens: "",
    cost: "",
    notes: "",
    categoryId: "",
    tags: "",
  });
  const [ingredients, setIngredients] = useState([{ name: "", amount: "", unit: "" }]);

  const recipeCategories = [
    ...categories.filter((c) => c.type === "recipe"),
    ...localCategories,
  ];

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const newCat: Category = {
      id: `cat-${generateId()}`,
      name: newCatName.trim(),
      slug: newCatName.trim().toLowerCase().replace(/\s+/g, "-"),
      type: "recipe",
      order: recipeCategories.length + 1,
    };
    setLocalCategories((prev) => [...prev, newCat]);
    setForm((f) => ({ ...f, categoryId: newCat.id }));
    setNewCatName("");
    setNewCatDialog(false);
    toast.success("Kategori eklendi");
  };

  const addIngredient = () => setIngredients((prev) => [...prev, { name: "", amount: "", unit: "" }]);
  const removeIngredient = (i: number) => setIngredients((prev) => prev.filter((_, idx) => idx !== i));
  const updateIngredient = (i: number, field: "name" | "amount" | "unit", val: string) =>
    setIngredients((prev) => prev.map((ing, idx) => idx === i ? { ...ing, [field]: val } : ing));

  const handleSave = async (status: "published" | "draft") => {
    if (!form.name.trim()) {
      toast.error("Reçete adı zorunlu");
      return;
    }
    if (!form.preparation.trim()) {
      toast.error("Hazırlanış tarifi zorunlu");
      return;
    }
    setSaving(true);
    try {
      for (const cat of localCategories) {
        await addCategory(cat).catch(() => {});
      }
      const selectedCategory = recipeCategories.find((c) => c.id === form.categoryId);
      const now = new Date().toISOString();
      const recipe: Recipe = {
        id: `recipe-${generateId()}`,
        name: form.name,
        description: form.description || undefined,
        preparation: form.preparation,
        presentation: form.presentation || undefined,
        cupType: form.cupType || undefined,
        photo: form.photo || undefined,
        allergens: form.allergens ? form.allergens.split(",").map((a) => a.trim()).filter(Boolean) : [],
        cost: form.cost ? parseFloat(form.cost) : undefined,
        notes: form.notes || undefined,
        categoryId: form.categoryId || undefined,
        category: selectedCategory,
        ingredients: ingredients
          .filter((ing) => ing.name.trim())
          .map((ing): Ingredient => ({
            id: `ing-${generateId()}`,
            name: ing.name,
            amount: parseFloat(ing.amount) || 0,
            unit: ing.unit,
          })),
        status,
        content: [],
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        companyId: "company-1",
        createdBy: user?.id || "user-1",
        createdAt: now,
        updatedAt: now,
      };
      await addRecipe(recipe);
      toast.success(status === "published" ? "Reçete yayınlandı" : "Taslak kaydedildi");
      router.push("/admin/recipes");
    } catch (err) {
      console.error("Recipe save error:", err);
      toast.error("Kaydedilirken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/admin/recipes"><ArrowLeft className="w-4 h-4" />Geri</Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave("draft")} disabled={saving}>
            <Save className="w-4 h-4" />Taslak
          </Button>
          <Button onClick={() => handleSave("published")} disabled={saving}>
            <Eye className="w-4 h-4" />{saving ? "Kaydediliyor..." : "Yayınla"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Yeni Reçete</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Reçete Adı *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Latte, Cappuccino..." />
            </div>
            <div className="space-y-2">
              <Label>Kategori</Label>
              <div className="flex gap-2">
                <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {recipeCategories.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-muted-foreground">
                        Henüz kategori yok
                      </div>
                    ) : (
                      recipeCategories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setNewCatDialog(true)}
                  title="Yeni kategori ekle"
                >
                  <FolderPlus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Açıklama</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Kısa açıklama" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Bardak Tipi</Label>
              <Input value={form.cupType} onChange={(e) => setForm({ ...form, cupType: e.target.value })} placeholder="350ml Cam Bardak" />
            </div>
            <div className="space-y-2">
              <Label>Maliyet (₺)</Label>
              <Input type="number" step="0.01" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} placeholder="8.50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Alerjenler</Label>
              <Input value={form.allergens} onChange={(e) => setForm({ ...form, allergens: e.target.value })} placeholder="süt, gluten — virgülle ayırın" />
            </div>
            <div className="space-y-2">
              <Label>Etiketler</Label>
              <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="sıcak, latte — virgülle ayırın" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Kapak Görseli URL</Label>
            <Input value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} placeholder="https://..." />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Malzemeler</CardTitle>
          <Button size="sm" variant="outline" onClick={addIngredient}><Plus className="w-4 h-4" />Malzeme Ekle</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Input className="flex-[2]" value={ing.name} onChange={(e) => updateIngredient(i, "name", e.target.value)} placeholder="Malzeme adı" />
              <Input className="flex-1" value={ing.amount} onChange={(e) => updateIngredient(i, "amount", e.target.value)} placeholder="Miktar" />
              <Input className="flex-1" value={ing.unit} onChange={(e) => updateIngredient(i, "unit", e.target.value)} placeholder="ml, g, adet" />
              {ingredients.length > 1 && (
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive flex-shrink-0" onClick={() => removeIngredient(i)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Hazırlanış *</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Textarea value={form.preparation} onChange={(e) => setForm({ ...form, preparation: e.target.value })} rows={5} placeholder="Adım adım hazırlanış tarifi..." />
          <div className="space-y-2">
            <Label>Sunum</Label>
            <Textarea value={form.presentation} onChange={(e) => setForm({ ...form, presentation: e.target.value })} rows={2} placeholder="Servis şekli, süsleme..." />
          </div>
          <div className="space-y-2">
            <Label>Notlar</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Dikkat edilmesi gerekenler..." />
          </div>
        </CardContent>
      </Card>
      {/* Yeni Kategori Dialog */}
      <Dialog open={newCatDialog} onOpenChange={setNewCatDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Yeni Reçete Kategorisi</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Label>Kategori Adı</Label>
            <Input
              className="mt-1.5"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="örn: Espresso Bazlı, Soğuk İçecekler..."
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNewCatDialog(false)}>İptal</Button>
            <Button onClick={handleAddCategory} disabled={!newCatName.trim()}>
              <Check className="w-4 h-4" />
              Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
