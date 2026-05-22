import { Router } from "express";

const imageRouter = Router();

imageRouter.post("/image", async (req, res) => {
  try {
    const { prompt, style, aspectRatio } = req.body as { prompt?: string; style?: string; aspectRatio?: string };

    if (!prompt) {
      res.status(400).send("prompt is required");
      return;
    }

    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      res.status(500).send("HUGGINGFACE_API_KEY is not configured");
      return;
    }

    const fullPrompt = [prompt, style ? `${style} style` : null, aspectRatio ? `aspect ratio ${aspectRatio}` : null]
      .filter(Boolean)
      .join(", ");

    const hfRes = await fetch(
      "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: fullPrompt }),
      }
    );

    if (!hfRes.ok) {
      const text = await hfRes.text();
      res.status(hfRes.status).send(text);
      return;
    }

    const arrayBuffer = await hfRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", hfRes.headers.get("content-type") ?? "image/jpeg");
    res.setHeader("Content-Length", buffer.length);
    res.send(buffer);
  } catch (err) {
    res.status(500).send(String(err));
  }
});

export default imageRouter;
