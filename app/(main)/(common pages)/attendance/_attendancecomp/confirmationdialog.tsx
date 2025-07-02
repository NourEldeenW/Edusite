import { useContext, useState } from "react";
import { Student } from "@/app/(main)/admin/students/_studentscomp/mainpage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useId } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { homework } from "./context";
import { showToast } from "../../students/_students comps/main";

interface ConfDialogProps {
  isConfirmationDialogOpen: boolean;
  setIsConfirmationDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedStudent: Student[];
  onconf: (
    student: Student,
    method: "qr" | "manual",
    hw_status?: "done" | "not_done"
  ) => void;
}

export default function ConfDialog({
  isConfirmationDialogOpen,
  setIsConfirmationDialogOpen,
  selectedStudent,
  onconf,
}: ConfDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [homeworkStatus, setHomeworkStatus] = useState<
    "done" | "not_done" | null
  >(null);

  const fullnameID = useId();
  const phoneID = useId();
  const centerID = useId();
  const parentPhoneID = useId();
  const formID = useId();

  const student = selectedStudent[0];

  const hashomework = useContext(homework);

  const handleConfirm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      onconf(student, "manual", homeworkStatus ? homeworkStatus : undefined);
      showToast("Attendance recorded", "success");
      setIsConfirmationDialogOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (selectedStudent.length === 0) return null;

  return (
    <Dialog
      open={isConfirmationDialogOpen}
      onOpenChange={setIsConfirmationDialogOpen}>
      <DialogContent className="sm:max-w-md rounded-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-500 hidden sm:block" />
            <div>
              <DialogTitle>Confirm Student Attendance</DialogTitle>
              <DialogDescription className="mt-1">
                Verify student information before confirmation
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleConfirm} id={formID}>
          <div className="grid gap-4 py-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor={fullnameID} className="text-foreground/80">
                  Full Name
                </Label>
                <Input
                  id={fullnameID}
                  value={student.full_name}
                  className="mt-1 font-medium"
                  disabled
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={phoneID} className="text-foreground/80">
                    Phone Number
                  </Label>
                  <Input
                    id={phoneID}
                    value={student.phone_number}
                    className="mt-1"
                    disabled
                  />
                </div>

                <div>
                  <Label htmlFor={parentPhoneID} className="text-foreground/80">
                    Parent&apos;s Phone
                  </Label>
                  <Input
                    id={parentPhoneID}
                    value={student.parent_number}
                    className="mt-1"
                    disabled
                  />
                </div>
              </div>

              <div>
                <Label htmlFor={centerID} className="text-foreground/80">
                  Study Center
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id={centerID}
                    value={student.center.name}
                    className="font-medium"
                    disabled
                  />
                </div>
              </div>
              {hashomework && (
                <div>
                  <Label className="text-foreground/80">Homework Status</Label>
                  <select
                    value={homeworkStatus || ""}
                    required
                    onChange={(e) =>
                      setHomeworkStatus(
                        e.target.value as "done" | "not_done" | null
                      )
                    }
                    className="mt-1 flex h-9 w-full items-center justify-between rounded-md border border-foreground/30 bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                    <option value="" disabled>
                      Select status
                    </option>
                    <option value="done">Homework Done</option>
                    <option value="not_done">Homework Not Done</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </form>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsConfirmationDialogOpen(false)}
            disabled={isLoading}
            className="flex-1 border-foreground/30 hover:bg-foreground/5">
            <XCircle className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            form={formID}
            disabled={isLoading}
            className="flex-1 bg-green-600 hover:bg-green-700">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Confirm Attendance
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
