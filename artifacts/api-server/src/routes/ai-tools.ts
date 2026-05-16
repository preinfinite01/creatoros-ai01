import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { generateImageBuffer } from "@workspace/integrations-openai-ai-server/image";
import {
  GenerateTitlesBody,
  GenerateHooksBody,
  GenerateScriptBody,
  GenerateIdeasBody,
  GenerateWorkflowBody,
} from "@workspace/api-zod";

const router = Router();

// ── Titles ────────────────────────────────────────────────────
router.post("/ai/generate-titles", async (req, res) => {
  const parsed = GenerateTitlesBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { topic, niche, platform, tone, count = 5 } = parsed.data;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 1024,
      messages: [
        { role: "system", content: `You are a viral content strategist who creates scroll-stopping video titles optimized for ${platform}. You understand retention psychology, curiosity gaps, and platform-specific algorithms.` },
        { role: "user", content: `Generate ${count} viral video titles for:\nTopic: ${topic}\nNiche: ${niche || "general"}\nPlatform: ${platform}\nTone: ${tone || "engaging and energetic"}\n\nRequirements:\n- Attention-grabbing and click-worthy\n- Use proven formulas (numbers, questions, power words, curiosity gaps)\n- Platform-optimized\n- Each title uses a different approach\n\nReturn ONLY JSON: {"titles": ["title1", "title2", ...]}` },
      ],
    });
    const content = completion.choices[0]?.message?.content ?? "{}";
    let titles: string[] = [];
    try { titles = JSON.parse(content).titles ?? []; } catch { titles = content.split("\n").filter((l) => l.trim()).slice(0, count); }
    res.json({ titles, creditsUsed: 5 });
  } catch (err) {
    req.log.error({ err }, "Error generating titles");
    res.status(500).json({ error: "Failed to generate titles" });
  }
});

// ── Hooks ─────────────────────────────────────────────────────
router.post("/ai/generate-hooks", async (req, res) => {
  const parsed = GenerateHooksBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { topic, niche, platform, tone, count = 5 } = parsed.data;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 1024,
      messages: [
        { role: "system", content: `You are a master content creator specializing in the perfect first 3 seconds of ${platform} videos. You understand pattern interrupts, emotional triggers, and retention mechanics.` },
        { role: "user", content: `Generate ${count} powerful hooks for a ${platform} video about:\nTopic: ${topic}\nNiche: ${niche || "general"}\nTone: ${tone || "bold and direct"}\n\nHook rules:\n- Grab attention in the FIRST sentence\n- Pattern interrupts, bold statements, or provocative questions\n- 1-3 sentences max, punchy and direct\n- Each uses a different psychological approach\n\nReturn ONLY JSON: {"hooks": ["hook1", "hook2", ...]}` },
      ],
    });
    const content = completion.choices[0]?.message?.content ?? "{}";
    let hooks: string[] = [];
    try { hooks = JSON.parse(content).hooks ?? []; } catch { hooks = content.split("\n").filter((l) => l.trim()).slice(0, count); }
    res.json({ hooks, creditsUsed: 5 });
  } catch (err) {
    req.log.error({ err }, "Error generating hooks");
    res.status(500).json({ error: "Failed to generate hooks" });
  }
});

// ── Script ────────────────────────────────────────────────────
router.post("/ai/generate-script", async (req, res) => {
  const parsed = GenerateScriptBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { topic, niche, platform, tone, duration, hook, title } = parsed.data;

  const durationMap: Record<string, string> = {
    short: "15-30 seconds (100-200 words)",
    medium: "60-90 seconds (300-500 words)",
    long: "5-10 minutes (900-1800 words)",
  };

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 4096,
      messages: [
        { role: "system", content: `You are a professional scriptwriter for ${platform} content. You write scripts with perfect pacing, emotional beats, pattern interrupts, and CTAs that maximize watch time.` },
        { role: "user", content: `Write a complete ${durationMap[duration]} script for:\nTopic: ${topic}\nNiche: ${niche || "general"}\nPlatform: ${platform}\nTone: ${tone || "engaging and authentic"}\n${hook ? `Opening Hook: ${hook}` : ""}\n${title ? `Video Title: ${title}` : ""}\n\nStructure: Hook → Problem/Intrigue → Value → Pattern Interrupt → More Value → CTA\nInclude [VISUAL CUE] tags for key moments.\n\nReturn ONLY JSON: {"script": "full script", "hook": "opening hook", "cta": "call to action", "estimatedDuration": "time estimate"}` },
      ],
    });
    const content = completion.choices[0]?.message?.content ?? "{}";
    let result = { script: "", hook: hook ?? "", cta: "", estimatedDuration: durationMap[duration] ?? "" };
    try { result = { ...result, ...JSON.parse(content) }; } catch { result.script = content; }
    res.json({ ...result, creditsUsed: 20 });
  } catch (err) {
    req.log.error({ err }, "Error generating script");
    res.status(500).json({ error: "Failed to generate script" });
  }
});

