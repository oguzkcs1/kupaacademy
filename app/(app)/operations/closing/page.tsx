"use client";

import { Sunset } from "lucide-react";
import { ChecklistRunner } from "@/components/operations/checklist-runner";

export default function ClosingChecklistPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-violet-100 dark:bg-violet-950/50 flex items-center justify-center">
          <Sunset className="w-5 h-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kapanış Kontrolü</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Günü kapatmadan önce tüm kategorileri kontrol edin
          </p>
        </div>
      </div>
      <ChecklistRunner type="closing" />
    </div>
  );
}
