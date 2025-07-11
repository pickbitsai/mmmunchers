import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Topic content cache endpoints
  app.get("/api/topic-content/:topic", async (req, res) => {
    try {
      const { topic } = req.params;
      const { subtopic = 'all' } = req.query;
      
      // Normalize the topic for consistent caching
      const normalizedTopic = topic.toLowerCase().trim();
      
      // Try to get from cache first
      const cached = await storage.getTopicContent(normalizedTopic, subtopic as string);
      
      if (cached) {
        // Update usage stats
        await storage.updateTopicUsage(cached.id);
        
        res.json({
          items: cached.items,
          categories: cached.categories,
          facts: cached.facts,
          fromCache: true,
          generatedBy: cached.generatedBy
        });
      } else {
        // Return null to indicate AI generation needed
        res.json(null);
      }
    } catch (error) {
      console.error('Error fetching topic content:', error);
      res.status(500).json({ error: 'Failed to fetch topic content' });
    }
  });
  
  app.post("/api/topic-content", async (req, res) => {
    try {
      const { topic, subtopic = 'all', items, categories, facts, generatedBy = 'mock' } = req.body;
      
      // Normalize the topic
      const normalizedTopic = topic.toLowerCase().trim();
      
      // Save to cache
      const saved = await storage.saveTopicContent({
        topic: normalizedTopic,
        subtopic,
        items,
        categories,
        facts,
        generatedBy
      });
      
      res.json({ success: true, id: saved.id });
    } catch (error) {
      console.error('Error saving topic content:', error);
      res.status(500).json({ error: 'Failed to save topic content' });
    }
  });
  
  // Get popular topics for suggestions
  app.get("/api/popular-topics", async (req, res) => {
    try {
      const topics = await storage.getPopularTopics(10);
      res.json(topics);
    } catch (error) {
      console.error('Error fetching popular topics:', error);
      res.status(500).json({ error: 'Failed to fetch popular topics' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
