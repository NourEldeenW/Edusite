import { create } from "zustand";
import { GradeType } from "../student/quizzes/takeQuiz";

interface Task {
  id: number;
  title: string;
  details: string;
  grade_name: string;
  centers: {
    center: GradeType;
    open_date: string;
    close_date: string;
  }[];
  task_content_type: "pdf" | "text";
  submission_policy: "single" | "editable";
  submission_type: "pdf" | "text" | "both";
  max_score: string;
  created_at: string;
}

interface StateType {
  allTasks: Task[];
  availGrades: GradeType[];
  availCenters: GradeType[];

  setAllTasks: (tasks: Task[]) => void;
  setAvailGrades: (grades: GradeType[]) => void;
  setAvailCenters: (centers: GradeType[]) => void;
  addTask: (task: Task) => void;
  deleteTask: (id: number) => void;
}

const useTaskStore = create<StateType>((set) => ({
  allTasks: [],
  availGrades: [],
  availCenters: [],

  setAllTasks: (tasks) => set({ allTasks: tasks }),
  setAvailGrades: (grades) => set({ availGrades: grades }),
  setAvailCenters: (centers) => set({ availCenters: centers }),

  addTask: (task) =>
    set((state) => ({
      allTasks: [task, ...state.allTasks],
    })),

  deleteTask: (id) =>
    set((state) => ({
      allTasks: state.allTasks.filter((t) => t.id !== id),
    })),
}));

export default useTaskStore;
