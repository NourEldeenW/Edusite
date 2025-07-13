"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import useAvail_Grades_CentersStore from "@/lib/stores/SessionsStores/store";
import { useEffect, useState } from "react";
import { showToast } from "../../students/_students comps/main";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/lib/axiosinterceptor";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import useSessionsStore from "@/lib/stores/SessionsStores/allSessionsStore";

export default function AddSessionForm({ access }: { access: string }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());

  const initialFormData = {
    title: "",
    notes: "",
    grade_id: "",
    center_id: "",
    has_homework: false,
    has_test: false,
  };

  const { addSession } = useSessionsStore();

  const [formData, setFormData] = useState(initialFormData);

  const availCenters = useAvail_Grades_CentersStore(
    (state) => state.availCenters
  );
  const availGrades = useAvail_Grades_CentersStore(
    (state) => state.availGrades
  );
  const setCenters = useAvail_Grades_CentersStore(
    (state) => state.updateCenters
  );
  const setGrades = useAvail_Grades_CentersStore((state) => state.updateGrades);

  useEffect(() => {
    const fetchInitials = async () => {
      try {
        const [grades, centers] = await Promise.all([
          api.get(
            `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}accounts/grades/`,
            { headers: { Authorization: `Bearer ${access}` } }
          ),
          api.get(
            `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}accounts/centers/`,
            { headers: { Authorization: `Bearer ${access}` } }
          ),
        ]);
        setCenters(centers.data);
        setGrades(grades.data);
      } catch {
        showToast("Error fetching available grades and centers", "error");
      }
    };
    fetchInitials();
  }, [access, setCenters, setGrades]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
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

    const formattedDate = format(date, "yyyy-MM-dd");

    const payload = {
      ...formData,
      date: formattedDate,
    };

    try {
      setLoading(true);
      const res = await api.post(
        `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}session/sessions/create/`,
        payload,
        { headers: { Authorization: `Bearer ${access}` } }
      );
      addSession(res.data);
      showToast("Session created successfully", "success");
      setFormData(initialFormData);
      setDate(new Date());
      setDialogOpen(false);
    } catch (error) {
      console.error("Session creation error:", error);
      showToast("Failed to create session", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 text-sm hover:text-text-inverse h-9 flex-grow sm:flex-grow-0 bg-primary hover:bg-primary-hover hover:text-text-invers text-text-inverse">
          Add Session
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md md:max-w-lg bg-bg-base border-border-card">
        <DialogHeader>
          <DialogTitle className="text-xl text-text-primary">
            Add New Session
          </DialogTitle>
          <DialogDescription className="text-text-secondary">
            Create a new session for any grade in any center
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
                    className="w-full justify-start text-left font-normal h-10 bg-bg-secondary border-border-default text-text-primary hover:bg-bg-secondary ">
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
              {/* Grade Selector */}
              <div className="space-y-2 w-full">
                <Label className="font-medium">Grade</Label>
                <Select
                  value={formData.grade_id}
                  onValueChange={(value) =>
                    handleSelectChange("grade_id", value)
                  }
                  required>
                  <SelectTrigger className="h-10 bg-bg-secondary border-border-default text-text-primary w-full">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent className="bg-bg-base border-border-default">
                    {availGrades.map((grade) => (
                      <SelectItem
                        key={grade.id}
                        value={grade.id.toString()}
                        className="hover:bg-gray-100 active:bg-bg-secondary text-text-primary">
                        {grade.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Center Selector */}
              <div className="space-y-2">
                <Label className="font-medium">Center</Label>
                <Select
                  value={formData.center_id}
                  onValueChange={(value) =>
                    handleSelectChange("center_id", value)
                  }
                  required>
                  <SelectTrigger className="h-10 bg-bg-secondary border-border-default text-text-primary w-full">
                    <SelectValue placeholder="Select center" />
                  </SelectTrigger>
                  <SelectContent className="bg-bg-base border-border-default">
                    {availCenters.map((center) => (
                      <SelectItem
                        key={center.id}
                        value={center.id.toString()}
                        className="hover:bg-gray-100 dark:hover:bg-gray-700">
                        {center.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              onClick={() => {
                setDialogOpen(false);
                setFormData(initialFormData);
              }}
              className="min-w-[100px] bg-bg-secondary text-text-primary border-border-default">
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
                  Creating...
                </span>
              ) : (
                "Create Session"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
