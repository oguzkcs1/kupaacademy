"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  GraduationCap,
  MoreHorizontal,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDataStore } from "@/lib/data-store";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { Training } from "@/types";
import { motion } from "framer-motion";

const statusConfig = {
  published: { label: "Yayında", variant: "success" as const },
  draft: { label: "Taslak", variant: "secondary" as const },
  archived: { label: "Arşiv", variant: "outline" as const },
};

export default function AdminTrainingsPage() {
  const { trainings, deleteTraining, updateTraining } = useDataStore();
  const [search, setSearch] = useState("");

  const filtered = trainings.filter(
    (t) => !search || t.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    deleteTraining(id);
    toast.success("Eğitim silindi");
  };

  const handleToggleStatus = (id: string, current: string) => {
    updateTraining(id, { status: current === "published" ? "draft" : "published" });
    toast.success("Durum güncellendi");
  };

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Eğitim Yönetimi</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {trainings.filter((t) => t.status === "published").length} yayında · {trainings.filter((t) => t.status === "draft").length} taslak
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/trainings/new"><Plus className="w-4 h-4" />Yeni Eğitim</Link>
        </Button>
      </motion.div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input placeholder="Eğitim ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {filtered.map((training) => {
              const status = statusConfig[training.status];
              return (
                <div
                  key={training.id}
                  className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="w-14 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    {training.coverImage ? (
                      <img
                        src={training.coverImage}
                        alt={training.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{training.title}</p>
                      <Badge variant={status.variant} className="shrink-0 text-xs">
                        {status.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {training.category && <span>{training.category.name}</span>}
                      {training.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {training.duration} dk
                        </span>
                      )}
                      <span>Güncelleme: {formatDate(training.updatedAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/trainings/${training.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Görüntüle
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/trainings/${training.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Düzenle
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(training.id, training.status)}>
                        {training.status === "published" ? (
                          <>
                            <EyeOff className="mr-2 h-4 w-4" />
                            Taslağa Al
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            Yayınla
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(training.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Sil
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <GraduationCap className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>Eğitim bulunamadı</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
