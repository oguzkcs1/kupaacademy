"use client";

import { create } from "zustand";
import type {
  ChecklistRun, ChecklistSection, ChecklistTemplate, ChecklistType,
  ItemScore, OpsPhoto, OpsTask,
} from "@/types/operations";
import { calculateRunScore } from "@/types/operations";
import { generateId } from "@/lib/utils";
import * as db from "@/lib/db";

interface OpsState {
  templates: ChecklistTemplate[];
  runs: ChecklistRun[];
  photos: OpsPhoto[];
  tasks: OpsTask[];

  _loaded: boolean;
  loadAll: () => Promise<void>;

  getTemplate: (type: ChecklistType) => ChecklistTemplate | undefined;
  getTodayRun: (branchId: string, type: ChecklistType) => ChecklistRun | undefined;

  startRun: (branchId: string, userId: string, type: ChecklistType) => Promise<ChecklistRun | undefined>;
  setItemScore: (runId: string, sectionId: string, itemId: string, score: ItemScore) => Promise<void>;
  /** Fotoğrafı Storage'a yükler ve run'a bağlar */
  addPhoto: (
    file: File | Blob,
    meta: { branchId: string; userId: string; runId: string; sectionId: string; categoryLabel: string }
  ) => Promise<void>;
  completeRun: (runId: string) => Promise<void>;
  approveRun: (runId: string, comment?: string) => Promise<void>;
  requestRevision: (runId: string, comment: string) => Promise<void>;

  addTask: (task: Omit<OpsTask, "id" | "createdAt" | "status">) => Promise<void>;
  toggleTask: (taskId: string) => Promise<void>;

  // Şablon yönetimi (admin)
  addSection: (type: ChecklistType, data: Omit<ChecklistSection, "id" | "items">) => Promise<void>;
  updateSection: (type: ChecklistType, sectionId: string, data: Partial<Omit<ChecklistSection, "id" | "items">>) => Promise<void>;
  deleteSection: (type: ChecklistType, sectionId: string) => Promise<void>;
  addTemplateItem: (type: ChecklistType, sectionId: string, label: string) => Promise<void>;
  updateTemplateItem: (type: ChecklistType, sectionId: string, itemId: string, label: string) => Promise<void>;
  deleteTemplateItem: (type: ChecklistType, sectionId: string, itemId: string) => Promise<void>;
}

/** Şablonu DB'ye yaz + state güncelle (paylaşılan yardımcı) */
async function persistTemplate(
  get: () => OpsState,
  set: (fn: (s: OpsState) => Partial<OpsState>) => void,
  type: ChecklistType,
  mutate: (t: ChecklistTemplate) => ChecklistTemplate
) {
  const current = get().templates.find((t) => t.type === type);
  if (!current) return;
  const updated = mutate(current);
  await db.upsertOpsTemplate(updated);
  set((s) => ({ templates: s.templates.map((t) => (t.type === type ? updated : t)) }));
}

