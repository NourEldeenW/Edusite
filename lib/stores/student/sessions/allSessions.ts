import { create } from "zustand";

interface session {
  id: number;
  date: string;
  title: string;
  notes: string;
  teacher_name: string;
  grade_name: string;
  center_name: string;
  has_homework: boolean;
  has_test: boolean;
  test_max_score: number | null;
  attendance_status: "present" | "absent";
  homework: {
    completed: boolean;
    notes: string;
  };
  test_score: {
    score: number;
    max_score: number;
    percentage: number;
    notes: string;
  };
}

interface data {
  stats: {
    total_sessions_number: number;
    total_sessions_attended: number;
    total_absent: number;
    average_attendance: number;
  };
  sessions: session[];
}

interface stateType {
  allData: data;
  updateAllData: (data: data) => void;
  resetAllData: () => void;
}

const useAllSessions_Stu = create<stateType>((set) => ({
  allData: {} as data,
  updateAllData: (data: data) => set({ allData: data }),
  resetAllData: () => set({ allData: {} as data }),
}));

export default useAllSessions_Stu;
