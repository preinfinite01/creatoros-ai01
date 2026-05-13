import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Zap, PenTool, Lightbulb, PlaySquare, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const tools = [
  {
    title: "Idea Generator",
    desc: "Discover untapped, high-potential concepts for your next viral hit based on current trends.",
    icon: Lightbulb,
    href: "/tools/ideas",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    cost: 10
  },
  {
    title: "Hook Creator",
    desc: "Generate scroll-stopping hooks guaranteed to keep viewers engaged past the critical 3 seconds.",
    icon: Zap,
    href: "/tools/hooks",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    cost: 5
  },
  {
    title: "Title Optimizer",
    desc: "Craft click-worthy titles optimized for high CTR on YouTube, TikTok, and Instagram.",
    icon: PenTool,
    href: "/tools/titles",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    cost: 5
  },
  {
    title: "Script Writer",
    desc: "Draft complete, structured scripts with pacing cues, visual notes, and strong calls to action.",
    icon: PlaySquare,
    href: "/tools/script",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    cost: 20
  }
];

export default function Tools() {
  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">AI Tools</h1>
        <p className="text-muted-foreground">Select a tool to generate specific content, or use the Workflow Pipeline to go from idea to script.</p>
      </div>

      {/* Featured Workflow */}
      <Link href="/tools/workflow">
        <Card className="p-8 border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium border border-primary/30">
              <Zap className="w-3 h-3" /> Recommended
            </span>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
              <Layout className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                Workflow Pipeline 
                <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-primary" />
              </h2>
              <p className="text-muted-foreground max-w-2xl leading-relaxed">
                The ultimate creator flow. Start with a simple topic and we'll generate the idea, hook, title, script, and caption in one seamless chain. Perfect for producing content quickly.
              </p>
              <div className="mt-4 flex gap-4 text-sm text-muted-foreground font-medium">
                <span className="flex items-center gap-1"><Zap className="w-4 h-4 text-yellow-400" /> 40 Credits</span>
                <span className="flex items-center gap-1"><Zap className="w-4 h-4 text-purple-400" /> 80 XP</span>
              </div>
            </div>
          </div>
        </Card>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool, index) => (
          <Link key={index} href={tool.href}>
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-6 h-full glass hover:border-white/20 transition-colors cursor-pointer flex flex-col">
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tool.bg}`}>
                    <tool.icon className={`w-6 h-6 ${tool.color}`} />
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-medium text-muted-foreground">
                    <Zap className="w-3 h-3 text-yellow-400" /> {tool.cost} Credits
                  </span>
                </div>
                
                <h3 className="text-xl font-bold mb-2">{tool.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed flex-1">{tool.desc}</p>
              </Card>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Layout(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  );
}
