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
  School,
  Trash2,
  UsersRound,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { showToast } from "../students/_students comps/main";
import EditSessionDialog from "./_sessions_comps/editSessionForm";
import { Skeleton } from "@/components/ui/skeleton";

type currentViewType = "main" | "sessionDetails";

export default function Main({
  access,
  role,
}: {
  access: string;
  role: string;
}) {
  const [currentView, setCurrentView] = useState<currentViewType>("main");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterGradesOpen, setIsFilterGradesOpen] = useState(false);
  const [isFilterCentersOpen, setIsFilterCentersOpen] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<string | number>("all");
  const [selectedGrade, setSelectedGrade] = useState<string | number>("all");
  const [sId, setSId] = useState<SessionType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteing, setIsDeleteing] = useState(false);
  const [deletingSessionId, setDeletingSessionId] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  // For edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<SessionType | null>(
    null
  );

  const sessions = useSessionsStore((state) => state.allSessions);
  const setSessions = useSessionsStore((state) => state.updateSessions);
  const deleteSession = useSessionsStore((state) => state.deleteSession);
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

  // Precompute attendance data
  const attendanceData = useMemo(() => {
    const data: Record<number, { total: number; attended: number }> = {};

    sessions.forEach((session) => {
      const total = students.filter(
        (student) =>
          student.grade.id === session.grade?.id &&
          student.center.id === session.center?.id
      ).length;

      data[session.id] = {
        total,
        attended: session.students.filter(
          (s) => s.center_id === session.center?.id
        ).length,
      };
    });

    return data;
  }, [sessions, students]);

  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoading(true);
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [access, setSessions, setStudents]);

  const navigateBack = () => {
    setCurrentView("main");
  };

  const handleDelete = async () => {
    setIsDeleteing(true);
    try {
      await api.delete(
        `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}session/sessions/${deletingSessionId}/`,
        { headers: { Authorization: `Bearer ${access}` } }
      );
      if (deletingSessionId) {
        deleteSession(deletingSessionId);
      }
      setDeletingSessionId(null);
      showToast("Session deleted successfully", "success");
      setIsDeleteDialogOpen(false);
    } catch {
      showToast("Error deleting session", "error");
    } finally {
      setIsDeleteing(false);
    }
  };

  return (
    <>
      {editingSession && (
        <EditSessionDialog
          session={editingSession}
          access={access}
          open={editDialogOpen}
          setOpen={(v) => {
            setEditDialogOpen(v);
            if (!v) setEditingSession(null);
          }}
        />
      )}

      {currentView === "main" ? (
        <>
          <div className="flex flex-col justify-between gap-4 mb-8 md:flex-row md:items-center">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl dark:text-white">
                Sessions Management
              </h1>
              <p className="text-sm text-gray-500 sm:text-base dark:text-gray-400">
                View and manage all your teaching sessions
              </p>
            </div>
            <AddSessionForm access={access} />
          </div>

          {/* Stat Cards - Skeleton when loading */}
          <div
            className="grid gap-5 mb-8"
            style={{
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
            }}>
            {isLoading ? (
              <>
                <Skeleton className="h-[120px] rounded-xl" />
                <Skeleton className="h-[120px] rounded-xl" />
              </>
            ) : (
              <>
                <StatCard
                  value={sessions.length}
                  title="Total Sessions"
                  icon={<CalendarDays className="text-blue-600" />}
                  iconContainerClass="bg-blue-100 dark:bg-blue-900/30"
                  valueClass="text-blue-700 dark:text-blue-300"
                />
                <StatCard
                  value={centers.length}
                  title="Learning Centers"
                  icon={<School className="text-emerald-600" />}
                  iconContainerClass="bg-emerald-100 dark:bg-emerald-900/30"
                  valueClass="text-emerald-700 dark:text-emerald-300"
                />
              </>
            )}
          </div>

          <div className="w-full p-4 sm:p-6 bg-bg-secondary rounded-2xl border border-border-default dark:bg-gray-900">
            {/* Search and Filters - Skeleton when loading */}
            {isLoading ? (
              <div className="w-full bg-bg-secondary p-4 rounded-xl border border-border-default dark:border-gray-800 flex flex-col md:flex-row gap-4 mb-6">
                <Skeleton className="h-12 rounded-lg" />
                <div className="flex flex-wrap gap-2 w-full">
                  <Skeleton className="h-10 w-32 rounded-full" />
                  <Skeleton className="h-10 w-32 rounded-full" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
              </div>
            ) : (
              <div className="w-full bg-bg-secondary p-4 rounded-xl border border-border-default dark:border-gray-800 flex flex-col md:flex-row gap-4 mb-6">
                {/* Search input */}
                <div className="flex-grow">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by session title..."
                    className="w-full bg-white dark:bg-gray-800"
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
                      <Command className="rounded-lg border border-border-default dark:border-gray-700">
                        <CommandInput placeholder="Search grade..." />
                        <CommandList className="max-h-48">
                          <CommandItem
                            onSelect={() => setSelectedGrade("all")}
                            className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                            All Grades
                          </CommandItem>
                          {grades?.map((grade) => (
                            <CommandItem
                              key={grade.id}
                              onSelect={() => {
                                setSelectedGrade(grade.id.toString());
                                setIsFilterGradesOpen(false);
                              }}
                              className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
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
                      <Command className="rounded-lg border border-border-default dark:border-gray-700">
                        <CommandInput placeholder="Search center..." />
                        <CommandList className="max-h-48">
                          <CommandItem
                            onSelect={() => setSelectedCenter("all")}
                            className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                            All Centers
                          </CommandItem>
                          {centers?.map((center) => (
                            <CommandItem
                              key={center.id}
                              onSelect={() => {
                                setSelectedCenter(center.id.toString());
                                setIsFilterCentersOpen(false);
                              }}
                              className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
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
            )}

            {/* Session Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {isLoading ? (
                // Skeleton loading state
                Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-2xl border border-border-default dark:border-gray-700 p-5 sm:p-6 relative min-w-0 h-full flex flex-col">
                    {/* Header skeleton */}
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0 w-full">
                        <div className="flex items-center gap-2 mb-3">
                          <Skeleton className="h-6 w-24 rounded-full" />
                          <Skeleton className="h-4 w-20 rounded" />
                        </div>
                        <Skeleton className="h-6 w-3/4 mb-2 rounded" />
                        <Skeleton className="h-4 w-full rounded" />
                        <Skeleton className="h-4 w-5/6 mt-1 rounded" />
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                    </div>

                    {/* Separator */}
                    <div className="my-4 border-t border-border-default dark:border-gray-700"></div>

                    {/* Details skeleton */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="w-full">
                          <Skeleton className="h-4 w-16 mb-2 rounded" />
                          <Skeleton className="h-5 w-32 rounded" />
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="w-full">
                          <Skeleton className="h-4 w-16 mb-2 rounded" />
                          <Skeleton className="h-5 w-32 rounded" />
                        </div>
                      </div>
                    </div>

                    {/* Separator */}
                    <div className="my-4 border-t border-border-default dark:border-gray-700"></div>

                    {/* Attendance skeleton */}
                    <div className="mt-auto">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex items-center gap-4">
                          <Skeleton className="w-14 h-14 rounded-full" />
                          <div>
                            <Skeleton className="h-4 w-20 mb-1 rounded" />
                            <Skeleton className="h-4 w-32 rounded" />
                          </div>
                        </div>
                        <Skeleton className="h-10 w-36 rounded-lg" />
                      </div>
                    </div>
                  </div>
                ))
              ) : filteredSessions.length > 0 ? (
                filteredSessions.map((session) => {
                  const { total, attended } = attendanceData[session.id] || {
                    total: 0,
                    attended: 0,
                  };
                  const attendanceRate =
                    total > 0 ? Math.round((attended / total) * 100) : 0;

                  return (
                    <div
                      key={session.id}
                      className="bg-white dark:bg-gray-800 rounded-2xl border border-border-default dark:border-gray-700 p-5 sm:p-6 relative transition-all hover:shadow-lg min-w-0 h-full flex flex-col">
                      {/* Header section */}
                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="inline-block bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 text-xs font-medium px-3 py-1 rounded-full">
                              {session.grade?.name || "No Grade"}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {session.date
                                ? formatUserDate(session.date, false)
                                : "No date"}
                            </span>
                          </div>
                          <h3 className="text-lg sm:text-xl font-bold text-text-primary dark:text-white truncate">
                            {session.title}
                          </h3>
                          <div className="mt-2 text-text-secondary dark:text-gray-400">
                            <p className="text-sm line-clamp-3 break-words">
                              {session.notes || "No description available"}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            className="p-2 text-text-secondary dark:text-gray-400 hover:text-primary transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                            aria-label="Edit session"
                            onClick={() => {
                              setEditingSession(session);
                              setEditDialogOpen(true);
                            }}>
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-text-secondary dark:text-gray-400 hover:text-destructive transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                            aria-label="Delete session"
                            onClick={() => {
                              setIsDeleteDialogOpen(true);
                              setDeletingSessionId(session.id);
                            }}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Separator */}
                      <div className="my-4 border-t border-border-default dark:border-gray-700"></div>

                      {/* Details section */}
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          </div>
                          <div>
                            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Center
                            </h4>
                            <p className="font-medium break-words mt-1">
                              {session.center?.name || "No center assigned"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          </div>
                          <div>
                            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Time
                            </h4>
                            <p className="font-medium mt-1">
                              {session.date
                                ? formatUserDate(session.date, false)
                                : "No time set"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <UsersRound className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          </div>
                          <div>
                            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Total Attendance
                            </h4>
                            <p className="font-medium mt-1">
                              {session.students.length}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Separator */}
                      <div className="my-4 border-t border-border-default dark:border-gray-700"></div>

                      {/* Attendance section */}
                      <div className="mt-auto">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="flex items-center gap-4">
                            <div className="relative w-14 h-14">
                              <svg
                                className="progress-ring w-14 h-14"
                                width="56"
                                height="56"
                                viewBox="0 0 56 56">
                                <circle
                                  className="progress-ring__circle"
                                  stroke="#e5e7eb"
                                  strokeWidth="4"
                                  fill="transparent"
                                  r="22"
                                  cx="28"
                                  cy="28"
                                />
                                <circle
                                  className="progress-ring__circle"
                                  stroke={
                                    attendanceRate >= 70
                                      ? "#10b981"
                                      : attendanceRate >= 40
                                      ? "#f59e0b"
                                      : "#ef4444"
                                  }
                                  strokeWidth="4"
                                  strokeLinecap="round"
                                  strokeDasharray="138"
                                  strokeDashoffset={
                                    (138 * (100 - attendanceRate)) / 100
                                  }
                                  fill="transparent"
                                  r="22"
                                  cx="28"
                                  cy="28"
                                  transform="rotate(-90 28 28)"
                                />
                              </svg>
                              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                                {attendanceRate}%
                              </span>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Attendance (from {session.center.name})
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {attended} of {total} students
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setCurrentView("sessionDetails");
                              setSId(session);
                            }}
                            className="text-primary hover:text-primary-dark flex items-center gap-1.5 font-medium px-4 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                            <Eye className="w-5 h-5" />
                            <span>View Details</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-16 text-center rounded-xl border border-border-default dark:border-gray-700 bg-white dark:bg-gray-800">
                  <div className="text-gray-400 dark:text-gray-500 mb-4">
                    <CalendarDays className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">
                    No sessions found
                  </h3>
                  <p className="text-md text-gray-500 dark:text-gray-400 mt-2 mb-6 max-w-md mx-auto">
                    Try adjusting your search criteria or create a new session
                  </p>
                  <Button
                    variant="outline"
                    onClick={resetFilters}
                    className="mr-3">
                    Clear Filters
                  </Button>
                  <AddSessionForm access={access} />
                </div>
              )}
            </div>
          </div>
          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Are you sure you want to delete this session?
                </DialogTitle>
                <DialogDescription>
                  This action cannot be undone!
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  disabled={isDeleteing}
                  className="hover:bg-bg-secondary">
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleteing}>
                  {isDeleteing ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </div>
                  ) : (
                    "Delete"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <SessionDetails
          selected_session={sId}
          access={access}
          navigateBack={navigateBack}
          role={role}
        />
      )}
    </>
  );
}
