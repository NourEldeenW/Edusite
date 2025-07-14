"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO } from "date-fns";
import { api } from "@/lib/axiosinterceptor";
import useSessionsStore, {
  SessionType,
} from "@/lib/stores/SessionsStores/allSessionsStore";
import { showToast } from "../../students/_students comps/main";

interface EditSessionDialogProps {
  session: SessionType;
  access: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function EditSessionDialog({
  session,
  access,
  open,
  setOpen,
}: EditSessionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    session.date ? parseISO(session.date) : new Date()
  );
  const [formData, setFormData] = useState({
    title: session.title || "",
    notes: session.notes || "",
    has_homework: session.has_homework || false,
    has_test: session.has_test || false,
  });

  const updateSessions = useSessionsStore((state) => state.updateSessions);
  const allSessions = useSessionsStore((state) => state.allSessions);

  useEffect(() => {
    // Reset form when dialog opens or session changes
    if (open) {
      setFormData({
        title: session.title || "",
        notes: session.notes || "",
        has_homework: session.has_homework || false,
        has_test: session.has_test || false,
      });
      setDate(session.date ? parseISO(session.date) : new Date());
    }
  }, [open, session]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      showToast("Please select a valid date", "error");
      return;
    }

    setLoading(true);

    try {
      const formattedDate = format(date, "yyyy-MM-dd");
      const payload = {
        ...formData,
        date: formattedDate,
      };

      const res = await api.put(
        `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}session/sessions/${session.id}/`,
        payload,
        { headers: { Authorization: `Bearer ${access}` } }
      );

      // Update the local state
      const updatedSession: SessionType = {
        ...session,
        ...res.data,
        grade: session.grade,
        center: session.center,
      };

      updateSessions(
        allSessions.map((s) => (s.id === session.id ? updatedSession : s))
      );

      showToast("Session updated successfully", "success");
      setOpen(false);
    } catch (error) {
      console.error("Session update error:", error);
      showToast("Failed to update session", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md md:max-w-lg bg-bg-base border-border-card">
        <DialogHeader>
          <DialogTitle className="text-xl text-text-primary">
            Edit Session
          </DialogTitle>
          <DialogDescription className="text-text-secondary">
            You can only edit the session title, date, notes, homework, and
            test. <br />
            Grade and Center cannot be changed.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="font-medium">
                Session Title
              </Label>
              <Input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter session title"
                className="focus:ring-primary bg-bg-secondary border-border-default text-text-primary"
              />
            </div>

            {/* Date Picker */}
            <div className="space-y-2">
              <Label className="font-medium">Session Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal h-10 bg-bg-secondary border-border-default text-text-primary hover:bg-bg-secondary"
                    type="button">
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="bg-white rounded-md border"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="font-medium">
                Description
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add session notes"
                rows={3}
                className="focus:ring-primary bg-bg-secondary border-border-default text-text-primary"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Grade (read-only) */}
              <div className="space-y-2 w-full">
                <Label className="font-medium">Grade</Label>
                <Input
                  value={session.grade?.name || ""}
                  disabled
                  className="h-10 bg-bg-secondary border-border-default text-text-primary w-full"
                />
              </div>

              {/* Center (read-only) */}
              <div className="space-y-2">
                <Label className="font-medium">Center</Label>
                <Input
                  value={session.center?.name || ""}
                  disabled
                  className="h-10 bg-bg-secondary border-border-default text-text-primary w-full"
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-wrap gap-6 pt-2">
              <div className="flex items-center space-x-2 hover:cursor-pointer">
                <Checkbox
                  id="has_homework"
                  checked={formData.has_homework}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("has_homework", checked as boolean)
                  }
                  className="border-gray-300 data-[state=checked]:bg-primary"
                />
                <Label
                  htmlFor="has_homework"
                  className="font-normal hover:cursor-pointer">
                  Has Homework
                </Label>
              </div>

              <div className="flex items-center space-x-2 hover:cursor-pointer">
                <Checkbox
                  id="has_test"
                  checked={formData.has_test}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("has_test", checked as boolean)
                  }
                  className="border-gray-300 data-[state=checked]:bg-primary"
                />
                <Label
                  htmlFor="has_test"
                  className="font-normal hover:cursor-pointer">
                  Has Test
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="min-w-[100px] bg-bg-secondary text-text-primary border-border-default"
              disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="min-w-[100px] bg-primary hover:bg-primary-hover hover:text-text-inverse text-text-inverse border-border-default">
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
