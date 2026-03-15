
"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Trash2, Tag, Loader2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { Category } from "@/lib/data"
import { useAuthStore } from "@/store/use-auth-store"
import { useToastStore } from "@/store/use-toast-store"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

export function CategoryManager() {
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToastStore()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [catToDelete, setCatToDelete] = useState<{ id: string, name: string } | null>(null)
  const [newCategoryName, setNewCategoryName] = useState("")
  const { storeId } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('store_id', storeId) // Filter by store
        .order('name')
      
      if (error) throw error
      return data as Category[]
    },
    enabled: !!storeId
  })

  const addMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name, store_id: storeId }]) // Pass store_id
        .select()
      
      if (error) throw error
      return data
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      setNewCategoryName("")
      toast({
        title: "Category Created",
        description: `"${data?.[0]?.name || 'New Category'}" has been added.`,
        variant: "success"
      })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      toast({
        title: "Category Deleted",
        description: "The category and its associations have been removed.",
        variant: "success"
      })
    }
  })

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (newCategoryName.trim()) {
      addMutation.mutate(newCategoryName.trim())
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={
        <Button variant="outline" className="rounded-xl flex gap-2 h-11 border-2">
          <Tag className="w-4 h-4" />
          Manage Categories
        </Button>
      } />
      <DialogContent className="sm:max-w-md bg-white/70 backdrop-blur-2xl border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] rounded-[2rem] gap-6 p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight">Product Categories</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleAdd} className="flex gap-2">
          <Input
            placeholder="New Category Name..."
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="rounded-xl bg-white/50 border-none ring-1 ring-black/5 focus-visible:ring-primary px-4 shadow-sm h-11"
            disabled={addMutation.isPending}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="rounded-xl h-11 w-11 shrink-0 shadow-lg shadow-primary/20"
            disabled={addMutation.isPending}
          >
            {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          </Button>
        </form>

        <div className="space-y-2 mt-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary/20" />
            </div>
          ) : Array.isArray(categories) && categories.length > 0 ? (
            categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl bg-white/40 ring-1 ring-black/5 group hover:bg-white/60 transition-all">
                <span className="font-semibold">{cat.name}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => {
                    setCatToDelete({ id: cat.id, name: cat.name })
                    setConfirmOpen(true)
                  }}
                  className="rounded-lg h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center p-8 opacity-50">
              <p>No categories found</p>
            </div>
          )}
        </div>
      </DialogContent>

      <ConfirmDialog
        isOpen={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={() => catToDelete && deleteMutation.mutate(catToDelete.id)}
        title="Delete Category"
        description={`Are you sure you want to delete the category "${catToDelete?.name}"? All products in this category will become uncategorized. This action cannot be undone.`}
      />
    </Dialog>
  )
}
