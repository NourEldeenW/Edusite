import { GradeType } from "@/app/(main)/(common pages)/students/_students comps/main";
import { create } from "zustand";

type submission_status = "Not Started" | "In Progress" | "Finished";

export interface submission {
  id: number; // submission ID
  student: number; // Student ID
  student_name: string;
  phone_number: string;
  parent_phone_number: string;
  center: GradeType;
  start_time: string;
  end_time: string;
  score: number;
  is_submitted: boolean;
  time_taken: number;
  is_score_released: boolean;
  are_answers_released: boolean;
  submission_status: submission_status;
}

interface stateType {
  selectedQuizId: number | null;
  submissions: submission[];

  setSelectedQuizId: (id: number | null) => void;
  updateSubmissions: (submissions: submission[]) => void;
}

const useSubmissionsStore = create<stateType>((set) => ({
  selectedQuizId: null,
  submissions: [],

  setSelectedQuizId: (id) => set({ selectedQuizId: id }),
  updateSubmissions: (submissions) => set({ submissions }),
}));

export default useSubmissionsStore;
