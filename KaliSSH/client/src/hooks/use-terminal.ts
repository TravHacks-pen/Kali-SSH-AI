import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Message, AIModel, SSHStatus, ChatRequest } from "@shared/schema";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function useTerminal() {
  const [messages, setMessages] = useState<Message[]>([]);
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
    onSuccess: (response) => {
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
      setMessages(prev => [...prev, newMessage]);
    },
    onError: (error) => {
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
    onError: (error) => {
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
    setMessages(prev => [...prev, userMessage]);

    // Send to AI
    sendMessageMutation.mutate({ message: content, mode: "chat" });
  }, [sendMessageMutation]);

  const executeSSHCommand = useCallback((command: string) => {
    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      content: command,
      role: "user",
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Execute SSH command
    sendMessageMutation.mutate({ message: command, mode: "ssh" });
  }, [sendMessageMutation]);

  const reconnectSSH = useCallback(() => {
    reconnectSSHMutation.mutate();
  }, [reconnectSSHMutation]);

  return {
    messages,
    models: models as AIModel[],
    sshStatus: sshStatus as SSHStatus,
    isLoading: sendMessageMutation.isPending,
    sendMessage,
    executeSSHCommand,
    reconnectSSH,
  };
}
