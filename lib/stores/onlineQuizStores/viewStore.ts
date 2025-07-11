import { create } from "zustand";

type MainView =
  | "dashboard"
  | "create"
  | "submissions"
  | "stuSub_Details"
  | "quizDetails";
type CreateView = "basicInfo" | "settings" | "questions" | "review";

interface StateType {
  mainView: MainView;
  createView: CreateView;
  updateCurrentMainView: (view: MainView) => void;
  updateCurrentCreateView: (view: CreateView) => void;
}

const useViewStore = create<StateType>((set) => ({
  mainView: "dashboard",
  createView: "basicInfo",

  updateCurrentMainView: (view) => set({ mainView: view }),

  updateCurrentCreateView: (view) => set({ createView: view }),
}));

export default useViewStore;
