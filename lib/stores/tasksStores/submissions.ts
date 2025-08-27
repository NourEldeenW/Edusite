import { create } from "zustand";

type status = "not_started" | "in_progress" | "submitted" | "corrected";

interface submission {
  id: number;
  student: {
    id: number;
    student_id: string;
    full_name: string;
    phone_number: string;
    parent_number: string;
    center_name: string;
    center_id: number;
  };
  status: status;
  start_time: string | null;
  end_time: string | null;
  time_taken: string | null;
  score: number | null;
  is_released: boolean;
  corrected_by: string;
}

interface stateType {
  submissions: submission[];

  setSubmissions: (submissions: submission[]) => void;
  addSubmission: (submission: submission) => void;
  deleteSubmission: (id: number) => void;
  updateSubmission: (id: number, updatedSubmission: submission) => void;
}

const useSubmissionsStore = create<stateType>((set) => ({
  submissions: [],

  setSubmissions: (submissions) => set({ submissions }),
  addSubmission: (submission) =>
    set((state) => ({
      submissions: [submission, ...state.submissions],
    })),
  deleteSubmission: (id) =>
    set((state) => ({
      submissions: state.submissions.filter((t) => t.id !== id),
    })),
  updateSubmission: (id, updatedSubmission) =>
    set((state) => ({
      submissions: state.submissions.map((t) =>
        t.id === id ? updatedSubmission : t
      ),
    })),
}));

export default useSubmissionsStore;
