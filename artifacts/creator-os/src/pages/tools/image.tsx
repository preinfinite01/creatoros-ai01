import { useState } from "react";
import { useUserStore } from "@/store/userStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Image as ImageIcon, Download, Wand2, Zap, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ImageGen() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("photorealistic");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [quality, setQuality] = useState("standard");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [revisedPrompt, setRevisedPrompt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { deductCredits, addXp } = useUserStore();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) { toast({ title: "Prompt required", variant: "destructive" }); return; }
    if (!deductCredits(15)) { toast({ title: "Not enough credits", description: "Upgrade your plan to continue.", variant: "destructive" }); return; }
    setIsLoading(true);
    setImageUrl(null);
    setRevisedPrompt(null);
    try {
      const res = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style, aspectRatio, quality }),
      });
      const data = await res.json() as { imageUrl?: string; revisedPrompt?: string; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? "Generation failed");
      setImageUrl(data.imageUrl ?? null);
      setRevisedPrompt(data.revisedPrompt ?? null);
      addXp(20);
      toast({ title: "Image generated!" });
    } catch (err) {
      toast({ title: "Generation failed", description: String(err), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const STYLE_PRESETS = [
    "photorealistic", "cinematic", "digital art", "oil painting",
    "minimalist", "anime", "watercolor", "dark fantasy", "studio photo"
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/10 flex items-center justify-center shrink-0">
          <ImageIcon className="w-6 h-6 text-fuchsia-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight">AI Image Generator</h1>
          <p className="text-muted-foreground text-sm mt-1">Generate stunning visuals, thumbnails, and social media graphics powered by DALL-E 3.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2 glass p-6 space-y-5 border-white/8 h-fit">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Image Prompt</Label>
            <Textarea
              placeholder="Describe the image you want to create in detail... e.g. 'A cinematic thumbnail of a person looking confident at a laptop, dark moody office, neon purple lighting'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              className="bg-background/60 border-white/10 focus:border-primary/40 resize-none text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Style</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger className="bg-background/60 border-white/10"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STYLE_PRESETS.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Aspect Ratio</Label>
              <Select value={aspectRatio} onValueChange={setAspectRatio}>
                <SelectTrigger className="bg-background/60 border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="16:9">16:9 — YouTube</SelectItem>
                  <SelectItem value="1:1">1:1 — Square</SelectItem>
                  <SelectItem value="9:16">9:16 — Vertical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quality</Label>
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger className="bg-background/60 border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="hd">HD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-fuchsia-500/5 border border-fuchsia-500/15 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-fuchsia-400">Pro Tips</p>
            <p>Be specific about lighting, mood, colors, and composition for best results.</p>
          </div>

          <Button onClick={handleGenerate} disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 text-white font-semibold h-11">
            {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><Sparkles className="w-4 h-4 mr-2" />Generate Image</>}
          </Button>
          <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
            <Zap className="w-3 h-3 text-yellow-400" /> 15 credits per image
          </p>
        </Card>

        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full min-h-[400px] rounded-2xl border border-white/8 bg-card/40 flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-fuchsia-500/10 flex items-center justify-center">
                  <Wand2 className="w-7 h-7 text-fuchsia-400 animate-pulse" />
                </div>
                <div className="text-center">
                  <p className="font-semibold">Creating your image...</p>
                  <p className="text-sm text-muted-foreground mt-1">DALL-E 3 is rendering your vision</p>
                </div>
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </motion.div>
            )}

            {imageUrl && !isLoading && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                  <img src={imageUrl} alt="AI generated" className="w-full object-cover" />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <a href={imageUrl} download="creatorOS-image.png" target="_blank" rel="noopener noreferrer">
                      <Button size="sm" className="bg-black/60 backdrop-blur-md hover:bg-black/80 border border-white/10 text-white text-xs h-8">
                        <Download className="w-3.5 h-3.5 mr-1.5" /> Download
                      </Button>
                    </a>
                  </div>
                </div>
                {revisedPrompt && (
                  <Card className="glass p-4 border-white/8">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Enhanced Prompt Used</p>
                    <p className="text-xs text-foreground/70 leading-relaxed">{revisedPrompt}</p>
                  </Card>
                )}
                <Button onClick={handleGenerate} variant="outline" className="w-full border-white/10 bg-white/5 hover:bg-white/10 h-10">
                  <Sparkles className="w-4 h-4 mr-2" /> Regenerate
                </Button>
              </motion.div>
            )}

            {!imageUrl && !isLoading && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[400px] rounded-2xl border border-white/8 border-dashed bg-card/20 flex flex-col items-center justify-center gap-4 text-center p-8">
                <div className="w-20 h-20 rounded-3xl bg-fuchsia-500/8 flex items-center justify-center">
                  <ImageIcon className="w-9 h-9 text-fuchsia-400/40" />
                </div>
                <div>
                  <p className="font-semibold text-foreground/60">Your image will appear here</p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-xs">Enter a detailed prompt and click generate to create stunning visuals</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
