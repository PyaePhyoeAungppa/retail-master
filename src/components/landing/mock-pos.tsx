import { Search, ShoppingBag, Plus, Minus, CreditCard, Share2 } from "lucide-react"

export function MockPOSPreview() {
  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-black/10 flex bg-background -rotate-1 hover:rotate-0 transition-all duration-300">
      
      {/* Left Area: Products Grid (70%) */}
      <div className="w-2/3 bg-slate-50 p-6 flex flex-col gap-6">
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <div className="w-full h-10 bg-white rounded-xl border border-black/5 pl-10 pr-4 flex items-center text-xs text-muted-foreground font-medium shadow-sm">
            Search products...
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 pb-2">
          <div className="px-4 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">All</div>
          <div className="px-4 py-2 bg-white text-muted-foreground rounded-xl text-[10px] font-bold uppercase tracking-widest border border-black/5">Apparel</div>
          <div className="px-4 py-2 bg-white text-muted-foreground rounded-xl text-[10px] font-bold uppercase tracking-widest border border-black/5">Accessories</div>
        </div>

        {/* Products */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/5 hover:border-primary/30 transition-all">
            <div className="w-full aspect-square bg-blue-50 rounded-xl flex items-center justify-center text-blue-200 mb-3">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <p className="text-xs font-black truncate">Denim Jacket</p>
            <p className="text-sm font-black text-primary">$89.00</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/5 border-primary shadow-primary/20 transition-all">
            <div className="w-full aspect-square bg-amber-50 rounded-xl flex items-center justify-center text-amber-200 mb-3 relative">
              <div className="absolute top-2 right-2 w-6 h-6 bg-primary text-white text-[10px] font-black rounded-lg flex items-center justify-center">2</div>
              <ShoppingBag className="w-8 h-8" />
            </div>
            <p className="text-xs font-black truncate">Silk Scarf</p>
            <p className="text-sm font-black text-primary">$24.50</p>
          </div>
        </div>
      </div>

      {/* Right Area: Cart Sidebar (30%) */}
      <div className="w-1/3 bg-white border-l border-black/5 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-black/5 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xs font-black uppercase tracking-widest">Cart</h2>
          <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">3 items</span>
        </div>

        {/* Cart Items */}
        <div className="flex-1 p-4 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <p className="text-xs font-bold leading-tight truncate">Denim Jck...</p>
              <p className="text-[10px] text-muted-foreground">$89.00</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1 border border-black/5">
              <div className="w-4 h-4 rounded flex items-center justify-center text-muted-foreground"><Minus className="w-3 h-3" /></div>
              <span className="text-[10px] font-black w-3 text-center">1</span>
              <div className="w-4 h-4 rounded bg-white shadow-sm flex items-center justify-center"><Plus className="w-3 h-3" /></div>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <p className="text-xs font-bold leading-tight truncate">Silk Scarf</p>
              <p className="text-[10px] text-muted-foreground">$24.50</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1 border border-black/5">
              <div className="w-4 h-4 rounded flex items-center justify-center text-muted-foreground"><Minus className="w-3 h-3" /></div>
              <span className="text-[10px] font-black w-3 text-center">2</span>
              <div className="w-4 h-4 rounded bg-white shadow-sm flex items-center justify-center"><Plus className="w-3 h-3" /></div>
            </div>
          </div>
        </div>

        {/* Total & Checkout */}
        <div className="p-4 bg-slate-50 border-t border-black/5">
          <div className="flex justify-between items-center mb-4 text-sm font-black uppercase">
            <span>Total</span>
            <span className="text-primary text-xl tracking-tighter">$138.00</span>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 h-10 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 hover:bg-black/80 transition-all">
              <CreditCard className="w-3.5 h-3.5" />
              Pay
            </button>
            <button className="flex-1 h-10 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary/20 transition-all">
              <Share2 className="w-3.5 h-3.5" />
              Share Link
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
