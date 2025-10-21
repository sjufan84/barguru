import { pgTable, text, serial, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/**
 * Users table - stores user information synced from Clerk
 */
export const users = pgTable('users', {
  id: text('id').primaryKey(), // Clerk user ID
  email: text('email').notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  isPremium: boolean('is_premium').notNull().default(false),
  createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

/**
 * Cocktail usage table - tracks cocktail generation attempts for quota enforcement
 * Non-members can create only 1 cocktail before being prompted to sign up
 */
export const cocktailUsage = pgTable('cocktail_usage', {
  id: serial('id').primaryKey(),
  userId: text('user_id'), // Null for anonymous users
  sessionId: text('session_id'), // For tracking anonymous users
  generatedAt: timestamp('generated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  usageCount: integer('usage_count').notNull().default(1),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type CocktailUsage = typeof cocktailUsage.$inferSelect;
export type NewCocktailUsage = typeof cocktailUsage.$inferInsert;
