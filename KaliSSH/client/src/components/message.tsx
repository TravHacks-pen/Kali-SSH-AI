import { Message } from "@shared/schema";
import { User, Brain, Terminal } from "lucide-react";
import { marked } from "marked";
import DOMPurify from "dompurify";

interface MessageProps {
  message: Message;
}

export default function MessageComponent({ message }: MessageProps) {
  const isUser = message.role === "user";
  const hasSSHOutput = message.metadata?.ssh_executed && message.metadata?.command_output;

  return (
    <div className={`flex items-start space-x-3 ${isUser ? 'justify-end' : ''}`} data-testid={`message-${message.id}`}>
      {!isUser && (
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
          {hasSSHOutput ? (
            <Terminal className="text-background w-4 h-4" />
          ) : (
            <Brain className="text-background w-4 h-4" />
          )}
        </div>
      )}
      
      <div className={`flex-1 ${isUser ? 'max-w-2xl' : ''}`}>
        {message.metadata?.models_used && message.metadata.models_used.length > 1 && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
            <i className="fas fa-cogs"></i>
            <span>Multi-model collaboration active</span>
            <div className="flex space-x-1">
              {message.metadata.models_used.map((model) => (
                <span key={model} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                  {model}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className={`rounded-lg p-4 border ${
          isUser 
            ? 'bg-primary/10 border-primary/20' 
            : 'bg-card border-border'
        }`}>
          {hasSSHOutput && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-3 font-mono">
              <div className="flex items-center space-x-2 mb-2">
                <Terminal className="text-destructive w-4 h-4" />
                <span className="text-sm text-destructive">SSH Command Output</span>
              </div>
              <pre className="text-xs text-foreground whitespace-pre-wrap overflow-x-auto">
                {message.metadata?.command_output}
              </pre>
            </div>
          )}
          
          <div 
            className="text-foreground text-sm leading-relaxed prose prose-sm max-w-none prose-invert"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(marked(message.content))
            }}
          />
          
          <div className={`mt-3 text-xs text-muted-foreground ${isUser ? 'text-right' : ''}`}>
            <i className="fas fa-clock mr-1"></i>
            <span data-testid="message-timestamp">
              {message.timestamp.toLocaleTimeString()}
            </span>
            {message.metadata?.response_time && (
              <>
                <span className="mx-2">•</span>
                <span>Response time: {message.metadata.response_time.toFixed(1)}s</span>
              </>
            )}
            {isUser && <User className="inline ml-1 w-3 h-3" />}
          </div>
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
          <User className="text-background w-4 h-4" />
        </div>
      )}
    </div>
  );
}
