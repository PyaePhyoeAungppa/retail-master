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
import { Edit2, MoreHorizontal, Trash2, Loader2, Package, History } from "lucide-react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import Image from "next/image"
import { useState } from "react"
import { useAuthStore } from "@/store/use-auth-store"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useToastStore } from "@/store/use-toast-store"
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
} from "@/components/ui/menu"
import { AddProductModal } from "./add-product-modal"

export function ProductTable() {
  const { storeId } = useAuthStore()
  const { toast } = useToastStore()
  const queryClient = useQueryClient()
  
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<{ id: string, name: string } | null>(null)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'edit' | 'stock'>('edit')

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

  const handleDeletePreview = async (product: { id: string, name: string }) => {
    // Check for existing transactions
    const { count, error } = await supabase
      .from('transaction_items')
      .select('id', { count: 'exact', head: true })
      .eq('productId', product.id)
    
    if (error) {
      toast({ title: "Error", description: "Failed to verify transaction history.", variant: "destructive" })
      return
    }

    if (count && count > 0) {
      toast({
        title: "Deletion Blocked",
        description: `"${product.name}" has ${count} existing transactions. Deleting it would break historical records.`,
        variant: "destructive"
      })
      return
    }

    setProductToDelete(product)
    setConfirmOpen(true)
  }

  const handleDelete = async () => {
    if (!productToDelete) return

    try {
      const product = products?.find(p => p.id === productToDelete.id)
      
      if (product?.image) {
        try {
          const urlParts = product.image.split('/')
          const filePath = `products/${urlParts[urlParts.length - 1]}`
          await supabase.storage.from('product-images').remove([filePath])
        } catch (storageError) {
          console.error("Storage cleanup failed:", storageError)
        }
      }

      const { error } = await supabase.from('products').delete().eq('id', productToDelete.id)
      if (error) throw error
      
      toast({ 
        title: "Product Deleted", 
        description: `"${productToDelete.name}" has been removed.`,
        variant: "success" 
      })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    } catch (error: any) {
      toast({ 
        title: "Deletion Failed", 
        description: error.message || "Failed to delete product",
        variant: "destructive" 
      })
    } finally {
      setConfirmOpen(false)
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
            <TableHead className="font-bold py-4">Product Name</TableHead>
            <TableHead className="font-bold py-4">Category</TableHead>
            <TableHead className="font-bold py-4">Price</TableHead>
            <TableHead className="font-bold py-4">Stock Status</TableHead>
            <TableHead className="text-right font-bold py-4">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(products || []).map((product) => (
            <TableRow key={product.id} className="hover:bg-muted/30 transition-colors group">
              <TableCell className="py-4">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary relative overflow-hidden ring-1 ring-border group-hover:ring-primary/30 transition-all">
                        {product.image ? (
                          <Image src={product.image} alt={product.name} fill className="object-cover" />
                        ) : (
                          product.name.substring(0, 2).toUpperCase()
                        )}
                    </div>
                    <span className="font-bold text-base tracking-tight">{product.name}</span>
                 </div>
              </TableCell>
              <TableCell className="py-4">
                <Badge variant="secondary" className="rounded-lg font-bold px-3 py-1 bg-muted/50 text-muted-foreground border-none">
                  {product.category}
                </Badge>
              </TableCell>
              <TableCell className="font-black text-lg py-4">${product.price.toFixed(2)}</TableCell>
              <TableCell className="py-4">
                <div className="flex items-center gap-2">
                   <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${product.stock > 10 ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                   <span className="font-black text-sm">{product.stock} <span className="text-muted-foreground font-medium text-xs ml-0.5">Available</span></span>
                </div>
              </TableCell>
              <TableCell className="text-right py-4">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all text-primary"
                    onClick={() => {
                      setEditProduct(product)
                      setModalMode('edit')
                      setIsEditModalOpen(true)
                    }}
                  >
                    <Edit2 className="w-5 h-5" />
                  </Button>

                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all"
                    onClick={() => handleDeletePreview({ id: product.id, name: product.name })}
                  >
                    <Trash2 className="w-5 h-5" />
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
        title="Permanently Delete Product?"
        description={`This will remove "${productToDelete?.name}" from your inventory and delete its primary image. This action is irreversible.`}
      />

      <AddProductModal 
        product={editProduct}
        mode={modalMode}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        trigger={null}
      />
    </div>
  )
}
