"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  startTransition,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
import { showToast, type GradeType } from "../../students/_students comps/main";
import MaterialCardsGrid from "./materialcard";
import { MaterialCardData } from "./materialcard";
import MaterialForm from "./MaterialForm";
import EditWeekForm from "./EditWeekForm";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import GradeSidebar from "./maincomps/gradeSidebar";
import WeekList from "./maincomps/weekList";
import MaterialDeleteDialog from "./MaterialDeleteDialog";
import MaterialEditForm from "./MaterialEditForm";

const DJANGO_API_URL = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;

type ViewState = "LIST_VIEW" | "ADD_WEEK_VIEW";
type MainView =
  | "WEEKS_VIEW"
  | "MATERIAL_VIEW"
  | "ADD_MATERIAL_VIEW"
  | "EDIT_WEEK_VIEW"
  | "EDIT_MATERIAL_VIEW"
  | "DELETE_MATERIAL_DIALOG";

// ------------------------ VERY IMPORTANT COMMENT (DO NOT DELETE IT)----------------------
//  IN THE FUTURE, IF THE PAGE BECAME SLOW, I WILL CHANGE THE LOGIC TO THE FOLLOWING:
//  instead of getting all the materials in a single api call, I will make it ignore the content to reduce computing and relay on
//  getting the desired content (only needed one) by api calls to the back-end.

export interface Week {
  id: number;
  teacher: number;
  title: string;
  description: string;
  grade: GradeType;
  centers: GradeType[];
  date_created: string;
}

interface week_detailsType {
  id: number;
  title: string;
  grade: GradeType;
}

export interface StudyMaterial {
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
  week_details: week_detailsType;
}

interface MainProps {
  access: string;
}

// Skeleton components
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

const StatCardSkeleton = () => (
  <div className="bg-bg-secondary rounded-xl shadow p-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="w-10 h-10 rounded-full" />
    </div>
    <Skeleton className="h-8 w-16 mt-4" />
    <Skeleton className="h-4 w-40 mt-2" />
  </div>
);

const MaterialCardSkeleton = () => (
  <div className="bg-white rounded-lg border border-border-default p-4">
    <div className="flex justify-between items-start mb-4">
      <Skeleton className="w-7 h-7 rounded-md" />
      <Skeleton className="w-6 h-6 rounded" />
    </div>
    <Skeleton className="h-5 w-3/4 mb-3" />
    <Skeleton className="h-4 w-20" />
  </div>
);

