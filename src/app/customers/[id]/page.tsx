"use client"

import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useParams, useRouter } from "next/navigation"
import { Customer, Transaction } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Calendar, 
  DollarSign, 
  ShoppingBag,
  User,
  Edit,
  Clock,
  Loader2
} from "lucide-react"
import { CustomerTransactions } from "@/components/customers/customer-transactions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function CustomerDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const { data: customer, isLoading: custLoading } = useQuery<Customer>({
    queryKey: ['customer', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('customers').select('*').eq('id', id).single()
      if (error) throw error
      return data
    }
  })

  const { data: transactions, isLoading: txLoading } = useQuery<Transaction[]>({
    queryKey: ['transactions', 'customer', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('transactions').select('*').eq('customerId', id)
      if (error) throw error
      return data
    }
  })

  if (custLoading || txLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!customer) return <div className="p-8 text-center">Customer not found</div>

  const completedTx = transactions?.filter(tx => tx.status === 'completed') || []
  const totalSpend = completedTx.reduce((sum, tx) => sum + tx.total, 0)
  const avgSpend = completedTx.length > 0 ? totalSpend / completedTx.length : 0
  const lastVisit = completedTx.length > 0 
    ? new Date(Math.max(...completedTx.map(t => new Date(t.date).getTime()))).toLocaleDateString()
    : 'Never'

  return (
    <div className="p-8 space-y-8 max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-2xl h-12 w-12 hover:bg-muted"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
          <h1 className="text-4xl font-black tracking-tighter">{customer.name}</h1>
          <p className="text-muted-foreground font-medium">Customer Profile & History</p>
        </div>
        <Button className="ml-auto rounded-xl flex gap-2 h-12 px-6">
          <Edit className="w-4 h-4" />
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden lg:col-span-1 h-fit">
          <div className="h-32 bg-primary relative">
             <div className="absolute -bottom-12 left-8 w-24 h-24 rounded-3xl bg-white p-1 shadow-lg">
                <div className="w-full h-full rounded-[1.25rem] bg-primary/10 flex items-center justify-center text-primary">
                    <User className="w-10 h-10" />
                </div>
             </div>
          </div>
          <CardContent className="pt-16 pb-8 px-8 space-y-6">
            <div className="space-y-4">
               <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="font-medium">{customer.email || 'No email provided'}</span>
               </div>
               <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="w-4 h-4 text-primary" />
                  <span className="font-medium">{customer.phone || 'No phone provided'}</span>
               </div>
               <div className="flex items-center gap-3 text-muted-foreground">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="font-medium italic">Active since 2026</span>
               </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Customer ID</p>
                    <p className="text-xs font-mono font-bold break-all">{customer.id}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Loyalty Status</p>
                    <p className="text-xs font-bold text-green-600">VIP Member</p>
                </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats & History */}
        <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-md rounded-3xl p-6 bg-primary text-primary-foreground">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <DollarSign className="w-5 h-5 opacity-70" />
                            <Badge className="bg-white/20 text-white border-none text-[10px]">Total</Badge>
                        </div>
                        <p className="text-3xl font-black mt-2">${totalSpend.toLocaleString()}</p>
                        <p className="text-xs opacity-70 font-medium">Revenue Generated</p>
                    </div>
                </Card>
                <Card className="border-none shadow-md rounded-3xl p-6 bg-card">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <ShoppingBag className="w-5 h-5 text-primary opacity-70" />
                            <Badge variant="secondary" className="text-[10px]">Orders</Badge>
                        </div>
                        <p className="text-3xl font-black mt-2">{completedTx.length}</p>
                        <p className="text-xs text-muted-foreground font-medium">Completed Visits</p>
                    </div>
                </Card>
                <Card className="border-none shadow-md rounded-3xl p-6 bg-card">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <Calendar className="w-5 h-5 text-primary opacity-70" />
                            <Badge variant="secondary" className="text-[10px]">Recent</Badge>
                        </div>
                        <p className="text-xl font-black mt-2">{lastVisit}</p>
                        <p className="text-xs text-muted-foreground font-medium">Last Visit Date</p>
                    </div>
                </Card>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black flex items-center gap-2">
                        <Receipt className="w-6 h-6 text-primary" />
                        Purchase History
                    </h2>
                    <Button variant="outline" size="sm" className="rounded-xl h-9">
                        View All
                    </Button>
                </div>
                <CustomerTransactions customerId={id as string} />
            </div>
        </div>
      </div>
    </div>
  )
}

function Receipt(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
      <path d="M16 8h-6" />
      <path d="M16 12H8" />
      <path d="M13 16H8" />
    </svg>
  )
}
