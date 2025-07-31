import StatCard from "@/app/(main)/(common pages)/students/_students comps/cards";
import MaterialIcon from "@/app/(main)/(common pages)/studymaterials/_studymatcomp/maincomps/materialIcon";
import { Badge } from "@/components/ui/badge";
import { formatUserDate } from "@/lib/formatDate";
import useStudent_StudyMaterialsStore, {
  week,
} from "@/lib/stores/student/studymaterials/studyMaterials";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
  faBook,
  faCalendarWeek,
  faFilePdf,
  faFont,
  faLink,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMemo } from "react";

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

export default function AllWeeks() {
  const weeks = useStudent_StudyMaterialsStore((state) => state.weeks);
  const materials = useStudent_StudyMaterialsStore((state) => state.materials);

  const onWeekClick = (week: week) => {
    const weekMaterials = materials.filter((m) => m.week === week.id);
    useStudent_StudyMaterialsStore.getState().updateSelectedWeek(week);
    useStudent_StudyMaterialsStore
      .getState()
      .updateSelectedMaterial(weekMaterials);
    useStudent_StudyMaterialsStore.getState().setView("week_details");
  };

  const materialCounts = useMemo(() => {
    const counts = { pdf: 0, video: 0, image: 0, text: 0, link: 0 };
    for (const m of materials) {
      const type = m.material_type as keyof typeof counts;
      if (counts.hasOwnProperty(type)) counts[type]++;
    }
    return counts;
  }, [materials]);

  const renderMatCoutTab = () => (
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
  );

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
          Study Materials
        </h1>
      </div>
      {/* Stats Cards */}
      <div className="grid gap-6 mb-8 grid-cols-1 sm:grid-cols-2">
        <StatCard
          title="Total Weeks"
          value={weeks.length}
          icon={
            <FontAwesomeIcon
              icon={faCalendarWeek}
              className="text-xl"
              color="blue"
            />
          }
          iconContainerClass="bg-indigo-100"
        />
        <StatCard
          title="Study Materials"
          value={materials.length}
          icon={
            <FontAwesomeIcon icon={faBook} className="text-xl" color="green" />
          }
          iconContainerClass="bg-green-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(250px,1fr)_3fr] gap-6">
        <div>{renderMatCoutTab()}</div>
        <div className="bg-bg-secondary rounded-xl shadow p-6">
          <div>
            <h2 className="text-xl font-bold text-text-primary mb-5">
              Study Weeks
            </h2>
          </div>
          {weeks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 border border-border-default rounded-xl bg-bg-secondary">
              <div className="bg-blue-100 rounded-full p-4 mb-5">
                <span className="text-blue-500 text-2xl">📅</span>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">
                No Study Weeks
              </h3>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6">
              {weeks.map((week) => {
                const weekMaterials = materials.filter(
                  (m) => m.week === week.id
                );
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
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
