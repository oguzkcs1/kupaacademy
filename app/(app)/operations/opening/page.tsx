"use client";

import { Sunrise } from "lucide-react";
import { ChecklistRunner } from "@/components/operations/checklist-runner";

export default function OpeningChecklistPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center">
          <Sunrise className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Açılış Kontrolü</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Güne başlamadan önce tüm kategorileri kontrol edin
          </p>
        </div>
      </div>
      <ChecklistRunner type="opening" />
    </div>
  );
}
