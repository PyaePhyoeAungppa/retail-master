
"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Package,
  AlertCircle
} from "lucide-react"
import { Transaction, Product, TransactionItem } from "@/lib/data"
import { format, parse, startOfDay, subDays, isWithinInterval } from 'date-fns'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function DashboardPage() {
  const [range, setRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly')

  const { data: transactions, isLoading: txLoading } = useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('transactions')
        .select('*')
        .order('date', { ascending: false })
      if (error) throw error
      return data
    }
  })

  const { data: products, isLoading: prodLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*')
      if (error) throw error
      return data
    }
  })

  const { data: transactionItems, isLoading: itemsLoading } = useQuery<TransactionItem[]>({
    queryKey: ['transactionItems'],
    queryFn: async () => {
      const { data, error } = await supabase.from('transaction_items').select('*')
      if (error) throw error
      return data
    }
  })


  // Filter transactions based on selected range
  const filteredTx = useMemo(() => {
    if (!transactions) return []
    const now = new Date()
    const completed = transactions.filter(tx => tx.status === 'completed')
    
    if (range === 'daily') {
      const today = format(now, 'yyyy-MM-dd')
      return completed.filter(tx => tx.date.startsWith(today))
    }
    
    if (range === 'weekly') {
      const sevenDaysAgo = subDays(now, 7)
      return completed.filter(tx => new Date(tx.date) >= sevenDaysAgo)
    }
    
    if (range === 'monthly') {
      const thirtyDaysAgo = subDays(now, 30)
      return completed.filter(tx => new Date(tx.date) >= thirtyDaysAgo)
    }
    
    return completed
  }, [transactions, range])

  const completedTx = filteredTx
  const voidedTx = transactions?.filter(tx => {
    const isVoid = tx.status === 'void'
    if (!isVoid) return false
    
    const now = new Date()
    if (range === 'daily') return tx.date.startsWith(format(now, 'yyyy-MM-dd'))
    if (range === 'weekly') return new Date(tx.date) >= subDays(now, 7)
    if (range === 'monthly') return new Date(tx.date) >= subDays(now, 30)
    return true
  }) || []
  
  const totalRevenue = completedTx.reduce((sum: number, tx: Transaction) => sum + tx.total, 0)
  const totalOrders = completedTx.length
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const totalVoids = voidedTx.length

  // Process data for charts
  const salesTrendData = useMemo(() => {
    if (!transactions) return []
    const now = new Date()
    const completed = transactions.filter(tx => tx.status === 'completed')

    if (range === 'daily') {
      // Last 24 hours (aggregated by hour)
      return Array.from({ length: 24 }, (_, i) => {
        const hour = i
        const hourTotal = completed
          .filter(tx => {
            const txDate = new Date(tx.date)
            return txDate.getHours() === hour && tx.date.startsWith(format(now, 'yyyy-MM-dd'))
          })
          .reduce((sum: number, tx: Transaction) => sum + tx.total, 0)
        return { name: `${hour}:00`, total: hourTotal }
      })
    }

    if (range === 'weekly') {
      const days = Array.from({ length: 7 }, (_, i) => format(subDays(now, i), 'yyyy-MM-dd')).reverse()
      return days.map((dayStr: string) => {
        const dayTotal = completed
          .filter((tx: Transaction) => tx.date.startsWith(dayStr))
          .reduce((sum: number, tx: Transaction) => sum + tx.total, 0)
        return { name: format(parse(dayStr, 'yyyy-MM-dd', new Date()), 'EEE'), total: dayTotal }
      })
    }

    if (range === 'monthly') {
      const days = Array.from({ length: 30 }, (_, i) => format(subDays(now, i), 'yyyy-MM-dd')).reverse()
      return days.map((dayStr: string) => {
        const dayTotal = completed
          .filter((tx: Transaction) => tx.date.startsWith(dayStr))
          .reduce((sum: number, tx: Transaction) => sum + tx.total, 0)
        return { name: format(parse(dayStr, 'yyyy-MM-dd', new Date()), 'MMM dd'), total: dayTotal }
      })
    }

    return []
  }, [transactions, range])

  // Payment Methods Distribution
  const paymentData = [
    { name: 'Cash', value: completedTx.filter(tx => tx.method === 'cash').length },
    { name: 'Card', value: completedTx.filter(tx => tx.method === 'card').length },
    { name: 'QR', value: completedTx.filter(tx => tx.method === 'qr').length },
    { name: 'NFC', value: completedTx.filter(tx => tx.method === 'nfc').length },
  ].filter(d => d.value > 0)

  // 3. Category Distribution (Actual Sold Units)
  const categoryCounts: Record<string, number> = {}
  transactionItems?.forEach(item => {
    const product = products?.find(p => p.id === item.productId)
    if (product) {
      categoryCounts[product.category] = (categoryCounts[product.category] || 0) + item.quantity
    }
  })
  const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  if (txLoading || prodLoading || itemsLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-full" />
          <p className="text-muted-foreground font-medium">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Analytics Dashboard</h1>
          <p className="text-muted-foreground font-medium">Overview of your store's performance and trends.</p>
        </div>
        <div className="flex bg-muted/50 p-1 rounded-xl border border-border">
          <button 
            onClick={() => setRange('daily')}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
              range === 'daily' ? "bg-white shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Daily
          </button>
          <button 
            onClick={() => setRange('weekly')}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
              range === 'weekly' ? "bg-white shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Weekly
          </button>
          <button 
            onClick={() => setRange('monthly')}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
              range === 'monthly' ? "bg-white shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} 
          icon={DollarSign} 
          trend="+12.5%" 
          trendType="up"
        />
        <StatCard 
          title="Completed Orders" 
          value={totalOrders.toString()} 
          icon={ShoppingCart} 
          trend="+5.2%" 
          trendType="up"
        />
        <StatCard 
          title="Avg. Order Value" 
          value={`$${avgOrderValue.toFixed(2)}`} 
          icon={TrendingUp} 
          trend="-2.1%" 
          trendType="down"
        />
        <StatCard 
          title="Voided Transactions" 
          value={totalVoids.toString()} 
          icon={AlertCircle} 
          trend="+1" 
          trendType="neutral"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Sales Chart */}
        <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
          <CardHeader className="p-8 pb-0">
            <CardTitle className="text-xl font-black">Revenue Trend</CardTitle>
            <p className="text-sm text-muted-foreground">
              {range === 'daily' ? "Hourly sales for today." : 
               range === 'weekly' ? "Daily sales for the last 7 days." : 
               "Daily sales for the last 30 days."}
            </p>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <div className="h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrendData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12}}
                    dy={1}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12}}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#6366f1" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorTotal)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
          <CardHeader className="p-8 pb-0">
            <CardTitle className="text-xl font-black">Payment Distribution</CardTitle>
            <p className="text-sm text-muted-foreground">Volume by payment gateway.</p>
          </CardHeader>
          <CardContent className="p-8 flex flex-col items-center">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {paymentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full mt-4">
              {paymentData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}} />
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card className="lg:col-span-1 border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
          <CardHeader className="p-8 pb-0">
            <CardTitle className="text-xl font-black">Category Breakdown</CardTitle>
            <p className="text-sm text-muted-foreground">Inventory count by category.</p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{fill: '#475569', fontSize: 10, fontWeight: 'bold'}}
                    width={80}
                  />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[0, 10, 10, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock/Recent Activity Space */}
        <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
           <CardHeader className="p-8 pb-0">
              <CardTitle className="text-xl font-black">Quick Alerts</CardTitle>
              <p className="text-sm text-muted-foreground">Critical notifications and stock warnings.</p>
           </CardHeader>
           <CardContent className="p-8">
              <div className="space-y-4">
                 {products?.filter(p => p.stock < 10).slice(0, 4).map(p => (
                   <div key={p.id} className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100 group hover:bg-red-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-red-500 rounded-xl text-white shadow-lg shadow-red-200">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="font-bold text-red-900">{p.name}</p>
                           <p className="text-xs text-red-600 font-medium uppercase tracking-widest">Low Stock Alert</p>
                        </div>
                      </div>
                      <div className="text-right">
                         <p className="text-2xl font-black text-red-600">{p.stock}</p>
                         <p className="text-[10px] font-bold text-red-400 uppercase tracking-tighter">Units Left</p>
                      </div>
                   </div>
                 ))}
                 {(!products || products.filter(p => p.stock < 10).length === 0) && (
                   <div className="text-center py-12 text-muted-foreground italic">
                      No stock alerts at this time.
                   </div>
                 )}
              </div>
           </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, trend, trendType }: { 
  title: string, 
  value: string, 
  icon: any, 
  trend?: string, 
  trendType: 'up' | 'down' | 'neutral' 
}) {
  return (
    <Card className="border-none shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 rounded-[2rem] overflow-hidden group">
      <CardContent className="p-8">
        <div className="flex justify-between items-start mb-6">
          <div className="p-4 bg-muted/50 rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors duration-500">
            <Icon className="w-6 h-6" />
          </div>
          {trend && (
            <div className={cn(
              "px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1",
              trendType === 'up' ? "bg-green-100 text-green-600" : 
              trendType === 'down' ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"
            )}>
              {trendType === 'up' && <ArrowUpRight className="w-3 h-3" />}
              {trendType === 'down' && <ArrowDownRight className="w-3 h-3" />}
              {trend}
            </div>
          )}
        </div>
        <div>
          <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">{title}</p>
          <p className="text-3xl font-black tracking-tighter">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}