// ── Ideas ─────────────────────────────────────────────────────
router.post("/ai/generate-ideas", async (req, res) => {
  const parsed = GenerateIdeasBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { niche, platform, tone, count = 8 } = parsed.data;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 2048,
      messages: [
        { role: "system", content: `You are a viral content strategist with deep knowledge of trending topics and audience psychology for ${platform}.` },
        { role: "user", content: `Generate ${count} high-potential content ideas for a ${platform} creator in the ${niche} niche.\nTone: ${tone || "authentic and engaging"}\n\nFor each idea provide: title, description (2 sentences), viral potential (high/medium/low), and 3-5 relevant tags.\n\nReturn ONLY JSON: {"ideas": [{"title":"","description":"","viralPotential":"high|medium|low","tags":["tag1"]}]}` },
      ],
    });
    const content = completion.choices[0]?.message?.content ?? "{}";
    let ideas: unknown[] = [];
    try { ideas = JSON.parse(content).ideas ?? []; } catch { ideas = []; }
    res.json({ ideas, creditsUsed: 10 });
  } catch (err) {
    req.log.error({ err }, "Error generating ideas");
    res.status(500).json({ error: "Failed to generate ideas" });
  }
});

// ── Workflow ──────────────────────────────────────────────────
router.post("/ai/generate-workflow", async (req, res) => {
  const parsed = GenerateWorkflowBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { topic, niche, platform, tone, duration = "medium" } = parsed.data;

  const durationMap: Record<string, string> = { short: "15-30 seconds", medium: "60-90 seconds", long: "5-10 minutes" };

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 4096,
      messages: [
        { role: "system", content: `You are a complete content creation system generating a full creator workflow from idea to publish-ready content, optimized for ${platform}.` },
        { role: "user", content: `Generate a complete creator workflow for:\nTopic: ${topic}\nNiche: ${niche || "general"}\nPlatform: ${platform}\nTone: ${tone || "authentic and engaging"}\nDuration: ${durationMap[duration]}\n\nGenerate: refined idea, attention-grabbing hook, optimized title, full script with pacing, strong CTA, social caption, 10-15 hashtags.\n\nReturn ONLY JSON: {"idea":"","hook":"","title":"","script":"","cta":"","caption":"","hashtags":["#tag1"]}` },
      ],
    });
    const content = completion.choices[0]?.message?.content ?? "{}";
    let result = { idea: "", hook: "", title: "", script: "", cta: "", caption: "", hashtags: [] as string[] };
    try { result = { ...result, ...JSON.parse(content) }; } catch { result.script = content; }
    res.json({ ...result, creditsUsed: 40 });
  } catch (err) {
    req.log.error({ err }, "Error generating workflow");
    res.status(500).json({ error: "Failed to generate workflow" });
  }
});

// ── Captions ──────────────────────────────────────────────────
router.post("/ai/generate-captions", async (req, res) => {
  const { topic, platform = "instagram", tone = "engaging", niche, count = 4 } = req.body as {
    topic: string; platform?: string; tone?: string; niche?: string; count?: number;
  };
  if (!topic) { res.status(400).json({ error: "topic required" }); return; }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 2048,
      messages: [
        { role: "system", content: `You are an expert social media copywriter specializing in ${platform} captions that drive engagement, saves, and shares. You understand platform culture, storytelling, and conversion psychology.` },
        { role: "user", content: `Write ${count} powerful ${platform} captions for content about:\nTopic: ${topic}\nNiche: ${niche || "general"}\nTone: ${tone}\n\nCaption requirements:\n- Hook in the first line (no emoji opening unless it's part of the hook)\n- Storytelling or value delivery in the middle\n- Strong CTA at the end\n- Platform-native formatting\n- Vary the approach for each caption\n\nReturn ONLY JSON: {"captions": ["caption1", "caption2", ...]}` },
      ],
    });
    const content = completion.choices[0]?.message?.content ?? "{}";
    let captions: string[] = [];
    try { captions = JSON.parse(content).captions ?? []; } catch { captions = [content]; }
    res.json({ captions, creditsUsed: 5 });
  } catch (err) {
    req.log.error({ err }, "Error generating captions");
    res.status(500).json({ error: "Failed to generate captions" });
  }
});

