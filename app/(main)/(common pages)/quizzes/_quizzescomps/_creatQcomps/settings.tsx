import useCreateQuizStore from "@/lib/stores/onlineQuizStores/createQuiz";
import { Clock, Eye, CheckCircle, Shuffle } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Settings() {
  const timer_minutes = useCreateQuizStore(
    (state) => state.createdQuiz.settings.timer_minutes
  );
  const score_visibility = useCreateQuizStore(
    (state) => state.createdQuiz.settings.score_visibility
  );
  const answers_visibility = useCreateQuizStore(
    (state) => state.createdQuiz.settings.answers_visibility
  );
  const question_order = useCreateQuizStore(
    (state) => state.createdQuiz.settings.question_order
  );

  const { updateSettings } = useCreateQuizStore();

  return (
    <div className="settings-grid grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Timer Settings */}
      <div className="setting-card bg-bg-secondary rounded-sm p-5 border border-border-default">
        <div className="setting-card-header flex items-center gap-3 mb-4">
          <div className="setting-icon w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary">
            <Clock className="w-5 h-5" />
          </div>
          <div className="setting-title font-semibold">Timer Settings</div>
        </div>

        <div className="form-group">
          <label
            htmlFor="timer-minutes"
            className="block mb-2 font-medium text-text-secondary">
            Duration (minutes)
          </label>
          <Input
            type="text"
            id="timer-minutes"
            className="w-full px-4 py-3 border-border-default"
            value={timer_minutes}
            pattern={"[0-9]"}
            onChange={(e) =>
              updateSettings(
                undefined,
                parseInt(e.target.value) || 0,
                undefined,
                undefined,
                undefined
              )
            }
          />
          <small className="text-text-secondary text-sm">
            Set to 0 for no time limit
          </small>
        </div>
      </div>

      {/* Score Visibility */}
      <div className="setting-card bg-bg-secondary rounded-sm p-5 border border-border-default">
        <div className="setting-card-header flex items-center gap-3 mb-4">
          <div className="setting-icon w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary">
            <Eye className="w-5 h-5" />
          </div>
          <div className="setting-title font-semibold">Score Visibility</div>
        </div>

        <div className="form-group">
          <Select
            value={score_visibility}
            onValueChange={(value) =>
              updateSettings(
                undefined,
                undefined,
                value as "immediate" | "after_close" | "manual",
                undefined,
                undefined
              )
            }>
            <SelectTrigger className="w-full px-4 py-3">
              <SelectValue placeholder="Select visibility" />
            </SelectTrigger>
            <SelectContent
              className="min-w-[var(--radix-select-trigger-width)] max-w-[var(--radix-select-trigger-width)]"
              align="start">
              <SelectItem className="px-4 py-2" value="after_close">
                After quiz is closed
              </SelectItem>
              <SelectItem className="px-4 py-2" value="immediate">
                Immediately after submission
              </SelectItem>
              <SelectItem className="px-4 py-2" value="manual">
                Manually
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Answers Visibility */}
      <div className="setting-card bg-bg-secondary rounded-sm p-5 border border-border-default">
        <div className="setting-card-header flex items-center gap-3 mb-4">
          <div className="setting-icon w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="setting-title font-semibold">Answers Visibility</div>
        </div>

        <div className="form-group">
          <Select
            value={answers_visibility}
            onValueChange={(value) =>
              updateSettings(
                undefined,
                undefined,
                undefined,
                value as "immediate" | "after_close" | "manual",
                undefined
              )
            }>
            <SelectTrigger className="w-full px-4 py-3">
              <SelectValue placeholder="Select visibility" />
            </SelectTrigger>
            <SelectContent
              className="min-w-[var(--radix-select-trigger-width)] max-w-[var(--radix-select-trigger-width)]"
              align="start">
              <SelectItem className="px-4 py-2" value="after_close">
                After quiz is closed
              </SelectItem>
              <SelectItem className="px-4 py-2" value="immediate">
                Immediately after submission
              </SelectItem>
              <SelectItem className="px-4 py-2" value="manual">
                Manually
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="setting-card bg-bg-secondary rounded-sm p-5 border border-border-default">
        <div className="setting-card-header flex items-center gap-3 mb-4">
          <div className="setting-icon w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary">
            <Shuffle className="w-5 h-5" />
          </div>
          <div className="setting-title font-semibold">Questions Order</div>
        </div>

        <div className="form-group">
          <Select
            value={question_order}
            onValueChange={(value) =>
              updateSettings(
                undefined,
                undefined,
                undefined,
                undefined,
                value as "random" | "created"
              )
            }>
            <SelectTrigger className="w-full px-4 py-3">
              <SelectValue placeholder="Select visibility" />
            </SelectTrigger>
            <SelectContent
              className="min-w-[var(--radix-select-trigger-width)] max-w-[var(--radix-select-trigger-width)]"
              align="start">
              <SelectItem className="px-4 py-2" value="created">
                Same order for all students
              </SelectItem>
              <SelectItem className="px-4 py-2" value="random">
                Random for every student
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
