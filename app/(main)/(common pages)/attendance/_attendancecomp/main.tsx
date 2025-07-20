"use client";

import { Button } from "@/components/ui/button";
import { GradeType, showToast } from "../../students/_students comps/main";
import {
  Calendar,
  FileText,
  MapPin,
  StickyNote,
  Loader2,
  Users,
  ArrowLeft,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  createContext,
  useCallback,
  useRef,
} from "react";
import { api } from "@/lib/axiosinterceptor";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TableData from "./tabledata";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import AttendanceForm from "./attendanceForm";
import { Student } from "@/app/(main)/admin/students/_studentscomp/mainpage";
import { homework } from "./context";
import React from "react";
import AddSessionForm from "../../sessions/_sessions_comps/addSessionForm";

const djangoApi = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;

/**
 * Main view types for the attendance management page
 * - SESSIONDETAILS_TAB: Shows session selection and details
 * - TAKINGATTENDANCE_TAB: Shows attendance form for a selected session
 */
type mainViewType = "SESSIONDETAILS_TAB" | "TAKINGATTENDANCE_TAB";

interface AttendanceManagementPageProps {
  access: string; // Access token for API requests
}

export interface Attendance_StudentType {
  id: number;
  full_name: string;
  student_id: string;
}

/**
 * Represents a session object
 */
interface SessionType {
  id: number;
  date: string;
  title: string;
  notes: string;
  grade: GradeType;
  center: GradeType;
  teacher_name: string;
  created_at: string;
  students: Attendance_StudentType[];
  has_homework: boolean;
  has_test: boolean;
}

/**
 * Context type for providing student data to components
 */
interface AllStudentsContextType {
  allStudents: Student[];
  setAllStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  refetchSession: (sessionId: number) => void;
}

export const AllStudentsContext = createContext<AllStudentsContextType>({
  allStudents: [],
  setAllStudents: () => {},
  refetchSession: () => {},
});

/**
 * Memoized component to display session information
 */
