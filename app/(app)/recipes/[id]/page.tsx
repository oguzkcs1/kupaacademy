"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, AlertCircle, ChefHat, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/lib/store";
import { useDataStore } from "@/lib/data-store";

export default function RecipeDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuthStore();
  const { recipes } = useDataStore();
  const recipe = recipes.find((r) => r.id === params.id);
  if (!recipe) return notFound();

  const isAdmin = user?.role === "admin";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/recipes"><ArrowLeft className="w-4 h-4" />Reçetelere Dön</Link>
        </Button>
        {isAdmin && (
          <Button size="sm" variant="outline" asChild>
            <Link href={`/admin/recipes/${recipe.id}/edit`}>
              <Edit className="w-4 h-4" />Düzenle
            </Link>
          </Button>
        )}
      </div>

      {/* Hero */}
      {recipe.photo && (
        <div className="h-64 rounded-2xl overflow-hidden">
          <img src={recipe.photo} alt={recipe.name} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{recipe.name}</h1>
              {recipe.category && <Badge variant="secondary">{recipe.category.name}</Badge>}
            </div>
            {recipe.description && (
              <p className="text-muted-foreground mt-2">{recipe.description}</p>
            )}
          </div>

          {/* Ingredients */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Malzemeler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recipe.ingredients.map((ing) => (
                  <div key={ing.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="font-medium">{ing.name}</span>
                    <span className="text-muted-foreground">{ing.amount} {ing.unit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Preparation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hazırlanış</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{recipe.preparation}</p>
            </CardContent>
          </Card>

          {recipe.presentation && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sunum</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{recipe.presentation}</p>
              </CardContent>
            </Card>
          )}

          {recipe.video && (() => {
            const ytId = recipe.video.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
            return (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Video</CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-hidden rounded-b-xl">
                  {ytId ? (
                    <div className="aspect-video">
                      <iframe
                        src={`https://www.youtube.com/embed/${ytId}`}
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    </div>
                  ) : (
                    <div className="p-4">
                      <a href={recipe.video} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline underline-offset-2">
                        Videoyu aç →
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })()}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              {recipe.cupType && (
                <div>
                  <p className="text-xs text-muted-foreground">Bardak Tipi</p>
                  <p className="font-medium">{recipe.cupType}</p>
                </div>
              )}
              {recipe.cost != null && (
                <div>
                  <p className="text-xs text-muted-foreground">Maliyet</p>
                  <p className="font-medium">₺{Number(recipe.cost).toFixed(2)}</p>
                </div>
              )}
              {recipe.allergens.length > 0 && (
                <div>
                  <div className="flex items-center gap-1 text-orange-600 text-xs font-medium mb-1">
                    <AlertCircle className="w-3 h-3" />Alerjenler
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {recipe.allergens.map((a) => (
                      <Badge key={a} variant="warning" className="text-xs">{a}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {recipe.notes && (
                <div>
                  <p className="text-xs text-muted-foreground">Notlar</p>
                  <p className="text-sm mt-1">{recipe.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
