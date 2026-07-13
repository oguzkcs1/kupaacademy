"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Camera, MapPin, Tag, User as UserIcon, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useOpsStore } from "@/lib/ops-store";
import { useDataStore } from "@/lib/data-store";
import { mockBranches } from "@/lib/mock-data";
import type { OpsPhoto } from "@/types/operations";
import { formatRelativeTime } from "@/lib/utils";

export default function OpsGalleryPage() {
  const { photos } = useOpsStore();
  const { branches: dataBranches, users } = useDataStore();
  const branches = dataBranches.length > 0 ? dataBranches : mockBranches;

  const [branchFilter, setBranchFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [selected, setSelected] = useState<OpsPhoto | null>(null);

  const branchName = (id: string) => branches.find((b) => b.id === id)?.name ?? "Şube";
  const userName = (id: string) => users.find((u) => u.id === id)?.name ?? "Personel";

  const categories = useMemo(
    () => Array.from(new Set(photos.map((p) => p.categoryLabel))).sort(),
    [photos]
  );
  const photoUsers = useMemo(
    () => Array.from(new Set(photos.map((p) => p.userId))),
    [photos]
  );

  const filtered = [...photos]
    .filter((p) => branchFilter === "all" || p.branchId === branchFilter)
    .filter((p) => categoryFilter === "all" || p.categoryLabel === categoryFilter)
    .filter((p) => userFilter === "all" || p.userId === userFilter)
    .sort((a, b) => b.takenAt.localeCompare(a.takenAt));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-pink-100 dark:bg-pink-950/50 flex items-center justify-center">
          <Camera className="w-5 h-5 text-pink-600 dark:text-pink-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fotoğraf Galerisi</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} fotoğraf</p>
        </div>
      </div>

      {/* Filtreler */}
      <div className="flex gap-2 flex-wrap">
        <Select value={branchFilter} onValueChange={setBranchFilter}>
          <SelectTrigger className="w-44 bg-card"><SelectValue placeholder="Şube" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Şubeler</SelectItem>
            {branches.filter((b) => b.status === "active").map((b) => (
              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40 bg-card"><SelectValue placeholder="Kategori" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Kategoriler</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={userFilter} onValueChange={setUserFilter}>
          <SelectTrigger className="w-40 bg-card"><SelectValue placeholder="Personel" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Personel</SelectItem>
            {photoUsers.map((id) => (
              <SelectItem key={id} value={id}>{userName(id)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Camera className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">Filtrelere uygun fotoğraf bulunamadı</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map((p, i) => (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(i * 0.03, 0.4), duration: 0.25 }}
              onClick={() => setSelected(p)}
              className="group relative aspect-square rounded-xl overflow-hidden bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.url}
                alt={p.categoryLabel}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-left">
                <p className="text-white text-xs font-semibold truncate">{p.categoryLabel}</p>
                <p className="text-white/70 text-[11px] truncate">{branchName(p.branchId)}</p>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="sm:max-w-3xl p-0 overflow-hidden">
          {selected && (
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selected.url} alt={selected.categoryLabel} className="w-full max-h-[70vh] object-contain bg-black" />
              <div className="p-4 flex items-center gap-4 flex-wrap text-sm">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                  <Badge variant="secondary">{selected.categoryLabel}</Badge>
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />{branchName(selected.branchId)}
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <UserIcon className="w-3.5 h-3.5" />{userName(selected.userId)}
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(selected.takenAt).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" })}
                  <span className="text-muted-foreground/60">({formatRelativeTime(selected.takenAt)})</span>
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
