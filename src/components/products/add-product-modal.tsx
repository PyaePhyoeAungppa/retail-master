
"use client"

import { useState, useEffect, useMemo } from "react"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/store/use-auth-store"
import { useToastStore } from "@/store/use-toast-store"
import { Plus, Loader2, Image as ImageIcon, Check, Upload, Save, Package, Search, X, ChevronDown } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Category, Product } from "@/lib/data"
import Image from "next/image"

interface AddProductModalProps {
  product?: Product | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
  mode?: 'add' | 'edit' | 'stock'
}

export function AddProductModal({ product, open: externalOpen, onOpenChange, trigger, mode = 'add' }: AddProductModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen
  const setIsOpen = onOpenChange || setInternalOpen

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

  const [categorySearch, setCategorySearch] = useState("")
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)

  // Sync form data when product changes (for editing)
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price.toString(),
        category: product.category,
        stock: product.stock.toString(),
        image: product.image || ""
      })
    } else {
      setFormData({
        name: "",
        price: "",
        category: "",
        stock: "",
        image: ""
      })
    }
  }, [product, isOpen])

  const { data: categories } = useQuery({
    queryKey: ["categories", storeId],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').eq('store_id', storeId).order('name')
      if (error) throw error
      return data as Category[]
    },
    enabled: !!storeId
  })

  const filteredCategories = useMemo(() => {
    if (!categories) return []
    if (!categorySearch) return categories
    return categories.filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase()))
  }, [categories, categorySearch])

  const mutation = useMutation({
    mutationFn: async (productData: any) => {
      if (product) {
        // Update existing
        const { data, error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id)
          .select()
        if (error) throw error
        return data
      } else {
        // Create new
        const { data, error } = await supabase
          .from('products')
          .insert([{ ...productData, store_id: storeId }])
          .select()
        if (error) throw error
        return data
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", storeId] })
      toast({
        title: product ? "Product Updated" : "Product Created",
        description: `"${formData.name}" has been ${product ? "updated" : "added to inventory"}.`,
        variant: "success"
      })
      setIsOpen(false)
      if (!product) {
        setFormData({
          name: "",
          price: "",
          category: "",
          stock: "",
          image: ""
        })
      }
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
        name: formData.name,
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock),
        image: imageUrl || undefined,
        ...(product ? {} : { id: crypto.randomUUID() }) // Only add ID for new products
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

  const defaultTrigger = (
    <Button className="rounded-xl flex gap-2 h-11 shadow-lg shadow-primary/20">
      <Plus className="w-4 h-4" />
      Add Product
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger !== null && (
        trigger ? (
          <DialogTrigger render={trigger as React.ReactElement} />
        ) : (
          <DialogTrigger render={defaultTrigger as React.ReactElement} />
        )
      )}
      <DialogContent className="sm:max-w-[700px] bg-white/70 backdrop-blur-2xl border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] rounded-[2rem] p-0 overflow-hidden max-h-[90vh] flex flex-col">
        <DialogHeader className="p-8 pb-4 border-b">
          <DialogTitle className="text-2xl font-black tracking-tight">
            {mode === 'stock' ? "Inventory Management" : product ? "Update Product Details" : "Create New Product"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className={`grid grid-cols-1 ${mode === 'stock' ? '' : 'md:grid-cols-2'} gap-8`}>
              {/* Left Column: Essential Details */}
              <div className="space-y-6">
                {mode === 'stock' && (
                  <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/10 flex items-center gap-6 mb-4">
                     <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary relative overflow-hidden ring-1 ring-primary/20">
                        {product?.image ? (
                          <Image src={product.image} alt={product.name} fill className="object-cover" />
                        ) : (
                          <Package className="w-8 h-8" />
                        )}
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 leading-none mb-1">Stocking Unit</span>
                        <span className="text-xl font-black leading-tight tracking-tight">{product?.name}</span>
                        <span className="text-xs font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-md w-fit mt-1">{product?.category}</span>
                     </div>
                  </div>
                )}

                {mode !== 'stock' && (
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
                )}
                
                <div className={`grid ${mode === 'stock' ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                  {mode !== 'stock' && (
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
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="stock" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-1 font-black">
                      {mode === 'stock' ? "Update Current Inventory (PCS)" : "Initial Stock"}
                    </Label>
                    <Input
                      id="stock"
                      type="number"
                      placeholder="0"
                      required
                      autoFocus={mode === 'stock'}
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className={`rounded-2xl bg-white/50 border-none ring-1 ring-black/5 focus-visible:ring-primary px-4 shadow-sm ${mode === 'stock' ? 'h-20 text-4xl font-black text-center' : 'h-12'}`}
                    />
                    {mode === 'stock' && (
                      <p className="text-[10px] text-muted-foreground font-bold text-center uppercase tracking-widest mt-2">
                        Enter the physical count of units currently in stock
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Category & Image */}
              {mode !== 'stock' && (
                <div className="space-y-6">
                <div className="space-y-2 relative">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Category</Label>
                  <div className="relative">
                    <div className="relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        placeholder="Search or select category..."
                        value={showCategoryDropdown ? categorySearch : formData.category}
                        onChange={(e) => {
                          setCategorySearch(e.target.value)
                          setShowCategoryDropdown(true)
                        }}
                        onFocus={() => {
                          setShowCategoryDropdown(true)
                          setCategorySearch("")
                        }}
                        className="h-12 pl-11 pr-10 rounded-xl bg-white/50 border-none ring-1 ring-black/5 focus-visible:ring-primary h-12 shadow-sm font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", showCategoryDropdown && "rotate-180")} />
                      </button>
                    </div>

                    {showCategoryDropdown && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowCategoryDropdown(false)} />
                        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white/90 backdrop-blur-xl rounded-[1.5rem] border border-black/[0.03] shadow-2xl p-2 max-h-[240px] overflow-y-auto animate-in fade-in zoom-in duration-200 custom-scrollbar">
                           {filteredCategories.length > 0 ? (
                             filteredCategories.map((cat) => (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, category: cat.name })
                                  setShowCategoryDropdown(false)
                                  setCategorySearch("")
                                }}
                                className={cn(
                                  "w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-between transition-all hover:bg-primary/10 hover:text-primary active:scale-[0.98]",
                                  formData.category === cat.name ? "bg-primary text-white" : "text-muted-foreground"
                                )}
                              >
                                {cat.name}
                                {formData.category === cat.name && <Check className="w-4 h-4" />}
                              </button>
                             ))
                           ) : (
                             <div className="p-4 text-center">
                               <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">No categories found</p>
                               <Button 
                                 type="button" 
                                 variant="ghost" 
                                 className="mt-2 text-primary h-8 px-4 rounded-lg text-xs"
                                 onClick={() => {
                                   setFormData({ ...formData, category: categorySearch })
                                   setShowCategoryDropdown(false)
                                 }}
                               >
                                 Use "{categorySearch}"
                               </Button>
                             </div>
                           )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Product Image</Label>
                  <div className="relative">
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    
                    {previewUrl || formData.image ? (
                      <div className="relative group/preview rounded-[2rem] overflow-hidden border-2 border-dashed border-primary/20 bg-primary/5 aspect-video flex items-center justify-center transition-all hover:border-primary/40">
                        <Image src={previewUrl || formData.image} alt="Preview" fill className="object-contain p-4 shadow-2xl transition-transform duration-500 group-hover/preview:scale-105" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                          <Button 
                            type="button" 
                            variant="secondary" 
                            size="sm" 
                            className="rounded-full font-black text-[10px] uppercase h-8 px-4 shadow-xl active:scale-95"
                            onClick={() => document.getElementById('image-upload')?.click()}
                          >
                            <Upload className="w-3 h-3 mr-1.5" />
                            Change
                          </Button>
                          <Button 
                            type="button" 
                            variant="destructive" 
                            size="sm" 
                            className="rounded-full font-black text-[10px] uppercase h-8 px-4 shadow-xl active:scale-95"
                            onClick={() => {
                              setSelectedFile(null)
                              setPreviewUrl("")
                              setFormData({ ...formData, image: "" })
                            }}
                          >
                            <X className="w-3 h-3 mr-1.5" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <label 
                        htmlFor="image-upload" 
                        className="flex flex-col items-center justify-center gap-3 aspect-video rounded-[2rem] border-2 border-dashed border-black/10 bg-black/[0.02] hover:bg-black/[0.04] hover:border-primary/40 hover:text-primary transition-all cursor-pointer group/upload"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-muted-foreground group-hover/upload:text-primary group-hover/upload:rotate-6 transition-all duration-300">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-black tracking-tight">{uploading ? "Uploading..." : "Click to Upload"}</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">JPG, PNG or WEBP (Max 5MB)</p>
                        </div>
                      </label>
                    )}
                  </div>
                </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="p-8 pt-4 border-t bg-white/50">
            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl font-black text-base shadow-xl shadow-primary/20 flex gap-2 active:scale-[0.98] transition-all"
              disabled={mutation.isPending || uploading}
            >
              {mutation.isPending || uploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {mode === 'stock' ? <Package className="w-5 h-5" /> : product ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  {mode === 'stock' ? "Update Inventory Level" : product ? "Update Product Details" : "Add to Inventory"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
