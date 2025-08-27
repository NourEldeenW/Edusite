"use client";
import { Button } from "@/components/ui/button";
import { SessionType } from "@/lib/stores/SessionsStores/allSessionsStore";
import {
  ArrowLeft,
  CalendarDays,
  BookOpen,
  School,
  User,
  AlertCircle,
  Phone,
  Users,
  Edit,
  Save,
  Ban,
  Building2,
} from "lucide-react";
import { formatUserDate } from "@/lib/formatDate";
import { Badge } from "@/components/ui/badge";
import useAvail_Grades_CentersStore from "@/lib/stores/SessionsStores/store";
import { useEffect, useState } from "react";
import { api } from "@/lib/axiosinterceptor";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import EditHis from "./editHIstory";

interface SessionStats {
  session_id: number;
  date: string;
  title: string;
  center: string;
  grade: string;
  total_present: number;
  total_absent: number;
  present_same_center: number;
  present_other_center: number;
  expected_attendance_same_center: number;
}

interface TestScore {
  id: number;
  student: { id: number; full_name: string };
  score: string | null;
  max_score: string;
  percentage: number;
  notes: string;
  corrected_by?: string | { full_name: string };
}

interface HomeworkRecord {
  id: number;
  student: { id: number; full_name: string };
  completed: boolean;
  notes: string;
}

