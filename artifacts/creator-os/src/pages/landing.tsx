import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Zap, Play, Layout, Sparkles, TrendingUp, ChevronRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col text-foreground overflow-hidden">
      {/* Nav */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-background/50 backdrop-blur-xl fixed w-full z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">CreatorOS</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/signup">
            <Button className="bg-primary hover:bg-primary/90 text-white font-medium rounded-full px-6">
              Start Free
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 pt-24">
        {/* Hero Section */}
        <section className="relative px-6 py-24 md:py-32 flex flex-col items-center text-center max-w-5xl mx-auto">
          <div className="absolute inset-0 bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10" />
          <div className="absolute inset-0 -z-20 opacity-20 pointer-events-none bg-cover bg-center" style={{ backgroundImage: 'url(/hero-bg.png)' }} />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-primary mb-8"
          >
            <Sparkles className="w-4 h-4" />
            <span>The AI Operating System for Creators</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white to-white/60"
          >
            Create viral content.<br />In seconds, not hours.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10"
          >
            Stop staring at a blank page. Generate hooks, scripts, titles, and ideas optimized for YouTube, TikTok, and Instagram using advanced AI.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <Link href="/signup">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 h-14 text-lg w-full sm:w-auto">
                Get Started for Free <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-lg border-white/10 hover:bg-white/5 w-full sm:w-auto">
              <Play className="mr-2 w-5 h-5" /> Watch Demo
            </Button>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="px-6 py-24 bg-card border-y border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to go viral</h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">A unified workspace replacing your messy docs, notes, and disparate AI tools.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Layout,
                  title: "Workflow Pipeline",
                  desc: "Connect your ideas. Generate an idea, turn it into a hook, expand to a script, and create your caption all in one flow."
                },
                {
                  icon: TrendingUp,
                  title: "Platform Optimized",
                  desc: "Algorithms trained specifically on viral formats for TikTok, YouTube Shorts, and Instagram Reels."
                },
                {
                  icon: Zap,
                  title: "Instant Generation",
                  desc: "Lightning fast outputs. Spend your time filming and editing, not outlining and writing."
                }
              ].map((feature, i) => (
                <div key={i} className="p-8 rounded-2xl bg-background border border-white/5 hover:border-primary/30 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="px-6 py-12 border-t border-white/5 text-center text-muted-foreground text-sm">
        <p>© 2025 CreatorOS AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
