import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastStore {
  toasts: ToastItem[];
  add: (message: string, type: ToastType) => void;
  dismiss: (id: number) => void;
}

const AUTO_DISMISS_MS = 4000;
let nextId = 1;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (message, type) => {
    const id = nextId++;
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    window.setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, AUTO_DISMISS_MS);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/**
 * Imperative toast API, callable from anywhere (including non-React modules such
 * as exportImage.ts and the shell action handlers). Replaces blocking alert().
 */
export const toast = {
  success: (message: string) => useToastStore.getState().add(message, "success"),
  error: (message: string) => useToastStore.getState().add(message, "error"),
  info: (message: string) => useToastStore.getState().add(message, "info"),
};
