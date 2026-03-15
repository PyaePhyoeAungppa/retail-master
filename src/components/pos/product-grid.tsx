
"use client"

import { useState } from "react"
import { Product, Category, Customer } from "@/lib/data"
import { useCartStore } from "@/store/use-cart-store"
import { useEffect } from "react"
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
  const { setCustomer, selectedCustomer } = useCartStore()

  // Auto-set default customer on load
  useEffect(() => {
    if (!storeId || selectedCustomer) return

    const fetchDefaultCustomer = async () => {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('store_id', storeId)
          .eq('is_default', true)
          .maybeSingle()
        
        if (data && !error) {
          setCustomer(data as Customer)
        }
      } catch (err) {
        console.error("Error fetching default customer:", err)
      }
    }

    fetchDefaultCustomer()
  }, [storeId, setCustomer, selectedCustomer])
 
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto p-4 pb-32 scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
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
        className="h-full border-none bg-white/40 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-500 rounded-[2rem] overflow-hidden flex flex-col ring-1 ring-black/[0.03] group-hover:ring-primary/20"
      >
        <CardContent className="p-0 flex-1 flex flex-col h-full">
          {/* Image Container */}
          <div className="relative aspect-[4/3] w-full flex items-center justify-center bg-white overflow-hidden">
            {product.image ? (
              <div className="relative w-full h-full transition-transform duration-700 ease-out">
                <Image 
                  src={product.image} 
                  alt={product.name} 
                  fill 
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-primary/10 font-black text-6xl select-none">
                {product.name.substring(0, 2)}
              </div>
            )}
            
            <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
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
          <div className="p-3.5 flex flex-col flex-1 gap-1.5 border-t border-black/[0.03] bg-white/20">
            <div className="min-h-[48px]">
              <p className="text-[9px] uppercase tracking-[0.15em] text-primary/60 font-black mb-0.5">{product.category}</p>
              <h3 className="font-bold text-sm leading-tight text-foreground/90 group-hover:text-primary transition-colors line-clamp-2">
                {cleanName}
              </h3>
            </div>
            
            <div className="mt-auto pt-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-lg font-black text-foreground tabular-nums tracking-tighter">${product.price.toFixed(2)}</p>
                
                <div className="flex items-center gap-2">
                  {/* Compact Qty Control */}
                  <div className="flex items-center bg-black/5 p-0.5 rounded-lg ring-1 ring-black/5">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm transition-all text-muted-foreground hover:text-foreground active:scale-95"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center font-black text-[10px] tabular-nums">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm transition-all text-muted-foreground hover:text-foreground active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <Button 
                    size="icon"
                    className="h-7 w-7 rounded-lg shadow-sm active:scale-95 bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={handleAdd}
                    disabled={product.stock === 0}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
