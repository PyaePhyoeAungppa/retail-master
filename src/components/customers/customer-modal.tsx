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
import { Loader2, User, Mail, Phone } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/store/use-auth-store"
import { useToastStore } from "@/store/use-toast-store"

interface CustomerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer?: Customer
}

export function CustomerModal({ open, onOpenChange, customer }: CustomerModalProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const { storeId } = useAuthStore()
  const { toast } = useToastStore()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (customer) {
      setName(customer.name)
      setEmail(customer.email || "")
      setPhone(customer.phone || "")
    } else {
      setName("")
      setEmail("")
      setPhone("")
    }
  }, [customer, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (customer) {
        // Update existing customer
        const { error } = await supabase
          .from("customers")
          .update({ name, email, phone })
          .eq("id", customer.id)
        
        if (error) throw error
        toast({
          title: "Customer Updated",
          description: `"${name}" has been updated successfully.`,
          variant: "success"
        })
      } else {
        // Create new customer
        const { error } = await supabase
          .from("customers")
          .insert([{ name, email, phone, store_id: storeId }])
        
        if (error) throw error
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
