"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Trash2, ChefHat, MoreHorizontal, Copy, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDataStore } from "@/lib/data-store";
import { generateId } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Recipe } from "@/types";

export default function AdminRecipesPage() {
  const router = useRouter();
  const { recipes, deleteRecipe, addRecipe } = useDataStore();
  const [search, setSearch] = useState("");

  const filtered = recipes.filter(
    (r) => !search || r.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    deleteRecipe(id);
    toast.success("Reçete silindi");
  };

  const handleDuplicate = async (recipe: Recipe) => {
    const now = new Date().toISOString();
    const copy: Recipe = {
      ...recipe,
      id: `recipe-${generateId()}`,
      name: `${recipe.name} - Kopya`,
      status: "draft",
      createdAt: now,
      updatedAt: now,
      ingredients: recipe.ingredients.map((ing) => ({ ...ing, id: `ing-${generateId()}` })),
    };
    await addRecipe(copy);
    toast.success("Reçete kopyalandı — taslak olarak kaydedildi");
    router.push(`/admin/recipes/${copy.id}/edit`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reçete Yönetimi</h1>
          <p className="text-muted-foreground mt-1">{recipes.length} reçete</p>
        </div>
        <Button asChild>
          <Link href="/admin/recipes/new"><Plus className="w-4 h-4" />Yeni Reçete</Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Reçete ara..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-8 col-span-full">Reçete bulunamadı</p>
            )}
            {filtered.map((recipe) => (
              <div key={recipe.id} className="rounded-xl border border-border overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 bg-card">
                {recipe.photo ? (
                  <img src={recipe.photo} alt={recipe.name} className="w-full h-36 object-cover" />
                ) : (
                  <div className="w-full h-36 bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/30 dark:to-orange-950/20 flex items-center justify-center">
                    <ChefHat className="w-10 h-10 text-amber-400/60" />
                  </div>
                )}
                <div className="p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{recipe.name}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {recipe.category && <Badge variant="secondary" className="text-xs">{recipe.category.name}</Badge>}
                        <Badge variant={recipe.status === "published" ? "default" : "outline"} className="text-xs">
                          {recipe.status === "published" ? "Yayında" : "Taslak"}
                        </Badge>
                        {recipe.cost != null && (
                          <span className="text-xs text-muted-foreground font-medium">₺{Number(recipe.cost).toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="flex-shrink-0 h-7 w-7">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/recipes/${recipe.id}`}>Görüntüle</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/recipes/${recipe.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />Düzenle
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(recipe)}>
                          <Copy className="mr-2 h-4 w-4" />Kopyala
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(recipe.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
