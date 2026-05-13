import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import {
  GenerateTitlesBody,
  GenerateHooksBody,
  GenerateScriptBody,
  GenerateIdeasBody,
  GenerateWorkflowBody,
} from "@workspace/api-zod";

const router = Router();

router.post("/ai/generate-titles", async (req, res) => {
  const parsed = GenerateTitlesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { topic, niche, platform, tone, count = 5 } = parsed.data;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 1024,
      messages: [
        {
          role: "system",
          content: `You are a viral content strategist who creates scroll-stopping video titles optimized for ${platform}. You understand retention psychology, curiosity gaps, and platform-specific algorithms. Generate titles that creators would actually want to use.`,
        },
        {
          role: "user",
          content: `Generate ${count} viral video titles for the following:
Topic: ${topic}
Niche: ${niche || "general"}
Platform: ${platform}
Tone: ${tone || "engaging and energetic"}

Requirements:
- Make them attention-grabbing and click-worthy
- Use proven title formulas (numbers, questions, power words, curiosity gaps)
- Optimize for the specific platform
- No clickbait that doesn't deliver value
- Each title should be unique in approach

Return ONLY a JSON object with this exact structure:
{"titles": ["title1", "title2", "title3", ...]}`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "{}";
    let titles: string[] = [];
    try {
      const parsed = JSON.parse(content);
      titles = parsed.titles ?? [];
    } catch {
      titles = content
        .split("\n")
        .filter((l) => l.trim())
        .slice(0, count);
    }

    res.json({ titles, creditsUsed: 5 });
  } catch (err) {
    req.log.error({ err }, "Error generating titles");
    res.status(500).json({ error: "Failed to generate titles" });
  }
});

router.post("/ai/generate-hooks", async (req, res) => {
  const parsed = GenerateHooksBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { topic, niche, platform, tone, count = 5 } = parsed.data;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 1024,
      messages: [
        {
          role: "system",
          content: `You are a master content creator who specializes in writing the perfect first 3 seconds of ${platform} videos. You understand pattern interrupts, emotional triggers, and retention mechanics that keep viewers watching.`,
        },
        {
          role: "user",
          content: `Generate ${count} powerful hooks for a ${platform} video about:
Topic: ${topic}
Niche: ${niche || "general"}
Tone: ${tone || "bold and direct"}

Hook requirements:
- Must grab attention in the FIRST sentence
- Use pattern interrupts, bold statements, or provocative questions
- Create immediate curiosity or emotional response
- 1-3 sentences max, punchy and direct
- Each hook uses a different psychological approach

Return ONLY a JSON object:
{"hooks": ["hook1", "hook2", ...]}`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "{}";
    let hooks: string[] = [];
    try {
      const parsed = JSON.parse(content);
      hooks = parsed.hooks ?? [];
    } catch {
      hooks = content
        .split("\n")
        .filter((l) => l.trim())
        .slice(0, count);
    }

    res.json({ hooks, creditsUsed: 5 });
  } catch (err) {
    req.log.error({ err }, "Error generating hooks");
    res.status(500).json({ error: "Failed to generate hooks" });
  }
});

router.post("/ai/generate-script", async (req, res) => {
  const parsed = GenerateScriptBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { topic, niche, platform, tone, duration, hook, title } = parsed.data;

  const durationMap: Record<string, string> = {
    short: "15-30 seconds (100-200 words)",
    medium: "60-90 seconds (300-500 words)",
    long: "5-10 minutes (900-1800 words)",
  };

  const platformMap: Record<string, string> = {
    tiktok: "TikTok (fast-paced, trendy, Gen Z audience)",
    youtube_shorts: "YouTube Shorts (vertical, fast, discovery-focused)",
    instagram: "Instagram Reels (aesthetic, lifestyle, community-driven)",
    youtube: "YouTube Shorts",
    youtube_longform:
      "YouTube Long-form (educational, storytelling, SEO-optimized)",
  };

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 4096,
      messages: [
        {
          role: "system",
          content: `You are a professional content scriptwriter for ${platformMap[platform] || platform}. You write scripts with perfect pacing, emotional beats, pattern interrupts, and CTAs that maximize watch time and conversions. You understand the algorithm and creator psychology deeply.`,
        },
        {
          role: "user",
          content: `Write a complete ${durationMap[duration]} script for:
Topic: ${topic}
Niche: ${niche || "general"}
Platform: ${platformMap[platform] || platform}
Tone: ${tone || "engaging and authentic"}
${hook ? `Opening Hook: ${hook}` : ""}
${title ? `Video Title: ${title}` : ""}

Script requirements:
- Start with the provided hook (or create a powerful one if not provided)
- Include pattern interrupts every 30 seconds
- Use emotional pacing (build tension, release, rebuild)
- Include specific CTA integrated naturally (not bolted on)
- Add [VISUAL CUE] tags for key moments
- Structure: Hook → Problem/Intrigue → Value Delivery → Pattern Interrupt → More Value → CTA

Return ONLY a JSON object:
{
  "script": "full script text with [VISUAL CUE] tags",
  "hook": "the opening hook used",
  "cta": "the call to action used",
  "estimatedDuration": "estimated watch time"
}`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "{}";
    let result = {
      script: "",
      hook: hook ?? "",
      cta: "",
      estimatedDuration: durationMap[duration] ?? "",
    };
    try {
      const parsed = JSON.parse(content);
      result = { ...result, ...parsed };
    } catch {
      result.script = content;
    }

    res.json({ ...result, creditsUsed: 20 });
  } catch (err) {
    req.log.error({ err }, "Error generating script");
    res.status(500).json({ error: "Failed to generate script" });
  }
});

router.post("/ai/generate-ideas", async (req, res) => {
  const parsed = GenerateIdeasBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { niche, platform, tone, count = 8 } = parsed.data;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 2048,
      messages: [
        {
          role: "system",
          content: `You are a viral content strategist with deep knowledge of trending topics, creator economics, and audience psychology for ${platform}. You generate content ideas that balance trending topics with evergreen value.`,
        },
        {
          role: "user",
          content: `Generate ${count} high-potential content ideas for a ${platform} creator in the ${niche} niche.
Tone/Style: ${tone || "authentic and engaging"}

For each idea provide:
- A compelling title
- Brief description (2 sentences)
- Viral potential rating (high/medium/low) based on trend analysis
- 3-5 relevant hashtags/tags

Return ONLY a JSON object:
{
  "ideas": [
    {
      "title": "video title",
      "description": "what the video covers and why it will perform well",
      "viralPotential": "high|medium|low",
      "tags": ["tag1", "tag2", "tag3"]
    }
  ]
}`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "{}";
    let ideas: unknown[] = [];
    try {
      const parsed = JSON.parse(content);
      ideas = parsed.ideas ?? [];
    } catch {
      ideas = [];
    }

    res.json({ ideas, creditsUsed: 10 });
  } catch (err) {
    req.log.error({ err }, "Error generating ideas");
    res.status(500).json({ error: "Failed to generate ideas" });
  }
});

router.post("/ai/generate-workflow", async (req, res) => {
  const parsed = GenerateWorkflowBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { topic, niche, platform, tone, duration = "medium" } = parsed.data;

  const durationMap: Record<string, string> = {
    short: "15-30 seconds",
    medium: "60-90 seconds",
    long: "5-10 minutes",
  };

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 4096,
      messages: [
        {
          role: "system",
          content: `You are a complete content creation system that generates a full creator workflow from idea to publish-ready content. You produce every piece of content a creator needs for a single video, all optimized for ${platform}.`,
        },
        {
          role: "user",
          content: `Generate a complete creator workflow for:
Topic: ${topic}
Niche: ${niche || "general"}
Platform: ${platform}
Tone: ${tone || "authentic and engaging"}
Duration: ${durationMap[duration]}

Generate ALL components of the workflow:
1. Refined idea concept
2. Attention-grabbing hook (first 3 seconds)
3. Optimized video title
4. Full video script with pacing
5. Strong CTA
6. Social media caption
7. 10-15 relevant hashtags

Return ONLY a JSON object:
{
  "idea": "refined concept description",
  "hook": "opening hook text",
  "title": "video title",
  "script": "full script",
  "cta": "call to action",
  "caption": "social media caption",
  "hashtags": ["#tag1", "#tag2", ...]
}`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "{}";
    let result = {
      idea: "",
      hook: "",
      title: "",
      script: "",
      cta: "",
      caption: "",
      hashtags: [] as string[],
    };
    try {
      const parsed = JSON.parse(content);
      result = { ...result, ...parsed };
    } catch {
      result.script = content;
    }

    res.json({ ...result, creditsUsed: 40 });
  } catch (err) {
    req.log.error({ err }, "Error generating workflow");
    res.status(500).json({ error: "Failed to generate workflow" });
  }
});

export default router;
