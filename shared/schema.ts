import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Game progress tracking - no user authentication needed
export const gameProgress = pgTable("game_progress", {
  id: serial("id").primaryKey(),
  playerName: text("player_name").notNull(),
  highScore: integer("high_score").notNull().default(0),
  currentLevel: integer("current_level").notNull().default(1),
  topicScores: jsonb("topic_scores").$type<Record<string, number>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertGameProgressSchema = createInsertSchema(gameProgress).pick({
  playerName: true,
  highScore: true,
  currentLevel: true,
  topicScores: true,
});

export type InsertGameProgress = z.infer<typeof insertGameProgressSchema>;
export type GameProgress = typeof gameProgress.$inferSelect;