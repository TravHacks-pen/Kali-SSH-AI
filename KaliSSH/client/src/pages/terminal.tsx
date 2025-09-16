import { useTerminal } from "@/hooks/use-terminal";
import TerminalHeader from "@/components/terminal-header";
import ChatArea from "@/components/chat-area";
import ChatInput from "@/components/chat-input";
import SidePanel from "@/components/side-panel";
import { CommandReviewDialog } from "@/components/ui/command-review-dialog";

export default function Terminal() {
  const {
    messages,
    models,
    sshStatus,
    isLoading,
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
  } = useTerminal();

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <TerminalHeader sshStatus={sshStatus} models={models} />
      <div className="flex h-[calc(100vh-80px)]">
        <main className="flex-1 flex flex-col bg-background">
          <ChatArea messages={messages} isLoading={isLoading} />
          <ChatInput 
            onSendMessage={sendMessage}
            onExecuteSSH={executeSSHCommand}
            isLoading={isLoading}
          />
        </main>
        <SidePanel 
          models={models}
          sshStatus={sshStatus}
          onReconnectSSH={reconnectSSH}
        />
      </div>
      {/* Command Review Dialog */}
      <CommandReviewDialog 
        open={!!pendingCommand && !isExecuting}
        command={pendingCommand || ""}
        onApprove={approveCommand}
        onReject={rejectCommand}
      />
      {/* Progress, Feedback, and Cancel Button */}
      {isExecuting && (
        <div className="fixed bottom-8 right-8 bg-card border border-border rounded-lg shadow-lg p-4 flex flex-col space-y-2 z-50 min-w-[320px]">
          <span className="text-primary font-mono">Executing SSH command...</span>
          <button className="bg-destructive text-white px-3 py-1 rounded self-end" onClick={cancelExecution}>Cancel</button>
          <div className="mt-2">
            <div className="font-bold text-xs mb-1">AI Feedback:</div>
            <div className="space-y-1">
              {aiFeedback.map((chunk: string, idx: number) => (
                <div key={idx} className="text-muted-foreground text-xs font-mono">{chunk}</div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Command Analysis: breakdown, risks, alternatives */}
      {commandAnalysis && (
        <div className="fixed bottom-24 right-8 bg-card border border-border rounded-lg shadow-lg p-4 flex flex-col space-y-2 z-50 min-w-[320px]">
          <div className="font-bold text-xs mb-1">Command Analysis</div>
          <div className="text-xs font-mono"><strong>Breakdown:</strong> {commandAnalysis.breakdown}</div>
          <div className="text-xs font-mono"><strong>Risks:</strong> {commandAnalysis.risks}</div>
          <div className="text-xs font-mono"><strong>Alternatives:</strong> {commandAnalysis.alternatives}</div>
        </div>
      )}
    </div>
  );
}
