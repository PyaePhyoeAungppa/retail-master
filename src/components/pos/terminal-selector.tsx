
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
import { Monitor, CreditCard, CheckCircle2, Loader2 } from "lucide-react"
import { useToastStore } from "@/store/use-toast-store"

export function TerminalSelector({ onSelect }: { onSelect: (terminalId: string) => void }) {
  const { storeId, currentUser } = useAuthStore()
  const { toast } = useToastStore()
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data: terminals, isLoading } = useQuery({
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
    enabled: !!storeId
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
      toast({ title: "Shift started successfully", variant: "success" })
      onSelect(data.terminal_id)
    },
    onError: (error: any) => {
      toast({ title: error.message || "Failed to start shift", variant: "destructive" })
    }
  })

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
        <div className="p-8 bg-primary text-primary-foreground">
          <DialogTitle className="text-3xl font-black tracking-tight flex items-center gap-3">
            Select Terminal
            <Monitor className="w-8 h-8 opacity-50" />
          </DialogTitle>
          <DialogDescription className="text-primary-foreground/70 font-medium text-base mt-2">
            Choose a terminal to start your session at this location.
          </DialogDescription>
        </div>

        <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Loading terminals...</p>
            </div>
          ) : terminals && terminals.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {terminals.map((terminal) => (
                <button
                  key={terminal.id}
                  onClick={() => setSelectedId(terminal.id)}
                  className={`flex items-center justify-between p-5 rounded-3xl border-2 transition-all group ${
                    selectedId === terminal.id 
                      ? "border-primary bg-primary/5 shadow-md" 
                      : "border-border hover:border-primary/40 hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className={`p-3 rounded-2xl ${
                      selectedId === terminal.id ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                    }`}>
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-black text-lg tracking-tight">{terminal.name}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Code: {terminal.code}</p>
                    </div>
                  </div>
                  {selectedId === terminal.id && (
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
            className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20"
            disabled={!selectedId || startShiftMutation.isPending}
            onClick={() => selectedId && startShiftMutation.mutate(selectedId)}
          >
            {startShiftMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Start Shift
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
