import { db } from '@/lib/db';
import { users, cocktailUsage } from '@/lib/db.schema';
import { eq, and } from 'drizzle-orm';

const ANON_COCKTAIL_LIMIT = 1; // Non-members can create 1 cocktail

/**
 * Get or create a user in the database
 */
export async function getOrCreateUser(
  userId: string,
  email: string,
  firstName?: string | null,
  lastName?: string | null,
) {
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (existingUser.length > 0) {
    return existingUser[0];
  }

  // Create new user
  const newUser = await db
    .insert(users)
    .values({
      id: userId,
      email,
      firstName: firstName || '',
      lastName: lastName || '',
      isPremium: false,
    })
    .returning();

  return newUser[0];
}

/**
 * Get user by ID
 */
export async function getUser(userId: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result[0] || null;
}

/**
 * Track cocktail generation attempt for a user
 */
export async function trackCocktailGeneration(userId: string | null, sessionId: string) {
  return await db
    .insert(cocktailUsage)
    .values({
      userId: userId || null,
      sessionId,
    })
    .returning();
}

/**
 * Check if an anonymous user (non-member) has exceeded their cocktail limit
 * Returns { canGenerate: boolean, usageCount: number }
 */
export async function checkAnonCocktailQuota(sessionId: string): Promise<{
  canGenerate: boolean;
  usageCount: number;
}> {
  const usageRecords = await db
    .select()
    .from(cocktailUsage)
    .where(
      and(
        eq(cocktailUsage.sessionId, sessionId),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        eq(cocktailUsage.userId, null as any), // Anonymous user
      ),
    );

  const usageCount = usageRecords.length;
  return {
    canGenerate: usageCount < ANON_COCKTAIL_LIMIT,
    usageCount,
  };
}

/**
 * Update user premium status
 */
export async function updateUserPremiumStatus(userId: string, isPremium: boolean) {
  return await db
    .update(users)
    .set({ isPremium })
    .where(eq(users.id, userId))
    .returning();
}

/**
 * Get cocktail generation count for a user
 */
export async function getUserCocktailCount(userId: string): Promise<number> {
  const records = await db
    .select()
    .from(cocktailUsage)
    .where(eq(cocktailUsage.userId, userId));

  return records.length;
}
