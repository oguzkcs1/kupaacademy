"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Filter, GraduationCap, Clock, Tag, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/lib/store";
import { useDataStore } from "@/lib/data-store";
import type { Training } from "@/types";
import { cn } from "@/lib/utils";

function TrainingCard({ training }: { training: Training }) {
  const completionPercentage: number = 0; // Would come from user progress

  return (
    <Link href={`/trainings/${training.id}`}>
      <Card className="overflow-hidden hover:shadow-md transition-all duration-200 group cursor-pointer h-full">
        <div className="relative h-40 bg-muted overflow-hidden">
          {training.coverImage ? (
            <img
              src={training.coverImage}
              alt={training.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <GraduationCap className="w-12 h-12 text-muted-foreground/30" />
            </div>
          )}
          {training.status === "draft" && (
            <div className="absolute top-2 right-2">
              <Badge variant="secondary">Taslak</Badge>
            </div>
          )}
          {completionPercentage === 100 && (
            <div className="absolute top-2 right-2">
              <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            </div>
          )}
        </div>
        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
              {training.title}
            </h3>
            {training.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {training.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {training.category && (
              <Badge variant="outline" className="text-xs font-normal">
                {training.category.name}
              </Badge>
            )}
            {training.duration && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {training.duration} dk
              </span>
            )}
          </div>

          {completionPercentage > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>İlerleme</span>
                <span>%{completionPercentage}</span>
              </div>
              <Progress value={completionPercentage} className="h-1.5" />
            </div>
          )}

          {training.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {training.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export default function TrainingsPage() {
  const { user } = useAuthStore();
  const { trainings, categories } = useDataStore();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const isAdmin = user?.role === "admin";

  const filtered = trainings.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedCategory && t.categoryId !== selectedCategory) return false;
    return true;
  });

  const trainingCategories = categories.filter((c) => c.type === "training");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Eğitimler</h1>
          <p className="text-muted-foreground mt-1">
            {filtered.length} eğitim bulundu
          </p>
        </div>
        {isAdmin && (
          <Button asChild>
            <Link href="/admin/trainings/new">
              <Plus className="w-4 h-4" />
              Yeni Eğitim
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Eğitim ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            Tümü
          </Button>
          {trainingCategories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((training) => (
            <TrainingCard key={training.id} training={training} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <GraduationCap className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Eğitim bulunamadı</p>
        </div>
      )}
    </div>
  );
}
