import { db } from "@workspace/db";
import { profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export type UserPlan = 'free' | 'basic' | 'pro';

// Credit configuration
const CREDIT_CONFIG = {
  free: {
    signupBonus: 70,
    dailyRefill: 20,
    maxCredits: null,
    description: "Free plan with daily credits"
  },
  basic: {
    signupBonus: 300,
    dailyRefill: 70,
    maxCredits: null,
    description: "Basic plan with higher daily credits"
  },
  pro: {
    signupBonus: null,
    dailyRefill: null,
    maxCredits: null,
    description: "Pro plan - unlimited credits"
  }
};

interface CreditTransaction {
  userId: string;
  amount: number;
  type: 'signup_bonus' | 'daily_refill' | 'plan_upgrade' | 'manual_deduction' | 'manual_addition';
  plan?: UserPlan;
  previousCredits: number;
  newCredits: number;
  metadata?: Record<string, any>;
}

// Record credit transaction (you'll need to create this table in your DB schema)
async function recordTransaction(transaction: CreditTransaction) {
  const now = new Date();
  const id = `cred_${transaction.userId}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  
  console.log('[Credits] Transaction:', {
    ...transaction,
    id,
    timestamp: now
  });
  
  // TODO: Insert into credits_history table when you create it
  return { id, ...transaction, timestamp: now };
}

// Award signup bonus to new users
export async function awardSignupBonus(userId: string, plan: UserPlan = 'free') {
  const bonus = CREDIT_CONFIG[plan]?.signupBonus;
  
  if (!bonus || plan === 'pro') {
    console.log(`[Credits] No signup bonus for ${plan} plan`);
    return { awarded: false, credits: null };
  }
  
  const profile = await db.query.profilesTable.findFirst({
    where: eq(profilesTable.id, userId)
  });
  
  if (!profile) {
    throw new Error('User profile not found');
  }
  
  // Check if already received signup bonus
  if (profile.credits && profile.credits > 0) {
    console.log(`[Credits] User ${userId} already has credits, skipping signup bonus`);
    return { awarded: false, credits: profile.credits, message: 'Signup bonus already awarded' };
  }
  
  const previousCredits = profile.credits || 0;
  const newCredits = bonus;
  
  await db.update(profilesTable)
    .set({ 
      credits: newCredits,
      updatedAt: new Date()
    })
    .where(eq(profilesTable.id, userId));
  
  await recordTransaction({
    userId,
    amount: bonus,
    type: 'signup_bonus',
    plan,
    previousCredits,
    newCredits,
    metadata: { bonusType: 'signup', timestamp: new Date().toISOString() }
  });
  
  console.log(`[Credits] ✅ Awarded ${bonus} signup credits to user ${userId}`);
  return { awarded: true, credits: newCredits, bonus };
}

// Daily refill based on plan
export async function processDailyRefill(userId: string) {
  const profile = await db.query.profilesTable.findFirst({
    where: eq(profilesTable.id, userId)
  });
  
  if (!profile) {
    throw new Error('User profile not found');
  }
  
  const today = new Date().toISOString().split('T')[0];
  const lastRefill = profile.last_refill_date ? new Date(profile.last_refill_date).toISOString().split('T')[0] : null;
  
  // Already refilled today
  if (lastRefill === today) {
    console.log(`[Credits] User ${userId} already refilled today`);
    return { refilled: false, credits: profile.credits, message: 'Already refilled today' };
  }
  
  const plan = (profile.plan || 'free') as UserPlan;
  
  // Pro users have unlimited, no refill needed
  if (plan === 'pro') {
    console.log(`[Credits] Pro user ${userId} has unlimited credits`);
    return { refilled: false, credits: 'unlimited', message: 'Pro users have unlimited credits' };
  }
  
  const refillAmount = CREDIT_CONFIG[plan]?.dailyRefill;
  
  if (!refillAmount) {
    console.log(`[Credits] No refill amount for plan ${plan}`);
    return { refilled: false, credits: profile.credits };
  }
  
  const previousCredits = profile.credits || 0;
  
  // For free and basic, add daily credits
  let newCredits = previousCredits + refillAmount;
  
  // Apply max if exists
  if (CREDIT_CONFIG[plan].maxCredits !== null) {
    newCredits = Math.min(newCredits, CREDIT_CONFIG[plan].maxCredits!);
  }
  
  await db.update(profilesTable)
    .set({ 
      credits: newCredits,
      last_refill_date: new Date(),
      updatedAt: new Date()
    })
    .where(eq(profilesTable.id, userId));
  
  await recordTransaction({
    userId,
    amount: refillAmount,
    type: 'daily_refill',
    plan,
    previousCredits,
    newCredits,
    metadata: { refillDate: today, refillType: 'daily_automatic' }
  });
  
  console.log(`[Credits] 💰 Added ${refillAmount} daily credits to ${plan} user ${userId}. New total: ${newCredits}`);
  return { refilled: true, credits: newCredits, added: refillAmount, plan };
}

// Update user plan and award upgrade credits
export async function upgradeUserPlan(userId: string, newPlan: UserPlan) {
  const profile = await db.query.profilesTable.findFirst({
    where: eq(profilesTable.id, userId)
  });
  
  if (!profile) {
    throw new Error('User profile not found');
  }
  
  const oldPlan = (profile.plan || 'free') as UserPlan;
  
  if (oldPlan === newPlan) {
    console.log(`[Credits] User ${userId} already on ${newPlan} plan`);
    return { upgraded: false, credits: profile.credits, message: `Already on ${newPlan} plan` };
  }
  
  // Get upgrade bonus for the NEW plan
  const upgradeBonus = CREDIT_CONFIG[newPlan]?.signupBonus;
  const previousCredits = profile.credits || 0;
  
  let newCredits = previousCredits;
  
  // Award upgrade bonus if applicable
  if (upgradeBonus && newPlan !== 'pro') {
    newCredits += upgradeBonus;
    console.log(`[Credits] Awarding ${upgradeBonus} upgrade bonus for ${newPlan} plan`);
  }
  
  // For pro, set to a large number (unlimited representation)
  if (newPlan === 'pro') {
    newCredits = 999999; // Representing unlimited
  }
  
  await db.update(profilesTable)
    .set({ 
      plan: newPlan,
      credits: newCredits,
      updatedAt: new Date()
    })
    .where(eq(profilesTable.id, userId));
  
  if (upgradeBonus && newPlan !== 'pro') {
    await recordTransaction({
      userId,
      amount: upgradeBonus,
      type: 'plan_upgrade',
      plan: newPlan,
      previousCredits,
      newCredits,
      metadata: { oldPlan, newPlan, upgradeBonus, upgradeType: 'paid' }
    });
    
    console.log(`[Credits] 🚀 Upgraded user ${userId} from ${oldPlan} to ${newPlan}. Awarded ${upgradeBonus} bonus credits. Total: ${newCredits}`);
  } else if (newPlan === 'pro') {
    await recordTransaction({
      userId,
      amount: 999999 - previousCredits,
      type: 'plan_upgrade',
      plan: newPlan,
      previousCredits,
      newCredits,
      metadata: { oldPlan, newPlan, unlimited: true }
    });
    
    console.log(`[Credits] 👑 Upgraded user ${userId} to PRO (unlimited credits)`);
  }
  
  return { upgraded: true, credits: newCredits, oldPlan, newPlan, bonusAwarded: upgradeBonus || 0 };
}

// Deduct credits when user uses AI features
export async function deductCredits(userId: string, amount: number, metadata?: Record<string, any>) {
  const profile = await db.query.profilesTable.findFirst({
    where: eq(profilesTable.id, userId)
  });
  
  if (!profile) {
    throw new Error('User profile not found');
  }
  
  const plan = (profile.plan || 'free') as UserPlan;
  
  // Pro users have unlimited credits
  if (plan === 'pro') {
    console.log(`[Credits] Pro user ${userId} - unlimited credits, no deduction`);
    return { success: true, credits: 'unlimited', plan, deducted: 0 };
  }
  
  const currentCredits = profile.credits || 0;
  
  if (currentCredits < amount) {
    console.log(`[Credits] ❌ User ${userId} has insufficient credits. Needs: ${amount}, Has: ${currentCredits}`);
    return { success: false, credits: currentCredits, error: 'Insufficient credits', needed: amount };
  }
  
  const newCredits = currentCredits - amount;
  
  await db.update(profilesTable)
    .set({ 
      credits: newCredits,
      updatedAt: new Date()
    })
    .where(eq(profilesTable.id, userId));
  
  await recordTransaction({
    userId,
    amount: -amount,
    type: 'manual_deduction',
    plan,
    previousCredits: currentCredits,
    newCredits,
    metadata
  });
  
  console.log(`[Credits] 🔨 Deducted ${amount} credits from ${plan} user ${userId}. Remaining: ${newCredits}`);
  return { success: true, credits: newCredits, deducted: amount, plan };
}

// Get user credits status
export async function getUserCreditsStatus(userId: string) {
  const profile = await db.query.profilesTable.findFirst({
    where: eq(profilesTable.id, userId)
  });
  
  if (!profile) {
    throw new Error('User profile not found');
  }
  
  const plan = (profile.plan || 'free') as UserPlan;
  const isPro = plan === 'pro';
  const today = new Date().toISOString().split('T')[0];
  const lastRefill = profile.last_refill_date ? new Date(profile.last_refill_date).toISOString().split('T')[0] : null;
  const needsRefill = !isPro && lastRefill !== today;
  
  return {
    userId,
    plan,
    credits: isPro ? 'unlimited' : (profile.credits || 0),
    creditsNumeric: isPro ? 999999 : (profile.credits || 0),
    isPro,
    lastRefillDate: profile.last_refill_date,
    needsRefill,
    nextRefillAmount: isPro ? 0 : CREDIT_CONFIG[plan]?.dailyRefill || 0,
    signupBonusReceived: (profile.credits || 0) > 0 && !isPro,
    config: CREDIT_CONFIG[plan],
    canUseFeatures: isPro || (profile.credits || 0) > 0
  };
}

// Get credit history (you'll need to implement this with your credits_history table)
export async function getCreditHistory(userId: string, limit: number = 50) {
  // TODO: Fetch from credits_history table when created
  console.log(`[Credits] Fetching history for user ${userId}, limit ${limit}`);
  return { userId, transactions: [], total: 0 };
}

// Process all users' daily refills (for cron job)
export async function processAllDailyRefills() {
  console.log('[Credits] 🕐 Starting daily refill process for all users...');
  const startTime = Date.now();
  
  const profiles = await db.query.profilesTable.findMany({
    where: (profiles, { ne }) => ne(profiles.plan, 'pro')
  });
  
  console.log(`[Credits] Found ${profiles.length} non-pro users to process`);
  
  let refilled = 0;
  let skipped = 0;
  let failed = 0;
  
  for (const profile of profiles) {
    try {
      const result = await processDailyRefill(profile.id);
      if (result.refilled) {
        refilled++;
        console.log(`[Credits] ✅ Refilled user ${profile.id} (${profile.plan})`);
      } else {
        skipped++;
      }
    } catch (error) {
      console.error(`[Credits] ❌ Failed to refill user ${profile.id}:`, error);
      failed++;
    }
  }
  
  const duration = Date.now() - startTime;
  console.log(`[Credits] 🎉 Daily refill completed in ${duration}ms. Refilled: ${refilled}, Skipped: ${skipped}, Failed: ${failed}`);
  
  return { refilled, skipped, failed, total: profiles.length, duration };
      }
