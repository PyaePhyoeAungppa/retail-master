"use client"

import { CustomerTable } from "@/components/customers/customer-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, UserPlus, Download, Loader2 } from "lucide-react"
import { useState } from "react"
import { CustomerModal } from "@/components/customers/customer-modal"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/store/use-auth-store"
import { Customer } from "@/lib/data"
import { useToastStore } from "@/store/use-toast-store"

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const { storeId } = useAuthStore()
  const { toast } = useToastStore()

  const { data: customers } = useQuery<Customer[]>({
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

  const handleExport = () => {
    if (!customers || customers.length === 0) {
      toast({
        title: "Export Failed",
        description: "No customer data available to export.",
        variant: "destructive"
      })
      return
    }

    // Prepare CSV data
    const headers = ["Name", "Email", "Phone", "Created At"]
    const csvRows = [
      headers.join(","),
      ...customers.map(c => [
        `"${c.name}"`,
        `"${c.email || ''}"`,
        `"${c.phone || ''}"`,
        `"${c.is_default ? 'Default' : ''}"`
      ].join(","))
    ].join("\n")

    // Create and download file
    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `retail-master-customers-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export Successful",
      description: "Customer list has been downloaded as CSV.",
      variant: "success"
    })
  }

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Customer Directory</h1>
          <p className="text-muted-foreground font-medium text-lg">Manage your customer base and track loyalty.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder="Search by name, email, or phone number..." 
            className="pl-12 h-14 bg-card border-none ring-1 ring-border rounded-2xl focus-visible:ring-primary shadow-sm text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="h-14 rounded-2xl border-2 flex gap-2 text-lg px-6"
            onClick={handleExport}
          >
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline">Export List</span>
          </Button>
          <Button 
            className="h-14 rounded-2xl flex gap-2 shadow-lg shadow-primary/20 bg-primary px-8 hover:scale-[1.02] active:scale-[0.98] transition-all text-lg font-bold"
            onClick={() => setModalOpen(true)}
          >
            <UserPlus className="w-5 h-5" />
            <span>Add Customer</span>
          </Button>
        </div>
      </div>

      <CustomerTable searchQuery={searchQuery} />

      <CustomerModal 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
      />
    </div>
  )
}
