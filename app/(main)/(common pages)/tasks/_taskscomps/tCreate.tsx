import { useState, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";
import { format, addDays, isBefore } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import useTaskStore from "@/lib/stores/tasksStores/initData";
import { faListCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog } from "@radix-ui/react-dialog";
import { api, djangoApi } from "@/lib/axiosinterceptor";
import { toast } from "sonner";

// Helper functions
const getDuration = (openDate: string, closeDate: string) => {
  if (!openDate || !closeDate || openDate === "0" || closeDate === "0")
    return "";
  const start = new Date(openDate);
  const end = new Date(closeDate);

  if (isBefore(end, start)) return "Invalid dates";

  const diff = end.getTime() - start.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return `${days}d ${hours}h ${minutes}m`;
};

const getRelativeTime = (dateString: string) => {
  if (!dateString || dateString === "0") return "Not set";
  const date = new Date(dateString);
  return format(date, "MMM d, yyyy h:mm a");
};

// Type definitions
interface FormError {
  field: string;
  message: string;
}

interface CenterError {
  index: number;
  field: string;
  message: string;
}

export default function TCreate({ access }: { access: string }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const availCenters = useTaskStore((state) => state.availCenters);
  const availGrades = useTaskStore((state) => state.availGrades);
  const addTask = useTaskStore((state) => state.addTask);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<FormError[]>([]);
  const [centerErrors, setCenterErrors] = useState<CenterError[]>([]);

  // Form state
  const [gradeId, setGradeId] = useState<number>(0);
  const [centers, setCenters] = useState<
    Array<{
      center_id: number;
      open_date: string;
      close_date: string;
    }>
  >([]);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [taskContentType, setTaskContentType] = useState<"text" | "pdf">(
    "text"
  );
  const [taskText, setTaskText] = useState("");
  const [taskPdf, setTaskPdf] = useState<File | null>(null);
  const [submissionType, setSubmissionType] = useState<"text" | "pdf" | "both">(
    "text"
  );
  const [submissionPolicy, setSubmissionPolicy] = useState<
    "single" | "editable"
  >("single");
  const [timerMinutes, setTimerMinutes] = useState<number>(0);
  const [maxScore, setMaxScore] = useState<string>("");

  // Reset form when dialog closes
  useEffect(() => {
    if (!dialogOpen) {
      resetForm();
    }
  }, [dialogOpen]);

  const resetForm = () => {
    setGradeId(0);
    setCenters([]);
    setTitle("");
    setDetails("");
    setTaskContentType("text");
    setTaskText("");
    setTaskPdf(null);
    setSubmissionType("text");
    setSubmissionPolicy("single");
    setTimerMinutes(0);
    setMaxScore("");
    setFormErrors([]);
    setCenterErrors([]);
  };

  const validateForm = (): boolean => {
    const errors: FormError[] = [];
    const centerErrs: CenterError[] = [];

    if (!gradeId) {
      errors.push({ field: "grade_id", message: "Grade is required" });
    }

    if (!title.trim()) {
      errors.push({ field: "title", message: "Title is required" });
    }

    if (!details.trim()) {
      errors.push({ field: "details", message: "Details are required" });
    }

    if (taskContentType === "text" && !taskText.trim()) {
      errors.push({
        field: "task_content",
        message: "Task content is required",
      });
    }

    if (taskContentType === "pdf" && !taskPdf) {
      errors.push({ field: "task_pdf", message: "PDF file is required" });
    }

    if (centers.length === 0) {
      errors.push({
        field: "centers",
        message: "At least one center is required",
      });
    }

    centers.forEach((center, index) => {
      if (!center.center_id) {
        centerErrs.push({
          index,
          field: "center_id",
          message: "Center is required",
        });
      }

      if (!center.open_date || center.open_date === "0") {
        centerErrs.push({
          index,
          field: "open_date",
          message: "Open date is required",
        });
      }

      if (!center.close_date || center.close_date === "0") {
        centerErrs.push({
          index,
          field: "close_date",
          message: "Close date is required",
        });
      }

      if (center.open_date && center.close_date) {
        const openDate = new Date(center.open_date);
        const closeDate = new Date(center.close_date);

        if (isBefore(closeDate, openDate)) {
          centerErrs.push({
            index,
            field: "close_date",
            message: "Close date must be after open date",
          });
        }
      }
    });

    setFormErrors(errors);
    setCenterErrors(centerErrs);

    return errors.length === 0 && centerErrs.length === 0;
  };

  const addCenterField = () => {
    // Get available centers that haven't been selected
    const availableCenters = availCenters.filter(
      (center) => !centers.some((c) => c.center_id === center.id)
    );

    // Auto-select the first available center if exists
    const centerId = availableCenters.length > 0 ? availableCenters[0].id : 0;

    // Set open date to current time
    const now = new Date();
    const openDate = now.toISOString();

    // Set close date to 7 days from now
    const sevenDaysLater = addDays(now, 7);
    const closeDate = sevenDaysLater.toISOString();

    setCenters([
      ...centers,
      {
        center_id: centerId,
        open_date: openDate,
        close_date: closeDate,
      },
    ]);
  };

  const removeCenter = (index: number) => {
    const newCenters = [...centers];
    newCenters.splice(index, 1);
    setCenters(newCenters);

    // Clear errors for this center
    setCenterErrors((prev) => prev.filter((error) => error.index !== index));
  };

  const updateCenter = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const newCenters = [...centers];
    newCenters[index] = {
      ...newCenters[index],
      [field]: value,
    };
    setCenters(newCenters);

    // Clear error for this field
    setCenterErrors((prev) =>
      prev.filter((error) => !(error.index === index && error.field === field))
    );
  };

  const getError = (field: string): string | null => {
    const error = formErrors.find((e) => e.field === field);
    return error ? error.message : null;
  };

  const getCenterError = (index: number, field: string): string | null => {
    const error = centerErrors.find(
      (e) => e.index === index && e.field === field
    );
    return error ? error.message : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Append basic fields
      formData.append("grade_id", gradeId.toString());
      formData.append("title", title);
      formData.append("details", details);
      formData.append("task_content_type", taskContentType);

      if (taskContentType === "text") {
        formData.append("task_text", taskText);
      } else if (taskContentType === "pdf" && taskPdf) {
        formData.append("task_pdf", taskPdf);
      }

      formData.append("submission_type", submissionType);
      formData.append("submission_policy", submissionPolicy);
      formData.append("timer_minutes", timerMinutes.toString());

      if (maxScore) {
        formData.append("max_score", maxScore);
      }

      centers.forEach((center, index) => {
        formData.append(
          `centers[${index}][center_id]`,
          center.center_id.toString()
        );
        formData.append(`centers[${index}][open_date]`, center.open_date);
        formData.append(`centers[${index}][close_date]`, center.close_date);
      });

      const res = await api.post(`${djangoApi}task/tasks/`, formData, {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      });
      addTask(res.data);

      setDialogOpen(false);
      toast.success("Task created successfully!");
      // Optionally: trigger data refresh in parent component
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Task creation failed:", error);

      let errorMessage = "Failed to create task";

      if (error.response) {
        // Handle server validation errors
        const { data } = error.response;

        if (data) {
          // Process field errors
          const newErrors: FormError[] = [];

          Object.keys(data).forEach((field) => {
            if (Array.isArray(data[field])) {
              newErrors.push({
                field,
                message: data[field][0],
              });
            } else if (typeof data[field] === "string") {
              newErrors.push({
                field: "non_field",
                message: data[field],
              });
            }
          });

          setFormErrors(newErrors);

          if (newErrors.length > 0) {
            errorMessage = "Please fix the form errors";
          }
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString || dateString === "0") return "";
    return format(new Date(dateString), "yyyy-MM-dd'T'HH:mm");
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 text-sm hover:text-text-inverse h-9 flex-grow sm:flex-grow-0 bg-primary hover:bg-primary-hover text-text-inverse">
          Create Online Task
        </Button>
      </DialogTrigger>

      {/* WIDER DIALOG WITH SCROLLING */}
      <DialogContent className="max-w-[90vw] lg:max-w-6xl max-h-[90dvh] overflow-y-auto bg-bg-base border-border-card">
        <DialogHeader>
          <DialogTitle className="text-xl text-text-primary">
            <FontAwesomeIcon icon={faListCheck} className="mr-2 text-primary" />
            Create New Online Task
          </DialogTitle>
          <DialogDescription className="text-text-secondary">
            Create a new Online Task for any grade in any center
          </DialogDescription>
        </DialogHeader>

        {formErrors.some((e) => e.field === "non_field") && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
            {formErrors
              .filter((e) => e.field === "non_field")
              .map((error, i) => (
                <p key={i} className="text-sm">
                  {error.message}
                </p>
              ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Grade Selection */}
          <div className="space-y-2">
            <Label className="font-medium text-text-primary">Grade</Label>
            <select
              value={gradeId}
              onChange={(e) => setGradeId(Number(e.target.value))}
              className={`w-full pl-4 pr-10 py-2.5 bg-bg-base border rounded-lg focus:ring-2 focus:ring-primary/20 appearance-none transition-all duration-300 ${
                getError("grade_id")
                  ? "border-red-500"
                  : "border-border-default focus:border-primary"
              }`}
              required>
              <option value={0}>Select a grade</option>
              {availGrades.map((grade) => (
                <option key={grade.id} value={grade.id}>
                  {grade.name}
                </option>
              ))}
            </select>
            {getError("grade_id") && (
              <p className="text-red-500 text-sm mt-1">
                {getError("grade_id")}
              </p>
            )}
          </div>

          {/* Centers Section */}
          <div className="mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-lg font-semibold text-text-primary">
                Centers & Availability
              </h3>
              <Button
                type="button"
                onClick={addCenterField}
                disabled={centers.length >= availCenters.length}
                className="px-5 py-2.5 text-sm sm:text-base">
                Add Center
              </Button>
            </div>

            {getError("centers") && (
              <p className="text-red-500 text-sm mb-3">{getError("centers")}</p>
            )}

            {centers.length === 0 ? (
              <div className="bg-bg-subtle rounded-lg border border-dashed border-border-default py-10 text-center">
                <p className="text-text-secondary/80 italic">
                  No centers added yet
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {centers.map((center, index) => {
                  const availableCenters = availCenters.filter(
                    (c) =>
                      !centers.some(
                        (centerItem, i) =>
                          i !== index && centerItem.center_id === c.id
                      )
                  );

                  const durationText = getDuration(
                    center.open_date,
                    center.close_date
                  );

                  return (
                    <div
                      key={index}
                      className={`grid grid-cols-1 lg:grid-cols-4 gap-5 p-5 bg-bg-base border rounded-xl shadow-xs ${
                        centerErrors.some((e) => e.index === index)
                          ? "border-red-300 bg-red-50/20"
                          : "border-border-default"
                      }`}>
                      {/* Center Selection */}
                      <div className="md:col-span-1 space-y-2.5">
                        <Label className="font-medium text-text-primary mb-4">
                          Center
                        </Label>
                        <div className="relative">
                          <select
                            value={center.center_id}
                            onChange={(e) =>
                              updateCenter(
                                index,
                                "center_id",
                                Number(e.target.value)
                              )
                            }
                            className={`w-full pl-4 pr-10 py-2.5 bg-bg-base border rounded-lg focus:ring-2 focus:ring-primary/20 appearance-none transition-all duration-300 ${
                              getCenterError(index, "center_id")
                                ? "border-red-500"
                                : "border-border-default focus:border-primary"
                            }`}
                            required>
                            <option value={0}>Select a center</option>
                            {availableCenters.map((center) => (
                              <option key={center.id} value={center.id}>
                                {center.name}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <ChevronDown className="h-5 w-5 text-text-secondary/80" />
                          </div>
                        </div>
                        {getCenterError(index, "center_id") && (
                          <p className="text-red-500 text-sm">
                            {getCenterError(index, "center_id")}
                          </p>
                        )}
                      </div>

                      {/* Open Date */}
                      <div className="md:col-span-1 space-y-2.5">
                        <Label className="font-medium text-text-primary mb-4">
                          Open Date
                        </Label>
                        <div className="relative">
                          <input
                            type="datetime-local"
                            value={formatDateForInput(center.open_date)}
                            onChange={(e) =>
                              updateCenter(
                                index,
                                "open_date",
                                e.target.value
                                  ? new Date(e.target.value).toISOString()
                                  : "0"
                              )
                            }
                            className={`w-full px-4 py-2.5 bg-bg-base border rounded-lg focus:ring-2 focus:ring-primary/20 transition-all duration-300 ${
                              getCenterError(index, "open_date")
                                ? "border-red-500"
                                : "border-border-default focus:border-primary"
                            }`}
                            required
                          />
                        </div>
                        <div className="text-xs text-text-secondary/70">
                          {getRelativeTime(center.open_date)}
                        </div>
                        {getCenterError(index, "open_date") && (
                          <p className="text-red-500 text-sm">
                            {getCenterError(index, "open_date")}
                          </p>
                        )}
                      </div>

                      {/* Close Date */}
                      <div className="md:col-span-1 space-y-2.5">
                        <Label className="font-medium text-text-primary mb-4">
                          Close Date
                        </Label>
                        <div className="relative">
                          <input
                            type="datetime-local"
                            value={formatDateForInput(center.close_date)}
                            onChange={(e) =>
                              updateCenter(
                                index,
                                "close_date",
                                e.target.value
                                  ? new Date(e.target.value).toISOString()
                                  : "0"
                              )
                            }
                            className={`w-full px-4 py-2.5 bg-bg-base border rounded-lg focus:ring-2 focus:ring-primary/20 transition-all duration-300 ${
                              getCenterError(index, "close_date")
                                ? "border-red-500"
                                : "border-border-default focus:border-primary"
                            }`}
                            min={
                              center.open_date === "0"
                                ? format(new Date(), "yyyy-MM-dd'T'HH:mm")
                                : formatDateForInput(center.open_date)
                            }
                            required
                          />
                        </div>
                        <div className="text-xs text-text-secondary/70">
                          {getRelativeTime(center.close_date)}
                        </div>
                        {getCenterError(index, "close_date") && (
                          <p className="text-red-500 text-sm">
                            {getCenterError(index, "close_date")}
                          </p>
                        )}
                        {durationText === "Invalid dates" && (
                          <p className="text-red-500 text-sm">Invalid dates</p>
                        )}
                      </div>

                      {/* Actions & Duration */}
                      <div className="md:col-span-1 flex flex-col items-start md:items-end justify-between">
                        <div className="w-full flex justify-between items-center md:justify-end">
                          <div className="md:hidden text-xs font-medium text-text-secondary/80">
                            {durationText}
                          </div>
                          <Button
                            type="button"
                            onClick={() => removeCenter(index)}
                            variant="destructive"
                            size="sm"
                            className="h-9 px-3">
                            <X className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                        {durationText && (
                          <div
                            className={`hidden md:block text-xs font-medium mt-2 text-right ${
                              durationText === "Invalid dates"
                                ? "text-red-500"
                                : "text-text-secondary/80"
                            }`}>
                            {durationText}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Title & Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="font-medium text-text-primary">
                Task Title
              </Label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
                className={getError("title") ? "border-red-500" : ""}
                required
              />
              {getError("title") && (
                <p className="text-red-500 text-sm">{getError("title")}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="font-medium text-text-primary">
                Task Details
              </Label>
              <Textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe the task details"
                rows={4}
                className={getError("details") ? "border-red-500" : ""}
                required
              />
              {getError("details") && (
                <p className="text-red-500 text-sm">{getError("details")}</p>
              )}
            </div>
          </div>

          {/* Task Content Type */}
          <div className="space-y-4">
            <Label className="font-medium text-text-primary block mb-2">
              Task Content Type
            </Label>
            <RadioGroup
              value={taskContentType}
              onValueChange={(value: "text" | "pdf") =>
                setTaskContentType(value)
              }
              className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="text" id="text-content" />
                <Label htmlFor="text-content">Text Content</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf-content" />
                <Label htmlFor="pdf-content">PDF Document</Label>
              </div>
            </RadioGroup>

            {taskContentType === "text" ? (
              <div className="space-y-2">
                <Label className="font-medium text-text-primary">
                  Task Content
                </Label>
                <Textarea
                  value={taskText}
                  onChange={(e) => setTaskText(e.target.value)}
                  placeholder="Enter task content"
                  rows={6}
                  className={getError("task_content") ? "border-red-500" : ""}
                  required={taskContentType === "text"}
                />
                {getError("task_content") && (
                  <p className="text-red-500 text-sm">
                    {getError("task_content")}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="font-medium text-text-primary">
                  Upload PDF
                </Label>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setTaskPdf(e.target.files?.[0] || null)}
                  className={getError("task_pdf") ? "border-red-500" : ""}
                  required={taskContentType === "pdf"}
                />
                <p className="text-sm text-text-secondary">
                  PDF files only (max 10MB)
                </p>
                {getError("task_pdf") && (
                  <p className="text-red-500 text-sm">{getError("task_pdf")}</p>
                )}
              </div>
            )}
          </div>

          {/* Submission Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label className="font-medium text-text-primary block mb-2">
                Submission Type
              </Label>
              <RadioGroup
                value={submissionType}
                onValueChange={(value: "text" | "pdf" | "both") =>
                  setSubmissionType(value)
                }
                className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="text" id="text-submission" />
                  <Label htmlFor="text-submission">Text Only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pdf" id="pdf-submission" />
                  <Label htmlFor="pdf-submission">PDF Only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="both" id="both-submission" />
                  <Label htmlFor="both-submission">Text or PDF</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <Label className="font-medium text-text-primary block mb-2">
                Submission Policy
              </Label>
              <RadioGroup
                value={submissionPolicy}
                onValueChange={(value: "single" | "editable") =>
                  setSubmissionPolicy(value)
                }
                className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="single" id="single-submission" />
                  <Label htmlFor="single-submission">Single Submission</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="editable" id="editable-submission" />
                  <Label htmlFor="editable-submission">
                    Editable Until Deadline
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Timer & Scoring */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="font-medium text-text-primary">
                Timer (minutes)
              </Label>
              <Input
                type="number"
                value={timerMinutes}
                onChange={(e) => setTimerMinutes(Number(e.target.value))}
                min={0}
                placeholder="0 for no timer"
              />
              <p className="text-sm text-text-secondary">0 = no time limit</p>
            </div>

            <div className="space-y-2">
              <Label className="font-medium text-text-primary">
                Maximum Score
              </Label>
              <Input
                type="number"
                step="0.1"
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                placeholder="Enter max score"
              />
              <p className="text-sm text-text-secondary">
                Leave blank for no scoring
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-6 min-w-[120px]">
              {isSubmitting ? (
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
                "Create Task"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
