
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Moon, Sun, Monitor, Bell, Shield, Store } from "lucide-react"

export default function SettingsPage() {
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
            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                  <Label>Store Name</Label>
                  <Input defaultValue="Main Street Boutique" className="rounded-xl" />
               </div>
               <div className="space-y-2">
                  <Label>Store ID</Label>
                  <Input defaultValue="MSB-001" disabled className="rounded-xl bg-muted/50" />
               </div>
            </div>
            <div className="space-y-2">
               <Label>Address</Label>
               <Input defaultValue="123 Retail Ave, Shopville, ST 12345" className="rounded-xl" />
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
         <Button variant="ghost" className="rounded-xl">Discard Changes</Button>
         <Button className="rounded-xl px-8 font-bold shadow-lg shadow-primary/20">Save Configuration</Button>
      </div>
    </div>
  )
}
