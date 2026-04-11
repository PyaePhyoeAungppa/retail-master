"use client"

import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { Transaction, TransactionItem, Store } from "@/lib/data"
import { useAuthStore } from "@/store/use-auth-store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { 
  Calendar, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Smartphone,
  ChevronRight,
  ChevronDown,
  Loader2,
  Receipt,
  User,
  ShoppingBag,
  Tag
} from "lucide-react"
import { useCurrency } from "@/hooks/use-currency"

const methodIcons: Record<string, any> = {
  card: CreditCard,
  cash: Banknote,
  qr: QrCode,
  nfc: Smartphone,
}

interface CustomerTransactionsProps {
  customerId: string
}

function TransactionDetails({ transaction, onClose, currency, taxRate }: { transaction: Transaction, onClose: () => void, currency: string, taxRate: number }) {
  const { data: items, isLoading } = useQuery<TransactionItem[]>({
    queryKey: ['transaction-items', transaction.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transaction_items')
        .select('*')
        .eq('transactionId', transaction.id)
      if (error) throw error
      return data
    }
  })

  return (
    <div className="p-8 bg-muted/30 border-t animate-in slide-in-from-top-2 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Items */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
             <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
               <ShoppingBag className="w-4 h-4 text-primary" />
               Line Items
             </h4>
             <Badge variant="outline" className="rounded-lg text-[10px] font-bold border-muted-foreground/20">
                {items?.length || 0} Products
             </Badge>
          </div>
          
          {isLoading ? (
            <div className="flex items-center gap-3 text-muted-foreground py-8 justify-center bg-card/50 rounded-3xl border border-dashed">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm font-semibold">Retrieving items...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-card rounded-2xl border shadow-[0_2px_10px_rgba(0,0,0,0.02)] group/item hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground font-black text-xs">
                        {item.quantity}x
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm tracking-tight">{item.name}</span>
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                        Unit: {currency}{item.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <span className="font-black text-primary text-base">{currency}{item.subtotal.toFixed(2)}</span>
                </div>
              ))}
              {items?.length === 0 && (
                <div className="py-12 text-center bg-card rounded-3xl border border-dashed">
                    <p className="text-sm text-muted-foreground font-medium italic">No individual item data found.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Breakdown & Info */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-4">
            <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary" />
              Financial Summary
            </h4>
            <div className="bg-card p-6 rounded-[2rem] border shadow-xl shadow-slate-200/40 space-y-4">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-black">{currency}{(transaction.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span className="text-muted-foreground">Tax ({(taxRate * 100).toFixed(0)}%)</span>
                <span className="font-black text-orange-600">{currency}{(transaction.tax || 0).toFixed(2)}</span>
              </div>
              <Separator className="bg-muted-foreground/10" />
              <div className="flex justify-between items-end">
                <span className="text-sm font-black uppercase text-muted-foreground mb-1">Total Paid</span>
                <span className="text-3xl font-black text-primary tracking-tighter shadow-primary/10 drop-shadow-sm">
                    {currency}{(transaction.total || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Meta Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-card p-4 rounded-2xl border shadow-sm space-y-1.5 overflow-hidden group/meta hover:border-primary/20 transition-all">
                <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Handled By</p>
                <p className="text-xs font-bold truncate text-foreground group-hover:text-primary transition-colors" title={transaction.cashierName}>
                    {transaction.cashierName}
                </p>
              </div>
              <div className="bg-card p-4 rounded-2xl border shadow-sm space-y-1.5 overflow-hidden group/meta hover:border-primary/20 transition-all">
                <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Reference ID</p>
                <p className="text-xs font-mono font-bold truncate text-muted-foreground" title={transaction.terminalId}>
                    {transaction.terminalId}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CustomerTransactions({ customerId }: CustomerTransactionsProps) {
  const currency = useCurrency()
  const taxRate = 0.1 // Since we aren't fetching the store here anymore, we fallback to 10% or we could fetch tax_rate via a separate hook. For now, 10% defaults.

  const [expandedId, setExpandedId] = useState<string | null>(null)
  
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ['transactions', 'customer', customerId],
    queryFn: async () => {
      const { data, error } = await supabase.from('transactions').select('*').eq('customerId', customerId)
      if (error) throw error
      return data
    }
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-card rounded-2xl border flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ))}
      </div>
    )
  }

  const sortedTx = (transactions || []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (sortedTx.length === 0) {
    return (
      <div className="text-center py-20 bg-muted/10 rounded-3xl border border-dashed flex flex-col items-center gap-4">
        <Receipt className="w-12 h-12 text-muted-foreground/30" />
        <p className="text-muted-foreground font-medium">No transactions found for this customer.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sortedTx.map((tx) => {
        const MethodIcon = methodIcons[tx.method] || CreditCard
        const isExpanded = expandedId === tx.id
        
        return (
          <Card key={tx.id} className={`group transition-all border-none shadow-sm overflow-hidden ${isExpanded ? 'ring-2 ring-primary/20 shadow-lg' : 'hover:ring-1 hover:ring-primary/20'}`}>
            <CardContent className="p-0">
              <div 
                className="flex items-center p-6 gap-6 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : tx.id)}
              >
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isExpanded ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'}`}>
                    <MethodIcon className="w-6 h-6" />
                 </div>
                 
                 <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                       <span className="font-bold text-lg">{tx.id}</span>
                       <Badge variant={tx.status === 'completed' ? 'secondary' : 'destructive'} className="text-[10px] uppercase font-black px-1.5 py-0 rounded-md">
                          {tx.status}
                       </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                       <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(tx.date).toLocaleString()}</span>
                       </div>
                    </div>
                 </div>

                 <div className="text-right space-y-1">
                    <p className="text-2xl font-black text-primary">{currency}{tx.total.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground font-medium">{tx.itemsCount} Items Purchased</p>
                 </div>

                 <div className="pl-4 border-l">
                    <Button variant="ghost" size="icon" className="rounded-xl">
                       {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </Button>
                 </div>
              </div>

              {isExpanded && (
                <TransactionDetails 
                  transaction={tx} 
                  onClose={() => setExpandedId(null)} 
                  currency={currency}
                  taxRate={taxRate}
                />
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
