import { create } from "zustand";
import { api } from "@/lib/axiosinterceptor";

// Retrieve the base URL for the Django API from environment variables.
const djangoAPI = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;

// --- Interface Definitions ---
// These interfaces define the shape of the data used throughout the store,
// ensuring type safety and clarity.

interface GradeType {
  id: number;
  name: string;
}

interface TaskCenter {
  center: GradeType;
  open_date: string;
  close_date: string;
}

interface TaskDetails {
  id: number;
  teacher: number;
  teacher_name: string;
  grade: GradeType;
  centers: TaskCenter[];
  title: string;
  details: string;
  task_content_type: "text" | "pdf";
  task_text?: string;
  task_pdf?: string;
  submission_type: "text" | "pdf" | "both";
  submission_policy: "single";
  timer_minutes: number;
  max_score: number;
  created_at: string;
}

interface Student {
  id: number;
  student_id: string;
  full_name: string;
  phone_number: string;
  parent_number: string;
  center: GradeType;
  grade: GradeType;
}

export interface Submission {
  id: number;
  task: TaskDetails;
  student: Student;
  status: "not_started" | "in_progress" | "submitted" | "corrected";
  start_time: string;
  end_time: string;
  submitted_text?: string;
  submitted_pdf?: string;
  score?: number;
  feedback?: string;
  corrected_at?: string;
  corrected_by?: string;
}

// Interface for submission options
interface SubmitTaskOptions {
  isAutoSubmit?: boolean;
}

/**
 * Interface defining the state and actions for the useTakeTaskStore.
 */
interface TaskStoreState {
  // --- State Properties ---
  taskData: Submission | null;
  textAnswer: string;
  fileAnswer: File | null;
  persistedFileName: string | null; // NEW: Stores the name of a previously selected file.
  timer: number;
  timerInterval: NodeJS.Timeout | null;
  isTimed: boolean;
  loading: boolean;
  isAutoSubmitting: boolean; // NEW: Flag for when submission is triggered by the timer.
  error: string | null;
  submissionCompleted: { taskId: number; submissionId: number } | null;
  accessToken: string | null;

  // --- Actions ---
  setAccessToken: (token: string) => void;
  setTask: (submission: Submission) => void;
  setTextAnswer: (text: string) => void;
  setFileAnswer: (file: File | null) => void;
  startTimer: () => void;
  stopTimer: () => void;
  submitTask: (options?: SubmitTaskOptions) => Promise<void>; // UPDATED with proper type
  reset: () => void;
  clearSubmissionCompleted: () => void;
}

/**
 * Generates a unique localStorage key for a given task ID.
 * @param {number} taskId - The ID of the task.
 * @returns {string} The key for localStorage.
 */
const getStorageKey = (taskId: number) => `task-submission-${taskId}`;

/**
 * Zustand store to manage the state and logic for a student taking a task.
 * ENHANCEMENTS: Debounced saving, smart error handling, file name persistence, and auto-submit state.
 */
