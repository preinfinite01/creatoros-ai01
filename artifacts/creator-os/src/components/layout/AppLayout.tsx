import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuthStore } from "@/store/authStore";
import { useUserStore } from "@/store/userStore";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  LayoutDashboard, Sparkles, FolderOpen, Settings,
  Zap, Flame, Menu, Crown, ChevronRight, TrendingUp,
  Image, Hash, MessageSquare, Wand2, FileText, Repeat2, Target, BookOpen
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV_PRIMARY = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: FolderOpen, label: "Projects", href: "/projects" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

const NAV_TOOLS = [
  { icon: Sparkles, label: "All Tools", href: "/tools" },
  { icon: Wand2, label: "Titles", href: "/tools/titles" },
  { icon: Zap, label: "Hooks", href: "/tools/hooks" },
  { icon: FileText, label: "Scripts", href: "/tools/script" },
  { icon: TrendingUp, label: "Ideas", href: "/tools/ideas" },
  { icon: MessageSquare, label: "Captions", href: "/tools/captions" },
  { icon: Hash, label: "Hashtags", href: "/tools/hashtags" },
  { icon: Image, label: "Image AI", href: "/tools/image" },
  { icon: Repeat2, label: "Repurpose", href: "/tools/repurpose" },
  { icon: Target, label: "Workflow", href: "/tools/workflow" },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { signOut, user } = useAuthStore();
  const { credits, level, xp, streak, plan } = useUserStore();
  const { subscription } = useSubscriptionStore();
  const [toolsExpanded, setToolsExpanded] = useState(location.startsWith("/tools"));

  const xpProgress = (xp % 500) / 5;
  const isActive = (href: string) => href === "/tools" ? location === "/tools" : location.startsWith(href);

  const planColors: Record<string, string> = {
    free: "bg-white/10 text-white/50 border-white/10",
    basic: "bg-primary/20 text-primary border-primary/30",
    pro: "bg-yellow-400/15 text-yellow-400 border-yellow-400/25",
  };
  const planIcons = { free: null, basic: <Zap className="w-2.5 h-2.5" />, pro: <Crown className="w-2.5 h-2.5" /> };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card/95 border-r border-border/50 overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <Link href="/dashboard">
          <div className="flex items-center gap-2.5 cursor-pointer">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-black text-base tracking-tight">CreatorOS</span>
              <span className="text-primary font-black text-base"> AI</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Plan Badge */}
      <div className="px-5 pt-4 pb-2">
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${planColors[plan] ?? planColors.free}`}>
          {planIcons[plan as keyof typeof planIcons]}
          {plan} Plan
        </div>
      </div>

      {/* Primary Nav */}
      <div className="px-3 pt-2 space-y-0.5">
        {NAV_PRIMARY.map((item) => (
          <Link key={item.href} href={item.href}>
            <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer text-sm font-medium ${
              isActive(item.href)
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            }`}>
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </div>
          </Link>
        ))}
      </div>

      {/* Tools Section */}
      <div className="px-3 pt-4">
        <button
          onClick={() => setToolsExpanded(!toolsExpanded)}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-muted-foreground/60 uppercase tracking-widest hover:text-muted-foreground transition-colors"
        >
          AI Tools
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${toolsExpanded ? 'rotate-90' : ''}`} />
        </button>

        {toolsExpanded && (
          <div className="space-y-0.5 mt-1">
            {NAV_TOOLS.map((item) => (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer text-sm ${
                  isActive(item.href)
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`}>
                  <item.icon className="w-3.5 h-3.5 shrink-0" />
                  {item.label}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="mt-auto px-3 pb-4 pt-4 border-t border-white/5 space-y-3">
        {/* XP Progress */}
        <div className="p-3 rounded-xl bg-background/40 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">Level {level}</span>
            <span className="text-primary font-bold">{xp} XP</span>
          </div>
          <Progress value={xpProgress} className="h-1.5" />
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-yellow-400/10 flex items-center justify-center">
                <Zap className="w-3 h-3 text-yellow-400" />
              </div>
              <span className="text-xs font-semibold">{plan === 'pro' ? '∞' : credits} credits</span>
            </div>
            <div className="flex items-center gap-1 text-orange-400">
              <Flame className="w-3.5 h-3.5" />
              <span className="text-xs font-bold">{streak}d</span>
            </div>
          </div>
        </div>

        {/* Upgrade prompt for free users */}
        {plan === 'free' && (
          <Link href="/pricing">
            <div className="p-3 rounded-xl bg-primary/8 border border-primary/20 cursor-pointer hover:bg-primary/12 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-xs font-bold text-primary">Upgrade to Pro</span>
              </div>
              <p className="text-xs text-muted-foreground">Unlock unlimited AI credits and all premium tools.</p>
            </div>
          </Link>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-foreground h-8 text-xs"
          onClick={() => signOut()}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-[var(--sidebar-width,260px)] h-screen sticky top-0 shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-50">
          <Link href="/dashboard">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-black text-sm">CreatorOS AI</span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs font-semibold">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span>{plan === 'pro' ? '∞' : credits}</span>
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[260px] border-r border-border/50">
                <SidebarContent />
              </SheetContent>
            </Sheet>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-x-hidden max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
