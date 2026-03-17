"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/store/use-auth-store"
import { useToastStore } from "@/store/use-toast-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Store, Loader2, ArrowRight, Sparkles } from "lucide-react"

const BOUTIQUE_NAMES = [
  "Velvet & Vine",
  "Luxe Ledger",
  "Aura & Oak",
  "The Silk Road",
  "Midnight Muse",
  "Willow & West",
  "Gilded Garden",
  "Nordic Nomad",
  "Sage & Stone",
  "The Artisan's Atelier"
]

const TAGLINES = [
  "Curated Lifestyle Collective",
  "Modern Heritage Goods",
  "Bespoke Fashion & Home",
  "Timeless Design Studio",
  "Ethical Luxury Goods"
]

export default function SetupPage() {
  const router = useRouter()
  const { currentUser, setStoreId } = useAuthStore()
  const { toast } = useToastStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    address: ""
  })

  // Pick random placeholders on initial load (stable for the session)
  const [placeholders] = useState(() => ({
    name: BOUTIQUE_NAMES[Math.floor(Math.random() * BOUTIQUE_NAMES.length)],
    tagline: TAGLINES[Math.floor(Math.random() * TAGLINES.length)]
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return

    setLoading(true)
    try {
      if (!currentUser) throw new Error("No authenticated user found.")

      // 0. Ensure Profile exists with Admin role (to bypass potential RLS on stores)
      console.log("Step 0: Ensuring admin profile exists...")
      const { error: initialProfileError } = await supabase
        .from('profiles')
        .upsert({ 
          id: currentUser.id, 
          role: 'admin'
        })
      
      if (initialProfileError) {
        console.warn("Initial profile upsert warned/failed (might be blocked by RLS too):", initialProfileError)
      }

      // 1. Create Store
      console.log("Step 1: Creating store...")
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .insert([{
          name: formData.name,
          address: formData.address,
          brand: formData.brand
        }])
        .select()
        .single()

      if (storeError) {
        console.error("Store creation error:", storeError)
        throw new Error(`Store creation failed: ${storeError.message}`)
      }
      console.log("Store created successfully:", store)

      // 2. Create Default Terminal (Required for shifts)
      console.log("Step 2: Creating default terminal...")
      // MUST be unique table-wide according to schema
      const terminalCode = `TERM-01-${store.id.split('-')[0].toUpperCase()}`
      const { data: terminal, error: terminalError } = await supabase
        .from('terminals')
        .insert([{
          store_id: store.id,
          name: "Terminal 01",
          code: terminalCode,
          is_active: true
        }])
        .select()
        .single()

      if (terminalError) {
        console.error("Terminal creation error:", terminalError)
        // Cleanup store if terminal fails? (Optional but good)
        throw new Error(`Terminal creation failed: ${terminalError.message}`)
      }
      console.log("Terminal created successfully:", terminal)

      // 3. Create Default Category
      console.log("Step 3: Creating default category...")
      // MUST be unique table-wide according to schema
      const categoryName = `General (${store.id.split('-')[0].toUpperCase()})`
      const { error: categoryError } = await supabase
        .from('categories')
        .insert([{
          store_id: store.id,
          name: categoryName
        }])

      if (categoryError) {
        console.error("Category creation error:", categoryError)
        throw new Error(`Category creation failed: ${categoryError.message}`)
      }
      console.log("Category created successfully")

      // 4. Update User Profile with Store ID
      console.log("Step 4: Linking store to profile...")
      const { error: finalProfileError } = await supabase
        .from('profiles')
        .update({ 
          store_id: store.id,
          role: 'admin'
        })
        .eq('id', currentUser.id)

      if (finalProfileError) {
        console.error("Final profile update error:", finalProfileError)
        throw new Error(`Failed to link store to your profile: ${finalProfileError.message}`)
      }
      console.log("Profile updated successfully")

      // 5. Update local store state
      console.log("Step 5: Synchronizing local auth state...")
      setStoreId(store.id)
      // Force profile loaded to true if it wasn't already
      useAuthStore.getState().setProfileLoaded(true)

      toast({
        title: "Setup Successful!",
        description: `Welcome to ${formData.name}. Redirecting to your dashboard...`,
        variant: "success"
      })

      // Wait for state to propagate
      setTimeout(() => {
        console.log("Finalizing: Redirecting to dashboard")
        router.push("/dashboard")
      }, 1000)
    } catch (error: any) {
      console.error("Detailed Setup failure:", error)
      const errorMsg = error.message || (typeof error === 'object' ? JSON.stringify(error) : String(error))
      toast({
        title: "Setup Failed",
        description: errorMsg.includes("{}") ? "Database connection issue or RLS policy violation. Check console." : errorMsg,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-accent/5 overflow-hidden">
      {/* Minimal Dynamic Header */}
      <header className="w-full h-16 border-b bg-white/50 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
             <Store className="w-4 h-4" />
          </div>
          <p className="font-black tracking-tight text-sm uppercase transition-all duration-500">
            {formData.name || "Configure New Store"}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10">
           <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Business Setup In Progress</span>
        </div>
      </header>

      <div className="flex-1 w-full flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-[550px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-primary/10 mb-2">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-black tracking-tight">Retail Master</h1>
            <p className="text-muted-foreground font-medium">Let's set up your store workspace in seconds.</p>
          </div>

          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-2xl">
            <CardHeader className="p-8 pb-0">
              <CardTitle className="text-xl flex items-center gap-3">
                Store Setup
              </CardTitle>
              <CardDescription className="text-muted-foreground font-medium">
                Configure your store details for receipts and management.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Store Name</Label>
                  <Input 
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={`e.g. ${placeholders.name}`} 
                    className="h-14 rounded-2xl bg-white border-none ring-1 ring-black/5 focus-visible:ring-primary px-5 shadow-sm text-lg" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Brand / Tagline</Label>
                  <Input 
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder={`e.g. ${placeholders.tagline}`} 
                    className="h-14 rounded-2xl bg-white border-none ring-1 ring-black/5 focus-visible:ring-primary px-5 shadow-sm" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Physical Address</Label>
                  <Input 
                    id="address"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Retail Ave, Shopville, ST 12345" 
                    className="h-14 rounded-2xl bg-white border-none ring-1 ring-black/5 focus-visible:ring-primary px-5 shadow-sm" 
                  />
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-14 rounded-2xl text-lg font-black shadow-xl shadow-primary/20 flex gap-2 active:scale-95 transition-all"
                  >
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                      Initialize Store
                      <ArrowRight className="w-5 h-5 ml-1" />
                    </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="text-center text-[10px] text-muted-foreground font-medium flex items-center justify-center gap-2">
             <div className="h-px bg-muted flex-1" />
             AI-POWERED STORE INITIALIZATION
             <div className="h-px bg-muted flex-1" />
          </div>
        </div>
      </div>
    </div>
  )
}
