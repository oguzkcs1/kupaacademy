"use client";

import { create } from "zustand";
import type {
  Training, Video, Recipe, Announcement, User, Badge,
  Category, TrainingCompletion, Notification, Document, DocumentFolder,
} from "@/types";
import type { Branch } from "@/types";
import { generateId } from "@/lib/utils";
import * as db from "@/lib/db";

export interface UserBadge {
  userId: string;
  badgeId: string;
  earnedAt: string;
}

interface DataState {
  // Data
  trainings: Training[];
  videos: Video[];
  recipes: Recipe[];
  announcements: Announcement[];
  users: User[];
  badges: Badge[];
  categories: Category[];
  branches: Branch[];
  completions: TrainingCompletion[];
  notifications: Notification[];
  userBadges: UserBadge[];
  documents: Document[];
  documentFolders: DocumentFolder[];

  // Hydration
  _loaded: boolean;
  loadAll: () => Promise<void>;

  // Training CRUD
  addTraining: (training: Training) => Promise<void>;
  updateTraining: (id: string, data: Partial<Training>) => Promise<void>;
  deleteTraining: (id: string) => Promise<void>;

  // Video CRUD
  addVideo: (video: Video) => Promise<void>;
  updateVideo: (id: string, data: Partial<Video>) => Promise<void>;
  deleteVideo: (id: string) => Promise<void>;

  // Recipe CRUD
  addRecipe: (recipe: Recipe) => Promise<void>;
  updateRecipe: (id: string, data: Partial<Recipe>) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;

