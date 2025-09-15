import { Message } from "@shared/schema";
import MessageComponent from "@/components/message";

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
}

export default function ChatArea({ messages, isLoading }: ChatAreaProps) {
  return (
    <div className="flex-1 overflow-y-auto terminal-scrollbar p-6 space-y-4">
      {/* Welcome Message */}
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
          <i className="fas fa-robot text-background text-sm"></i>
        </div>
        <div className="flex-1">
          <div className="bg-card rounded-lg p-4 border border-border">
            <p className="text-foreground text-sm leading-relaxed">
              Multi-model AI system initialized. SSH connection to Kali machine established. 
              Available models: <span className="text-primary font-mono">Llama-3-8B</span>, 
              <span className="text-accent font-mono">DeepSeek</span>, 
              <span className="text-blue-400 font-mono">Mistral-7B</span>, and more.
            </p>
            <div className="mt-3 text-xs text-muted-foreground">
              <i className="fas fa-clock mr-1"></i>
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {messages.map((message) => (
        <MessageComponent key={message.id} message={message} />
      ))}

      {/* Typing Indicator */}
      {isLoading && (
        <div className="flex items-start space-x-3" data-testid="typing-indicator">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
            <i className="fas fa-robot text-background text-sm"></i>
          </div>
          <div className="flex-1">
            <div className="bg-card rounded-lg p-4 border border-border">
              <p className="text-muted-foreground text-sm typing-animation">AI models collaborating</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
