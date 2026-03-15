import { create } from "zustand"

export type ToastVariant = "default" | "success" | "destructive"

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
}

interface ToastStore {
  toasts: Toast[]
  toast: (payload: Omit<Toast, "id">) => void
  dismiss: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  toast: (payload) => {
    const id = crypto.randomUUID()
    set((state) => ({
      toasts: [...state.toasts, { ...payload, id }],
    }))
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }))
    }, 5000)
  },
  dismiss: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },
}))
