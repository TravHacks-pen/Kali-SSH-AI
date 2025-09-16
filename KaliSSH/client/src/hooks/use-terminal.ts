import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../hooks/use-toast";
import { api } from "../lib/api";
import type { Message, ChatRequest, AIModel, SSHStatus } from "@shared/schema";

export function useTerminal() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingCommand, setPendingCommand] = useState<string | null>(null);
  const [pendingIntent, setPendingIntent] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [aiFeedback, setAIFeedback] = useState<string[]>([]);
  const [commandAnalysis, setCommandAnalysis] = useState<{ breakdown?: string; risks?: string; alternatives?: string } | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch models status
  const { data: models = [] } = useQuery({
    queryKey: ["/api/models"],
    queryFn: () => api.getModels(),
    refetchInterval: 5000,
  });

  // Fetch SSH status
  const { data: sshStatus = { connected: false, host: "t-shell", user: "travis" } } = useQuery({
    queryKey: ["/api/ssh/status"],
    queryFn: () => api.getSSHStatus(),
    refetchInterval: 10000,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (request: ChatRequest) => api.sendMessage(request),
    onSuccess: (response: any) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        content: response.response,
        role: "assistant",
        timestamp: new Date(),
        metadata: {
          mode: response.metadata.mode,
          models_used: response.metadata.models_used,
          consensus: response.metadata.consensus,
          ssh_executed: response.metadata.ssh_executed,
          command_output: response.metadata.command_output,
        },
      };
      setMessages((prev: Message[]) => {
        // Get the latest user prompt
        const lastUserMessage = [...prev].reverse().find((m: Message) => m.role === "user");
        // Check last 5 assistant messages for duplicate content
        const recentAssistantMessages = prev.slice(-5).filter((m: Message) => m.role === "assistant");
        const isDuplicate = recentAssistantMessages.some((m: Message) => m.content.trim() === newMessage.content.trim());
        // Check if the new response is relevant to the latest user prompt
        const isRelevant = lastUserMessage ? newMessage.content.toLowerCase().includes(lastUserMessage.content.toLowerCase().slice(0, 20)) : true;
        if (isDuplicate || !isRelevant) {
          return prev; // Do not add duplicate or irrelevant response
        }
        return [...prev, newMessage];
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reconnect SSH mutation
  const reconnectSSHMutation = useMutation({
    mutationFn: () => api.reconnectSSH(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ssh/status"] });
      toast({
        title: "SSH Reconnected",
        description: "Successfully reconnected to Kali machine",
      });
    },
    onError: (error: any) => {
      toast({
        title: "SSH Reconnection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const sendMessage = useCallback((content: string) => {
    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
      timestamp: new Date(),
    };
    setMessages((prev: Message[]) => [...prev, userMessage]);

    // Send to AI
    sendMessageMutation.mutate({ message: content, mode: "chat" });
  }, [sendMessageMutation]);

  const executeSSHCommand = useCallback(async (intent: string) => {
    // Add user intent message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      content: intent,
      role: "user",
      timestamp: new Date(),
    };
    setMessages((prev: Message[]) => [...prev, userMessage]);

    // Step 1: Get AI-generated command only (not execute yet)
    try {
      const response = await api.sendMessage({ message: intent, mode: "ssh_intent" });
      const generatedCommand = response.metadata?.generated_commands || "";
      setPendingCommand(generatedCommand);
      setPendingIntent(intent);
    } catch (error: any) {
      toast({
        title: "AI Command Generation Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [toast]);

  // Step 2: Approve command and execute via SSH
  const approveCommand = useCallback(async () => {
    if (!pendingCommand || !pendingIntent) return;
    setIsExecuting(true);
    setAIFeedback([]);
    setCommandAnalysis(null);
    // Start SSE for feedback
    const eventSource = new EventSource("/api/ssh/feedback");
    eventSource.onmessage = (event) => {
      setAIFeedback(prev => [...prev, event.data]);
    };
    eventSource.addEventListener("end", () => {
      eventSource.close();
      setIsExecuting(false);
      setPendingCommand(null);
      setPendingIntent(null);
      // Simulate command analysis (replace with real API call)
      setCommandAnalysis({
        breakdown: `Breakdown of command: ${pendingCommand}`,
        risks: "Potential risks: None detected.",
        alternatives: "Alternative: nmap -A <target>"
      });
    });
    // Actually execute the command via SSH
    sendMessageMutation.mutate({ message: pendingCommand, mode: "ssh" });
  }, [pendingCommand, pendingIntent, sendMessageMutation]);

  // Cancel SSH command execution
  const cancelExecution = useCallback(async () => {
    setIsExecuting(false);
    await fetch("/api/ssh/cancel", { method: "POST" });
  }, []);

  // Step 3: Reject command
  const rejectCommand = useCallback(() => {
    setPendingCommand(null);
    setPendingIntent(null);
  }, []);

  const reconnectSSH = useCallback(() => {
    reconnectSSHMutation.mutate();
  }, [reconnectSSHMutation]);

  return {
    messages,
    models: models as AIModel[],
    sshStatus: sshStatus as SSHStatus,
    isLoading: sendMessageMutation.isPending || isExecuting,
    sendMessage,
    executeSSHCommand,
    reconnectSSH,
    pendingCommand,
    approveCommand,
    rejectCommand,
    isExecuting,
    cancelExecution,
    aiFeedback,
    commandAnalysis,
  };
}