  // Document CRUD
  addDocument: (doc: Document) => Promise<void>;
  updateDocument: (id: string, data: Partial<Document>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;

  // Document Folder CRUD
  addDocumentFolder: (folder: DocumentFolder) => Promise<void>;
  updateDocumentFolder: (id: string, data: Partial<DocumentFolder>) => Promise<void>;
  deleteDocumentFolder: (id: string) => Promise<void>;

  // Announcement CRUD
  addAnnouncement: (ann: Announcement) => Promise<void>;
  updateAnnouncement: (id: string, data: Partial<Announcement>) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;

  // User CRUD
  addUser: (user: User) => Promise<void>;
  updateUser: (id: string, data: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  // Category CRUD
  addCategory: (category: Category) => Promise<void>;
  updateCategory: (id: string, data: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Completion / Progress
  completeTraining: (userId: string, trainingId: string) => Promise<string[]>;
  isTrainingCompleted: (userId: string, trainingId: string) => boolean;
  getUserCompletions: (userId: string) => TrainingCompletion[];

  // Notifications
  addNotification: (n: Omit<Notification, "id" | "createdAt">) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: (userId: string) => Promise<void>;
  getUserNotifications: (userId: string) => Notification[];

  // User badges
  getUserBadges: (userId: string) => UserBadge[];
}

export const useDataStore = create<DataState>()((set, get) => ({
  trainings: [],
  videos: [],
  recipes: [],
  announcements: [],
  users: [],
  badges: [],
  categories: [],
  branches: [],
  completions: [],
  notifications: [],
  userBadges: [],
  documents: [],
  documentFolders: [],
  _loaded: false,

  loadAll: async () => {
    if (get()._loaded) return;
    const [
      trainings, videos, recipes, announcements, users,
      badges, categories, branches, documents, documentFolders,
    ] = await Promise.all([
      db.getTrainings(),
      db.getVideos(),
      db.getRecipes(),
      db.getAnnouncements(),
      db.getUsers(),
      db.getBadges(),
      db.getCategories(),
      db.getBranches(),
      db.getDocuments(),
      db.getDocumentFolders(),
    ]);
    set({
      trainings, videos, recipes, announcements, users,
      badges, categories, branches, documents, documentFolders,
      _loaded: true,
    });
  },

  // ── Training ────────────────────────────────────────────────────────────────
  addTraining: async (training) => {
    await db.upsertTraining(training);
    set((s) => ({ trainings: [training, ...s.trainings] }));
  },
  updateTraining: async (id, data) => {
    const updated = { ...get().trainings.find((t) => t.id === id)!, ...data, updatedAt: new Date().toISOString() };
    await db.upsertTraining(updated);
    set((s) => ({ trainings: s.trainings.map((t) => t.id === id ? updated : t) }));
  },
  deleteTraining: async (id) => {
    await db.deleteTraining(id);
    set((s) => ({ trainings: s.trainings.filter((t) => t.id !== id) }));
  },

  // ── Video ───────────────────────────────────────────────────────────────────
  addVideo: async (video) => {
    await db.upsertVideo(video);
    set((s) => ({ videos: [video, ...s.videos] }));
  },
  updateVideo: async (id, data) => {
    const updated = { ...get().videos.find((v) => v.id === id)!, ...data, updatedAt: new Date().toISOString() };
    await db.upsertVideo(updated);
    set((s) => ({ videos: s.videos.map((v) => v.id === id ? updated : v) }));
  },
  deleteVideo: async (id) => {
    await db.deleteVideo(id);
    set((s) => ({ videos: s.videos.filter((v) => v.id !== id) }));
  },

  // ── Recipe ──────────────────────────────────────────────────────────────────
  addRecipe: async (recipe) => {
    await db.upsertRecipe(recipe);
    set((s) => ({ recipes: [recipe, ...s.recipes] }));
  },
  updateRecipe: async (id, data) => {
    const updated = { ...get().recipes.find((r) => r.id === id)!, ...data, updatedAt: new Date().toISOString() };
    await db.upsertRecipe(updated);
    set((s) => ({ recipes: s.recipes.map((r) => r.id === id ? updated : r) }));
  },
  deleteRecipe: async (id) => {
    await db.deleteRecipe(id);
    set((s) => ({ recipes: s.recipes.filter((r) => r.id !== id) }));
  },

  // ── Announcement ────────────────────────────────────────────────────────────
  addAnnouncement: async (ann) => {
    await db.upsertAnnouncement(ann);
    set((s) => ({ announcements: [ann, ...s.announcements] }));
  },
  updateAnnouncement: async (id, data) => {
    const updated = { ...get().announcements.find((a) => a.id === id)!, ...data, updatedAt: new Date().toISOString() };
    await db.upsertAnnouncement(updated);
    set((s) => ({ announcements: s.announcements.map((a) => a.id === id ? updated : a) }));
  },
  deleteAnnouncement: async (id) => {
    await db.deleteAnnouncement(id);
    set((s) => ({ announcements: s.announcements.filter((a) => a.id !== id) }));
  },

  // ── User ────────────────────────────────────────────────────────────────────
  addUser: async (user) => {
    await db.upsertUser(user);
    set((s) => ({ users: [user, ...s.users] }));
  },
  updateUser: async (id, data) => {
    const updated = { ...get().users.find((u) => u.id === id)!, ...data };
    await db.upsertUser(updated);
    set((s) => ({ users: s.users.map((u) => u.id === id ? updated : u) }));
  },
  deleteUser: async (id) => {
    await db.deleteUser(id);
    set((s) => ({ users: s.users.filter((u) => u.id !== id) }));
  },

  // ── Category ────────────────────────────────────────────────────────────────
  addCategory: async (category) => {
    await db.upsertCategory(category);
    set((s) => ({ categories: [...s.categories, category] }));
  },
  updateCategory: async (id, data) => {
    const updated = { ...get().categories.find((c) => c.id === id)!, ...data };
    await db.upsertCategory(updated);
    set((s) => ({ categories: s.categories.map((c) => c.id === id ? updated : c) }));
  },
  deleteCategory: async (id) => {
    await db.deleteCategory(id);
    set((s) => ({ categories: s.categories.filter((c) => c.id !== id) }));
  },

  // ── Document ────────────────────────────────────────────────────────────────
  addDocument: async (doc) => {
    await db.upsertDocument(doc);
    set((s) => ({ documents: [doc, ...s.documents] }));
  },
  updateDocument: async (id, data) => {
    const updated = { ...get().documents.find((d) => d.id === id)!, ...data, updatedAt: new Date().toISOString() };
    await db.upsertDocument(updated);
    set((s) => ({ documents: s.documents.map((d) => d.id === id ? updated : d) }));
  },
  deleteDocument: async (id) => {
    await db.deleteDocument(id);
    set((s) => ({ documents: s.documents.filter((d) => d.id !== id) }));
  },

  // ── Document Folder ─────────────────────────────────────────────────────────
  addDocumentFolder: async (folder) => {
    await db.upsertDocumentFolder(folder);
    set((s) => ({ documentFolders: [...s.documentFolders, folder] }));
  },
  updateDocumentFolder: async (id, data) => {
    const updated = { ...get().documentFolders.find((f) => f.id === id)!, ...data };
    await db.upsertDocumentFolder(updated);
    set((s) => ({ documentFolders: s.documentFolders.map((f) => f.id === id ? updated : f) }));
  },
  deleteDocumentFolder: async (id) => {
    await db.deleteDocumentFolder(id);
    set((s) => ({ documentFolders: s.documentFolders.filter((f) => f.id !== id) }));
  },

  // ── Completion ──────────────────────────────────────────────────────────────
  completeTraining: async (userId, trainingId) => {
    const state = get();
    if (state.isTrainingCompleted(userId, trainingId)) return [];

    const completion: TrainingCompletion = {
      id: `comp-${generateId()}`,
      userId,
      trainingId,
      completedAt: new Date().toISOString(),
    };

    await db.insertCompletion(completion);
    set((s) => ({ completions: [...s.completions, completion] }));

    // Badge check
    const newState = get();
    const userCompletionCount = newState.completions.filter((c) => c.userId === userId).length;
    const newlyEarned: string[] = [];

    for (const badge of newState.badges) {
      const alreadyHas = newState.userBadges.some(
        (ub) => ub.userId === userId && ub.badgeId === badge.id
      );
      if (alreadyHas) continue;

      let earned = false;
      if (badge.condition.type === "specific_training" && badge.condition.value === trainingId) {
        earned = true;
      } else if (badge.condition.type === "training_count" && userCompletionCount >= Number(badge.condition.value)) {
        earned = true;
      }

      if (earned) {
        set((s) => ({
          userBadges: [...s.userBadges, { userId, badgeId: badge.id, earnedAt: new Date().toISOString() }],
        }));
        newlyEarned.push(badge.name);

        const notif: Notification = {
          id: `notif-${generateId()}`,
          userId,
          title: "Rozet Kazandın! 🏆",
          message: `"${badge.icon} ${badge.name}" rozetini kazandın!`,
          type: "system",
          read: false,
          createdAt: new Date().toISOString(),
        };
        await db.insertNotification(notif);
        set((s) => ({ notifications: [notif, ...s.notifications] }));
      }
    }

    const training = newState.trainings.find((t) => t.id === trainingId);
    if (training) {
      const notif: Notification = {
        id: `notif-${generateId()}`,
        userId,
        title: "Eğitim Tamamlandı ✅",
        message: `"${training.title}" eğitimini başarıyla tamamladın.`,
        type: "training",
        contentId: trainingId,
        read: false,
        createdAt: new Date().toISOString(),
      };
      await db.insertNotification(notif);
      set((s) => ({ notifications: [notif, ...s.notifications] }));
    }

    return newlyEarned;
  },

  isTrainingCompleted: (userId, trainingId) =>
    get().completions.some((c) => c.userId === userId && c.trainingId === trainingId),

  getUserCompletions: (userId) =>
    get().completions.filter((c) => c.userId === userId),

  // ── Notifications ───────────────────────────────────────────────────────────
  addNotification: async (n) => {
    const notif: Notification = {
      ...n,
      id: `notif-${generateId()}`,
      createdAt: new Date().toISOString(),
    };
    await db.insertNotification(notif);
    set((s) => ({ notifications: [notif, ...s.notifications] }));
  },
  markNotificationRead: async (id) => {
    await db.markNotificationRead(id);
    set((s) => ({
      notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n),
    }));
  },
  markAllNotificationsRead: async (userId) => {
    await db.markAllNotificationsRead(userId);
    set((s) => ({
      notifications: s.notifications.map((n) => n.userId === userId ? { ...n, read: true } : n),
    }));
  },
  getUserNotifications: (userId) =>
    get().notifications.filter((n) => n.userId === userId),

  getUserBadges: (userId) =>
    get().userBadges.filter((ub) => ub.userId === userId),
}));
