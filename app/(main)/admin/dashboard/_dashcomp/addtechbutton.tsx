"use client";
import { CheckCircle, ChevronDown, Plus, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/axiosinterceptor";

const djangoapi = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;

interface acces {
  accesss: string | null;
  triggerRefresh: () => void;
}

interface ListItem {
  name: string;
  id: string;
}

export function AddTeacherButton({ accesss, triggerRefresh }: acces) {
  const [isOpen, setIsOpen] = useState(false);
  const [gradesdata, setGradesdata] = useState<ListItem[]>([
    { name: "", id: "" },
  ]);
  const [subjectsdata, setSubjectsdata] = useState<ListItem[]>([
    { name: "", id: "" },
  ]);

  const [iscteated, setIscreated] = useState(false);
  const [iserror, setIserror] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const gradesResponse = await api.get(`${djangoapi}accounts/grades/`, {
          headers: { Authorization: `Bearer ${accesss}` },
        });
        setGradesdata(gradesResponse.data);

        const subjectsResponse = await api.get(
          `${djangoapi}accounts/subjects/`,
          {
            headers: { Authorization: `Bearer ${accesss}` },
          }
        );
        setSubjectsdata(subjectsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [accesss, isOpen]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIserror(false);
    const formData = new FormData(e.currentTarget);

    try {
      await api.post(
        `${djangoapi}/accounts/teachers/create/`,
        {
          username: formData.get("username"),
          password: formData.get("password"),
          full_name: formData.get("full_name"),
          phone_number: formData.get("phone_number"),
          gender: formData.get("gender"),
          subject: Number(formData.get("subject")),
          grades: formData.getAll("grades").map((grade) => Number(grade)),
        },
        {
          headers: {
            Authorization: `Bearer ${accesss}`,
          },
        }
      );
      triggerRefresh();
      setIscreated(true);
    } catch (error) {
      console.error("Failed to add teacher:", error);
      setIserror(true);
    }
  }

  return (
    <>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary text-button-text px-4 py-2 rounded-lg 
                   hover:bg-primary-hover hover:cursor-pointer hover:shadow-lg transition-all duration-200 
                   flex items-center gap-2 shadow-sm hover:-translate-y-0.5">
          <Plus className="h-5 w-5" />
          Add Teacher
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center
                      animate-fade-in">
          <div
            className="bg-bg-secondary p-6 rounded-xl w-full max-w-md md:max-w-xl relative 
                        border border-border-default shadow-2xl transform transition-all duration-300
                        hover:shadow-2xl hover:scale-[1.005]">
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
                    className={`w-full px-3 py-2 rounded-lg border bg-bg-primary transition-all duration-200 ${
                      iserror
                        ? "border-error focus:ring-error/20"
                        : "border-border-default focus:border-primary focus:ring-primary/20"
                    }`}
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
                    className={`w-full px-3 py-2 rounded-lg border bg-bg-primary transition-all duration-200 ${
                      iserror
                        ? "border-error focus:ring-error/20"
                        : "border-border-default focus:border-primary focus:ring-primary/20"
                    }`}
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
                    className={`w-full px-3 py-2 rounded-lg border bg-bg-primary transition-all duration-200 ${
                      iserror
                        ? "border-error focus:ring-error/20"
                        : "border-border-default focus:border-primary focus:ring-primary/20"
                    }`}
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
                    className={`w-full px-3 py-2 rounded-lg border bg-bg-primary transition-all duration-200 ${
                      iserror
                        ? "border-error focus:ring-error/20"
                        : "border-border-default focus:border-primary focus:ring-primary/20"
                    }`}
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
                      className={`w-full px-3 py-2 rounded-lg border bg-bg-primary pr-8 appearance-none transition-all duration-200 ${
                        iserror
                          ? "border-error focus:ring-error/20"
                          : "border-border-default focus:border-primary focus:ring-primary/20"
                      }`}
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
                      className={`w-full px-3 py-2 rounded-lg border bg-bg-primary pr-8 appearance-none transition-all duration-200 ${
                        iserror
                          ? "border-error focus:ring-error/20"
                          : "border-border-default focus:border-primary focus:ring-primary/20"
                      }`}
                      required>
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
                  {gradesdata.map((grade) => (
                    <label
                      key={grade.id}
                      className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="grades"
                        value={grade.id}
                        className={`rounded border ${
                          iserror ? "border-error" : "border-border-default"
                        } text-primary focus:ring-primary`}
                      />
                      <span className="text-sm text-text-secondary">
                        {grade.name}
                      </span>
                    </label>
                  ))}
                </div>
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
                    Error creating teacher
                  </span>
                </div>
              )}

              {iscteated && (
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
                    Teacher created successfully
                  </span>
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-border-default">
                <button
                  type="button"
                  onClick={() => {
                    setIserror(false);
                    setIscreated(false);
                    setIsOpen(false);
                  }}
                  className="px-5 py-2 text-text-secondary hover:bg-bg-primary/50 rounded-lg
               transition-colors duration-200 shadow-sm border border-border-default">
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-button-text rounded-lg shadow-sm transition-all duration-200 flex items-center gap-2 ${
                    iscteated
                      ? "bg-success hover:bg-success/90"
                      : "bg-primary hover:bg-primary-hover"
                  } ${iserror && "bg-error hover:bg-error/90"}`}>
                  {iscteated ? (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Success!
                    </>
                  ) : iserror ? (
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
