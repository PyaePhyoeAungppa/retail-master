"use client"

import { useState, useEffect } from "react"
import { Customer } from "@/lib/data"
import { supabase } from "@/lib/supabase"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, User, Mail, Phone, Star } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/store/use-auth-store"
import { useToastStore } from "@/store/use-toast-store"
import { useCartStore } from "@/store/use-cart-store"

interface CustomerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer?: Customer
}

export function CustomerModal({ open, onOpenChange, customer }: CustomerModalProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [isDefault, setIsDefault] = useState(false)
  const [loading, setLoading] = useState(false)
  const { storeId } = useAuthStore()
  const { toast } = useToastStore()
  const queryClient = useQueryClient()
  const { setCustomer } = useCartStore()

  useEffect(() => {
    if (customer) {
      setName(customer.name)
      setEmail(customer.email || "")
      setPhone(customer.phone || "")
      setIsDefault(customer.is_default || false)
    } else {
      setName("")
      setEmail("")
      setPhone("")
      setIsDefault(false)
    }
  }, [customer, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isDefault) {
        // Unset all other defaults for this store
        await supabase
          .from("customers")
          .update({ is_default: false })
          .eq("store_id", storeId)
          .neq("id", customer?.id || "temporary-id")
      }

      if (customer) {
        // Update existing customer
        const { error } = await supabase
          .from("customers")
          .update({ name, email, phone, is_default: isDefault })
          .eq("id", customer.id)
        
        if (error) throw error

        if (isDefault) {
          setCustomer({ ...customer, name, email, phone, is_default: isDefault })
        }

        toast({
          title: "Customer Updated",
          description: `"${name}" has been updated successfully.`,
          variant: "success"
        })
      } else {
        // Create new customer
        const { data, error } = await supabase
          .from("customers")
          .insert([{ name, email, phone, is_default: isDefault, store_id: storeId }])
          .select()
        
        if (error) throw error
        
        if (isDefault && data?.[0]) {
          setCustomer(data[0] as Customer)
        }

        toast({
          title: "Customer Created",
          description: `"${name}" has been added to your directory.`,
          variant: "success"
        })
      }

      queryClient.invalidateQueries({ queryKey: ["customers"] })
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
        <div className="p-8 bg-primary text-primary-foreground">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tighter flex items-center gap-3">
              <User className="w-8 h-8" />
              {customer ? "Edit Customer" : "Add Customer"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-primary-foreground/70 text-sm font-medium mt-2">
            {customer ? "Update your customer's information below." : "Enter the details for your new customer."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Full Name</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="John Doe"
                  className="h-14 pl-12 rounded-2xl border-2 focus-visible:ring-0 focus-visible:border-primary transition-all font-medium"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  className="h-14 pl-12 rounded-2xl border-2 focus-visible:ring-0 focus-visible:border-primary transition-all font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="phone"
                  placeholder="+1 (555) 000-0000"
                  className="h-14 pl-12 rounded-2xl border-2 focus-visible:ring-0 focus-visible:border-primary transition-all font-medium"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div 
              className="flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed border-muted hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all group"
              onClick={() => setIsDefault(!isDefault)}
            >
               <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isDefault ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/20' : 'bg-muted text-muted-foreground'}`}>
                  <Star className={`w-5 h-5 ${isDefault ? 'fill-current' : ''}`} />
               </div>
               <div className="flex-1">
                  <p className="text-sm font-bold group-hover:text-primary transition-colors">Set as Default Customer</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Automatic selection for new sales.</p>
               </div>
               <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isDefault ? 'border-primary bg-primary' : 'border-muted'}`}>
                  {isDefault && <div className="w-2 h-2 rounded-full bg-white animate-in zoom-in-50" />}
               </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="ghost"
              className="h-14 flex-1 rounded-2xl font-bold"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-14 flex-1 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                customer ? "Update" : "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
