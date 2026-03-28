import { CheckCircle2, Copy } from "lucide-react"

export function MockReceiptPreview() {
  return (
    <div className="w-full max-w-sm mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden font-mono border border-black/10 transform rotate-2 hover:rotate-0 transition-all duration-300">
      {/* Decorative Top Edge */}
      <div className="h-2 bg-primary w-full" />
      
      <div className="p-6 text-center space-y-6">
        <div className="space-y-1">
          <h3 className="text-xl font-black text-black leading-none uppercase tracking-tight">The Modern Shop</h3>
          <p className="text-[10px] text-muted-foreground mt-2 font-medium">123 Digital Ave, Cyber City</p>
        </div>

        <div className="border-t border-dashed border-black/10 pt-4" />

        <div className="text-left space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold">Premium Denim Jacket</p>
              <p className="text-[10px] text-muted-foreground">1 x $89.00</p>
            </div>
            <p className="text-xs font-bold">$89.00</p>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold">Silk Scarf</p>
              <p className="text-[10px] text-muted-foreground">2 x $24.50</p>
            </div>
            <p className="text-xs font-bold">$49.00</p>
          </div>
        </div>

        <div className="border-t border-dashed border-black/10 pt-4" />

        <div className="space-y-2 text-xs">
          <div className="flex justify-between font-bold">
            <span className="uppercase tracking-wider">Subtotal</span>
            <span>$138.00</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span className="uppercase tracking-wider">Tax (5%)</span>
            <span>$6.90</span>
          </div>
          
          <div className="pt-2">
            <div className="h-[1px] w-full bg-black/10 mb-2" />
            <div className="flex justify-between items-center">
              <span className="text-sm font-black uppercase">Total</span>
              <span className="text-xl font-black text-primary tracking-tighter">$144.90</span>
            </div>
            <div className="h-[1px] w-full bg-black/10 mt-2" />
          </div>
        </div>

        {/* Mock Payment Instructions */}
        <div className="space-y-3 pt-4 border-t border-black/5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-left">Payment Instructions</p>
          <div className="bg-primary/5 p-3 rounded-xl border border-primary/10 flex items-center justify-between">
            <div className="text-left space-y-0.5">
              <p className="text-[9px] font-black uppercase text-primary">KPay (Mg Mg)</p>
              <p className="text-xs font-black text-black">09 123 456 789</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border shadow-sm text-muted-foreground">
              <Copy className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        <div className="pt-2 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-[10px] font-bold border border-emerald-100">
            <CheckCircle2 className="w-3 h-3" />
            Pending Payment
          </div>
        </div>
      </div>
    </div>
  )
}
