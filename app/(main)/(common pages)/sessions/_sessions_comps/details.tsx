"use client";

import { Button } from "@/components/ui/button";
import { SessionType } from "@/lib/stores/SessionsStores/allSessionsStore";
import {
  ArrowLeft,
  CalendarDays,
  BookOpen,
  School,
  User,
  X,
  AlertCircle,
} from "lucide-react";
import { formatUserDate } from "@/lib/formatDate";
import { Badge } from "@/components/ui/badge";
import useAvail_Grades_CentersStore from "@/lib/stores/SessionsStores/store";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/axiosinterceptor";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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
  score: string;
  max_score: string;
  percentage: number;
  notes: string;
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
}: {
  selected_session: SessionType | null;
  access: string;
  navigateBack: () => void;
}) {
  const allStudents = useAvail_Grades_CentersStore(
    (state) => state.allStudents
  );
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [testScores, setTestScores] = useState<TestScore[]>([]);
  const [homeworkRecords, setHomeworkRecords] = useState<HomeworkRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingScores, setLoadingScores] = useState(true);
  const [loadingHomework, setLoadingHomework] = useState(true);

  // Filter students for this session
  const sessionStudents = useMemo(() => {
    if (!selected_session) return [];
    return allStudents.filter(
      (student) =>
        student.grade.id === selected_session.grade.id &&
        student.center.id === selected_session.center.id
    );
  }, [allStudents, selected_session]);

  // Format date
  const formattedDate = selected_session
    ? formatUserDate(selected_session.date, false)
    : "";

  // Fetch session stats
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

  // Fetch test scores
  useEffect(() => {
    if (!selected_session) return;

    const fetchTestScores = async () => {
      try {
        setLoadingScores(true);
        const response = await api.get(
          `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}sesstion/sessions/${selected_session.id}/scores/`,
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

  // Fetch homework records
  useEffect(() => {
    if (!selected_session) return;

    const fetchHomeworkRecords = async () => {
      try {
        setLoadingHomework(true);
        const response = await api.get(
          `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}sesstion/sessions/${selected_session.id}/homework/`,
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

  if (!selected_session) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-border-default">
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={navigateBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sessions
          </Button>
        </div>
        <div className="py-12 text-center">
          <div className="bg-gray-100 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarDays className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
            No session selected
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">
            Please select a session to view details
          </p>
          <Button
            onClick={navigateBack}
            className="flex items-center gap-2 mx-auto">
            Back to Sessions
          </Button>
        </div>
      </div>
    );
  }

  // Calculate attendance percentage
  const attendancePercentage =
    sessionStats && sessionStats.expected_attendance_same_center > 0
      ? Math.round(
          (sessionStats.total_present /
            sessionStats.expected_attendance_same_center) *
            100
        )
      : 0;

  // Calculate stroke dashoffset for the progress ring
  const circumference = 2 * Math.PI * 42;
  const dashoffset =
    circumference - (attendancePercentage / 100) * circumference;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={navigateBack}
          className="rounded-full border border-gray-300 hover:bg-gray-50">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-800">Session Details</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-border-default p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-primary dark:text-dark-text">
                  {selected_session.title}
                </h2>
                <div className="mt-2">
                  <p className="text-text-secondary dark:text-dark-text-secondary flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    <span>{formattedDate}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                <p className="text-sm text-text-secondary dark:text-dark-text-secondary flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  Grade
                </p>
                <p className="font-bold mt-1">{selected_session.grade.name}</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                <p className="text-sm text-text-secondary dark:text-dark-text-secondary flex items-center gap-1">
                  <School className="w-4 h-4" />
                  Center
                </p>
                <p className="font-bold mt-1">{selected_session.center.name}</p>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3">Session Description</h3>
              <p className="text-text-secondary dark:text-dark-text-secondary">
                {selected_session.notes || "No description available"}
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3">Session Activities</h3>
              <div className="flex flex-wrap gap-2">
                {selected_session.has_homework && (
                  <Badge className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300">
                    Has Homework
                  </Badge>
                )}
                {selected_session.has_test && (
                  <Badge className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300">
                    Has Test
                  </Badge>
                )}
                {!selected_session.has_homework &&
                  !selected_session.has_test && (
                    <Badge className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                      No activities recorded
                    </Badge>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance and Students Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-border-default p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Attendance Summary</h2>

          {loadingStats ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full rounded-xl" />
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
              </div>
            </div>
          ) : sessionStats ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24">
                    <svg
                      className="progress-ring w-24 h-24"
                      width="96"
                      height="96">
                      <circle
                        className="progress-ring__circle"
                        stroke="#e5e7eb"
                        strokeWidth="6"
                        fill="transparent"
                        r="42"
                        cx="48"
                        cy="48"></circle>
                      <circle
                        className="progress-ring__circle"
                        stroke="#10b981"
                        strokeWidth="6"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashoffset}
                        fill="transparent"
                        r="42"
                        cx="48"
                        cy="48"></circle>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-2xl font-bold">
                        {attendancePercentage}%
                      </p>
                      <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
                        Attendance
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-bold">
                      {sessionStats.total_present}/
                      {sessionStats.expected_attendance_same_center}
                    </p>
                    <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
                      Students present
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {sessionStats.total_present}
                  </p>
                  <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
                    Present
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {sessionStats.total_absent}
                  </p>
                  <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
                    Absent
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {sessionStats.present_other_center}
                  </p>
                  <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
                    From Other Centers
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {sessionStats.expected_attendance_same_center}
                  </p>
                  <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
                    Expected
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="py-8 text-center">
              <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Attendance data not available</p>
            </div>
          )}
        </div>

        {/* Student List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-border-default p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Students</h2>
            <div className="relative w-64">
              <Input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
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

          <div className="overflow-y-auto max-h-96">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-default dark:border-gray-700">
                  <th className="text-left py-3 text-text-secondary dark:text-dark-text-secondary">
                    Student
                  </th>
                  <th className="text-left py-3 text-text-secondary dark:text-dark-text-secondary">
                    Status
                  </th>
                  <th className="text-left py-3 text-text-secondary dark:text-dark-text-secondary">
                    Score
                  </th>
                  <th className="text-left py-3 text-text-secondary dark:text-dark-text-secondary">
                    Homework
                  </th>
                </tr>
              </thead>
              <tbody>
                {sessionStudents
                  .filter((student) =>
                    student.full_name
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                  )
                  .map((student) => {
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
                        className="border-b border-border-default dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                            </div>
                            <span>{student.full_name}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-block w-3 h-3 rounded-full ${
                                isPresent ? "bg-green-500" : "bg-red-500"
                              }`}></span>
                            <span>{isPresent ? "Present" : "Absent"}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          {studentScore ? (
                            `${studentScore.score}/${studentScore.max_score}`
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3">
                          {studentHomework ? (
                            <span
                              className={cn(
                                "font-medium",
                                studentHomework.completed
                                  ? "text-green-600"
                                  : "text-yellow-600"
                              )}>
                              {studentHomework.completed
                                ? "Completed"
                                : "Pending"}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Test Scores and Homework Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Test Scores */}
        {selected_session.has_test && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-border-default p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Test Scores</h2>
            </div>

            {loadingScores ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 rounded-xl" />
                ))}
              </div>
            ) : testScores.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-border-default dark:border-gray-700">
                      <th className="text-left py-3 text-text-secondary dark:text-dark-text-secondary">
                        Student
                      </th>
                      <th className="text-left py-3 text-text-secondary dark:text-dark-text-secondary">
                        Score
                      </th>
                      <th className="text-left py-3 text-text-secondary dark:text-dark-text-secondary">
                        Percentage
                      </th>
                      <th className="text-left py-3 text-text-secondary dark:text-dark-text-secondary">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {testScores.map((score) => (
                      <tr
                        key={score.id}
                        className="border-b border-border-default dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-3">{score.student.full_name}</td>
                        <td className="py-3">
                          {score.score}/{score.max_score}
                        </td>
                        <td className="py-3">{score.percentage}%</td>
                        <td className="py-3 text-sm text-gray-500 dark:text-gray-400">
                          {score.notes || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="bg-gray-100 dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">No test scores recorded</p>
              </div>
            )}
          </div>
        )}

        {/* Homework Completion */}
        {selected_session.has_homework && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-border-default p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Homework Completion</h2>
            </div>

            {loadingHomework ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 rounded-xl" />
                ))}
              </div>
            ) : homeworkRecords.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-border-default dark:border-gray-700">
                      <th className="text-left py-3 text-text-secondary dark:text-dark-text-secondary">
                        Student
                      </th>
                      <th className="text-left py-3 text-text-secondary dark:text-dark-text-secondary">
                        Status
                      </th>
                      <th className="text-left py-3 text-text-secondary dark:text-dark-text-secondary">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {homeworkRecords.map((hw) => (
                      <tr
                        key={hw.id}
                        className="border-b border-border-default dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-3">{hw.student.full_name}</td>
                        <td className="py-3">
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
                        <td className="py-3 text-sm text-gray-500 dark:text-gray-400">
                          {hw.notes || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="bg-gray-100 dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">No homework records found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
