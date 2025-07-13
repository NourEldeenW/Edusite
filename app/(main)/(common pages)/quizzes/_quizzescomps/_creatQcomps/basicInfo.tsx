import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useCreateQuizStore from "@/lib/stores/onlineQuizStores/createQuiz";
import useQuizStore_initial from "@/lib/stores/onlineQuizStores/initialData";
import { ChevronDown, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  format,
  formatDistance,
  formatDuration,
  intervalToDuration,
} from "date-fns";

// Define the Center interface locally
interface Center {
  center_id: number;
  open_date: string;
  close_date: string;
}

export default function BasicInfoComp() {
  const title = useCreateQuizStore(
    (state) => state.createdQuiz.basic_info.title
  );
  const description = useCreateQuizStore(
    (state) => state.createdQuiz.basic_info.description
  );
  const grade_id = useCreateQuizStore(
    (state) => state.createdQuiz.basic_info.grade_id
  );
  const centers = useCreateQuizStore(
    (state) => state.createdQuiz.basic_info.centers
  );
  const { updateBasicInfo } = useCreateQuizStore();
  const { availGrades, availCenters } = useQuizStore_initial();

  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute for relative time display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const addCenterField = () => {
    if (centers.length >= availCenters.length) return;

    // Find first available center that hasn't been selected
    const availableCenter = availCenters.find(
      (center) => !centers.some((c) => c.center_id === center.id)
    );

    const newCenter: Center = {
      center_id: availableCenter?.id || 0,
      open_date: new Date().toISOString(),
      close_date: "0",
    };

    const newCenters = [...centers, newCenter];
    updateBasicInfo(title, description, grade_id, newCenters);
  };

  const updateCenter = (index: number, field: keyof Center, value: string) => {
    const newCenters = [...centers];
    const updatedCenter = {
      ...newCenters[index],
      [field]: field === "center_id" ? Number(value) : value,
    };
    newCenters[index] = updatedCenter;
    updateBasicInfo(title, description, grade_id, newCenters);
  };

  const removeCenter = (index: number) => {
    const newCenters = centers.filter((_, i) => i !== index);
    updateBasicInfo(title, description, grade_id, newCenters);
  };

  // Calculate relative time ("in 2 days, 3 hours")
  const getRelativeTime = (dateString: string) => {
    if (dateString === "0") return "";
    try {
      const date = new Date(dateString);
      return formatDistance(date, currentTime, { addSuffix: true });
    } catch {
      return "Invalid date";
    }
  };

  // Calculate duration between two dates
  const getDuration = (start: string, end: string) => {
    if (start === "0" || end === "0") return "";
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);

      if (endDate <= startDate) return "Ends before start";

      const duration = intervalToDuration({ start: startDate, end: endDate });

      return `Duration: ${formatDuration(duration, {
        format: ["days", "hours", "minutes"],
        zero: false,
        delimiter: ", ",
      }).replace(/\b(\d+)\s+(\w+)\b/g, "$1 $2")}`;
    } catch {
      return "Invalid duration";
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-6">
        {/* --- Quiz Title Field --- */}
        <div className="space-y-2">
          <Label
            htmlFor="quiz-title"
            className="font-medium text-text-secondary">
            Quiz Title
          </Label>
          <Input
            type="text"
            id="quiz-title"
            value={title}
            onChange={(e) =>
              updateBasicInfo(e.target.value, description, grade_id, centers)
            }
            className="w-full px-4 py-5.5 bg-bg-tertiary border border-border-default rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 placeholder:text-text-secondary/50"
            placeholder="Enter the quiz title"
          />
        </div>

        {/* --- Grade Selector --- */}
        <div className="space-y-2">
          <Label
            htmlFor="grade-selector"
            className="font-medium text-text-secondary">
            Grade
          </Label>
          <div className="relative">
            <select
              id="grade-selector"
              value={grade_id}
              onChange={(e) =>
                updateBasicInfo(
                  title,
                  description,
                  Number(e.target.value),
                  centers
                )
              }
              className="w-full pl-4 pr-10 py-2.5 bg-bg-tertiary border border-border-default rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 appearance-none transition-all duration-300">
              {availGrades.map((grade) => (
                <option key={grade.id} value={grade.id}>
                  {grade.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDown className="h-5 w-5 text-text-secondary/80" />
            </div>
          </div>
        </div>
      </div>
      <div className="group w-full">
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) =>
            updateBasicInfo(title, e.target.value, grade_id, centers)
          }
          className="w-full px-4 py-3 bg-bg-tertiary border border-border-default rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 placeholder:text-text-secondary/50 min-h-[120px]"
          placeholder="Describe what this quiz covers"
        />
      </div>

      {/* Center Fields Section */}
      <div className="mt-10">
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

        {centers.length === 0 ? (
          <div className="bg-bg-subtle rounded-lg border border-dashed border-border-default py-10 text-center">
            <p className="text-text-secondary/80 italic">
              No centers added yet
            </p>
            <p className="text-sm text-text-secondary/60 mt-2">
              Click &quot;Add Center&quot; to get started
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

              const durationText =
                center.close_date === "0"
                  ? "Available indefinitely"
                  : getDuration(center.open_date, center.close_date);

              return (
                <div
                  key={index}
                  className="grid grid-cols-1 lg:grid-cols-4 gap-5 p-5 bg-bg-base border border-border-default rounded-xl shadow-xs">
                  {/* Column 1: Center Selection */}
                  <div className="md:col-span-1 space-y-2.5">
                    <Label className="font-medium text-text-primary mb-4">
                      Center
                    </Label>
                    <div className="relative">
                      <select
                        value={center.center_id}
                        onChange={(e) =>
                          updateCenter(index, "center_id", e.target.value)
                        }
                        className="w-full pl-4 pr-10 py-2.5 bg-bg-base border border-border-default rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 appearance-none transition-all duration-300">
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
                  </div>

                  {/* Column 2: Open Date */}
                  <div className="md:col-span-1 space-y-2.5">
                    <Label className="font-medium text-text-primary mb-4">
                      Open Date
                    </Label>
                    <div className="relative">
                      <input
                        type="datetime-local"
                        value={
                          center.open_date === "0"
                            ? ""
                            : format(
                                new Date(center.open_date),
                                "yyyy-MM-dd'T'HH:mm"
                              )
                        }
                        onChange={(e) =>
                          updateCenter(
                            index,
                            "open_date",
                            e.target.value
                              ? new Date(e.target.value).toISOString()
                              : "0"
                          )
                        }
                        className="w-full px-2 py-2.5 bg-bg-base border border-border-default rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                        min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                      />
                    </div>
                    <div className="text-xs text-text-secondary/70">
                      {getRelativeTime(center.open_date)}
                    </div>
                  </div>

                  {/* Column 3: Close Date */}
                  <div className="md:col-span-1 space-y-2.5">
                    {/* Combined label and checkbox in one line */}
                    <div className="flex items-center justify-between">
                      <Label className="font-medium text-text-primary">
                        Close Date
                      </Label>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={center.close_date === "0"}
                          onChange={(e) =>
                            updateCenter(
                              index,
                              "close_date",
                              e.target.checked ? "0" : new Date().toISOString()
                            )
                          }
                          className="h-4 w-4 text-primary focus:ring-primary"
                          id={`never-ends-${index}`}
                        />
                        <Label
                          htmlFor={`never-ends-${index}`}
                          className="text-sm text-text-secondary whitespace-nowrap">
                          Never ends
                        </Label>
                      </div>
                    </div>

                    {center.close_date !== "0" && (
                      <>
                        <div className="relative mt-2">
                          <input
                            type="datetime-local"
                            value={format(
                              new Date(center.close_date),
                              "yyyy-MM-dd'T'HH:mm"
                            )}
                            onChange={(e) =>
                              updateCenter(
                                index,
                                "close_date",
                                new Date(e.target.value).toISOString()
                              )
                            }
                            className="w-full px-2 py-2.5 bg-bg-base border border-border-default rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                            min={
                              center.open_date === "0"
                                ? format(new Date(), "yyyy-MM-dd'T'HH:mm")
                                : format(
                                    new Date(center.open_date),
                                    "yyyy-MM-dd'T'HH:mm"
                                  )
                            }
                          />
                        </div>
                        <div className="text-xs text-text-secondary/70">
                          {getRelativeTime(center.close_date)}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Column 4: Actions & Duration */}
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
                      <div className="hidden md:block text-xs font-medium text-text-secondary/80 text-right mt-2">
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
    </>
  );
}
