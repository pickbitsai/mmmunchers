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

// AI-generated topic content cache
export const topicContentCache = pgTable("topic_content_cache", {
  id: serial("id").primaryKey(),
  topic: text("topic").notNull(), // The topic/search term (normalized)
  subtopic: text("subtopic").notNull().default('all'), // Subtopic variant
  items: jsonb("items").$type<string[]>().notNull(), // Array of items
  categories: jsonb("categories").$type<string[]>().notNull(), // Array of categories
  facts: jsonb("facts").$type<string[]>().notNull(), // Array of facts
  correctItems: jsonb("correct_items").$type<string[]>(), // Array of correct items (OpenAI separated)
  incorrectItems: jsonb("incorrect_items").$type<string[]>(), // Array of incorrect items (OpenAI separated)
  generatedBy: text("generated_by").notNull().default('mock'), // 'openai' or 'mock'
  usageCount: integer("usage_count").notNull().default(1),
  lastUsed: timestamp("last_used").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Create indexes for fast lookup
export const topicContentCacheIndexes = {
  topicSubtopicIdx: text("topic_subtopic_idx").notNull(),
};

export const insertTopicContentCacheSchema = createInsertSchema(topicContentCache).pick({
  topic: true,
  subtopic: true,
  items: true,
  categories: true,
  facts: true,
  correctItems: true,
  incorrectItems: true,
  generatedBy: true,
});

export type InsertTopicContentCache = z.infer<typeof insertTopicContentCacheSchema>;
export type TopicContentCache = typeof topicContentCache.$inferSelect;