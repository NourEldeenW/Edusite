"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Download, FileText, Sparkles } from "lucide-react";
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { cn } from "@/lib/utils";
import { api } from "@/lib/axiosinterceptor";
import type { AxiosError } from "axios";
import useAvail_Grades_CentersStore from "@/lib/stores/SessionsStores/store";
import { showToast } from "../../students/_students comps/main";

interface GenerateReportDialogProps {
  access: string;
}

type DatePreset =
  | "last7"
  | "last30"
  | "thisMonth"
  | "lastMonth"
  | "thisWeek"
  | "custom";

interface FormData {
  grade_id: string;
  center_id: string;
  start_date: string;
  end_date: string;
}

interface FormErrors {
  grade_id?: string;
  center_id?: string;
  start_date?: string;
  end_date?: string;
}

// Define proper type for headers instead of using 'any'
interface ResponseHeaders {
  "content-type"?: string;
  "Content-Type"?: string;
  [key: string]: string | undefined;
}

// Helper function to validate PDF response with proper typing
const validatePdfResponse = (data: Blob, headers: ResponseHeaders): boolean => {
  if (!data || data.size === 0) {
    return false;
  }

  const contentType = headers["content-type"] || headers["Content-Type"];
  if (contentType && contentType !== "application/pdf") {
    return false;
  }

  return true;
};

