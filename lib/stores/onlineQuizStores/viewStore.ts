import { create } from "zustand";

type MainView =
  | "dashboard"
  | "create"
  | "submissions"
  | "stuSub_Details"
  | "edit";

interface StateType {
  mainView: MainView;
  updateCurrentMainView: (view: MainView) => void;
}

const useViewStore = create<StateType>((set) => ({
  mainView: "dashboard",

  updateCurrentMainView: (view) => set({ mainView: view }),
}));

export default useViewStore;
