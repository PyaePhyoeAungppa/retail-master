"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/store/use-auth-store"
import { useToastStore } from "@/store/use-toast-store"
import { StorePaymentAccount } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Moon, Sun, Monitor, Bell, Shield, Store, Loader2, Save, CreditCard, Plus, Trash2, TerminalSquare, XCircle, Clock } from "lucide-react"

export default function SettingsPage() {
  const { storeId, role } = useAuthStore()
  const isAdmin = role === 'admin' || role === 'owner' || role === 'superadmin'
  const { toast } = useToastStore()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    address: ""
  })

  const { data: store, isLoading } = useQuery({
    queryKey: ['store', storeId],
    queryFn: async () => {
      if (!storeId) return null
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!storeId
  })

  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name || "",
        brand: store.brand || "",
        address: store.address || ""
      })
    }
  }, [store])

  // Terminals & Shifts State & Logic
  const [newTerminal, setNewTerminal] = useState({ name: "", code: "" })

  // Payment Accounts State & Logic
  const [newAccount, setNewAccount] = useState({
    payment_name: "",
    account_name: "",
    account_number: ""
  })

  // Fetch Accounts
  const { data: bankAccounts, isLoading: isLoadingAccounts } = useQuery<StorePaymentAccount[]>({
    queryKey: ['store-payment-accounts', storeId],
    queryFn: async () => {
      if (!storeId) return []
      const { data, error } = await supabase
        .from('store_payment_accounts')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data
    },
    enabled: !!storeId
  })

  // Add Account Mutation
  const addAccountMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('store_payment_accounts')
        .insert([{ ...data, store_id: storeId }])
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-payment-accounts', storeId] })
      setNewAccount({ payment_name: "", account_name: "", account_number: "" })
      toast({ title: "Account Added", variant: "success" })
    }
  })

  // Delete Account Mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('store_payment_accounts')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-payment-accounts', storeId] })
      toast({ title: "Account Removed", variant: "success" })
    }
  })

  // Terminals & Shifts Queries
  const { data: terminals, isLoading: isLoadingTerminals } = useQuery({
    queryKey: ['terminals', storeId],
    queryFn: async () => {
      if (!storeId) return []
      const { data, error } = await supabase.from('terminals').select('*').eq('store_id', storeId).order('created_at', { ascending: true })
      if (error) throw error
      return data
    },
    enabled: !!storeId
  })

  const { data: activeShifts, isLoading: isLoadingShifts } = useQuery({
    queryKey: ['active_shifts', storeId],
    queryFn: async () => {
      if (!storeId) return []
      const { data, error } = await supabase.from('active_shifts').select('*').eq('store_id', storeId).eq('status', 'active').order('start_time', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!storeId
  })

  // Terminals & Shifts Mutations
  const addTerminalMutation = useMutation({
    mutationFn: async (terminal: { name: string; code: string }) => {
      const { error } = await supabase.from('terminals').insert([{ ...terminal, store_id: storeId }])
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terminals', storeId] })
      setNewTerminal({ name: "", code: "" })
      toast({ title: "Terminal Added", variant: "success" })
    }
  })

  const deleteTerminalMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('terminals').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terminals', storeId] })
      toast({ title: "Terminal Removed", variant: "success" })
    }
  })

  const closeShiftMutation = useMutation({
    mutationFn: async (shiftId: string) => {
      const { error } = await supabase.from('active_shifts').update({ status: 'closed', end_time: new Date().toISOString() }).eq('id', shiftId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active_shifts', storeId] })
      toast({ title: "Assignment Ended", variant: "success" })
    }
  })

  // STAFF ASSIGNMENTS LOGIC
  const [assignmentData, setAssignmentData] = useState({
    userId: "",
    terminalId: "",
    masterShiftId: "",
    shiftName: "Morning Shift"
  })

  const [masterShiftName, setMasterShiftName] = useState("Morning Shift")

  const { data: staff, isLoading: isLoadingStaff } = useQuery({
    queryKey: ['staff', storeId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/staff?storeId=${storeId}`)
      if (!response.ok) throw new Error("Failed to fetch staff")
      return response.json()
    },
    enabled: !!storeId
  })

  const cashiers = staff?.filter((s: any) => s.role === 'cashier') || []

  const assignStaffMutation = useMutation({
    mutationFn: async (data: any) => {
      const terminal = terminals?.find(t => t.id === data.terminalId)
      const masterShift = activeShifts?.find(s => s.id === data.masterShiftId)
      
      const { error } = await supabase.from('active_shifts').insert([{
        store_id: storeId,
        terminal_id: data.terminalId,
        cashier_id: data.userId,
        parent_shift_id: data.masterShiftId, // LINK TO MASTER SHIFT
        name: masterShift?.name || data.shiftName,
        terminal: terminal?.name || 'Unknown',
        status: 'active'
      }])
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active_shifts', storeId] })
      setAssignmentData(prev => ({ ...prev, userId: "", terminalId: "" }))
      toast({ title: "Staff Assigned Successfully", variant: "success" })
    },
    onError: (err: any) => {
      toast({ title: "Assignment Failed", description: err.message, variant: "destructive" })
    }
  })

  const openMasterShiftMutation = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.from('active_shifts').insert([{
        store_id: storeId,
        terminal_id: null, // MASTER SHIFT HAS NO TERMINAL
        name: name,
        status: 'active'
      }])
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active_shifts', storeId] })
      toast({ title: "Master Shift Opened", variant: "success" })
    }
  })

  const masterShifts = activeShifts?.filter((s: any) => !s.terminal_id) || []
  const sessionAssignments = activeShifts?.filter((s: any) => s.terminal_id) || []

  const mutation = useMutation({
    mutationFn: async (updatedData: any) => {
      const { data, error } = await supabase
        .from('stores')
        .update(updatedData)
        .eq('id', storeId)
        .select()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store', storeId] })
      queryClient.invalidateQueries({ queryKey: ['settings'] }) // Invalidate nav cache too
      toast({
        title: "Settings Saved",
        description: "Your store information has been updated successfully.",
        variant: "success"
      })
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Could not save settings. Please try again.",
        variant: "destructive"
      })
    }
  })

  const handleSave = () => {
    mutation.mutate(formData)
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-[50vh]">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-12 h-12 bg-primary/20 rounded-full" />
          <p className="text-muted-foreground font-medium">Loading settings...</p>
        </div>
      </div>
    )
  }
  return (
    <div className="p-8 space-y-8 max-w-[1000px] mx-auto">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Global configuration for your POS system.</p>
      </div>

      <div className="grid gap-8">
        <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-lg flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              Store Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Store Name</Label>
                  <Input 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Main Street Boutique" 
                    className="h-12 rounded-xl bg-white/50 border-none ring-1 ring-black/5 focus-visible:ring-primary h-12 px-4 shadow-sm" 
                  />
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Brand/Tagline</Label>
                  <Input 
                    value={formData.brand} 
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Flagship Store" 
                    className="h-12 rounded-xl bg-white/50 border-none ring-1 ring-black/5 focus-visible:ring-primary h-12 px-4 shadow-sm" 
                  />
               </div>
            </div>
            <div className="space-y-2">
               <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Physical Address</Label>
               <Input 
                value={formData.address} 
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Retail Ave, Shopville, ST 12345" 
                className="h-12 rounded-xl bg-white/50 border-none ring-1 ring-black/5 focus-visible:ring-primary h-12 px-4 shadow-sm" 
               />
            </div>
          </CardContent>
        </Card>

        {/* Payment Accounts Card */}
        <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Store Payment Accounts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="bg-primary/5 p-6 rounded-2xl space-y-4 border border-primary/10">
              <p className="text-xs font-black uppercase tracking-widest text-primary/60">Add Local Payment Info</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase">Platform/Bank</Label>
                    <Input 
                      placeholder="e.g. KPay, KBZ Bank" 
                      value={newAccount.payment_name}
                      onChange={(e) => setNewAccount({...newAccount, payment_name: e.target.value})}
                      className="bg-white border-none ring-1 ring-black/5 h-10 px-3"
                    />
                 </div>
                 <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase">Account Name</Label>
                    <Input 
                      placeholder="e.g. Mg Mg" 
                      value={newAccount.account_name}
                      onChange={(e) => setNewAccount({...newAccount, account_name: e.target.value})}
                      className="bg-white border-none ring-1 ring-black/5 h-10 px-3"
                    />
                 </div>
                 <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase">Account Number</Label>
                    <Input 
                      placeholder="e.g. 09..." 
                      value={newAccount.account_number}
                      onChange={(e) => setNewAccount({...newAccount, account_number: e.target.value})}
                      className="bg-white border-none ring-1 ring-black/5 h-10 px-3"
                    />
                 </div>
              </div>
              <Button 
                onClick={() => addAccountMutation.mutate(newAccount)}
                disabled={!newAccount.payment_name || !newAccount.account_name || !newAccount.account_number || addAccountMutation.isPending}
                className="w-full md:w-auto px-8 rounded-xl h-10"
              >
                {addAccountMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Add Account
              </Button>
            </div>

            <div className="space-y-3">
               <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Current Active Accounts</p>
               {isLoadingAccounts ? (
                  <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground/30" /></div>
               ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {bankAccounts?.map((acc) => (
                        <div key={acc.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border group hover:border-primary/30 transition-all">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
                                 <CreditCard className="w-5 h-5" />
                              </div>
                              <div>
                                 <p className="font-bold text-sm tracking-tight">{acc.payment_name}</p>
                                 <p className="text-[10px] font-bold text-muted-foreground tabular-nums">{acc.account_name} • {acc.account_number}</p>
                              </div>
                           </div>
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             className="text-muted-foreground hover:text-destructive h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                             onClick={() => deleteAccountMutation.mutate(acc.id)}
                           >
                              <Trash2 className="w-4 h-4" />
                           </Button>
                        </div>
                     ))}
                     {(!bankAccounts || bankAccounts.length === 0) && (
                        <div className="col-span-full py-8 text-center bg-muted/20 rounded-2xl border border-dashed text-muted-foreground">
                           <p className="text-sm font-medium">No payment accounts added yet.</p>
                        </div>
                     )}
                  </div>
               )}
            </div>
          </CardContent>
        </Card>

        {/* Terminals & Shifts Card */}
        <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-lg flex items-center gap-2">
              <TerminalSquare className="w-5 h-5 text-primary" />
              Terminals & Shifts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            {/* Terminals Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Store Terminals</p>
                {!isAdmin && <p className="text-[10px] text-muted-foreground italic mr-1">Read-only (Admin required to edit)</p>}
              </div>
              
              {isAdmin && (
                <div className="bg-primary/5 p-6 rounded-2xl space-y-4 border border-primary/10 mb-4">
                  <p className="text-xs font-black uppercase tracking-widest text-primary/60">Add Terminal</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black uppercase">Terminal Name</Label>
                      <Input 
                        placeholder="e.g. Counter 01" 
                        value={newTerminal.name}
                        onChange={(e) => setNewTerminal({...newTerminal, name: e.target.value})}
                        className="bg-white border-none ring-1 ring-black/5 h-10 px-3"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black uppercase">Terminal Code</Label>
                      <Input 
                        placeholder="e.g. TERM-01" 
                        value={newTerminal.code}
                        onChange={(e) => setNewTerminal({...newTerminal, code: e.target.value})}
                        className="bg-white border-none ring-1 ring-black/5 h-10 px-3"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={() => addTerminalMutation.mutate(newTerminal)}
                    disabled={!newTerminal.name || !newTerminal.code || addTerminalMutation.isPending}
                    className="w-full md:w-auto px-8 rounded-xl h-10"
                  >
                    {addTerminalMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    Add Terminal
                  </Button>
                </div>
              )}

              {isLoadingTerminals ? (
                <div className="py-4 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground/30" /></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {terminals?.map((term: any) => (
                    <div key={term.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border group hover:border-primary/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
                          <Monitor className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm tracking-tight">{term.name}</p>
                          <p className="text-[10px] font-bold text-muted-foreground tabular-nums">Code: {term.code}</p>
                        </div>
                      </div>
                      {isAdmin && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-muted-foreground hover:text-destructive h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => deleteTerminalMutation.mutate(term.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {(!terminals || terminals.length === 0) && (
                    <div className="col-span-full py-6 text-center bg-muted/20 rounded-2xl border border-dashed text-muted-foreground">
                      <p className="text-sm font-medium">No terminals registered.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Staff Assignments Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Shift & Staff Management</p>
                {isAdmin && <Badge className="bg-primary/10 text-primary border-none text-[9px]">Administrative Mode</Badge>}
              </div>

              {isAdmin && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Master Shift Creation */}
                  <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-200 shadow-inner space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                          <Clock className="w-5 h-5" />
                       </div>
                       <h3 className="font-black tracking-tight">1. Open Store Shift</h3>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest ml-1">New Shift Name</Label>
                      <div className="flex gap-2">
                        <Input 
                          value={masterShiftName}
                          onChange={(e) => setMasterShiftName(e.target.value)}
                          className="bg-white border-none ring-1 ring-black/5 h-11 rounded-xl font-bold"
                          placeholder="e.g. Afternoon Shift"
                        />
                        <Button 
                          onClick={() => openMasterShiftMutation.mutate(masterShiftName)}
                          disabled={!masterShiftName || openMasterShiftMutation.isPending}
                          className="rounded-xl h-11 px-6 shadow-md"
                        >
                          {openMasterShiftMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Open"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Staff Assignment */}
                  <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-200 shadow-inner space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                          <User className="w-5 h-5" />
                       </div>
                       <h3 className="font-black tracking-tight">2. Assign Staff to Terminal</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Active Shift</Label>
                        <select 
                          value={assignmentData.masterShiftId}
                          onChange={(e) => setAssignmentData({...assignmentData, masterShiftId: e.target.value})}
                          className="w-full h-11 rounded-xl bg-white border-none ring-1 ring-black/5 px-4 font-bold text-sm shadow-sm"
                        >
                          <option value="">Select Shift...</option>
                          {masterShifts.map((s: any) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Staff Member</Label>
                        <select 
                          value={assignmentData.userId}
                          onChange={(e) => setAssignmentData({...assignmentData, userId: e.target.value})}
                          className="w-full h-11 rounded-xl bg-white border-none ring-1 ring-black/5 px-4 font-bold text-sm shadow-sm"
                        >
                          <option value="">Staff...</option>
                          {cashiers.map((s: any) => (
                            <option key={s.user_id} value={s.user_id}>{s.profiles.full_name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Available Terminal</Label>
                      <select 
                        value={assignmentData.terminalId}
                        onChange={(e) => setAssignmentData({...assignmentData, terminalId: e.target.value})}
                        className="w-full h-11 rounded-xl bg-white border-none ring-1 ring-black/5 px-4 font-bold text-sm shadow-sm"
                      >
                        <option value="">Choose Terminal...</option>
                        {terminals?.filter((t: any) => !sessionAssignments?.some((as: any) => as.terminal_id === t.id)).map((t: any) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                    <Button 
                      onClick={() => assignStaffMutation.mutate(assignmentData)}
                      disabled={!assignmentData.userId || !assignmentData.terminalId || !assignmentData.masterShiftId || assignStaffMutation.isPending}
                      className="w-full rounded-2xl h-12 font-black uppercase tracking-widest text-xs shadow-lg shadow-emerald-500/10 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800"
                    >
                      {assignStaffMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Deploy Staff"}
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {masterShifts.map((master: any) => {
                  const linkedSessions = sessionAssignments.filter((s: any) => s.parent_shift_id === master.id);
                  return (
                    <div key={master.id} className="space-y-3">
                      <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                           <h4 className="font-black text-lg tracking-tight">{master.name}</h4>
                           <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[8px] h-4 uppercase px-1.5 font-black">Open</Badge>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 font-black text-[9px] uppercase tracking-widest"
                          onClick={() => {
                             if (linkedSessions.length > 0 && !confirm("There are active staff linked to this shift. Closing it will end their sessions too. Proceed?")) return;
                             closeShiftMutation.mutate(master.id)
                          }}
                        >
                          End Shift Content
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {linkedSessions.map((shift: any) => {
                          const assignedStaff = staff?.find((s: any) => s.user_id === shift.cashier_id);
                          return (
                            <div key={shift.id} className="flex items-center justify-between p-5 rounded-[2rem] bg-white border shadow-sm relative overflow-hidden group hover:border-primary/30 transition-all">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center border">
                                  <User className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="font-black text-sm">{assignedStaff?.profiles?.full_name || "Unknown Staff"}</p>
                                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                    Terminal: {shift.terminal}
                                  </p>
                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="rounded-xl h-9 px-3 text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                onClick={() => closeShiftMutation.mutate(shift.id)}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          )
                        })}
                        {linkedSessions.length === 0 && (
                          <div className="col-span-full py-10 text-center bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">No staff assigned to this shift yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {isLoadingShifts || isLoadingStaff ? (
                <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary/20" /></div>
              ) : masterShifts.length === 0 && (
                   <div className="py-20 text-center bg-muted/20 rounded-[3rem] border border-dashed text-muted-foreground">
                      <p className="text-sm font-black uppercase tracking-widest opacity-30">No Active Master Shifts</p>
                      <p className="text-xs font-bold opacity-30 mt-1">Open a shift first to begin assigning staff</p>
                    </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-lg flex items-center gap-2">
              <Monitor className="w-5 h-5 text-primary" />
              Interface Preference
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
             <div className="flex items-center justify-between">
                <div className="space-y-1">
                   <p className="font-bold">Display Theme</p>
                   <p className="text-sm text-muted-foreground">Change the appearance of the POS interface.</p>
                </div>
                <div className="flex bg-muted p-1 rounded-xl">
                   <Button variant="ghost" className="rounded-lg h-9 w-9 p-0 bg-white shadow-sm">
                      <Sun className="w-4 h-4" />
                   </Button>
                   <Button variant="ghost" className="rounded-lg h-9 w-9 p-0 text-muted-foreground">
                      <Moon className="w-4 h-4" />
                   </Button>
                   <Button variant="ghost" className="rounded-lg h-9 w-9 p-0 text-muted-foreground">
                      <Monitor className="w-4 h-4" />
                   </Button>
                </div>
             </div>
             <Separator />
             <div className="flex items-center justify-between">
                <div className="space-y-1">
                   <p className="font-bold">Notifications</p>
                   <p className="text-sm text-muted-foreground">Manage sound and visual alerts for transactions.</p>
                </div>
                <Button variant="outline" className="rounded-xl">Configure Alerts</Button>
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-3 pt-4">
         <Button 
          variant="ghost" 
          className="rounded-xl h-12 px-6 font-bold"
          onClick={() => store && setFormData({
            name: store.name || "",
            brand: store.brand || "",
            address: store.address || ""
          })}
         >
          Discard Changes
         </Button>
         <Button 
          className="rounded-xl h-12 px-10 font-black shadow-xl shadow-primary/20 flex gap-2 active:scale-95 transition-all"
          onClick={handleSave}
          disabled={mutation.isPending}
         >
          {mutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Configuration
            </>
          )}
         </Button>
      </div>
    </div>
  )
}
