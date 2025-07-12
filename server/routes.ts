import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Topic content cache endpoints
  app.get("/api/topic-content/:topic", async (req, res) => {
    try {
      const { topic } = req.params;
      const { subtopic = 'all' } = req.query;
      
      // Input validation
      if (!topic || typeof topic !== 'string' || topic.length > 100) {
        return res.status(400).json({ error: 'Invalid topic parameter' });
      }
      
      if (subtopic && (typeof subtopic !== 'string' || subtopic.length > 50)) {
        return res.status(400).json({ error: 'Invalid subtopic parameter' });
      }
      
      // Sanitize and normalize the topic
      const normalizedTopic = topic.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '');
      
      // Try to get from cache first
      const cached = await storage.getTopicContent(normalizedTopic, subtopic as string);
      
      if (cached) {
        // Update usage stats
        await storage.updateTopicUsage(cached.id);
        
        res.json({
          items: cached.items,
          categories: cached.categories,
          facts: cached.facts,
          correctItems: cached.correctItems,
          incorrectItems: cached.incorrectItems,
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
      const { topic, subtopic = 'all', items, categories, facts, correctItems, incorrectItems, generatedBy = 'mock' } = req.body;
      
      // Input validation
      if (!topic || typeof topic !== 'string' || topic.length > 100) {
        return res.status(400).json({ error: 'Invalid topic parameter' });
      }
      
      if (!Array.isArray(items) || items.length === 0 || items.length > 100) {
        return res.status(400).json({ error: 'Invalid items parameter' });
      }
      
      if (!Array.isArray(categories) || categories.length > 20) {
        return res.status(400).json({ error: 'Invalid categories parameter' });
      }
      
      if (!Array.isArray(facts) || facts.length > 30) {
        return res.status(400).json({ error: 'Invalid facts parameter' });
      }
      
      // Sanitize inputs
      const sanitizedItems = items.filter(item => 
        typeof item === 'string' && item.length > 0 && item.length <= 50
      ).slice(0, 100);
      
      const sanitizedCategories = categories.filter(cat => 
        typeof cat === 'string' && cat.length > 0 && cat.length <= 30
      ).slice(0, 20);
      
      const sanitizedFacts = facts.filter(fact => 
        typeof fact === 'string' && fact.length > 0 && fact.length <= 100
      ).slice(0, 30);
      
      // Normalize the topic
      const normalizedTopic = topic.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '');
      
      // Sanitize correct/incorrect items if provided
      const sanitizedCorrectItems = Array.isArray(correctItems) 
        ? correctItems.filter(item => typeof item === 'string' && item.length > 0 && item.length <= 50).slice(0, 50)
        : undefined;
        
      const sanitizedIncorrectItems = Array.isArray(incorrectItems)
        ? incorrectItems.filter(item => typeof item === 'string' && item.length > 0 && item.length <= 50).slice(0, 50)
        : undefined;

      // Save to cache
      const saved = await storage.saveTopicContent({
        topic: normalizedTopic,
        subtopic,
        items: sanitizedItems,
        categories: sanitizedCategories,
        facts: sanitizedFacts,
        correctItems: sanitizedCorrectItems,
        incorrectItems: sanitizedIncorrectItems,
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

  // Secure AI generation endpoint with rate limiting
  const aiRequestTracker = new Map<string, { count: number, lastRequest: number }>();
  const AI_RATE_LIMIT = 5; // requests per minute
  const AI_RATE_WINDOW = 60000; // 1 minute

  app.post("/api/ai-generate", async (req, res) => {
    try {
      const { topic, subtopic, level, prompt } = req.body;
      
      // Input validation
      if (!topic || typeof topic !== 'string' || topic.length > 100) {
        return res.status(400).json({ error: 'Invalid topic parameter' });
      }
      
      if (subtopic && (typeof subtopic !== 'string' || subtopic.length > 50)) {
        return res.status(400).json({ error: 'Invalid subtopic parameter' });
      }
      
      if (level && (typeof level !== 'number' || level < 1 || level > 50)) {
        return res.status(400).json({ error: 'Invalid level parameter' });
      }
      
      if (!prompt || typeof prompt !== 'string' || prompt.length > 2000) {
        return res.status(400).json({ error: 'Invalid prompt parameter' });
      }
      
      // Rate limiting by IP
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      const now = Date.now();
      const tracker = aiRequestTracker.get(clientIP);
      
      if (tracker) {
        if (now - tracker.lastRequest < AI_RATE_WINDOW) {
          if (tracker.count >= AI_RATE_LIMIT) {
            return res.status(429).json({ error: 'Rate limit exceeded. Try again later.' });
          }
          tracker.count++;
        } else {
          tracker.count = 1;
          tracker.lastRequest = now;
        }
      } else {
        aiRequestTracker.set(clientIP, { count: 1, lastRequest: now });
      }
      
      // Check if OpenAI API key is available
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        console.log('OpenAI API key not found in environment variables');
        return res.status(503).json({ 
          error: 'AI service not configured', 
          success: false 
        });
      }
      
      console.log('OpenAI API key found, making request for topic:', topic);
      
      // Make secure API call to OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an educational content generator for a learning game. Generate diverse, accurate, and age-appropriate content. Always respond with valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 800,
          response_format: { type: "json_object" }
        })
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.error('OpenAI API error:', error);
        return res.status(503).json({ 
          error: 'AI service temporarily unavailable', 
          success: false 
        });
      }
      
      const data = await response.json();
      
      // Parse and validate OpenAI response
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const content = JSON.parse(data.choices[0].message.content);
        
        // Validate and clean the response
        const correctItems = Array.isArray(content.correctItems) 
          ? content.correctItems.filter((item: any) => typeof item === 'string' && item.length > 0 && item.length <= 50)
          : [];
          
        const incorrectItems = Array.isArray(content.incorrectItems) 
          ? content.incorrectItems.filter((item: any) => typeof item === 'string' && item.length > 0 && item.length <= 50)
          : [];
          
        const categories = Array.isArray(content.categories)
          ? content.categories.filter((cat: any) => typeof cat === 'string' && cat.length > 0 && cat.length <= 30)
          : [];
          
        const facts = Array.isArray(content.facts)
          ? content.facts.filter((fact: any) => typeof fact === 'string' && fact.length > 0 && fact.length <= 100)
          : [];
        
        const processedContent = {
          items: [...correctItems, ...incorrectItems].slice(0, 40),
          categories: categories.slice(0, 10),
          facts: facts.slice(0, 15),
          correctItems: correctItems,
          incorrectItems: incorrectItems
        };
        
        res.json({ 
          success: true, 
          content: processedContent,
          source: 'openai'
        });
      } else {
        res.status(503).json({ 
          error: 'Invalid AI response format', 
          success: false 
        });
      }
      
    } catch (error) {
      console.error('AI generation error:', error);
      res.status(500).json({ 
        error: 'Internal server error', 
        success: false 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
