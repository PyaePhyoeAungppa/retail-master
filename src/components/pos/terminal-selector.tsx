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
import { Monitor, CreditCard, CheckCircle2, Loader2, Clock, Plus, ArrowRight } from "lucide-react"
import { useToastStore } from "@/store/use-toast-store"

export function TerminalSelector() {
  const { storeId, currentUser, setSessionContext } = useAuthStore()
  const { toast } = useToastStore()
  const queryClient = useQueryClient()
  
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedShiftId, setSelectedShiftId] = useState<string | 'new' | null>(null)
  const [selectedTerminalId, setSelectedTerminalId] = useState<string | null>(null)

  const { data: activeShifts, isLoading: shiftsLoading } = useQuery({
    queryKey: ['activeShifts', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('active_shifts')
        .select('*')
        .eq('store_id', storeId)
        .eq('status', 'active')
      if (error) throw error
      return data
    },
    enabled: !!storeId && step === 1
  })

  const { data: terminals, isLoading: terminalsLoading } = useQuery({
    queryKey: ['terminals', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('terminals')
        .select('*')
        .eq('store_id', storeId)
        .eq('is_active', true)
      if (error) throw error
      return data
    },
    enabled: !!storeId && step === 2
  })

  const startShiftMutation = useMutation({
    mutationFn: async (terminalId: string) => {
      const terminal = terminals?.find(t => t.id === terminalId)
      const { data, error } = await supabase
        .from('active_shifts')
        .insert([{
          store_id: storeId,
          terminal_id: terminalId,
          name: `${currentUser?.email?.split('@')[0]}'s Shift`,
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
    if (selectedShiftId === 'new') {
       if (selectedTerminalId) {
          startShiftMutation.mutate(selectedTerminalId)
       }
    } else if (selectedShiftId && selectedTerminalId) {
       // Joining an existing shift
       toast({ title: "Joined active shift", variant: "success" })
       setSessionContext(selectedShiftId, selectedTerminalId)
    }
  }

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
        <div className="p-8 bg-primary text-primary-foreground">
           <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] font-black uppercase tracking-widest ${step === 1 ? 'text-white' : 'text-primary-foreground/50'}`}>Step 1: Shift</span>
              <ArrowRight className="w-3 h-3 text-primary-foreground/30" />
              <span className={`text-[10px] font-black uppercase tracking-widest ${step === 2 ? 'text-white' : 'text-primary-foreground/50'}`}>Step 2: Terminal</span>
           </div>
          <DialogTitle className="text-3xl font-black tracking-tight flex items-center gap-3">
            {step === 1 ? "Select Shift" : "Select Terminal"}
            {step === 1 ? <Clock className="w-8 h-8 opacity-50" /> : <Monitor className="w-8 h-8 opacity-50" />}
          </DialogTitle>
          <DialogDescription className="text-primary-foreground/70 font-medium text-base mt-2">
            {step === 1 ? "Join an ongoing shift or orchestrate a new one." : "Choose the hardware terminal you are operating from."}
          </DialogDescription>
        </div>

        <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
          {step === 1 ? (
             shiftsLoading ? (
               <div className="flex flex-col items-center justify-center py-12 gap-4">
                 <Loader2 className="w-8 h-8 animate-spin text-primary" />
                 <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Loading shifts...</p>
               </div>
             ) : (
                <div className="grid grid-cols-1 gap-3">
                   <button
                     onClick={() => setSelectedShiftId('new')}
                     className={`flex items-center justify-between p-5 rounded-3xl border-2 transition-all group ${
                       selectedShiftId === 'new' 
                         ? "border-primary bg-primary/5 shadow-md" 
                         : "border-dashed border-primary/30 hover:border-primary/60 hover:bg-muted/30"
                     }`}
                   >
                     <div className="flex items-center gap-4 text-left">
                       <div className={`p-3 rounded-2xl ${
                         selectedShiftId === 'new' ? "bg-primary text-white" : "bg-primary/10 text-primary group-hover:bg-primary/20"
                       }`}>
                         <Plus className="w-6 h-6" />
                       </div>
                       <div>
                         <p className="font-black text-lg tracking-tight text-primary">Open New Shift</p>
                         <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Start a fresh session</p>
                       </div>
                     </div>
                     {selectedShiftId === 'new' && (
                       <CheckCircle2 className="w-6 h-6 text-primary animate-in zoom-in duration-300" />
                     )}
                   </button>
                   
                   {activeShifts?.map((shift) => (
                     <button
                       key={shift.id}
                       onClick={() => setSelectedShiftId(shift.id)}
                       className={`flex items-center justify-between p-5 rounded-3xl border-2 transition-all group ${
                         selectedShiftId === shift.id 
                           ? "border-blue-500 bg-blue-50 shadow-md" 
                           : "border-border hover:border-blue-500/40 hover:bg-muted/30"
                       }`}
                     >
                       <div className="flex items-center gap-4 text-left">
                         <div className={`p-3 rounded-2xl ${
                           selectedShiftId === shift.id ? "bg-blue-500 text-white" : "bg-muted text-muted-foreground group-hover:bg-blue-500/10 group-hover:text-blue-500"
                         }`}>
                           <Clock className="w-6 h-6" />
                         </div>
                         <div>
                           <p className="font-black text-lg tracking-tight">{shift.name}</p>
                           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                              Started: {new Date(shift.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </p>
                         </div>
                       </div>
                       {selectedShiftId === shift.id && (
                         <CheckCircle2 className="w-6 h-6 text-blue-500 animate-in zoom-in duration-300" />
                       )}
                     </button>
                   ))}
                </div>
             )
          ) : (
            terminalsLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Loading terminals...</p>
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
            )
          )}
        </div>

        <div className="p-6 bg-muted/30 border-t flex gap-3">
          {step === 1 ? (
             <Button 
               className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
               disabled={!selectedShiftId}
               onClick={() => setStep(2)}
             >
               Next Step <ArrowRight className="w-4 h-4 ml-2" />
             </Button>
          ) : (
             <div className="flex w-full gap-3">
               <Button 
                 variant="outline"
                 className="h-14 rounded-2xl font-black uppercase tracking-widest text-xs border-2"
                 onClick={() => setStep(1)}
               >
                 Back
               </Button>
               <Button 
                 className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                 disabled={!selectedTerminalId || startShiftMutation.isPending}
                 onClick={handleComplete}
               >
                 {startShiftMutation.isPending ? (
                   <Loader2 className="w-4 h-4 animate-spin mr-2" />
                 ) : null}
                 Start Session
               </Button>
             </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
