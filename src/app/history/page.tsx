
"use client"

import { TransactionList } from "@/components/history/transaction-list"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, Download, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function HistoryPage() {
  return (
    <div className="p-8 space-y-8 max-w-[1200px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Sales History</h1>
          <p className="text-muted-foreground">Review and manage all past transactions.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl flex gap-2 h-11 border-2">
            <CalendarIcon className="w-4 h-4" />
            Pick Date
          </Button>
          <Button variant="outline" className="rounded-xl flex gap-2 h-11 border-2">
            <Download className="w-4 h-4" />
            Report
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
         <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by Transaction ID or Customer..." 
              className="pl-10 h-12 bg-card border-none ring-1 ring-border rounded-xl focus-visible:ring-primary"
            />
         </div>
         <Button className="h-12 px-8 rounded-xl font-bold">Search</Button>
      </div>

      <TransactionList />
    </div>
  )
}