const SessionInfoSection = React.memo(
  ({
    session,
    dateFormatter,
  }: {
    session: SessionType;
    dateFormatter: Intl.DateTimeFormat;
  }) => (
    <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-l-4 border-primary shadow-md hover:shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <Badge
              variant="secondary"
              className="px-3 py-1 bg-primary/10 text-primary">
              <Users className="w-4 h-4 mr-2" />
              {session.grade.name}
            </Badge>
            <h2 className="text-lg font-semibold text-gray-700">
              Attendance Session
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-500" />
                <div>
                  <span className="text-xs text-gray-500">Center</span>
                  <p className="font-medium text-gray-800">
                    {session.center.name}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-500" />
                <div>
                  <span className="text-xs text-gray-500">Title</span>
                  <p className="font-medium text-gray-800">{session.title}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                <div>
                  <span className="text-xs text-gray-500">Date</span>
                  <p className="font-medium text-amber-700">
                    {dateFormatter.format(new Date(session.date))}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-green-500" />
                <div>
                  <span className="text-xs text-gray-500">Description</span>
                  <p className="font-medium text-gray-800 line-clamp-1">
                    {session.notes || "No Description provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
);

SessionInfoSection.displayName = "SessionInfoSection";

/**
 * Memoized component for grade selection filter
 */
const GradeFilter = React.memo(
  ({
    availGrades,
    selectedGrade,
    setSelectedGrade,
    setSelectedCenter,
    setSelectedSessionId,
    gradeMap,
  }: {
    availGrades: GradeType[];
    selectedGrade: number | null;
    setSelectedGrade: React.Dispatch<React.SetStateAction<number | null>>;
    setSelectedCenter: React.Dispatch<React.SetStateAction<number | null>>;
    setSelectedSessionId: React.Dispatch<React.SetStateAction<number | null>>;
    gradeMap: Map<number, GradeType>;
  }) => (
    <div className="space-y-2">
      <Label className="text-gray-700">Select Grade</Label>
      <Select
        value={selectedGrade?.toString() || ""}
        onValueChange={(value) => {
          setSelectedGrade(value ? Number(value) : null);
          setSelectedCenter(null); // Reset center when grade changes
          setSelectedSessionId(null); // Reset session when grade changes
        }}>
        <SelectTrigger className="w-full bg-white border-gray-300">
          <SelectValue placeholder="Choose a grade" />
        </SelectTrigger>
        <SelectContent className="bg-white border-gray-200 shadow-lg">
          {availGrades.map((grade) => (
            <SelectItem
              key={grade.id}
              value={grade.id.toString()}
              className="text-gray-700 hover:bg-gray-50 focus:bg-gray-50">
              {gradeMap.get(grade.id)?.name || grade.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
);

GradeFilter.displayName = "GradeFilter";

/**
 * Memoized component for center selection filter
 */
const CenterFilter = React.memo(
  ({
    availCenters,
    selectedCenter,
    setSelectedCenter,
    setSelectedSessionId,
    centerMap,
  }: {
    availCenters: GradeType[];
    selectedCenter: number | null;
    setSelectedCenter: React.Dispatch<React.SetStateAction<number | null>>;
    setSelectedSessionId: React.Dispatch<React.SetStateAction<number | null>>;
    centerMap: Map<number, GradeType>;
  }) => (
    <div className="space-y-2">
      <Label className="text-gray-700">Select Center</Label>
      <Select
        value={selectedCenter?.toString() || ""}
        onValueChange={(value) => {
          setSelectedCenter(value ? Number(value) : null);
          setSelectedSessionId(null); // Reset session when center changes
        }}
        disabled={!availCenters.length} // Disable if no centers available
      >
        <SelectTrigger className="w-full bg-white border-gray-300">
          <SelectValue
            placeholder={
              availCenters.length === 0
                ? "Select a grade first"
                : "Choose a center"
            }
          />
        </SelectTrigger>
        <SelectContent className="bg-white border-gray-200 shadow-lg">
          {availCenters.map((center) => (
            <SelectItem
              key={center.id}
              value={center.id.toString()}
              className="text-gray-700 hover:bg-gray-50 focus:bg-gray-50">
              {centerMap.get(center.id)?.name || center.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
);

CenterFilter.displayName = "CenterFilter";

/**
 * Memoized component for session selection filter
 */
const SessionFilter = React.memo(
  ({
    selectedGrade,
    selectedCenter,
    filteredSessions,
    selectedSessionId,
    handleSessionChange,
    dateFormatter,
  }: {
    selectedGrade: number | null;
    selectedCenter: number | null;
    filteredSessions: SessionType[];
    selectedSessionId: number | null;
    handleSessionChange: (sessionId: number) => void;
    dateFormatter: Intl.DateTimeFormat;
  }) => (
    <div className="space-y-2">
      <Label className="text-gray-700">Select Session</Label>
      <Select
        value={selectedSessionId?.toString() || ""}
        onValueChange={(value) => value && handleSessionChange(parseInt(value))}
        disabled={
          !selectedGrade || !selectedCenter || !filteredSessions.length
        }>
        <SelectTrigger className="w-full bg-white border-gray-300">
          <SelectValue
            placeholder={
              !selectedGrade
                ? "Select a grade first"
                : !selectedCenter
                ? "Select a center first"
                : filteredSessions.length === 0
                ? "No sessions available"
                : "Choose a session"
            }
          />
        </SelectTrigger>
        <SelectContent className="bg-white border-gray-200 shadow-lg max-h-60 overflow-y-auto">
          {filteredSessions.length > 0 ? (
            filteredSessions.map((session) => (
              <SelectItem
                key={session.id}
                value={session.id.toString()}
                className="text-gray-700 hover:bg-gray-50 focus:bg-gray-50">
                <div className="flex gap-3 min-w-0">
                  <span className="font-medium truncate">{session.title}</span>
                  <span
                    className="text-xs text-gray-500 truncate max-w-[200px]"
                    title={session.notes || "No description"}>
                    {session.notes || "No description"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {dateFormatter.format(new Date(session.date))}
                  </span>
                </div>
              </SelectItem>
            ))
          ) : (
            <div className="py-3 px-4 text-sm text-gray-500 text-center">
              {selectedGrade && selectedCenter
                ? "No sessions found for this grade and center"
                : "Please select both grade and center"}
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  )
);

SessionFilter.displayName = "SessionFilter";

/**
 * Main Attendance Management Page Component
 */
export default function AttendanceManagementPage({
  access,
}: AttendanceManagementPageProps) {
  // State management
  const [sessions, setSessions] = useState<SessionType[]>([]);
  const [availGrades, setAvailGrades] = useState<GradeType[]>([]);
  const [availCenters, setAvailCenters] = useState<GradeType[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<number | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    null
  );
  const [mainView, setMainView] = useState<mainViewType>("SESSIONDETAILS_TAB");
  const [isLoading, setIsLoading] = useState(true);
  const [isSessionLoading, setIsSessionLoading] = useState(false);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [hasHomework, setHasHomework] = useState(false);
  const [preventNavigation, setPreventNavigation] = useState(false);

  // Cache for fetched data
  const sessionCache = useRef<Map<number, SessionType>>(new Map());
  const studentsCache = useRef<Map<number, Student[]>>(new Map());
  const initialDataFetched = useRef(false);

  // Memoized computations
  const filteredSessions = useMemo(() => {
    if (!selectedGrade || !selectedCenter) return [];

    return sessions.filter(
      (session) =>
        session.grade.id === selectedGrade &&
        session.center.id === selectedCenter
    );
  }, [selectedGrade, selectedCenter, sessions]);

  const selectedSessionDetails = useMemo(() => {
    return selectedSessionId
      ? sessions.find((session) => session.id === selectedSessionId)
      : null;
  }, [selectedSessionId, sessions]);

  const gradeMap = useMemo(() => {
    const map = new Map<number, GradeType>();
    availGrades.forEach((grade) => map.set(grade.id, grade));
    return map;
  }, [availGrades]);

  const centerMap = useMemo(() => {
    const map = new Map<number, GradeType>();
    availCenters.forEach((center) => map.set(center.id, center));
    return map;
  }, [availCenters]);

  const dateFormatter = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      weekday: "short",
    });
  }, []);

  // Navigation handlers
  const navigateToTakingAttendance = useCallback(() => {
    setMainView("TAKINGATTENDANCE_TAB");
  }, []);

  const navigateBackToSessionDetails = useCallback(() => {
    if (preventNavigation) {
      showToast(
        "You have unsaved attendance records. Please submit or clear them before leaving.",
        "error"
      );
      return;
    }
    setMainView("SESSIONDETAILS_TAB");
  }, [preventNavigation]);

  // Fetch initial data (sessions, grades, centers)
  useEffect(() => {
    if (initialDataFetched.current) return;

    const controller = new AbortController();
    setIsLoading(true);

    const fetchData = async () => {
      try {
        const [sessionsRes, gradesRes, centersRes] = await Promise.all([
          api.get(`${djangoApi}session/sessions/`, {
            headers: { Authorization: `Bearer ${access}` },
            signal: controller.signal,
          }),
          api.get(`${djangoApi}accounts/grades/`, {
            headers: { Authorization: `Bearer ${access}` },
            signal: controller.signal,
          }),
          api.get(`${djangoApi}accounts/centers/`, {
            headers: { Authorization: `Bearer ${access}` },
            signal: controller.signal,
          }),
        ]);

        setSessions(sessionsRes.data);
        setAvailGrades(gradesRes.data);
        setAvailCenters(centersRes.data);

        // Cache sessions
        sessionsRes.data.forEach((session: SessionType) => {
          sessionCache.current.set(session.id, session);
        });

        initialDataFetched.current = true;
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Fetch error:", error);
          showToast("Failed to load initial data", "error");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, [access]);

  // Fetch students for selected grade
  useEffect(() => {
    if (!selectedGrade) return;

    // Check cache first
    const cachedStudents = studentsCache.current.get(selectedGrade);
    if (cachedStudents) {
      setAllStudents(cachedStudents);
      return;
    }

    const fetchStudents = async () => {
      try {
        const res = await api.get(
          `${djangoApi}accounts/students/?grade_id=${selectedGrade}`,
          { headers: { Authorization: `Bearer ${access}` } }
        );

        // Update cache and state
        studentsCache.current.set(selectedGrade, res.data);
        setAllStudents(res.data);
      } catch (error) {
        console.error("Error fetching students:", error);
        showToast("Failed to load students for this grade", "error");
      }
    };

    fetchStudents();
  }, [selectedGrade, access]);

  // Update homework status when session changes
  useEffect(() => {
    if (selectedSessionDetails) {
      setHasHomework(selectedSessionDetails.has_homework);
    }
  }, [selectedSessionDetails]);

  // Handle session selection
  const handleSessionChange = useCallback(
    async (sessionId: number) => {
      setSelectedSessionId(sessionId);

      // Check cache first
      const cachedSession = sessionCache.current.get(sessionId);
      if (cachedSession && cachedSession.students.length > 0) {
        setSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? cachedSession : s))
        );
        return;
      }

      setIsSessionLoading(true);
      try {
        const res = await api.get(
          `${djangoApi}session/sessions/${sessionId}/`,
          { headers: { Authorization: `Bearer ${access}` } }
        );

        // Update cache and state
        sessionCache.current.set(sessionId, res.data);
        setSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? res.data : s))
        );
      } catch (error) {
        console.error("Error fetching session details:", error);
        showToast("Failed to load session details", "error");
      } finally {
        setIsSessionLoading(false);
      }
    },
    [access]
  );

  // Refetch session data
  const refetchSession = useCallback(
    async (sessionId: number) => {
      try {
        const res = await api.get(
          `${djangoApi}session/sessions/${sessionId}/`,
          { headers: { Authorization: `Bearer ${access}` } }
        );

        // Update cache and state
        sessionCache.current.set(sessionId, res.data);
        setSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? res.data : s))
        );
      } catch (error) {
        console.error("Error refetching session:", error);
        showToast("Failed to refresh session data", "error");
      }
    },
    [access]
  );

  // Memoized context values
  const contextValue = useMemo(
    () => ({
      allStudents,
      setAllStudents,
      refetchSession,
    }),
    [allStudents, refetchSession]
  );

  const homeworkValue = useMemo(() => hasHomework, [hasHomework]);

  // Loading state
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <AllStudentsContext.Provider value={contextValue}>
      <homework.Provider value={homeworkValue}>
        {mainView === "SESSIONDETAILS_TAB" ? (
          <SessionDetailsView
            availGrades={availGrades}
            availCenters={availCenters}
            selectedGrade={selectedGrade}
            selectedCenter={selectedCenter}
            setSelectedGrade={setSelectedGrade}
            setSelectedCenter={setSelectedCenter}
            setSelectedSessionId={setSelectedSessionId}
            gradeMap={gradeMap}
            centerMap={centerMap}
            filteredSessions={filteredSessions}
            selectedSessionId={selectedSessionId}
            handleSessionChange={handleSessionChange}
            dateFormatter={dateFormatter}
            isSessionLoading={isSessionLoading}
            selectedSessionDetails={selectedSessionDetails}
            navigateToTakingAttendance={navigateToTakingAttendance}
            access={access}
          />
        ) : (
          <TakingAttendanceView
            navigateBack={navigateBackToSessionDetails}
            selectedSessionDetails={selectedSessionDetails}
            dateFormatter={dateFormatter}
            selectedSessionId={selectedSessionId}
            access={access}
            preventNavigation={setPreventNavigation}
            refetchSession={refetchSession}
          />
        )}
      </homework.Provider>
    </AllStudentsContext.Provider>
  );
}

/**
 * Component for session details view
 */
const SessionDetailsView = ({
  availGrades,
  availCenters,
  selectedGrade,
  selectedCenter,
  setSelectedGrade,
  setSelectedCenter,
  setSelectedSessionId,
  gradeMap,
  centerMap,
  filteredSessions,
  selectedSessionId,
  handleSessionChange,
  dateFormatter,
  isSessionLoading,
  selectedSessionDetails,
  navigateToTakingAttendance,
  access,
}: {
  availGrades: GradeType[];
  availCenters: GradeType[];
  selectedGrade: number | null;
  selectedCenter: number | null;
  setSelectedGrade: React.Dispatch<React.SetStateAction<number | null>>;
  setSelectedCenter: React.Dispatch<React.SetStateAction<number | null>>;
  setSelectedSessionId: React.Dispatch<React.SetStateAction<number | null>>;
  gradeMap: Map<number, GradeType>;
  centerMap: Map<number, GradeType>;
  filteredSessions: SessionType[];
  selectedSessionId: number | null;
  handleSessionChange: (sessionId: number) => void;
  dateFormatter: Intl.DateTimeFormat;
  isSessionLoading: boolean;
  selectedSessionDetails: SessionType | null | undefined;
  navigateToTakingAttendance: () => void;
  access: string;
}) => (
  <div className="flex flex-col h-full">
    <div className="flex flex-col justify-between gap-4 mb-6 md:flex-row md:items-center">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
          Attendance Management
        </h1>
        <p className="text-sm text-gray-500 sm:text-base">
          Manage and track student attendance for sessions
        </p>
      </div>
      <AddSessionForm access={access}></AddSessionForm>
    </div>

    {/* Three-column filter section */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <GradeFilter
        availGrades={availGrades}
        selectedGrade={selectedGrade}
        setSelectedGrade={setSelectedGrade}
        setSelectedCenter={setSelectedCenter}
        setSelectedSessionId={setSelectedSessionId}
        gradeMap={gradeMap}
      />

      <CenterFilter
        availCenters={availCenters}
        selectedCenter={selectedCenter}
        setSelectedCenter={setSelectedCenter}
        setSelectedSessionId={setSelectedSessionId}
        centerMap={centerMap}
      />

      <SessionFilter
        selectedGrade={selectedGrade}
        selectedCenter={selectedCenter}
        filteredSessions={filteredSessions}
        selectedSessionId={selectedSessionId}
        handleSessionChange={handleSessionChange}
        dateFormatter={dateFormatter}
      />
    </div>

    {/* Session information */}
    {selectedSessionDetails && (
      <SessionInfoSection
        session={selectedSessionDetails}
        dateFormatter={dateFormatter}
      />
    )}

    {/* Attendance table */}
    <div className="flex-1 overflow-y-auto">
      <div className="h-full bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        {isSessionLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : selectedSessionDetails ? (
          <>
            {selectedSessionDetails.students.length > 0 ? (
              <TableData
                attended_students={selectedSessionDetails.students}
                onNav={navigateToTakingAttendance}
                centerid={selectedSessionDetails.center.id}
                access={access}
                sessionID={selectedSessionDetails.id}
              />
            ) : (
              <EmptySessionView onTakeAttendance={navigateToTakingAttendance} />
            )}
          </>
        ) : (
          <SelectSessionPrompt />
        )}
      </div>
    </div>
  </div>
);

SessionDetailsView.displayName = "SessionDetailsView";

/**
 * Component for taking attendance view
 */
const TakingAttendanceView = ({
  navigateBack,
  selectedSessionDetails,
  dateFormatter,
  selectedSessionId,
  access,
  preventNavigation,
  refetchSession,
}: {
  navigateBack: () => void;
  selectedSessionDetails: SessionType | null | undefined;
  dateFormatter: Intl.DateTimeFormat;
  selectedSessionId: number | null;
  access: string;
  preventNavigation: (shouldPrevent: boolean) => void;
  refetchSession: (sessionId: number) => void;
}) => (
  <div className="flex flex-col h-full">
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={navigateBack}
            className="rounded-full border border-gray-300 hover:bg-gray-50">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">
            Taking Attendance
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={navigateBack}
            className="border-gray-300 text-gray-700 hover:bg-gray-50">
            Cancel
          </Button>
          <Button className="bg-primary hover:bg-primary/90 shadow-md transition-all">
            Save Attendance
          </Button>
        </div>
      </div>
    </div>

    {/* Session information */}
    {selectedSessionDetails && (
      <SessionInfoSection
        session={selectedSessionDetails}
        dateFormatter={dateFormatter}
      />
    )}

    {/* Attendance form */}
    <div className="flex-1 bg-bg-secondary rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Student Attendance
        </h3>
        <p className="text-gray-500">
          Mark students as present or absent for this session
        </p>
      </div>
      <AttendanceForm
        sessionId={selectedSessionId}
        access={access}
        preventNavigation={preventNavigation}
        refetchSession={refetchSession}
      />
    </div>
  </div>
);

TakingAttendanceView.displayName = "TakingAttendanceView";

/**
 * Loading skeleton placeholder
 */
const LoadingSkeleton = () => (
  <div className="flex flex-col h-full p-6">
    <div className="flex flex-col gap-6 mb-8">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 bg-gray-200" />
          <Skeleton className="h-5 w-80 bg-gray-200" />
        </div>
        <Skeleton className="h-9 w-40 bg-gray-200" />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {[...Array(3)].map((_, i) => (
        <div className="space-y-2" key={i}>
          <Skeleton className="h-5 w-32 bg-gray-200" />
          <Skeleton className="h-10 w-full bg-gray-200" />
        </div>
      ))}
    </div>

    <div className="mb-8">
      <Skeleton className="h-40 w-full rounded-xl bg-gray-200" />
    </div>

    <div className="flex-1">
      <Skeleton className="h-96 w-full rounded-xl bg-gray-200" />
    </div>
  </div>
);

LoadingSkeleton.displayName = "LoadingSkeleton";

/**
 * Component for empty session state
 */
const EmptySessionView = ({
  onTakeAttendance,
}: {
  onTakeAttendance: () => void;
}) => (
  <div className="text-center flex flex-col items-center justify-center h-full py-12">
    <div className="bg-blue-50 rounded-full p-4 mb-6">
      <Users className="w-12 h-12 text-blue-500" />
    </div>
    <h3 className="text-xl font-semibold text-gray-800 mb-2">
      No Attendance Recorded
    </h3>
    <p className="text-gray-500 mb-6 max-w-md">
      This session doesn&apos;t have any attendance records yet. Start taking
      attendance now.
    </p>
    <Button
      onClick={onTakeAttendance}
      className="bg-primary hover:bg-primary/90 px-6 py-3 shadow-md transition-all">
      Take Attendance
    </Button>
  </div>
);

EmptySessionView.displayName = "EmptySessionView";

/**
 * Component for session selection prompt
 */
const SelectSessionPrompt = () => (
  <div className="flex flex-col items-center justify-center h-full py-12">
    <div className="bg-gray-100 rounded-full p-5 mb-6">
      <FileText className="w-12 h-12 text-gray-400" />
    </div>
    <h3 className="text-xl font-semibold text-gray-800 mb-2">
      Select a Session
    </h3>
    <p className="text-gray-500 text-center max-w-md">
      Choose a grade, center, and session from the dropdowns above to view or
      manage attendance records.
    </p>
  </div>
);
SelectSessionPrompt.displayName = "SelectSessionPrompt";
