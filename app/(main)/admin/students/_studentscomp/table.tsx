"use client";
import { useState, useEffect } from "react";

import axios from "axios";
import { Student } from "./mainpage";
import { CheckCircle, XCircle } from "lucide-react";

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
      await axios.post(
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
      try {
        const res = await axios.get(`${djangoapi}accounts/teachers/`, {
          headers: { Authorization: `Bearer ${access}` },
        });
        setFetchedteachersdata(res.data);
      } catch {
        setFetchedteachersdata([]);
      }
    };
    fetchteacherdata();
  }, [access, refkey]);

  const filteredTeachers = (() => {
    const normalizedSearch = searchtext
      .toLowerCase()
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .trim();

    // If empty search, return all teachers with sorting applied
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

    // Split search into individual words
    const searchWords = normalizedSearch.split(" ");
    const searchTerms = searchWords.filter((term) => term.length > 0);

    // Scoring system for better matching
    const scoreTeacher = (teacher: Teacher) => {
      const lowerName = teacher.full_name.toLowerCase();
      let score = 0;

      // Exact match bonus
      if (lowerName === normalizedSearch) return 100;

      // Start with bonus
      if (lowerName.startsWith(normalizedSearch)) return 90;

      // Word-based matching
      let allWordsMatch = true;
      let consecutiveMatch = 0;
      let maxConsecutive = 0;

      for (let i = 0; i < searchTerms.length; i++) {
        const term = searchTerms[i];
        const termInName = lowerName.includes(term);

        if (termInName) {
          // Position bonus - earlier matches are better
          const position = lowerName.indexOf(term);
          score += 10 - Math.min(9, Math.floor(position / 10));

          // Full word match bonus
          const isFullWord = new RegExp(`\\b${term}\\b`).test(lowerName);
          if (isFullWord) score += 5;

          consecutiveMatch++;
          maxConsecutive = Math.max(maxConsecutive, consecutiveMatch);
        } else {
          allWordsMatch = false;
          consecutiveMatch = 0;
        }
      }

      // Consecutive matches bonus
      if (consecutiveMatch === searchTerms.length) score += 20;

      // All words match bonus
      if (allWordsMatch) score += 15;

      // Order bonus - matches in original order
      const inOrder = new RegExp(searchTerms.join(".*?")).test(lowerName);
      if (inOrder) score += 10;

      return score;
    };

    // Create scored teachers array
    const scoredTeachers = fetchedteachersdata.map((teacher) => ({
      teacher,
      score: scoreTeacher(teacher),
    }));

    // Filter out teachers with no matches
    const filtered = scoredTeachers.filter(({ score }) => score > 0);

    // Sort by match quality (score) first, then by your custom sorting
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

  return (
    <>
      <div className="max-w-full mx-auto">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <input
                placeholder="Search teachers..."
                onChange={(e) => setSearchtext(e.target.value)}
                type="text"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow duration-200 placeholder-gray-500"
              />
              <svg
                className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
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

        {filteredTeachers.map((teacher) => {
          const filteredStudents = teacher.students.students_data.filter(
            (student) => {
              if (activefilterbtn.filtertype === "all") return true;
              return activefilterbtn.filtertype === "active"
                ? student.is_approved
                : !student.is_approved;
            }
          );

          const selectionStatus = getSelectionStatus(
            teacher.students.students_data
          );

          return (
            <div
              className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-lg hover:shadow-xl transition-shadow duration-200 relative"
              key={teacher.id}>
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
                            const allSelected = currentStudentIds.every((id) =>
                              selectedStudentIds.includes(id)
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
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
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
                              checked={selectedStudentIds.includes(student.id)}
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
              {selectionStatus?.count && (
                <div className="mt-4 flex justify-end">
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
                </div>
              )}
            </div>
          );
        })}
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
                      : "border-border-default focus:border-primary focus:ring-primary/20"
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
