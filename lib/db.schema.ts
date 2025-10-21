import {
  pgTable,
  text,
  serial,
  timestamp,
  integer,
  boolean,
  jsonb,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

import type { CocktailInput, GenerateCocktail } from '@/schemas/cocktailSchemas';

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

/**
 * Saved cocktails table - stores generated cocktails saved by authenticated users
 */
export const savedCocktails = pgTable('saved_cocktails', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  cocktail: jsonb('cocktail')
    .$type<GenerateCocktail>()
    .notNull(),
  inputs: jsonb('inputs').$type<CocktailInput | null>().default(sql`NULL`),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type CocktailUsage = typeof cocktailUsage.$inferSelect;
export type NewCocktailUsage = typeof cocktailUsage.$inferInsert;
export type SavedCocktail = typeof savedCocktails.$inferSelect;
export type NewSavedCocktail = typeof savedCocktails.$inferInsert;
