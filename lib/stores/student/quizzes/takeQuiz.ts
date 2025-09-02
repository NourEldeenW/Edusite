import { GradeType } from "@/app/(main)/(common pages)/students/_students comps/main";
import { api } from "@/lib/axiosinterceptor";
import { create } from "zustand";
const djangoAPI = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;

type SubmissionStatus = "not_started" | "in_progress" | "submitted";

interface QuizCenterTime {
  center: GradeType;
  open_date: string;
  close_date: string;
  status: string;
}

interface QuizQuestionChoice {
  id: number;
  text: string;
  image: string | null;
}

interface QuizQuestion {
  id: number;
  selection_type: "single" | "multiple";
  text: string;
  image: string | null;
  points: number;
  choices: QuizQuestionChoice[];
}

interface QuizSettings {
  timer_minutes: number;
  score_visibility: string;
  answers_visibility: string;
  question_order: string;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  grade: GradeType;
  center_times: QuizCenterTime[];
  settings: QuizSettings;
  questions: QuizQuestion[];
  submission_status: SubmissionStatus;
}

interface SelectedAnswer {
  questionID: number;
  answerID: number;
}

// -- Store State & Actions --------------------------------------------------
interface QuizStoreState {
  authToken: string | null;
  setAuthToken: (token: string) => void;

  quizData: Quiz | null;
  submissionId: number | null;
  startTime: string | null;

  timer: number;
  timerInterval: NodeJS.Timeout | null;
  currentQuestionIndex: number;
  selectedAnswers: SelectedAnswer[];

  loading: boolean;
  error: string | null;

  selectedQuizId: number | null;
  setSelectedQuiz: (quizId: number | null) => Promise<void>;
  setQuizData: (data: Quiz | null) => void;

  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  goToQuestion: (index: number) => void;

  addAnswer: (ans: SelectedAnswer) => void;
  removeAnswer: (questionID: number, answerID?: number) => void;
  toggleAnswer: (
    questionID: number,
    answerID: number,
    selectionType: "single" | "multiple"
  ) => void;

  stopTimer: () => void;
  submitAnswers: () => Promise<void>;
  reset: () => void;

  // New state for redirection
  submissionCompleted: { quizId: number; submissionId: number } | null;
  clearSubmissionCompleted: () => void;
}

// -- Persistence Helpers -----------------------------------------------------
const STORAGE_KEY = (quizId: number) => `quiz-${quizId}-state`;

// -- Error Type Guard --------------------------------------------------------
interface AxiosErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

function isAxiosError(error: unknown): error is AxiosErrorResponse {
  return (
    typeof error === "object" &&
    error !== null &&
    ("response" in error || "message" in error)
  );
}