export const useOpsStore = create<OpsState>()((set, get) => ({
  templates: [],
  runs: [],
  photos: [],
  tasks: [],
  _loaded: false,

  loadAll: async () => {
    if (get()._loaded) return;
    try {
      const [templates, runs, photos, tasks] = await Promise.all([
        db.getOpsTemplates(),
        db.getOpsRuns(),
        db.getOpsPhotos(),
        db.getOpsTasks(),
      ]);
      set({ templates, runs, photos, tasks, _loaded: true });
    } catch (err) {
      // Tablolar henüz oluşturulmadıysa (ops-schema.sql çalıştırılmadıysa)
      // uygulama çökmez; boş durumda kalır.
      console.error("[ops] loadAll error — ops-schema.sql çalıştırıldı mı?", err);
    }
  },

  getTemplate: (type) => get().templates.find((t) => t.type === type),

  getTodayRun: (branchId, type) => {
    const today = new Date().toISOString().slice(0, 10);
    return get().runs.find(
      (r) => r.branchId === branchId && r.type === type && r.date === today
    );
  },

  startRun: async (branchId, userId, type) => {
    const template = get().getTemplate(type);
    if (!template) return undefined;

    const existing = get().getTodayRun(branchId, type);
    if (existing) {
      if (existing.status === "pending") {
        const started: ChecklistRun = {
          ...existing,
          status: "in_progress",
          startedAt: new Date().toISOString(),
          userId,
        };
        await db.upsertOpsRun(started);
        set((s) => ({ runs: s.runs.map((r) => (r.id === existing.id ? started : r)) }));
        return started;
      }
      return existing;
    }

    const run: ChecklistRun = {
      id: `run-${generateId()}`,
      type,
      templateId: template.id,
      branchId,
      userId,
      date: new Date().toISOString().slice(0, 10),
      startedAt: new Date().toISOString(),
      status: "in_progress",
      sections: template.sections.map((sec) => ({
        sectionId: sec.id,
        items: sec.items.map((item) => ({ itemId: item.id, score: null })),
        photoIds: [],
      })),
    };
    await db.upsertOpsRun(run);
    set((s) => ({ runs: [run, ...s.runs] }));
    return run;
  },

  setItemScore: async (runId, sectionId, itemId, score) => {
    const run = get().runs.find((r) => r.id === runId);
    if (!run) return;
    const updated: ChecklistRun = {
      ...run,
      status: run.status === "pending" ? "in_progress" : run.status,
      sections: run.sections.map((sec) =>
        sec.sectionId === sectionId
          ? {
              ...sec,
              items: sec.items.map((i) => (i.itemId === itemId ? { ...i, score } : i)),
            }
          : sec
      ),
    };
    // Optimistik güncelleme (puanlama hızlı hissettirsin), sonra DB
    set((s) => ({ runs: s.runs.map((r) => (r.id === runId ? updated : r)) }));
    await db.upsertOpsRun(updated);
  },

  addPhoto: async (file, meta) => {
    // 1) Storage'a yükle
    const { url, path } = await db.uploadOpsPhoto(file, meta.branchId);
    // 2) Fotoğraf kaydı
    const photo: OpsPhoto = {
      id: `oph-${generateId()}`,
      url,
      storagePath: path,
      branchId: meta.branchId,
      userId: meta.userId,
      runId: meta.runId,
      sectionId: meta.sectionId,
      categoryLabel: meta.categoryLabel,
      takenAt: new Date().toISOString(),
    };
    await db.insertOpsPhoto(photo);

    // 3) Run'ın section.photoIds listesine ekle
    const run = get().runs.find((r) => r.id === meta.runId);
    if (run) {
      const updatedRun: ChecklistRun = {
        ...run,
        sections: run.sections.map((sec) =>
          sec.sectionId === meta.sectionId
            ? { ...sec, photoIds: [...sec.photoIds, photo.id] }
            : sec
        ),
      };
      await db.upsertOpsRun(updatedRun);
      set((s) => ({
        photos: [photo, ...s.photos],
        runs: s.runs.map((r) => (r.id === meta.runId ? updatedRun : r)),
      }));
    } else {
      set((s) => ({ photos: [photo, ...s.photos] }));
    }
  },

  completeRun: async (runId) => {
    const run = get().runs.find((r) => r.id === runId);
    if (!run) return;
    const updated: ChecklistRun = {
      ...run,
      status: "completed",
      completedAt: new Date().toISOString(),
    };
    await db.upsertOpsRun(updated);
    set((s) => ({ runs: s.runs.map((r) => (r.id === runId ? updated : r)) }));
  },

  approveRun: async (runId, comment) => {
    const run = get().runs.find((r) => r.id === runId);
    if (!run) return;
    const updated: ChecklistRun = {
      ...run,
      status: "approved",
      managerComment: comment ?? run.managerComment,
    };
    updated.score = calculateRunScore(updated);
    await db.upsertOpsRun(updated);
    set((s) => ({ runs: s.runs.map((r) => (r.id === runId ? updated : r)) }));
  },

  requestRevision: async (runId, comment) => {
    const run = get().runs.find((r) => r.id === runId);
    if (!run) return;
    const updated: ChecklistRun = { ...run, status: "revision", managerComment: comment };
    await db.upsertOpsRun(updated);
    set((s) => ({ runs: s.runs.map((r) => (r.id === runId ? updated : r)) }));
  },

  addTask: async (task) => {
    const full: OpsTask = {
      ...task,
      id: `otask-${generateId()}`,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    await db.upsertOpsTask(full);
    set((s) => ({ tasks: [full, ...s.tasks] }));
  },

  toggleTask: async (taskId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;
    const updated: OpsTask = {
      ...task,
      status: task.status === "pending" ? "completed" : "pending",
      completedAt: task.status === "pending" ? new Date().toISOString() : undefined,
    };
    await db.upsertOpsTask(updated);
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === taskId ? updated : t)) }));
  },

  // ── Şablon yönetimi ─────────────────────────────────────────────────────────
  addSection: async (type, data) => {
    await persistTemplate(get, set, type, (t) => ({
      ...t,
      sections: [...t.sections, { ...data, id: `sec-${generateId()}`, items: [] }],
    }));
  },

  updateSection: async (type, sectionId, data) => {
    await persistTemplate(get, set, type, (t) => ({
      ...t,
      sections: t.sections.map((sec) => (sec.id === sectionId ? { ...sec, ...data } : sec)),
    }));
  },

  deleteSection: async (type, sectionId) => {
    await persistTemplate(get, set, type, (t) => ({
      ...t,
      sections: t.sections.filter((sec) => sec.id !== sectionId),
    }));
  },

  addTemplateItem: async (type, sectionId, label) => {
    await persistTemplate(get, set, type, (t) => ({
      ...t,
      sections: t.sections.map((sec) =>
        sec.id === sectionId
          ? { ...sec, items: [...sec.items, { id: `item-${generateId()}`, label }] }
          : sec
      ),
    }));
  },

  updateTemplateItem: async (type, sectionId, itemId, label) => {
    await persistTemplate(get, set, type, (t) => ({
      ...t,
      sections: t.sections.map((sec) =>
        sec.id === sectionId
          ? { ...sec, items: sec.items.map((i) => (i.id === itemId ? { ...i, label } : i)) }
          : sec
      ),
    }));
  },

  deleteTemplateItem: async (type, sectionId, itemId) => {
    await persistTemplate(get, set, type, (t) => ({
      ...t,
      sections: t.sections.map((sec) =>
        sec.id === sectionId
          ? { ...sec, items: sec.items.filter((i) => i.id !== itemId) }
          : sec
      ),
    }));
  },
}));
