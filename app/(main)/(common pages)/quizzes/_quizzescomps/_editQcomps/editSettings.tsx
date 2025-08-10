import React, { useEffect, useState } from "react";
import useQEditStore from "@/lib/stores/onlineQuizStores/editQuiz";
import useQuizStore_initial from "@/lib/stores/onlineQuizStores/initialData";
import {
  X,
  Info,
  Calendar,
  Clock,
  LayoutGrid,
  Trophy,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, formatDistance, intervalToDuration } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function QuizEditInfoCard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const quizDetails = useQEditStore((s) => s.quizDetails);
  const updateInfo = useQEditStore((s) => s.updateInfo);
  const updateSettings = useQEditStore((s) => s.updateSettings);
  const updateCenterTimes = useQEditStore((s) => s.updateCenterTimes);
  const { availCenters } = useQuizStore_initial();

  // Local input state for timer; safe to reference quizDetails optionally here
  const [timerValue, setTimerValue] = useState(
    () => quizDetails?.settings?.timer_minutes?.toString() ?? "0"
  );

  // Update every minute to keep relative times fresh
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Sync local timerValue if external store (settings.timer_minutes) changes.
  useEffect(() => {
    if (!quizDetails) return;
    setTimerValue(quizDetails.settings.timer_minutes?.toString() ?? "0");
  }, [quizDetails, quizDetails?.settings?.timer_minutes]);

  if (!quizDetails) return null;

  const settings = quizDetails.settings;
  const centerTimes = quizDetails.center_times;

  // validate and commit on blur (or when called programmatically)
  const validateTimeLimit = (e?: React.FocusEvent<HTMLInputElement>) => {
    const raw = (e?.target.value ?? timerValue).trim();

    // treat empty as 0 (unlimited)
    if (raw === "") {
      updateSettings({ ...settings, timer_minutes: 0 });
      setTimerValue("0");
      return;
    }

    const num = Number(raw);

    if (!Number.isFinite(num) || num < 0) {
      updateSettings({ ...settings, timer_minutes: 0 });
      setTimerValue("0");
      return;
    }

    // store an integer number of minutes
    const intVal = Math.floor(num);
    updateSettings({ ...settings, timer_minutes: intVal });
    setTimerValue(intVal.toString());
  };

  // Calculate relative time
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
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);

      if (endDate <= startDate) return "Ends before start";

      const duration = intervalToDuration({ start: startDate, end: endDate });

      const parts: string[] = [];
      if (duration.days) parts.push(`${duration.days}d`);
      if (duration.hours) parts.push(`${duration.hours}h`);
      if (duration.minutes) parts.push(`${duration.minutes}m`);

      return parts.join(" ") || "0m";
    } catch {
      return "Invalid duration";
    }
  };

  const addCenterField = () => {
    if (centerTimes.length >= availCenters.length) return;

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
    <Card className="rounded-2xl w-full mb-5">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            Quiz Information & Settings
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Title */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Title</Label>
              <span className="text-xs text-muted-foreground">Required</span>
            </div>
            <Input
              value={quizDetails.title}
              onChange={(e) => updateInfo(e.target.value, undefined)}
              placeholder="Enter quiz title"
              className="w-full"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Description</Label>
            </div>
            <Textarea
              value={quizDetails.description}
              onChange={(e) => updateInfo(undefined, e.target.value)}
              placeholder="Describe your quiz"
              className="min-h-[100px] w-full"
            />
          </div>

          {/* Timer Minutes */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Time Limit (Minutes)
            </Label>
            <Input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              value={timerValue}
              onBlur={validateTimeLimit}
              onChange={(e) => setTimerValue(e.target.value)}
              placeholder="0 for unlimited"
              className="w-full"
            />
          </div>

          {/* Score Visibility */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Score Visibility
            </Label>
            <Select
              value={settings.score_visibility}
              onValueChange={(value) =>
                updateSettings({
                  ...settings,
                  score_visibility: value as
                    | "immediate"
                    | "after_close"
                    | "manual",
                })
              }>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">
                  Immediate after submission
                </SelectItem>
                <SelectItem value="after_close">After quiz closes</SelectItem>
                <SelectItem value="manual">Manually</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Answers Visibility */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Answers Visibility
            </Label>
            <Select
              value={settings.answers_visibility}
              onValueChange={(value) =>
                updateSettings({
                  ...settings,
                  answers_visibility: value as
                    | "immediate"
                    | "after_close"
                    | "manual",
                })
              }>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">
                  Immediate after submission
                </SelectItem>
                <SelectItem value="after_close">After quiz closes</SelectItem>
                <SelectItem value="manual">Manually</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Question Order */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              Question Order
            </Label>
            <Select
              value={settings.question_order}
              onValueChange={(value) =>
                updateSettings({
                  ...settings,
                  question_order: value as "created" | "random",
                })
              }>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created">
                  Fixed order (as created)
                </SelectItem>
                <SelectItem value="random">
                  Randomized for each student
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Centers & Availability Section */}
        <div className="mt-10 border-t pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-lg font-semibold">Centers & Availability</h3>
            <Button
              onClick={addCenterField}
              disabled={centerTimes.length >= availCenters.length}
              className="self-end min-w-[120px]">
              Add Center
            </Button>
          </div>

          {centerTimes.length === 0 ? (
            <div className="border border-dashed rounded-xl py-12 text-center w-full">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground italic">
                No centers added yet
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
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

                const isValidDates =
                  new Date(center.close_date) > new Date(center.open_date);

                return (
                  <Card key={index} className="p-4 bg-muted/50">
                    <div className="grid grid-cols-1 md:grid-cols-[2fr_1.2fr_1.2fr_auto] gap-4 items-center">
                      {/* Center Selection */}
                      <div className="space-y-2">
                        <Label>Center</Label>
                        <Select
                          value={center.center.id.toString()}
                          onValueChange={(value) => {
                            const newCenter = availCenters.find(
                              (c) => c.id === parseInt(value)
                            );
                            if (newCenter) {
                              updateCenter(index, "center", newCenter);
                            }
                          }}>
                          <SelectTrigger
                            className={`w-full ${
                              center.center.id === 0 ? "border-orange-500" : ""
                            }`}>
                            <SelectValue placeholder="Select a center" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Select a center</SelectItem>
                            {availableCenters.map((center) => (
                              <SelectItem
                                key={center.id}
                                value={center.id.toString()}>
                                {center.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {center.center.id === 0 && (
                          <p className="text-xs text-orange-500">
                            Please select a center
                          </p>
                        )}
                      </div>

                      {/* Open Date */}
                      <div className="space-y-2">
                        <Label>Open Date</Label>
                        <Input
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
                          min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                          {getRelativeTime(center.open_date)}
                        </p>
                      </div>

                      {/* Close Date */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Close Date</Label>
                          {!isValidDates && (
                            <span className="text-xs text-destructive">
                              Invalid date
                            </span>
                          )}
                        </div>
                        <Input
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
                          min={format(
                            new Date(center.open_date),
                            "yyyy-MM-dd'T'HH:mm"
                          )}
                          className={`w-full ${
                            !isValidDates ? "border-destructive" : ""
                          }`}
                        />
                        <p className="text-xs text-muted-foreground">
                          {getRelativeTime(center.close_date)}
                        </p>
                      </div>

                      {/* Actions & Duration */}
                      <div className="flex flex-col items-end justify-between gap-3 min-w-[80px]">
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => removeCenter(index)}
                          className="self-end">
                          <X className="h-4 w-4" />
                        </Button>
                        <p className="text-xs font-medium text-muted-foreground text-right">
                          Duration: {isValidDates ? durationText : "Invalid"}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {centerTimes.length > 0 && (
            <div className="mt-4 flex items-center text-sm text-muted-foreground">
              <Info className="w-4 h-4 mr-2" />
              <span>
                {availCenters.length - centerTimes.length} center(s) available
                to add
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
