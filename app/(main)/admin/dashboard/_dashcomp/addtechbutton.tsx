"use client";
import { CheckCircle, ChevronDown, Plus, XCircle } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/axiosinterceptor";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsError(false);
      const formData = new FormData(e.currentTarget);

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

      const subjectVal = formData.get("subject");
      if (typeof subjectVal === "string" && subjectVal.trim() !== "") {
        payload.subject = Number(subjectVal);
      }

      const rawGrades = formData
        .getAll("grades")
        .map((g) => String(g).trim())
        .filter((g) => g !== "");
      if (rawGrades.length > 0) {
        payload.grades = rawGrades.map((g) => Number(g));
      }

      try {
        await api.post(`${djangoapi}accounts/teachers/create/`, payload, {
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-button-text hover:bg-primary-hover hover:shadow-lg transition-all duration-200 shadow-sm hover:-translate-y-0.5">
          <Plus className="h-5 w-5 mr-2" />
          Add Teacher
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto bg-bg-secondary border-border-default">
        <DialogHeader>
          <DialogTitle className="text-text-primary">
            Add New Teacher
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-text-primary">
                Full Name
              </Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                required
                className="bg-bg-primary border-border-default"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone_number" className="text-text-primary">
                Phone Number
              </Label>
              <Input
                id="phone_number"
                name="phone_number"
                type="tel"
                pattern="[0-9]{11}"
                required
                className="bg-bg-primary border-border-default"
              />
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-text-primary">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                className="bg-bg-primary border-border-default"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-text-primary">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="bg-bg-primary border-border-default"
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender" className="text-text-primary">
                Gender
              </Label>
              <div className="relative">
                <select
                  id="gender"
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
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-text-primary">
                Subject
              </Label>
              <div className="relative">
                <select
                  id="subject"
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

          {/* Brand */}
          <div className="space-y-2">
            <Label htmlFor="brand" className="text-text-primary">
              Brand
            </Label>
            <Input
              id="brand"
              name="brand"
              type="text"
              className="bg-bg-primary border-border-default"
            />
          </div>

          {/* Grades */}
          <div className="space-y-2">
            <Label className="text-text-primary">Grades</Label>
            <ScrollArea className="h-48 rounded-md border border-border-default p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {gradesData.map((grade) => (
                  <label key={grade.id} className="flex items-center space-x-2">
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
            </ScrollArea>
          </div>

          {/* Status Messages */}
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

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-border-default">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsError(false);
                setIsCreated(false);
                setIsOpen(false);
              }}
              className="text-text-secondary hover:bg-bg-primary/50 shadow-sm border border-border-default">
              Cancel
            </Button>
            <Button
              type="submit"
              className={`text-button-text shadow-sm transition-all duration-200 ${
                isCreated
                  ? "bg-success hover:bg-success/90"
                  : "bg-primary hover:bg-primary-hover"
              } ${isError && "bg-error hover:bg-error/90"}`}>
              {isCreated ? (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Success!
                </>
              ) : isError ? (
                <>
                  <XCircle className="h-5 w-5 mr-2" />
                  Try Again
                </>
              ) : (
                "Add Teacher"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
