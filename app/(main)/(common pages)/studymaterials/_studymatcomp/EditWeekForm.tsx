"use client";

import { memo, useState } from "react";
import { api } from "@/lib/axiosinterceptor";
import { Button } from "@/components/ui/button";
import { X, Loader2, BookOpen } from "lucide-react";
import type { GradeType } from "../../students/_students comps/main";
import { Week } from "./main";

const DJANGO_API_URL = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;

interface EditWeekFormProps {
  week: Week;
  centers: GradeType[];
  onSuccess: (t: string, d: string) => void;
  onCancel: () => void;
  access: string;
}

// CenterItem component definition
const CenterItem = memo(
  ({
    center,
    isSelected,
    onClick,
  }: {
    center: GradeType;
    isSelected: boolean;
    onClick: () => void;
  }) => (
    <div
      onClick={onClick}
      className={`
      flex items-center p-3 rounded-xl border cursor-pointer transition-all duration-300
      ${
        isSelected
          ? "bg-primary/10 border-primary shadow-sm"
          : "bg-bg-tertiary border-border-default hover:border-primary/50"
      }
    `}>
      <div
        className={`
        flex items-center justify-center w-5 h-5 rounded-md border mr-3 transition-all
        ${isSelected ? "bg-primary border-primary" : "border-border-default"}
      `}>
        {isSelected && (
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
      <span className={isSelected ? "font-medium" : ""}>{center.name}</span>
    </div>
  )
);
CenterItem.displayName = "CenterItem";

export default function EditWeekForm({
  week,
  centers,
  onSuccess,
  onCancel,
  access,
}: EditWeekFormProps) {
  const [title, setTitle] = useState(week.title);
  const [description, setDescription] = useState(week.description);
  const [selectedCenters, setSelectedCenters] = useState<number[]>(
    week.centers.map((center) => center.id)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.put(
        `${DJANGO_API_URL}studymaterials/weeks/${week.id}/`,
        {
          title,
          description,
          centers: selectedCenters,
        },
        {
          headers: { Authorization: `Bearer ${access}` },
        }
      );
      onSuccess(title, description);
    } catch (error) {
      console.error("Failed to update week:", error);
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
            Edit Study Week
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

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Centers
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {centers.map((center) => (
                <CenterItem
                  key={center.id}
                  center={center}
                  isSelected={selectedCenters.includes(center.id)}
                  onClick={() => toggleCenter(center.id)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-8 pt-5 border-t border-border-default flex-wrap space-y-2">
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
                Updating Week...
              </div>
            ) : (
              "Update Study Week"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
