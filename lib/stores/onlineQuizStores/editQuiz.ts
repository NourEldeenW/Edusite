import { GradeType } from "@/app/(main)/(common pages)/students/_students comps/main";
import { create } from "zustand";

type visibility = "immediate" | "after_close" | "manual";
type question_type = "mcq";
type selection_type = "single" | "multiple";
type order_Type = "random" | "created";

interface centerTimes {
  center: GradeType;
  open_date: string;
  close_date: string;
  status: string;
}

interface deletedQuestionImage {
  questionId: number | null;
}

interface deletedOptionImage {
  questionId: number | null;
  optionId: number | null;
}

export interface settings {
  timer_minutes: number;
  score_visibility: visibility;
  answers_visibility: visibility;
  question_order: order_Type;
}

export interface choice {
  id: number | null;
  text: string;
  image?: null | string;
  is_correct: boolean;
}

export interface question {
  id: number | null;
  question_type: question_type;
  selection_type: selection_type;
  text: string;
  points: number;
  image?: null | string;
  choices: choice[];
}

export interface quizDetails {
  id: number;
  title: string;
  description: string;
  grade: GradeType;
  center_times: centerTimes[];
  settings: settings;
  questions: question[];
}

interface stateType {
  quizDetails: quizDetails | null;
  selectedQuizId: number | null;
  deletedQuestionImages: deletedQuestionImage[];
  deletedOptionImages: deletedOptionImage[];
  deleteOptionImage: (
    questionId: number | null,
    optionId: number | null,
    questionIndex: number,
    choiceIndex: number
  ) => void;
  deleteQuestionImage: (
    questionId: number | null,
    questionIndex: number
  ) => void;
  setSelectedQuizId: (id: number | null) => void;
  updateQuizDetails: (quiz: quizDetails | null) => void;
  updateInfo: (title?: string, description?: string) => void;
  updateSettings: (settingsUpdate: Partial<settings>) => void;
  addQuestion: () => void;
  deleteQuestion: (index: number) => void;
  moveQuestion: (index: number, direction: "up" | "down") => void;
  editQuestion: (index: number, update: Partial<question>) => void;
  insertQuestion: (index: number, position: "above" | "under") => void;
  deleteQuestionChoice: (questionIndex: number, choiceIndex: number) => void;
  editQuestionChoice: (
    questionIndex: number,
    choiceIndex: number,
    update: Partial<choice>
  ) => void;
  addQuestionChoice: (questionIndex: number) => void;
  setQuestionImage: (questionIndex: number, image: string | null) => void;
  setChoiceImage: (
    questionIndex: number,
    choiceIndex: number,
    image: string | null
  ) => void;
  updateCenterTimes: (centerTimes: centerTimes[]) => void;
  clearStore: () => void;
}

