
"use client"

import { useRef, useEffect } from "react"
import { useCartStore } from "@/store/use-cart-store"
import { toPng } from "html-to-image"
import jsPDF from "jspdf"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Printer, X, MessageCircle, Share2, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { Transaction, TransactionItem } from "@/lib/data"
import { useAuthStore } from "@/store/use-auth-store"
import { USBPrinterDriver } from "@/lib/usb-printer-driver"
import { usePrinterSettings } from "@/hooks/use-printer-settings"

interface ReceiptPreviewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transactionId: string
  paymentMethod: string
  transaction?: Transaction
  historicalItems?: TransactionItem[]
  autoPrint?: boolean
  footerText?: string
  paperSize?: '80mm' | '58mm'
}

export function ReceiptPreview({ open, onOpenChange, transactionId, paymentMethod, transaction, historicalItems, autoPrint, footerText, paperSize }: ReceiptPreviewProps) {
  const receiptRef = useRef<HTMLDivElement>(null)
  const { storeId, currentUser } = useAuthStore()
  const { settings: printerSettings } = usePrinterSettings()
  const { items: cartItems, total: cartTotal, receiptTemplate, selectedCustomer: cartCustomer } = useCartStore()
  
  // Use historical data if provided, otherwise use current cart
  const items = historicalItems || cartItems
  const total = transaction ? transaction.subtotal : cartTotal
  const selectedCustomer = transaction 
    ? { name: transaction.customerName, phone: (transaction as any).customerPhone } // Assuming we might have phone in tx metadata or fetch it later
    : cartCustomer
    
  const cashierName = transaction ? (transaction as any).cashierName : (currentUser?.email?.split('@')[0] || "Cashier")

  const { data: settings } = useQuery({
    queryKey: ['settings', storeId],
    queryFn: async () => {
      if (!storeId) return null
      const { data, error } = await supabase.from('stores').select('*').eq('id', storeId).single()
      if (error) throw error
      return data
    },
    enabled: !!storeId
  })

  const taxRate = settings?.tax_rate ?? 0.1
  const currency = settings?.currency ?? "$"
  const tax = transaction ? transaction.tax : (total * taxRate)
  const grandTotal = transaction ? transaction.total : (total + tax)
  const txDate = transaction ? new Date(transaction.date) : new Date()
  const date = txDate.toLocaleString()

  useEffect(() => {
    const handleAutoPrint = async () => {
      if (!open || !autoPrint) return;

      // Check if we have a paired USB device for direct printing
      if (printerSettings.connectedDevice && (navigator as any).usb) {
        try {
          const pairedDevices = await (navigator as any).usb.getDevices();
          const device = pairedDevices.find(
            (d: any) => d.vendorId === printerSettings.connectedDevice?.vendorId && 
                        d.productId === printerSettings.connectedDevice?.productId
          );

          if (device) {
            const driver = new USBPrinterDriver(device);
            const connected = await driver.connect();
            
            if (connected) {
              await driver.printReceipt({
                storeName: settings?.name || "Retail POS",
                brand: settings?.brand,
                address: settings?.address,
                transactionId,
                date,
                customerName: selectedCustomer?.name || "Walk In",
                items: items,
                total: total,
                tax: tax,
                grandTotal: grandTotal,
                currency: currency,
                cashierName: cashierName,
                paymentMethod: paymentMethod,
                footerText: footerText,
                paperSize: paperSize
              });
              
              // If successful, close modal and skip window.print()
              onOpenChange(false);
              return;
            }
          }
        } catch (err) {
          console.error("Direct USB auto-print failed, falling back to window.print()", err);
        }
      }

      // Fallback to standard browser printing
      const timer = setTimeout(() => {
        window.print();
        onOpenChange(false);
      }, 500);
      return () => clearTimeout(timer);
    };

    handleAutoPrint();
  }, [open, autoPrint, onOpenChange, printerSettings.connectedDevice, settings, transactionId, date, selectedCustomer, items, total, tax, grandTotal, currency, cashierName, paymentMethod, footerText]);

  const generateReceiptText = () => {
    const storeName = settings?.name || "Retail POS"
    const itemsText = items.map((item: any) => 
      `${item.name} x ${item.quantity}: ${currency}${(item.quantity * item.price).toFixed(2)}`
    ).join('\n')

    return `🧾 RECEIPT - ${storeName}
Ref: ${transactionId}
Date: ${date}
Customer: ${selectedCustomer?.name || "Walk In"}

${footerText ? `\n${footerText}\n` : ""}

Items:
${itemsText}

------------------
Subtotal: ${currency}${total.toFixed(2)}
Tax: ${currency}${tax.toFixed(2)}
TOTAL: ${currency}${grandTotal.toFixed(2)}

Thank you for shopping!`
  }

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(generateReceiptText())
    const phone = selectedCustomer?.phone?.replace(/\D/g, '') || ""
    const url = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`
    window.open(url, '_blank')
  }

  const handleShareGeneral = async () => {
    const text = generateReceiptText()
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Receipt - ${settings?.name || "Retail POS"}`,
          text: text,
        })
      } catch (err) {
        console.error("Error sharing:", err)
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(text)
        alert("Receipt copied to clipboard")
      } catch (err) {
        console.error("Error copy:", err)
      }
    }
  }

  const handleShareImage = async () => {
    if (!receiptRef.current) return
    
    try {
      const dataUrl = await toPng(receiptRef.current, { backgroundColor: '#fff', cacheBust: true })
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], `receipt-${transactionId}.png`, { type: 'image/png' })

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Receipt - ${transactionId}`,
        })
      } else {
        // Fallback: Just download
        const link = document.createElement('a')
        link.download = `receipt-${transactionId}.png`
        link.href = dataUrl
        link.click()
      }
    } catch (err) {
      console.error("Error sharing image:", err)
    }
  }

  const handleSharePDF = async () => {
    if (!receiptRef.current) return
    
    try {
      const dataUrl = await toPng(receiptRef.current, { backgroundColor: '#fff' })
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [receiptRef.current.offsetWidth, receiptRef.current.offsetHeight]
      })
      pdf.addImage(dataUrl, 'PNG', 0, 0, receiptRef.current.offsetWidth, receiptRef.current.offsetHeight)
      
      const pdfBlob = pdf.output('blob')
      const file = new File([pdfBlob], `receipt-${transactionId}.pdf`, { type: 'application/pdf' })

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Receipt PDF - ${transactionId}`,
        })
      } else {
        pdf.save(`receipt-${transactionId}.pdf`)
      }
    } catch (err) {
      console.error("Error sharing PDF:", err)
    }
  }

  const renderStandard = () => (
    <div className="bg-white p-8 text-slate-800 font-sans shadow-inner rounded-xl border">
      <div className="text-center space-y-2 mb-8">
        <h3 className="text-2xl font-black uppercase tracking-tighter">{settings?.name || "Retail POS"}</h3>
        <p className="text-xs text-muted-foreground">{settings?.brand || "Flagship Store"}</p>
        <p className="text-xs text-muted-foreground">{settings?.address || "123 Business Avenue, Shopville, ST 12345"}</p>
      </div>

      <div className="space-y-1 text-xs mb-6">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Date:</span>
          <span className="font-medium">{date}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Transaction:</span>
          <span className="font-medium">{transactionId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Customer:</span>
          <span className="font-medium">{selectedCustomer?.name || "Walk In"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Cashier:</span>
          <span className="font-medium">{cashierName}</span>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <div className="flex-1">
              <p className="font-bold">{item.name}</p>
              <p className="text-[10px] text-muted-foreground">{item.quantity} x {currency}{item.price.toFixed(2)}</p>
            </div>
            <span className="font-bold">{currency}{(item.quantity * item.price).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <Separator className="my-4 border-dashed" />

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{currency}{total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tax ({(taxRate * 100).toFixed(0)}%)</span>
          <span>{currency}{tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-black pt-2 border-t">
          <span>GRAND TOTAL</span>
          <span className="text-primary">{currency}{grandTotal.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-dashed text-center space-y-1">
        <p className="text-xs font-bold uppercase tracking-widest">Payment Method: {paymentMethod}</p>
        <p className="text-[10px] text-muted-foreground whitespace-pre-wrap">{footerText || "Thank you for shopping with us!"}</p>
      </div>
    </div>
  )

  const renderThermal = () => (
    <div className={cn(
      "bg-[#f8f9fa] p-6 text-black font-mono text-xs mx-auto shadow-inner rounded-sm border-x-8 border-y-4 border-white transition-all",
      paperSize === '58mm' ? "max-w-[220px]" : "max-w-[300px]"
    )}>
      <div className="text-center mb-4 leading-tight">
        <p className="font-bold text-sm">{(settings?.name || "RETAIL POS TERMINAL").toUpperCase()}</p>
        <p>{(settings?.brand || "STORE #001").toUpperCase()}</p>
        <p>SHOPVILLE, ST</p>
      </div>

      <p className="mb-2">----------------------------</p>
      
      <div className="space-y-0.5 mb-2">
        <p>DATE: {txDate.toLocaleDateString()}</p>
        <p>TIME: {txDate.toLocaleTimeString()}</p>
        <p>TXN : {transactionId.split('-').pop()}</p>
        <p>CUST: {selectedCustomer?.name.toUpperCase() || "WALK IN"}</p>
        <p>CASHIER: {cashierName.toUpperCase()}</p>
      </div>

      <p className="mb-2">----------------------------</p>

      <div className="space-y-2 mb-2">
        {items.map((item) => (
          <div key={item.id}>
            <p className="font-bold overflow-hidden whitespace-nowrap">{item.name.toUpperCase()}</p>
            <div className="flex justify-between">
              <span>{item.quantity} @ {item.price.toFixed(2)}</span>
              <span>{(item.quantity * item.price).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      <p className="mb-2">----------------------------</p>

      <div className="space-y-1">
        <div className="flex justify-between">
          <span>SUBTOTAL</span>
          <span>{currency}{total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>TAX ({(taxRate * 100).toFixed(0)}%)</span>
          <span>{currency}{tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-sm pt-1">
          <span>TOTAL</span>
          <span>{currency}{grandTotal.toFixed(2)}</span>
        </div>
      </div>

      <p className="my-2">----------------------------</p>
      
      <div className="text-center space-y-1">
        <p>PAID BY {paymentMethod.toUpperCase()}</p>
        <p className="mt-4">*** THANK YOU ***</p>
        <p className="uppercase">{footerText || "Please visit again"}</p>
      </div>
    </div>
  )

  const renderModern = () => (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white rounded-3xl relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/20 blur-3xl -ml-16 -mb-16" />
      
      <div className="relative z-10 flex justify-between items-start mb-10">
        <div>
          <h3 className="text-3xl font-black italic tracking-tighter text-primary">{(settings?.name || "RETAIL").toUpperCase()}.</h3>
          <p className="text-xs text-white/50 mt-1 font-medium">{settings?.brand || "Digital Receipt"}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-black uppercase text-white/40 tracking-widest">Date</p>
          <p className="text-sm font-bold">{txDate.toLocaleString()}</p>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-8 mb-10">
        <div>
          <p className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-1">Customer</p>
          <p className="text-sm font-bold">{selectedCustomer?.name || "Walk In"}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-1">Cashier & Method</p>
          <p className="text-sm font-bold capitalize">{cashierName} • {paymentMethod}</p>
        </div>
      </div>

      <div className="relative z-10 space-y-4 mb-10">
        {items.map((item: any) => (
          <div key={item.id || (item as any).productId} className="flex justify-between items-center group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[10px] font-black">
                {item.quantity}x
              </div>
              <p className="text-sm font-medium text-white/90">{item.name}</p>
            </div>
            <p className="text-sm font-black">{currency}{(item.quantity * item.price).toFixed(2)}</p>
          </div>
        ))}
      </div>

      <div className="relative z-10 bg-white/5 rounded-2xl p-6 space-y-3 backdrop-blur-md border border-white/10">
        <div className="flex justify-between text-xs text-white/50 font-medium">
          <span>Subtotal</span>
          <span>{currency}{total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xs text-white/50 font-medium">
          <span>Sales Tax ({(taxRate * 100).toFixed(0)}%)</span>
          <span>{currency}{tax.toFixed(2)}</span>
        </div>
        <div className="h-px bg-white/10 my-2" />
        <div className="flex justify-between items-baseline">
          <span className="text-sm font-bold text-primary italic uppercase tracking-wider">Total Amount</span>
          <span className="text-3xl font-black tracking-tighter">{currency}{grandTotal.toFixed(2)}</span>
        </div>
      </div>
      
      <p className="relative z-10 text-[10px] text-center text-white/30 font-black tracking-widest uppercase mt-8">
        Ref: {transactionId}
        {footerText && <span className="block mt-1">{footerText}</span>}
      </p>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl max-h-[95vh] flex flex-col">
        <div className="p-4 border-b bg-card flex items-center justify-between flex-shrink-0">
          <div>
            <DialogTitle className="text-base font-black">Receipt Preview</DialogTitle>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Style: {receiptTemplate}</p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="px-4 py-3 bg-muted/30 flex justify-center overflow-y-auto flex-1 min-h-0">
          <div ref={receiptRef} className="w-full h-fit animate-in zoom-in-95 duration-300">
            {receiptTemplate === 'standard' && renderStandard()}
            {receiptTemplate === 'thermal' && renderThermal()}
            {receiptTemplate === 'modern' && renderModern()}
          </div>
        </div>

        <div className="p-3 bg-card border-t flex flex-col gap-2 flex-shrink-0">
          <div className="grid grid-cols-3 gap-2">
             <Button 
                variant="outline" 
                className="h-9 rounded-xl font-bold flex gap-1.5 border-green-200 text-green-700 hover:bg-green-50 text-[10px]"
                onClick={handleShareWhatsApp}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Text
             </Button>
             <Button 
                variant="outline" 
                className="h-9 rounded-xl font-bold flex gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50 text-[10px]"
                onClick={handleShareImage}
              >
                <Share2 className="w-3.5 h-3.5" />
                Image
             </Button>
             <Button 
                variant="outline" 
                className="h-9 rounded-xl font-bold flex gap-1.5 border-purple-200 text-purple-700 hover:bg-purple-50 text-[10px]"
                onClick={handleSharePDF}
              >
                <Printer className="w-3.5 h-3.5" />
                PDF
             </Button>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="ghost" 
              className="flex-1 h-9 rounded-xl font-bold text-sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1 h-9 rounded-xl font-black flex gap-2 shadow-primary/20 shadow-lg text-sm"
              onClick={() => {
                window.print()
                onOpenChange(false)
              }}
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
