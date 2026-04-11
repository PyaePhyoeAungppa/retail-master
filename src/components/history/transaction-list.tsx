
"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Calendar, 
  User as UserIcon, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Smartphone,
  ExternalLink,
  Loader2
} from "lucide-react"

import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/store/use-auth-store"
import { Transaction, Store, TransactionItem } from "@/lib/data"
import { ReceiptPreview } from "@/components/pos/receipt-preview"
import { useState } from "react"
import { useCurrency } from "@/hooks/use-currency"

const methodIcons: Record<string, any> = {
  card: CreditCard,
  cash: Banknote,
  qr: QrCode,
  nfc: Smartphone,
}

export function TransactionList() {
  const { storeId } = useAuthStore()
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)
  const [txItems, setTxItems] = useState<TransactionItem[]>([])
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isFetchingItems, setIsFetchingItems] = useState(false)

  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ['transactions', storeId],
    queryFn: async () => {
      if (!storeId) return []
      const { data, error } = await supabase.from('transactions')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    }
  })

  const currency = useCurrency()

  const handleViewReceipt = async (tx: Transaction) => {
    setIsFetchingItems(true)
    setSelectedTx(tx)
    
    try {
      const { data, error } = await supabase
        .from('transaction_items')
        .select('*')
        .eq('transactionId', tx.id)
      
      if (error) throw error
      setTxItems(data || [])
      setIsPreviewOpen(true)
    } catch (err) {
      console.error("Error fetching items:", err)
    } finally {
      setIsFetchingItems(false)
    }
  }

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

  return (
    <div className="space-y-4">
      {(transactions || []).map((tx: any) => {
        const MethodIcon = methodIcons[tx.method] || CreditCard
        const isCurrentTxFetching = isFetchingItems && selectedTx?.id === tx.id

        return (
          <Card key={tx.id} className="group hover:ring-1 hover:ring-primary/20 transition-all border-none shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center p-6 gap-6">
                 <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <MethodIcon className="w-6 h-6" />
                 </div>
                 
                 <div className="flex-1 space-y-1">
                     <div className="flex items-center gap-2">
                       <span className="font-bold text-lg">{tx.id}</span>
                       <Badge variant={tx.status === 'completed' ? 'secondary' : 'destructive'} className="text-[10px] uppercase font-black px-1.5 py-0 rounded-md">
                          {tx.status}
                       </Badge>
                       <span className="text-xs text-muted-foreground ml-2">Terminal: {tx.terminalId}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                       <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(tx.date).toLocaleString()}</span>
                       </div>
                       <div className="flex items-center gap-1">
                          <UserIcon className="w-3.5 h-3.5" />
                          <span>Cashier: {tx.cashierName} • Customer: {tx.customerName}</span>
                       </div>
                    </div>
                 </div>

                 <div className="text-right space-y-1">
                    <p className="text-2xl font-black text-primary">{currency}{tx.total.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground font-medium">{tx.itemsCount} Items Purchased</p>
                 </div>

                 <div className="pl-4 border-l">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-xl hover:bg-primary/10 hover:text-primary"
                      onClick={() => handleViewReceipt(tx)}
                      disabled={isCurrentTxFetching}
                    >
                      {isCurrentTxFetching 
                        ? <Loader2 className="w-5 h-5 animate-spin" />
                        : <ExternalLink className="w-5 h-5" />
                      }
                    </Button>
                 </div>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {selectedTx && (
        <ReceiptPreview 
          open={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
          transactionId={selectedTx.id}
          paymentMethod={selectedTx.method}
          transaction={selectedTx}
          historicalItems={txItems}
        />
      )}
    </div>
  )
}