// ── Hashtags ──────────────────────────────────────────────────
router.post("/ai/generate-hashtags", async (req, res) => {
  const { topic, platform = "instagram", niche, count = 30 } = req.body as {
    topic: string; platform?: string; niche?: string; count?: number;
  };
  if (!topic) { res.status(400).json({ error: "topic required" }); return; }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 1024,
      messages: [
        { role: "system", content: `You are a social media growth expert specializing in hashtag strategy for ${platform}. You understand algorithm optimization, discoverability, and the balance between broad and niche hashtags.` },
        { role: "user", content: `Generate an optimized hashtag strategy for ${platform} content about:\nTopic: ${topic}\nNiche: ${niche || "general"}\n\nProvide ${count} hashtags organized by tier:\n- 10 mega hashtags (10M+ posts) for broad reach\n- 10 mid-tier hashtags (100K-5M posts) for targeted reach\n- 10 niche hashtags (<100K posts) for highly engaged audiences\n\nReturn ONLY JSON: {"hashtags": {"mega": ["#tag"], "midTier": ["#tag"], "niche": ["#tag"]}, "topPicks": ["#tag1","#tag2","#tag3","#tag4","#tag5"]}` },
      ],
    });
    const content = completion.choices[0]?.message?.content ?? "{}";
    let result: { hashtags: Record<string, string[]>; topPicks: string[] } = { hashtags: { mega: [], midTier: [], niche: [] }, topPicks: [] };
    try { result = { ...result, ...JSON.parse(content) }; } catch { result.topPicks = []; }
    res.json({ ...result, creditsUsed: 3 });
  } catch (err) {
    req.log.error({ err }, "Error generating hashtags");
    res.status(500).json({ error: "Failed to generate hashtags" });
  }
});

// ── Thumbnail Prompt ──────────────────────────────────────────
router.post("/ai/generate-thumbnail", async (req, res) => {
  const { topic, platform = "youtube", style = "bold", niche } = req.body as {
    topic: string; platform?: string; style?: string; niche?: string;
  };
  if (!topic) { res.status(400).json({ error: "topic required" }); return; }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 2048,
      messages: [
        { role: "system", content: `You are a thumbnail design expert who understands visual psychology, color theory, and what makes thumbnails get clicked on ${platform}. You write detailed visual prompts.` },
        { role: "user", content: `Generate 3 thumbnail concepts for a ${platform} video about:\nTopic: ${topic}\nNiche: ${niche || "general"}\nStyle: ${style}\n\nFor each concept provide:\n- Concept title\n- Visual description (what's in the thumbnail)\n- Color palette (3-4 specific colors with hex codes)\n- Text overlay suggestions\n- Psychological hook (why it gets clicked)\n- A detailed AI image generation prompt for Midjourney/DALL-E\n\nReturn ONLY JSON: {"concepts": [{"title":"","visual":"","colors":["#hex"],"textOverlay":"","psychologicalHook":"","imagePrompt":""}]}` },
      ],
    });
    const content = completion.choices[0]?.message?.content ?? "{}";
    let concepts: unknown[] = [];
    try { concepts = JSON.parse(content).concepts ?? []; } catch { concepts = []; }
    res.json({ concepts, creditsUsed: 8 });
  } catch (err) {
    req.log.error({ err }, "Error generating thumbnail");
    res.status(500).json({ error: "Failed to generate thumbnail concepts" });
  }
});

