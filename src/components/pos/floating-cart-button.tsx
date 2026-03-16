"use client"

import { ShoppingCart } from "lucide-react"
import { useCartStore } from "@/store/use-cart-store"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FloatingCartButtonProps {
  onClick: () => void
  className?: string
}

export function FloatingCartButton({ onClick, className }: FloatingCartButtonProps) {
  const { items, total } = useCartStore()
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0)

  if (itemCount === 0) return null

  return (
    <Button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 h-14 px-6 rounded-2xl shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 z-50 lg:hidden bg-primary hover:bg-primary/90 text-primary-foreground",
        className
      )}
    >
      <div className="relative">
        <ShoppingCart className="w-6 h-6" />
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-primary shadow-sm">
          {itemCount}
        </span>
      </div>
      <div className="flex flex-col items-start leading-none h-full justify-center border-l border-white/20 pl-4">
        <span className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">View Cart</span>
        <span className="text-lg font-black tracking-tighter">${total.toFixed(2)}</span>
      </div>
    </Button>
  )
}
