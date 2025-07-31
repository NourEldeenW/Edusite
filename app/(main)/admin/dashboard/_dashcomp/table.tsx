"use client";
import { api } from "@/lib/axiosinterceptor";
import {
  Search,
  Edit,
  Trash2,
  User,
  UsersRound,
  AlertCircle,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
} from "lucide-react";
import { useEffect, useMemo, useCallback, useState, useRef, JSX } from "react";

const djangoapi = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;

interface ListItem {
  name: string;
  id: string;
}

interface TeacherDetail {
  id: number;
  full_name: string;
  phone_number: string;
  gender: string;
  user: string;
  subject: ListItem;
  grades: number[];
  brand?: string;
}

interface Teacher {
  id: number;
  full_name: string;
  active_students: string;
  inactive_students: string;
  assistants_count: string;
}

interface TeacherProps {
  teachers?: Teacher[];
  triggerRefresh: () => void;
  access: string | null;
}

export default function TeachersTable({
  teachers = [],
  triggerRefresh,
  access,
}: TeacherProps) {
  // State Management
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [deletedName, setDeletedName] = useState("");
  const [editedNameId, setEditedNameId] = useState({ ename: "", eid: 0 });
  const [deletedId, setDeletedId] = useState<number | null>(null);
  const [agreeField, setAgreeField] = useState("");
  const [deleteBtnDisabled, setDeleteBtnDisabled] = useState(false);
  const [teacherFetchedData, setTeacherFetchedData] =
    useState<TeacherDetail | null>(null);
  const [gradesData, setGradesData] = useState<ListItem[]>([]);
  const [subjectsData, setSubjectsData] = useState<ListItem[]>([]);
  const [isEdited, setIsEdited] = useState(false);
  const [isErrorEdit, setIsErrorEdit] = useState(false);
  const [getData, setGetData] = useState(0);
  const [isFetching, setIsFetching] = useState(false);

  // Prevent multiple re-renders for modals
  const isMounted = useRef(false);

  // Debounced Search for performance
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
      debounceTimeout.current = setTimeout(() => {
        setSearchQuery(value);
      }, 180);
    },
    []
  );

  const activateGetData = useCallback(() => {
    setGetData((prev) => prev + 1);
  }, []);

  // Memoized Filtering (optimized)
  const filteredTeachers = useMemo(() => {
    if (!teachers.length) return [];

    const normalizedQuery = searchQuery
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

    if (!normalizedQuery) {
      return [...teachers].sort((a, b) =>
        a.full_name.localeCompare(b.full_name)
      );
    }

    const searchTerms = normalizedQuery.split(/\s+/);

    // Precompute lower names
    const teachersWithLower = teachers.map((t) => ({
      ...t,
      lowerName: t.full_name.toLowerCase(),
    }));

    return teachersWithLower
      .filter((teacher) => {
        // 1. Exact start match
        if (teacher.lowerName.startsWith(normalizedQuery)) return true;

        // 2. Sequential term match
        let currentIndex = 0;
        for (const term of searchTerms) {
          const termIndex = teacher.lowerName.indexOf(term, currentIndex);
          if (termIndex === -1) break;
          currentIndex = termIndex + term.length;
        }
        if (currentIndex > 0) return true;

        // 3. All terms present
        return searchTerms.every((term) => teacher.lowerName.includes(term));
      })
      .sort((a, b) => a.full_name.localeCompare(b.full_name));
  }, [teachers, searchQuery]);

  // Delete Handler
  const submitDelete = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (agreeField !== "agree") {
        setIsError(true);
        return;
      }

      try {
        await api.delete(`${djangoapi}accounts/teachers/${deletedId}/`, {
          headers: { Authorization: `Bearer ${access}` },
        });
        triggerRefresh();
        setIsDeleted(true);
        setDeleteBtnDisabled(true);
      } catch {
        setIsError(true);
      }
    },
    [deletedId, agreeField, access, triggerRefresh]
  );

  // Edit Handler
  const handleSubmitEdit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!teacherFetchedData) return;

      setIsErrorEdit(false);
      setIsEdited(false);

      const formData = new FormData(e.currentTarget);
      const payload: Record<string, unknown> = {};

      // helper to only add if value is non-empty
      const addIf = (key: string, value: FormDataEntryValue | null) => {
        if (typeof value === "string") {
          const v = value.trim();
          if (v !== "") payload[key] = v;
        } else if (value instanceof File && value.size > 0) {
          payload[key] = value;
        }
      };

      // only include fields that are non-empty
      addIf("password", formData.get("password"));
      addIf("full_name", formData.get("full_name"));
      addIf("phone_number", formData.get("phone_number"));
      addIf("brand", formData.get("brand"));

      // gender and subject come from fetched data
      payload.gender = teacherFetchedData.gender;
      payload.subject = teacherFetchedData.subject.id;

      // handle grades array, only include if non-empty
      const gradesRaw = formData
        .getAll("grades")
        .map((g) => String(g).trim())
        .filter((g) => g !== "");
      if (gradesRaw.length > 0) {
        payload.grades = gradesRaw.map(Number);
      }

      try {
        await api.put(
          `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}accounts/teachers/${editedNameId.eid}/`,
          payload,
          {
            headers: { Authorization: `Bearer ${access}` },
          }
        );
        triggerRefresh();
        setIsEdited(true);
      } catch (err) {
        console.error(err);
        setIsErrorEdit(true);
      }
    },
    [editedNameId, teacherFetchedData, access, triggerRefresh]
  );

  // Data fetching
  useEffect(() => {
    if (!access) return;

    const fetchAvailableData = async () => {
      setIsFetching(true);
      try {
        const [gradesResponse, subjectsResponse] = await Promise.all([
          api.get(`${djangoapi}accounts/grades/`, {
            headers: { Authorization: `Bearer ${access}` },
          }),
          api.get(`${djangoapi}accounts/subjects/`, {
            headers: { Authorization: `Bearer ${access}` },
          }),
        ]);
        setGradesData(gradesResponse.data || []);
        setSubjectsData(subjectsResponse.data || []);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchAvailableData();
  }, [access]);

  useEffect(() => {
    if (!access || !editedNameId.eid) return;

    const fetchTeacherData = async () => {
      setIsFetching(true);
      try {
        const res = await api.get(
          `${djangoapi}accounts/teachers/${editedNameId.eid}/`,
          { headers: { Authorization: `Bearer ${access}` } }
        );
        setTeacherFetchedData(res.data);
      } catch (error) {
        console.error("Teacher fetch error:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchTeacherData();
  }, [access, getData, editedNameId.eid]);

  // Focus modal on open
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (isDeleteOpen || isEditOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDeleteOpen, isEditOpen]);

  // Skeleton Loaders
  const TableSkeleton = () => (
    <>
      {Array.from({ length: 5 }).map((_, idx) => (
        <tr key={idx} className="animate-pulse">
          <td className="px-6 py-4">
            <div className="flex items-center">
              <div className="bg-gray-200 rounded-full w-10 h-10 mr-4" />
              <div className="h-4 bg-gray-200 rounded w-32" />
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="h-8 bg-gray-200 rounded-full w-24" />
          </td>
          <td className="px-6 py-4">
            <div className="h-8 bg-gray-200 rounded-full w-24" />
          </td>
          <td className="px-6 py-4">
            <div className="h-8 bg-gray-200 rounded-full w-24" />
          </td>
          <td className="px-6 py-4">
            <div className="flex space-x-2">
              <div className="h-10 w-10 bg-gray-200 rounded-full" />
              <div className="h-10 w-10 bg-gray-200 rounded-full" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );

  const MobileSkeleton = () => (
    <>
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className="bg-white p-4 rounded-lg border animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-gray-200 rounded-full w-10 h-10 mr-4" />
              <div className="h-4 bg-gray-200 rounded w-32" />
            </div>
            <div className="flex space-x-2">
              <div className="h-10 w-10 bg-gray-200 rounded-full" />
              <div className="h-10 w-10 bg-gray-200 rounded-full" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 rounded w-full" />
            <div className="h-6 bg-gray-200 rounded w-full" />
            <div className="h-6 bg-gray-200 rounded w-full" />
          </div>
        </div>
      ))}
    </>
  );

  const EditFormSkeleton = () => (
    <div className="space-y-4 animate-pulse">
      <div className="grid md:grid-cols-2 gap-4">
        {[...Array(6)].map((_, idx) => (
          <div key={idx}>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
            <div className="h-10 bg-gray-200 rounded-lg" />
          </div>
        ))}
      </div>
      <div>
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
        <div className="h-10 bg-gray-200 rounded-lg" />
      </div>
      <div>
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="flex items-center">
              <div className="h-5 w-5 bg-gray-200 rounded mr-2" />
              <div className="h-4 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-6">
        <div className="h-10 bg-gray-200 rounded-lg w-24" />
        <div className="h-10 bg-gray-200 rounded-lg w-32" />
      </div>
    </div>
  );

  const renderStatusBadge = useCallback(
    (
      value: string | number,
      positiveColor: string,
      negativeColor: string,
      positiveIcon: JSX.Element,
      negativeIcon: JSX.Element,
      label: string
    ) => {
      const isPositive = Number(value) > 0;
      return (
        <div
          className={`py-1.5 px-3 w-fit h-fit rounded-full flex items-center space-x-2 border transition-all duration-200 ${
            isPositive ? positiveColor : negativeColor
          }`}>
          {isPositive ? positiveIcon : negativeIcon}
          <span
            className={`text-sm font-medium ${
              isPositive
                ? positiveColor.includes("success")
                  ? "text-success"
                  : "text-warning"
                : negativeColor.includes("error")
                ? "text-error"
                : "text-gray-600"
            }`}>
            {value}
            <span
              className={`ml-1 text-xs font-normal ${
                isPositive
                  ? positiveColor.includes("success")
                    ? "text-success/70"
                    : "text-warning/70"
                  : negativeColor.includes("error")
                  ? "text-error/70"
                  : "text-gray-500"
              }`}>
              {label}
            </span>
          </span>
        </div>
      );
    },
    []
  );

  return (
    <>
      <div className="bg-bg-secondary rounded-2xl shadow-lg border border-border-default transition-shadow duration-300">
        {/* Header Section */}
        <div className="p-6 border-b border-border-default flex flex-col md:flex-row gap-4 md:gap-0 justify-between items-center">
          <div className="relative w-full md:max-w-96">
            <Search className="absolute left-3 top-3 text-text-secondary h-5 w-5" />
            <input
              type="text"
              placeholder="Search teachers..."
              className="w-full pl-10 pr-4 py-2.5 border border-border-default rounded-button bg-bg-primary
                     focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-200 shadow-sm font-medium"
              onChange={handleSearchChange}
              defaultValue={searchQuery}
              autoFocus
              aria-label="Search teachers"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Desktop Table */}
        <div className="overflow-x-auto hidden lg:block">
          <table className="w-full">
            <thead className="bg-bg-subtle shadow-sm">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary w-full">
                  Teacher
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary min-w-[120px]">
                  Active Students
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary min-w-[140px]">
                  Inactive Students
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary min-w-[120px]">
                  Assistants
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary min-w-[100px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {!teachers.length ? (
                <TableSkeleton />
              ) : filteredTeachers.length ? (
                filteredTeachers.map((teacher) => (
                  <tr
                    key={teacher.id}
                    className="hover:bg-bg-subtle transition-colors duration-150 group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div
                          className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4
                                  group-hover:bg-primary/20 transition-colors duration-200 shadow-sm">
                          <User className="text-primary h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-text-primary">
                            {teacher.full_name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-primary">
                      {renderStatusBadge(
                        teacher.active_students,
                        "bg-success/10 border-success/30 hover:bg-success/20",
                        "bg-error/10 border-error/30 hover:bg-error/20",
                        <UsersRound
                          className="h-4 w-4 text-success"
                          strokeWidth={2}
                        />,
                        <AlertCircle
                          className="h-4 w-4 text-error"
                          strokeWidth={2}
                        />,
                        "active"
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {renderStatusBadge(
                        teacher.inactive_students,
                        "bg-warning/10 border-warning/30 hover:bg-warning/20",
                        "bg-border-default/30 border-border-default/50 hover:bg-border-default/20",
                        <AlertTriangle
                          className="h-4 w-4 text-warning"
                          strokeWidth={2}
                        />,
                        <Clock
                          className="h-4 w-4 text-gray-600"
                          strokeWidth={2}
                        />,
                        "inactive"
                      )}
                    </td>
                    <td className="px-6 py-4 text-text-primary">
                      {renderStatusBadge(
                        teacher.assistants_count,
                        "bg-success/10 border-success/30 hover:bg-success/20",
                        "bg-error/10 border-error/30 hover:bg-error/20",
                        <UsersRound
                          className="h-4 w-4 text-success"
                          strokeWidth={2}
                        />,
                        <AlertCircle
                          className="h-4 w-4 text-error"
                          strokeWidth={2}
                        />,
                        "assistant"
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          className="text-primary hover:bg-primary/10 p-2 rounded-full transition-all duration-200"
                          aria-label={`Edit ${teacher.full_name}`}
                          onClick={() => {
                            activateGetData();
                            setEditedNameId({
                              ename: teacher.full_name,
                              eid: Number(teacher.id),
                            });
                            setIsEditOpen(true);
                          }}>
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          className="text-error hover:bg-error/10 p-2 rounded-full transition-all duration-200"
                          aria-label={`Delete ${teacher.full_name}`}
                          onClick={() => {
                            setIsDeleteOpen(true);
                            setDeletedName(teacher.full_name);
                            setDeletedId(Number(teacher.id));
                          }}>
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <User className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-text-secondary">
                        No teachers found
                      </h3>
                      <p className="text-text-tertiary mt-1">
                        Try adjusting your search query
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="grid gap-4 p-4 lg:hidden">
          {!teachers.length ? (
            <MobileSkeleton />
          ) : filteredTeachers.length ? (
            filteredTeachers.map((teacher) => (
              <div
                key={teacher.id}
                className="bg-bg-primary p-4 rounded-lg border border-border-default shadow-sm transition-shadow duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4 shadow-sm">
                      <User className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary">
                        {teacher.full_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      className="text-primary hover:bg-primary/10 p-2 rounded-full transition-all duration-200"
                      aria-label={`Edit ${teacher.full_name}`}
                      onClick={() => {
                        activateGetData();
                        setEditedNameId({
                          ename: teacher.full_name,
                          eid: Number(teacher.id),
                        });
                        setIsEditOpen(true);
                      }}>
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      className="text-error hover:bg-error/10 p-2 rounded-full transition-all duration-200"
                      aria-label={`Delete ${teacher.full_name}`}
                      onClick={() => {
                        setIsDeleteOpen(true);
                        setDeletedName(teacher.full_name);
                        setDeletedId(Number(teacher.id));
                      }}>
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">
                      Active Students:
                    </span>
                    {renderStatusBadge(
                      teacher.active_students,
                      "bg-success/10 border-success/30 hover:bg-success/20",
                      "bg-error/10 border-error/30 hover:bg-error/20",
                      <UsersRound
                        className="h-4 w-4 text-success"
                        strokeWidth={2}
                      />,
                      <AlertCircle
                        className="h-4 w-4 text-error"
                        strokeWidth={2}
                      />,
                      "active"
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">
                      Inactive Students:
                    </span>
                    {renderStatusBadge(
                      teacher.inactive_students,
                      "bg-warning/10 border-warning/30 hover:bg-warning/20",
                      "bg-border-default/30 border-border-default/50 hover:bg-border-default/20",
                      <AlertTriangle
                        className="h-4 w-4 text-warning"
                        strokeWidth={2}
                      />,
                      <Clock
                        className="h-4 w-4 text-gray-600"
                        strokeWidth={2}
                      />,
                      "inactive"
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Assistants:</span>
                    {renderStatusBadge(
                      teacher.assistants_count,
                      "bg-success/10 border-success/30 hover:bg-success/20",
                      "bg-error/10 border-error/30 hover:bg-error/20",
                      <UsersRound
                        className="h-4 w-4 text-success"
                        strokeWidth={2}
                      />,
                      <AlertCircle
                        className="h-4 w-4 text-error"
                        strokeWidth={2}
                      />,
                      "assistant"
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-secondary">
                No teachers found
              </h3>
              <p className="text-text-tertiary mt-1">
                Try adjusting your search query
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center animate-fade-in">
          <div className="bg-bg-secondary p-6 rounded-xl w-full max-w-md relative border border-border-default shadow-2xl transform transition-all duration-300 hover:shadow-2xl hover:scale-[1.005]">
            <h3 className="text-lg font-bold mb-4 text-text-primary">
              Delete ({deletedName})?
            </h3>
            <form className="space-y-4" onSubmit={submitDelete}>
              <div className="group">
                <label className="block text-sm font-medium mb-1 text-text-primary">
                  Type in &apos;agree&apos; to continue:
                </label>
                <input
                  autoComplete="off"
                  autoSave="off"
                  type="text"
                  name="agree"
                  onChange={(e) => setAgreeField(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border bg-bg-primary transition-all duration-200 ${
                    isError
                      ? "border-error focus:ring-error/20"
                      : "border-border-default focus:border-primary focus:ring-primary/20"
                  }`}
                  required
                />
              </div>
              {isError && (
                <div className="flex items-center gap-2 rounded-lg bg-error/10 px-4 py-3">
                  <XCircle className="h-5 w-5 text-error" />
                  <span className="text-sm font-medium text-error">
                    Error deleting teacher
                  </span>
                </div>
              )}

              {isDeleted && (
                <div className="flex items-center gap-2 rounded-lg bg-success/10 px-4 py-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="text-sm font-medium text-success">
                    Teacher deleted successfully
                  </span>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-6 border-t border-border-default">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleted(false);
                    setIsError(false);
                    setIsDeleteOpen(false);
                    setDeleteBtnDisabled(false);
                    setAgreeField("");
                    setDeletedId(null);
                  }}
                  className="px-5 py-2 text-text-secondary hover:bg-bg-primary/50 rounded-lg transition-colors duration-200 shadow-sm border border-border-default">
                  Cancel
                </button>
                <button
                  disabled={deleteBtnDisabled}
                  type="submit"
                  className={`px-5 py-2 text-button-text rounded-lg shadow-sm transition-all duration-200 flex items-center gap-2 ${
                    isDeleted ? "" : "bg-error hover:bg-error-hover"
                  } ${isError && "bg-error hover:bg-error/90"} ${
                    deleteBtnDisabled
                      ? "hover:cursor-not-allowed bg-disabled"
                      : "hover:cursor-pointer"
                  }`}>
                  {isDeleted ? (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Deleted Successfully!
                    </>
                  ) : isError ? (
                    <>
                      <XCircle className="h-5 w-5" />
                      Try Again
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center animate-fade-in">
          <div className="bg-bg-secondary p-6 rounded-xl max-h-[95dvh] overflow-y-auto w-full max-w-md md:max-w-xl relative border border-border-default shadow-2xl transform transition-all duration-300 hover:shadow-2xl hover:scale-[1.005]">
            <h3 className="text-lg font-bold mb-4 text-text-primary">
              Edit ({editedNameId.ename})
            </h3>

            {isFetching ? (
              <EditFormSkeleton />
            ) : teacherFetchedData ? (
              <form onSubmit={handleSubmitEdit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="group">
                    <label className="block text-sm font-medium mb-1 text-text-primary">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      className="w-full px-3 py-2 rounded-lg border bg-bg-primary transition-all duration-200 border-border-default focus:border-primary focus:ring-primary/20"
                      defaultValue={teacherFetchedData.full_name}
                      autoCapitalize="off"
                      autoComplete="off"
                      autoCorrect="off"
                      autoSave="off"
                    />
                  </div>
                  {/* Phone Number */}
                  <div className="group">
                    <label className="block text-sm font-medium mb-1 text-text-primary">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone_number"
                      pattern="[0-9]{11}"
                      className="w-full px-3 py-2 rounded-lg border bg-bg-primary transition-all duration-200 border-border-default focus:border-primary focus:ring-primary/20"
                      defaultValue={teacherFetchedData.phone_number}
                      autoCapitalize="off"
                      autoComplete="off"
                      autoCorrect="off"
                      autoSave="off"
                    />
                  </div>
                  {/* Username */}
                  <div className="group">
                    <label className="block text-sm font-medium mb-1 text-text-primary">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      className="w-full px-3 py-2 rounded-lg border bg-bg-primary transition-all duration-200 border-border-default focus:border-primary focus:ring-primary/20"
                      disabled
                      value={teacherFetchedData.user}
                      readOnly
                    />
                  </div>
                  {/* Password */}
                  <div className="group">
                    <label className="block text-sm font-medium mb-1 text-text-primary">
                      Password
                    </label>
                    <input
                      type="text"
                      name="password"
                      className="w-full px-3 py-2 rounded-lg border bg-bg-primary transition-all duration-200 border-border-default focus:border-primary focus:ring-primary/20"
                      autoCapitalize="off"
                      autoComplete="off"
                      autoCorrect="off"
                      autoSave="off"
                    />
                  </div>
                  {/* Gender */}
                  <div className="group">
                    <label className="block text-sm font-medium mb-1 text-text-primary">
                      Gender
                    </label>
                    <div className="relative">
                      <select
                        name="gender"
                        className="w-full px-3 py-2 rounded-lg border bg-bg-primary pr-8 appearance-none border-border-default"
                        value={teacherFetchedData.gender}
                        onChange={(e) =>
                          setTeacherFetchedData((prev) => ({
                            ...prev!,
                            gender: e.target.value,
                          }))
                        }>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
                    </div>
                  </div>
                  {/* Editable Subject */}
                  <div className="group">
                    <label className="block text-sm font-medium mb-1 text-text-primary">
                      Subject
                    </label>
                    <div className="relative">
                      <select
                        name="subject"
                        className="w-full px-3 py-2 rounded-lg border bg-bg-primary pr-8 appearance-none border-border-default"
                        value={teacherFetchedData.subject.id}
                        onChange={(e) =>
                          setTeacherFetchedData((prev) => ({
                            ...prev!,
                            subject: {
                              ...teacherFetchedData.subject,
                              id: e.target.value,
                            },
                          }))
                        }>
                        <option value="">Select Subject</option>
                        {subjectsData.map((subject) => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-medium mb-1 text-text-primary">
                    Brand
                  </label>
                  <input
                    type="text"
                    name="brand"
                    className="w-full px-3 py-2 rounded-lg border bg-bg-primary transition-all duration-200 border-border-default focus:border-primary focus:ring-primary/20"
                    defaultValue={teacherFetchedData.brand}
                    autoCapitalize="off"
                    autoComplete="off"
                    autoCorrect="off"
                    autoSave="off"
                  />
                </div>
                {/* Grades */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-text-primary">
                    Grades
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {gradesData.map((grade) => {
                      const gradeId = Number(grade.id);
                      const isChecked = teacherFetchedData.grades
                        ? teacherFetchedData.grades.includes(gradeId)
                        : false;

                      return (
                        <label
                          key={grade.id}
                          className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="grades"
                            value={grade.id}
                            checked={isChecked}
                            onChange={(e) => {
                              const { checked } = e.target;
                              setTeacherFetchedData((prev) => {
                                if (!prev) return null;
                                const grades = prev.grades
                                  ? [...prev.grades]
                                  : [];
                                if (checked) {
                                  grades.push(gradeId);
                                } else {
                                  const index = grades.indexOf(gradeId);
                                  if (index > -1) grades.splice(index, 1);
                                }
                                return { ...prev, grades };
                              });
                            }}
                            className="rounded border border-border-default text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-text-secondary">
                            {grade.name}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                {isErrorEdit && (
                  <div className="flex items-center gap-2 rounded-lg bg-error/10 px-4 py-3">
                    <XCircle className="h-5 w-5 text-error" />
                    <span className="text-sm font-medium text-error">
                      Error editing teacher
                    </span>
                  </div>
                )}
                {isEdited && (
                  <div className="flex items-center gap-2 rounded-lg bg-success/10 px-4 py-3">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="text-sm font-medium text-success">
                      Teacher edited successfully
                    </span>
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-6 border-t border-border-default">
                  <button
                    type="button"
                    onClick={() => {
                      setIsErrorEdit(false);
                      setIsEdited(false);
                      setIsEditOpen(false);
                      setTeacherFetchedData(null);
                    }}
                    className="px-5 py-2 text-text-secondary hover:bg-bg-primary/50 rounded-lg transition-colors duration-200 shadow-sm border border-border-default">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-5 py-2 text-button-text rounded-lg shadow-sm transition-all duration-200 flex items-center gap-2 ${
                      isEdited
                        ? "bg-success hover:bg-success/90"
                        : "bg-primary hover:bg-primary-hover"
                    } ${isErrorEdit && "bg-error hover:bg-error/90"}`}>
                    {isEdited ? (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        Edited!
                      </>
                    ) : isErrorEdit ? (
                      <>
                        <XCircle className="h-5 w-5" />
                        Try Again
                      </>
                    ) : (
                      "Edit Teacher"
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-text-secondary">
                  Failed to load teacher data
                </h3>
                <p className="text-text-tertiary mt-1">
                  Please try again later
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
