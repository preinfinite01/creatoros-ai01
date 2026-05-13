// Upgrade Modal placeholder to be used if they run out of credits or hit premium features
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Check } from "lucide-react";

export function UpgradeModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Crown className="w-6 h-6 text-yellow-400" /> Unlock Pro
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground pt-2">
            You've hit the limit of your current plan. Upgrade to unlock unlimited creative power.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/10 border border-primary/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 font-bold text-2xl">$20<span className="text-sm text-muted-foreground font-normal">/mo</span></div>
            <h3 className="font-bold text-lg mb-4">Basic Plan</h3>
            <ul className="space-y-3">
              {['2000 Credits per month', 'Full Workflow Pipeline access', 'Advanced script length options', 'Priority AI processing'].map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/90">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-primary hover:bg-primary/90 text-white">Upgrade Now</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
