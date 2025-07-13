import { StudyMaterial, Week } from "../main";
import MaterialIcon from "./materialIcon";
import { Badge } from "@/components/ui/badge";
import { formatUserDate } from "@/lib/formatDate";
import { Skeleton } from "@/components/ui/skeleton";
import { GradeType } from "../../../students/_students comps/main";

interface WeekListProps {
  weeks: Week[];
  materials: StudyMaterial[];
  loading: boolean;
  onWeekClick: (week: Week) => void;
  onAddWeek: () => void;
  selectedGrade?: number;
  availgrades: unknown[];
}

const WeekCardSkeleton = () => (
  <div className="flex flex-col h-full bg-white border border-gray-200 rounded-xl p-5">
    <div className="flex justify-between items-start gap-2">
      <div className="min-w-0">
        <Skeleton className="h-6 w-40 mb-2" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="w-10 h-6 rounded-full" />
    </div>

    <div className="my-4 flex-grow">
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-2" />
      <Skeleton className="h-4 w-4/6 mb-4" />

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="w-7 h-7 rounded-md" />
        ))}
      </div>
    </div>

    <div className="pt-3 border-t border-gray-200">
      <Skeleton className="h-4 w-full" />
    </div>
  </div>
);

export default function WeekList({
  weeks,
  materials,
  loading,
  onWeekClick,
  onAddWeek,
  selectedGrade,
  availgrades,
}: WeekListProps) {
  const filteredWeeks = selectedGrade
    ? weeks
        .filter((week) => week.grade.id === selectedGrade)
        .sort(
          (a, b) =>
            new Date(a.date_created).getTime() -
            new Date(b.date_created).getTime()
        )
    : weeks;

  return (
    <div className="bg-bg-secondary rounded-xl shadow p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Study Weeks</h2>
          <p className="text-sm text-text-secondary mt-1">
            Organize your teaching materials by weekly topics
          </p>
        </div>
        <button
          onClick={onAddWeek}
          className="gap-2 bg-primary text-text-inverse hover:bg-primary-hover px-4 py-2 rounded-lg flex items-center">
          <span>+</span>
          <span>Add Week</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <WeekCardSkeleton key={index} />
          ))}
        </div>
      ) : filteredWeeks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-border-default rounded-xl bg-bg-secondary">
          <div className="bg-blue-100 rounded-full p-4 mb-5">
            <span className="text-blue-500 text-2xl">📅</span>
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">
            No Study Weeks
          </h3>
          <p className="text-text-secondary mb-6 max-w-md text-center">
            {availgrades.length === 0
              ? "No grades available. Please add grades first."
              : "This grade doesn't have any study weeks yet. Add your first week to get started."}
          </p>
          <button
            onClick={onAddWeek}
            className="flex items-center gap-2 bg-primary text-text-inverse px-4 py-2 rounded-lg disabled:opacity-50"
            disabled={availgrades.length === 0}>
            <span>+</span>
            <span>Add Week</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6">
          {filteredWeeks.map((week) => {
            const weekMaterials = materials.filter((m) => m.week === week.id);
            const MAX_VISIBLE_MATERIALS = 6;

            return (
              <div
                key={week.id}
                onClick={() => onWeekClick(week)}
                className="group flex flex-col h-full bg-white border border-gray-200 rounded-xl p-5 transition-all hover:shadow-lg cursor-pointer hover:border-blue-500 hover:-translate-y-0.5 duration-200">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-lg truncate text-gray-900 group-hover:text-blue-600">
                      {week.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatUserDate(week.date_created)}
                    </p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-600">
                    {weekMaterials.length}
                    {weekMaterials.length === 1 ? " Item" : " Items"}
                  </Badge>
                </div>

                <div className="my-4 flex-grow">
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                    {week.description || "No description available"}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {weekMaterials
                      .slice(0, MAX_VISIBLE_MATERIALS)
                      .map((material) => (
                        <MaterialIcon
                          key={material.id}
                          type={material.material_type}
                        />
                      ))}

                    {weekMaterials.length === 0 && (
                      <span className="text-sm text-gray-500">
                        No materials yet!
                      </span>
                    )}

                    {weekMaterials.length > MAX_VISIBLE_MATERIALS && (
                      <div className="relative">
                        <div className="w-7 h-7 rounded-md flex items-center justify-center bg-gray-100 text-gray-600 text-xs font-medium">
                          +{weekMaterials.length - MAX_VISIBLE_MATERIALS}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="text-blue-600 font-medium mr-1">
                      Available for:
                    </span>
                    <span>
                      {week.centers
                        .map((center: GradeType) => center.name)
                        .join(", ") || "No centers available!"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