// -- Zustand Store ----------------------------------------------------------
const useTakeQuizStore = create<QuizStoreState>((set, get) => {
  // Persist answers + index in localStorage so page reloads won't lose progress
  const persistState = () => {
    const { selectedQuizId, currentQuestionIndex, selectedAnswers } = get();
    if (!selectedQuizId) return;
    const blob = JSON.stringify({ currentQuestionIndex, selectedAnswers });
    localStorage.setItem(STORAGE_KEY(selectedQuizId), blob);
  };

  // Load answers + index from localStorage when quiz is (re)loaded
  const loadPersisted = () => {
    const { selectedQuizId } = get();
    if (!selectedQuizId) return;
    const raw = localStorage.getItem(STORAGE_KEY(selectedQuizId));
    if (!raw) return;
    try {
      const { currentQuestionIndex, selectedAnswers } = JSON.parse(raw);
      set({ currentQuestionIndex, selectedAnswers });
    } catch {
      localStorage.removeItem(STORAGE_KEY(selectedQuizId));
    }
  };

  // Stop the timer interval to prevent memory leaks or unwanted ticks
  const stopTimer = () => {
    const iv = get().timerInterval;
    if (iv) clearInterval(iv);
    set({ timerInterval: null });
  };

  // Kick off a 1-second interval that recalculates time left and auto-submits at 0
  const startAutoTimer = () => {
    // Clear any existing timer first
    const existingInterval = get().timerInterval;
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    const iv = setInterval(() => {
      const state = get();
      const { startTime, quizData, timerInterval } = state;

      // Safety check - if timer was cleared, don't continue
      if (!timerInterval) {
        clearInterval(iv);
        return;
      }

      if (!startTime || !quizData) {
        clearInterval(iv);
        set({ timerInterval: null });
        return;
      }

      const elapsedSec = (Date.now() - new Date(startTime).getTime()) / 1000;
      const totalSec = quizData.settings.timer_minutes * 60;
      const remain = Math.max(0, Math.ceil(totalSec - elapsedSec));

      // Only update state if the timer value actually changed
      if (state.timer !== remain) {
        set({ timer: remain });
      }

      if (remain <= 0) {
        clearInterval(iv);
        set({ timerInterval: null });
        // Use setTimeout to avoid calling submitAnswers during state update
        setTimeout(() => {
          get().submitAnswers();
        }, 0);
      }
    }, 1000);

    set({ timerInterval: iv });
  };

  return {
    // -- initial state values --
    authToken: null,
    quizData: null,
    submissionId: null,
    startTime: null,
    timer: 0,
    timerInterval: null,
    currentQuestionIndex: 0,
    selectedAnswers: [],
    selectedQuizId: null,
    loading: false,
    error: null,
    submissionCompleted: null, // New state for redirection

    /**
     * setAuthToken(token)
     * When to call: once on app or page mount, before any quiz API request.
     * What it does: stores the JWT.
     */
    setAuthToken: (token: string) => {
      set({ authToken: token });
    },

    /**
     * setSelectedQuiz(quizId)
     * When to call: when you navigate to the quiz page.
     * What it does:
     *   1. Clears store if null.
     *   2. POST /quizzes/:id/start/ → saves submissionId + startTime.
     *   3. GET /quizzes/:id/ → saves quizData.
     *   4. Hydrates persisted answers + index.
     *   5. Starts timer if quizData.settings.timer_minutes > 0.
     */
    setSelectedQuiz: async (quizId) => {
      if (quizId === null) {
        get().reset();
        return;
      }

      set({ loading: true, error: null });

      try {
        set({ selectedQuizId: quizId });

        const startRes = await api.post<{
          submission_id: number;
          start_time: string;
        }>(
          `${djangoAPI}onlinequiz/quizzes/${quizId}/start/`,
          {},
          {
            headers: { Authorization: `Bearer ${get().authToken}` },
          }
        );
        set({
          submissionId: startRes.data.submission_id,
          startTime: startRes.data.start_time,
        });

        const details = await api.get<Quiz>(
          `${djangoAPI}onlinequiz/quizzes/${quizId}/`,
          {
            headers: { Authorization: `Bearer ${get().authToken}` },
          }
        );
        set({ quizData: details.data });

        loadPersisted();

        if ((details.data.settings.timer_minutes ?? 0) > 0) {
          startAutoTimer();
        }
      } catch (error) {
        let errorMessage = "Failed to load quiz";

        if (isAxiosError(error)) {
          errorMessage =
            error.response?.data?.message || error.message || errorMessage;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        set({
          error: errorMessage,
          selectedQuizId: null,
        });
        localStorage.removeItem(STORAGE_KEY(quizId));
      } finally {
        set({ loading: false });
      }
    },

    /**
     * setQuizData(data)
     * When to call: if you need to override or clear raw quizData manually.
     * What it does: directly writes quizData in the store.
     */
    setQuizData: (data) => set({ quizData: data }),

    /**
     * goToNextQuestion()
     * When to call: on “Next” button click.
     * What it does: increments currentQuestionIndex (max = last question).
     */
    goToNextQuestion: () => {
      set((s) => {
        const last = (s.quizData?.questions.length ?? 1) - 1;
        return {
          currentQuestionIndex: Math.min(s.currentQuestionIndex + 1, last),
        };
      });
      persistState();
    },

    /**
     * goToPreviousQuestion()
     * When to call: on “Previous” button click.
     * What it does: decrements currentQuestionIndex (min = 0).
     */
    goToPreviousQuestion: () => {
      set((s) => ({
        currentQuestionIndex: Math.max(0, s.currentQuestionIndex - 1),
      }));
      persistState();
    },

    /**
     * goToQuestion(index)
     * When to call: from a navigation bar or progress indicator.
     * What it does: jumps currentQuestionIndex to `index`.
     */
    goToQuestion: (index) => {
      set({ currentQuestionIndex: index });
      persistState();
    },

    /**
     * addAnswer(answer)
     * When to call: rarely needed manually; use toggleAnswer for selection UI.
     * What it does: appends a SelectedAnswer to the array.
     */
    addAnswer: (answer) => {
      set((s) => ({ selectedAnswers: [...s.selectedAnswers, answer] }));
      persistState();
    },

    /**
     * removeAnswer(questionID, answerID?)
     * When to call: to clear one or all answers for a question.
     * What it does:
     *   - If answerID provided, removes that pair.
     *   - Else, removes all answers for questionID.
     */
    removeAnswer: (questionID, answerID) => {
      set((s) => ({
        selectedAnswers: s.selectedAnswers.filter((a) =>
          answerID != null
            ? !(a.questionID === questionID && a.answerID === answerID)
            : a.questionID !== questionID
        ),
      }));
      persistState();
    },

    /**
     * toggleAnswer(questionID, answerID, selectionType)
     * When to call: on user click of a choice.
     * What it does:
     *   - Single: clears previous, adds new.
     *   - Multiple: adds if missing, removes if existing.
     */
    toggleAnswer: (questionID, answerID, selectionType) => {
      set((s) => {
        let answers = [...s.selectedAnswers];

        if (selectionType === "single") {
          // Remove any existing for this question, then add the new choice.
          answers = answers.filter((a) => a.questionID !== questionID);
          answers.push({ questionID, answerID });
        } else {
          // For multiple: toggle presence of this choice.
          const exists = answers.some(
            (a) => a.questionID === questionID && a.answerID === answerID
          );
          if (exists) {
            answers = answers.filter(
              (a) => !(a.questionID === questionID && a.answerID === answerID)
            );
          } else {
            answers.push({ questionID, answerID });
          }
        }

        return { selectedAnswers: answers };
      });
      persistState();
    },

    /**
     * stopTimer()
     * When to call: if you navigate away or manually pause.
     * What it does: clears the interval and stops ticking.
     */
    stopTimer,

    /**
     * submitAnswers()
     * When to call: on “Submit” button or auto at timeout.
     * What it does:
     *   - Groups answers by question.
     *   - POSTs to /submissions/create/.
     *   - Clears store and sets submissionCompleted for redirection.
     */
    submitAnswers: async () => {
      const { selectedAnswers, selectedQuizId, submissionId } = get();
      if (!selectedQuizId || !submissionId) return;

      set({ loading: true, error: null });

      try {
        const grouped: Record<number, number[]> = {};
        selectedAnswers.forEach((a) => {
          grouped[a.questionID] = grouped[a.questionID] || [];
          grouped[a.questionID].push(a.answerID);
        });

        const payload = Object.entries(grouped).map(([qid, choices]) => ({
          question_id: Number(qid),
          selected_choices: choices,
        }));

        await api.post(
          `${djangoAPI}onlinequiz/quizzes/${selectedQuizId}/submissions/create/`,
          { answers: payload },
          { headers: { Authorization: `Bearer ${get().authToken}` } }
        );

        // Clear persisted state and stop timer
        localStorage.removeItem(STORAGE_KEY(selectedQuizId));
        stopTimer();

        // Reset state and set redirection info
        set({
          quizData: null,
          submissionId: null,
          startTime: null,
          timer: 0,
          timerInterval: null,
          currentQuestionIndex: 0,
          selectedAnswers: [],
          selectedQuizId: null,
          loading: false,
          error: null,
          submissionCompleted: {
            quizId: selectedQuizId,
            submissionId: submissionId,
          },
        });
      } catch (error) {
        let errorMessage = "Failed to submit answers";

        if (isAxiosError(error)) {
          errorMessage =
            error.response?.data?.message || error.message || errorMessage;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        set({ error: errorMessage });
      } finally {
        set({ loading: false });
      }
    },

    /**
     * reset()
     * When to call: after final submission or to abort quiz.
     * What it does: clears localStorage, stops timer, resets all store fields.
     */
    reset: () => {
      const { selectedQuizId } = get();
      if (selectedQuizId) localStorage.removeItem(STORAGE_KEY(selectedQuizId));
      stopTimer();
      set({
        quizData: null,
        submissionId: null,
        startTime: null,
        timer: 0,
        timerInterval: null,
        currentQuestionIndex: 0,
        selectedAnswers: [],
        selectedQuizId: null,
        loading: false,
        error: null,
        submissionCompleted: null,
      });
    },

    /**
     * clearSubmissionCompleted()
     * When to call: after successful redirection to review page.
     * What it does: clears the submissionCompleted state.
     */
    clearSubmissionCompleted: () => set({ submissionCompleted: null }),
  };
});

export default useTakeQuizStore;
