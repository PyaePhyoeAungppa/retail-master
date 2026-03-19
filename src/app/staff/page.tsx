
"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/use-auth-store"
import { useToastStore } from "@/store/use-toast-store"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  UserPlus, 
  Shield, 
  Mail, 
  MoreHorizontal, 
  Trash2, 
  UserCircle,
  ShieldCheck,
  Briefcase,
  Loader2,
  RefreshCcw,
  Pencil
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function StaffPage() {
  const { storeId, role: currentUserRole, accessibleStores } = useAuthStore()
  const { toast } = useToastStore()
  const queryClient = useQueryClient()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [inviteRole, setInviteRole] = useState("cashier")
  const [viewStoreId, setViewStoreId] = useState<string>(storeId || "all")
  const [targetStoreId, setTargetStoreId] = useState<string>(storeId || "")
  
  // Edit State
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<any>(null)
  const [editName, setEditName] = useState("")
  const [editRole, setEditRole] = useState("")

  // Find current store name for placeholders
  const currentStoreName = accessibleStores.find(s => s.id === viewStoreId)?.name || 
                           accessibleStores.find(s => s.id === storeId)?.name || 
                           "Select a Store"

  // Sync with global storeId once it's available
  useEffect(() => {
    if (storeId) {
      if (!viewStoreId || viewStoreId === "all") setViewStoreId(storeId)
      if (!targetStoreId) setTargetStoreId(storeId)
    }
  }, [storeId])

  const { data: staff, isLoading, isFetching } = useQuery({
    queryKey: ['staff', viewStoreId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/staff?storeId=${viewStoreId}`)
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || "Failed to fetch staff")
      }
      return response.json()
    },
    enabled: viewStoreId === "all" 
      ? (accessibleStores.length > 0) 
      : (!!viewStoreId && viewStoreId !== ""),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  const updateStaffMutation = useMutation({
    mutationFn: async ({ id, userId, role, fullName }: { id: string, userId: string, role: string, fullName: string }) => {
      // 1. Update Profile (Base details)
      const { error: pErr } = await supabase
        .from('profiles')
        .update({ role, full_name: fullName })
        .eq('id', userId)
      if (pErr) throw pErr

      // 2. Update Store Assignment if it exists (multi-store case)
      if (!id.startsWith('p-')) {
        const { error: suErr } = await supabase
          .from('store_users')
          .update({ role })
          .eq('id', id)
        if (suErr) throw suErr
      }
      
      return { id, role, fullName }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', viewStoreId] })
      toast({ title: "Staff details updated", variant: "success" })
      setIsEditOpen(false)
    },
    onError: (err: any) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" })
    }
  })

  const deleteStaffMutation = useMutation({
    mutationFn: async (member: any) => {
      if (member.id.startsWith('p-')) {
        // This is a primary store user (no store_users entry), so we clear their store_id from profiles
        // We only do this if we are deleting from their PRIMARY store
        const { error } = await supabase
          .from('profiles')
          .update({ store_id: null })
          .eq('id', member.user_id)
        if (error) throw error
      } else {
        // Multi-store user: remove the specific assignment
        const { error } = await supabase
          .from('store_users')
          .delete()
          .eq('id', member.id)
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', viewStoreId] })
      toast({ title: "Staff access removed", variant: "success" })
    },
    onError: (err: any) => {
      toast({ title: "Deletion failed", description: err.message, variant: "destructive" })
    }
  })

  const handleCreateAccount = async () => {
    if (!email || !password || !fullName || !inviteRole || !targetStoreId) {
      toast({ title: "Please fill all fields", variant: "destructive" })
      return
    }
    
    try {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          fullName,
          role: inviteRole,
          storeId: targetStoreId
        })
      })

      const result = await response.json()

      if (!response.ok) throw new Error(result.error || "Failed to create account")

      queryClient.invalidateQueries({ queryKey: ['staff', viewStoreId] })
      toast({ title: "Staff account created", description: `User ${email} is now active.`, variant: "success" })
      setIsCreateOpen(false)
      setEmail("")
      setPassword("")
      setFullName("")
    } catch (err: any) {
      toast({ title: "Creation failed", description: err.message, variant: "destructive" })
    }
  }

  // Only show full-page loader if we have NO data at all
  if (isLoading && !staff) {
    return (
      <div className="p-8 flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary opacity-20" />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8 max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            Staff Management
            <Users className="w-8 h-8 text-primary" />
          </h1>
          <p className="text-muted-foreground font-medium mt-1">Manage employee access and roles across your locations.</p>
        </div>

        <div className="flex items-center gap-3">
          {accessibleStores.length > 0 ? (
            <Select value={viewStoreId} onValueChange={(val: any) => setViewStoreId(val as string)}>
              <SelectTrigger className="w-[200px] h-12 rounded-xl bg-card border-none ring-1 ring-black/5 shadow-sm font-bold">
                <SelectValue placeholder="Filter by Store" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-2xl overflow-hidden">
                <SelectItem value="all" className="font-bold">All Locations</SelectItem>
                {accessibleStores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="w-[200px] h-12 rounded-xl bg-muted animate-pulse" />
          )}

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['staff', viewStoreId] })}
            className={cn(
              "rounded-xl h-12 w-12 bg-card border-none ring-1 ring-black/5 shadow-sm active:scale-95 transition-all",
              isFetching && "animate-spin"
            )}
            disabled={isFetching}
          >
            <RefreshCcw className="w-5 h-5 opacity-40" />
          </Button>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger render={
            <Button className="rounded-2xl h-12 px-6 font-black shadow-lg shadow-primary/20 gap-2 active:scale-95 transition-all">
              <UserPlus className="w-5 h-5" />
              Create Staff Account
            </Button>
          } />
          <DialogContent className="sm:max-w-[450px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
            <div className="p-8 bg-primary text-primary-foreground">
              <DialogTitle className="text-3xl font-black tracking-tight flex items-center gap-3">
                Create Account
                <ShieldCheck className="w-8 h-8 opacity-50" />
              </DialogTitle>
              <DialogDescription className="text-primary-foreground/70 font-medium mt-2">
                Manually provision a new employee account.
              </DialogDescription>
            </div>
            <div className="p-8 space-y-5">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
                  <div className="relative">
                    <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      value={fullName} 
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. John Doe" 
                      className="h-11 rounded-xl bg-muted/50 border-none pl-11 ring-1 ring-black/5 focus-visible:ring-primary shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="employee@example.com" 
                      className="h-11 rounded-xl bg-muted/50 border-none pl-11 ring-1 ring-black/5 focus-visible:ring-primary shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Initial Password</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      type="password"
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="h-11 rounded-xl bg-muted/50 border-none pl-11 ring-1 ring-black/5 focus-visible:ring-primary shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Assigned Role</Label>
                  <Select value={inviteRole} onValueChange={(val: any) => setInviteRole(val as string)}>
                    <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-none ring-1 ring-black/5 focus-visible:ring-primary shadow-sm">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl mt-2 overflow-hidden">
                      <SelectItem value="cashier" className="py-3 px-4 focus:bg-primary/10">Cashier (Sales and POS)</SelectItem>
                      <SelectItem value="manager" className="py-3 px-4 focus:bg-primary/10">Manager (Store-wide Management)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Assign to Store</Label>
                  {accessibleStores.length > 0 ? (
                    <Select value={targetStoreId} onValueChange={(val: any) => setTargetStoreId(val as string)}>
                      <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-none ring-1 ring-black/5 focus-visible:ring-primary shadow-sm">
                        <SelectValue placeholder={currentStoreName} />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-2xl mt-2 overflow-hidden">
                        {accessibleStores.map((store) => (
                          <SelectItem key={store.id} value={store.id} className="py-3 px-4 focus:bg-primary/10">
                            {store.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="h-11 rounded-xl bg-muted animate-pulse" />
                  )}
                </div>
              </div>
              <Button onClick={handleCreateAccount} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20">
                Register Employee
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>

      <div className="bg-card border-none shadow-sm rounded-3xl overflow-hidden ring-1 ring-black/[0.03]">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="w-[300px] h-14 text-[10px] font-black uppercase tracking-widest">Employee</TableHead>
              <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest">Store</TableHead>
              <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest">Role</TableHead>
              <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest">Joined</TableHead>
              <TableHead className="w-[100px] h-14 text-[10px] font-black uppercase tracking-widest text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff?.map((member: any) => (
              <TableRow key={member.id} className="group hover:bg-muted/30 border-t border-border/40 transition-colors">
                <TableCell className="py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
                      <UserCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-black tracking-tight">{Array.isArray(member.profiles) ? member.profiles[0]?.full_name : member.profiles?.full_name || "Unknown Name"}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-0.5">
                        {Array.isArray(member.profiles) ? member.profiles[0]?.email : member.profiles?.email || "No Email Provided"}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <Badge variant="outline" className="rounded-lg py-0 px-2 text-[10px] font-black uppercase bg-muted/30 border-none ring-1 ring-black/5 whitespace-nowrap">
                    {Array.isArray(member.store) ? member.store[0]?.name : member.store?.name || "Unknown Store"}
                  </Badge>
                </TableCell>
                <TableCell className="py-4">
                  <Badge variant="secondary" className="rounded-lg py-0 px-2 text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border-none">
                    {member.role === 'admin' ? 'Owner/Admin' : member.role}
                  </Badge>
                </TableCell>
                <TableCell className="py-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    {new Date(member.created_at).toLocaleDateString()}
                  </p>
                </TableCell>
                <TableCell className="py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-xl hover:bg-muted"
                      onClick={() => {
                        setEditingStaff(member)
                        setEditName(Array.isArray(member.profiles) ? member.profiles[0]?.full_name : member.profiles?.full_name || "")
                        setEditRole(member.role)
                        setIsEditOpen(true)
                      }}
                    >
                      <Pencil className="w-4 h-4 opacity-40" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-xl hover:bg-red-50 hover:text-red-500"
                      onClick={() => {
                        if (confirm(`Are you sure you want to remove access for ${Array.isArray(member.profiles) ? member.profiles[0]?.full_name : member.profiles?.full_name || "this user"}?`)) {
                          deleteStaffMutation.mutate(member)
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 opacity-40" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {(!staff || staff.length === 0) && (
              <TableRow>
                <TableCell colSpan={4} className="h-60 text-center">
                  <div className="flex flex-col items-center justify-center opacity-20">
                    <Users className="w-12 h-12 mb-4" />
                    <p className="font-black text-lg tracking-tight">No team members yet</p>
                    <p className="text-[10px] font-black uppercase tracking-widest">Add your first employee to get started</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Edit Staff Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="p-8 bg-card border-b">
            <DialogTitle className="text-3xl font-black tracking-tight flex items-center gap-3">
              Edit Staff
              <Pencil className="w-6 h-6 text-primary opacity-50" />
            </DialogTitle>
            <DialogDescription className="font-medium mt-2">
              Update name and system role for this employee.
            </DialogDescription>
          </div>
          <div className="p-8 space-y-5">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
                <div className="relative">
                  <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Full Name" 
                    className="h-11 rounded-xl bg-muted/50 border-none pl-11 ring-1 ring-black/5 focus-visible:ring-primary shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">System Role</Label>
                <Select value={editRole} onValueChange={(val: any) => val && setEditRole(val as string)}>
                  <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-none ring-1 ring-black/5 focus-visible:ring-primary shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl mt-2 overflow-hidden">
                    <SelectItem value="cashier" className="py-3 px-4 focus:bg-primary/10 font-bold uppercase tracking-widest text-[10px]">Cashier</SelectItem>
                    <SelectItem value="manager" className="py-3 px-4 focus:bg-primary/10 font-bold uppercase tracking-widest text-[10px]">Manager</SelectItem>
                    <SelectItem value="admin" className="py-3 px-4 focus:bg-primary/10 font-bold uppercase tracking-widest text-[10px]">Admin/Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button 
              onClick={() => updateStaffMutation.mutate({ 
                id: editingStaff?.id, 
                userId: editingStaff?.user_id, 
                role: editRole, 
                fullName: editName 
              })} 
              className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
              disabled={updateStaffMutation.isPending}
            >
              {updateStaffMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
