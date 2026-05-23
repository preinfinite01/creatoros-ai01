import { Router } from "express";
import { db } from "@workspace/db";
import { profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  awardSignupBonus,
  processDailyRefill,
  upgradeUserPlan,
  deductCredits,
  getUserCreditsStatus,
  getCreditHistory,
  processAllDailyRefills
} from "../services/creditsService.js";

const router = Router();

// Get user credits status
router.get("/status/:userId", async (req, res) => {
  const { userId } = req.params;
  
  if (!userId) {
    res.status(400).json({ status: false, message: "userId is required" });
    return;
  }
  
  try {
    const status = await getUserCreditsStatus(userId);
    res.json({ status: true, data: status });
  } catch (err) {
    console.error("[Credits] Status error:", err);
    res.status(500).json({ status: false, message: "Failed to get credits status" });
  }
});

// Use credits (for AI features)
router.post("/use", async (req, res) => {
  const { userId, amount, feature, metadata } = req.body as {
    userId: string;
    amount: number;
    feature?: string;
    metadata?: Record<string, any>;
  };
  
  if (!userId || !amount || amount <= 0) {
    res.status(400).json({ status: false, message: "userId and valid amount required" });
    return;
  }
  
  try {
    const result = await deductCredits(userId, amount, { feature, timestamp: new Date().toISOString(), ...metadata });
    
    if (result.success) {
      res.json({ 
        status: true, 
        data: { 
          remainingCredits: result.credits,
          deducted: result.deducted,
          plan: result.plan,
          feature
        } 
      });
    } else {
      res.status(402).json({ 
        status: false, 
        message: result.error || "Insufficient credits",
        data: { 
          currentCredits: result.credits,
          needed: result.needed,
          upgradeUrl: "/api/paystack/payments/initialize"
        }
      });
    }
  } catch (err) {
    console.error("[Credits] Use error:", err);
    res.status(500).json({ status: false, message: "Failed to use credits" });
  }
});

// Force daily refill for a user (call this on app load)
router.post("/refill/:userId", async (req, res) => {
  const { userId } = req.params;
  
  if (!userId) {
    res.status(400).json({ status: false, message: "userId is required" });
    return;
  }
  
  try {
    const result = await processDailyRefill(userId);
    res.json({ status: true, data: result });
  } catch (err) {
    console.error("[Credits] Refill error:", err);
    res.status(500).json({ status: false, message: "Failed to process refill" });
  }
});

// Award signup bonus (call this when user registers)
router.post("/award-signup-bonus", async (req, res) => {
  const { userId, plan = "free" } = req.body as {
    userId: string;
    plan?: "free" | "basic" | "pro";
  };
  
  if (!userId) {
    res.status(400).json({ status: false, message: "userId is required" });
    return;
  }
  
  try {
    const result = await awardSignupBonus(userId, plan);
    res.json({ status: true, data: result });
  } catch (err) {
    console.error("[Credits] Award bonus error:", err);
    res.status(500).json({ status: false, message: "Failed to award signup bonus" });
  }
});

// Get credit history
router.get("/history/:userId", async (req, res) => {
  const { userId } = req.params;
  const limit = parseInt(req.query.limit as string) || 50;
  
  if (!userId) {
    res.status(400).json({ status: false, message: "userId is required" });
    return;
  }
  
  try {
    const history = await getCreditHistory(userId, limit);
    res.json({ status: true, data: history });
  } catch (err) {
    console.error("[Credits] History error:", err);
    res.status(500).json({ status: false, message: "Failed to get credit history" });
  }
});

// Admin only: Process all daily refills (cron job endpoint)
router.post("/admin/process-all-refills", async (req, res) => {
  // Add your admin auth middleware here
  const adminKey = req.headers["x-admin-key"];
  if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    res.status(401).json({ status: false, message: "Unauthorized" });
    return;
  }
  
  try {
    const result = await processAllDailyRefills();
    res.json({ status: true, data: result });
  } catch (err) {
    console.error("[Credits] Process all refills error:", err);
    res.status(500).json({ status: false, message: "Failed to process refills" });
  }
});

// Admin only: Manually add credits
router.post("/admin/add", async (req, res) => {
  const adminKey = req.headers["x-admin-key"];
  if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    res.status(401).json({ status: false, message: "Unauthorized" });
    return;
  }
  
  const { userId, amount, reason } = req.body as {
    userId: string;
    amount: number;
    reason: string;
  };
  
  if (!userId || !amount) {
    res.status(400).json({ status: false, message: "userId and amount required" });
    return;
  }
  
  try {
    const profile = await db.query.profilesTable.findFirst({
      where: eq(profilesTable.id, userId)
    });
    
    if (!profile) {
      res.status(404).json({ status: false, message: "User not found" });
      return;
    }
    
    const previousCredits = profile.credits || 0;
    const newCredits = previousCredits + amount;
    
    await db.update(profilesTable)
      .set({ 
        credits: newCredits,
        updatedAt: new Date()
      })
      .where(eq(profilesTable.id, userId));
    
    res.json({ 
      status: true, 
      data: { 
        userId,
        previousCredits, 
        newCredits, 
        added: amount, 
        reason,
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error("[Credits] Admin add error:", err);
    res.status(500).json({ status: false, message: "Failed to add credits" });
  }
});

export default router;
