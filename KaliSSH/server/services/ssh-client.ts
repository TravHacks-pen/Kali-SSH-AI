import { spawn, ChildProcess } from "child_process";

export class SSHClient {
  private connected: boolean = false;
  private sshProcess: ChildProcess | null = null;
  private readonly SSH_COMMAND = "sshpass";
  private readonly SSH_ARGS = [
    "-p", "root",
    "ssh",
    "-o", "StrictHostKeyChecking=no",
    "-o", "UserKnownHostsFile=/dev/null",
    "-o", "GlobalKnownHostsFile=/dev/null",
    "-o", "CheckHostIP=no",
    "-o", "HashKnownHosts=no",
    "-o", "UpdateHostKeys=no",
    "-o", "VerifyHostKeyDNS=no",
    "-o", "ConnectTimeout=20",
    "-o", "ServerAliveInterval=10",
    "-o", "ServerAliveCountMax=2",
    "-o", "LogLevel=ERROR",
    "-o", "PasswordAuthentication=yes",
    "-o", "PubkeyAuthentication=no",
    "-o", "PreferredAuthentications=password",
    "-o", "BatchMode=no",
    "-o", "NumberOfPasswordPrompts=3",
    "-o", "ProxyCommand=ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -W %h:%p serveo.net",
    "travis@t-shell"
  ];

  constructor() {
    this.connect().catch(console.error);
  }

  async connect(): Promise<void> {
    try {
      // Test connection first
      const testProcess = spawn(this.SSH_COMMAND, [...this.SSH_ARGS, "echo", "connection_test"], {
        stdio: ["pipe", "pipe", "pipe"]
      });

      return new Promise((resolve, reject) => {
        let output = "";
        let errorOutput = "";

        testProcess.stdout?.on("data", (data) => {
          output += data.toString();
        });

        testProcess.stderr?.on("data", (data) => {
          const stderr = data.toString();
          errorOutput += stderr;
        });

        testProcess.on("close", (code) => {
          if (code === 0 && output.includes("connection_test")) {
            this.connected = true;
            console.log("SSH connection established to Kali machine");
            resolve();
          } else {
            this.connected = false;
            console.error("SSH connection failed:", errorOutput);
            reject(new Error(`SSH connection failed: ${errorOutput}`));
          }
        });

        testProcess.on("error", (error) => {
          this.connected = false;
          console.error("SSH spawn error:", error);
          reject(error);
        });

        // Timeout after 20 seconds
        setTimeout(() => {
          testProcess.kill();
          this.connected = false;
          reject(new Error("SSH connection timeout"));
        }, 20000);
      });
    } catch (error) {
      this.connected = false;
      throw error;
    }
  }

  async executeCommand(command: string): Promise<string> {
    if (!this.connected) {
      await this.connect();
    }

    return new Promise((resolve, reject) => {
      const sshProcess = spawn(this.SSH_COMMAND, [...this.SSH_ARGS, command], {
        stdio: ["pipe", "pipe", "pipe"]
      });

      let output = "";
      let errorOutput = "";

      sshProcess.stdout?.on("data", (data) => {
        output += data.toString();
      });

      sshProcess.stderr?.on("data", (data) => {
        const stderr = data.toString();
        errorOutput += stderr;
      });

      sshProcess.on("close", (code) => {
        const fullOutput = output + (errorOutput ? `\nSTDERR:\n${errorOutput}` : "");
        
        if (code === 0 || output.length > 0) {
          resolve(fullOutput || "Command executed successfully (no output)");
        } else {
          reject(new Error(`Command failed with exit code ${code}: ${errorOutput}`));
        }
      });

      sshProcess.on("error", (error) => {
        console.error("SSH command execution error:", error);
        reject(error);
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        sshProcess.kill();
        reject(new Error("Command execution timeout"));
      }, 30000);
    });
  }

  isConnected(): boolean {
    return this.connected;
  }

  disconnect(): void {
    this.connected = false;
    if (this.sshProcess) {
      this.sshProcess.kill();
      this.sshProcess = null;
    }
  }
}
