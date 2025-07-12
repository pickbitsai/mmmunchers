import { 
  type InsertTopicContentCache, 
  type TopicContentCache 
} from "@shared/schema";

// Storage interface for topic content caching
export interface IStorage {
  // Topic content cache methods
  getTopicContent(topic: string, subtopic: string): Promise<TopicContentCache | undefined>;
  saveTopicContent(content: InsertTopicContentCache): Promise<TopicContentCache>;
  updateTopicUsage(id: number): Promise<void>;
  getPopularTopics(limit: number): Promise<Array<{ topic: string; usageCount: number }>>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private topicContent: Map<string, TopicContentCache>;
  private currentId: number;

  constructor() {
    this.topicContent = new Map();
    this.currentId = 1;
  }

  private getTopicKey(topic: string, subtopic: string): string {
    return `${topic}:::${subtopic}`;
  }

  async getTopicContent(topic: string, subtopic: string): Promise<TopicContentCache | undefined> {
    const key = this.getTopicKey(topic, subtopic);
    return this.topicContent.get(key);
  }

  async saveTopicContent(content: InsertTopicContentCache): Promise<TopicContentCache> {
    const id = this.currentId++;
    const now = new Date();
    const topicContent: TopicContentCache = {
      id,
      ...content,
      subtopic: content.subtopic || 'all',
      generatedBy: content.generatedBy || 'unknown',
      correctItems: content.correctItems || null,
      incorrectItems: content.incorrectItems || null,
      usageCount: 1,
      lastUsed: now,
      createdAt: now
    };
    
    const key = this.getTopicKey(content.topic, content.subtopic || 'all');
    this.topicContent.set(key, topicContent);
    
    return topicContent;
  }

  async updateTopicUsage(id: number): Promise<void> {
    // Find the topic by id and update usage
    for (const [key, content] of this.topicContent.entries()) {
      if (content.id === id) {
        content.usageCount++;
        content.lastUsed = new Date();
        this.topicContent.set(key, content);
        break;
      }
    }
  }

  async getPopularTopics(limit: number): Promise<Array<{ topic: string; usageCount: number }>> {
    const topics = Array.from(this.topicContent.values())
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit)
      .map(content => ({
        topic: content.topic,
        usageCount: content.usageCount
      }));
    
    return topics;
  }
}

export const storage = new MemStorage();