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

// Define error types
type FormErrors = {
  title?: string;
  date?: string;
  grade_id?: string;
  center_id?: string;
  non_field_errors?: string[];
};
const initialFormData = {
  title: "",
  notes: "",
  grade_id: "",
  center_id: "",
  has_homework: false,
  has_test: false,
};

export default function AddSessionForm({ access }: { access: string }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [errors, setErrors] = useState<FormErrors>({});

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

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!dialogOpen) {
      setFormData(initialFormData);
      setDate(new Date());
      setErrors({});
    }
  }, [dialogOpen]);

  useEffect(() => {
    const fetchInitials = async () => {
      try {
        setLoading(true);
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
      } catch (error) {
        showToast("Error fetching available grades and centers", "error");
        console.error("Fetching error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitials();
  }, [access, setCenters, setGrades]);

  // Client-side validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!date) {
      newErrors.date = "Please select a date";
    }

    if (!formData.grade_id) {
      newErrors.grade_id = "Please select a grade";
    }

    if (!formData.center_id) {
      newErrors.center_id = "Please select a center";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when selection is made
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setDate(date);

    // Clear date error when date is selected
    if (errors.date) {
      setErrors((prev) => ({ ...prev, date: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate before submission
    if (!validateForm()) {
      return;
    }

    const formattedDate = format(date!, "yyyy-MM-dd");

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
      setDialogOpen(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Session creation error:", error);

      // Handle backend validation errors
      if (error.response?.status === 400) {
        const backendErrors = error.response.data;
        const formattedErrors: FormErrors = {};

        // Map backend errors to our form fields
        Object.keys(backendErrors).forEach((key) => {
          if (key in initialFormData || key === "date") {
            formattedErrors[key as keyof FormErrors] = Array.isArray(
              backendErrors[key]
            )
              ? backendErrors[key].join(" ")
              : backendErrors[key];
          } else {
            // Handle non-field errors
            formattedErrors.non_field_errors =
              formattedErrors.non_field_errors || [];
            formattedErrors.non_field_errors.push(backendErrors[key]);
          }
        });

        setErrors(formattedErrors);
        showToast("Please fix the form errors", "error");
      } else {
        showToast("Failed to create session", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to determine input error styling
  const getInputClass = (fieldName: keyof FormErrors) =>
    errors[fieldName]
      ? "border-error focus:ring-error focus:border-error"
      : "border-border-default focus:ring-primary";

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 text-sm hover:text-text-inverse h-9 flex-grow sm:flex-grow-0 bg-primary hover:bg-primary-hover text-text-inverse">
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

        {/* Display non-field errors */}
        {errors.non_field_errors && (
          <div className="bg-error-bg border border-error rounded-md p-3 mb-4">
            <h3 className="font-medium text-error">Form Errors:</h3>
            <ul className="list-disc pl-5 mt-1">
              {errors.non_field_errors.map((error, index) => (
                <li key={index} className="text-error">
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="font-medium">
                Session Title <span className="text-error">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter session title"
                className={`focus:ring-2 ${getInputClass("title")}`}
              />
              {errors.title && (
                <p className="text-error text-sm">{errors.title}</p>
              )}
            </div>

            {/* Date Picker */}
            <div className="space-y-2">
              <Label className="font-medium">
                Session Date <span className="text-error">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal h-10 text-text-primary hover:bg-bg-secondary ${
                      errors.date ? "border-error" : "border-border-default"
                    }`}>
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateChange}
                    className="bg-white rounded-md border"
                  />
                </PopoverContent>
              </Popover>
              {errors.date && (
                <p className="text-error text-sm">{errors.date}</p>
              )}
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
                <Label className="font-medium">
                  Grade <span className="text-error">*</span>
                </Label>
                <Select
                  value={formData.grade_id}
                  onValueChange={(value) =>
                    handleSelectChange("grade_id", value)
                  }
                  required>
                  <SelectTrigger
                    className={`h-10 bg-bg-secondary text-text-primary w-full ${
                      errors.grade_id ? "border-error" : "border-border-default"
                    }`}>
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
                {errors.grade_id && (
                  <p className="text-error text-sm">{errors.grade_id}</p>
                )}
              </div>

              {/* Center Selector */}
              <div className="space-y-2">
                <Label className="font-medium">
                  Center <span className="text-error">*</span>
                </Label>
                <Select
                  value={formData.center_id}
                  onValueChange={(value) =>
                    handleSelectChange("center_id", value)
                  }
                  required>
                  <SelectTrigger
                    className={`h-10 bg-bg-secondary text-text-primary w-full ${
                      errors.center_id
                        ? "border-error"
                        : "border-border-default"
                    }`}>
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
                {errors.center_id && (
                  <p className="text-error text-sm">{errors.center_id}</p>
                )}
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
              onClick={() => setDialogOpen(false)}
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
