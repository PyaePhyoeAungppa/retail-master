"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/store/use-auth-store"
import { useCurrency } from "@/hooks/use-currency"
import { 
  BarChart3, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Calendar,
  Users,
  TrendingUp,
  DollarSign,
  ArrowRight,
  Package,
  Layers,
  Search,
  ChevronRight,
  Filter,
  ArrowLeft,
  Building,
  Clock
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format, subDays, startOfDay, endOfDay } from "date-fns"
import { exportToExcel, exportToPDF } from "@/lib/export-utils"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from "recharts"

type ReportType = 'gallery' | 'summary' | 'details' | 'top-items' | 'top-categories' | 'shift-sales'

export default function ReportsPage() {
  const { storeId: authStoreId, role, currentUser, accessibleStores } = useAuthStore()
  const currency = useCurrency()
  const [selectedStoreId, setSelectedStoreId] = useState(authStoreId)
  const [activeReport, setActiveReport] = useState<ReportType>('gallery')
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'all' | 'custom'>('7d')
  const [customStart, setCustomStart] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'))
  const [customEnd, setCustomEnd] = useState(format(new Date(), 'yyyy-MM-dd'))

  // No longer fetching stores globally; using accessibleStores from authStore

  // Core Data Fetch - Transactions
  const { data: transactions, isLoading: txLoading } = useQuery({
    queryKey: ['reports-data', selectedStoreId, dateRange, customStart, customEnd],
    queryFn: async () => {
      if (!selectedStoreId) return []
      let query = supabase.from('transactions').select('*, customers(name)').eq('store_id', selectedStoreId)
      
      // Data Isolation for Customers
      if (role === 'customer' && currentUser?.id) {
        query = query.eq('customer_id', currentUser.id)
      }
      
      if (dateRange === '7d') {
        query = query.gte('date', format(subDays(new Date(), 7), 'yyyy-MM-dd'))
      } else if (dateRange === '30d') {
        query = query.gte('date', format(subDays(new Date(), 30), 'yyyy-MM-dd'))
      } else if (dateRange === 'custom') {
        query = query.gte('date', customStart).lte('date', `${customEnd}T23:59:59`)
      }
      
      const { data, error } = await query.order('date', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!selectedStoreId
  })

  // Item Data Fetch (For Top Items/Categories)
  const { data: transactionItems, isLoading: itemsLoading } = useQuery({
    queryKey: ['reports-items', selectedStoreId, dateRange, customStart, customEnd],
    queryFn: async () => {
      if (!selectedStoreId) return []
      // First get IDs of transactions in range
      let txQuery = supabase.from('transactions').select('id').eq('store_id', selectedStoreId)
      
      // Data Isolation for Customers
      if (role === 'customer' && currentUser?.id) {
        txQuery = txQuery.eq('customer_id', currentUser.id)
      }
      if (dateRange === '7d') txQuery = txQuery.gte('date', format(subDays(new Date(), 7), 'yyyy-MM-dd'))
      else if (dateRange === '30d') txQuery = txQuery.gte('date', format(subDays(new Date(), 30), 'yyyy-MM-dd'))
      else if (dateRange === 'custom') txQuery = txQuery.gte('date', customStart).lte('date', `${customEnd}T23:59:59`)
      
      const { data: txIds } = await txQuery
      if (!txIds || txIds.length === 0) return []

      const ids = txIds.map(t => t.id)
      const { data, error } = await supabase
        .from('transaction_items')
        .select('name, productId, quantity, subtotal, price, transactionId, products(category)')
        .in('transactionId', ids)

      if (error) throw error
      return data
    },
    enabled: !!selectedStoreId && (activeReport === 'top-items' || activeReport === 'top-categories' || activeReport === 'details' || activeReport === 'summary')
  })

  // Shifts Data Fetch (For Shift Sales)
  const { data: shifts } = useQuery({
    queryKey: ['reports-shifts', selectedStoreId, dateRange, customStart, customEnd],
    queryFn: async () => {
      if (!selectedStoreId) return []
      let query = supabase.from('active_shifts')
        .select('*')
        .eq('store_id', selectedStoreId)
        .is('terminal_id', null) // ONLY FETCH MASTER SHIFTS FOR THE REPORT LIST
      
      if (dateRange === '7d') query = query.gte('start_time', format(subDays(new Date(), 7), 'yyyy-MM-dd'))
      else if (dateRange === '30d') query = query.gte('start_time', format(subDays(new Date(), 30), 'yyyy-MM-dd'))
      else if (dateRange === 'custom') query = query.gte('start_time', customStart).lte('start_time', `${customEnd}T23:59:59`)
      
      const { data, error } = await query.order('start_time', { ascending: false })
      if (error) throw error
      
      // Also fetch all sessions for these shifts to help with aggregation
      const { data: allSessions } = await supabase
        .from('active_shifts')
        .select('id, parent_shift_id')
        .eq('store_id', selectedStoreId)
        .not('terminal_id', 'is', null)

      return data.map((m: any) => ({
        ...m,
        sessionIds: allSessions?.filter(s => s.parent_shift_id === m.id).map(s => s.id) || []
      }))
    },
    enabled: !!selectedStoreId && activeReport === 'shift-sales'
  })

  // Analytics Computations
  const currentStoreName = useMemo(() => {
    return accessibleStores.find(s => s.id === selectedStoreId)?.name || 'Store'
  }, [accessibleStores, selectedStoreId])

  const summaryStats = useMemo(() => {
    if (!transactions) return { total: 0, count: 0, tax: 0, net: 0, aov: 0, units: 0 }
    const stats = transactions.reduce((acc, tx) => {
      if (tx.status === 'completed') {
        acc.total += Number(tx.total || 0)
        acc.tax += Number(tx.tax || 0)
        acc.net += Number(tx.subtotal || 0)
        acc.count++
        acc.units += Number(tx.itemsCount || 0)
      }
      return acc
    }, { total: 0, count: 0, tax: 0, net: 0, aov: 0, units: 0 })
    
    stats.aov = stats.count > 0 ? stats.total / stats.count : 0
    return stats
  }, [transactions])

  const topItems = useMemo(() => {
    if (!transactionItems) return []
    const map = new Map()
    transactionItems.forEach(item => {
      const existing = map.get(item.productId) || { name: item.name, qty: 0, rev: 0 }
      map.set(item.productId, {
        ...existing,
        qty: existing.qty + (item.quantity || 0),
        rev: existing.rev + (item.subtotal || 0)
      })
    })
    return Array.from(map.values()).sort((a, b) => b.rev - a.rev).slice(0, 10)
  }, [transactionItems])

  const insights = useMemo(() => {
    if (!transactions || transactions.length === 0) return null
    
    // Top Customer
    const custMap = new Map<string, number>()
    transactions.forEach(tx => {
      if (!tx.customerId || tx.customerId.includes('walk-in')) return
      const cur = custMap.get(tx.customerName) || 0
      custMap.set(tx.customerName, cur + Number(tx.total))
    })
    const topCust = Array.from(custMap.entries()).sort((a,b) => b[1] - a[1])[0]

    // Peak Hour
    const hourMap = new Map<number, number>()
    transactions.forEach(tx => {
      const hour = new Date(tx.date).getHours()
      hourMap.set(hour, (hourMap.get(hour) || 0) + 1)
    })
    const peakHour = Array.from(hourMap.entries()).sort((a,b) => b[1] - a[1])[0]

    return {
      topCustomer: topCust ? { name: topCust[0], val: topCust[1] } : null,
      peakHour: peakHour ? { hour: peakHour[0], count: peakHour[1] } : null,
      bestPerformingProduct: topItems[0] || null
    }
  }, [transactions, topItems])

  const topCategories = useMemo(() => {
    if (!transactionItems) return []
    const map = new Map()
    transactionItems.forEach((item: any) => {
      const cat = item.products?.category || 'Uncategorized'
      const existing = map.get(cat) || { name: cat, rev: 0 }
      map.set(cat, {
        ...existing,
        rev: existing.rev + (item.subtotal || 0)
      })
    })
    return Array.from(map.values()).sort((a, b) => b.rev - a.rev)
  }, [transactionItems])

  const shiftSalesData = useMemo(() => {
    if (!shifts || !transactions) return []
    return shifts.map((shift: any) => {
      // Find all transactions either linked directly to master or to any of its sessions
      const shiftTxs = transactions.filter(tx => 
        tx.shift_id === shift.id || shift.sessionIds.includes(tx.shift_id)
      )
      
      const completedTxs = shiftTxs.filter(tx => tx.status === 'completed')
      const total = completedTxs.reduce((sum, tx) => sum + Number(tx.total), 0)
      
      const cashTotal = completedTxs.filter(tx => tx.method === 'cash').reduce((sum, tx) => sum + Number(tx.total), 0)
      const cardTotal = completedTxs.filter(tx => tx.method === 'card').reduce((sum, tx) => sum + Number(tx.total), 0)
      const qrTotal = completedTxs.filter(tx => tx.method === 'qr').reduce((sum, tx) => sum + Number(tx.total), 0)
      
      const itemCount = completedTxs.reduce((sum, tx) => sum + Number(tx.itemsCount || 0), 0)
      const refundedCount = shiftTxs.filter(tx => tx.status === 'refunded' || tx.status === 'voided').length

      return {
         ...shift,
         total,
         txCount: completedTxs.length,
         cashTotal,
         cardTotal,
         qrTotal,
         itemCount,
         refundedCount
      }
    })
  }, [shifts, transactions])

  // Chart Colors
  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f97316', '#eab308']

  // Gallery Navigation
  if (activeReport === 'gallery') {
    return (
      <div className="p-8 space-y-8 max-w-[1400px] mx-auto animate-in fade-in duration-500">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Report Center</h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mt-1">Select an intelligence module to continue</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { id: 'summary', title: 'Sale Summary', desc: 'Aggregated revenue, tax, and order metrics.', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50' },
            { id: 'details', title: 'Sale Details', desc: 'Itemized transaction lists and customer data.', icon: Search, color: 'text-purple-500', bg: 'bg-purple-50' },
            { id: 'top-items', title: 'Top Sale Items', desc: 'Best performing products by revenue and volume.', icon: Package, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { id: 'top-categories', title: 'Category Report', desc: 'Revenue distribution across product categories.', icon: Layers, color: 'text-orange-500', bg: 'bg-orange-50' },
            { id: 'shift-sales', title: 'Shift Sales', desc: 'Revenue broken down by individual operation shifts.', icon: Clock, color: 'text-rose-500', bg: 'bg-rose-50' },
          ].map((r) => (
            <Card 
              key={r.id} 
              className="group cursor-pointer border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] hover:scale-[1.02] transition-all duration-300 overflow-hidden"
              onClick={() => setActiveReport(r.id as ReportType)}
            >
              <CardContent className="p-8 space-y-4">
                <div className={`w-14 h-14 rounded-2xl ${r.bg} flex items-center justify-center ${r.color}`}>
                  <r.icon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-black text-xl tracking-tight">{r.title}</h3>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">{r.desc}</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  Launch Module <ChevronRight className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header & Back Action */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-4">
          <Button 
            variant="ghost" 
            onClick={() => setActiveReport('gallery')} 
            className="rounded-xl px-0 hover:bg-transparent text-muted-foreground hover:text-primary transition-colors gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-black text-[10px] uppercase tracking-[0.2em]">Return to Center</span>
          </Button>
          <div>
            <h1 className="text-4xl font-black tracking-tighter">
              {activeReport === 'summary' && (role === 'customer' ? 'My Purchase Summary' : 'Sale Summary')}
              {activeReport === 'details' && (role === 'customer' ? 'My Orders' : 'Sale Details')}
              {activeReport === 'top-items' && (role === 'customer' ? 'My Top Products' : 'Top Sale Items')}
              {activeReport === 'top-categories' && (role === 'customer' ? 'Category Spending' : 'Category Report')}
              {activeReport === 'shift-sales' && 'Shift Sales Tracker'}
            </h1>
            <p className="text-muted-foreground font-medium">
              {role === 'customer' ? 'Your personal purchase history and insights.' : `Intelligence data for ${currentStoreName}.`}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          {/* Store Switcher - Filtered by accessibleStores */}
          {role !== 'customer' && accessibleStores.length > 0 && (
            <div className="flex items-center gap-2 bg-muted/50 p-1 px-3 rounded-xl border border-border">
              <Building className="w-3.5 h-3.5 text-muted-foreground" />
              <select 
                value={selectedStoreId || accessibleStores[0]?.id || ''} 
                onChange={(e) => setSelectedStoreId(e.target.value)}
                className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none border-none py-1 cursor-pointer min-w-[120px]"
              >
                {accessibleStores.map(s => (
                  <option key={s.id} value={s.id} className="text-foreground bg-white">{s.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-wrap bg-muted/50 p-1 rounded-xl border border-border">
            {(['7d', '30d', 'all', 'custom'] as const).map((r) => (
              <button 
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                  dateRange === r ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r === 'all' ? 'All' : r === 'custom' ? 'Range' : `${r}`}
              </button>
            ))}
          </div>

          {dateRange === 'custom' && (
            <div className="flex items-center gap-2 animate-in slide-in-from-right-2 duration-300">
              <input 
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="bg-muted text-[10px] font-bold border-none rounded-lg px-2 py-1.5 focus:ring-2 ring-primary border-border focus:bg-white transition-all outline-none"
              />
              <span className="text-[10px] font-black text-muted-foreground">TO</span>
              <input 
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="bg-muted text-[10px] font-bold border-none rounded-lg px-2 py-1.5 focus:ring-2 ring-primary border-border focus:bg-white transition-all outline-none"
              />
            </div>
          )}
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="rounded-xl font-bold gap-2 text-xs border-2" onClick={() => {
              const exportData = transactions?.map(tx => ({ Date: tx.date, ID: tx.id, Total: tx.total, Method: tx.method })) || []
              exportToExcel(exportData, `Report_${activeReport}_${dateRange}`)
            }}>
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              Excel
            </Button>
            <Button size="sm" variant="outline" className="rounded-xl font-bold gap-2 text-xs border-2">
              <FileText className="w-4 h-4 text-red-500" />
              PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="space-y-8">
        {activeReport === 'summary' && (
          <div className="space-y-8">
            {transactions?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-[2.5rem] border-2 border-dashed border-border/50 animate-in fade-in duration-700">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <BarChart3 className="w-8 h-8 text-muted-foreground opacity-20" />
                </div>
                <h3 className="text-xl font-black tracking-tight text-muted-foreground">No data to display</h3>
                <p className="text-sm text-muted-foreground/60 font-medium">Try adjusting your date range filters</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {[
                    { label: 'Grand Total', val: `${currency}${summaryStats.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { label: 'Net Sales', val: `${currency}${summaryStats.net.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50' },
                    { label: 'Tax Total', val: `${currency}${summaryStats.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: Filter, color: 'text-orange-500', bg: 'bg-orange-50' },
                    { label: 'Avg Order', val: `${currency}${summaryStats.aov.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50' },
                    { label: 'Units Sold', val: summaryStats.units, icon: Package, color: 'text-pink-500', bg: 'bg-pink-50' },
                  ].map((s, i) => (
                    <Card key={i} className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] hover:shadow-2xl transition-all duration-300">
                      <CardContent className="p-8">
                        <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center ${s.color} mb-4`}>
                          <s.icon className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{s.label}</p>
                        <h3 className="text-2xl font-black tracking-tighter">{s.val}</h3>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {role !== 'customer' && insights && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-none shadow-lg rounded-[2rem] bg-slate-900 text-white overflow-hidden relative">
                       <div className="absolute top-0 right-0 p-8 opacity-10">
                         <Users className="w-20 h-20" />
                       </div>
                       <CardContent className="p-8">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Top Loyal Customer</p>
                         {insights.topCustomer ? (
                           <div className="space-y-1">
                             <h4 className="text-2xl font-black tracking-tight">{insights.topCustomer.name}</h4>
                             <p className="text-sm font-bold text-primary">{currency}{insights.topCustomer.val.toFixed(2)} Life Value</p>
                           </div>
                         ) : (
                           <p className="font-bold text-slate-500">No registered customers yet</p>
                         )}
                       </CardContent>
                    </Card>
                    <Card className="border-none shadow-lg rounded-[2rem] bg-indigo-600 text-white overflow-hidden relative">
                       <div className="absolute top-0 right-0 p-8 opacity-10">
                         <Calendar className="w-20 h-20" />
                       </div>
                       <CardContent className="p-8">
                         <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] mb-4">Peak Business Hour</p>
                         {insights.peakHour ? (
                           <div className="space-y-1">
                             <h4 className="text-2xl font-black tracking-tight">
                               {insights.peakHour.hour === 0 ? '12 AM' : insights.peakHour.hour > 12 ? `${insights.peakHour.hour - 12} PM` : `${insights.peakHour.hour} AM`}
                             </h4>
                             <p className="text-sm font-bold text-indigo-100">{insights.peakHour.count} Transactions average</p>
                           </div>
                         ) : (
                           <p className="font-bold text-indigo-300">Awaiting more data...</p>
                         )}
                       </CardContent>
                    </Card>
                    <Card className="border-none shadow-lg rounded-[2rem] bg-emerald-600 text-white overflow-hidden relative">
                       <div className="absolute top-0 right-0 p-8 opacity-10">
                         <Package className="w-20 h-20" />
                       </div>
                       <CardContent className="p-8">
                         <p className="text-[10px] font-black text-emerald-100 uppercase tracking-[0.2em] mb-4">Hero Product</p>
                         {insights.bestPerformingProduct ? (
                           <div className="space-y-1">
                             <h4 className="text-2xl font-black tracking-tight truncate">{insights.bestPerformingProduct.name}</h4>
                             <p className="text-sm font-bold text-emerald-100">{insights.bestPerformingProduct.qty} Units Sold Recently</p>
                           </div>
                         ) : (
                           <p className="font-bold text-emerald-300">Calculating performance...</p>
                         )}
                       </CardContent>
                    </Card>
                  </div>
                )}

                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] p-8">
                   <CardHeader className="p-0 mb-8">
                      <CardTitle className="text-xl font-black">Daily Performance</CardTitle>
                   </CardHeader>
                   <div className="h-[300px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={transactions?.slice(0, 10).reverse() || []}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                         <XAxis dataKey="date" tickFormatter={(d) => format(new Date(d), 'MMM dd')} tick={{fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} />
                         <YAxis tick={{fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} />
                         <Tooltip 
                            contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                            labelStyle={{fontWeight: 900}} 
                         />
                         <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                       </BarChart>
                     </ResponsiveContainer>
                   </div>
                </Card>
              </>
            )}
          </div>
        )}

        {activeReport === 'details' && (
           <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-card border border-border/50">
           <CardContent className="p-0">
             {transactions?.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-700">
                 <Search className="w-12 h-12 text-muted-foreground opacity-20 mb-4" />
                 <h3 className="text-xl font-black tracking-tight text-muted-foreground">No records to display</h3>
                 <p className="text-sm text-muted-foreground/60 font-medium text-center px-8">No transactions were found matching your current filter criteria.</p>
               </div>
             ) : (
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse min-w-[1000px]">
                   <thead>
                     <tr className="bg-muted/30 border-b border-border">
                       <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Transaction</th>
                       <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Customer</th>
                       <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Payment</th>
                       <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Summary</th>
                       <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">Total</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-border">
                     {transactions?.map((tx) => {
                       const items = transactionItems?.filter(it => it.transactionId === tx.id) || []
                       return (
                         <tr key={tx.id} className="group hover:bg-primary/[0.02] transition-colors">
                           <td className="px-8 py-6 align-top">
                             <p className="font-bold text-sm text-foreground">{tx.id.substring(0, 8)}</p>
                             <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">{format(new Date(tx.date), 'MMM dd, HH:mm')}</p>
                           </td>
                           <td className="px-8 py-6 align-top font-bold text-sm">{tx.customers?.name || 'Walk-in'}</td>
                           <td className="px-8 py-6 align-top">
                             <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest">{tx.method}</Badge>
                           </td>
                           <td className="px-8 py-6 align-top">
                             <div className="space-y-3">
                               {items.map((item, idx) => (
                                 <div key={idx} className="flex justify-between items-center gap-4 text-xs">
                                   <span className="font-medium text-muted-foreground">
                                     <span className="font-black text-foreground">{item.quantity}x</span> {item.name}
                                   </span>
                                   <span className="font-bold text-slate-400">{currency}{item.price?.toFixed(2)}</span>
                                 </div>
                               ))}
                               {items.length === 0 && !itemsLoading && (
                                 <span className="text-[10px] font-bold text-red-400 uppercase">Items data missing</span>
                               )}
                               {itemsLoading && (
                                 <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                               )}
                             </div>
                           </td>
                           <td className="px-8 py-6 align-top text-right font-black text-sm text-primary">{currency}{tx.total.toFixed(2)}</td>
                         </tr>
                       )
                     })}
                   </tbody>
                 </table>
               </div>
             )}
           </CardContent>
         </Card>
        )}

        {activeReport === 'top-items' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {topItems.length === 0 ? (
              <Card className="col-span-full border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] p-20 flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
                <Package className="w-16 h-16 text-muted-foreground opacity-20 mb-4" />
                <h3 className="text-xl font-black tracking-tight text-muted-foreground">No Item Data</h3>
                <p className="text-sm text-muted-foreground/60 font-medium">No product sales recorded in this period.</p>
              </Card>
            ) : (
              <>
                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] p-8">
                  <CardHeader className="p-0 mb-8">
                      <CardTitle className="text-xl font-black">Top Products by Revenue</CardTitle>
                  </CardHeader>
                  <div className="space-y-6">
                    {topItems.map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center font-black text-sm group-hover:bg-primary group-hover:text-white transition-all">
                            {i + 1}
                          </div>
                          <div>
                            <p className="font-black text-sm tracking-tight">{item.name}</p>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{item.qty} units sold</p>
                          </div>
                        </div>
                        <p className="font-black text-primary">{currency}{item.rev.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] p-8">
                  <CardHeader className="p-0 mb-8">
                      <CardTitle className="text-xl font-black">Quantity Analysis</CardTitle>
                  </CardHeader>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={topItems.slice(0, 5)}>
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" tick={{fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} width={100} />
                          <Tooltip />
                          <Bar dataKey="qty" fill="#a855f7" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </>
            )}
          </div>
        )}

        {activeReport === 'top-categories' && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {topCategories.length === 0 ? (
                <Card className="col-span-full border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] p-20 flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
                  <Layers className="w-16 h-16 text-muted-foreground opacity-20 mb-4" />
                  <h3 className="text-xl font-black tracking-tight text-muted-foreground">No Category Data</h3>
                  <p className="text-sm text-muted-foreground/60 font-medium">No category distribution available for this period.</p>
                </Card>
              ) : (
                <>
                  <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] p-8">
                    <CardHeader className="p-0 mb-8">
                        <CardTitle className="text-xl font-black">Category Breakdown</CardTitle>
                    </CardHeader>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={topCategories}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={120}
                            paddingAngle={5}
                            dataKey="rev"
                          >
                            {topCategories.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  <div className="space-y-6">
                    {topCategories.map((cat: any, i: number) => (
                      <Card key={i} className="border-none shadow-lg shadow-slate-200/50 rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-4 h-4 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}} />
                            <span className="font-black text-sm uppercase tracking-tight">{cat.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-lg">{currency}{cat.rev.toFixed(2)}</p>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Revenue Weight</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              )}
           </div>
        )}

        {activeReport === 'shift-sales' && (
          <div className="space-y-6">
             {shiftSalesData?.length === 0 ? (
               <Card className="col-span-full border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] p-20 flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
                 <Clock className="w-16 h-16 text-muted-foreground opacity-20 mb-4" />
                 <h3 className="text-xl font-black tracking-tight text-muted-foreground">No Shifts Recorded</h3>
                 <p className="text-sm text-muted-foreground/60 font-medium">There are no shift sessions in this time period.</p>
               </Card>
             ) : (
                shiftSalesData.map((shift, idx) => (
                  <Card key={shift.id || idx} className="border-none shadow-lg shadow-slate-200/50 rounded-[2.5rem] p-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${shift.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                           <Clock className="w-8 h-8" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                             <h3 className="text-xl font-black">{shift.name}</h3>
                             {shift.status === 'active' ? (
                               <Badge className="bg-emerald-500 hover:bg-emerald-600 font-black uppercase text-[9px] tracking-widest">Active</Badge>
                             ) : (
                               <Badge variant="secondary" className="font-black uppercase text-[9px] tracking-widest">Closed</Badge>
                             )}
                          </div>
                          <p className="text-sm text-muted-foreground font-bold">
                             {format(new Date(shift.start_time), 'MMM dd, HH:mm')} - {shift.end_time ? format(new Date(shift.end_time), 'HH:mm') : 'Present'}
                          </p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">
                             Terminal: {shift.terminal || shift.terminal_id}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-6 w-full lg:w-auto">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-12 min-w-full lg:min-w-[400px]">
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total Sales</p>
                              <p className="text-3xl font-black text-primary">{currency}{shift.total.toFixed(2)}</p>
                           </div>
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Transactions</p>
                              <p className="text-3xl font-black">{shift.txCount}</p>
                           </div>
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Items Sold</p>
                              <p className="text-3xl font-black text-emerald-500">{shift.itemCount}</p>
                           </div>
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Refunds/Voids</p>
                              <p className="text-3xl font-black text-rose-500">{shift.refundedCount}</p>
                           </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/40 rounded-2xl border">
                           <div className="text-center border-r border-border/50">
                              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Cash</p>
                              <p className="text-sm font-bold text-foreground">{currency}{shift.cashTotal.toFixed(2)}</p>
                           </div>
                           <div className="text-center border-r border-border/50">
                              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Card</p>
                              <p className="text-sm font-bold text-foreground">{currency}{shift.cardTotal.toFixed(2)}</p>
                           </div>
                           <div className="text-center">
                              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">QR Payment</p>
                              <p className="text-sm font-bold text-foreground">{currency}{shift.qrTotal.toFixed(2)}</p>
                           </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
             )}
          </div>
        )}
      </div>
    </div>
  )
}
