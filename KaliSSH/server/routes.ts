import type { Express } from "express";
import { createServer, type Server } from "http";
import { SmartMultiModelOrchestrator } from "./services/ai-orchestrator";
import { SSHClient } from "./services/ssh-client";
import { chatRequestSchema } from "@shared/schema";

const API_KEY = process.env.OPENROUTER_API_KEY;
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Initialize services
const orchestrator = API_KEY ? new SmartMultiModelOrchestrator(API_KEY, API_URL) : null;
const sshClient = new SSHClient();

export async function registerRoutes(app: Express): Promise<Server> {
  // Chat endpoint - handles both regular chat and SSH commands
  app.post("/api/chat", async (req, res) => {
    try {
      if (!orchestrator) {
        return res.status(500).json({ error: "AI service not available - missing API key" });
      }

      const validation = chatRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid request format" });
      }

      const { message, mode } = validation.data;
      const startTime = Date.now();

      let response: any;
      let sshOutput: string | null = null;

      if (mode === "ssh") {
        // Execute SSH command first
        try {
          sshOutput = await sshClient.executeCommand(message);
        } catch (sshError) {
          sshOutput = `SSH Error: ${sshError}`;
        }

        // Then get AI analysis of the command and output
        const aiMessages = [
          {
            role: "system",
            content: "You are a cybersecurity expert analyzing SSH command execution results from a Kali Linux machine. Provide detailed analysis and insights."
          },
          {
            role: "user", 
            content: `Command executed: ${message}\n\nOutput:\n${sshOutput}\n\nPlease analyze this output and provide security insights.`
          }
        ];

        response = await orchestrator.execute_mode("smart_consensus", aiMessages);
      } else {
        // Regular chat mode
        const aiMessages = [
          {
            role: "system",
            content: "You are a multi-model AI assistant with access to cybersecurity tools via SSH. You can analyze security queries and suggest appropriate commands for the Kali Linux machine."
          },
          {
            role: "user",
            content: message
          }
        ];

        response = await orchestrator.execute_mode("smart_consensus", aiMessages);
      }

      if (response.error) {
        return res.status(500).json({ error: response.error });
      }

      const responseTime = (Date.now() - startTime) / 1000;

      const chatResponse = {
        response: response.content,
        metadata: {
          mode: response.mode || mode,
          models_used: response.models_used || [],
          consensus: response.consensus || false,
          response_time: responseTime,
          ssh_executed: mode === "ssh",
          command_output: sshOutput || undefined,
        }
      };

      res.json(chatResponse);
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get models status
  app.get("/api/models", (req, res) => {
    if (!orchestrator) {
      return res.json([]);
    }

    const models = [
      {
        id: "llama",
        name: "Llama-3-8B",
        role: "general",
        status: "active",
        avgResponseTime: 1.2,
        successRate: 98
      },
      {
        id: "deepseek", 
        name: "DeepSeek",
        role: "reasoning",
        status: "active",
        avgResponseTime: 2.1,
        successRate: 94
      },
      {
        id: "mistral",
        name: "Mistral-7B", 
        role: "analysis",
        status: "active",
        avgResponseTime: 0.9,
        successRate: 96
      },
      {
        id: "qwen",
        name: "Qwen-2.5-14B",
        role: "validation", 
        status: "active",
        avgResponseTime: 1.8,
        successRate: 92
      },
      {
        id: "gpt",
        name: "GPT-3.5-Turbo",
        role: "creativity",
        status: "active", 
        avgResponseTime: 1.5,
        successRate: 95
      },
      {
        id: "gemma",
        name: "Gemma-7B",
        role: "logic",
        status: "active",
        avgResponseTime: 1.1,
        successRate: 97
      }
    ];

    res.json(models);
  });

  // Get SSH status
  app.get("/api/ssh/status", (req, res) => {
    const status = {
      connected: sshClient.isConnected(),
      host: "t-shell",
      user: "travis",
      latency: sshClient.isConnected() ? 45 : undefined,
      lastConnected: sshClient.isConnected() ? new Date() : undefined
    };

    res.json(status);
  });

  // Reconnect SSH
  app.post("/api/ssh/reconnect", async (req, res) => {
    try {
      await sshClient.connect();
      res.json({ success: true });
    } catch (error) {
      console.error("SSH reconnect error:", error);
      res.status(500).json({ error: "Failed to reconnect SSH" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
