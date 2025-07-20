import useQEditStore from "@/lib/stores/onlineQuizStores/editQuiz";
import useQuizStore_initial from "@/lib/stores/onlineQuizStores/initialData";
import { ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, intervalToDuration } from "date-fns";

// Common input styles for consistency
const inputClass =
  "w-full bg-bg-primary text-text-primary border border-border-default rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition duration-200";
const labelClass =
  "block text-text-secondary text-sm font-medium mb-2 flex items-center gap-1";
const sectionClass = "space-y-1";

export default function QuizEditInfoCard() {
  const quizDetails = useQEditStore((s) => s.quizDetails);
  const updateInfo = useQEditStore((s) => s.updateInfo);
  const updateSettings = useQEditStore((s) => s.updateSettings);
  const updateCenterTimes = useQEditStore((s) => s.updateCenterTimes);
  const { availCenters } = useQuizStore_initial();

  if (!quizDetails) return null;

  const settings = quizDetails.settings;
  const centerTimes = quizDetails.center_times;

  // Calculate relative time ("in 2 days, 3 hours")
  const getRelativeTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM d, yyyy 'at' h:mm a");
    } catch {
      return "Invalid date";
    }
  };

  // Calculate duration between two dates
  const getDuration = (start: string, end: string) => {
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);

      if (endDate <= startDate) return "Ends before start";

      const duration = intervalToDuration({ start: startDate, end: endDate });

      return `Duration: ${duration.days}d ${duration.hours}h ${duration.minutes}m`;
    } catch {
      return "Invalid duration";
    }
  };

  const addCenterField = () => {
    if (centerTimes.length >= availCenters.length) return;

    // Find first available center that hasn't been selected
    const availableCenter = availCenters.find(
      (center) => !centerTimes.some((c) => c.center.id === center.id)
    );

    const newCenter = {
      center: availableCenter || availCenters[0],
      open_date: new Date().toISOString(),
      close_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "scheduled",
    };

    updateCenterTimes([...centerTimes, newCenter]);
  };

  const updateCenter = (
    index: number,
    field: keyof (typeof centerTimes)[0],
    value: unknown
  ) => {
    const newCenters = [...centerTimes];
    newCenters[index] = { ...newCenters[index], [field]: value };
    updateCenterTimes(newCenters);
  };

  const removeCenter = (index: number) => {
    const newCenters = centerTimes.filter((_, i) => i !== index);
    updateCenterTimes(newCenters);
  };

  return (
    <div className="bg-bg-secondary border border-border-card rounded-2xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
          Edit Quiz Info & Settings
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className={sectionClass}>
          <label className={labelClass}>Title</label>
          <input
            type="text"
            value={quizDetails.title}
            onChange={(e) => updateInfo(e.target.value, undefined)}
            className={`${inputClass} font-medium`}
            placeholder="Enter quiz title"
          />
        </div>

        {/* Description */}
        <div className={sectionClass}>
          <label className={labelClass}>Description</label>
          <textarea
            value={quizDetails.description}
            onChange={(e) => updateInfo(undefined, e.target.value)}
            rows={3}
            className={`${inputClass} min-h-[100px]`}
            placeholder="Describe your quiz"
          />
        </div>

        {/* Timer Minutes */}
        <div className={sectionClass}>
          <label className={labelClass}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            Timer (minutes)
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={settings.timer_minutes}
            onChange={(e) =>
              updateSettings({
                ...settings,
                timer_minutes: Number(e.target.value),
              })
            }
            className={inputClass}
          />
        </div>

        {/* Score Visibility */}
        <div className={sectionClass}>
          <label className={labelClass}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fillRule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clipRule="evenodd"
              />
            </svg>
            Score Visibility
          </label>
          <select
            value={settings.score_visibility}
            onChange={(e) =>
              updateSettings({
                ...settings,
                score_visibility: e.target.value as
                  | "immediate"
                  | "after_close"
                  | "manual",
              })
            }
            className={inputClass}>
            <option value="immediate">Immediate after submission</option>
            <option value="after_close">After close</option>
            <option value="manual">Manually</option>
          </select>
        </div>

        {/* Answers Visibility */}
        <div className={sectionClass}>
          <label className={labelClass}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H6z"
                clipRule="evenodd"
              />
            </svg>
            Answers Visibility
          </label>
          <select
            value={settings.answers_visibility}
            onChange={(e) =>
              updateSettings({
                ...settings,
                answers_visibility: e.target.value as
                  | "immediate"
                  | "after_close"
                  | "manual",
              })
            }
            className={inputClass}>
            <option value="immediate">Immediate after submission</option>
            <option value="after_close">After close</option>
            <option value="manual">Manually</option>
          </select>
        </div>

        {/* Question Order */}
        <div className={sectionClass}>
          <label className={labelClass}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Question Order
          </label>
          <select
            defaultValue={settings.question_order}
            onChange={(e) =>
              updateSettings({
                ...settings,
                question_order: e.target.value as "created" | "random",
              })
            }
            className={inputClass}>
            <option value="created">Same for All</option>
            <option value="random">Random</option>
          </select>
        </div>
      </div>

      {/* Centers & Availability Section */}
      <div className="mt-10 border-t border-border-default pt-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="text-lg font-semibold text-text-primary">
            Centers & Availability
          </h3>
          <Button
            type="button"
            onClick={addCenterField}
            disabled={centerTimes.length >= availCenters.length}
            className="px-5 py-2.5 text-sm sm:text-base">
            Add Center
          </Button>
        </div>

        {centerTimes.length === 0 ? (
          <div className="bg-bg-subtle rounded-lg border border-dashed border-border-default py-10 text-center">
            <p className="text-text-secondary/80 italic">
              No centers added yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {centerTimes.map((center, index) => {
              const availableCenters = availCenters.filter(
                (c) =>
                  !centerTimes.some(
                    (centerItem, i) =>
                      i !== index && centerItem.center.id === c.id
                  )
              );

              const durationText = getDuration(
                center.open_date,
                center.close_date
              );

              return (
                <div
                  key={index}
                  className="grid grid-cols-1 lg:grid-cols-4 gap-5 p-5 bg-bg-base border border-border-default rounded-xl shadow-xs">
                  {/* Column 1: Center Selection */}
                  <div className="md:col-span-1 space-y-2.5">
                    <label className="font-medium text-text-primary mb-4">
                      Center
                    </label>
                    <div className="relative">
                      <select
                        value={center.center.id}
                        onChange={(e) => {
                          const newCenter = availCenters.find(
                            (c) => c.id === parseInt(e.target.value)
                          );
                          if (newCenter) {
                            updateCenter(index, "center", newCenter);
                          }
                        }}
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
                    <label className="font-medium text-text-primary mb-4">
                      Open Date
                    </label>
                    <div className="relative">
                      <input
                        type="datetime-local"
                        value={format(
                          new Date(center.open_date),
                          "yyyy-MM-dd'T'HH:mm"
                        )}
                        onChange={(e) =>
                          updateCenter(
                            index,
                            "open_date",
                            e.target.value
                              ? new Date(e.target.value).toISOString()
                              : new Date().toISOString()
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
                    <label className="font-medium text-text-primary mb-4">
                      Close Date
                    </label>
                    <div className="relative">
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
                            e.target.value
                              ? new Date(e.target.value).toISOString()
                              : new Date().toISOString()
                          )
                        }
                        className="w-full px-2 py-2.5 bg-bg-base border border-border-default rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                        min={format(
                          new Date(center.open_date),
                          "yyyy-MM-dd'T'HH:mm"
                        )}
                      />
                    </div>
                    <div className="text-xs text-text-secondary/70">
                      {getRelativeTime(center.close_date)}
                    </div>
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
    </div>
  );
}
