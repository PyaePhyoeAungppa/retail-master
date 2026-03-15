"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/store/use-auth-store"
import { useToastStore } from "@/store/use-toast-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Moon, Sun, Monitor, Bell, Shield, Store, Loader2, Save } from "lucide-react"

export default function SettingsPage() {
  const { storeId } = useAuthStore()
  const { toast } = useToastStore()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    address: ""
  })

  const { data: store, isLoading } = useQuery({
    queryKey: ['store', storeId],
    queryFn: async () => {
      if (!storeId) return null
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!storeId
  })

  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name || "",
        brand: store.brand || "",
        address: store.address || ""
      })
    }
  }, [store])

  const mutation = useMutation({
    mutationFn: async (updatedData: any) => {
      const { data, error } = await supabase
        .from('stores')
        .update(updatedData)
        .eq('id', storeId)
        .select()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store', storeId] })
      queryClient.invalidateQueries({ queryKey: ['settings'] }) // Invalidate nav cache too
      toast({
        title: "Settings Saved",
        description: "Your store information has been updated successfully.",
        variant: "success"
      })
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Could not save settings. Please try again.",
        variant: "destructive"
      })
    }
  })

  const handleSave = () => {
    mutation.mutate(formData)
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-[50vh]">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-12 h-12 bg-primary/20 rounded-full" />
          <p className="text-muted-foreground font-medium">Loading settings...</p>
        </div>
      </div>
    )
  }
  return (
    <div className="p-8 space-y-8 max-w-[1000px] mx-auto">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Global configuration for your POS system.</p>
      </div>

      <div className="grid gap-8">
        <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-lg flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              Store Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Store Name</Label>
                  <Input 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Main Street Boutique" 
                    className="h-12 rounded-xl bg-white/50 border-none ring-1 ring-black/5 focus-visible:ring-primary h-12 px-4 shadow-sm" 
                  />
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Brand/Tagline</Label>
                  <Input 
                    value={formData.brand} 
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Flagship Store" 
                    className="h-12 rounded-xl bg-white/50 border-none ring-1 ring-black/5 focus-visible:ring-primary h-12 px-4 shadow-sm" 
                  />
               </div>
            </div>
            <div className="space-y-2">
               <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Physical Address</Label>
               <Input 
                value={formData.address} 
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Retail Ave, Shopville, ST 12345" 
                className="h-12 rounded-xl bg-white/50 border-none ring-1 ring-black/5 focus-visible:ring-primary h-12 px-4 shadow-sm" 
               />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-lg flex items-center gap-2">
              <Monitor className="w-5 h-5 text-primary" />
              Interface Preference
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
             <div className="flex items-center justify-between">
                <div className="space-y-1">
                   <p className="font-bold">Display Theme</p>
                   <p className="text-sm text-muted-foreground">Change the appearance of the POS interface.</p>
                </div>
                <div className="flex bg-muted p-1 rounded-xl">
                   <Button variant="ghost" className="rounded-lg h-9 w-9 p-0 bg-white shadow-sm">
                      <Sun className="w-4 h-4" />
                   </Button>
                   <Button variant="ghost" className="rounded-lg h-9 w-9 p-0 text-muted-foreground">
                      <Moon className="w-4 h-4" />
                   </Button>
                   <Button variant="ghost" className="rounded-lg h-9 w-9 p-0 text-muted-foreground">
                      <Monitor className="w-4 h-4" />
                   </Button>
                </div>
             </div>
             <Separator />
             <div className="flex items-center justify-between">
                <div className="space-y-1">
                   <p className="font-bold">Notifications</p>
                   <p className="text-sm text-muted-foreground">Manage sound and visual alerts for transactions.</p>
                </div>
                <Button variant="outline" className="rounded-xl">Configure Alerts</Button>
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-3 pt-4">
         <Button 
          variant="ghost" 
          className="rounded-xl h-12 px-6 font-bold"
          onClick={() => store && setFormData({
            name: store.name || "",
            brand: store.brand || "",
            address: store.address || ""
          })}
         >
          Discard Changes
         </Button>
         <Button 
          className="rounded-xl h-12 px-10 font-black shadow-xl shadow-primary/20 flex gap-2 active:scale-95 transition-all"
          onClick={handleSave}
          disabled={mutation.isPending}
         >
          {mutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Configuration
            </>
          )}
         </Button>
      </div>
    </div>
  )
}
