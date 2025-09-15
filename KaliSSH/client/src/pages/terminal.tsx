import { useTerminal } from "@/hooks/use-terminal";
import TerminalHeader from "@/components/terminal-header";
import ChatArea from "@/components/chat-area";
import ChatInput from "@/components/chat-input";
import SidePanel from "@/components/side-panel";

export default function Terminal() {
  const {
    messages,
    models,
    sshStatus,
    isLoading,
    sendMessage,
    executeSSHCommand,
    reconnectSSH,
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
    </div>
  );
}
