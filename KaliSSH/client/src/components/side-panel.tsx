import { AIModel, SSHStatus } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Cpu, Network, TrendingUp } from "lucide-react";

interface SidePanelProps {
  models: AIModel[];
  sshStatus: SSHStatus;
  onReconnectSSH: () => void;
}

export default function SidePanel({ models, sshStatus, onReconnectSSH }: SidePanelProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-primary pulse-green';
      case 'inactive': return 'bg-muted-foreground';
      case 'error': return 'bg-destructive';
      default: return 'bg-muted-foreground';
    }
  };

  const getModelColor = (role: string) => {
    switch (role) {
      case 'general': return 'text-primary';
      case 'reasoning': return 'text-accent';
      case 'analysis': return 'text-blue-400';
      case 'validation': return 'text-purple-400';
      case 'creativity': return 'text-pink-400';
      case 'logic': return 'text-green-400';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <aside className="w-80 bg-card border-l border-border flex flex-col">
      {/* Model Status Panel */}
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center space-x-2">
          <Cpu className="text-primary w-4 h-4" />
          <span>Active Models</span>
        </h3>
        
        <div className="space-y-3">
          {models.map((model) => (
            <div 
              key={model.id}
              className="flex items-center justify-between p-3 bg-background rounded-lg border border-border"
              data-testid={`model-${model.id}`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(model.status)}`} />
                <div>
                  <div className="text-sm font-mono text-foreground">{model.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {model.role} • {model.avgResponseTime.toFixed(1)}s avg
                  </div>
                </div>
              </div>
              <div className={`text-xs font-mono ${getModelColor(model.role)}`}>
                {model.successRate}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SSH Connection Panel */}
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center space-x-2">
          <Network className="text-destructive w-4 h-4" />
          <span>SSH Connection</span>
        </h3>
        
        <div className="bg-background rounded-lg border border-border p-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-foreground">Status</span>
            <span className={`text-sm font-mono ${
              sshStatus.connected ? 'text-primary' : 'text-destructive'
            }`} data-testid="ssh-panel-status">
              {sshStatus.connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Host:</span>
              <span className="font-mono text-foreground" data-testid="ssh-panel-host">
                {sshStatus.host}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">User:</span>
              <span className="font-mono text-foreground" data-testid="ssh-panel-user">
                {sshStatus.user}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tunnel:</span>
              <span className="font-mono text-foreground">serveo.net</span>
            </div>
            {sshStatus.latency && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Latency:</span>
                <span className="font-mono text-primary" data-testid="ssh-latency">
                  {sshStatus.latency}ms
                </span>
              </div>
            )}
          </div>
          
          <Button 
            onClick={onReconnectSSH}
            variant="outline"
            className="w-full mt-3 bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20"
            data-testid="reconnect-ssh-button"
          >
            Reconnect SSH
          </Button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="p-4 flex-1">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center space-x-2">
          <TrendingUp className="text-accent w-4 h-4" />
          <span>Performance</span>
        </h3>
        
        <div className="space-y-4">
          <div className="bg-background rounded-lg border border-border p-3">
            <div className="text-xs text-muted-foreground mb-2">Query Classification</div>
            <div className="space-y-2">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-foreground">Security</span>
                  <span className="text-destructive">45%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-1">
                  <div className="bg-destructive h-1 rounded-full" style={{ width: '45%' }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-foreground">Technical</span>
                  <span className="text-primary">30%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-1">
                  <div className="bg-primary h-1 rounded-full" style={{ width: '30%' }} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-background rounded-lg border border-border p-3">
            <div className="text-xs text-muted-foreground mb-2">System Stats</div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-foreground">Requests/min:</span>
                <span className="text-accent font-mono">12.4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground">Cache hits:</span>
                <span className="text-primary font-mono">87%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground">Avg response:</span>
                <span className="text-blue-400 font-mono">1.8s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
