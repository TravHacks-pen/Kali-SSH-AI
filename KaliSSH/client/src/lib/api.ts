import { apiRequest } from "./queryClient";
import { ChatRequest, ChatResponse, AIModel, SSHStatus } from "@shared/schema";

export const api = {
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await apiRequest("POST", "/api/chat", request);
    return response.json();
  },

  async getModels(): Promise<AIModel[]> {
    const response = await apiRequest("GET", "/api/models");
    return response.json();
  },

  async getSSHStatus(): Promise<SSHStatus> {
    const response = await apiRequest("GET", "/api/ssh/status");
    return response.json();
  },

  async reconnectSSH(): Promise<void> {
    await apiRequest("POST", "/api/ssh/reconnect");
  },
};
