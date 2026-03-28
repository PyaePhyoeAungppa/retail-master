
"use client"

import { OrderList } from "@/components/orders/order-list"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<'pending' | 'completed' | 'all'>('pending')
  const [inputValue, setInputValue] = useState("")

  return (
    <div className="p-8 space-y-8 max-w-[1200px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Orders Management</h1>
          <p className="text-muted-foreground">Manage pending customer orders and online requests.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant={activeFilter === 'all' ? 'default' : 'outline'} 
            className="rounded-xl flex gap-2 h-11 border-2"
            onClick={() => setActiveFilter(activeFilter === 'all' ? 'pending' : 'all')}
          >
            <Filter className="w-4 h-4" />
            {activeFilter === 'all' ? 'Show All' : 'Filter: Pending'}
          </Button>
          <Button 
            variant={activeFilter === 'completed' ? 'default' : 'outline'}
            className="rounded-xl flex gap-2 h-11 border-2"
            onClick={() => setActiveFilter(activeFilter === 'completed' ? 'pending' : 'completed')}
          >
            <ShoppingBag className="w-4 h-4" />
            {activeFilter === 'completed' ? 'Completed' : 'View Completed'}
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
         <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by Order ID or Customer..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setSearchQuery(inputValue)}
              className="pl-10 h-12 bg-card border-none ring-1 ring-border rounded-xl focus-visible:ring-primary"
            />
         </div>
         <Button 
           className="h-12 px-8 rounded-xl font-bold"
           onClick={() => setSearchQuery(inputValue)}
         >
           Search
         </Button>
      </div>

      <OrderList searchQuery={searchQuery} activeFilter={activeFilter} />
    </div>
  )
}
