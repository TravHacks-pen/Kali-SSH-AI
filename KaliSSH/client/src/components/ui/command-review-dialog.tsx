
import * as React from "react";
import { Dialog, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CommandReviewDialogProps {
  open: boolean;
  command: string;
  onApprove: () => void;
  onReject: () => void;
}

export function CommandReviewDialog({ open, command, onApprove, onReject }: CommandReviewDialogProps) {
  return (
    <Dialog open={open}>
      <DialogTitle>Review AI-Generated Command</DialogTitle>
      <DialogContent>
        <pre className="bg-muted p-3 rounded text-sm font-mono whitespace-pre-wrap">{command}</pre>
        <p className="mt-2 text-muted-foreground text-xs">Please review the command above. Approve to execute via SSH, or reject to cancel.</p>
      </DialogContent>
      <DialogFooter>
  <Button color="error" onClick={onReject}>Reject</Button>
  <Button color="primary" onClick={onApprove}>Approve & Execute</Button>
      </DialogFooter>
    </Dialog>
  );
}
