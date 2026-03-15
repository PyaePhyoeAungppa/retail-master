
"use client"

import { Product } from "@/lib/data"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit2, MoreHorizontal, Trash2, Loader2 } from "lucide-react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import Image from "next/image"
import { useState } from "react"
import { useAuthStore } from "@/store/use-auth-store"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useToastStore } from "@/store/use-toast-store"

export function ProductTable() {
  const { storeId } = useAuthStore()
  const { toast } = useToastStore()
  const { data: products, isLoading } = useQuery<Product[]>({
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

  const queryClient = useQueryClient()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<{ id: string, name: string } | null>(null)

  const handleDelete = async () => {
    if (!productToDelete) return

    try {
      // 1. Get product details to find image URL
      const product = products?.find(p => p.id === productToDelete.id)
      
      // 2. Remove image from storage if it exists
      if (product?.image) {
        try {
          const urlParts = product.image.split('/')
          const filePath = `products/${urlParts[urlParts.length - 1]}`
          await supabase.storage.from('product-images').remove([filePath])
        } catch (storageError) {
          console.error("Storage cleanup failed:", storageError)
        }
      }

      // 3. Delete product record
      const { error } = await supabase.from('products').delete().eq('id', productToDelete.id)
      if (error) throw error
      
      toast({ 
        title: "Product Deleted", 
        description: `"${productToDelete.name}" and its image have been removed.`,
        variant: "success" 
      })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    } catch (error: any) {
      toast({ 
        title: "Deletion Failed", 
        description: error.message || "Failed to delete product",
        variant: "destructive" 
      })
    }
  }

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center bg-card rounded-2xl border">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Product Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(products || []).map((product) => (
            <TableRow key={product.id} className="hover:bg-muted/30 transition-colors">
              <TableCell>
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary relative overflow-hidden">
                        {product.image ? (
                          <Image src={product.image} alt={product.name} fill className="object-cover" />
                        ) : (
                          product.name.substring(0, 2)
                        )}
                    </div>
                    <span className="font-semibold">{product.name}</span>
                 </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="rounded-lg font-medium">
                  {product.category}
                </Badge>
              </TableCell>
              <TableCell className="font-bold">${product.price.toFixed(2)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                   <div className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-green-500' : 'bg-red-500'}`} />
                   <span className="font-medium">{product.stock} pcs</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary">
                    < MoreHorizontal className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                    onClick={() => {
                      setProductToDelete({ id: product.id, name: product.name })
                      setConfirmOpen(true)
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ConfirmDialog
        isOpen={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleDelete}
        title="Delete Product"
        description={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
      />
    </div>
  )
}
