"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion"; // Added Framer Motion import
import { api } from "@/lib/axiosinterceptor";
import { Student } from "./mainpage";
import { CheckCircle, XCircle, Search, Filter, X } from "lucide-react";

const djangoapi = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;

interface TeacherStudents {
  total_students: number;
  active_students: number;
  inactive_students: number;
  students_data: Student[];
}

interface Teacher {
  id: number;
  full_name: string;
  phone_number: string;
  gender: string;
  user: string;
  subject: { id: number; name: "string" };
  grades: [];
  students: TeacherStudents;
}

interface propstype {
  triggerRefresh: () => void;
  access: string;
  refkey: number;
}

export default function StudentsTable({
  access,
  triggerRefresh,
  refkey,
}: propstype) {
  const [activefilterbtn, setActivefilterbtn] = useState({ filtertype: "all" });
  const [searchtext, setSearchtext] = useState("");
  const [fetchedteachersdata, setFetchedteachersdata] = useState<Teacher[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [studentSearches, setStudentSearches] = useState<{
    [key: number]: string;
  }>({});
  const [studentFilters, setStudentFilters] = useState<{
    [key: number]: { center: string; grade: string };
  }>({});
  const [isLoading, setIsLoading] = useState(true);

  const [isActionOpen, setIsActionOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "disapprove">(
    "approve"
  );
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [agreeField, setAgreeField] = useState("");
  const [isActionError, setIsActionError] = useState(false);
  const [isActionSuccess, setIsActionSuccess] = useState(false);
  const [actionBtnDisabled, setActionBtnDisabled] = useState(false);

  const handleBulkStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionBtnDisabled(true);

    try {
      await api.post(
        `${djangoapi}accounts/students/approve/`,
        {
          student_ids: selectedStudents.map((s) => s.id),
          is_approved: actionType === "approve",
        },
        {
          headers: { Authorization: `Bearer ${access}` },
        }
      );

      setIsActionSuccess(true);
      setIsActionError(false);
      triggerRefresh();
    } catch (e) {
      console.log(e);
      setIsActionError(true);
      setActionBtnDisabled(false);
    }
  };

  const getSelectionStatus = (students: Student[]) => {
    const selected = students.filter((student) =>
      selectedStudentIds.includes(student.id)
    );
    if (selected.length === 0) return null;
    const allActive = selected.every((s) => s.is_approved);
    const allInactive = selected.every((s) => !s.is_approved);
    return {
      count: selected.length,
      allActive,
      allInactive,
      isMixed: !allActive && !allInactive,
    };
  };

  useEffect(() => {
    const fetchteacherdata = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`${djangoapi}accounts/teachers/`, {
          headers: { Authorization: `Bearer ${access}` },
        });
        setFetchedteachersdata(res.data);
      } catch {
        setFetchedteachersdata([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchteacherdata();
  }, [access, refkey]);

  const filteredTeachers = (() => {
    if (isLoading) return [];

    const normalizedSearch = searchtext
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

    if (!normalizedSearch) {
      return fetchedteachersdata.sort((a, b) => {
        const aHasFilteredStudents = a.students.students_data.some(
          (student) => {
            if (activefilterbtn.filtertype === "all") return true;
            return activefilterbtn.filtertype === "active"
              ? student.is_approved
              : !student.is_approved;
          }
        );

        const bHasFilteredStudents = b.students.students_data.some(
          (student) => {
            if (activefilterbtn.filtertype === "all") return true;
            return activefilterbtn.filtertype === "active"
              ? student.is_approved
              : !student.is_approved;
          }
        );

        if (aHasFilteredStudents && !bHasFilteredStudents) return -1;
        if (!aHasFilteredStudents && bHasFilteredStudents) return 1;

        return a.full_name.localeCompare(b.full_name);
      });
    }

    const searchWords = normalizedSearch.split(" ");
    const searchTerms = searchWords.filter((term) => term.length > 0);

    const scoreTeacher = (teacher: Teacher) => {
      const centers = new Set<string>();
      const grades = new Set<string>();
      teacher.students.students_data.forEach((student) => {
        centers.add(student.center.name.toLowerCase());
        grades.add(student.grade.name.toLowerCase());
      });
      const teacherCenters = Array.from(centers).sort().join(" ");
      const teacherGrades = Array.from(grades).sort().join(" ");
      const combinedString = `${teacher.full_name.toLowerCase()} ${teacherCenters} ${teacherGrades}`;

      if (combinedString === normalizedSearch) return 100;
      if (combinedString.startsWith(normalizedSearch)) return 90;

      let score = 0;
      let allWordsMatch = true;
      let consecutiveMatch = 0;
      let maxConsecutive = 0;

      for (let i = 0; i < searchTerms.length; i++) {
        const term = searchTerms[i];
        const termInName = combinedString.includes(term);

        if (termInName) {
          const position = combinedString.indexOf(term);
          score += 10 - Math.min(9, Math.floor(position / 10));

          const isFullWord = new RegExp(`\\b${term}\\b`).test(combinedString);
          if (isFullWord) score += 5;

          consecutiveMatch++;
          maxConsecutive = Math.max(maxConsecutive, consecutiveMatch);
        } else {
          allWordsMatch = false;
          consecutiveMatch = 0;
        }
      }

      if (consecutiveMatch === searchTerms.length) score += 20;
      if (allWordsMatch) score += 15;

      const inOrder = new RegExp(searchTerms.join(".*?")).test(combinedString);
      if (inOrder) score += 10;

      return score;
    };

    const scoredTeachers = fetchedteachersdata.map((teacher) => ({
      teacher,
      score: scoreTeacher(teacher),
    }));

    const filtered = scoredTeachers.filter(({ score }) => score > 0);

    return filtered
      .sort((a, b) => b.score - a.score)
      .map((item) => item.teacher)
      .sort((a, b) => {
        const aHasFilteredStudents = a.students.students_data.some(
          (student) => {
            if (activefilterbtn.filtertype === "all") return true;
            return activefilterbtn.filtertype === "active"
              ? student.is_approved
              : !student.is_approved;
          }
        );

        const bHasFilteredStudents = b.students.students_data.some(
          (student) => {
            if (activefilterbtn.filtertype === "all") return true;
            return activefilterbtn.filtertype === "active"
              ? student.is_approved
              : !student.is_approved;
          }
        );

        if (aHasFilteredStudents && !bHasFilteredStudents) return -1;
        if (!aHasFilteredStudents && bHasFilteredStudents) return 1;

        return a.full_name.localeCompare(b.full_name);
      });
  })();

  // Handle student search per teacher
  const handleStudentSearchChange = (teacherId: number, value: string) => {
    setStudentSearches((prev) => ({ ...prev, [teacherId]: value }));
  };

  // Handle student filter per teacher
  const handleStudentFilterChange = (
    teacherId: number,
    type: "center" | "grade",
    value: string
  ) => {
    setStudentFilters((prev) => ({
      ...prev,
      [teacherId]: {
        ...(prev[teacherId] || { center: "", grade: "" }),
        [type]: value,
      },
    }));
  };

  // Reset all student filters for a teacher
  const resetStudentFilters = (teacherId: number) => {
    setStudentSearches((prev) => ({ ...prev, [teacherId]: "" }));
    setStudentFilters((prev) => ({
      ...prev,
      [teacherId]: { center: "all", grade: "all" },
    }));
  };

  // Get unique centers and grades for a teacher's students
  const getUniqueOptions = (teacher: Teacher) => {
    const centers = new Set<string>();
    const grades = new Set<string>();

    teacher.students.students_data.forEach((student) => {
      centers.add(student.center.name);
      grades.add(student.grade.name);
    });

    return {
      centers: Array.from(centers).sort(),
      grades: Array.from(grades).sort(),
    };
  };

  // Reset main search and filters
  const resetMainSearch = () => {
    setSearchtext("");
    setActivefilterbtn({ filtertype: "all" });
  };

  return (
    <>
      <div className="max-w-full mx-auto">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <input
                placeholder="Search teachers, centers, or grades..."
                value={searchtext}
                onChange={(e) => setSearchtext(e.target.value)}
                type="text"
                className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow duration-200 placeholder-gray-500"
              />
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              {searchtext && (
                <button
                  onClick={resetMainSearch}
                  className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={20} />
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              data-active={activefilterbtn.filtertype === "all"}
              onClick={() => setActivefilterbtn({ filtertype: "all" })}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium data-[active=true]:bg-indigo-600 data-[active=true]:text-white data-[active=true]:border-indigo-600 hover:bg-gray-50 transition-colors duration-200 shadow-sm">
              All
            </button>
            <button
              data-active={activefilterbtn.filtertype === "active"}
              onClick={() => setActivefilterbtn({ filtertype: "active" })}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium data-[active=true]:bg-indigo-600 data-[active=true]:text-white data-[active=true]:border-indigo-600 hover:bg-gray-50 transition-colors duration-200 shadow-sm">
              Active
            </button>
            <button
              data-active={activefilterbtn.filtertype === "inactive"}
              onClick={() => setActivefilterbtn({ filtertype: "inactive" })}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium data-[active=true]:bg-indigo-600 data-[active=true]:text-white data-[active=true]:border-indigo-600 hover:bg-gray-50 transition-colors duration-200 shadow-sm">
              Inactive
            </button>
          </div>
        </div>

        {isLoading ? (
          // Skeleton loader while data is loading
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-lg">
              <div className="animate-pulse">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-64"></div>
                    <div className="h-4 bg-gray-200 rounded w-40"></div>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <div className="h-8 bg-gray-200 rounded-full w-24"></div>
                    <div className="h-8 bg-gray-200 rounded-full w-24"></div>
                    <div className="h-8 bg-gray-200 rounded-full w-24"></div>
                  </div>
                </div>

                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="h-12 bg-gray-200 rounded-lg"></div>
                  <div className="h-12 bg-gray-200 rounded-lg"></div>
                  <div className="h-12 bg-gray-200 rounded-lg"></div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <th
                            key={i}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Array.from({ length: 5 }).map((_, rowIndex) => (
                        <tr key={rowIndex}>
                          {Array.from({ length: 5 }).map((_, cellIndex) => (
                            <td key={cellIndex} className="px-6 py-4">
                              <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))
        ) : filteredTeachers.length === 0 ? (
          // No results found UI
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="mx-auto max-w-md">
              <Search className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No teachers found
              </h3>
              <p className="mt-2 text-gray-500">
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={resetMainSearch}
                className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Reset Search & Filters
              </button>
            </div>
          </div>
        ) : (
          // Actual teacher data with scrolling animations
          filteredTeachers.map((teacher) => {
            const { centers, grades } = getUniqueOptions(teacher);
            const studentSearchText = studentSearches[teacher.id] || "";
            const studentFilter = studentFilters[teacher.id] || {
              center: "all",
              grade: "all",
            };

            const filteredStudents = teacher.students.students_data.filter(
              (student) => {
                // Apply global status filter
                if (activefilterbtn.filtertype !== "all") {
                  if (
                    activefilterbtn.filtertype === "active" &&
                    !student.is_approved
                  )
                    return false;
                  if (
                    activefilterbtn.filtertype === "inactive" &&
                    student.is_approved
                  )
                    return false;
                }

                // Apply student-specific search
                if (studentSearchText) {
                  const normalizedSearch = studentSearchText
                    .toLowerCase()
                    .replace(/\s+/g, " ")
                    .trim();
                  const searchTerms = normalizedSearch.split(" ");

                  const studentName = student.full_name.toLowerCase();
                  const centerName = student.center.name.toLowerCase();
                  const gradeName = student.grade.name.toLowerCase();

                  const matchesSearch = searchTerms.every(
                    (term) =>
                      studentName.includes(term) ||
                      centerName.includes(term) ||
                      gradeName.includes(term)
                  );

                  if (!matchesSearch) return false;
                }

                // Apply center filter
                if (studentFilter.center && studentFilter.center !== "all") {
                  if (student.center.name !== studentFilter.center)
                    return false;
                }

                // Apply grade filter
                if (studentFilter.grade && studentFilter.grade !== "all") {
                  if (student.grade.name !== studentFilter.grade) return false;
                }

                return true;
              }
            );

            const selectionStatus = getSelectionStatus(
              teacher.students.students_data
            );

            const hasFiltersApplied =
              studentSearchText ||
              studentFilter.center !== "all" ||
              studentFilter.grade !== "all";

            return (
              <motion.div
                key={teacher.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-lg hover:shadow-xl transition-shadow duration-200 relative">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {teacher.full_name}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {teacher.subject.name} Teacher
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="bg-gray-100 px-3 py-1 rounded-full">
                      Total: {teacher.students.total_students}
                    </span>
                    <span className="bg-green-100 px-3 py-1 rounded-full text-green-800">
                      Active: {teacher.students.active_students}
                    </span>
                    <span className="bg-red-100 px-3 py-1 rounded-full text-red-800">
                      Inactive: {teacher.students.inactive_students}
                    </span>
                  </div>
                </div>

                {/* Student search and filters */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <input
                      placeholder="Search students..."
                      value={studentSearchText}
                      onChange={(e) =>
                        handleStudentSearchChange(teacher.id, e.target.value)
                      }
                      type="text"
                      className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow duration-200 placeholder-gray-500"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    {studentSearchText && (
                      <button
                        onClick={() =>
                          handleStudentSearchChange(teacher.id, "")
                        }
                        className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <select
                      value={studentFilter.center || "all"}
                      onChange={(e) =>
                        handleStudentFilterChange(
                          teacher.id,
                          "center",
                          e.target.value
                        )
                      }
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none">
                      <option value="all">All Centers</option>
                      {centers.map((center) => (
                        <option key={center} value={center}>
                          {center}
                        </option>
                      ))}
                    </select>
                    <div className="absolute left-3 top-2.5 h-5 w-5 text-gray-400">
                      <Filter size={20} />
                    </div>
                  </div>

                  <div className="relative">
                    <select
                      value={studentFilter.grade || "all"}
                      onChange={(e) =>
                        handleStudentFilterChange(
                          teacher.id,
                          "grade",
                          e.target.value
                        )
                      }
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none">
                      <option value="all">All Grades</option>
                      {grades.map((grade) => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </select>
                    <div className="absolute left-3 top-2.5 h-5 w-5 text-gray-400">
                      <Filter size={20} />
                    </div>
                  </div>
                </div>

                {/* Reset filters button */}
                {hasFiltersApplied && (
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={() => resetStudentFilters(teacher.id)}
                      className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors">
                      <X size={14} className="mr-1" />
                      Reset filters
                    </button>
                  </div>
                )}

                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            checked={
                              filteredStudents.length > 0 &&
                              filteredStudents.every((student) =>
                                selectedStudentIds.includes(student.id)
                              )
                            }
                            onChange={() => {
                              if (filteredStudents.length === 0) return;
                              const currentStudentIds = filteredStudents.map(
                                (student) => student.id
                              );
                              const allSelected = currentStudentIds.every(
                                (id) => selectedStudentIds.includes(id)
                              );
                              if (allSelected) {
                                setSelectedStudentIds((prev) =>
                                  prev.filter(
                                    (id) => !currentStudentIds.includes(id)
                                  )
                                );
                              } else {
                                setSelectedStudentIds((prev) => [
                                  ...prev,
                                  ...currentStudentIds.filter(
                                    (id) => !prev.includes(id)
                                  ),
                                ]);
                              }
                            }}
                            disabled={filteredStudents.length === 0}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                          Student Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Grade
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Center
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-4 text-sm text-gray-500 text-center">
                            <div className="py-6">
                              <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <h3 className="mt-2 text-sm font-medium text-gray-900">
                                No students found
                              </h3>
                              <p className="mt-1 text-sm text-gray-500">
                                Try adjusting your search or filter criteria
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((student) => (
                          <tr
                            key={student.id}
                            className="hover:bg-gray-50 transition-colors duration-200">
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={selectedStudentIds.includes(
                                  student.id
                                )}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedStudentIds((prev) => [
                                      ...prev,
                                      student.id,
                                    ]);
                                  } else {
                                    setSelectedStudentIds((prev) =>
                                      prev.filter((id) => id !== student.id)
                                    );
                                  }
                                }}
                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                              />
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {student.full_name}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {student.grade.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {student.center.name}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  student.is_approved
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}>
                                {student.is_approved ? "Active" : "Inactive"}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {filteredStudents.length > 0 && (
                  <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-gray-600">
                      Showing {filteredStudents.length} of{" "}
                      {teacher.students.total_students} students
                    </div>
                    {selectionStatus?.count && (
                      <button
                        onClick={() => {
                          const selectedStudents =
                            teacher.students.students_data.filter((student) =>
                              selectedStudentIds.includes(student.id)
                            );
                          setSelectedStudents(selectedStudents);
                          setActionType(
                            selectionStatus.allActive ? "disapprove" : "approve"
                          );
                          setIsActionOpen(true);
                          setIsActionError(false);
                          setIsActionSuccess(false);
                          setAgreeField("");
                        }}
                        disabled={selectionStatus.isMixed}
                        title={
                          selectionStatus.isMixed
                            ? "Can't perform action on mixed status selection"
                            : undefined
                        }
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors duration-200 shadow-sm ${
                          selectionStatus.isMixed
                            ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                            : selectionStatus.allActive
                            ? "bg-red-600 border-red-600 text-white hover:bg-red-700"
                            : "bg-green-600 border-green-600 text-white hover:bg-green-700"
                        }`}>
                        {selectionStatus.allActive
                          ? `Deactivate ${selectionStatus.count} Student(s)`
                          : selectionStatus.allInactive
                          ? `Activate ${selectionStatus.count} Student(s)`
                          : "Mixed Selection"}
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
      {isActionOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center animate-fade-in">
          <div className="bg-bg-secondary p-6 rounded-xl w-full max-w-md relative border border-border-default shadow-2xl transform transition-all duration-300 hover:shadow-2xl hover:scale-[1.005]">
            <h3 className="text-lg font-bold mb-4 text-text-primary">
              {actionType === "approve" ? "Approve" : "Deactivate"}{" "}
              {selectedStudents.length} student(s)?
            </h3>

            <form className="space-y-4" onSubmit={handleBulkStatusChange}>
              <div className="group">
                <label className="block text-sm font-medium mb-1 text-text-primary">
                  Type &apos;agree&apos; to confirm:
                </label>
                <input
                  autoComplete="off"
                  autoSave="off"
                  type="text"
                  value={agreeField}
                  onChange={(e) => setAgreeField(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border bg-bg-primary transition-all duration-200 ${
                    isActionError
                      ? "border-error focus:ring-error/20"
                      : "border-border-default focus:ring-primary/20"
                  }`}
                  required
                />
              </div>

              {isActionError && (
                <div className="flex items-center gap-2 rounded-lg bg-error/10 px-4 py-3">
                  <svg
                    className="h-5 w-5 shrink-0 text-error"
                    viewBox="0 0 20 20"
                    fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-medium text-error">
                    Error updating student statuses
                  </span>
                </div>
              )}

              {isActionSuccess && (
                <div className="flex items-center gap-2 rounded-lg bg-success/10 px-4 py-3">
                  <svg
                    className="h-5 w-5 shrink-0 text-success"
                    viewBox="0 0 20 20"
                    fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-medium text-success">
                    Students updated successfully
                  </span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6 border-t border-border-default">
                <button
                  type="button"
                  onClick={() => {
                    setIsActionOpen(false);
                    setIsActionError(false);
                    setIsActionSuccess(false);
                    setAgreeField("");
                    setActionBtnDisabled(false);
                  }}
                  className="px-5 py-2 text-text-secondary hover:bg-bg-primary/50 rounded-lg transition-colors duration-200 shadow-sm border border-border-default">
                  Cancel
                </button>
                <button
                  disabled={
                    actionBtnDisabled || agreeField.toLowerCase() !== "agree"
                  }
                  type="submit"
                  className={`px-5 py-2 text-button-text rounded-lg shadow-sm transition-all duration-200 flex items-center gap-2 ${
                    isActionSuccess
                      ? ""
                      : actionType === "approve"
                      ? "bg-success hover:bg-success-hover"
                      : "bg-error hover:bg-error-hover"
                  } ${
                    actionBtnDisabled
                      ? "hover:cursor-not-allowed bg-disabled"
                      : "hover:cursor-pointer"
                  }`}>
                  {isActionSuccess ? (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Success!
                    </>
                  ) : isActionError ? (
                    <>
                      <XCircle className="h-5 w-5" />
                      Try Again
                    </>
                  ) : actionType === "approve" ? (
                    "Approve Students"
                  ) : (
                    "Deactivate Students"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
