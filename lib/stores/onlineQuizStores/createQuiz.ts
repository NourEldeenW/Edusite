import { create } from "zustand";

type visibility = "immediate" | "after_close" | "manual";
type question_type = "mcq";
type selection_type = "single" | "multiple";
type order_Type = "random" | "created";

interface Choice {
  text: string;
  is_correct: boolean;
  image?: string | null;
}

interface Settings {
  timer_minutes: number;
  score_visibility: visibility;
  answers_visibility: visibility;
  question_order: order_Type;
}

export interface Question {
  question_type: question_type;
  selection_type: selection_type;
  text: string;
  points: number;
  choices: Choice[];
  image?: string | null;
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
    answers_visibility?: visibility,
    question_order?: order_Type
  ) => void;
  addQuestion: (question: Question) => void;
  deleteQuestion: (index: number) => void;
  updateQuestions: (questions: Question[]) => void;
  moveQuestion: (index: number, direction: "up" | "down") => void;
  editQuestion: (index: number, updatedFields: Partial<Question>) => void;
  editQuestionChoice: (
    questionIndex: number,
    choiceIndex: number,
    updatedFields: Partial<Choice>
  ) => void;
  addQuestionChoice: (questionIndex: number, newChoice: Choice) => void;
  insertQuestion: (
    question: Question,
    index: number,
    position: "above" | "under"
  ) => void; // <-- NEW
  deleteQuestionChoice: (questionIndex: number, choiceIndex: number) => void;
  setQuestionImage: (questionIndex: number, image: string | null) => void; // <-- NEW
  deleteQuestionImage: (questionIndex: number) => void; // <-- NEW
  setChoiceImage: (
    questionIndex: number,
    choiceIndex: number,
    image: string | null
  ) => void; // <-- NEW
  deleteChoiceImage: (questionIndex: number, choiceIndex: number) => void;
  updateBasicInfo: (
    title?: string,
    description?: string,
    grade_id?: number,
    centers?: Center[]
  ) => void;
  clearQuiz: () => void;
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
    question_order: "created",
    timer_minutes: 0,
    score_visibility: "immediate",
    answers_visibility: "immediate",
  },
};