// ── Content Repurposer ────────────────────────────────────────
router.post("/ai/repurpose-content", async (req, res) => {
  const { content: inputContent, sourceFormat = "youtube", targetPlatforms = ["twitter", "instagram", "linkedin"], topic } = req.body as {
    content: string; sourceFormat?: string; targetPlatforms?: string[]; topic?: string;
  };
  if (!inputContent) { res.status(400).json({ error: "content required" }); return; }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 4096,
      messages: [
        { role: "system", content: `You are a content repurposing expert who transforms long-form content into perfectly formatted, platform-native pieces for each social media platform. You maintain the core message while adapting tone, format, and structure.` },
        { role: "user", content: `Repurpose this ${sourceFormat} content for: ${targetPlatforms.join(", ")}.\n\nOriginal content:\n${inputContent.slice(0, 3000)}\n${topic ? `Topic: ${topic}` : ""}\n\nFor each target platform, create a perfectly formatted, platform-native piece of content. Consider character limits, formatting conventions, and platform culture.\n\nReturn ONLY JSON: {"repurposed": [{"platform": "twitter", "content": "...", "notes": "key adaptations made"}, ...]}` },
      ],
    });
    const content = completion.choices[0]?.message?.content ?? "{}";
    let repurposed: unknown[] = [];
    try { repurposed = JSON.parse(content).repurposed ?? []; } catch { repurposed = []; }
    res.json({ repurposed, creditsUsed: 15 });
  } catch (err) {
    req.log.error({ err }, "Error repurposing content");
    res.status(500).json({ error: "Failed to repurpose content" });
  }
});

// ── YouTube Description ───────────────────────────────────────
router.post("/ai/generate-description", async (req, res) => {
  const { title, topic, niche, keywords, tone = "professional" } = req.body as {
    title: string; topic?: string; niche?: string; keywords?: string; tone?: string;
  };
  if (!title) { res.status(400).json({ error: "title required" }); return; }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 2048,
      messages: [
        { role: "system", content: `You are a YouTube SEO specialist who writes descriptions that rank in search, drive subscriptions, and convert viewers. You understand YouTube's algorithm, keyword optimization, and viewer psychology.` },
        { role: "user", content: `Write a complete YouTube description for:\nTitle: ${title}\nTopic: ${topic || title}\nNiche: ${niche || "general"}\nKeywords: ${keywords || "auto-generate relevant keywords"}\nTone: ${tone}\n\nDescription structure:\n1. Hook paragraph (first 2-3 lines shown before "Show More")\n2. Video summary (2-3 paragraphs)\n3. Key timestamps placeholder\n4. Resources/links section\n5. Subscribe CTA\n6. Relevant keywords section (for algorithm)\n\nReturn ONLY JSON: {"description": "full description text", "keywords": ["keyword1", "keyword2", ...], "firstLine": "the hook line used"}` },
      ],
    });
    const content = completion.choices[0]?.message?.content ?? "{}";
    let result: { description: string; keywords: string[]; firstLine: string } = { description: "", keywords: [], firstLine: "" };
    try { result = { ...result, ...JSON.parse(content) }; } catch { result.description = content; }
    res.json({ ...result, creditsUsed: 5 });
  } catch (err) {
    req.log.error({ err }, "Error generating description");
    res.status(500).json({ error: "Failed to generate description" });
  }
});

// ── Ad Copy ───────────────────────────────────────────────────
router.post("/ai/generate-adcopy", async (req, res) => {
  const { product, audience, platform = "facebook", goal = "conversions", tone = "persuasive", count = 3 } = req.body as {
    product: string; audience?: string; platform?: string; goal?: string; tone?: string; count?: number;
  };
  if (!product) { res.status(400).json({ error: "product required" }); return; }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 2048,
      messages: [
        { role: "system", content: `You are a world-class direct response copywriter specializing in ${platform} ads. You write copy that stops the scroll, creates desire, and drives action using proven psychological frameworks.` },
        { role: "user", content: `Write ${count} high-converting ${platform} ad copies for:\nProduct/Content: ${product}\nTarget Audience: ${audience || "creators and entrepreneurs"}\nGoal: ${goal}\nTone: ${tone}\n\nFor each ad copy provide:\n- Primary text (the main ad body)\n- Headline (short, punchy)\n- CTA text\n- Framework used (AIDA, PAS, etc.)\n\nReturn ONLY JSON: {"ads": [{"primaryText":"","headline":"","cta":"","framework":""}]}` },
      ],
    });
    const content = completion.choices[0]?.message?.content ?? "{}";
    let ads: unknown[] = [];
    try { ads = JSON.parse(content).ads ?? []; } catch { ads = []; }
    res.json({ ads, creditsUsed: 8 });
  } catch (err) {
    req.log.error({ err }, "Error generating ad copy");
    res.status(500).json({ error: "Failed to generate ad copy" });
  }
});

