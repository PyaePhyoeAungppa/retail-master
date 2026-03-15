"use client"

import { Customer, Transaction } from "@/lib/data"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Loader2, User, Search, Edit2, Trash2, Star } from "lucide-react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { useState } from "react"
import { useAuthStore } from "@/store/use-auth-store"
import { CustomerModal } from "./customer-modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useToastStore } from "@/store/use-toast-store"
import { useCartStore } from "@/store/use-cart-store"

export function CustomerTable({ searchQuery = "" }: { searchQuery?: string }) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<{ id: string, name: string } | null>(null)
  const { storeId } = useAuthStore()
  const { toast } = useToastStore()
  const queryClient = useQueryClient()
  const { setCustomer, selectedCustomer: currentCartCustomer } = useCartStore()
  const [settingDefault, setSettingDefault] = useState<string | null>(null)

  const { data: customers, isLoading: custLoading } = useQuery<Customer[]>({
    queryKey: ['customers', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('store_id', storeId)
        .order('name')
      if (error) throw error
      return data
    },
    enabled: !!storeId
  })

  const { data: transactions, isLoading: txLoading } = useQuery<Transaction[]>({
    queryKey: ['transactions', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('store_id', storeId)
        .order('date', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!storeId
  })

  if (custLoading || txLoading) {
    return (
      <div className="h-64 flex items-center justify-center bg-card rounded-2xl border">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const getStats = (customerId: string) => {
    const customerTx = transactions?.filter(tx => tx.customerId === customerId && tx.status === 'completed') || []
    const totalSpend = customerTx.reduce((sum, tx) => sum + tx.total, 0)
    const visitCount = customerTx.length
    return { totalSpend, visitCount }
  }

  const handleSetDefault = async (customer: Customer) => {
    if (!storeId || settingDefault) return
    setSettingDefault(customer.id)

    try {
      // 1. Unset all other defaults for this store
      const { error: unsetError } = await supabase
        .from('customers')
        .update({ is_default: false })
        .eq('store_id', storeId)
        .neq('id', customer.id)
      
      if (unsetError) throw unsetError

      // 2. Set this one as default
      const { error: setError } = await supabase
        .from('customers')
        .update({ is_default: !customer.is_default })
        .eq('id', customer.id)

      if (setError) throw setError

      // 3. Update cart store if this is now/no longer the default
      if (!customer.is_default) {
        setCustomer(customer)
      } else if (currentCartCustomer?.id === customer.id) {
        setCustomer(null)
      }

      toast({
        title: !customer.is_default ? "Default Customer Set" : "Default Customer Removed",
        description: `"${customer.name}" status updated.`,
        variant: "success"
      })
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    } catch (error: any) {
      toast({
        title: "Action Failed",
        description: error.message || "Failed to update default status",
        variant: "destructive"
      })
    } finally {
      setSettingDefault(null)
    }
  }

  const handleDelete = async () => {
    if (!customerToDelete) return

    try {
      const { error } = await supabase.from('customers').delete().eq('id', customerToDelete.id)
      if (error) throw error
      toast({ 
        title: "Customer Deleted", 
        description: `"${customerToDelete.name}" has been removed.`,
        variant: "success" 
      })
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    } catch (error: any) {
      toast({ 
        title: "Deletion Failed", 
        description: error.message || "Failed to delete customer",
        variant: "destructive" 
      })
    }
  }

  const filteredCustomers = (customers || []).filter(customer => {
    const search = searchQuery.toLowerCase()
    return (
      customer.name.toLowerCase().includes(search) ||
      (customer.email?.toLowerCase().includes(search) || false) ||
      (customer.phone?.toLowerCase().includes(search) || false)
    )
  })

  return (
    <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead className="text-center">Visits</TableHead>
            <TableHead>Total Spend</TableHead>
            <TableHead className="text-center">Default</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCustomers.map((customer) => {
            const { totalSpend, visitCount } = getStats(customer.id)
            return (
              <TableRow key={customer.id} className="hover:bg-muted/30 transition-colors">
                <TableCell>
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <User className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold">{customer.name}</span>
                        <span className="text-[10px] text-muted-foreground font-medium truncate w-24 capitalize">{customer.email?.split('@')[0] || 'Member'}</span>
                      </div>
                   </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{customer.email || 'N/A'}</TableCell>
                <TableCell className="text-muted-foreground">{customer.phone || 'N/A'}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary" className="rounded-lg font-bold">
                    {visitCount}
                  </Badge>
                </TableCell>
                <TableCell className="font-black text-primary">
                  ${totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-center">
                  <button 
                    onClick={() => handleSetDefault(customer)}
                    disabled={settingDefault === customer.id}
                    className={`p-2 rounded-xl transition-all duration-300 ${
                      customer.is_default 
                        ? 'bg-yellow-500/10 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' 
                        : 'text-muted-foreground/30 hover:text-yellow-500/50 hover:bg-yellow-500/5'
                    }`}
                  >
                    {settingDefault === customer.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Star className={`w-5 h-5 ${customer.is_default ? 'fill-current' : ''}`} />
                    )}
                  </button>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                      onClick={() => {
                        setSelectedCustomer(customer)
                        setModalOpen(true)
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all"
                      onClick={() => {
                        setCustomerToDelete({ id: customer.id, name: customer.name })
                        setConfirmOpen(true)
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Link href={`/customers/${customer.id}`}>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <CustomerModal 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
        customer={selectedCustomer} 
      />

      <ConfirmDialog
        isOpen={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleDelete}
        title="Delete Customer"
        description={`Are you sure you want to delete "${customerToDelete?.name}"? All transaction history for this customer will be orphaned. This action cannot be undone.`}
      />
    </div>
  )
}