const useCreateQuizStore = create<StateType>((set) => ({
  createdQuiz: defaultQuiz,

  addQuestion: (question) =>
    set((state) => ({
      createdQuiz: {
        ...state.createdQuiz,
        questions: [...state.createdQuiz.questions, question],
      },
    })),

  deleteQuestion: (index) =>
    set((state) => ({
      createdQuiz: {
        ...state.createdQuiz,
        questions: state.createdQuiz.questions.filter((_, i) => i !== index),
      },
    })),

  updateSettings: (
    settings,
    timer_minutes,
    score_visibility,
    answers_visibility,
    question_order
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
            ...(question_order !== undefined && { question_order }),
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

  moveQuestion: (index, direction) =>
    set((state) => {
      const questions = [...state.createdQuiz.questions];
      if (
        (direction === "up" && index === 0) ||
        (direction === "down" && index === questions.length - 1)
      ) {
        return {}; // No change
      }
      const newIndex = direction === "up" ? index - 1 : index + 1;
      // Swap
      [questions[index], questions[newIndex]] = [
        questions[newIndex],
        questions[index],
      ];
      return {
        createdQuiz: {
          ...state.createdQuiz,
          questions,
        },
      };
    }),

  editQuestion: (index, updatedFields) =>
    set((state) => {
      const questions = [...state.createdQuiz.questions];
      if (index < 0 || index >= questions.length) {
        return {}; // out of bounds, do nothing
      }
      questions[index] = {
        ...questions[index],
        ...updatedFields,
      };
      return {
        createdQuiz: {
          ...state.createdQuiz,
          questions,
        },
      };
    }),

  editQuestionChoice: (questionIndex, choiceIndex, updatedFields) =>
    set((state) => {
      const questions = [...state.createdQuiz.questions];
      if (
        questionIndex < 0 ||
        questionIndex >= questions.length ||
        choiceIndex < 0 ||
        choiceIndex >= questions[questionIndex].choices.length
      ) {
        return {}; // out of bounds
      }
      const question = { ...questions[questionIndex] };
      const choices = [...question.choices];
      choices[choiceIndex] = { ...choices[choiceIndex], ...updatedFields };
      question.choices = choices;
      questions[questionIndex] = question;
      return {
        createdQuiz: {
          ...state.createdQuiz,
          questions,
        },
      };
    }),

  addQuestionChoice: (questionIndex, newChoice) =>
    set((state) => {
      const questions = [...state.createdQuiz.questions];
      if (questionIndex < 0 || questionIndex >= questions.length) {
        return {};
      }
      const question = { ...questions[questionIndex] };
      const choices = [...question.choices, newChoice];
      question.choices = choices;
      questions[questionIndex] = question;
      return {
        createdQuiz: {
          ...state.createdQuiz,
          questions,
        },
      };
    }),

  insertQuestion: (question, index, position) =>
    set((state) => {
      const questions = [...state.createdQuiz.questions];
      let insertIndex = index;
      if (position === "under") {
        insertIndex = index + 1;
      }
      if (insertIndex < 0) insertIndex = 0;
      if (insertIndex > questions.length) insertIndex = questions.length;
      questions.splice(insertIndex, 0, question);
      return {
        createdQuiz: {
          ...state.createdQuiz,
          questions,
        },
      };
    }),

  deleteQuestionChoice: (questionIndex, choiceIndex) =>
    set((state) => {
      const questions = [...state.createdQuiz.questions];
      if (
        questionIndex < 0 ||
        questionIndex >= questions.length ||
        choiceIndex < 0 ||
        choiceIndex >= questions[questionIndex].choices.length
      ) {
        return {}; // out of bounds
      }
      const question = { ...questions[questionIndex] };
      const choices = question.choices.filter((_, i) => i !== choiceIndex);
      question.choices = choices;
      questions[questionIndex] = question;
      return {
        createdQuiz: {
          ...state.createdQuiz,
          questions,
        },
      };
    }),

  setQuestionImage: (questionIndex, image) =>
    set((state) => {
      const questions = [...state.createdQuiz.questions];
      if (questionIndex < 0 || questionIndex >= questions.length) return {};
      const question = { ...questions[questionIndex], image };
      questions[questionIndex] = question;
      return {
        createdQuiz: {
          ...state.createdQuiz,
          questions,
        },
      };
    }),

  deleteQuestionImage: (questionIndex) =>
    set((state) => {
      const questions = [...state.createdQuiz.questions];
      if (questionIndex < 0 || questionIndex >= questions.length) return {};
      const question = { ...questions[questionIndex] };
      delete question.image;
      questions[questionIndex] = question;
      return {
        createdQuiz: {
          ...state.createdQuiz,
          questions,
        },
      };
    }),

  setChoiceImage: (questionIndex, choiceIndex, image) =>
    set((state) => {
      const questions = [...state.createdQuiz.questions];
      if (
        questionIndex < 0 ||
        questionIndex >= questions.length ||
        choiceIndex < 0 ||
        choiceIndex >= questions[questionIndex].choices.length
      ) {
        return {};
      }
      const question = { ...questions[questionIndex] };
      const choices = [...question.choices];
      choices[choiceIndex] = { ...choices[choiceIndex], image };
      question.choices = choices;
      questions[questionIndex] = question;
      return {
        createdQuiz: {
          ...state.createdQuiz,
          questions,
        },
      };
    }),

  deleteChoiceImage: (questionIndex, choiceIndex) =>
    set((state) => {
      const questions = [...state.createdQuiz.questions];
      if (
        questionIndex < 0 ||
        questionIndex >= questions.length ||
        choiceIndex < 0 ||
        choiceIndex >= questions[questionIndex].choices.length
      ) {
        return {};
      }
      const question = { ...questions[questionIndex] };
      const choices = [...question.choices];
      const choice = { ...choices[choiceIndex] };
      delete choice.image;
      choices[choiceIndex] = choice;
      question.choices = choices;
      questions[questionIndex] = question;
      return {
        createdQuiz: {
          ...state.createdQuiz,
          questions,
        },
      };
    }),

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

  clearQuiz: () =>
    set(() => ({
      createdQuiz: {
        ...defaultQuiz,
        basic_info: {
          ...defaultQuiz.basic_info,
          centers: [],
        },
        questions: [],
      },
    })),
}));

export default useCreateQuizStore;
