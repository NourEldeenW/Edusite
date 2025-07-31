import { GradeType } from "@/app/(main)/(common pages)/students/_students comps/main";
import { create } from "zustand";

type view = "weeks" | "week_details";

type material_type = "pdf" | "text" | "link" | "image" | "video";

export interface week {
  id: number;
  teacher: number;
  title: string;
  description: string;
  grade: GradeType;
  date_created: string;
}

interface material {
  id: number;
  teacher: number;
  week: number;
  title: string;
  material_type: material_type;
  file_url: string;
  text_content: string;
  external_url: string;
  date_created: string;
  material_type_display: string;
  teacher_details: { id: number; full_name: string };
  week_details: {
    id: number;
    title: string;
    grade: GradeType;
  };
}

interface stateType {
  view: view;
  weeks: week[];
  materials: material[];
  selectedWeek: week | null;
  selectedMaterial: material[] | null;

  setView: (view: view) => void;
  updateWeeks: (weeks: week[]) => void;
  updateMaterials: (materials: material[]) => void;
  updateSelectedWeek: (week: week | null) => void;
  updateSelectedMaterial: (material: material[] | null) => void;
  resetState: () => void;
}

const useStudent_StudyMaterialsStore = create<stateType>((set) => ({
  view: "weeks",
  weeks: [],
  materials: [],
  selectedWeek: null,
  selectedMaterial: null,

  setView: (view: view) => set({ view }),
  updateWeeks: (weeks: week[]) => set({ weeks }),
  updateMaterials: (materials: material[]) => set({ materials }),
  updateSelectedWeek: (week: week | null) => set({ selectedWeek: week }),
  updateSelectedMaterial: (material: material[] | null) =>
    set({ selectedMaterial: material }),
  resetState: () => set({ weeks: [], materials: [] }),
}));

export default useStudent_StudyMaterialsStore;
