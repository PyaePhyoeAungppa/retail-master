
"use client"

import { useState } from "react"
import { Product, Category } from "@/lib/data"
import { useCartStore } from "@/store/use-cart-store"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, Minus, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import Image from "next/image"
import { useAuthStore } from "@/store/use-auth-store"

export function ProductGrid() {
  const [activeCategory, setActiveCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const { storeId } = useAuthStore()
  const addItem = useCartStore((state) => state.addItem)
 
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeId)
        .order('name')
      if (error) throw error
      return data as Product[]
    }
  })
 
  const { data: categoriesData } = useQuery({
    queryKey: ['categories', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('store_id', storeId)
        .order('name')
      if (error) throw error
      return data as Category[]
    }
  })

  // Add "All" category for filtering
  const categories = categoriesData ? [{ id: 'all', name: 'All' }, ...categoriesData] : [{ id: 'all', name: 'All' }]

  const filteredProducts = (products || []).filter((product) => {
    const matchesCategory = activeCategory === "All" || product.category === activeCategory
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="flex flex-col h-full gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-auto">
          <TabsList className="bg-muted/50 p-1 rounded-xl">
            {categories.map((cat) => (
              <TabsTrigger 
                key={cat.id} 
                value={cat.name}
                className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-none ring-1 ring-border focus-visible:ring-primary rounded-xl"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto p-4 pb-32 scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onAdd={addItem} />
          ))}
        </div>
      )}
    </div>
  )
}

function ProductCard({ product, onAdd }: { product: Product, onAdd: (p: Product, q: number) => void }) {
  const [quantity, setQuantity] = useState(1)

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    onAdd(product, quantity)
    setQuantity(1)
  }

  // Extract attributes (e.g., 500ml, XL, 1L)
  const attributeMatch = product.name.match(/\((.*?)\)|(\d+(ml|L|kg|g|oz|lb))|(\b(XL|L|M|S)\b)/i)
  const attribute = attributeMatch ? attributeMatch[0] : null
  const cleanName = product.name.replace(attributeMatch ? attributeMatch[0] : "", "").trim()

  return (
    <div className="group h-full">
      <Card 
        className="h-full border-none bg-white/40 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_48px_rgba(0,0,0,0.1)] transition-all duration-500 rounded-[2rem] overflow-hidden flex flex-col ring-1 ring-black/[0.03] group-hover:ring-primary/20"
      >
        <CardContent className="p-0 flex-1 flex flex-col">
          {/* Image Container */}
          <div className="relative aspect-square w-full p-4 flex items-center justify-center bg-gradient-to-br from-white/80 to-transparent">
            {product.image ? (
              <div className="relative w-full h-full transform group-hover:scale-110 transition-transform duration-700 ease-out">
                <Image 
                  src={product.image} 
                  alt={product.name} 
                  fill 
                  className="object-contain drop-shadow-2xl"
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-primary/10 font-black text-6xl select-none">
                {product.name.substring(0, 2)}
              </div>
            )}
            
            <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
              <Badge variant="secondary" className="bg-black/80 backdrop-blur-md text-white border-none font-bold text-[9px] px-2 py-0.5 rounded-full ring-1 ring-white/20">
                #{product.id}
              </Badge>
              {product.stock < 10 && (
                <Badge variant="destructive" className="text-[9px] px-2 py-0.5 rounded-full font-black animate-pulse border-none shadow-lg">
                  {product.stock === 0 ? "EMPTY" : `${product.stock} LEFT`}
                </Badge>
              )}
            </div>

            {attribute && (
              <div className="absolute bottom-3 left-3">
                 <Badge className="bg-primary/10 hover:bg-primary/20 text-primary border-none font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-lg backdrop-blur-md">
                   {attribute}
                 </Badge>
              </div>
            ) }
          </div>
          
          {/* Content Area */}
          <div className="p-4 flex flex-col flex-1 gap-2 border-t border-black/[0.03] bg-white/20">
            <div className="min-h-[48px]">
              <p className="text-[9px] uppercase tracking-[0.15em] text-primary/60 font-black mb-0.5">{product.category}</p>
              <h3 className="font-bold text-sm leading-tight text-foreground/90 group-hover:text-primary transition-colors line-clamp-2">
                {cleanName}
              </h3>
            </div>
            
            <div className="mt-auto space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xl font-black text-foreground tabular-nums tracking-tighter">${product.price.toFixed(2)}</p>
                
                {/* Compact Qty Control */}
                <div className="flex items-center bg-black/5 p-1 rounded-xl ring-1 ring-black/5">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition-all text-muted-foreground hover:text-foreground active:scale-95"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center font-black text-xs tabular-nums">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition-all text-muted-foreground hover:text-foreground active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <Button 
                className="w-full h-10 rounded-xl font-black text-xs shadow-[0_8px_16px_rgba(var(--primary-rgb),0.2)] hover:shadow-[0_12px_24px_rgba(var(--primary-rgb),0.3)] transition-all duration-300 flex gap-2 active:scale-[0.97] group/btn"
                onClick={handleAdd}
                disabled={product.stock === 0}
              >
                <Plus className="w-4 h-4 group-hover/btn:rotate-90 transition-transform duration-300" />
                Add to Cart
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
