"use client"

import { useToastStore, ToastVariant } from "@/store/use-toast-store"
import { CheckCircle2, AlertCircle, X, Info } from "lucide-react"
import { cn } from "@/lib/utils"

export function ToastContainer() {
  const { toasts, dismiss } = useToastStore()

  return (
    <div className="fixed bottom-0 right-0 z-[100] p-4 md:p-6 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onDismiss }: { toast: any, onDismiss: () => void }) {
  const getIcon = (variant?: ToastVariant) => {
    switch (variant) {
      case "success": return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case "destructive": return <AlertCircle className="w-5 h-5 text-destructive" />
      default: return <Info className="w-5 h-5 text-primary" />
    }
  }

  return (
    <div 
      className={cn(
        "pointer-events-auto relative group flex gap-3 p-4 rounded-2xl border bg-white/80 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-right-4 duration-300",
        toast.variant === "destructive" ? "border-destructive/20" : "border-black/5"
      )}
    >
      <div className="shrink-0 pt-0.5">
        {getIcon(toast.variant)}
      </div>
      <div className="flex-1 flex flex-col gap-1">
        {toast.title && <h3 className="font-bold text-sm tracking-tight">{toast.title}</h3>}
        {toast.description && <p className="text-xs text-muted-foreground font-medium leading-relaxed">{toast.description}</p>}
      </div>
      <button 
        onClick={onDismiss}
        className="shrink-0 h-6 w-6 flex items-center justify-center rounded-lg hover:bg-black/5 opacity-0 group-hover:opacity-100 transition-all"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
