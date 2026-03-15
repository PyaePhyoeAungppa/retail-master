
"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/use-auth-store"
import { Lock, Delete, ArrowLeft, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function LockScreen() {
  const { isLocked, unlock, currentUser } = useAuthStore()
  const [pin, setPin] = useState("")
  const [error, setError] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLocked) return
      
      if (e.key >= "0" && e.key <= "9") {
        handleKeyPress(e.key)
      } else if (e.key === "Backspace") {
        handleDelete()
      } else if (e.key === "Enter") {
        handleUnlock()
      } else if (e.key === "Escape") {
        setPin("")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isLocked, pin]) // Update listener when pin changes to handle correct state

  if (!mounted || !isLocked) return null

  const handleKeyPress = (num: string) => {
    if (pin.length < 8) { // Allow longer passwords if needed
      const newPin = pin + num
      setPin(newPin)
    }
  }

  const handleUnlock = () => {
    if (!unlock(pin)) {
      setError(true)
      setTimeout(() => {
        setError(false)
        setPin("")
      }, 600)
    }
  }

  const handleDelete = () => {
    setPin(pin.slice(0, -1))
  }

  return (
    <div className="fixed inset-0 z-[100] bg-white/30 backdrop-blur-3xl flex items-center justify-center animate-in fade-in duration-500 p-4">
      <div className={cn(
        "bg-white/40 shadow-[0_32px_128px_rgba(0,0,0,0.1)] rounded-[3rem] p-8 md:p-12 w-full max-w-sm border border-white/20 flex flex-col items-center gap-8 transition-transform duration-300",
        error && "animate-shake bg-red-500/10 border-red-500/20"
      )}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary ring-4 ring-primary/5">
            <Lock className="w-8 h-8" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-black tracking-tight">Terminal Locked</h2>
            <p className="text-muted-foreground text-sm font-medium">
              Logged in as <span className="text-foreground font-bold">{currentUser?.email || "Cashier"}</span>
            </p>
          </div>
        </div>

        {/* Password Dots */}
        <div className="h-4 flex gap-3">
          {pin.split("").map((_, i) => (
            <div 
              key={i} 
              className="w-3 h-3 rounded-full bg-primary shadow-[0_0_12px_rgba(var(--primary-rgb),0.5)] animate-in zoom-in" 
            />
          ))}
          {pin.length === 0 && <span className="text-muted-foreground/40 text-xs font-black tracking-widest uppercase">Enter Password</span>}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0"].map((btn) => (
            <button
              key={btn}
              onClick={() => btn === "C" ? setPin("") : handleKeyPress(btn)}
              className={cn(
                "h-14 rounded-2xl text-lg font-bold transition-all outline-none flex items-center justify-center",
                btn === "C" ? "text-muted-foreground hover:bg-white/80" : "bg-white/50 hover:bg-white hover:shadow-lg active:scale-95"
              )}
            >
              {btn}
            </button>
          ))}
          <button
            onClick={handleDelete}
            className="h-14 rounded-2xl flex items-center justify-center text-muted-foreground hover:bg-white/80 active:scale-95 transition-all"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

        <Button 
          className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 active:scale-95 transition-all"
          onClick={handleUnlock}
          disabled={pin.length === 0}
        >
          Unlock Terminal
        </Button>
      </div>
    </div>
  )
}
