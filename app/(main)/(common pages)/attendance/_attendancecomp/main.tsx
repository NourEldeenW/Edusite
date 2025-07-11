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

type mainViewType = "SESSIONDETAILS_TAB" | "TAKINGATTENDANCE_TAB";

interface AttendanceManagementPageProps {
  access: string;
}

export interface Attendance_StudentType {
  id: number;
  full_name: string;
  student_id: string;
}

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

interface AllStudentsContextType {
  allStudents: Student[];
  setAllStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  refetchsessions: () => void;
}

export const AllStudentsContext = createContext<AllStudentsContextType>({
  allStudents: [],
  setAllStudents: () => {},
  refetchsessions: () => {},
});

// Memoized Session Info Component
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
// Memoized Grade Filter Component
const GradeFilter = React.memo(
  ({
    availGrades,
    selectedGrade,
    setSelectedGrade,
    setSelectedSessionId,
    gradeMap,
  }: {
    availGrades: GradeType[];
    selectedGrade: number | null;
    setSelectedGrade: React.Dispatch<React.SetStateAction<number | null>>;
    setSelectedSessionId: React.Dispatch<React.SetStateAction<number | null>>;
    gradeMap: Map<number, GradeType>;
  }) => (
    <div className="space-y-2">
      <Label className="text-gray-700">Select Grade</Label>
      <Select
        value={selectedGrade?.toString() || ""}
        onValueChange={(value) => {
          setSelectedGrade(value ? Number(value) : null);
          setSelectedSessionId(null);
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
// Memoized Session Filter Component
const SessionFilter = React.memo(
  ({
    selectedGrade,
    filteredSessions,
    selectedSessionId,
    handleSessionChange,
    dateFormatter,
  }: {
    selectedGrade: number | null;
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
        disabled={!selectedGrade || !filteredSessions.length}>
        <SelectTrigger className="w-full bg-white border-gray-300">
          <SelectValue
            placeholder={
              !selectedGrade
                ? "Select a grade first"
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
                <div className="flex gap-5 items-center">
                  <span className="font-medium">{session.title}</span>
                  <span className="text-xs text-gray-500">
                    {dateFormatter.format(new Date(session.date))}
                  </span>
                </div>
              </SelectItem>
            ))
          ) : (
            <div className="py-3 px-4 text-sm text-gray-500 text-center">
              {selectedGrade
                ? "No sessions found for this grade"
                : "Please select a grade"}
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  )
);

SessionFilter.displayName = "SessionFilter";
// Main Component
export default function AttendanceManagementPage({
  access,
}: AttendanceManagementPageProps) {
  const [sessions, setSessions] = useState<SessionType[]>([]);
  const [availGrades, setAvailGrades] = useState<GradeType[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    null
  );
  const [mainView, setMainView] = useState<mainViewType>("SESSIONDETAILS_TAB");
  const [isLoading, setIsLoading] = useState(true);
  const [isSessionLoading, setIsSessionLoading] = useState(false);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [hasHomework, setHasHomework] = useState(false);
  const [refCounter, setRefCounter] = useState(0);
  const [preventNavigation, setPreventNavigation] = useState(false);

  const refetchsessions = useCallback(() => {
    setRefCounter((prev) => prev + 1);
  }, []);

  // Memoized computations
  const filteredSessions = useMemo(() => {
    return selectedGrade
      ? sessions.filter((session) => session.grade.id === selectedGrade)
      : [];
  }, [selectedGrade, sessions]);

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

  const dateFormatter = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      weekday: "short",
    });
  }, []);

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
    refetchsessions();
  }, [preventNavigation, refetchsessions]);

  // Fetch sessions and grades
  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);

    const fetchData = async () => {
      try {
        const [sessionsRes, gradesRes] = await Promise.all([
          api.get(`${djangoApi}session/sessions/`, {
            headers: { Authorization: `Bearer ${access}` },
            signal: controller.signal,
          }),
          api.get(`${djangoApi}accounts/grades/`, {
            headers: { Authorization: `Bearer ${access}` },
            signal: controller.signal,
          }),
        ]);

        setSessions(sessionsRes.data);
        setAvailGrades(gradesRes.data);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Fetch error:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, [access, refCounter]);

  // Fetch students when grade changes
  useEffect(() => {
    if (!selectedGrade) return;

    const fetchStudents = async () => {
      try {
        const res = await api.get(
          `${djangoApi}accounts/students/?grade_id=${selectedGrade}`,
          { headers: { Authorization: `Bearer ${access}` } }
        );
        setAllStudents(res.data);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchStudents();
  }, [selectedGrade, access]);

  useEffect(() => {
    if (selectedSessionDetails) {
      setHasHomework(selectedSessionDetails.has_homework);
    }
  }, [selectedSessionDetails]);

  const handleSessionChange = useCallback(
    async (sessionId: number) => {
      setSelectedSessionId(sessionId);
      setIsSessionLoading(true);

      try {
        const res = await api.get(
          `${djangoApi}session/sessions/${sessionId}/`,
          {
            headers: { Authorization: `Bearer ${access}` },
          }
        );

        setSessions((prev) =>
          prev.map((session) => (session.id === sessionId ? res.data : session))
        );
      } finally {
        setIsSessionLoading(false);
      }
    },
    [access]
  );

  // Memoized context values
  const contextValue = useMemo(
    () => ({
      allStudents,
      setAllStudents,
      refetchsessions,
    }),
    [allStudents, refetchsessions]
  );

  const homeworkValue = useMemo(() => hasHomework, [hasHomework]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <AllStudentsContext.Provider value={contextValue}>
      <homework.Provider value={homeworkValue}>
        {mainView === "SESSIONDETAILS_TAB" ? (
          <SessionDetailsView
            availGrades={availGrades}
            selectedGrade={selectedGrade}
            setSelectedGrade={setSelectedGrade}
            setSelectedSessionId={setSelectedSessionId}
            gradeMap={gradeMap}
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
          />
        )}
      </homework.Provider>
    </AllStudentsContext.Provider>
  );
}

// Sub-components for better organization
const SessionDetailsView = ({
  availGrades,
  selectedGrade,
  setSelectedGrade,
  setSelectedSessionId,
  gradeMap,
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
  selectedGrade: number | null;
  setSelectedGrade: React.Dispatch<React.SetStateAction<number | null>>;
  setSelectedSessionId: React.Dispatch<React.SetStateAction<number | null>>;
  gradeMap: Map<number, GradeType>;
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

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <GradeFilter
        availGrades={availGrades}
        selectedGrade={selectedGrade}
        setSelectedGrade={setSelectedGrade}
        setSelectedSessionId={setSelectedSessionId}
        gradeMap={gradeMap}
      />

      <SessionFilter
        selectedGrade={selectedGrade}
        filteredSessions={filteredSessions}
        selectedSessionId={selectedSessionId}
        handleSessionChange={handleSessionChange}
        dateFormatter={dateFormatter}
      />
    </div>

    {selectedSessionDetails && (
      <SessionInfoSection
        session={selectedSessionDetails}
        dateFormatter={dateFormatter}
      />
    )}

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
const TakingAttendanceView = ({
  navigateBack,
  selectedSessionDetails,
  dateFormatter,
  selectedSessionId,
  access,
  preventNavigation,
}: {
  navigateBack: () => void;
  selectedSessionDetails: SessionType | null | undefined;
  dateFormatter: Intl.DateTimeFormat;
  selectedSessionId: number | null;
  access: string;
  preventNavigation: (shouldPrevent: boolean) => void;
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

    {selectedSessionDetails && (
      <SessionInfoSection
        session={selectedSessionDetails}
        dateFormatter={dateFormatter}
      />
    )}

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
      />
    </div>
  </div>
);

TakingAttendanceView.displayName = "TakingAttendanceView";
// Additional helper components
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

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="space-y-2">
        <Skeleton className="h-5 w-32 bg-gray-200" />
        <Skeleton className="h-10 w-full bg-gray-200" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-5 w-32 bg-gray-200" />
        <Skeleton className="h-10 w-full bg-gray-200" />
      </div>
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
const SelectSessionPrompt = () => (
  <div className="flex flex-col items-center justify-center h-full py-12">
    <div className="bg-gray-100 rounded-full p-5 mb-6">
      <FileText className="w-12 h-12 text-gray-400" />
    </div>
    <h3 className="text-xl font-semibold text-gray-800 mb-2">
      Select a Session
    </h3>
    <p className="text-gray-500 text-center max-w-md">
      Choose a grade and session from the dropdowns above to view or manage
      attendance records.
    </p>
  </div>
);
SelectSessionPrompt.displayName = "SelectSessionPrompt";
