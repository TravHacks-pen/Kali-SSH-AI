// Simple in-memory command history for audit/logging
export interface CommandHistoryEntry {
  timestamp: Date;
  intent: string;
  generatedCommands: string;
  output: string;
  analysis: string;
}

const history: CommandHistoryEntry[] = [];

export function addCommandHistory(entry: CommandHistoryEntry) {
  history.push(entry);
}

export function getCommandHistory(): CommandHistoryEntry[] {
  return history.slice().reverse(); // newest first
}
