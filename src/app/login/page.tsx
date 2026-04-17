
"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Lock, Mail, Loader2, Store } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError
      
      window.location.href = "/dashboard"
    } catch (err: any) {
      setError(err.message || "Failed to sign in")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-accent/5 p-4 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">

      <Card className="w-full max-w-md border-none shadow-[0_32px_128px_rgba(0,0,0,0.08)] rounded-[2.5rem] overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 p-8">
        <CardHeader className="p-0 pb-8 text-center space-y-4">
          <div className="mx-auto w-24 h-24 rounded-[1.5rem] bg-white flex items-center justify-center shadow-2xl shadow-black/5 rotate-3 border p-3 overflow-hidden">
            <img src="/logo.png" alt="Retail Master Logo" className="w-full h-full object-contain" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
              Retail Master
            </h1>
            <p className="text-sm font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">
              Premium POS System
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold animate-in shake-2">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="name@store.com"
                  className="h-14 pl-12 rounded-2xl border-2 focus-visible:ring-0 focus-visible:border-primary transition-all font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="h-14 pl-12 rounded-2xl border-2 focus-visible:ring-0 focus-visible:border-primary transition-all font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                "Launch POS Terminal"
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground font-medium pt-4">
              Protected by Enterprise Row-Level Security
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
