"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/store/use-auth-store"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Monitor, CreditCard, CheckCircle2, Loader2, Clock, Play, Plus } from "lucide-react"
import { useToastStore } from "@/store/use-toast-store"

export function TerminalSelector() {
  const { storeId, currentUser, setSessionContext } = useAuthStore()
  const { toast } = useToastStore()
  const queryClient = useQueryClient()
  
  const [selectedTerminalId, setSelectedTerminalId] = useState<string | null>(null)

  const { data: activeShifts, isLoading: shiftsLoading } = useQuery({
    queryKey: ['activeShifts', storeId],
    queryFn: async () => {
      if (!storeId) return []
      const { data, error } = await supabase
        .from('active_shifts')
        .select('*')
        .eq('store_id', storeId)
        .eq('status', 'active')
        .order('start_time', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!storeId
  })

  const { data: terminals, isLoading: terminalsLoading } = useQuery({
    queryKey: ['terminals', storeId],
    queryFn: async () => {
      if (!storeId) return []
      const { data, error } = await supabase
        .from('terminals')
        .select('*')
        .eq('store_id', storeId)
        .eq('is_active', true)
      if (error) throw error
      return data
    },
    enabled: !!storeId
  })

  const hasActiveShift = activeShifts && activeShifts.length > 0;
  const currentShift = hasActiveShift ? activeShifts[0] : null;

  const startShiftMutation = useMutation({
    mutationFn: async (terminalId: string) => {
      const terminal = terminals?.find(t => t.id === terminalId)
      const { data, error } = await supabase
        .from('active_shifts')
        .insert([{
          store_id: storeId,
          terminal_id: terminalId,
          name: `${currentUser?.email?.split('@')[0] || 'Unknown'}'s Shift`,
          terminal: terminal?.name || 'Unknown',
          status: 'active'
        }])
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['activeShift'] })
      queryClient.invalidateQueries({ queryKey: ['activeShifts'] })
      toast({ title: "New Shift started successfully", variant: "success" })
      setSessionContext(data.id, data.terminal_id)
    },
    onError: (error: any) => {
      toast({ title: error.message || "Failed to start shift", variant: "destructive" })
    }
  })

  const handleComplete = () => {
    if (!selectedTerminalId) return;

    if (hasActiveShift && currentShift) {
       // Auto-join the active shift
       toast({ title: `Joined ${currentShift.name}`, variant: "success" })
       setSessionContext(currentShift.id, selectedTerminalId)
    } else {
       // Create new shift automatically
       startShiftMutation.mutate(selectedTerminalId)
    }
  }

  const isLoading = shiftsLoading || terminalsLoading;

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
        <div className="p-8 bg-primary text-primary-foreground">
          <div className="flex items-center gap-2 mb-2">
             {hasActiveShift ? (
               <span className="bg-emerald-500/20 text-emerald-300 py-1 px-3 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> Connect to Shift
               </span>
             ) : (
               <span className="bg-blue-500/20 text-blue-300 py-1 px-3 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <Plus className="w-3 h-3" /> Initialize Shift
               </span>
             )}
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight mt-4 w-full">
            {hasActiveShift ? `Join: ${currentShift?.name}` : "Start New Shift"}
          </DialogTitle>
          <DialogDescription className="text-primary-foreground/70 font-medium text-sm mt-2">
            {hasActiveShift 
              ? "An active store shift is currently running. Select an unoccupied terminal to join." 
              : "No active shifts found for this location. Select your terminal to establish a new shift track."}
          </DialogDescription>
        </div>

        <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Scanning network...</p>
            </div>
          ) : terminals && terminals.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {terminals.map((terminal) => (
                <button
                  key={terminal.id}
                  onClick={() => setSelectedTerminalId(terminal.id)}
                  className={`flex items-center justify-between p-5 rounded-3xl border-2 transition-all group ${
                    selectedTerminalId === terminal.id 
                      ? "border-primary bg-primary/5 shadow-md" 
                      : "border-border hover:border-primary/40 hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className={`p-3 rounded-2xl ${
                      selectedTerminalId === terminal.id ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                    }`}>
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-black text-lg tracking-tight">{terminal.name}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Code: {terminal.code}</p>
                    </div>
                  </div>
                  {selectedTerminalId === terminal.id && (
                    <CheckCircle2 className="w-6 h-6 text-primary animate-in zoom-in duration-300" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-3xl border-2 border-dashed">
              <Monitor className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-black text-muted-foreground">No terminals available</p>
              <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">Please contact your manager</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-muted/30 border-t flex gap-3">
           <Button 
             className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
             disabled={!selectedTerminalId || startShiftMutation.isPending}
             onClick={handleComplete}
           >
             {startShiftMutation.isPending ? (
               <Loader2 className="w-4 h-4 animate-spin mr-2" />
             ) : <Play className="w-4 h-4 mr-2" />}
             {hasActiveShift ? "Connect Terminal" : "Start Registration"}
           </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
