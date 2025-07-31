"use client";
import { CheckCircle, ChevronDown, Plus, XCircle } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/axiosinterceptor";

const djangoapi = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;

interface Access {
  accesss: string | null;
  triggerRefresh: () => void;
}
interface ListItem {
  name: string;
  id: string;
}

export function AddTeacherButton({ accesss, triggerRefresh }: Access) {
  const [isOpen, setIsOpen] = useState(false);
  const [gradesData, setGradesData] = useState<ListItem[]>([]);
  const [subjectsData, setSubjectsData] = useState<ListItem[]>([]);
  const [isCreated, setIsCreated] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!accesss || !isOpen) return;
    const fetchData = async () => {
      try {
        const [gradesResponse, subjectsResponse] = await Promise.all([
          api.get(`${djangoapi}accounts/grades/`, {
            headers: { Authorization: `Bearer ${accesss}` },
          }),
          api.get(`${djangoapi}accounts/subjects/`, {
            headers: { Authorization: `Bearer ${accesss}` },
          }),
        ]);
        setGradesData(gradesResponse.data || []);
        setSubjectsData(subjectsResponse.data || []);
      } catch {
        // silent error
      }
    };
    fetchData();
  }, [accesss, isOpen]);

  // Modal overflow lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handler
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsError(false);
      const formData = new FormData(e.currentTarget);

      // Build payload by only including non-empty fields
      const payload: Record<string, unknown> = {};
      const addIf = (key: string, value: FormDataEntryValue | null) => {
        if (typeof value === "string") {
          const v = value.trim();
          if (v !== "") payload[key] = v;
        } else if (value instanceof File) {
          if (value.size > 0) payload[key] = value;
        }
      };

      addIf("username", formData.get("username"));
      addIf("password", formData.get("password"));
      addIf("full_name", formData.get("full_name"));
      addIf("phone_number", formData.get("phone_number"));
      addIf("gender", formData.get("gender"));
      addIf("brand", formData.get("brand"));

      // Subject (number)
      const subjectVal = formData.get("subject");
      if (typeof subjectVal === "string" && subjectVal.trim() !== "") {
        payload.subject = Number(subjectVal);
      }

      // Grades (array of numbers)
      const rawGrades = formData
        .getAll("grades")
        .map((g) => String(g).trim())
        .filter((g) => g !== "");
      if (rawGrades.length > 0) {
        payload.grades = rawGrades.map((g) => Number(g));
      }

      try {
        await api.post(`${djangoapi}/accounts/teachers/create/`, payload, {
          headers: {
            Authorization: `Bearer ${accesss}`,
          },
        });
        triggerRefresh();
        setIsCreated(true);
      } catch (err) {
        console.error(err);
        setIsError(true);
      }
    },
    [accesss, triggerRefresh]
  );

  // UI
  return (
    <>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary text-button-text px-4 py-2 rounded-lg hover:bg-primary-hover hover:cursor-pointer hover:shadow-lg transition-all duration-200 flex items-center gap-2 shadow-sm hover:-translate-y-0.5">
          <Plus className="h-5 w-5" />
          Add Teacher
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center animate-fade-in">
          <div className="bg-bg-secondary p-6 rounded-xl w-full max-w-md md:max-w-xl relative border border-border-default shadow-2xl transform transition-all duration-300 hover:shadow-2xl hover:scale-[1.005]">
            <h3 className="text-lg font-bold mb-4 text-text-primary">
              Add New Teacher
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    required
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
                    required
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
                    required
                  />
                </div>
                {/* Password */}
                <div className="group">
                  <label className="block text-sm font-medium mb-1 text-text-primary">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    className="w-full px-3 py-2 rounded-lg border bg-bg-primary transition-all duration-200 border-border-default focus:border-primary focus:ring-primary/20"
                    required
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
                      className="w-full px-3 py-2 rounded-lg border bg-bg-primary pr-8 appearance-none transition-all duration-200 border-border-default focus:border-primary focus:ring-primary/20"
                      required>
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
                  </div>
                </div>
                {/* Subject */}
                <div className="group">
                  <label className="block text-sm font-medium mb-1 text-text-primary">
                    Subject
                  </label>
                  <div className="relative">
                    <select
                      name="subject"
                      className="w-full px-3 py-2 rounded-lg border bg-bg-primary pr-8 appearance-none transition-all duration-200 border-border-default focus:border-primary focus:ring-primary/20"
                      required>
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
                />
              </div>

              {/* Grades */}
              <div>
                <label className="block text-sm font-medium mb-1 text-text-primary">
                  Grades
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {gradesData.map((grade) => (
                    <label
                      key={grade.id}
                      className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="grades"
                        value={grade.id}
                        className="rounded border border-border-default text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-text-secondary">
                        {grade.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              {isError && (
                <div className="flex items-center gap-2 rounded-lg bg-error/10 px-4 py-3">
                  <XCircle className="h-5 w-5 text-error" />
                  <span className="text-sm font-medium text-error">
                    Error creating teacher
                  </span>
                </div>
              )}
              {isCreated && (
                <div className="flex items-center gap-2 rounded-lg bg-success/10 px-4 py-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="text-sm font-medium text-success">
                    Teacher created successfully
                  </span>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-6 border-t border-border-default">
                <button
                  type="button"
                  onClick={() => {
                    setIsError(false);
                    setIsCreated(false);
                    setIsOpen(false);
                  }}
                  className="px-5 py-2 text-text-secondary hover:bg-bg-primary/50 rounded-lg transition-colors duration-200 shadow-sm border border-border-default">
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-button-text rounded-lg shadow-sm transition-all duration-200 flex items-center gap-2 ${
                    isCreated
                      ? "bg-success hover:bg-success/90"
                      : "bg-primary hover:bg-primary-hover"
                  } ${isError && "bg-error hover:bg-error/90"}`}>
                  {isCreated ? (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Success!
                    </>
                  ) : isError ? (
                    <>
                      <XCircle className="h-5 w-5" />
                      Try Again
                    </>
                  ) : (
                    "Add Teacher"
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
