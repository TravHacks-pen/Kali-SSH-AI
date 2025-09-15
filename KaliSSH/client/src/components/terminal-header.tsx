import { SSHStatus, AIModel } from "@shared/schema";
import { Bot, Cpu, Wifi } from "lucide-react";

interface TerminalHeaderProps {
  sshStatus: SSHStatus;
  models: AIModel[];
}

export default function TerminalHeader({ sshStatus, models }: TerminalHeaderProps) {
  const activeModels = models.filter(m => m.status === "active");

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Bot className="text-primary w-5 h-5" />
            <h1 className="text-xl font-bold text-foreground">Multi-Model AI Terminal</h1>
          </div>
          <div className="hidden md:flex items-center space-x-1 text-sm text-muted-foreground">
            <Cpu className="w-4 h-4" />
            <span data-testid="model-count">{activeModels.length}</span>
            <span>models active</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-md ${
              sshStatus.connected ? 'bg-primary/10' : 'bg-destructive/10'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                sshStatus.connected ? 'bg-primary pulse-green' : 'bg-destructive'
              }`} />
              <span className={`text-sm font-mono ${
                sshStatus.connected ? 'text-primary' : 'text-destructive'
              }`} data-testid="ssh-status">
                {sshStatus.connected ? 'SSH Connected' : 'SSH Disconnected'}
              </span>
            </div>
            <div className="text-xs text-muted-foreground font-mono" data-testid="ssh-host">
              {sshStatus.user}@{sshStatus.host}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-accent rounded-full" />
            <span className="text-sm text-muted-foreground">API Ready</span>
          </div>
        </div>
      </div>
    </header>
  );
}
