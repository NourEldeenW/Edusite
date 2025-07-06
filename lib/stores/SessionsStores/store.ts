import { GradeType } from "@/app/(main)/(common pages)/students/_students comps/main";
import { Student } from "@/app/(main)/admin/students/_studentscomp/mainpage";
import { create } from "zustand";

interface StateType {
  availGrades: GradeType[];
  availCenters: GradeType[];
  allStudents: Student[];
  updateStudents: (students: Student[]) => void;
  updateGrades: (grades: GradeType[]) => void;
  updateCenters: (centers: GradeType[]) => void;
}

const useAvail_Grades_CentersStore = create<StateType>((set) => ({
  availGrades: [],
  availCenters: [],
  allStudents: [],
  updateStudents: (students) => set({ allStudents: students }),
  updateGrades: (grades) => set({ availGrades: grades }),
  updateCenters: (centers) => set({ availCenters: centers }),
}));

export default useAvail_Grades_CentersStore;