export default function SessionDetails({
  selected_session,
  access,
  navigateBack,
  role,
}: {
  selected_session: SessionType | null;
  access: string;
  navigateBack: () => void;
  role: string;
}) {
  const allStudents = useAvail_Grades_CentersStore(
    (state) => state.allStudents
  );
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [testScores, setTestScores] = useState<TestScore[]>([]);
  const [homeworkRecords, setHomeworkRecords] = useState<HomeworkRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [testScoreSearch, setTestScoreSearch] = useState("");
  const [homeworkSearch, setHomeworkSearch] = useState("");
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingScores, setLoadingScores] = useState(true);
  const [loadingHomework, setLoadingHomework] = useState(true);
  const [isSetMaxScoreDialogOpen, setIsSetMaxScoreDialogOpen] = useState(false);
  const [newMaxScore, setNewMaxScore] = useState("");
  const [isCreatingScores, setIsCreatingScores] = useState(false);
  const [editingScoreId, setEditingScoreId] = useState<number | null>(null);
  const [savingScoreId, setSavingScoreId] = useState<number | null>(null);
  const [refCount, setRefCount] = useState(0);
  const [editableScore, setEditableScore] = useState<{
    score: string;
    notes: string;
  }>({ score: "", notes: "" });

  const sessionStudents = allStudents.filter(
    (student) =>
      selected_session?.students.some((s) => s.id === student.id) ||
      (student.grade.id === selected_session?.grade.id &&
        student.center.id === selected_session?.center.id)
  );

  const formattedDate = selected_session
    ? formatUserDate(selected_session.date, false)
    : "";

  useEffect(() => {
    if (!selected_session) return;
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const response = await api.get(
          `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}session/sessions/${selected_session.id}/stats/`,
          { headers: { Authorization: `Bearer ${access}` } }
        );
        setSessionStats(response.data);
      } catch (error) {
        console.error("Error fetching session stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, [selected_session, access]);

  useEffect(() => {
    if (!selected_session) return;
    const fetchTestScores = async () => {
      try {
        setLoadingScores(true);
        const response = await api.get(
          `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}session/sessions/${selected_session.id}/scores/`,
          { headers: { Authorization: `Bearer ${access}` } }
        );
        setTestScores(response.data);
      } catch (error) {
        console.error("Error fetching test scores:", error);
      } finally {
        setLoadingScores(false);
      }
    };
    if (selected_session.has_test) {
      fetchTestScores();
    } else {
      setLoadingScores(false);
    }
  }, [selected_session, access]);

  useEffect(() => {
    if (!selected_session) return;
    const fetchHomeworkRecords = async () => {
      try {
        setLoadingHomework(true);
        const response = await api.get(
          `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}session/sessions/${selected_session.id}/homework/`,
          { headers: { Authorization: `Bearer ${access}` } }
        );
        setHomeworkRecords(response.data);
      } catch (error) {
        console.error("Error fetching homework records:", error);
      } finally {
        setLoadingHomework(false);
      }
    };
    if (selected_session.has_homework) {
      fetchHomeworkRecords();
    } else {
      setLoadingHomework(false);
    }
  }, [selected_session, access]);

  const handleEditScore = (score: TestScore) => {
    setEditingScoreId(score.id);
    setEditableScore({
      score: score.score ?? "no score",
      notes: score.notes,
    });
  };

  const handleCancelEdit = () => {
    setEditingScoreId(null);
    setEditableScore({ score: "", notes: "" });
  };

  const handleSaveScore = async (
    scoreId: number,
    studentId: number,
    isNew: boolean
  ) => {
    setSavingScoreId(scoreId);
    try {
      // Find the student to get their details
      const student = sessionStudents.find((s) => s.id === studentId);
      if (!student) return;

      // Find the existing score to get max_score if available
      const existingScore = testScores.find((s) => s.student.id === studentId);
      const maxScore = existingScore?.max_score || "0";

      // Create payload
      const payload = {
        student_id: studentId,
        score: parseFloat(editableScore.score),
        max_score: parseFloat(maxScore),
        notes: editableScore.notes,
      };

      let updatedScore: TestScore;
      if (isNew) {
        // Create new score
        const response = await api.post(
          `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}session/sessions/${selected_session?.id}/scores/create/`,
          [payload],
          { headers: { Authorization: `Bearer ${access}` } }
        );
        updatedScore = response.data.success[0];
      } else {
        // Update existing score
        const response = await api.put(
          `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}session/sessions/${selected_session?.id}/scores/${studentId}/`,
          payload,
          { headers: { Authorization: `Bearer ${access}` } }
        );
        updatedScore = response.data;
      }

      // Update local state
      setTestScores((prev) => {
        if (isNew) {
          return [...prev, updatedScore];
        } else {
          return prev.map((score) =>
            score.id === scoreId ? updatedScore : score
          );
        }
      });

      // Reset editing state
      setEditingScoreId(null);
      setEditableScore({ score: "", notes: "" });
    } catch (error) {
      console.error("Failed to save score:", error);
    } finally {
      setSavingScoreId(null);
      setRefCount((prev) => prev + 1);
    }
  };

  const setMaxScoreForSession = async (maxScore: number) => {
    if (!selected_session) return;
    try {
      setIsCreatingScores(true);
      // Set max score
      await api.put(
        `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}session/sessions/${selected_session.id}/set-max-score/`,
        { test_max_score: maxScore },
        { headers: { Authorization: `Bearer ${access}` } }
      );

      // Create scores for attended students
      const attendedStudentIds = selected_session.students.map((s) => s.id);
      const payload = attendedStudentIds.map((student_id) => {
        const existingScore = testScores.find(
          (score) => score.student.id === student_id
        );
        return existingScore
          ? {
              id: existingScore.id,
              student_id,
              score: existingScore.score
                ? parseFloat(existingScore.score)
                : null,
              max_score: maxScore,
              notes: existingScore.notes,
            }
          : {
              student_id,
              score: null,
              max_score: maxScore,
              notes: "",
            };
      });

      await api.post(
        `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}session/sessions/${selected_session.id}/scores/create/`,
        payload,
        { headers: { Authorization: `Bearer ${access}` } }
      );

      // Refresh scores
      const scoresResponse = await api.get(
        `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}session/sessions/${selected_session.id}/scores/`,
        { headers: { Authorization: `Bearer ${access}` } }
      );
      setTestScores(scoresResponse.data);

      setIsSetMaxScoreDialogOpen(false);
      setNewMaxScore("");
    } catch (error) {
      console.error("Failed to set max score:", error);
    } finally {
      setIsCreatingScores(false);
    }
  };

  // Create combined test scores array with both existing and placeholder records
  const testScoresForTable = selected_session
    ? [
        ...testScores,
        ...selected_session.students
          .filter(
            (student) =>
              !testScores.some((score) => score.student.id === student.id)
          )
          .map((student) => ({
            id: -student.id, // Negative ID indicates placeholder
            student: {
              id: student.id,
              full_name: student.full_name,
            },
            score: "0",
            max_score: "0",
            percentage: 0,
            notes: "", // Changed to empty string
          })),
      ]
    : [];

  // Filter and sort students - attended first, then absent
  const filteredStudents = sessionStudents
    .filter(
      (student) =>
        student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.phone_number?.includes(searchQuery) ||
        student.parent_number?.includes(searchQuery)
    )
    .sort((a, b) => {
      // Check attendance status
      const aPresent = selected_session?.students.some((s) => s.id === a.id);
      const bPresent = selected_session?.students.some((s) => s.id === b.id);

      // If both are present or both are absent, sort by name
      if (aPresent === bPresent) {
        return a.full_name.localeCompare(b.full_name);
      }

      // Present students come before absent students
      return aPresent ? -1 : 1;
    });

  const filteredTestScores = testScoresForTable.filter((score) =>
    score.student.full_name
      .toLowerCase()
      .includes(testScoreSearch.toLowerCase())
  );

  const filteredHomeworkRecords = homeworkRecords.filter((hw) =>
    hw.student.full_name.toLowerCase().includes(homeworkSearch.toLowerCase())
  );

  if (!selected_session) {
    return (
      <div className="p-4 sm:p-6 bg-bg-secondary dark:bg-gray-800 rounded-2xl border border-border-default">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <Button variant="outline" onClick={navigateBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Sessions
          </Button>
        </div>
        <div className="py-8 sm:py-12 text-center">
          <div className="bg-gray-100 dark:bg-gray-800 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <CalendarDays className="w-5 h-5 sm:w-8 sm:h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-base sm:text-lg font-medium text-text-primary dark:text-gray-300">
            No session selected
          </h3>
          <p className="text-sm text-text-secondary dark:text-gray-400 mt-1 mb-3 sm:mb-4">
            Please select a session to view details
          </p>
          <Button
            onClick={navigateBack}
            className="flex items-center gap-2 mx-auto px-4 py-2">
            Back to Sessions
          </Button>
        </div>
      </div>
    );
  }

  const attendancePercentage =
    sessionStats && sessionStats.expected_attendance_same_center > 0
      ? Math.round(
          (sessionStats.present_same_center /
            sessionStats.expected_attendance_same_center) *
            100
        )
      : 0;

  const circumference = 2 * Math.PI * 42;
  const dashoffset =
    circumference - (attendancePercentage / 100) * circumference;

  return (
    <div className="w-full">
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={navigateBack}
            className="rounded-full border border-border-default hover:bg-bg-subtle dark:border-gray-600 dark:hover:bg-gray-700">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-text-secondary dark:text-gray-300" />
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary dark:text-gray-100">
            Session Details
          </h1>
        </div>

        {/* Session Info Card */}
        <div className="bg-bg-secondary dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-border-default p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-4 sm:gap-y-6">
            <div>
              <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-text-primary dark:text-gray-100 line-clamp-2">
                    {selected_session.title}
                  </h2>
                  <p className="text-text-secondary dark:text-gray-400 flex items-center gap-1.5 mt-1.5 sm:mt-2 text-sm sm:text-base">
                    <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="truncate max-w-[200px] sm:max-w-none">
                      {formattedDate}
                    </span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="bg-bg-subtle dark:bg-gray-700/50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                  <p className="text-xs sm:text-sm text-text-secondary dark:text-gray-400 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Grade
                  </p>
                  <p className="font-semibold mt-1 text-text-primary dark:text-gray-100 text-sm sm:text-base line-clamp-1">
                    {selected_session.grade.name}
                  </p>
                </div>
                <div className="bg-bg-subtle dark:bg-gray-700/50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                  <p className="text-xs sm:text-sm text-text-secondary dark:text-gray-400 flex items-center gap-1.5">
                    <School className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Center
                  </p>
                  <p className="font-semibold mt-1 text-text-primary dark:text-gray-100 text-sm sm:text-base line-clamp-1">
                    {selected_session.center.name}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-bold mb-1.5 sm:mb-2">
                  Session Description
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary dark:text-gray-400 min-h-[40px]">
                  {selected_session.notes || "No description available"}
                </p>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold mb-1.5 sm:mb-2">
                  Session Activities
                </h3>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {selected_session.has_homework && (
                    <Badge
                      variant="outline"
                      className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700 px-2 py-0.5 text-xs sm:text-sm">
                      Has Homework
                    </Badge>
                  )}
                  {selected_session.has_test && (
                    <Badge
                      variant="outline"
                      className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700 px-2 py-0.5 text-xs sm:text-sm">
                      Has Test
                    </Badge>
                  )}
                  {!selected_session.has_homework &&
                    !selected_session.has_test && (
                      <Badge
                        variant="secondary"
                        className="px-2 py-0.5 text-xs sm:text-sm">
                        No activities recorded
                      </Badge>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column: Attendance and Students */}
          <div className="lg:col-span-2 xl:col-span-3 space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Attendance Stats */}
            <div className="bg-bg-secondary dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-border-default p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                Attendance Summary
              </h2>

              {loadingStats ? (
                <div className="space-y-3 sm:space-y-4">
                  <Skeleton className="h-16 w-full rounded-lg sm:rounded-xl" />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton
                        key={i}
                        className="h-12 sm:h-16 rounded-lg sm:rounded-xl"
                      />
                    ))}
                  </div>
                </div>
              ) : sessionStats ? (
                <>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
                    <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                      <div className="relative w-16 h-16 sm:w-24 sm:h-24 shrink-0">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle
                            className="text-gray-200 dark:text-gray-700"
                            strokeWidth="8"
                            stroke="currentColor"
                            fill="transparent"
                            r="42"
                            cx="50"
                            cy="50"
                          />
                          <circle
                            className="text-emerald-500"
                            strokeWidth="8"
                            strokeDasharray={circumference}
                            strokeDashoffset={dashoffset}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="42"
                            cx="50"
                            cy="50"
                            style={{
                              transform: "rotate(-90deg)",
                              transformOrigin: "50% 50%",
                            }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-base sm:text-2xl font-bold text-text-primary dark:text-gray-100">
                            {attendancePercentage}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xl sm:text-3xl font-bold text-text-primary dark:text-gray-100">
                          {sessionStats.present_same_center}/
                          <span className="text-text-secondary dark:text-gray-400">
                            {sessionStats.expected_attendance_same_center}
                          </span>
                        </p>
                        <p className="text-xs sm:text-sm text-text-secondary dark:text-gray-400">
                          Students present
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-text-primary dark:text-gray-100 text-base sm:text-lg w-full sm:w-auto text-center sm:text-left">
                      Total Attended: {sessionStats.total_present}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-center">
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-green-600">
                        {sessionStats.present_same_center}
                      </p>
                      <p className="text-xs sm:text-xs text-text-secondary dark:text-gray-400 truncate">
                        Present ({selected_session.center.name})
                      </p>
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-red-600">
                        {sessionStats.total_absent}
                      </p>
                      <p className="text-xs sm:text-xs text-text-secondary dark:text-gray-400">
                        Absent
                      </p>
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-yellow-600">
                        {sessionStats.present_other_center}
                      </p>
                      <p className="text-xs sm:text-xs text-text-secondary dark:text-gray-400 truncate">
                        From other centers
                      </p>
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-blue-600">
                        {sessionStats.expected_attendance_same_center}
                      </p>
                      <p className="text-xs sm:text-xs text-text-secondary dark:text-gray-400">
                        Expected
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-6 sm:py-8 text-center">
                  <AlertCircle className="w-8 h-8 sm:w-12 sm:h-12 mx-auto text-gray-400 mb-2 sm:mb-4" />
                  <p className="text-text-secondary dark:text-gray-400 text-sm sm:text-base">
                    Attendance data not available
                  </p>
                </div>
              )}
            </div>

            {/* Student List */}
            <div className="bg-bg-secondary dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-border-default p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-bold">Students</h2>
                <div className="relative w-full sm:w-64">
                  <Input
                    type="text"
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full h-9 text-sm"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto max-h-[400px] sm:max-h-[500px] -mx-4 sm:-mx-6 px-4 sm:px-6">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="sticky top-0 bg-bg-secondary dark:bg-gray-800 z-10">
                    <tr className="border-b border-border-default dark:border-gray-700">
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold min-w-[160px]">
                        Student
                      </th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold min-w-[120px]">
                        Contact
                      </th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold min-w-[100px] hidden md:table-cell">
                        Center
                      </th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold min-w-[90px]">
                        Status
                      </th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold min-w-[90px] hidden sm:table-cell">
                        Score
                      </th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold min-w-[100px] hidden sm:table-cell">
                        Homework
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => {
                        const isPresent = selected_session.students.some(
                          (s) => s.id === student.id
                        );
                        const studentScore = testScores.find(
                          (score) => score.student.id === student.id
                        );
                        const studentHomework = homeworkRecords.find(
                          (hw) => hw.student.id === student.id
                        );

                        return (
                          <tr
                            key={student.id}
                            className={cn(
                              "border-b border-border-default dark:border-gray-700 hover:bg-bg-subtle dark:hover:bg-gray-700/50",
                              !isPresent && "bg-bg-subtle dark:bg-gray-800/50"
                            )}>
                            <td className="py-2 sm:py-3 px-2 sm:px-4">
                              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
                                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-300" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-text-primary dark:text-gray-100 text-sm sm:text-base break-words">
                                    {student.full_name}
                                  </p>
                                  <p className="text-xs text-text-secondary dark:text-gray-400 hidden md:block">
                                    ID: {student.student_id}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4">
                              <div className="space-y-0.5 sm:space-y-1">
                                <div className="flex items-center gap-1.5 sm:gap-2 text-xs">
                                  <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-text-secondary" />
                                  <span className="truncate max-w-[120px] sm:max-w-none">
                                    {student.phone_number}
                                  </span>
                                </div>
                                {student.parent_number && (
                                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-text-secondary">
                                    <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    <span className="truncate max-w-[120px] sm:max-w-none">
                                      {student.parent_number}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 hidden md:table-cell">
                              <Badge
                                variant="outline"
                                className="gap-1 px-2 py-0.5 text-xs">
                                <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                <span className="truncate max-w-[80px]">
                                  {student.center.name}
                                </span>
                              </Badge>
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4">
                              <Badge
                                variant={isPresent ? "default" : "destructive"}
                                className={cn(
                                  "px-2 py-0.5 text-xs",
                                  isPresent
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                                    : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                                )}>
                                {isPresent ? "Present" : "Absent"}
                              </Badge>
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 hidden sm:table-cell">
                              {studentScore ? (
                                <div className="text-sm">
                                  {studentScore.score ?? "no score "}/
                                  {studentScore.max_score}{" "}
                                  <span className="text-text-secondary">
                                    ({studentScore.percentage}%)
                                  </span>
                                </div>
                              ) : (
                                <span className="text-text-secondary text-sm">
                                  -
                                </span>
                              )}
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 hidden sm:table-cell">
                              {studentHomework ? (
                                <span
                                  className={cn(
                                    "font-medium text-sm",
                                    studentHomework.completed
                                      ? "text-green-600"
                                      : "text-yellow-600"
                                  )}>
                                  {studentHomework.completed
                                    ? "Completed"
                                    : "Not Done"}
                                </span>
                              ) : (
                                <span className="text-text-secondary text-sm">
                                  -
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-6 sm:py-8 text-center text-text-secondary dark:text-gray-400 text-sm sm:text-base">
                          No matching students found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {role === "teacher" && selected_session.has_test && (
              <EditHis
                sID={selected_session.id}
                access={access}
                refCount={refCount}
              />
            )}
          </div>

          {/* Right Column: Test and Homework */}
          <div className="lg:col-span-1 xl:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Test Scores */}
            {selected_session.has_test && (
              <div className="bg-bg-secondary dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-border-default p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                  <h2 className="text-lg sm:text-xl font-bold">Test Scores</h2>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-40">
                      <Input
                        type="text"
                        placeholder="Search students..."
                        value={testScoreSearch}
                        onChange={(e) => setTestScoreSearch(e.target.value)}
                        className="pl-10 w-full h-9 text-sm"
                      />
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    </div>
                    <Dialog
                      open={isSetMaxScoreDialogOpen}
                      onOpenChange={setIsSetMaxScoreDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="default"
                          disabled={isCreatingScores}
                          className="h-9 text-sm px-3 py-1 whitespace-nowrap">
                          {isCreatingScores ? (
                            <div className="flex items-center gap-1.5">
                              <svg
                                className="animate-spin h-3.5 w-3.5"
                                viewBox="0 0 24 24">
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="none"
                                />
                              </svg>
                              Setting Scores...
                            </div>
                          ) : (
                            "Set Max Score"
                          )}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle className="text-base sm:text-lg">
                            Set Max Score for Session
                          </DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                          <p className="text-sm sm:text-base text-text-secondary dark:text-gray-300">
                            This will set a max score of{" "}
                            <span className="font-bold">
                              {newMaxScore || "0"}
                            </span>{" "}
                            for all attended students. Existing scores will be
                            updated.
                          </p>
                          <Input
                            type="number"
                            value={newMaxScore}
                            onChange={(e) => setNewMaxScore(e.target.value)}
                            placeholder="Enter max score"
                            min="1"
                            step="0.5"
                            className="h-9 text-sm"
                          />
                        </div>
                        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setIsSetMaxScoreDialogOpen(false)}
                            className="w-full sm:w-auto h-9 text-sm">
                            Cancel
                          </Button>
                          <Button
                            onClick={() =>
                              setMaxScoreForSession(Number(newMaxScore))
                            }
                            disabled={!newMaxScore || isCreatingScores}
                            className="w-full sm:w-auto h-9 text-sm">
                            {isCreatingScores ? (
                              <div className="flex items-center gap-1.5">
                                <svg
                                  className="animate-spin h-3.5 w-3.5"
                                  viewBox="0 0 24 24">
                                  <circle
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                  />
                                </svg>
                                Setting...
                              </div>
                            ) : (
                              "Set Max Score"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {loadingScores ? (
                  <div className="space-y-2 sm:space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton
                        key={i}
                        className="h-10 sm:h-12 rounded-lg sm:rounded-xl"
                      />
                    ))}
                  </div>
                ) : filteredTestScores.length > 0 ? (
                  <div className="overflow-x-auto max-h-[400px] sm:max-h-[500px] -mx-4 sm:-mx-6 px-4 sm:px-6">
                    <table className="w-full text-xs sm:text-sm">
                      <thead className="sticky top-0 bg-bg-secondary dark:bg-gray-800 z-10">
                        <tr>
                          <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold min-w-[140px]">
                            Student
                          </th>
                          <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold min-w-[100px]">
                            Score
                          </th>
                          <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold min-w-[120px] hidden md:table-cell">
                            Notes
                          </th>
                          <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold min-w-[80px]">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTestScores.map((score) => {
                          const isPlaceholder = score.id < 0;
                          const isSaving = savingScoreId === score.id;
                          return (
                            <tr
                              key={score.id}
                              className={cn(
                                "border-b border-border-default dark:border-gray-700 last:border-0",
                                isPlaceholder
                                  ? "bg-bg-subtle dark:bg-gray-700/30"
                                  : "hover:bg-bg-subtle dark:hover:bg-gray-700/50"
                              )}>
                              {editingScoreId === score.id ? (
                                <>
                                  <td className="py-2 px-2 sm:px-4 font-medium text-sm break-words">
                                    {score.student.full_name}
                                  </td>
                                  <td className="py-2 px-2 sm:px-4">
                                    <Input
                                      type="text"
                                      value={editableScore.score}
                                      onChange={(e) =>
                                        setEditableScore({
                                          ...editableScore,
                                          score: e.target.value,
                                        })
                                      }
                                      className="h-8 text-sm"
                                      disabled={isSaving}
                                    />
                                  </td>
                                  <td className="py-2 px-2 sm:px-4 hidden md:table-cell">
                                    <Input
                                      type="text"
                                      value={editableScore.notes}
                                      onChange={(e) =>
                                        setEditableScore({
                                          ...editableScore,
                                          notes: e.target.value,
                                        })
                                      }
                                      className="h-8 text-sm"
                                      disabled={isSaving}
                                    />
                                  </td>
                                  <td className="py-2 px-2 sm:px-4">
                                    <div className="flex items-center gap-1.5">
                                      <Button
                                        size="icon"
                                        className="h-8 w-8 bg-green-500 hover:bg-green-600"
                                        onClick={() =>
                                          handleSaveScore(
                                            score.id,
                                            score.student.id,
                                            isPlaceholder
                                          )
                                        }
                                        disabled={isSaving}>
                                        {isSaving ? (
                                          <svg
                                            className="animate-spin h-3.5 w-3.5"
                                            viewBox="0 0 24 24">
                                            <circle
                                              cx="12"
                                              cy="12"
                                              r="10"
                                              stroke="currentColor"
                                              strokeWidth="4"
                                              fill="none"
                                            />
                                          </svg>
                                        ) : (
                                          <Save className="h-3.5 w-3.5" />
                                        )}
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8"
                                        onClick={handleCancelEdit}
                                        disabled={isSaving}>
                                        <Ban className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="py-2 sm:py-3 px-2 sm:px-4 font-medium text-sm break-words">
                                    {score.student.full_name}
                                  </td>
                                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-sm">
                                    {score.score ?? "no score "}/
                                    {score.max_score} ({score.percentage}%)
                                  </td>
                                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-sm text-text-secondary hidden md:table-cell">
                                    {score.notes || "-"}
                                  </td>
                                  <td className="py-2 sm:py-3 px-2 sm:px-4">
                                    <Button
                                      size="icon"
                                      variant="outline"
                                      className="h-8 w-8"
                                      onClick={() => handleEditScore(score)}
                                      disabled={savingScoreId !== null}>
                                      <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                  </td>
                                </>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-6 sm:py-8 text-center">
                    <AlertCircle className="w-6 h-6 sm:w-10 sm:h-10 mx-auto text-gray-400 mb-2 sm:mb-3" />
                    <p className="text-text-secondary dark:text-gray-400 text-sm sm:text-base">
                      No test scores recorded
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Homework Completion */}
            {selected_session.has_homework && (
              <div className="bg-bg-secondary dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-border-default p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                  <h2 className="text-lg sm:text-xl font-bold">
                    Homework Completion
                  </h2>
                  <div className="relative w-full sm:w-40">
                    <Input
                      type="text"
                      placeholder="Search students..."
                      value={homeworkSearch}
                      onChange={(e) => setHomeworkSearch(e.target.value)}
                      className="pl-10 w-full h-9 text-sm"
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </div>
                </div>

                {loadingHomework ? (
                  <div className="space-y-2 sm:space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton
                        key={i}
                        className="h-10 sm:h-12 rounded-lg sm:rounded-xl"
                      />
                    ))}
                  </div>
                ) : filteredHomeworkRecords.length > 0 ? (
                  <div className="overflow-x-auto max-h-[400px] sm:max-h-[500px] -mx-4 sm:-mx-6 px-4 sm:px-6">
                    <table className="w-full text-xs sm:text-sm">
                      <thead className="sticky top-0 bg-bg-secondary dark:bg-gray-800 z-10">
                        <tr>
                          <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold min-w-[140px]">
                            Student
                          </th>
                          <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold min-w-[100px]">
                            Status
                          </th>
                          <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold min-w-[120px] hidden md:table-cell">
                            Notes
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredHomeworkRecords.map((hw) => (
                          <tr
                            key={hw.id}
                            className="border-b border-border-default dark:border-gray-700 last:border-0 hover:bg-bg-subtle dark:hover:bg-gray-700/50">
                            <td className="py-2 sm:py-3 px-2 sm:px-4 font-medium text-sm break-words">
                              {hw.student.full_name}
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-sm">
                              <span
                                className={cn(
                                  "font-medium",
                                  hw.completed
                                    ? "text-green-600"
                                    : "text-yellow-600"
                                )}>
                                {hw.completed ? "Completed" : "Not Completed"}
                              </span>
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-sm text-text-secondary hidden md:table-cell">
                              {hw.notes || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-6 sm:py-8 text-center">
                    <AlertCircle className="w-6 h-6 sm:w-10 sm:h-10 mx-auto text-gray-400 mb-2 sm:mb-3" />
                    <p className="text-text-secondary dark:text-gray-400 text-sm sm:text-base">
                      No homework records found
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
