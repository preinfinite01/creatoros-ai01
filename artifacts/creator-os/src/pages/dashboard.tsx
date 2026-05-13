import { useUserStore } from "@/store/userStore";
import { useAuthStore } from "@/store/authStore";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Zap, TrendingUp, BookOpen, PenTool, Lightbulb, PlaySquare, Settings, ArrowRight, Flame } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const performanceData = [
  { name: 'Mon', views: 4000, engagement: 2400 },
  { name: 'Tue', views: 3000, engagement: 1398 },
  { name: 'Wed', views: 2000, engagement: 9800 },
  { name: 'Thu', views: 2780, engagement: 3908 },
  { name: 'Fri', views: 1890, engagement: 4800 },
  { name: 'Sat', views: 2390, engagement: 3800 },
  { name: 'Sun', views: 3490, engagement: 4300 },
];

export default function Dashboard() {
  const { user } = useAuthStore();
  const { credits, level, xp, streak } = useUserStore();

  const tools = [
    { title: "Idea Generator", icon: Lightbulb, href: "/tools/ideas", desc: "Find viral concepts", color: "text-yellow-500" },
    { title: "Title Optimizer", icon: PenTool, href: "/tools/titles", desc: "Click-worthy headlines", color: "text-blue-500" },
    { title: "Hook Creator", icon: Zap, href: "/tools/hooks", desc: "Capture attention fast", color: "text-purple-500" },
    { title: "Full Workflow", icon: PlaySquare, href: "/tools/workflow", desc: "Idea to script pipeline", color: "text-emerald-500" },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, Creator</h1>
          <p className="text-muted-foreground">Ready to make something viral today?</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-white/5">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="font-bold">{streak} Day Streak</span>
          </div>
          <Link href="/tools/workflow" className="px-6 py-2 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
            New Project <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Credits Balance</p>
              <h3 className="text-2xl font-bold">{credits}</h3>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Refills in 14 days on Basic Plan.</p>
        </Card>
        
        <Card className="glass p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Level {level} Creator</p>
              <h3 className="text-2xl font-bold">{xp} XP</h3>
            </div>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2 mt-2">
            <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(xp % 500) / 5}%` }}></div>
          </div>
        </Card>

        <Card className="glass p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Recent Projects</p>
              <h3 className="text-2xl font-bold">12</h3>
            </div>
          </div>
          <Link href="/projects" className="text-sm text-primary hover:underline font-medium">View all projects →</Link>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold">Analytics Overview</h2>
          <Card className="glass p-6 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a24', borderColor: '#333' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="views" stroke="#7c3aed" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="engagement" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold">Quick Tools</h2>
          <div className="grid gap-4">
            {tools.map((tool, i) => (
              <Link key={i} href={tool.href}>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 rounded-xl glass hover:bg-white/5 border border-white/5 transition-colors cursor-pointer flex items-center gap-4"
                >
                  <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center ${tool.color}`}>
                    <tool.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{tool.title}</h4>
                    <p className="text-xs text-muted-foreground">{tool.desc}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
