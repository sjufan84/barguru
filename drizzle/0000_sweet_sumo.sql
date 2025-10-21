CREATE TABLE "cocktail_usage" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"session_id" text,
	"generated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"usage_count" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"is_premium" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
