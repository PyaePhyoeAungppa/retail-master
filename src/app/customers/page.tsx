"use client"

import { CustomerTable } from "@/components/customers/customer-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, UserPlus, Download, Filter } from "lucide-react"
import { useState } from "react"
import { CustomerModal } from "@/components/customers/customer-modal"

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Customer Directory</h1>
          <p className="text-muted-foreground font-medium text-lg">Manage your customer base and track loyalty.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl flex gap-2 h-12 border-2 px-6">
            <Download className="w-4 h-4" />
            Export List
          </Button>
          <Button 
            className="rounded-xl h-12 flex gap-2 shadow-lg shadow-primary/20 bg-primary px-6 hover:scale-[1.02] active:scale-[0.98] transition-all"
            onClick={() => setModalOpen(true)}
          >
            <UserPlus className="w-4 h-4" />
            Add Customer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder="Search by name, email, or phone number..." 
            className="pl-12 h-14 bg-card border-none ring-1 ring-border rounded-2xl focus-visible:ring-primary shadow-sm text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-14 rounded-2xl border-2 flex gap-2 text-lg">
          <Filter className="w-5 h-5" />
          More Filters
        </Button>
      </div>

      <CustomerTable searchQuery={searchQuery} />

      <CustomerModal 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
      />
    </div>
  )
}
