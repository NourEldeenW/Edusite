import { create } from "zustand";

type visibility = "immediate" | "after_close" | "manual" | "n";
type question_type = "mcq";
type selection_type = "single" | "multiple";

interface Choice {
  text: string;
  is_correct: boolean;
}

interface Settings {
  timer_minutes: number;
  score_visibility: visibility;
  answers_visibility: visibility;
}

interface Question {
  question_type: question_type;
  selection_type: selection_type;
  text: string;
  points: number;
  choices: Choice[];
}

export interface Center {
  center_id: number;
  open_date: string;
  close_date: string;
}

interface BasicInfo {
  title: string;
  description: string;
  grade_id: number;
  centers: Center[];
}

interface Quiz {
  basic_info: BasicInfo;
  questions: Question[];
  settings: Settings;
}

interface StateType {
  createdQuiz: Quiz;
  updateSettings: (
    settings?: Settings,
    timer_minutes?: number,
    score_visibility?: visibility,
    answers_visibility?: visibility
  ) => void;
  updateQuestions: (questions: Question[]) => void;
  updateBasicInfo: (
    title?: string,
    description?: string,
    grade_id?: number,
    centers?: Center[]
  ) => void;
}

const defaultQuiz: Quiz = {
  basic_info: {
    title: "",
    description: "",
    grade_id: 0,
    centers: [],
  },
  questions: [],
  settings: {
    timer_minutes: 0,
    score_visibility: "manual",
    answers_visibility: "manual",
  },
};

const useCreateQuizStore = create<StateType>((set) => ({
  createdQuiz: defaultQuiz,

  updateSettings: (
    settings,
    timer_minutes,
    score_visibility,
    answers_visibility
  ) =>
    set((state) => {
      if (settings) {
        return {
          createdQuiz: {
            ...state.createdQuiz,
            settings: settings,
          },
        };
      }

      return {
        createdQuiz: {
          ...state.createdQuiz,
          settings: {
            ...state.createdQuiz.settings,
            ...(timer_minutes !== undefined && { timer_minutes }),
            ...(score_visibility !== undefined && { score_visibility }),
            ...(answers_visibility !== undefined && { answers_visibility }),
          },
        },
      };
    }),

  updateQuestions: (questions) =>
    set((state) => ({
      createdQuiz: {
        ...state.createdQuiz,
        questions: questions,
      },
    })),

  updateBasicInfo: (title, description, grade_id, centers) =>
    set((state) => ({
      createdQuiz: {
        ...state.createdQuiz,
        basic_info: {
          ...state.createdQuiz.basic_info,
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(grade_id !== undefined && { grade_id }),
          ...(centers !== undefined && { centers }),
        },
      },
    })),
}));

export default useCreateQuizStore;
