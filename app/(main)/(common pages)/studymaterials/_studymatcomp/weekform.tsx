// components/WeekForm.tsx
"use client";

import { useState } from "react";
import { api } from "@/lib/axiosinterceptor";
import { Button } from "@/components/ui/button";
import { X, Loader2, BookOpen, ChevronDown } from "lucide-react";
import { GradeType } from "../../students/_students comps/main";

const DJANGO_API_URL = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;

interface WeekFormProps {
  grades: GradeType[];
  centers: GradeType[];
  onSuccess: () => void;
  onCancel: () => void;
  access: string;
  selectedgrade: number;
}

export default function WeekForm({
  grades,
  centers,
  onSuccess,
  onCancel,
  access,
  selectedgrade,
}: WeekFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCenters, setSelectedCenters] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gradeId, setGradeId] = useState<number>(selectedgrade);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post(
        `${DJANGO_API_URL}studymaterials/weeks/create/`,
        {
          title,
          description,
          grade: gradeId,
          centers: selectedCenters,
        },
        {
          headers: { Authorization: `Bearer ${access}` },
        }
      );
      onSuccess();
    } catch (error) {
      console.error("Failed to create week:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCenter = (centerId: number) => {
    setSelectedCenters((prev) =>
      prev.includes(centerId)
        ? prev.filter((id) => id !== centerId)
        : [...prev, centerId]
    );
  };

  return (
    <div className="bg-bg-secondary rounded-2xl shadow-xl border border-border-default p-6 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary">
            Create New Study Week
          </h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50 rounded-full transition-all">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          <div className="group">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Week Title
            </label>
            <div className="relative">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-bg-tertiary border border-border-default rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 placeholder:text-text-secondary/50"
                placeholder="Enter week title"
                required
              />
            </div>
          </div>

          <div className="group">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-bg-tertiary border border-border-default rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 placeholder:text-text-secondary/50 min-h-[120px]"
              placeholder="Add a description for this week's study materials..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="group">
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Grade
              </label>
              <div className="relative">
                <select
                  value={gradeId}
                  onChange={(e) => setGradeId(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-bg-tertiary border border-border-default rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 appearance-none transition-all duration-300">
                  {grades.map((grade) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown className="h-5 w-5 text-text-secondary" />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Centers
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {centers.map((center) => (
                <div
                  key={center.id}
                  className={`
                    flex items-center p-3 rounded-xl border cursor-pointer transition-all duration-300
                    ${
                      selectedCenters.includes(center.id)
                        ? "bg-primary/10 border-primary shadow-sm"
                        : "bg-bg-tertiary border-border-default hover:border-primary/50"
                    }
                  `}
                  onClick={() => toggleCenter(center.id)}>
                  <div
                    className={`
                    flex items-center justify-center w-5 h-5 rounded-md border mr-3 transition-all
                    ${
                      selectedCenters.includes(center.id)
                        ? "bg-primary border-primary"
                        : "border-border-default"
                    }
                  `}>
                    {selectedCenters.includes(center.id) && (
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className={
                      selectedCenters.includes(center.id) ? "font-medium" : ""
                    }>
                    {center.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-8 pt-5 border-t border-border-default flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl border-border-default hover:bg-bg-tertiary transition-colors">
            Cancel
          </Button>
          <Button
            type="submit"
            className="px-6 py-3 rounded-xl bg-primary text-text-inverse hover:bg-primary-hover transition-colors shadow-md hover:shadow-lg"
            disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating Week...
              </div>
            ) : (
              "Create Study Week"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
