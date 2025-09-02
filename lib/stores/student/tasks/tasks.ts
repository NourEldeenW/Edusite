import { GradeType } from "@/app/(main)/(common pages)/students/_students comps/main";
import { create } from "zustand";

type submission_policy = "single";
type availability_status = "Upcoming" | "Open" | "Closed";
type student_submission_status =
  | "Not Started"
  | "In Progress"
  | "Submitted"
  | "corrected";

interface task {
  id: number;
  teacher_name: string;
  grade_name: string;
  title: string;
  details: string;
  submission_policy: submission_policy;
  timer_minutes: number;
  max_score: number | null;
  created_at: string;
  center_schedule: {
    center: GradeType;
    open_date: string;
    close_date: string;
  };
  student_submission_status: student_submission_status;
  submission_id: number | null;
  availability_status: availability_status;
  is_graded: boolean;
  grade: number | null;
}

interface stateType {
  tasks: task[];

  setTasks: (tasks: task[]) => void;
}

const useTasksStu = create<stateType>((set) => ({
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
}));

export default useTasksStu;
