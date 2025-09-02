"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TaskDetails {
  title: string;
}

interface TaskData {
  task: TaskDetails;
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskData: TaskData;
  textAnswer: string;
  fileAnswer: File | null;
  timeLow: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  taskData,
  textAnswer,
  fileAnswer,
  timeLow,
}: ConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Confirm Submission
            {timeLow && (
              <Badge variant="destructive" className="animate-pulse">
                Time Critical
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            You are about to submit your task. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {timeLow && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
              <strong>Warning!</strong> Time is running out. Your task will be
              submitted automatically when time expires.
            </div>
          )}

          <div className="grid gap-2">
            <div className="font-medium">Task: {taskData.task.title}</div>

            {textAnswer && (
              <div className="text-sm text-muted-foreground">
                <div className="font-medium">Text preview:</div>
                <div className="truncate">
                  {textAnswer.substring(0, 100)}...
                </div>
              </div>
            )}

            {fileAnswer && (
              <div className="text-sm text-muted-foreground">
                <div className="font-medium">File:</div>
                <div>{fileAnswer.name}</div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button onClick={onConfirm} type="button">
            Confirm Submission
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
