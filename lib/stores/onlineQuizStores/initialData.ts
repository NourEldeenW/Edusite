import { create } from "zustand";
import { GradeType } from "@/app/(main)/(common pages)/students/_students comps/main";

type status = "open" | "closed" | "upcoming" | "Not Assigned";

interface CenterTime {
  center: GradeType;
  open_date: string;
  close_date: string;
  status: status;
}

interface Quiz {
  id: number;
  grade: GradeType;
  title: string;
  description: string;
  created_at: string;
  center_times: CenterTime[];
  question_count: number;
}

interface StateType {
  access: string | null;
  availCenters: GradeType[];
  availGrades: GradeType[];
  allQuizzes: Quiz[];
  updateAccess: (access: string) => void;
  updateGrades: (grades: GradeType[]) => void;
  updateCenters: (centers: GradeType[]) => void;
  updateQuizzes: (quizzes: Quiz[]) => void;
  deleteQuiz: (id: number) => void;
  addQuiz: (quiz: Quiz) => void;
  updateQuiz: (quiz: Quiz) => void;
}

const useQuizStore_initial = create<StateType>((set) => ({
  access: null,
  availCenters: [],
  availGrades: [],
  allQuizzes: [],

  updateAccess: (access) => set({ access: access }),

  updateGrades: (grades) => set({ availGrades: grades }),

  updateCenters: (centers) => set({ availCenters: centers }),

  updateQuizzes: (quizzes) => set({ allQuizzes: quizzes }),

  deleteQuiz: (id) =>
    set((state) => ({
      allQuizzes: state.allQuizzes.filter((quiz) => quiz.id !== id),
    })),

  addQuiz: (quiz) =>
    set((state) => ({
      allQuizzes: [...state.allQuizzes, quiz],
    })),

  updateQuiz: (updatedQuiz) =>
    set((state) => ({
      allQuizzes: state.allQuizzes.map((quiz) =>
        quiz.id === updatedQuiz.id ? updatedQuiz : quiz
      ),
    })),
}));

export default useQuizStore_initial;
