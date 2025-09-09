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
import { AlertTriangle, FileText, Clock } from "lucide-react";

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
  fileAnswer,
  timeLow,
}: ConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md gap-0">
        <DialogHeader className="space-y-4 pb-4">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-lg font-semibold">
              Confirm Submission
            </DialogTitle>
            {timeLow && (
              <Badge variant="destructive" className="animate-pulse gap-1 py-1">
                <Clock className="h-3 w-3" />
                Time Critical
              </Badge>
            )}
          </div>
          <DialogDescription>
            You are about to submit your task. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 border-y">
          {timeLow && (
            <div className="flex items-start gap-3 bg-destructive/15 text-destructive p-3 rounded-md text-sm">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Time is running out!</strong> Your task will be
                submitted automatically when time expires.
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="font-medium text-sm">Task</div>
            <div className="text-muted-foreground text-sm">
              {taskData.task.title}
            </div>
          </div>

          {fileAnswer && (
            <div className="space-y-3">
              <div className="font-medium text-sm">Attached File</div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <FileText className="h-4 w-4" />
                <span>{fileAnswer.name}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            type="button"
            className="flex-1">
            Cancel
          </Button>
          <Button onClick={onConfirm} type="button" className="flex-1">
            Confirm Submission
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
