"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, GraduationCap, PlayCircle, FileText, ChefHat, FolderOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useDataStore } from "@/lib/data-store";
import { CONTENT_TYPE_LABELS } from "@/lib/utils";

type SearchResult = {
  id: string;
  title: string;
  type: "training" | "video" | "document" | "recipe";
  href: string;
  description?: string;
  image?: string;
};

const typeIcons = {
  training: GraduationCap,
  video: PlayCircle,
  document: FileText,
  recipe: ChefHat,
};

const typeColors = {
  training: "text-primary",
  video: "text-purple-500",
  document: "text-blue-500",
  recipe: "text-orange-500",
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const { trainings, videos, documents, recipes } = useDataStore();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase();
    const found: SearchResult[] = [];

    trainings
      .filter((t) => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q))
      .forEach((t) =>
        found.push({
          id: t.id,
          title: t.title,
          type: "training",
          href: `/trainings/${t.id}`,
          description: t.description,
          image: t.coverImage,
        })
      );

    videos
      .filter((v) => v.title.toLowerCase().includes(q))
      .forEach((v) =>
        found.push({
          id: v.id,
          title: v.title,
          type: "video",
          href: `/videos/${v.id}`,
          description: v.description,
          image: v.thumbnail,
        })
      );

    documents
      .filter((d) => d.status === "published" && (
        d.name.toLowerCase().includes(q) ||
        d.tags.some((tag) => tag.toLowerCase().includes(q))
      ))
      .forEach((d) =>
        found.push({
          id: d.id,
          title: d.name,
          type: "document",
          href: `/documents`,
          description: d.tags.join(", "),
        })
      );

    recipes
      .filter((r) => r.name.toLowerCase().includes(q))
      .forEach((r) =>
        found.push({
          id: r.id,
          title: r.name,
          type: "recipe",
          href: `/recipes/${r.id}`,
          description: r.description,
          image: r.photo,
        })
      );

    setResults(found);
  }, [query, trainings, videos, documents, recipes]);

  const typeLabel: Record<string, string> = {
    training: "Eğitim",
    video: "Video",
    document: "Doküman",
    recipe: "Reçete",
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Arama</h1>
        <p className="text-muted-foreground mt-1">
          Tüm içeriklerde eşzamanlı arama yapın
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Eğitim, video, doküman, reçete ara..."
          className="pl-12 h-12 text-base"
          autoFocus
        />
      </div>

      {query && (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            {results.length > 0
              ? `"${query}" için ${results.length} sonuç bulundu`
              : `"${query}" için sonuç bulunamadı`}
          </p>

          {results.length > 0 ? (
            <div className="space-y-2">
              {results.map((result) => {
                const Icon = typeIcons[result.type];
                return (
                  <Link key={`${result.type}-${result.id}`} href={result.href}>
                    <Card className="hover:shadow-md transition-all cursor-pointer group">
                      <CardContent className="p-4 flex items-center gap-4">
                        {result.image ? (
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            <img
                              src={result.image}
                              alt={result.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <Icon className={`w-6 h-6 ${typeColors[result.type]}`} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium group-hover:text-primary transition-colors truncate">
                            {result.title}
                          </p>
                          {result.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                              {result.description}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {typeLabel[result.type]}
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <FolderOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">Sonuç bulunamadı</p>
              <p className="text-sm text-muted-foreground mt-1">
                Farklı anahtar kelimeler deneyin
              </p>
            </div>
          )}
        </div>
      )}

      {!query && (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>Aramak istediğinizi yazın</p>
          <p className="text-sm mt-1">Eğitim, video, doküman ve reçetelerde aynı anda arama yapılır</p>
        </div>
      )}
    </div>
  );
}
