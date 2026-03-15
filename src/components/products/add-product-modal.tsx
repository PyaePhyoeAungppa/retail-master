
"use client"

import { useState } from "react"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import axios from "axios"
import { useAuthStore } from "@/store/use-auth-store"
import { useToastStore } from "@/store/use-toast-store"
import { Plus, Loader2, Image as ImageIcon, Check, Upload } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Category } from "@/lib/data"
import Image from "next/image"

export function AddProductModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const { storeId } = useAuthStore()
  const { toast } = useToastStore()
  const queryClient = useQueryClient()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    stock: "",
    image: ""
  })

  const { data: categories } = useQuery({
    queryKey: ["categories", storeId],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').eq('store_id', storeId).order('name')
      if (error) throw error
      return data as Category[]
    },
    enabled: !!storeId
  })

  const mutation = useMutation({
    mutationFn: async (newProduct: any) => {
      const { data, error } = await supabase.from('products').insert([{ ...newProduct, store_id: storeId }]).select()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast({
        title: "Product Created",
        description: `"${formData.name}" has been added to inventory.`,
        variant: "success"
      })
      setIsOpen(false)
      setFormData({
        name: "",
        price: "",
        category: "Beverages",
        stock: "",
        image: ""
      })
      setSelectedFile(null)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl("")
      }
    },
  })

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Clean up old preview
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    
    let imageUrl = formData.image

    try {
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `products/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, selectedFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath)
        
        imageUrl = publicUrl
      }

      mutation.mutate({
        ...formData,
        id: crypto.randomUUID(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        image: imageUrl || undefined
      })
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to upload image or save product.",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={
        <Button className="rounded-xl flex gap-2 h-11 shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      } />
      <DialogContent className="sm:max-w-[700px] bg-white/70 backdrop-blur-2xl border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] rounded-[2rem] p-0 overflow-hidden max-h-[90vh] flex flex-col">
        <DialogHeader className="p-8 pb-4 border-b">
          <DialogTitle className="text-2xl font-black tracking-tight">Create New Product</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Essential Details */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Product Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Coca Cola 1.5L"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-12 rounded-xl bg-white/50 border-none ring-1 ring-black/5 focus-visible:ring-primary h-12 px-4 shadow-sm"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="h-12 rounded-xl bg-white/50 border-none ring-1 ring-black/5 focus-visible:ring-primary h-12 px-4 shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      placeholder="0"
                      required
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="h-12 rounded-xl bg-white/50 border-none ring-1 ring-black/5 focus-visible:ring-primary h-12 px-4 shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Category & Image */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(val: string | null) => setFormData({ ...formData, category: val || "" })}
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-white/50 border-none ring-1 ring-black/5 focus-visible:ring-primary w-full px-4 shadow-sm">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-2xl bg-white/90 backdrop-blur-xl">
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name} className="rounded-lg">
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Product Image</Label>
                  <div className="grid grid-cols-[1fr,auto] gap-3">
                    <div className="relative group/upload">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="h-12 rounded-xl bg-white/50 border-none ring-1 ring-black/5 focus-visible:ring-primary px-4 shadow-sm file:hidden cursor-pointer w-full"
                      />
                      <div className="absolute inset-0 flex items-center px-4 pointer-events-none text-muted-foreground transition-colors group-hover/upload:text-primary">
                        <Upload className="w-4 h-4 mr-2 shrink-0" />
                        <span className="text-xs truncate">
                          {uploading ? "Saving..." : (selectedFile || formData.image) ? "Change Image" : "Upload Image"}
                        </span>
                      </div>
                    </div>
                    {(previewUrl || formData.image) && (
                      <div className="w-12 h-12 rounded-xl bg-accent overflow-hidden ring-1 ring-black/5 relative active:scale-95 transition-transform cursor-pointer shrink-0" onClick={() => window.open(previewUrl || formData.image, '_blank')}>
                        <Image src={previewUrl || formData.image} alt="Preview" fill className="object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-8 pt-4 border-t bg-white/50">
            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl font-black text-base shadow-xl shadow-primary/20 flex gap-2 active:scale-[0.98] transition-all"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Save Product
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