const useQEditStore = create<stateType>((set) => ({
  quizDetails: null,
  selectedQuizId: null,
  deletedQuestionImages: [],
  deletedOptionImages: [],
  deleteOptionImage: (questionId, optionId, questionIndex, choiceIndex) =>
    set((state) => {
      if (!state.quizDetails) return state;

      // Track deleted image
      const newDeletedImages = [
        ...state.deletedOptionImages,
        { questionId, optionId },
      ];

      // Remove image from state
      const newQuestions = state.quizDetails.questions.map((q, idx) => {
        if (idx === questionIndex) {
          const newChoices = q.choices.map((c, cIdx) =>
            cIdx === choiceIndex ? { ...c, image: null } : c
          );
          return { ...q, choices: newChoices };
        }
        return q;
      });

      return {
        quizDetails: {
          ...state.quizDetails,
          questions: newQuestions,
        },
        deletedOptionImages: newDeletedImages,
      };
    }),

  deleteQuestionImage: (questionId, questionIndex) =>
    set((state) => {
      if (!state.quizDetails) return state;

      // Track deleted image
      const newDeletedImages = [...state.deletedQuestionImages, { questionId }];

      // Remove image from state
      const newQuestions = state.quizDetails.questions.map((q, idx) =>
        idx === questionIndex ? { ...q, image: null } : q
      );

      return {
        quizDetails: {
          ...state.quizDetails,
          questions: newQuestions,
        },
        deletedQuestionImages: newDeletedImages,
      };
    }),
  setSelectedQuizId: (id) => set({ selectedQuizId: id }),
  updateQuizDetails: (quiz) => set({ quizDetails: quiz }),
  updateInfo: (title, description) =>
    set((state) => {
      if (!state.quizDetails) return state;
      return {
        quizDetails: {
          ...state.quizDetails,
          title: title !== undefined ? title : state.quizDetails.title,
          description:
            description !== undefined
              ? description
              : state.quizDetails.description,
        },
      };
    }),
  updateSettings: (settingsUpdate) =>
    set((state) => {
      if (!state.quizDetails) return state;
      return {
        quizDetails: {
          ...state.quizDetails,
          settings: { ...state.quizDetails.settings, ...settingsUpdate },
        },
      };
    }),
  addQuestion: () =>
    set((state) => {
      if (!state.quizDetails) return state;
      const newQuestion: question = {
        id: null,
        question_type: "mcq",
        selection_type: "single",
        text: "",
        points: 1,
        image: null,
        choices: [],
      };
      return {
        quizDetails: {
          ...state.quizDetails,
          questions: [...state.quizDetails.questions, newQuestion],
        },
      };
    }),
  deleteQuestion: (index) =>
    set((state) => {
      if (!state.quizDetails) return state;
      const newQuestions = state.quizDetails.questions.filter(
        (_, i) => i !== index
      );
      return {
        quizDetails: {
          ...state.quizDetails,
          questions: newQuestions,
        },
      };
    }),
  moveQuestion: (index, direction) =>
    set((state) => {
      if (!state.quizDetails) return state;
      const questions = [...state.quizDetails.questions];
      if (direction === "up" && index > 0) {
        [questions[index - 1], questions[index]] = [
          questions[index],
          questions[index - 1],
        ];
      } else if (direction === "down" && index < questions.length - 1) {
        [questions[index], questions[index + 1]] = [
          questions[index + 1],
          questions[index],
        ];
      }
      return {
        quizDetails: {
          ...state.quizDetails,
          questions,
        },
      };
    }),
  editQuestion: (index, update) =>
    set((state) => {
      if (!state.quizDetails) return state;
      const newQuestions = state.quizDetails.questions.map((q, i) =>
        i === index ? { ...q, ...update } : q
      );
      return {
        quizDetails: {
          ...state.quizDetails,
          questions: newQuestions,
        },
      };
    }),
  insertQuestion: (index, position) =>
    set((state) => {
      if (!state.quizDetails) return state;
      const newQuestion: question = {
        id: null,
        question_type: "mcq",
        selection_type: "single",
        text: "",
        points: 1,
        image: null,
        choices: [],
      };
      const questions = [...state.quizDetails.questions];
      const insertIndex = position === "above" ? index : index + 1;
      questions.splice(insertIndex, 0, newQuestion);
      return {
        quizDetails: {
          ...state.quizDetails,
          questions,
        },
      };
    }),
  deleteQuestionChoice: (questionIndex, choiceIndex) =>
    set((state) => {
      if (!state.quizDetails) return state;
      const newQuestions = state.quizDetails.questions.map((q, i) => {
        if (i === questionIndex) {
          const newChoices = q.choices.filter((_, j) => j !== choiceIndex);
          return { ...q, choices: newChoices };
        }
        return q;
      });
      return {
        quizDetails: {
          ...state.quizDetails,
          questions: newQuestions,
        },
      };
    }),
  editQuestionChoice: (questionIndex, choiceIndex, update) =>
    set((state) => {
      if (!state.quizDetails) return state;
      const newQuestions = state.quizDetails.questions.map((q, i) => {
        if (i === questionIndex) {
          const newChoices = q.choices.map((c, j) =>
            j === choiceIndex ? { ...c, ...update } : c
          );
          return { ...q, choices: newChoices };
        }
        return q;
      });
      return {
        quizDetails: {
          ...state.quizDetails,
          questions: newQuestions,
        },
      };
    }),
  addQuestionChoice: (questionIndex) =>
    set((state) => {
      if (!state.quizDetails) return state;
      const newChoice: choice = {
        id: null,
        text: "",
        image: null,
        is_correct: false,
      };
      const newQuestions = state.quizDetails.questions.map((q, i) => {
        if (i === questionIndex) {
          return { ...q, choices: [...q.choices, newChoice] };
        }
        return q;
      });
      return {
        quizDetails: {
          ...state.quizDetails,
          questions: newQuestions,
        },
      };
    }),
  setQuestionImage: (questionIndex, image) =>
    set((state) => {
      if (!state.quizDetails) return state;
      const newQuestions = state.quizDetails.questions.map((q, i) =>
        i === questionIndex ? { ...q, image } : q
      );
      return {
        quizDetails: {
          ...state.quizDetails,
          questions: newQuestions,
        },
      };
    }),
  setChoiceImage: (questionIndex, choiceIndex, image) =>
    set((state) => {
      if (!state.quizDetails) return state;
      const newQuestions = state.quizDetails.questions.map((q, i) => {
        if (i === questionIndex) {
          const newChoices = q.choices.map((c, j) =>
            j === choiceIndex ? { ...c, image } : c
          );
          return { ...q, choices: newChoices };
        }
        return q;
      });
      return {
        quizDetails: {
          ...state.quizDetails,
          questions: newQuestions,
        },
      };
    }),
  updateCenterTimes: (centerTimes) =>
    set((state) => {
      if (!state.quizDetails) return state;
      return {
        quizDetails: {
          ...state.quizDetails,
          center_times: centerTimes,
        },
      };
    }),

  clearStore: () =>
    set({
      quizDetails: null,
      selectedQuizId: null,
      deletedQuestionImages: [],
      deletedOptionImages: [],
    }),
}));

export default useQEditStore;
