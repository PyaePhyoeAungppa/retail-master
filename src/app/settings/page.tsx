"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/use-auth-store"
import { useToastStore } from "@/store/use-toast-store"
import { StorePaymentAccount } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Bell, Shield, Store, Loader2, Save, CreditCard, Plus, Trash2, TerminalSquare, XCircle, Clock, User, AlertTriangle, Monitor, Info, Printer, Settings2, Unlink } from "lucide-react"
import { usePrinterSettings } from "@/hooks/use-printer-settings"
import { Switch } from "@/components/ui/switch"
import { USBPrinterDriver } from "@/lib/usb-printer-driver"

export default function SettingsPage() {
  const { storeId, role } = useAuthStore()
  const isAdmin = role === 'admin' || role === 'owner' || role === 'superadmin'
  const { toast } = useToastStore()
  const { settings: printerSettings, updateSettings: updatePrinterSettings, isLoaded: isPrinterLoaded } = usePrinterSettings()
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
      // 1. First, get the shift name as a fallback for closing linked sessions
      const shiftToClose = activeShifts?.find(s => s.id === shiftId);
      
      // 2. We try to close by ID or Parent ID (The "Correct" way)
      // If parent_shift_id doesn't exist, we'll try to match by name as a fallback
      const { error } = await supabase
        .from('active_shifts')
        .update({ status: 'closed', end_time: new Date().toISOString() })
        .or(`id.eq.${shiftId},parent_shift_id.eq.${shiftId},name.eq."${shiftToClose?.name}"`)
        .eq('store_id', storeId)
        .eq('status', 'active')
        
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active_shifts', storeId] })
      toast({ title: "Shift Ended & Terminals Released", variant: "success" })
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
  const [confirmCloseId, setConfirmCloseId] = useState<string | null>(null)
  const [hasLinkedSessions, setHasLinkedSessions] = useState(false)

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
  
  // SESSIONS WITHOUT AN OPEN MASTER SHIFT (Safety Net)
  const orphanedSessions = sessionAssignments.filter((s: any) => 
    !s.parent_shift_id || !masterShifts.some(m => m.id === s.parent_shift_id)
  )


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

  const handleConnectPrinter = async () => {
    if (typeof navigator === 'undefined' || !(navigator as any).usb) {
      toast({ 
        title: "Browser Not Supported", 
        description: "Your browser does not support USB devices. Try Chrome or Edge.", 
        variant: "destructive" 
      })
      return
    }

    try {
      const device = await (navigator as any).usb.requestDevice({ filters: [] })
      updatePrinterSettings({
        connectedDevice: {
          vendorId: device.vendorId,
          productId: device.productId,
          productName: device.productName || "Unknown Printer"
        }
      })
      toast({ title: "Printer Paired", description: "You might need to grant 'Direct Access' using Zadig for silent printing.", variant: "success" })
    } catch (err: any) {
      if (err.name === 'SecurityError' || err.message?.includes('Access denied')) {
        toast({ 
          title: "Access Denied", 
          description: "Driver lock detected. Use Zadig to set your printer driver to 'WinUSB'.", 
          variant: "destructive" 
        })
      } else if (err.name !== 'NotFoundError') {
        toast({ title: "Connection Failed", description: err.message, variant: "destructive" })
      }
    }
  }

  const handleTestPrint = async () => {
    if (!printerSettings.connectedDevice) return

    try {
      const pairedDevices = await (navigator as any).usb.getDevices()
      const device = pairedDevices.find(
        (d: any) => d.vendorId === printerSettings.connectedDevice?.vendorId && 
             d.productId === printerSettings.connectedDevice?.productId
      )

      if (!device) {
        toast({ title: "Printer Not Found", description: "Please re-connect your USB printer.", variant: "destructive" })
        return
      }

      const driver = new USBPrinterDriver(device)
      const connected = await driver.connect()

      if (connected) {
        await driver.printReceipt({
          storeName: formData.name || "Test Store",
          brand: "Test Connection",
          address: "123 Logic Lane",
          transactionId: "TEST-001",
          date: new Date().toLocaleString(),
          customerName: "Test Customer",
          items: [{ name: "Test Product", price: 10.00, quantity: 1 }],
          total: 10.00,
          tax: 1.00,
          grandTotal: 11.00,
          currency: "$",
          cashierName: "Admin",
          paymentMethod: "Cash",
          footerText: "Connection verified successfully!"
        })
        toast({ title: "Test Receipt Printed", variant: "success" })
      } else {
        throw new Error("Could not claim printer interface")
      }
    } catch (err: any) {
      if (err.message === "ACCESS_DENIED") {
        toast({ 
          title: "Windows Driver Locked", 
          description: "Browser cannot take control. Please use Zadig utility to replace the driver with 'WinUSB'.", 
          variant: "destructive" 
        })
      } else {
        toast({ title: "Test Failed", description: err.message, variant: "destructive" })
      }
    }
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
                             setConfirmCloseId(master.id)
                             setHasLinkedSessions(linkedSessions.length > 0)
                          }}
                        >
                          End Shift & Release All
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

                {/* Orphaned / Unlinked Sessions Recovery */}
                {orphanedSessions.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-dashed">
                    <div className="flex items-center gap-3 mb-4 opacity-60">
                       <AlertTriangle className="w-5 h-5 text-amber-500" />
                       <h4 className="font-black text-sm uppercase tracking-widest text-amber-600">Unlinked Active Sessions</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {orphanedSessions.map((session: any) => {
                        const assignedStaff = staff?.find((s: any) => s.user_id === session.cashier_id);
                        return (
                          <div key={session.id} className="flex items-center justify-between p-4 rounded-2xl bg-amber-50/30 border border-amber-200/50 relative overflow-hidden group">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-amber-500 border border-amber-100 shadow-sm">
                                <TerminalSquare className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-bold text-xs">{assignedStaff?.profiles?.full_name || "Self-Started"}</p>
                                <p className="text-[9px] font-bold text-amber-600/70 uppercase tracking-widest">
                                  Terminal: {session.terminal} (Stuck)
                                </p>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-3 rounded-lg text-amber-700 hover:bg-amber-100 font-bold text-[9px] uppercase tracking-widest"
                              onClick={() => closeShiftMutation.mutate(session.id)}
                            >
                              Release Terminal
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                    <p className="mt-3 text-[9px] font-medium text-muted-foreground italic px-2">
                       These sessions are active but not linked to a master shift. "Release" them to make the terminals available again.
                    </p>
                  </div>
                )}
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
        {/* Local Hardware Settings (Printer) */}
        <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-primary" />
                Local Terminal Hardware
              </div>
              <Badge variant="outline" className="bg-white text-[10px] font-bold uppercase tracking-tight text-muted-foreground border-dashed">
                Browser Local Storage
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10">
              <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-primary">Device-Specific Settings</p>
                <p className="text-xs text-primary/70 font-medium">
                  These settings are saved locally on this physical device/browser. They will not sync to other cashier terminals.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-2xl border bg-white shadow-sm ring-1 ring-black/5">
                  <div className="space-y-1">
                    <p className="text-sm font-black tracking-tight">Auto-Print Receipt</p>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Trigger print dialog after checkout</p>
                  </div>
                  <Switch 
                    checked={printerSettings.autoPrint}
                    onCheckedChange={(checked) => updatePrinterSettings({ autoPrint: checked })}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Connect Hardware</Label>
                  {printerSettings.connectedDevice ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 border border-emerald-100 group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white text-emerald-600 flex items-center justify-center shadow-sm">
                            <Printer className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-emerald-900">{printerSettings.connectedDevice.productName}</p>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">
                              Ready • ID {printerSettings.connectedDevice.vendorId}:{printerSettings.connectedDevice.productId}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleTestPrint}
                            className="h-9 px-4 rounded-xl font-black text-[9px] uppercase tracking-widest bg-white"
                          >
                            Test Print
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => updatePrinterSettings({ connectedDevice: null })}
                            className="text-emerald-300 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Unlink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-100/50 border border-slate-200/50 text-slate-500">
                        <Info className="w-4 h-4 shrink-0" />
                        <p className="text-[9px] font-bold leading-tight">
                          Getting "Access Denied"? Ensure you've replaced your USB driver with <span className="text-primary italic">WinUSB</span> via Zadig.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      onClick={handleConnectPrinter}
                      variant="outline"
                      className="w-full h-16 rounded-2xl border-dashed border-2 flex flex-col gap-1 hover:border-primary/50 hover:bg-primary/5 transition-all"
                    >
                      <Plus className="w-4 h-4 text-muted-foreground" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Select USB Printer</span>
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Receipt Paper Size</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['80mm', '58mm'].map((size) => (
                      <button
                        key={size}
                        onClick={() => updatePrinterSettings({ paperSize: size as any })}
                        className={cn(
                          "h-12 rounded-xl text-sm font-black uppercase tracking-widest transition-all border",
                          printerSettings.paperSize === size
                            ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                            : "bg-white text-muted-foreground border-slate-200 hover:border-primary/30"
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Custom Receipt Footer</Label>
                <textarea 
                  value={printerSettings.footerText}
                  onChange={(e) => updatePrinterSettings({ footerText: e.target.value })}
                  placeholder="e.g. Come back and see us soon!"
                  className="w-full h-32 rounded-2xl bg-white border-none ring-1 ring-black/5 focus:ring-2 focus:ring-primary p-4 text-sm font-medium shadow-sm resize-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom Confirmation Dialog */}
      <Dialog open={!!confirmCloseId} onOpenChange={(open) => !open && setConfirmCloseId(null)}>
        <DialogContent className="rounded-[2.5rem] p-8 gap-6 max-w-sm border-none shadow-2xl">
          <div className="flex flex-col items-center text-center gap-6">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-500 flex items-center justify-center shadow-inner ring-1 ring-amber-100">
               <Info className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black tracking-tight leading-none">End Shift Session?</h3>
              <p className="text-muted-foreground font-medium text-sm leading-relaxed px-4">
                {hasLinkedSessions 
                  ? "There are active staff linked to this shift. Closing it will automatically end their sessions and release their terminals."
                  : "Are you sure you want to end this store shift? This will finalize all current sales activity."
                }
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button 
              className="w-full rounded-2xl h-12 font-black uppercase tracking-widest text-[10px] bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20"
              onClick={() => {
                if (confirmCloseId) closeShiftMutation.mutate(confirmCloseId)
                setConfirmCloseId(null)
              }}
            >
              End Shift & Terminate Sessions
            </Button>
            <Button 
              variant="ghost" 
              className="w-full rounded-2xl h-12 font-bold text-muted-foreground"
              onClick={() => setConfirmCloseId(null)}
            >
              Go Back
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
