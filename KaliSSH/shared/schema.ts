import { z } from "zod";

export const messageSchema = z.object({
  id: z.string(),
  content: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  timestamp: z.date(),
  metadata: z.object({
    mode: z.string().optional(),
    models_used: z.array(z.string()).optional(),
    consensus: z.boolean().optional(),
    ssh_executed: z.boolean().optional(),
    command_output: z.string().optional(),
    response_time: z.number().optional(),
  }).optional(),
});

export const aiModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  status: z.enum(["active", "inactive", "error"]),
  avgResponseTime: z.number(),
  successRate: z.number(),
});

export const sshStatusSchema = z.object({
  connected: z.boolean(),
  host: z.string(),
  user: z.string(),
  latency: z.number().optional(),
  lastConnected: z.date().optional(),
});

export const chatRequestSchema = z.object({
  message: z.string(),
  mode: z.enum(["chat", "ssh"]).default("chat"),
});

export const chatResponseSchema = z.object({
  response: z.string(),
  metadata: z.object({
    mode: z.string(),
    models_used: z.array(z.string()),
    consensus: z.boolean(),
    response_time: z.number(),
    ssh_executed: z.boolean().optional(),
    command_output: z.string().optional(),
  }),
});

export type Message = z.infer<typeof messageSchema>;
export type AIModel = z.infer<typeof aiModelSchema>;
export type SSHStatus = z.infer<typeof sshStatusSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ChatResponse = z.infer<typeof chatResponseSchema>;
