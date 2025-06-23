"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Plus } from "lucide-react";
import {
  faBook,
  faCalendarWeek,
  faFilePdf,
  faFont,
  faImage,
  faLink,
  faVideo,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";

import { api } from "@/lib/axiosinterceptor";
import { formatUserDate } from "@/lib/formatDate";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatCard from "../../students/_students comps/cards";
import WeekForm from "./weekform";
import type { GradeType } from "../../students/_students comps/main";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import MaterialCardsGrid from "./materialcard";
import { MaterialCardData } from "./materialcard"; // Import MaterialCardData
import MaterialForm from "./MaterialForm";
const DJANGO_API_URL = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;

type ViewState = "LIST_VIEW" | "ADD_WEEK_VIEW";
type MainView = "WEEKS_VIEW" | "MATERIAL_VIEW" | "ADD_MATERIAL_VIEW";

interface Week {
  id: number;
  teacher: number;
  title: string;
  description: string;
  grade: GradeType;
  centers: GradeType[];
  date_created: string;
}

interface StudyMaterial {
  id: number;
  teacher: number;
  week: number;
  title: string;
  material_type: string;
  material_type_display: string;
  date_created: string;
  file_url?: string;
  text_content?: string;
  external_url?: string;
}

interface MainProps {
  access: string;
}

// Extracted components
const MaterialIcon = ({ type }: { type: string }) => {
  const iconConfig = {
    pdf: { icon: faFilePdf, color: "text-red-600", bg: "bg-red-100" },
    video: { icon: faVideo, color: "text-blue-600", bg: "bg-blue-100" },
    image: { icon: faImage, color: "text-green-600", bg: "bg-green-100" },
    text: { icon: faFont, color: "text-yellow-600", bg: "bg-yellow-100" },
    link: { icon: faLink, color: "text-purple-600", bg: "bg-purple-100" },
  };

  const { icon, color, bg } = iconConfig[type as keyof typeof iconConfig];

  return (
    <div
      className={`w-7 h-7 rounded-md flex items-center justify-center ${bg}`}>
      <FontAwesomeIcon icon={icon} className={`text-sm ${color}`} />
    </div>
  );
};

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

export default function StudyMaterialsMain({ access }: MainProps) {
  // State
  const [availgrades, setAvailGrades] = useState<GradeType[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<number>();
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null);
  const [availcenters, setAvailCenters] = useState<GradeType[]>([]);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [currentView, setCurrentView] = useState<ViewState>("LIST_VIEW");
  const [currentView_Main, setCurrentView_Main] =
    useState<MainView>("WEEKS_VIEW");

  // Refs
  const refCounterWeeks = useRef(0);

  // Derived state
  const filteredWeeks = useMemo(
    () =>
      selectedGrade
        ? weeks.filter((week) => week.grade.id === selectedGrade)
        : weeks,
    [selectedGrade, weeks]
  );

  const materialCounts = useMemo(
    () => ({
      pdf: materials.filter((m) => m.material_type === "pdf").length,
      video: materials.filter((m) => m.material_type === "video").length,
      image: materials.filter((m) => m.material_type === "image").length,
      text: materials.filter((m) => m.material_type === "text").length,
      link: materials.filter((m) => m.material_type === "link").length,
    }),
    [materials]
  );

  const weekMaterials = useMemo(() => {
    if (!selectedWeek) return [];
    return materials.filter((m) => m.week === selectedWeek.id);
  }, [selectedWeek, materials]);

  // API calls
  const fetchData = useCallback(
    async (url: string) => {
      if (!access) return;
      try {
        const res = await api.get(url, {
          headers: { Authorization: `Bearer ${access}` },
        });
        return res.data;
      } catch (error) {
        console.error("Error fetching data:", error);
        return [];
      }
    },
    [access]
  );

  const fetchInitialData = useCallback(async () => {
    const [grades, centers] = await Promise.all([
      fetchData(`${DJANGO_API_URL}accounts/grades/`),
      fetchData(`${DJANGO_API_URL}accounts/centers/`),
    ]);

    setAvailGrades(grades || []);
    setAvailCenters(centers || []);

    if (grades?.length > 0) {
      setSelectedGrade(grades[0].id);
    }
  }, [fetchData]);

  const fetchWeeks = useCallback(async () => {
    const weeksData = await fetchData(`${DJANGO_API_URL}studymaterials/weeks/`);
    setWeeks(weeksData || []);
  }, [fetchData]);

  const fetchMaterials = useCallback(async () => {
    const materialsData = await fetchData(
      `${DJANGO_API_URL}studymaterials/materials/`
    );
    setMaterials(materialsData || []);
  }, [fetchData]);

  // Handlers
  const triggerRefetchWeeks = useCallback(() => {
    refCounterWeeks.current += 1;
    fetchWeeks();
  }, [fetchWeeks]);

  const handleWeekAdded = useCallback(() => {
    triggerRefetchWeeks();
    setCurrentView("LIST_VIEW");
  }, [triggerRefetchWeeks]);

  const navigateToAddWeek = useCallback(
    () => setCurrentView("ADD_WEEK_VIEW"),
    []
  );
  const navigateBackToList = useCallback(() => setCurrentView("LIST_VIEW"), []);

  const navigateToWeeksView = useCallback(
    () => setCurrentView_Main("WEEKS_VIEW"),
    []
  );

  const navigateToMaterialsView = useCallback(
    () => setCurrentView_Main("MATERIAL_VIEW"),
    []
  );

  // Initial data fetch
  useEffect(() => {
    if (!access) return;

    const loadData = async () => {
      await Promise.all([fetchInitialData(), fetchWeeks(), fetchMaterials()]);
    };

    loadData();
  }, [access, fetchInitialData, fetchWeeks, fetchMaterials]);

  // Render helpers
  const renderDesktopSidebar = () => (
    <div className="hidden lg:block space-y-6">
      {/* Grades Sidebar */}
      <div className="bg-bg-secondary rounded-xl shadow p-6 h-fit">
        <h2 className="text-lg font-bold text-text-primary mb-4">Grades</h2>
        <div className="space-y-4">
          {availgrades.map((grade) => (
            <GradeItem
              key={grade.id}
              grade={grade}
              isSelected={selectedGrade === grade.id}
              onClick={() => setSelectedGrade(grade.id)}
            />
          ))}
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
              icon: faVideo,
              color: "text-blue-500",
              label: "Videos",
              count: materialCounts.video,
            },
            {
              icon: faImage,
              color: "text-green-500",
              label: "Images",
              count: materialCounts.image,
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

  const renderBackButton = () => (
    <Button
      variant="ghost"
      onClick={navigateToWeeksView}
      className="flex items-center gap-2 text-primary hover:bg-bg-base hover:text-primary-hover mb-4">
      <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
      Back to Weeks
    </Button>
  );

  const renderBackButton_Materials = () => (
    <Button
      variant="ghost"
      onClick={navigateToMaterialsView}
      className="flex items-center gap-2 text-primary hover:bg-bg-base hover:text-primary-hover mb-4">
      <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
      Back to Materials
    </Button>
  );

  const renderMobileTabs = () => (
    <div className="lg:hidden space-y-4 mb-6">
      {/* Mobile Grades Tabs */}
      <div className="bg-bg-secondary rounded-xl p-4 border border-border-default shadow-sm">
        <div className="flex overflow-x-auto pb-1 scrollbar-hide gap-2 justify-between items-center">
          {availgrades.map((grade) => (
            <button
              key={grade.id}
              className={`flex-shrink-0 min-w-[150px] py-3 px-4 text-center rounded-lg text-sm font-medium whitespace-nowrap
                ${
                  selectedGrade === grade.id
                    ? "bg-primary text-text-inverse shadow-md"
                    : "bg-bg-subtle text-text-secondary hover:bg-bg-hover"
                }`}
              onClick={() => setSelectedGrade(grade.id)}>
              {grade.name}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Material Types */}
      <div className="bg-bg-secondary rounded-xl shadow-sm p-4 border border-border-default">
        <h3 className="font-medium text-text-primary mb-3">Material Types</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[
            {
              icon: faFilePdf,
              color: "text-red-500",
              label: "PDF",
              count: materialCounts.pdf,
            },
            {
              icon: faVideo,
              color: "text-blue-500",
              label: "Videos",
              count: materialCounts.video,
            },
            {
              icon: faImage,
              color: "text-green-500",
              label: "Images",
              count: materialCounts.image,
            },
            {
              icon: faFont,
              color: "text-purple-500",
              label: "Text",
              count: materialCounts.text,
            },
            {
              icon: faLink,
              color: "text-yellow-500",
              label: "Links",
              count: materialCounts.link,
            },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg p-3 border border-border-default">
              <div className="flex items-center">
                <FontAwesomeIcon
                  icon={item.icon}
                  className={`${item.color} mr-2 text-sm`}
                />
                <span className="text-sm text-text-secondary">
                  {item.label}
                </span>
              </div>
              <Badge className="bg-bg-subtle text-text-primary px-2 py-0.5 text-xs">
                {item.count}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderWeekCard = (week: Week) => {
    const weekMaterials = materials.filter((m) => m.week === week.id);
    const MAX_VISIBLE_MATERIALS = 6;

    return (
      <div
        onClick={() => {
          setSelectedWeek(week);
          setCurrentView_Main("MATERIAL_VIEW");
        }}
        key={week.id}
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
            {weekMaterials.slice(0, MAX_VISIBLE_MATERIALS).map((material) => (
              <MaterialIcon key={material.id} type={material.material_type} />
            ))}

            {weekMaterials.length === 0 && (
              <span className="text-sm text-gray-500">No materials yet!</span>
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
              {week.centers.map((center) => center.name).join(", ") ||
                "No centers available!"}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {currentView_Main !== "WEEKS_VIEW" ? (
        <>
          {currentView_Main === "MATERIAL_VIEW" ? (
            <>
              {renderBackButton()}
              <div className="mb-6 flex flex-wrap justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-text-primary">
                    {selectedWeek?.title}
                  </h2>
                  <p className="text-text-secondary mt-2">
                    {selectedWeek?.description}
                  </p>
                </div>
                {weekMaterials.length > 0 && (
                  <button
                    onClick={() => setCurrentView_Main("ADD_MATERIAL_VIEW")}
                    className="bg-primary hover:bg-primary-hover text-text-inverse h-fit self-center font-medium py-2 px-6 rounded-full transition duration-300 transform hover:-translate-y-0.5">
                    Add Material
                  </button>
                )}
              </div>
              <MaterialCardsGrid
                materials={weekMaterials.map((m) => ({
                  title: m.title,
                  type: m.material_type as MaterialCardData["type"],
                  date: formatUserDate(m.date_created),
                  file_url:
                    m.material_type === "link" ? m.external_url : m.file_url,
                  text_content: m.text_content,
                }))}
                onClick_AddMaterial={() =>
                  setCurrentView_Main("ADD_MATERIAL_VIEW")
                }
              />
            </>
          ) : (
            <>
              {renderBackButton_Materials()}
              <MaterialForm
                weekId={selectedWeek?.id || 0}
                onSuccess={() => {
                  fetchMaterials();
                  setCurrentView_Main("MATERIAL_VIEW");
                }}
                onCancel={() => setCurrentView_Main("MATERIAL_VIEW")}
                access={access}
              />
            </>
          )}
        </>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid gap-6 mb-8 grid-cols-1 sm:grid-cols-2">
            <StatCard
              title="Total Weeks"
              value={filteredWeeks.length}
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
                <FontAwesomeIcon
                  icon={faBook}
                  className="text-xl"
                  color="green"
                />
              }
              iconContainerClass="bg-green-100"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(250px,1fr)_3fr] gap-6">
            {renderDesktopSidebar()}

            <div>
              {currentView === "LIST_VIEW" ? (
                <div className="bg-bg-secondary rounded-xl shadow p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-text-primary">
                        Study Weeks
                      </h2>
                      <p className="text-sm text-text-secondary mt-1">
                        Organize your teaching materials by weekly topics
                      </p>
                    </div>
                    <Button
                      onClick={navigateToAddWeek}
                      className="gap-2 bg-primary text-text-inverse hover:bg-primary-hover">
                      <Plus size={16} />
                      Add Week
                    </Button>
                  </div>

                  {renderMobileTabs()}

                  <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
                    {filteredWeeks.map(renderWeekCard)}
                  </div>
                </div>
              ) : (
                <WeekForm
                  grades={availgrades}
                  centers={availcenters}
                  onSuccess={handleWeekAdded}
                  onCancel={navigateBackToList}
                  access={access}
                />
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