const InitialSkeleton = () => (
  <div className="space-y-6">
    {/* Stats Skeleton */}
    <div className="grid gap-6 mb-8 grid-cols-1 sm:grid-cols-2">
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-[minmax(250px,1fr)_3fr] gap-6">
      {/* Sidebar Skeleton */}
      <div className="space-y-6">
        <div className="bg-bg-secondary rounded-xl shadow p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-16 rounded-lg" />
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

      {/* Main Content Skeleton */}
      <div className="bg-bg-secondary rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col h-full bg-white border border-gray-200 rounded-xl p-5">
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
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="w-7 h-7 rounded-md" />
                  ))}
                </div>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
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
  const [loadingStates, setLoadingStates] = useState({
    initial: true,
    weeks: false,
    materials: false,
    initialData: false,
  });
  const [errors, setErrors] = useState({
    initial: "",
    weeks: "",
    materials: "",
  });
  const [weekToEdit, setWeekToEdit] = useState<Week | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [materialToEdit, setMaterialToEdit] = useState<StudyMaterial | null>(
    null
  );
  const [materialToDelete, setMaterialToDelete] =
    useState<StudyMaterial | null>(null);

  // Refs
  const refCounterWeeks = useRef(0);

  const materialsByWeek = useMemo(() => {
    const map = new Map<number, StudyMaterial[]>();
    for (const m of materials) {
      if (!map.has(m.week)) map.set(m.week, []);
      map.get(m.week)!.push(m);
    }
    return map;
  }, [materials]);

  const materialCounts = useMemo(() => {
    const counts = { pdf: 0, video: 0, image: 0, text: 0, link: 0 };
    for (const m of materials) {
      const type = m.material_type as keyof typeof counts;
      if (counts.hasOwnProperty(type)) counts[type]++;
    }
    return counts;
  }, [materials]);

  const weekMaterials = useMemo(() => {
    if (!selectedWeek) return [];
    return materialsByWeek.get(selectedWeek.id) || [];
  }, [selectedWeek, materialsByWeek]);

  // Use useCallback for fetchData to ensure referential stability
  const fetchData = useCallback(
    async (url: string) => {
      if (!access) return;
      try {
        const res = await api.get(url, {
          headers: { Authorization: `Bearer ${access}` },
        });
        return res.data;
      } catch (error) {
        console.debug("Error fetching data:", error);
        return [];
      }
    },
    [access]
  );

  const fetchInitialData = useCallback(async () => {
    setLoadingStates((prev) => ({ ...prev, initialData: true }));
    try {
      const [grades, centers] = await Promise.all([
        fetchData(`${DJANGO_API_URL}accounts/grades/`),
        fetchData(`${DJANGO_API_URL}accounts/centers/`),
      ]);
      startTransition(() => {
        setAvailGrades(grades || []);
        setAvailCenters(centers || []);
        if (grades?.length > 0) setSelectedGrade(grades[0].id);
      });
    } catch {
      setErrors((prev) => ({
        ...prev,
        initial: "Failed to load grades and centers data",
      }));
    } finally {
      setLoadingStates((prev) => ({ ...prev, initialData: false }));
    }
  }, [fetchData]);

  const fetchWeeks = useCallback(async () => {
    setLoadingStates((prev) => ({ ...prev, weeks: true }));
    setErrors((prev) => ({ ...prev, weeks: "" }));
    try {
      const weeksData = await fetchData(
        `${DJANGO_API_URL}studymaterials/weeks/`
      );
      startTransition(() => {
        setWeeks(weeksData || []);
      });
    } catch (error) {
      setErrors((prev) => ({ ...prev, weeks: "Failed to load study weeks" }));
      console.debug("Error loading weeks:", error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, weeks: false }));
    }
  }, [fetchData]);

  const fetchMaterials = useCallback(async () => {
    setLoadingStates((prev) => ({ ...prev, materials: true }));
    setErrors((prev) => ({ ...prev, materials: "" }));
    try {
      const materialsData = await fetchData(
        `${DJANGO_API_URL}studymaterials/materials/`
      );
      startTransition(() => {
        setMaterials(materialsData || []);
      });
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        materials: "Failed to load study materials",
      }));
      console.debug("Error loading materials:", error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, materials: false }));
    }
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

  const mapToMaterialCardData = (m: StudyMaterial): MaterialCardData => ({
    id: m.id,
    title: m.title,
    type: m.material_type as MaterialCardData["type"],
    date: formatUserDate(m.date_created),
    file_url: m.material_type === "link" ? m.external_url : m.file_url,
    text_content: m.text_content,
    external_url: m.external_url,
    material_type: m.material_type,
    date_created: m.date_created,
  });

  const deleteWeek = useCallback(async () => {
    if (!selectedWeek || !access) return;
    setIsDeleting(true);
    try {
      await api.delete(
        `${DJANGO_API_URL}studymaterials/weeks/${selectedWeek.id}/`,
        { headers: { Authorization: `Bearer ${access}` } }
      );
      // Batch state updates to minimize re-renders
      startTransition(() => {
        fetchWeeks();
        fetchMaterials();
        setIsDeleting(false);
        setIsDeleteDialogOpen(false);
        showToast("Week deleted successfully!", "success");
        setSelectedWeek(null);
        setCurrentView_Main("WEEKS_VIEW");
      });
    } catch (error) {
      console.debug("Failed to delete week:", error);
      setIsDeleting(false);
    }
  }, [access, selectedWeek, fetchWeeks, fetchMaterials]);

  const navigateBackToList = useCallback(() => setCurrentView("LIST_VIEW"), []);

  const navigateToWeeksView = useCallback(
    () => setCurrentView_Main("WEEKS_VIEW"),
    []
  );

  const navigateToMaterialsView = useCallback(
    () => setCurrentView_Main("MATERIAL_VIEW"),
    []
  );

  const updateWeekView = (tile: string, description: string) => {
    if (!selectedWeek) return;
    setSelectedWeek({ ...selectedWeek, title: tile, description: description });
  };

  const handleEditMaterial = useCallback(
    (materialData: MaterialCardData) => {
      const originalMaterial = materials.find((m) => m.id === materialData.id);
      if (originalMaterial) {
        setMaterialToEdit(originalMaterial);
        setCurrentView_Main("EDIT_MATERIAL_VIEW");
      }
    },
    [materials]
  );

  const handleDeleteMaterial = useCallback(
    (materialData: MaterialCardData) => {
      const originalMaterial = materials.find((m) => m.id === materialData.id);
      if (originalMaterial) {
        setMaterialToDelete(originalMaterial);
      }
    },
    [materials]
  );

  const handleMaterialDeleted = useCallback(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  // Initial data fetch - PARALLELIZED
  useEffect(() => {
    if (!access) return;

    const loadData = async () => {
      setLoadingStates((prev) => ({ ...prev, initial: true }));
      try {
        // Run all fetches in parallel
        await Promise.all([fetchInitialData(), fetchWeeks(), fetchMaterials()]);
      } catch {
        setErrors((prev) => ({
          ...prev,
          initial: "Failed to load initial data",
        }));
      } finally {
        setLoadingStates((prev) => ({ ...prev, initial: false }));
      }
    };

    loadData();
  }, [access, fetchInitialData, fetchWeeks, fetchMaterials]);

  // Show loading state for entire component
  if (loadingStates.initial) {
    return <InitialSkeleton />;
  }

  // Show error state if initial loading failed
  if (errors.initial) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-6 text-center">
        <div className="bg-red-50 rounded-full p-3 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-red-500"
            viewBox="0 0 20 20"
            fill="currentColor">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-text-primary mb-2">
          Failed to Load Data
        </h3>
        <p className="text-text-secondary mb-4 max-w-md">{errors.initial}</p>
        <Button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2">
          Retry Loading
        </Button>
      </div>
    );
  }

  // Render helpers
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
          {availgrades.length > 0 ? (
            availgrades.map((grade) => (
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
            ))
          ) : (
            <div className="w-full text-center py-2 text-text-secondary">
              No grades available
            </div>
          )}
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

  return (
    <>
      {currentView_Main === "EDIT_WEEK_VIEW" && weekToEdit ? (
        <EditWeekForm
          week={weekToEdit}
          centers={availcenters}
          onSuccess={(t, d) => {
            fetchWeeks();
            updateWeekView(t, d);
            setCurrentView_Main("MATERIAL_VIEW");
            setWeekToEdit(null);
          }}
          onCancel={() => {
            setCurrentView_Main(selectedWeek ? "MATERIAL_VIEW" : "WEEKS_VIEW");
            setWeekToEdit(null);
          }}
          access={access}
        />
      ) : currentView_Main === "MATERIAL_VIEW" ? (
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
            <div className="flex items-center gap-3 flex-wrap">
              <Dialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="flex items-center gap-2 h-fit py-2 px-4 rounded-full">
                    <Trash2 className="h-4 w-4" />
                    Delete Week
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Study Week?</DialogTitle>
                    <DialogDescription>
                      Are you sure to delete {selectedWeek?.title}? All its
                      materials will be deleted as well.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button
                        variant="outline"
                        onClick={() => setIsDeleteDialogOpen(false)}
                        disabled={isDeleting}
                        className="hover:bg-bg-secondary">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      variant="destructive"
                      onClick={deleteWeek}
                      disabled={isDeleting}>
                      {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button
                onClick={() => {
                  setWeekToEdit(selectedWeek);
                  setCurrentView_Main("EDIT_WEEK_VIEW");
                }}
                className="flex items-center gap-2 bg-primary text-text-inverse hover:bg-primary-hover h-fit py-2 px-4 rounded-full">
                <Pencil className="h-4 w-4" />
                Edit Week
              </Button>
              <Button
                onClick={() => setCurrentView_Main("ADD_MATERIAL_VIEW")}
                className="flex items-center gap-2 bg-primary text-text-inverse hover:bg-primary-hover h-fit py-2 px-4 rounded-full">
                <Plus size={16} />
                Add Material
              </Button>
            </div>
          </div>

          {errors.materials && (
            <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-100 flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="font-medium text-red-700">
                  Error loading materials
                </p>
                <p className="text-sm text-red-600">{errors.materials}</p>
              </div>
            </div>
          )}

          {loadingStates.materials ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <MaterialCardSkeleton key={index} />
              ))}
            </div>
          ) : weekMaterials.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 border border-border-default rounded-xl bg-bg-secondary">
              <div className="bg-blue-100 rounded-full p-4 mb-5">
                <FontAwesomeIcon
                  icon={faBook}
                  className="text-blue-500 text-2xl"
                />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">
                No Study Materials
              </h3>
              <p className="text-text-secondary mb-6 max-w-md text-center">
                This week doesn&apos;t have any materials yet. Add your first
                material to get started.
              </p>
              <Button
                onClick={() => setCurrentView_Main("ADD_MATERIAL_VIEW")}
                className="flex items-center gap-2">
                <Plus size={16} />
                Add Material
              </Button>
            </div>
          ) : (
            <MaterialCardsGrid
              materials={weekMaterials.map(mapToMaterialCardData)}
              onClick_AddMaterial={() =>
                setCurrentView_Main("ADD_MATERIAL_VIEW")
              }
              onEdit={handleEditMaterial}
              onDelete={handleDeleteMaterial}
            />
          )}
        </>
      ) : currentView_Main === "ADD_MATERIAL_VIEW" ? (
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
      ) : currentView_Main === "EDIT_MATERIAL_VIEW" && materialToEdit ? (
        <>
          {renderBackButton_Materials()}
          <MaterialEditForm
            material={materialToEdit}
            onSuccess={() => {
              fetchMaterials();
              setCurrentView_Main("MATERIAL_VIEW");
              setMaterialToEdit(null);
            }}
            onCancel={() => {
              setCurrentView_Main("MATERIAL_VIEW");
              setMaterialToEdit(null);
            }}
            access={access}
          />
        </>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid gap-6 mb-8 grid-cols-1 sm:grid-cols-2">
            <StatCard
              title="Total Weeks"
              value={
                weeks.filter((week) =>
                  selectedGrade ? week.grade.id === selectedGrade : true
                ).length
              }
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
              value={
                materials.filter((m) =>
                  selectedGrade
                    ? m.week_details.grade.id === selectedGrade
                    : true
                ).length
              }
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
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
              <GradeSidebar
                availgrades={availgrades}
                selectedGrade={selectedGrade}
                setSelectedGrade={setSelectedGrade}
                materialCounts={materialCounts}
                loading={loadingStates.initialData}
              />
            </div>

            {/* Main Content */}
            <div>
              {errors.weeks && (
                <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-100 flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0 text-red-500"
                    viewBox="0 0 20 20"
                    fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="font-medium text-red-700">
                      Error loading weeks
                    </p>
                    <p className="text-sm text-red-600">{errors.weeks}</p>
                  </div>
                </div>
              )}

              {currentView === "LIST_VIEW" ? (
                <>
                  {/* Mobile Tabs */}
                  {renderMobileTabs()}

                  <WeekList
                    weeks={weeks}
                    materials={materials}
                    loading={loadingStates.weeks}
                    onWeekClick={(week) => {
                      setSelectedWeek(week);
                      setCurrentView_Main("MATERIAL_VIEW");
                    }}
                    onAddWeek={navigateToAddWeek}
                    selectedGrade={selectedGrade}
                    availgrades={availgrades}
                  />
                </>
              ) : (
                <WeekForm
                  grades={availgrades}
                  centers={availcenters}
                  onSuccess={handleWeekAdded}
                  onCancel={navigateBackToList}
                  access={access}
                  selectedgrade={selectedGrade || 0}
                />
              )}
            </div>
          </div>
        </>
      )}
      <MaterialDeleteDialog
        material={materialToDelete}
        isOpen={!!materialToDelete}
        onClose={() => setMaterialToDelete(null)}
        onSuccess={handleMaterialDeleted}
        access={access}
      />
    </>
  );
}
