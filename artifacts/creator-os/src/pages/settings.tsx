import { useState } from "react";
import { useUserStore } from "@/store/userStore";
import { useAuthStore } from "@/store/authStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Zap, Crown, User, CreditCard, LogOut } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Settings() {
  const { user, signOut } = useAuthStore();
  const { plan, credits, xp, level } = useUserStore();
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account, billing, and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-1 text-sm font-medium">
          <div className="px-4 py-2 bg-white/5 text-foreground rounded-lg cursor-pointer">Account & Profile</div>
          <div className="px-4 py-2 text-muted-foreground hover:bg-white/5 hover:text-foreground rounded-lg cursor-pointer transition-colors">Billing & Plan</div>
          <div className="px-4 py-2 text-muted-foreground hover:bg-white/5 hover:text-foreground rounded-lg cursor-pointer transition-colors">Integrations</div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="glass p-6 space-y-6 border-white/10">
            <h2 className="text-xl font-bold flex items-center gap-2"><User className="w-5 h-5 text-primary" /> Profile</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1">Email Address</label>
                <div className="p-3 bg-background/50 border border-white/5 rounded-lg text-foreground/90 font-medium">
                  {user?.email || "creator@example.com"}
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/5">
                <h3 className="font-medium mb-4">Creator Level</h3>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Level {level}</span>
                  <span className="text-primary font-bold">{xp} XP</span>
                </div>
                <Progress value={(xp % 500) / 5} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2 text-right">{500 - (xp % 500)} XP to next level</p>
              </div>
            </div>
          </Card>

          <Card className="glass p-6 space-y-6 border-white/10 relative overflow-hidden">
            {plan === 'free' && <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] pointer-events-none" />}
            
            <div className="flex items-start justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary" /> Subscription</h2>
              <div className="px-3 py-1 bg-primary/20 border border-primary/30 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
                {plan} Plan
              </div>
            </div>
            
            <div className="p-4 bg-background/50 border border-white/5 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-400/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available Credits</p>
                  <p className="font-bold text-lg">{credits}</p>
                </div>
              </div>
              <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10">Buy More</Button>
            </div>

            {plan === 'free' && (
              <div className="p-5 bg-gradient-to-br from-primary/20 to-purple-500/10 border border-primary/30 rounded-xl">
                <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-400" /> Upgrade to Pro
                </h3>
                <p className="text-sm text-muted-foreground mb-4">Get unlimited workflow generations, HD exports, and priority AI processing.</p>
                <Button className="w-full bg-white text-black hover:bg-gray-200">View Plans</Button>
              </div>
            )}
          </Card>

          <Card className="glass p-6 space-y-6 border-white/10">
            <h2 className="text-xl font-bold">Preferences</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive weekly analytics and product updates.</p>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
          </Card>

          <div className="pt-8">
            <Button variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border border-destructive/20 w-full md:w-auto" onClick={() => signOut()}>
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
