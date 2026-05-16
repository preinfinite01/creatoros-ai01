import { Router } from "express";
import { db, profilesTable, projectsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";

const router = Router();

router.get("/user/profile/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const profile = await db.query.profilesTable.findFirst({
      where: eq(profilesTable.id, userId),
    });
    res.json({ status: true, data: profile ?? null });
  } catch (err) {
    req.log.error({ err }, "Error fetching profile");
    res.status(500).json({ status: false, message: "Failed to fetch profile" });
  }
});

router.post("/user/profile", async (req, res) => {
  const { id, email, niche, platforms, goals, content_style, onboarding_completed } = req.body as {
    id: string;
    email: string;
    niche?: string;
    platforms?: string[];
    goals?: string[];
    content_style?: string;
    onboarding_completed?: boolean;
  };

  if (!id || !email) {
    res.status(400).json({ status: false, message: "id and email are required" });
    return;
  }

  try {
    const existing = await db.query.profilesTable.findFirst({
      where: eq(profilesTable.id, id),
    });

    const now = new Date();
    if (existing) {
      const updated = await db
        .update(profilesTable)
        .set({
          email,
          niche: niche ?? existing.niche,
          platforms: platforms ?? existing.platforms,
          goals: goals ?? existing.goals,
          contentStyle: content_style ?? existing.contentStyle,
          onboardingCompleted: onboarding_completed ? 1 : (existing.onboardingCompleted),
          updatedAt: now,
        })
        .where(eq(profilesTable.id, id))
        .returning();
      res.json({ status: true, data: updated[0] });
    } else {
      const created = await db
        .insert(profilesTable)
        .values({
          id,
          email,
          niche,
          platforms: platforms ?? [],
          goals: goals ?? [],
          contentStyle: content_style,
          onboardingCompleted: onboarding_completed ? 1 : 0,
          plan: "free",
          credits: 100,
        })
        .returning();
      res.json({ status: true, data: created[0] });
    }
  } catch (err) {
    req.log.error({ err }, "Error upserting profile");
    res.status(500).json({ status: false, message: "Failed to update profile" });
  }
});

router.get("/user/projects/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const projects = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.userId, userId))
      .orderBy(desc(projectsTable.createdAt));
    res.json({ status: true, data: projects });
  } catch (err) {
    req.log.error({ err }, "Error fetching projects");
    res.status(500).json({ status: false, message: "Failed to fetch projects" });
  }
});

router.post("/user/projects", async (req, res) => {
  const { user_id, title, type, content, platform, niche } = req.body as {
    user_id: string;
    title: string;
    type: string;
    content?: Record<string, unknown>;
    platform?: string;
    niche?: string;
  };

  if (!user_id || !title || !type) {
    res.status(400).json({ status: false, message: "user_id, title, and type are required" });
    return;
  }

  try {
    const created = await db
      .insert(projectsTable)
      .values({
        userId: user_id,
        title,
        type,
        content: content ?? {},
        platform,
        niche,
      })
      .returning();
    res.json({ status: true, data: created[0] });
  } catch (err) {
    req.log.error({ err }, "Error creating project");
    res.status(500).json({ status: false, message: "Failed to create project" });
  }
});

router.delete("/user/projects/:id", async (req, res) => {
  const id = Number(req.params.id);
  const userId = req.query.userId as string;

  if (!userId) {
    res.status(400).json({ status: false, message: "userId query param required" });
    return;
  }

  try {
    const deleted = await db
      .delete(projectsTable)
      .where(and(eq(projectsTable.id, id), eq(projectsTable.userId, userId)))
      .returning();

    if (!deleted.length) {
      res.status(404).json({ status: false, message: "Project not found" });
      return;
    }

    res.json({ status: true });
  } catch (err) {
    req.log.error({ err }, "Error deleting project");
    res.status(500).json({ status: false, message: "Failed to delete project" });
  }
});

export default router;
