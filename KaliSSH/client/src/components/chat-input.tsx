import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Terminal } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onExecuteSSH: (command: string) => void;
  isLoading: boolean;
}

export default function ChatInput({ onSendMessage, onExecuteSSH, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!message.trim() || isLoading) return;
    onSendMessage(message);
    setMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleSSH = () => {
    if (!message.trim() || isLoading) return;
    onExecuteSSH(message);
    setMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  const quickActions = [
    "Network Scan",
    "Vulnerability Assessment", 
    "Log Analysis",
    "Code Review"
  ];

  const handleQuickAction = (action: string) => {
    const actionCommands = {
      "Network Scan": "nmap -sS -O 192.168.1.0/24",
      "Vulnerability Assessment": "nikto -h target.com",
      "Log Analysis": "tail -f /var/log/syslog | grep ERROR",
      "Code Review": "Find security vulnerabilities in the uploaded code"
    };
    
    const command = actionCommands[action as keyof typeof actionCommands] || `Perform ${action.toLowerCase()} on the Kali machine`;
    setMessage(command);
  };

  return (
    <div className="border-t border-border bg-card p-4">
      <div className="flex space-x-3">
        <div className="flex-1">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onInput={handleInput}
              placeholder="Enter command or query for AI analysis..."
              className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent min-h-[60px]"
              disabled={isLoading}
              data-testid="chat-input"
            />
            <div className="absolute bottom-2 right-2 flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">Ctrl+Enter to send</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <Button
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2 font-medium"
            data-testid="send-button"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </Button>
          <Button
            onClick={handleSSH}
            disabled={!message.trim() || isLoading}
            variant="destructive"
            className="px-4 py-2 rounded-lg flex items-center space-x-2 font-medium text-sm"
            data-testid="ssh-button"
          >
            <Terminal className="w-4 h-4" />
            <span>SSH</span>
          </Button>
        </div>
      </div>
      
      <div className="mt-3 flex flex-wrap gap-2">
        {quickActions.map((action) => (
          <Button
            key={action}
            variant="secondary"
            size="sm"
            onClick={() => handleQuickAction(action)}
            disabled={isLoading}
            className="px-3 py-1 text-sm hover:bg-secondary/80 transition-colors"
            data-testid={`quick-action-${action.toLowerCase().replace(' ', '-')}`}
          >
            {action}
          </Button>
        ))}
      </div>
    </div>
  );
}
