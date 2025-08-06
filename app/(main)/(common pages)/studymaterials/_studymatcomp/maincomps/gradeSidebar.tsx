import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf, faFont, faLink } from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GradeType } from "../../../students/_students comps/main";

interface GradeSidebarProps {
  availgrades: GradeType[];
  selectedGrade: number | undefined;
  setSelectedGrade: (id: number) => void;
  materialCounts: {
    pdf: number;
    text: number;
    link: number;
  };
  loading: boolean;
}

const MaterialTypeItem = ({
  icon,
  color,
  label,
  count,
}: {
  icon: IconProp;
  color: string;
  label: string;
  count: number;
}) => (
  <div className="flex justify-between items-center">
    <div className="flex items-center">
      <FontAwesomeIcon icon={icon} className={`${color} mr-4`} />
      {label}
    </div>
    <Badge className="bg-bg-subtle text-text-primary">{count}</Badge>
  </div>
);

const GradeItem = ({
  grade,
  isSelected,
  onClick,
}: {
  grade: GradeType;
  isSelected: boolean;
  onClick: () => void;
}) => (
  <div
    className={`relative rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-md border border-border-default
      ${isSelected ? "bg-primary/10 shadow-inner" : "hover:-translate-y-0.5"}`}
    onClick={onClick}>
    <div
      className={`absolute left-0 inset-y-0 w-1 rounded-l-lg transition-all
      ${isSelected ? "bg-primary" : "opacity-0"}`}
    />
    <div className={`transition-all ${isSelected ? "ml-2" : ""}`}>
      {grade.name}
    </div>
  </div>
);

const GradeItemSkeleton = () => (
  <div className="relative rounded-lg p-4 border border-border-default">
    <Skeleton className="h-6 w-3/4" />
  </div>
);

export default function GradeSidebar({
  availgrades,
  selectedGrade,
  setSelectedGrade,
  materialCounts,
  loading,
}: GradeSidebarProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-bg-secondary rounded-xl shadow p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <GradeItemSkeleton key={index} />
            ))}
          </div>
        </div>

        <div className="bg-bg-secondary rounded-xl shadow p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex justify-between items-center">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grades Sidebar */}
      <div className="bg-bg-secondary rounded-xl shadow p-6 h-fit">
        <h2 className="text-lg font-bold text-text-primary mb-4">Grades</h2>
        <div className="space-y-4">
          {availgrades.length > 0 ? (
            availgrades.map((grade) => (
              <GradeItem
                key={grade.id}
                grade={grade}
                isSelected={selectedGrade === grade.id}
                onClick={() => setSelectedGrade(grade.id)}
              />
            ))
          ) : (
            <div className="text-center py-4 text-text-secondary">
              No grades available
            </div>
          )}
        </div>
      </div>

      {/* Material Types */}
      <div className="bg-bg-secondary rounded-xl shadow p-6">
        <h2 className="text-lg font-bold text-text-primary mb-4">
          Material Types
        </h2>
        <div className="space-y-3">
          {[
            {
              icon: faFilePdf,
              color: "text-red-500",
              label: "PDF Documents",
              count: materialCounts.pdf,
            },
            {
              icon: faFont,
              color: "text-purple-500",
              label: "Text Notes",
              count: materialCounts.text,
            },
            {
              icon: faLink,
              color: "text-yellow-500",
              label: "External Links",
              count: materialCounts.link,
            },
          ].map((item, index) => (
            <MaterialTypeItem key={index} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}
