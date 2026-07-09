"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, ChefHat, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/lib/store";
import { useDataStore } from "@/lib/data-store";
import type { Recipe } from "@/types";

function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link href={`/recipes/${recipe.id}`}>
      <Card className="overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer h-full border-border/60">
        <div className="relative h-48 overflow-hidden">
          {recipe.photo ? (
            <img
              src={recipe.photo}
              alt={recipe.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-amber-950/40 dark:to-orange-950/30 flex items-center justify-center">
              <ChefHat className="w-14 h-14 text-amber-400/50" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {recipe.category && (
            <div className="absolute top-2.5 left-2.5">
              <Badge className="bg-black/55 backdrop-blur-sm text-white border-0 text-xs font-medium">
                {recipe.category.name}
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4 space-y-2.5">
          <h3 className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-1">{recipe.name}</h3>
          {recipe.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{recipe.description}</p>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-0.5">
            <span className="flex items-center gap-1">{recipe.ingredients.length} malzeme</span>
            {recipe.cupType && <span className="text-muted-foreground/70">{recipe.cupType}</span>}
          </div>
          {recipe.allergens.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              <span className="line-clamp-1">Alerjen: {recipe.allergens.join(", ")}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export default function RecipesPage() {
  const { user } = useAuthStore();
  const { recipes, categories } = useDataStore();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const isAdmin = user?.role === "admin";

  const recipeCategories = categories.filter((c) => c.type === "recipe");

  const filtered = recipes.filter((r) => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedCategory && r.categoryId !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reçeteler</h1>
          <p className="text-muted-foreground mt-1">{filtered.length} reçete</p>
        </div>
        {isAdmin && (
          <Button asChild>
            <Link href="/admin/recipes/new">
              <Plus className="w-4 h-4" />
              Yeni Reçete
            </Link>
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Reçete ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
              selectedCategory === null
                ? "bg-primary text-white shadow-sm"
                : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-border/80"
            }`}
          >
            Tümü
          </button>
          {recipeCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
                selectedCategory === cat.id
                  ? "bg-primary text-white shadow-sm"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-border/80"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <ChefHat className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Reçete bulunamadı</p>
        </div>
      )}
    </div>
  );
}
