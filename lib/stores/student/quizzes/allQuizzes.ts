import { GradeType } from "@/app/(main)/(common pages)/students/_students comps/main";
import { create } from "zustand";

type centerStatus = "upcoming" | "open" | "closed";

type quizStatus = "not_started" | "in_progress" | "submitted";

interface quiz {
  id: number;
  title: string;
  description: string;
  created_at: string;
  grade: GradeType;
  center_times: [
    {
      center: GradeType;
      open_date: string;
      close_date: string;
      status: centerStatus;
    }
  ];
  question_count: number;
  student_quiz_status: quizStatus;
  submission_id?: number;
}

interface stateType {
  allQuizzes: quiz[];

  updateAllQuizzes: (quizzes: quiz[]) => void;
}

const useAllQuizzes = create<stateType>((set) => ({
  allQuizzes: [],

  updateAllQuizzes(quizzes: quiz[]) {
    set({ allQuizzes: quizzes });
  },
}));

export default useAllQuizzes;
