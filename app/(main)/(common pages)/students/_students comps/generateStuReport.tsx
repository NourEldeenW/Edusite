"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Download, FileText, Sparkles, User } from "lucide-react";
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
import { showToast, StudentData } from "./main";

interface GenerateStudentReportDialogProps {
  access: string;
  student: StudentData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type DatePreset =
  | "last7"
  | "last30"
  | "thisMonth"
  | "lastMonth"
  | "thisWeek"
  | "custom";

interface FormData {
  student_id: string;
  start_date: string;
  end_date: string;
}

interface FormErrors {
  start_date?: string;
  end_date?: string;
}

// Helper function to validate PDF response
const validatePdfResponse = (
  data: Blob,
  headers: Record<string, string>
): boolean => {
  if (!data || data.size === 0) {
    return false;
  }

  const contentType = headers["content-type"] || headers["Content-Type"];
  if (contentType && contentType !== "application/pdf") {
    return false;
  }

  return true;
};

export default function GenerateStudentReportDialog({
  access,
  student,
  open,
  onOpenChange,
}: GenerateStudentReportDialogProps) {
  const [loading, setLoading] = useState(false);
  const [datePreset, setDatePreset] = useState<DatePreset>("last7");
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [formData, setFormData] = useState<FormData>({
    student_id: student.id.toString(),
    start_date: format(subDays(new Date(), 7), "yyyy-MM-dd"),
    end_date: format(new Date(), "yyyy-MM-dd"),
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Update form data when dates change
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      student_id: student.id.toString(),
      start_date: format(startDate, "yyyy-MM-dd"),
      end_date: format(endDate, "yyyy-MM-dd"),
    }));
  }, [startDate, endDate, student.id]);

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
        student_id: student.id.toString(),
        start_date: format(subDays(new Date(), 7), "yyyy-MM-dd"),
        end_date: format(new Date(), "yyyy-MM-dd"),
      });
      setErrors({});
    }
  }, [open, student.id]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

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
      // Build query parameters for student report
      const params = new URLSearchParams({
        student_id: formData.student_id,
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
      const responseHeaders: Record<string, string> = {};
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

      // Generate filename with student name and date range
      const filename = `Student_Report_${student.full_name}_${formData.start_date}_to_${formData.end_date}.pdf`;

      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      showToast("Student report generated successfully!", "success");
      onOpenChange(false);
    } catch (error: unknown) {
      console.error("Student report generation error:", error);

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md md:max-w-xl bg-bg-base border-border-card overflow-y-auto max-h-[90dvh]">
        <DialogHeader>
          <DialogTitle className="text-xl text-text-primary flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            Generate Student Report
          </DialogTitle>
          <DialogDescription className="text-text-secondary">
            Create a comprehensive PDF report for {student.full_name}
          </DialogDescription>
        </DialogHeader>

        {/* Student Information Card */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                {student.full_name}
              </h3>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p>ID: {student.student_id}</p>
                <p>
                  Grade: {student.grade.name} • Center: {student.center.name}
                </p>
              </div>
            </div>
          </div>
        </div>

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

          {/* Report Preview Info */}
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <FileText className="w-4 h-4" />
              <span className="font-medium">Report Preview</span>
            </div>
            <div className="text-sm text-emerald-700 dark:text-emerald-400 mt-2">
              This report will include session attendance, homework completion,
              test scores, and quiz results specifically for{" "}
              <strong>{student.full_name}</strong>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 hover:text-text-inverse"
              disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
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
