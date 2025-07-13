import { GradeType } from "@/app/(main)/(common pages)/students/_students comps/main";
import { create } from "zustand";

export interface SessionType {
  id: number;
  date: string;
  title: string;
  notes: string;
  grade: GradeType;
  center: GradeType;
  teacher_name: string;
  created_at: string;
  students: [
    {
      id: number;
      full_name: string;
      student_id: string;
      center_id: number;
      center_name: string;
      is_approved: boolean;
    }
  ];
  has_homework: boolean;
  has_test: boolean;
}

interface StateType {
  allSessions: SessionType[];
  updateSessions: (sessions: SessionType[]) => void;
  deleteSession: (id: number) => void;
  addSession: (session: SessionType) => void;
}

const useSessionsStore = create<StateType>((set) => ({
  allSessions: [],
  updateSessions: (sessions) => set({ allSessions: sessions }),
  addSession: (session) =>
    set((state) => ({
      allSessions: [...state.allSessions, session],
    })),
  deleteSession: (id) =>
    set((state) => ({
      allSessions: state.allSessions.filter((session) => session.id !== id),
    })),
}));

export default useSessionsStore;