// ── Brand Voice ───────────────────────────────────────────────
router.post("/ai/generate-brand-voice", async (req, res) => {
  const { description, examples, niche, audience } = req.body as {
    description: string; examples?: string; niche?: string; audience?: string;
  };
  if (!description) { res.status(400).json({ error: "description required" }); return; }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 2048,
      messages: [
        { role: "system", content: `You are a brand strategist who helps creators define and systematize their unique voice so AI can consistently replicate their style across all content.` },
        { role: "user", content: `Analyze this creator's brand description and create a comprehensive brand voice guide:\n\nCreator Description: ${description}\nContent Examples: ${examples || "not provided"}\nNiche: ${niche || "general"}\nTarget Audience: ${audience || "general"}\n\nCreate:\n1. Core voice characteristics (5-7 adjectives with explanations)\n2. Tone modifiers by context (casual vs professional content)\n3. Vocabulary style (words to use and avoid)\n4. Structural patterns (how they structure content)\n5. A sample paragraph demonstrating the voice\n6. A "voice prompt" for AI generation\n\nReturn ONLY JSON: {"characteristics":["adj: explanation"],"toneModifiers":{"casual":"","professional":""},"vocabulary":{"use":["word"],"avoid":["word"]},"patterns":"","sample":"","voicePrompt":""}` },
      ],
    });
    const content = completion.choices[0]?.message?.content ?? "{}";
    let result: Record<string, unknown> = {};
    try { result = JSON.parse(content); } catch { result = { voicePrompt: content }; }
    res.json({ ...result, creditsUsed: 10 });
  } catch (err) {
    req.log.error({ err }, "Error generating brand voice");
    res.status(500).json({ error: "Failed to generate brand voice" });
  }
});

// ── AI Image Generation ───────────────────────────────────────
router.post("/ai/generate-image", async (req, res) => {
  const { prompt, style = "photorealistic", aspectRatio = "16:9", quality = "standard" } = req.body as {
    prompt: string; style?: string; aspectRatio?: string; quality?: string;
  };
  if (!prompt) { res.status(400).json({ error: "prompt required" }); return; }

  // gpt-image-1 supported sizes: 1024x1024, 1536x1024 (landscape), 1024x1536 (portrait)
  const sizeMap: Record<string, "1024x1024" | "1536x1024" | "1024x1536"> = {
    "16:9": "1536x1024",
    "9:16": "1024x1536",
    "1:1": "1024x1024",
  };
  const size = sizeMap[aspectRatio] ?? "1536x1024";

  // Build an enhanced, Midjourney-style prompt for higher quality
  const styleDirectives: Record<string, string> = {
    "photorealistic": "hyperrealistic photography, 8K resolution, professional camera, perfect exposure, sharp focus, cinematic depth of field",
    "cinematic": "cinematic film still, anamorphic lens, movie lighting, dramatic composition, color graded, blockbuster quality",
    "digital art": "digital illustration, concept art, highly detailed, trending on ArtStation, vibrant colors, professional artist",
    "oil painting": "oil on canvas, masterful brushwork, rich textures, gallery quality, impressionist lighting",
    "minimalist": "clean minimalist design, negative space, geometric precision, modern aesthetic, premium product photography",
    "anime": "anime art style, studio quality, expressive, detailed background, vibrant, professional manga artist",
    "watercolor": "watercolor painting, soft washes, professional illustration, artistic textures, beautiful color bleeding",
    "dark fantasy": "dark fantasy concept art, dramatic lighting, epic atmosphere, intricate details, cinematic, ArtStation featured",
    "studio photo": "professional studio photography, perfect lighting setup, clean background, commercial quality, editorial style",
  };

  const styleDesc = styleDirectives[style] ?? styleDirectives["photorealistic"];
  const enhancedPrompt = `${prompt}. ${styleDesc}. No text, no watermarks, no artifacts, ultra high quality.`;

  try {
    const buffer = await generateImageBuffer(enhancedPrompt, size);
    const b64_json = buffer.toString("base64");
    res.json({ b64_json, creditsUsed: 15 });
  } catch (err) {
    req.log.error({ err }, "Error generating image");
    res.status(500).json({ error: "Failed to generate image. Please try again." });
  }
});

export default router;
