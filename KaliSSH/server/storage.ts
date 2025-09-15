import { Message, AIModel, SSHStatus } from "@shared/schema";
import { randomUUID } from "crypto";

// Storage interface for AI Terminal application
export interface IStorage {
  getMessages(): Promise<Message[]>;
  addMessage(message: Message): Promise<Message>;
  clearMessages(): Promise<void>;
  getAIModels(): Promise<AIModel[]>;
  updateAIModel(model: AIModel): Promise<AIModel>;
}

export class MemStorage implements IStorage {
  private messages: Map<string, Message>;
  private models: Map<string, AIModel>;

  constructor() {
    this.messages = new Map();
    this.models = new Map();
  }

  async getMessages(): Promise<Message[]> {
    return Array.from(this.messages.values()).sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
  }

  async addMessage(message: Message): Promise<Message> {
    this.messages.set(message.id, message);
    return message;
  }

  async clearMessages(): Promise<void> {
    this.messages.clear();
  }

  async getAIModels(): Promise<AIModel[]> {
    return Array.from(this.models.values());
  }

  async updateAIModel(model: AIModel): Promise<AIModel> {
    this.models.set(model.id, model);
    return model;
  }
}

export const storage = new MemStorage();
