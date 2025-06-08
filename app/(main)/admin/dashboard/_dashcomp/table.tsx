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
import { useEffect, useState } from "react";

const djangoapi = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;

interface ListItem {
  name: string;
  id: string;
}

interface teacherdate {
  id: number;
  full_name: string;
  phone_number: string;
  gender: string;
  user: string;
  subject: ListItem;
  grades: number[];
}

interface teacher {
  id: number;
  full_name: string;
  active_students: string;
  inactive_students: string;
  assistants_count: string;
}

interface teacherProps {
  teachers?: teacher[];
  triggerRefresh: () => void; // Made optional
  access: string | null;
}

export default function TeachersTable({
  teachers = [],
  triggerRefresh,
  access,
}: teacherProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isdeleteopen, setIsdeleteopen] = useState(false);
  const [isediteopen, setIsediteopen] = useState(false);
  const [iserror, setIserror] = useState(false);
  const [isdeleted, setIsdeleted] = useState(false);
  const [deletedname, setDeletedname] = useState("");
  const [editedname_id, seteditedname_id] = useState({ ename: "", eid: 0 });
  const [deletedid, setDeletedid] = useState<number | null>();
  const [agreefield, setAgreefield] = useState("");
  const [deletebtndisabled, setDeletebtndisabled] = useState(false);
  const [teacherfetcheddata, setTeacherfetcheddata] = useState<teacherdate>({
    id: 0,
    full_name: "",
    phone_number: "",
    gender: "",
    user: "",
    subject: { name: "", id: "" },
    grades: [],
  });
  const [gradesdata, setGradesdata] = useState<ListItem[]>([
    { name: "", id: "" },
  ]);
  const [subjectsdata, setSubjectsdata] = useState<ListItem[]>([
    { name: "", id: "" },
  ]);
  const [isedited, setIsedited] = useState(false);
  const [iserroredit, setIserroredit] = useState(false);
  const [getdata, setgetdata] = useState(0);

  const activategetdata = () => {
    setgetdata((prev) => prev + 1);
  };

  const filteredTeachers = (() => {
    const normalizedQuery = searchQuery
      .toLowerCase()
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .trim();

    // If empty search, return all teachers sorted alphabetically
    if (!normalizedQuery) {
      return [...teachers].sort((a, b) =>
        a.full_name.localeCompare(b.full_name)
      );
    }

    // Split query into individual words
    const searchTerms = normalizedQuery
      .split(" ")
      .filter((term) => term.length > 0);

    // Phase 1: Find names starting with the entire query
    const startsWithFullQuery = teachers.filter((teacher) =>
      teacher.full_name.toLowerCase().startsWith(normalizedQuery)
    );

    if (startsWithFullQuery.length > 0) {
      return startsWithFullQuery.sort((a, b) =>
        a.full_name.localeCompare(b.full_name)
      );
    }

    // Phase 2: Find names where all search terms appear in order
    const allTermsInOrder = teachers.filter((teacher) => {
      const lowerName = teacher.full_name.toLowerCase();
      let currentIndex = 0;

      for (const term of searchTerms) {
        const termIndex = lowerName.indexOf(term, currentIndex);
        if (termIndex === -1) return false;
        currentIndex = termIndex + term.length;
      }
      return true;
    });

    if (allTermsInOrder.length > 0) {
      return allTermsInOrder.sort((a, b) =>
        a.full_name.localeCompare(b.full_name)
      );
    }

    // Phase 3: Find names containing all search terms (any order)
    const containsAllTerms = teachers.filter((teacher) => {
      const lowerName = teacher.full_name.toLowerCase();
      return searchTerms.every((term) => lowerName.includes(term));
    });

    if (containsAllTerms.length > 0) {
      return containsAllTerms.sort((a, b) =>
        a.full_name.localeCompare(b.full_name)
      );
    }

    // Phase 4: Find names containing any search term
    const containsAnyTerm = teachers.filter((teacher) => {
      const lowerName = teacher.full_name.toLowerCase();
      return searchTerms.some((term) => lowerName.includes(term));
    });

    return containsAnyTerm.sort((a, b) =>
      a.full_name.localeCompare(b.full_name)
    );
  })();

  const submtdelete = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const deleteteacher = async () => {
      try {
        await api.delete(`${djangoapi}accounts/teachers/${deletedid}/`, {
          headers: { Authorization: `Bearer ${access}` },
        });
        triggerRefresh();
        setIsdeleted(true);
        setDeletebtndisabled(true);
      } catch {
        setIserror(true);
      }
    };
    if (agreefield === "agree") {
      deleteteacher();
    } else {
      setIserror(true);
    }
  };

  async function handleSubmitedit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIserroredit(false);
    const formData = new FormData(e.currentTarget);

    try {
      await api.put(
        `${djangoapi}accounts/teachers/${editedname_id.eid}/`,
        {
          password: formData.get("password"),
          full_name: formData.get("full_name"),
          phone_number: formData.get("phone_number"),
          gender: teacherfetcheddata.gender,
          subject: teacherfetcheddata.subject.id,
          grades: formData.getAll("grades").map((grade) => Number(grade)),
        },
        {
          headers: {
            Authorization: `Bearer ${access}`,
          },
        }
      );
      triggerRefresh();
      setIsedited(true);
    } catch (error) {
      console.error("Failed to add teacher:", error);
      setIserroredit(true);
    }
  }

  useEffect(() => {
    const fetchavailableData = async () => {
      try {
        const gradesResponse = await api.get(`${djangoapi}accounts/grades/`, {
          headers: { Authorization: `Bearer ${access}` },
        });
        setGradesdata(gradesResponse.data);

        const subjectsResponse = await api.get(
          `${djangoapi}accounts/subjects/`,
          {
            headers: { Authorization: `Bearer ${access}` },
          }
        );
        setSubjectsdata(subjectsResponse.data);
      } catch (error) {
        console.error("Error fetching data(subjects and grades):   ", error);
      }
    };

    fetchavailableData();

    const fetchteacherdata = async () => {
      try {
        const res = await api.get(
          `${djangoapi}accounts/teachers/${editedname_id.eid}/`,
          {
            headers: { Authorization: `Bearer ${access}` },
          }
        );
        setTeacherfetcheddata(res.data);
      } catch {
        console.log("faild to fetch teacher data");
      }
    };

    fetchteacherdata();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access, getdata]);

  return (
    <>
      <div className="bg-bg-secondary rounded-2xl shadow-lg border border-border-default hover:shadow-xl transition-shadow duration-300">
        {/* Header Section */}
        <div className="p-6 border-b border-border-default flex flex-col md:flex-row gap-4 md:gap-0 justify-between items-center">
          <div className="relative w-full md:max-w-96">
            <Search className="absolute left-3 top-3 text-text-secondary h-5 w-5" />
            <input
              type="text"
              placeholder="Search teachers..."
              className="w-full pl-10 pr-4 py-2 border border-border-default rounded-button bg-bg-primary
                     focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-200 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Desktop Table */}
        <div className="overflow-x-auto hidden lg:block">
          <table className="w-full">
            <thead className="bg-bg-subtle shadow-sm">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary w-full">
                  Teacher
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary whitespace-nowrap min-w-[120px]">
                  Active Students
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary whitespace-nowrap min-w-[140px]">
                  Inactive Students
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary whitespace-nowrap min-w-[120px]">
                  Assistants
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary whitespace-nowrap min-w-[100px]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border-default">
              {filteredTeachers.map((teacher, index) => (
                <tr
                  key={index}
                  className="hover:bg-bg-subtle transition-colors duration-150 group">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div
                        className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4
                                  group-hover:bg-primary/20 transition-colors duration-200 shadow-sm">
                        <User className="text-primary h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">
                          {teacher.full_name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-text-primary">
                    <div
                      className={`py-1.5 px-3 w-fit h-fit rounded-full flex items-center space-x-2 transition-all duration-200 group ${
                        Number(teacher.active_students) <= 0
                          ? "bg-error/10 border-error/30 hover:bg-error/20"
                          : "bg-success/10 border-success/30 hover:bg-success/20"
                      } border`}>
                      {Number(teacher.active_students) <= 0 ? (
                        <AlertCircle
                          className="h-4 w-4 text-error"
                          strokeWidth={2}
                        />
                      ) : (
                        <UsersRound
                          className="h-4 w-4 text-success"
                          strokeWidth={2}
                        />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          Number(teacher.active_students) <= 0
                            ? "text-error"
                            : "text-success"
                        }`}>
                        {teacher.active_students}
                        <span
                          className={`ml-1 text-xs font-normal ${
                            Number(teacher.active_students) <= 0
                              ? "text-error/70"
                              : "text-success/70"
                          }`}>
                          active
                        </span>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className={`py-1.5 px-3 w-fit h-fit rounded-full flex items-center space-x-2 transition-all duration-200 group ${
                        Number(teacher.inactive_students) > 0
                          ? "bg-warning/10 border-warning/30 hover:bg-warning/20"
                          : "bg-border-default/30 border-border-default/50 hover:bg-border-default/20"
                      } border`}>
                      {Number(teacher.inactive_students) > 0 ? (
                        <AlertTriangle
                          className="h-4 w-4 text-warning"
                          strokeWidth={2}
                        />
                      ) : (
                        <Clock
                          className="h-4 w-4 text-gray-600"
                          strokeWidth={2}
                        />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          Number(teacher.inactive_students) > 0
                            ? "text-warning"
                            : "text-gray-600"
                        }`}>
                        {teacher.inactive_students}
                        <span
                          className={`ml-1 text-xs font-normal ${
                            Number(teacher.inactive_students) > 0
                              ? "text-warning/70"
                              : "text-gray-500"
                          }`}>
                          inactive
                        </span>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-text-primary">
                    <div
                      className={`py-1.5 px-3 w-fit h-fit rounded-full flex items-center space-x-2 transition-all duration-200 group ${
                        Number(teacher.assistants_count) <= 0
                          ? "bg-error/10 border-error/30 hover:bg-error/20"
                          : "bg-success/10 border-success/30 hover:bg-success/20"
                      } border`}>
                      {Number(teacher.assistants_count) <= 0 ? (
                        <AlertCircle
                          className="h-4 w-4 text-error"
                          strokeWidth={2}
                        />
                      ) : (
                        <UsersRound
                          className="h-4 w-4 text-success"
                          strokeWidth={2}
                        />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          Number(teacher.assistants_count) <= 0
                            ? "text-error"
                            : "text-success"
                        }`}>
                        {teacher.assistants_count}
                        <span
                          className={`ml-1 text-xs font-normal ${
                            Number(teacher.assistants_count) <= 0
                              ? "text-error/70"
                              : "text-success/70"
                          }`}>
                          assistant
                        </span>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-4">
                      <button
                        className="text-primary hover:bg-primary/10 p-2 rounded-full transition-all duration-200 hover:cursor-pointer"
                        onClick={() => {
                          activategetdata();
                          seteditedname_id({
                            ename: teacher.full_name,
                            eid: Number(teacher.id),
                          });
                          setIsediteopen(true);
                        }}>
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        className="text-error hover:bg-error/10 p-2 rounded-full transition-all duration-200 hover:cursor-pointer"
                        onClick={() => {
                          setIsdeleteopen((prev) => !prev);
                          setDeletedname(`${teacher.full_name}`);
                          setDeletedid(Number(teacher.id));
                        }}>
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="grid gap-4 p-4 lg:hidden">
          {filteredTeachers.map((teacher, index) => (
            <div
              key={index}
              className="bg-bg-primary p-4 rounded-lg border border-border-default shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div
                    className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4
                              hover:bg-primary/20 transition-colors duration-200 shadow-sm">
                    <User className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">
                      {teacher.full_name}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    className="text-primary hover:bg-primary/10 p-2 rounded-full transition-all duration-200 hover:cursor-pointer"
                    onClick={() => {
                      activategetdata();
                      seteditedname_id({
                        ename: teacher.full_name,
                        eid: Number(teacher.id),
                      });
                      setIsediteopen(true);
                    }}>
                    <Edit
                      className="h-5 w-5"
                      onClick={() => {
                        activategetdata();
                        seteditedname_id({
                          ename: teacher.full_name,
                          eid: Number(teacher.id),
                        });
                        setIsediteopen(true);
                      }}
                    />
                  </button>
                  <button className="text-error hover:bg-error/10 p-2 rounded-full transition-all duration-200 hover:cursor-pointer">
                    <Trash2
                      className="h-5 w-5"
                      onClick={() => {
                        setIsdeleteopen((prev) => !prev);
                        setDeletedname(`${teacher.full_name}`);
                        setDeletedid(Number(teacher.id));
                      }}
                    />
                  </button>
                </div>
              </div>

              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Active Students:</span>
                  <span className="text-text-primary">
                    <div
                      className={`py-1.5 px-3 w-fit h-fit rounded-full flex items-center space-x-2 transition-all duration-200 group ${
                        Number(teacher.active_students) <= 0
                          ? "bg-error/10 border-error/30 hover:bg-error/20"
                          : "bg-success/10 border-success/30 hover:bg-success/20"
                      } border`}>
                      {Number(teacher.active_students) <= 0 ? (
                        <AlertCircle
                          className="h-4 w-4 text-error"
                          strokeWidth={2}
                        />
                      ) : (
                        <UsersRound
                          className="h-4 w-4 text-success"
                          strokeWidth={2}
                        />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          Number(teacher.active_students) <= 0
                            ? "text-error"
                            : "text-success"
                        }`}>
                        {teacher.active_students}
                        <span
                          className={`ml-1 text-xs font-normal ${
                            Number(teacher.active_students) <= 0
                              ? "text-error/70"
                              : "text-success/70"
                          }`}>
                          active
                        </span>
                      </span>
                    </div>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">
                    Inactive Students:
                  </span>
                  <div
                    className={`py-1.5 px-3 w-fit h-fit rounded-full flex items-center space-x-2 transition-all duration-200 group ${
                      Number(teacher.inactive_students) > 0
                        ? "bg-warning/10 border-warning/30 hover:bg-warning/20"
                        : "bg-border-default/30 border-border-default/50 hover:bg-border-default/20"
                    } border`}>
                    {Number(teacher.inactive_students) > 0 ? (
                      <AlertTriangle
                        className="h-4 w-4 text-warning"
                        strokeWidth={2}
                      />
                    ) : (
                      <Clock
                        className="h-4 w-4 text-gray-600"
                        strokeWidth={2}
                      />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        Number(teacher.inactive_students) > 0
                          ? "text-warning"
                          : "text-gray-600"
                      }`}>
                      {teacher.inactive_students}
                      <span
                        className={`ml-1 text-xs font-normal ${
                          Number(teacher.inactive_students) > 0
                            ? "text-warning/70"
                            : "text-gray-500"
                        }`}>
                        inactive
                      </span>
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Assistants:</span>
                  <span className="text-text-primary">
                    <div
                      className={`py-1.5 px-3 w-fit h-fit rounded-full flex items-center space-x-2 transition-all duration-200 group ${
                        Number(teacher.assistants_count) <= 0
                          ? "bg-error/10 border-error/30 hover:bg-error/20"
                          : "bg-success/10 border-success/30 hover:bg-success/20"
                      } border`}>
                      {Number(teacher.assistants_count) <= 0 ? (
                        <AlertCircle
                          className="h-4 w-4 text-error"
                          strokeWidth={2}
                        />
                      ) : (
                        <UsersRound
                          className="h-4 w-4 text-success"
                          strokeWidth={2}
                        />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          Number(teacher.assistants_count) <= 0
                            ? "text-error"
                            : "text-success"
                        }`}>
                        {teacher.assistants_count}
                        <span
                          className={`ml-1 text-xs font-normal ${
                            Number(teacher.assistants_count) <= 0
                              ? "text-error/70"
                              : "text-success/70"
                          }`}>
                          assistant
                        </span>
                      </span>
                    </div>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isdeleteopen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center
                      animate-fade-in">
          <div
            className="bg-bg-secondary p-6 rounded-xl w-full max-w-md relative 
                        border border-border-default shadow-2xl transform transition-all duration-300
                        hover:shadow-2xl hover:scale-[1.005]">
            <h3 className="text-lg font-bold mb-4 text-text-primary">
              Delete ({deletedname})?
            </h3>

            <form className="space-y-4" onSubmit={submtdelete}>
              <div className="group">
                <label className="block text-sm font-medium mb-1 text-text-primary">
                  Type in &apos;agree&apos; to continue:
                </label>
                <input
                  autoComplete="off"
                  autoSave="off"
                  type="text"
                  name="full_name"
                  onChange={(e) => {
                    setAgreefield(e.target.value);
                  }}
                  className={`w-full px-3 py-2 rounded-lg border bg-bg-primary transition-all duration-200 ${
                    iserror
                      ? "border-error focus:ring-error/20"
                      : "border-border-default focus:border-primary focus:ring-primary/20"
                  }`}
                  required
                />
              </div>
              {iserror && (
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
                    Error deleting teacher
                  </span>
                </div>
              )}

              {isdeleted && (
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
                    Teacher deleted successfully
                  </span>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-6 border-t border-border-default">
                <button
                  type="button"
                  onClick={() => {
                    setIsdeleted(false);
                    setIserror(false);
                    setIsdeleteopen(false);
                    setDeletebtndisabled(false);
                    setAgreefield("");
                    setDeletedid(null);
                  }}
                  className="px-5 py-2 text-text-secondary hover:bg-bg-primary/50 rounded-lg
               transition-colors duration-200 shadow-sm border border-border-default">
                  Cancel
                </button>
                <button
                  disabled={deletebtndisabled}
                  type="submit"
                  className={`px-5 py-2 text-button-text rounded-lg shadow-sm transition-all duration-200 flex items-center gap-2 ${
                    isdeleted ? "" : "bg-error hover:bg-error-hover"
                  } ${iserror && "bg-error hover:bg-error/90"} ${
                    deletebtndisabled
                      ? "hover:cursor-not-allowed bg-disabled"
                      : "hover:cursor-pointer"
                  }`}>
                  {isdeleted ? (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Deleted Successfully!
                    </>
                  ) : iserror ? (
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

      {isediteopen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center
                      animate-fade-in">
          <div
            className="bg-bg-secondary p-6 rounded-xl w-full max-w-md md:max-w-xl relative 
                        border border-border-default shadow-2xl transform transition-all duration-300
                        hover:shadow-2xl hover:scale-[1.005]">
            <h3 className="text-lg font-bold mb-4 text-text-primary">
              Edit ({editedname_id.ename}).
            </h3>

            <form onSubmit={handleSubmitedit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="group">
                  <label className="block text-sm font-medium mb-1 text-text-primary">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    className={`w-full px-3 py-2 rounded-lg border bg-bg-primary transition-all duration-200 ${
                      iserror
                        ? "border-error focus:ring-error/20"
                        : "border-border-default focus:border-primary focus:ring-primary/20"
                    }`}
                    defaultValue={teacherfetcheddata.full_name}
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
                    className={`w-full px-3 py-2 rounded-lg border bg-bg-primary transition-all duration-200 ${
                      iserror
                        ? "border-error focus:ring-error/20"
                        : "border-border-default focus:border-primary focus:ring-primary/20"
                    }`}
                    defaultValue={teacherfetcheddata.phone_number}
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
                    className={`w-full px-3 py-2 rounded-lg border bg-bg-primary transition-all duration-200 ${
                      iserror
                        ? "border-error focus:ring-error/20"
                        : "border-border-default focus:border-primary focus:ring-primary/20"
                    }`}
                    disabled
                    value={teacherfetcheddata.user}
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
                    className={`w-full px-3 py-2 rounded-lg border bg-bg-primary transition-all duration-200 ${
                      iserror
                        ? "border-error focus:ring-error/20"
                        : "border-border-default focus:border-primary focus:ring-primary/20"
                    }`}
                    autoCapitalize="off"
                    autoComplete="off"
                    autoCorrect="off"
                    autoSave="off"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-medium mb-1 text-text-primary">
                    Gender
                  </label>
                  <div className="relative">
                    <select
                      name="gender"
                      className={`w-full px-3 py-2 rounded-lg border bg-bg-primary pr-8 appearance-none ${
                        iserror ? "border-error" : "border-border-default"
                      }`}
                      value={teacherfetcheddata.gender}
                      onChange={(e) =>
                        setTeacherfetcheddata((prev) => ({
                          ...prev,
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
                      className={`w-full px-3 py-2 rounded-lg border bg-bg-primary pr-8 appearance-none ${
                        iserror ? "border-error" : "border-border-default"
                      }`}
                      value={teacherfetcheddata.subject.id}
                      onChange={(e) =>
                        setTeacherfetcheddata((prev) => ({
                          ...prev,
                          subject: {
                            ...teacherfetcheddata.subject,
                            id: e.target.value,
                          },
                        }))
                      }>
                      <option value="">Select Subject</option>
                      {subjectsdata.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
                  </div>
                </div>

                {/* Grades */}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-text-primary">
                  Grades
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {gradesdata.map((grade) => {
                    const gradeId = Number(grade.id);
                    const isChecked = teacherfetcheddata.grades
                      ? teacherfetcheddata.grades.includes(gradeId)
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
                            setTeacherfetcheddata((prev) => {
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
                          className={`rounded border ${
                            iserror ? "border-error" : "border-border-default"
                          } text-primary focus:ring-primary`}
                        />
                        <span className="text-sm text-text-secondary">
                          {grade.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
              {iserroredit && (
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
                    Error editting teacher
                  </span>
                </div>
              )}

              {isedited && (
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
                    Teacher edited successfully
                  </span>
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-border-default">
                <button
                  type="button"
                  onClick={() => {
                    setIserroredit(false);
                    setIsedited(false);
                    setIsediteopen(false);
                    setTeacherfetcheddata({
                      id: 0,
                      full_name: "",
                      phone_number: "",
                      gender: "",
                      user: "",
                      subject: { id: "", name: "" },
                      grades: [],
                    });
                  }}
                  className="px-5 py-2 text-text-secondary hover:bg-bg-primary/50 rounded-lg
               transition-colors duration-200 shadow-sm border border-border-default">
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-button-text rounded-lg shadow-sm transition-all duration-200 flex items-center gap-2 ${
                    isedited
                      ? "bg-success hover:bg-success/90"
                      : "bg-primary hover:bg-primary-hover"
                  } ${iserroredit && "bg-error hover:bg-error/90"}`}>
                  {isedited ? (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Edited!
                    </>
                  ) : iserror ? (
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
          </div>
        </div>
      )}
    </>
  );
}
