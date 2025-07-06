"use client";

import { useEffect, useMemo, useState } from "react";
import AddSessionForm from "./_sessions_comps/addSessionForm";
import StatCard from "../students/_students comps/cards";
import useSessionsStore, {
  SessionType,
} from "@/lib/stores/SessionsStores/allSessionsStore";
import {
  BookOpen,
  Building2,
  CalendarDays,
  Check,
  Clock,
  Edit,
  Eye,
  MapPin,
  School,
  Trash2,
  X,
} from "lucide-react";
import useAvail_Grades_CentersStore from "@/lib/stores/SessionsStores/store";
import { api } from "@/lib/axiosinterceptor";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { FilterPopover } from "../students/_students comps/tabledata";
import { formatUserDate } from "@/lib/formatDate";
import SessionDetails from "./_sessions_comps/details";

type currentViewType = "main" | "sessionDetails";

export default function Main({ access }: { access: string }) {
  const [currentView, setCurrentView] = useState<currentViewType>("main");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterGradesOpen, setIsFilterGradesOpen] = useState(false);
  const [isFilterCentersOpen, setIsFilterCentersOpen] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<string | number>("all");
  const [selectedGrade, setSelectedGrade] = useState<string | number>("all");
  const [sId, setSId] = useState<SessionType | null>(null);

  const sessions = useSessionsStore((state) => state.allSessions);
  const setSessions = useSessionsStore((state) => state.updateSessions);
  const centers = useAvail_Grades_CentersStore((state) => state.availCenters);
  const grades = useAvail_Grades_CentersStore((state) => state.availGrades);
  const students = useAvail_Grades_CentersStore((state) => state.allStudents);
  const setStudents = useAvail_Grades_CentersStore(
    (state) => state.updateStudents
  );

  const selectedCenterName = useMemo(
    () =>
      selectedCenter === "all"
        ? "All Centers"
        : centers.find((c) => c.id.toString() === selectedCenter)?.name ||
          "Select Center",
    [selectedCenter, centers]
  );

  const selectedGradeName = useMemo(
    () =>
      selectedGrade === "all"
        ? "All Grades"
        : grades.find((g) => g.id.toString() === selectedGrade)?.name ||
          "Select Grade",
    [selectedGrade, grades]
  );

  // Reset all filters
  const resetFilters = () => {
    setSelectedCenter("all");
    setSelectedGrade("all");
    setSearchQuery("");
  };

  // Filter sessions based on selections
  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      // Search filter (session name)
      const matchesSearch = session.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      // Center filter
      const matchesCenter =
        selectedCenter === "all" ||
        session.center?.id.toString() === selectedCenter;

      // Grade filter
      const matchesGrade =
        selectedGrade === "all" ||
        session.grade?.id.toString() === selectedGrade;

      return matchesSearch && matchesCenter && matchesGrade;
    });
  }, [sessions, searchQuery, selectedCenter, selectedGrade]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const [sessionsres, studentsres] = await Promise.all([
          api.get(
            `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}session/sessions/`,
            { headers: { Authorization: `Bearer ${access}` } }
          ),
          api.get(
            `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}accounts/students/`,
            { headers: { Authorization: `Bearer ${access}` } }
          ),
        ]);
        setStudents(studentsres.data);

        setSessions(sessionsres.data);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    };

    fetchSessions();
  }, [access, setSessions, setStudents]);

  const navigateBack = () => {
    setCurrentView("main");
  };

  if (currentView === "main") {
    return (
      <>
        <div className="flex flex-col justify-between gap-4 mb-6 md:flex-row md:items-center">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
              Sessions Management
            </h1>
            <p className="text-sm text-gray-500 sm:text-base">
              View and manage all your teaching sessions
            </p>
          </div>
          <AddSessionForm access={access} />
        </div>
        <div
          className="grid gap-5 mb-8"
          style={{
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
          }}>
          <StatCard
            value={sessions.length}
            title="Total Sessions"
            icon={<CalendarDays className="text-blue-600" />}
            iconContainerClass="bg-blue-100"
            valueClass="text-blue-700"
          />
          <StatCard
            value={centers.length}
            title="Learning Centers"
            icon={<School className="text-emerald-600" />}
            iconContainerClass="bg-emerald-100"
            valueClass="text-emerald-700"
          />
        </div>
        <div className="w-full p-4 sm:p-6 bg-bg-secondary rounded-2xl border border-border-default">
          <div className="w-full bg-bg-secondary p-4 rounded-xl border border-border-default flex flex-col md:flex-row gap-4 mb-6">
            {/* Search input */}
            <div className="flex-grow">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by session title..."
                className="w-full"
              />
            </div>

            {/* Filters section */}
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-wrap gap-2 w-full">
                <FilterPopover
                  icon={<BookOpen size={16} />}
                  label={selectedGradeName}
                  openState={isFilterGradesOpen}
                  onOpenChange={setIsFilterGradesOpen}>
                  <Command>
                    <CommandInput placeholder="Search grade..." />
                    <CommandList>
                      <CommandItem onSelect={() => setSelectedGrade("all")}>
                        All Grades
                      </CommandItem>
                      {grades?.map((grade) => (
                        <CommandItem
                          key={grade.id}
                          onSelect={() => {
                            setSelectedGrade(grade.id.toString());
                            setIsFilterGradesOpen(false);
                          }}>
                          {grade.name}
                          {grade.id.toString() === selectedGrade && (
                            <Check className="ml-auto" size={16} />
                          )}
                        </CommandItem>
                      ))}
                    </CommandList>
                  </Command>
                </FilterPopover>

                <FilterPopover
                  icon={<Building2 size={16} />}
                  label={selectedCenterName}
                  openState={isFilterCentersOpen}
                  onOpenChange={setIsFilterCentersOpen}>
                  <Command>
                    <CommandInput placeholder="Search center..." />
                    <CommandList>
                      <CommandItem onSelect={() => setSelectedCenter("all")}>
                        All Centers
                      </CommandItem>
                      {centers?.map((center) => (
                        <CommandItem
                          key={center.id}
                          onSelect={() => {
                            setSelectedCenter(center.id.toString());
                            setIsFilterCentersOpen(false);
                          }}>
                          {center.name}
                          {center.id.toString() === selectedCenter && (
                            <Check className="ml-auto" size={16} />
                          )}
                        </CommandItem>
                      ))}
                    </CommandList>
                  </Command>
                </FilterPopover>

                <Button
                  variant="secondary"
                  onClick={resetFilters}
                  className="flex items-center w-fit rounded-full"
                  aria-label="Reset filters">
                  <X size={16} />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredSessions.length > 0 ? (
              filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-border-default p-5 sm:p-6 relative transition-all hover:shadow-lg min-w-0">
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <span className="inline-block bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 text-xs font-medium px-3 py-1 rounded-full mb-3">
                        {session.grade?.name || "No Grade"}
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-text-primary dark:text-dark-text truncate">
                        {session.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-2 text-text-secondary dark:text-dark-text-secondary">
                        <School className="w-4 h-4 flex-shrink-0" />
                        <p className="text-sm line-clamp-2 break-words">
                          {session.notes || "No description available"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        className="p-2 text-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                        aria-label="Edit session">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-text-secondary dark:text-dark-text-secondary hover:text-destructive transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                        aria-label="Delete session">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-text-secondary dark:text-dark-text-secondary mt-0.5 flex-shrink-0" />
                      <span className="font-medium break-words">
                        {session.center?.name || "No center assigned"}
                      </span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Clock className="w-4 h-4 text-text-secondary dark:text-dark-text-secondary mt-0.5 flex-shrink-0" />
                      <span className="font-medium">
                        {session.date
                          ? formatUserDate(session.date, false)
                          : "No schedule"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10">
                        <svg
                          className="progress-ring w-10 h-10"
                          width="40"
                          height="40">
                          <circle
                            className="progress-ring__circle"
                            stroke="#e5e7eb"
                            strokeWidth="3"
                            fill="transparent"
                            r="16"
                            cx="20"
                            cy="20"
                          />
                          <circle
                            className="progress-ring__circle"
                            stroke="#10b981"
                            strokeWidth="3"
                            strokeDasharray="100"
                            strokeDashoffset="25"
                            fill="transparent"
                            r="16"
                            cx="20"
                            cy="20"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                          {session.students.length || 0}/
                          {students.filter(
                            (student) =>
                              student.grade.id === session.grade?.id &&
                              student.center.id === session.center?.id
                          ).length || 0}
                        </span>
                      </div>
                      <span className="text-sm">Attendance rate</span>
                    </div>

                    <button
                      onClick={() => {
                        setCurrentView("sessionDetails");
                        setSId(session);
                      }}
                      className="text-primary hover:text-primary-dark flex items-center gap-1.5 font-medium px-3 py-1.5 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-10 text-center">
                <div className="text-gray-400 dark:text-gray-500 mb-2">
                  <CalendarDays className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  No sessions found
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        </div>
      </>
    );
  } else if (currentView === "sessionDetails") {
    return (
      <SessionDetails
        selected_session={sId}
        access={access}
        navigateBack={navigateBack}
      />
    );
  }
}
