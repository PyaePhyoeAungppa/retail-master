
"use client"

import { Button } from "@/components/ui/button"
import { ProductTable } from "@/components/products/product-table"
import { Download, Filter, Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { Product } from "@/lib/data"
import { AddProductModal } from "@/components/products/add-product-modal"
import { CategoryManager } from "@/components/products/category-manager"

export default function ProductsPage() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*')
      if (error) throw error
      return data
    }
  })

  const totalProducts = products?.length || 0
  const lowStock = products?.filter(p => p.stock > 0 && p.stock < 10).length || 0
  const outOfStock = products?.filter(p => p.stock === 0).length || 0

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Product Inventory</h1>
          <p className="text-muted-foreground">Manage your store products and stock levels.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl flex gap-2 h-11 border-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <CategoryManager />
          <AddProductModal />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 bg-muted/30 p-4 rounded-2xl border border-dashed border-muted-foreground/20">
         <div className="flex items-center gap-6 text-sm">
            <div className="flex flex-col text-center sm:text-left">
               <span className="text-muted-foreground font-medium">Total Products</span>
               <span className="text-xl font-bold">{isLoading ? "..." : totalProducts}</span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="flex flex-col text-center sm:text-left">
               <span className="text-muted-foreground font-medium">Low Stock</span>
               <span className="text-xl font-bold text-red-500">{isLoading ? "..." : lowStock}</span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="flex flex-col text-center sm:text-left">
               <span className="text-muted-foreground font-medium">Out of Stock</span>
               <span className="text-xl font-bold">{isLoading ? "..." : outOfStock}</span>
            </div>
         </div>
         <Button variant="outline" size="sm" className="rounded-lg h-9">
            <Filter className="w-3.5 h-3.5 mr-2" />
            Filters
         </Button>
      </div>

      <ProductTable />
    </div>
  )
}