export default function GenerateReportDialog({
  access,
}: GenerateReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [datePreset, setDatePreset] = useState<DatePreset>("last7");
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [formData, setFormData] = useState<FormData>({
    grade_id: "",
    center_id: "",
    start_date: format(subDays(new Date(), 7), "yyyy-MM-dd"),
    end_date: format(new Date(), "yyyy-MM-dd"),
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const centers = useAvail_Grades_CentersStore((state) => state.availCenters);
  const grades = useAvail_Grades_CentersStore((state) => state.availGrades);

  // Update form data when dates change
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      start_date: format(startDate, "yyyy-MM-dd"),
      end_date: format(endDate, "yyyy-MM-dd"),
    }));
  }, [startDate, endDate]);

  // Apply date presets
  useEffect(() => {
    const today = new Date();

    switch (datePreset) {
      case "last7":
        setStartDate(subDays(today, 7));
        setEndDate(today);
        break;
      case "last30":
        setStartDate(subDays(today, 30));
        setEndDate(today);
        break;
      case "thisWeek":
        setStartDate(startOfWeek(today));
        setEndDate(endOfWeek(today));
        break;
      case "thisMonth":
        setStartDate(startOfMonth(today));
        setEndDate(endOfMonth(today));
        break;
      case "lastMonth":
        const lastMonth = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1
        );
        setStartDate(startOfMonth(lastMonth));
        setEndDate(endOfMonth(lastMonth));
        break;
      case "custom":
        // Keep current dates for custom selection
        break;
    }
  }, [datePreset]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setDatePreset("last7");
      setStartDate(subDays(new Date(), 7));
      setEndDate(new Date());
      setFormData({
        grade_id: "",
        center_id: "",
        start_date: format(subDays(new Date(), 7), "yyyy-MM-dd"),
        end_date: format(new Date(), "yyyy-MM-dd"),
      });
      setErrors({});
    }
  }, [open]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.grade_id) {
      newErrors.grade_id = "Please select a grade";
    }

    if (!formData.center_id) {
      newErrors.center_id = "Please select a center";
    }

    if (!formData.start_date) {
      newErrors.start_date = "Start date is required";
    }

    if (!formData.end_date) {
      newErrors.end_date = "End date is required";
    }

    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);

      if (start > end) {
        newErrors.end_date = "End date cannot be before start date";
      }

      // Limit report range to 1 year for performance
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      if (start < oneYearAgo) {
        newErrors.start_date = "Report cannot span more than 1 year";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast("Please fix the form errors", "error");
      return;
    }

    setLoading(true);

    try {
      // Build query parameters
      const params = new URLSearchParams({
        grade_id: formData.grade_id,
        center_id: formData.center_id,
        ...(formData.start_date && { start_date: formData.start_date }),
        ...(formData.end_date && { end_date: formData.end_date }),
      });

      const response = await api.get(
        `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}session/reports/comprehensive/?${params}`,
        {
          headers: { Authorization: `Bearer ${access}` },
          responseType: "blob",
        }
      );

      // Convert headers to our typed interface
      const responseHeaders: ResponseHeaders = {};
      Object.keys(response.headers).forEach((key) => {
        responseHeaders[key] = response.headers[key];
      });

      // Validate PDF response
      if (!validatePdfResponse(response.data, responseHeaders)) {
        throw new Error("Invalid PDF response from server");
      }

      // Create blob and download
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Generate filename with date range and details
      const gradeName =
        grades.find((g) => g.id.toString() === formData.grade_id)?.name ||
        "Unknown";
      const centerName =
        centers.find((c) => c.id.toString() === formData.center_id)?.name ||
        "Unknown";
      const filename = `Session_Report_${gradeName}_${centerName}_${formData.start_date}_to_${formData.end_date}.pdf`;

      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      showToast("Report generated successfully!", "success");
      setOpen(false);
    } catch (error: unknown) {
      console.error("Report generation error:", error);

      // Proper error handling with TypeScript
      if (error instanceof Error && "response" in error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 400) {
          showToast("Invalid parameters for report generation", "error");
        } else if (axiosError.response?.status === 403) {
          showToast("You don't have permission to generate reports", "error");
        } else if (axiosError.response?.status === 500) {
          showToast("Server error while generating report", "error");
        } else {
          showToast("Failed to generate report", "error");
        }
      } else if (error instanceof Error) {
        showToast(error.message, "error");
      } else {
        showToast("An unexpected error occurred", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user makes a selection
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const presetOptions: {
    value: DatePreset;
    label: string;
    description: string;
  }[] = [
    {
      value: "last7",
      label: "Last 7 Days",
      description: "From last week until today",
    },
    {
      value: "last30",
      label: "Last 30 Days",
      description: "From last month until today",
    },
    {
      value: "thisWeek",
      label: "This Week",
      description: "Monday to Sunday of current week",
    },
    {
      value: "thisMonth",
      label: "This Month",
      description: "From 1st to end of current month",
    },
    {
      value: "lastMonth",
      label: "Last Month",
      description: "Complete previous month",
    },
    {
      value: "custom",
      label: "Custom Range",
      description: "Select specific dates",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 text-sm hover:text-text-inverse h-9 flex-grow sm:flex-grow-0 bg-emerald-600 hover:bg-emerald-700 text-text-inverse border-emerald-700">
          <FileText className="w-4 h-4" />
          Generate Report
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md md:max-w-xl bg-bg-base border-border-card overflow-y-auto max-h-[90dvh]">
        <DialogHeader>
          <DialogTitle className="text-xl text-text-primary flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            Generate Session Report
          </DialogTitle>
          <DialogDescription className="text-text-secondary">
            Create a comprehensive PDF report for sessions by grade and center
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleGenerateReport} className="space-y-6">
          {/* Quick Date Presets */}
          <div className="space-y-3">
            <Label className="font-medium text-text-primary">Time Period</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {presetOptions.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setDatePreset(preset.value)}
                  className={cn(
                    "p-3 text-left rounded-lg border transition-all duration-200",
                    datePreset === preset.value
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                      : "border-border-default bg-bg-secondary hover:bg-gray-50 dark:hover:bg-gray-800 text-text-secondary"
                  )}>
                  <div className="font-medium text-sm">{preset.label}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {preset.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date" className="font-medium">
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-10 text-text-primary hover:text-text-inverse",
                      errors.start_date
                        ? "border-red-500"
                        : "border-border-default"
                    )}>
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                    {startDate ? format(startDate, "PPP") : "Select start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      if (date) {
                        setStartDate(date);
                        setDatePreset("custom");
                      }
                    }}
                    disabled={(date) =>
                      date > new Date() || date < subDays(new Date(), 365)
                    }
                    className="bg-white rounded-md border"
                  />
                </PopoverContent>
              </Popover>
              {errors.start_date && (
                <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date" className="font-medium">
                End Date <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-10 text-text-primary hover:text-text-inverse",
                      errors.end_date
                        ? "border-red-500"
                        : "border-border-default"
                    )}>
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                    {endDate ? format(endDate, "PPP") : "Select end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      if (date) {
                        setEndDate(date);
                        setDatePreset("custom");
                      }
                    }}
                    disabled={(date) => date > new Date() || date < startDate}
                    className="bg-white rounded-md border"
                  />
                </PopoverContent>
              </Popover>
              {errors.end_date && (
                <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>
              )}
            </div>
          </div>

          {/* Selected Date Range Summary */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Report Period:</strong>{" "}
              {format(startDate, "MMM dd, yyyy")} to{" "}
              {format(endDate, "MMM dd, yyyy")}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {Math.ceil(
                (endDate.getTime() - startDate.getTime()) /
                  (1000 * 60 * 60 * 24)
              )}{" "}
              days total
            </div>
          </div>

          {/* Grade and Center Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-medium">
                Grade <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.grade_id}
                onValueChange={(value) =>
                  handleSelectChange("grade_id", value)
                }>
                <SelectTrigger
                  className={cn(
                    "h-10 bg-bg-secondary text-text-primary w-full",
                    errors.grade_id ? "border-red-500" : "border-border-default"
                  )}>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent className="bg-bg-base border-border-default">
                  {grades.map((grade) => (
                    <SelectItem
                      key={grade.id}
                      value={grade.id.toString()}
                      className="hover:bg-gray-100 dark:hover:bg-gray-700">
                      {grade.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.grade_id && (
                <p className="text-red-500 text-sm mt-1">{errors.grade_id}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="font-medium">
                Center <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.center_id}
                onValueChange={(value) =>
                  handleSelectChange("center_id", value)
                }>
                <SelectTrigger
                  className={cn(
                    "h-10 bg-bg-secondary text-text-primary w-full",
                    errors.center_id
                      ? "border-red-500"
                      : "border-border-default"
                  )}>
                  <SelectValue placeholder="Select center" />
                </SelectTrigger>
                <SelectContent className="bg-bg-base border-border-default">
                  {centers.map((center) => (
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
                <p className="text-red-500 text-sm mt-1">{errors.center_id}</p>
              )}
            </div>
          </div>

          {/* Report Preview Info */}
          {formData.grade_id && formData.center_id && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                <FileText className="w-4 h-4" />
                <span className="font-medium">Report Preview</span>
              </div>
              <div className="text-sm text-emerald-700 dark:text-emerald-400 mt-2">
                This report will include session attendance, homework
                completion, and test scores for{" "}
                <strong>
                  {
                    grades.find((g) => g.id.toString() === formData.grade_id)
                      ?.name
                  }
                </strong>{" "}
                at{" "}
                <strong>
                  {
                    centers.find((c) => c.id.toString() === formData.center_id)
                      ?.name
                  }
                </strong>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 hover:text-text-inverse"
              disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.grade_id || !formData.center_id}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Download className="w-4 h-4 mr-2" />
                  Generate PDF Report
                </span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