export const useTakeTaskStore = create<TaskStoreState>((set, get) => {
  // A variable to hold the debounce timeout ID.
  let debounceTimeout: NodeJS.Timeout | null = null;

  /**
   * Persists the current answers (text and file name) to localStorage.
   * This prevents data loss on page refresh for any task.
   */
  const persistAnswers = () => {
    const { taskData, textAnswer, fileAnswer } = get();
    if (!taskData) return;
    const dataToStore = {
      textAnswer,
      fileName: fileAnswer ? fileAnswer.name : null,
    };
    localStorage.setItem(
      getStorageKey(taskData.task.id),
      JSON.stringify(dataToStore)
    );
  };

  /**
   * Loads persisted answers from localStorage for a given task ID.
   * @param {number} taskId - The ID of the task to load answers for.
   */
  const loadPersistedAnswers = (taskId: number) => {
    const data = localStorage.getItem(getStorageKey(taskId));
    if (data) {
      try {
        const { textAnswer, fileName } = JSON.parse(data);
        set({
          textAnswer: textAnswer || "",
          persistedFileName: fileName || null,
        });
      } catch (e) {
        console.error(
          "Failed to parse persisted task data from localStorage",
          e
        );
      }
    }
  };

  /**
   * Clears the timer interval, effectively stopping the countdown.
   */
  const stopTimer = () => {
    const iv = get().timerInterval;
    if (iv) clearInterval(iv);
    set({ timerInterval: null });
  };

  /**
   * Starts the countdown timer for a timed task.
   * If the timer reaches zero, it triggers an automatic submission.
   */
  const startTimer = () => {
    stopTimer();
    const { taskData, isTimed } = get();
    if (!taskData || !isTimed) return;

    const startTime = new Date(taskData.start_time).getTime();
    const totalTime = taskData.task.timer_minutes * 60 * 1000;
    const endTime = startTime + totalTime;

    const iv = setInterval(() => {
      const now = Date.now();
      const remain = Math.max(0, Math.ceil((endTime - now) / 1000));
      set({ timer: remain });

      if (remain <= 0) {
        stopTimer();
        // Automatically submit the task, flagging it as an auto-submission.
        get().submitTask({ isAutoSubmit: true });
      }
    }, 1000);
    set({ timerInterval: iv });
  };

  return {
    // --- Initial State ---
    taskData: null,
    textAnswer: "",
    fileAnswer: null,
    persistedFileName: null,
    timer: 0,
    timerInterval: null,
    isTimed: false,
    loading: false,
    isAutoSubmitting: false,
    error: null,
    submissionCompleted: null,
    accessToken: null,

    setAccessToken: (token) => set({ accessToken: token }),

    setTask: (submission) => {
      const isTaskTimed = submission.task.timer_minutes > 0;
      set({
        taskData: submission,
        isTimed: isTaskTimed,
        textAnswer: "",
        fileAnswer: null,
        persistedFileName: null,
      });

      // Always load any previously saved answers.
      loadPersistedAnswers(submission.task.id);

      if (isTaskTimed) {
        startTimer();
      }
    },

    /**
     * Updates text answer and debounces the save to localStorage for performance.
     * @param {string} text - The student's text answer.
     */
    setTextAnswer: (text) => {
      set({ textAnswer: text });
      if (debounceTimeout) clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        persistAnswers();
      }, 500); // 500ms delay before saving.
    },

    /**
     * Updates file answer and immediately persists the file name.
     * @param {File | null} file - The file selected by the student.
     */
    setFileAnswer: (file) => {
      set({ fileAnswer: file, persistedFileName: null }); // Clear persisted name when a new file is chosen.
      persistAnswers();
    },

    startTimer,
    stopTimer,

    /**
     * Submits the task with enhanced error handling.
     * @param {SubmitTaskOptions} [options] - Submission options.
     */
    submitTask: async (options?: SubmitTaskOptions) => {
      const isAutoSubmit = options?.isAutoSubmit ?? false;
      const { taskData, textAnswer, fileAnswer, accessToken } = get();

      if (!taskData || !accessToken) {
        const errorMsg = !taskData
          ? "Task data is missing."
          : "Access token is missing.";
        console.error(`Submission failed: ${errorMsg}`);
        set({
          error: "A critical error occurred. Please refresh and try again.",
        });
        return;
      }

      set({ loading: true, error: null, isAutoSubmitting: isAutoSubmit });

      // --- Validation ---
      // Skip validation for auto-submit to allow empty submissions
      if (!isAutoSubmit) {
        const { submission_type } = taskData.task;
        if (
          (submission_type === "text" && !textAnswer.trim()) ||
          (submission_type === "pdf" && !fileAnswer) ||
          (submission_type === "both" && (!textAnswer.trim() || !fileAnswer))
        ) {
          set({
            error: "Please provide all required submission materials.",
            loading: false,
            isAutoSubmitting: false,
          });
          return;
        }

        if (fileAnswer && fileAnswer.size > 10 * 1024 * 1024) {
          // 10MB limit
          set({
            error: "File size must be less than 10MB.",
            loading: false,
            isAutoSubmitting: false,
          });
          return;
        }
      }

      try {
        const formData = new FormData();
        formData.append("submission_id", taskData.id.toString());
        if (textAnswer) formData.append("submitted_text", textAnswer);
        if (fileAnswer) formData.append("submitted_pdf", fileAnswer);

        await api.patch(
          `${djangoAPI}task/tasks/${taskData.task.id}/submissions/${taskData.id}/`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        // --- Success Handling ---
        localStorage.removeItem(getStorageKey(taskData.task.id));
        stopTimer();
        set({
          submissionCompleted: {
            taskId: taskData.task.id,
            submissionId: taskData.id,
          },
          loading: false,
          isAutoSubmitting: false,
          textAnswer: "",
          fileAnswer: null,
          persistedFileName: null,
        });
      } catch (err: unknown) {
        // --- Enhanced Error Handling ---
        console.error("Submission API error:", err);
        let errorMessage = "An unknown error occurred. Please try again.";

        // Type guard for axios error
        if (err && typeof err === "object" && "response" in err) {
          const axiosError = err as {
            response?: {
              status?: number;
              data?: unknown;
            };
            request?: unknown;
          };

          if (axiosError.response) {
            const status = axiosError.response.status;
            if (status === 400)
              errorMessage =
                "Invalid submission data. Please check your answers.";
            else if (status === 401 || status === 403)
              errorMessage = "Authentication error. Please log in again.";
            else if (status === 404)
              errorMessage =
                "The task could not be found. Please contact support.";
            else if (status && status >= 500)
              errorMessage =
                "Server error. We are looking into it. Please try again later.";
          } else if (axiosError.request) {
            errorMessage =
              "Network error. Please check your internet connection.";
          }
        }

        set({ error: errorMessage, loading: false, isAutoSubmitting: false });
      }
    },
    reset: () => {
      const { taskData } = get();
      if (taskData) localStorage.removeItem(getStorageKey(taskData.task.id));
      stopTimer();
      if (debounceTimeout) clearTimeout(debounceTimeout);

      set({
        taskData: null,
        textAnswer: "",
        fileAnswer: null,
        persistedFileName: null,
        timer: 0,
        timerInterval: null,
        isTimed: false,
        loading: false,
        isAutoSubmitting: false,
        error: null,
        submissionCompleted: null,
        accessToken: null,
      });
    },

    clearSubmissionCompleted: () => set({ submissionCompleted: null }),
  };
});
