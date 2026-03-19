"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/store/use-auth-store"
import { useToastStore } from "@/store/use-toast-store"
import { cn } from "@/lib/utils"
import {
  ShieldAlert,
  Users,
  Store,
  UserPlus,
  Copy,
  Check,
  Search,
  MoreHorizontal,
  Plus,
  Mail,
  Lock,
  Loader2,
  RefreshCcw,
  ExternalLink,
  ChevronRight,
  UserCircle,
  Building,
  Key
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function AppConfigsPage() {
  const { role, isProfileLoaded } = useAuthStore()
  const { toast } = useToastStore()
  const queryClient = useQueryClient()

  // UI State
  const [searchTerm, setSearchTerm] = useState("")
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [createdUserData, setCreatedUserData] = useState<any>(null)
  const [isCopying, setIsCopying] = useState(false)

  // Creation Form State
  const [formName, setFormName] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formPass, setFormPass] = useState("")
  const [formRole, setFormRole] = useState("admin")
  const [selectedStores, setSelectedStores] = useState<string[]>([])

  // 1. Fetch Users
  const { data: users, isLoading: usersLoading, isFetching: usersFetching } = useQuery({
    queryKey: ['superadmin-users'],
    queryFn: async () => {
      const res = await fetch('/api/superadmin/users')
      if (!res.ok) throw new Error("Failed to fetch users")
      return res.json()
    },
    enabled: role === 'superadmin'
  })

  // 2. Fetch Stores
  const { data: stores, isLoading: storesLoading } = useQuery({
    queryKey: ['superadmin-stores'],
    queryFn: async () => {
      const res = await fetch('/api/superadmin/stores')
      if (!res.ok) throw new Error("Failed to fetch stores")
      return res.json()
    },
    enabled: role === 'superadmin'
  })

  // 3. Create User Mutation
  const createUserMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch('/api/superadmin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Creation failed")
      }
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['superadmin-users'] })
      setCreatedUserData(data)
      setIsInviteOpen(true)
      toast({ title: "User created successfully", variant: "success" })
      // Reset form
      setFormName("")
      setFormEmail("")
      setFormPass("")
      setSelectedStores([])
    },
    onError: (err: any) => {
      toast({ title: "Creation failed", description: err.message, variant: "destructive" })
    }
  })

  const copyInviteToClipboard = () => {
    if (!createdUserData) return
    setIsCopying(true)
    const text = `
✨ Welcome to RetailMaster! ✨

Your demo account is ready:
📧 Email: ${createdUserData.email}
🔑 Password: ${createdUserData.password}
🌐 Login at: ${createdUserData.loginUrl}

Please log in and create your first store to get started!
`.trim()

    navigator.clipboard.writeText(text)
    setTimeout(() => setIsCopying(false), 2000)
    toast({ title: "Invitation copied to clipboard" })
  }

  // --- Auth Guard ---
  if (!isProfileLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary opacity-20" />
      </div>
    )
  }

  if (role !== 'superadmin') {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-4 px-6 text-center">
        <div className="w-20 h-20 rounded-[2.5rem] bg-red-50 flex items-center justify-center text-red-500 shadow-xl shadow-red-100/50 mb-2">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black tracking-tight">Access Denied</h1>
        <p className="text-muted-foreground max-w-[400px]">This configuration dashboard is restricted to system administrators only.</p>
        <Button variant="outline" className="rounded-2xl px-8 h-12 mt-4" onClick={() => window.location.href = '/'}>
          Return Home
        </Button>
      </div>
    )
  }

  const filteredUsers = users?.filter((u: any) =>
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Page Header ── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px] uppercase font-black tracking-widest bg-primary/10 text-primary border-none">System Root</Badge>
          </div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-4">
            Platform Configs
            <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
          </h1>
          <p className="text-muted-foreground font-medium mt-1">Cross-store user management and system-wide visibility.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['superadmin-users'] })}
            className={cn(
              "rounded-xl h-12 w-12 bg-card border-none ring-1 ring-black/5 shadow-sm active:scale-95 transition-all text-muted-foreground",
              usersFetching && "animate-spin"
            )}
          >
            <RefreshCcw className="w-5 h-5 opacity-40" />
          </Button>

          {/* Base UI DialogTrigger uses render prop instead of asChild */}
          <Dialog>
            <DialogTrigger render={
              <Button className="rounded-2xl h-12 px-6 font-black shadow-lg shadow-primary/20 gap-2 active:scale-95 transition-all">
                <UserPlus className="w-5 h-5" />
                Invite System User
              </Button>
            } />
            <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
              <div className="p-8 bg-zinc-900 text-white">
                <DialogTitle className="text-3xl font-black tracking-tight">System Invitation</DialogTitle>
                <DialogDescription className="text-zinc-400 font-medium mt-2">
                  Create a platform account with optional store links.
                </DialogDescription>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
                      <Input
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="e.g. Demo Admin"
                        className="h-11 rounded-xl bg-muted/50 border-none ring-1 ring-black/5 focus-visible:ring-primary"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">System Role</Label>
                      <Select value={formRole} onValueChange={(val: any) => setFormRole(val as string)}>
                        <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-none ring-1 ring-black/5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                          <SelectItem value="admin">Store Owner/Admin</SelectItem>
                          <SelectItem value="superadmin">Super Admin (System)</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="cashier">Cashier</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email</Label>
                    <Input
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="demo@retailmaster.store"
                      className="h-11 rounded-xl bg-muted/50 border-none ring-1 ring-black/5 focus-visible:ring-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Temporary Password</Label>
                    <div className="relative">
                      <Input
                        type="text"
                        value={formPass}
                        onChange={(e) => setFormPass(e.target.value)}
                        placeholder="Auto-generate or type"
                        className="h-11 rounded-xl bg-muted/50 border-none ring-1 ring-black/5 focus-visible:ring-primary pr-20"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormPass(Math.random().toString(36).slice(-8).toUpperCase())}
                        className="absolute right-1 top-1 text-[10px] font-black uppercase text-primary h-9 rounded-lg"
                      >
                        Generate
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Initial Store Links (Searchable)</Label>
                    <div className="max-h-[120px] overflow-y-auto space-y-2 p-2 rounded-xl bg-muted/30 ring-1 ring-black/5">
                      {stores?.map((store: any) => (
                        <div key={store.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-white rounded-lg transition-colors cursor-pointer group" onClick={() => {
                          setSelectedStores(prev => prev.includes(store.id) ? prev.filter(id => id !== store.id) : [...prev, store.id])
                        }}>
                          <div className={cn("w-4 h-4 rounded-md border-2 transition-all", selectedStores.includes(store.id) ? "bg-primary border-primary" : "border-muted-foreground/30")}>
                            {selectedStores.includes(store.id) && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="text-xs font-bold">{store.name}</span>
                          <span className="text-[9px] text-muted-foreground ml-auto opacity-0 group-hover:opacity-100">{store.location || 'No Location'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => createUserMutation.mutate({
                    email: formEmail,
                    password: formPass,
                    fullName: formName,
                    role: formRole,
                    storeIds: selectedStores
                  })}
                  disabled={createUserMutation.isPending}
                  className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
                >
                  {createUserMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Dispatch Invitations"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ── Tabs ── */}
      {/* FIX: Removed nested space-y-6 on both Tabs and the container div inside.
               Removed pb-2 and centering wrapper that caused tab misalignment.
               TabsList is now full-width with inline flex; triggers grow evenly. */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="w-full bg-muted/50 p-1.5 h-14 rounded-2xl ring-1 ring-black/5 flex overflow-hidden">
          <TabsTrigger
            value="users"
            className="flex-1 rounded-xl px-4 md:px-8 font-black text-[10px] md:text-xs uppercase tracking-widest gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Users className="w-4 h-4" />
            Platform Users
          </TabsTrigger>
          <TabsTrigger
            value="stores"
            className="flex-1 rounded-xl px-4 md:px-8 font-black text-[10px] md:text-xs uppercase tracking-widest gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Store className="w-4 h-4" />
            Global Stores
          </TabsTrigger>
        </TabsList>

        {/* ── Users Tab ── */}
        <TabsContent value="users" className="space-y-6 mt-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-40" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search accounts..."
                className="h-12 bg-card border-none ring-1 ring-black/5 rounded-2xl pl-11 shadow-sm font-medium w-full"
              />
            </div>
            <div className="flex items-center gap-2 sm:ml-auto">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Showing {filteredUsers?.length || 0} Accounts
              </span>
            </div>
          </div>

          <div className="bg-card border-none shadow-sm rounded-3xl overflow-hidden ring-1 ring-black/[0.03]">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="w-[300px] h-14 text-[10px] font-black uppercase tracking-widest">User Identity</TableHead>
                    <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest">Role</TableHead>
                    <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest">Active Store Assignments</TableHead>
                    <TableHead className="w-[100px] h-14 text-[10px] font-black uppercase tracking-widest text-right px-8">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers?.map((u: any) => (
                    <TableRow key={u.id} className="group hover:bg-muted/20 border-t border-border/40 transition-colors">
                      <TableCell className="py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-white">
                            <UserCircle className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-black tracking-tight leading-none text-md mb-1">{u.full_name}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{u.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "rounded-lg py-0 px-2 text-[10px] font-black uppercase tracking-widest border-none",
                          u.role === 'superadmin' ? "bg-zinc-900 text-white shadow-lg" : "bg-primary/10 text-primary"
                        )}>
                          {u.role === 'superadmin' ? 'Root Admin' : u.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          {u.assignments?.length > 0 ? (
                            u.assignments.map((a: any) => (
                              <Badge key={a.id} variant="outline" className="rounded-lg bg-muted/40 border-none ring-1 ring-black/5 text-[9px] font-bold py-0.5">
                                {a.store_name}
                              </Badge>
                            ))
                          ) : u.primary_store ? (
                            <Badge variant="outline" className="rounded-lg bg-primary/5 border-none ring-1 ring-primary/10 text-[9px] font-bold text-primary py-0.5">
                              {u.primary_store.name} (Primary)
                            </Badge>
                          ) : (
                            <span className="text-[9px] font-black uppercase text-muted-foreground/40 italic">Standalone User</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right px-8">
                        <Button variant="ghost" size="icon" className="rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* ── Stores Tab ── */}
        <TabsContent value="stores" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores?.map((s: any) => (
              <div key={s.id} className="bg-card p-6 rounded-[2rem] ring-1 ring-black/5 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group border-b-4 border-b-transparent hover:border-b-primary">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10 transition-transform group-hover:scale-110">
                    <Store className="w-7 h-7 text-primary" />
                  </div>
                  <Badge variant="secondary" className="rounded-full px-3 text-[9px] font-black uppercase tracking-tighter bg-muted/50 border-none">
                    Store ID: {s.id.slice(0, 8)}...
                  </Badge>
                </div>

                <h3 className="text-xl font-black tracking-tight mb-2 group-hover:text-primary transition-colors">{s.name}</h3>
                <div className="flex items-center gap-2 mb-6">
                  <p className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                    <Building className="w-3 h-3 opacity-30" />
                    {s.location || 'Global Headquarters'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-muted/40 p-4 rounded-2xl text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mb-1">Staff</p>
                    <p className="text-xl font-black">{s.staffCount}</p>
                  </div>
                  <div className="bg-muted/40 p-4 rounded-2xl text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mb-1">Products</p>
                    <p className="text-xl font-black">{s.productCount}</p>
                  </div>
                </div>

                <Button variant="outline" className="w-full rounded-2xl border-none ring-1 ring-black/5 h-11 font-black text-[10px] uppercase tracking-widest group-hover:bg-primary group-hover:text-white transition-all">
                  Manage Resources
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Invitation Card Modal ── */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[3rem] p-0 overflow-hidden border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)]">
          <div className="p-8 text-center space-y-4 bg-zinc-950 text-white">
            <div className="w-16 h-16 rounded-[1.5rem] bg-primary/20 flex items-center justify-center mx-auto mb-2">
              <Key className="w-8 h-8 text-primary shadow-lg" />
            </div>
            <DialogTitle className="text-3xl font-black tracking-tight">Passport Ready</DialogTitle>
            <DialogDescription className="text-zinc-400 font-bold">The demo invitation is prepared and ready for dispatch.</DialogDescription>
          </div>

          <div className="p-8 space-y-8 bg-black">
            <div className="bg-zinc-900/50 rounded-3xl p-6 border border-white/5 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Badge className="font-black italic">BETA_INVITE</Badge>
              </div>

              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-primary/70">Login Portal</p>
                <p className="text-sm font-bold text-white/90">retailmaster.store/login</p>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-4 border-t border-white/5">
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">ID Credentials</p>
                  <p className="text-sm font-black text-white">{createdUserData?.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Secure Key</p>
                  <p className="text-sm font-black text-white tracking-widest">{createdUserData?.password}</p>
                </div>
              </div>
            </div>

            <Button
              onClick={copyInviteToClipboard}
              className={cn(
                "w-full h-16 rounded-[1.5rem] font-black uppercase tracking-widest text-xs transition-all shadow-xl",
                isCopying ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20" : "bg-primary hover:bg-primary/90 shadow-primary/20"
              )}
            >
              {isCopying ? (
                <><Check className="w-5 h-5 mr-2" /> Copied Text</>
              ) : (
                <><Copy className="w-5 h-5 mr-2" /> Share Connection Message</>
              )}
            </Button>

            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600 text-center italic">
              Platform Provisioning Core v1.4
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}