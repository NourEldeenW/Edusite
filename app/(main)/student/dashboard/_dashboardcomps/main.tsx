"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar,
  ClipboardList,
  BookOpen,
  QrCode,
  User,
  GraduationCap,
  School,
  Phone,
  Award,
  Bookmark,
  Notebook,
  BookText,
  Users2,
} from "lucide-react";
import { api } from "@/lib/axiosinterceptor";
import Link from "next/link";
import { formatUserDate } from "@/lib/formatDate";

// Types matching the API shape
interface Profile {
  id: number;
  student_id: string;
  full_name: string;
  phone_number: string;
  parent_number: string;
  gender: "male" | "female";
  is_approved: boolean;
  grade: { id: number; name: string };
  center: { id: number; name: string };
  teacher: { id: number; full_name: string };
  subject_name: string;
  username: string;
}

interface SessionScore {
  session_title: string;
  score: string;
  date: string;
}

interface AttendanceSummary {
  total_assigned_sessions: number;
  attended_from_own_center: number;
  attended_from_other_center: number;
  total_attendance: number;
  percentage: string;
}

interface StudyWeek {
  id: number;
  title: string;
  date_created: string;
}

interface OnlineQuiz {
  id: number;
  title: string;
  score: string | null;
}

interface DashboardData {
  profile: Profile;
  recent_session_scores: SessionScore[];
  attendance_summary: AttendanceSummary;
  recent_study_weeks: StudyWeek[];
  recent_online_quizzes: OnlineQuiz[];
}

export default function StudentDashboard({ access }: { access: string }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(
          `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}accounts/dashboard/student/`,
          { headers: { Authorization: `Bearer ${access}` } }
        );
        setData(res.data);
        setLoading(false);
      } catch {
        setError("Something went wrong");
        setLoading(false);
      }
    };
    fetchData();
  }, [access]);

  if (loading) {
    return (
      <div className="mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className=" mx-auto">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-8 text-center">
            <div className="text-red-600 mb-4">
              <ClipboardList className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">
                Unable to load dashboard
              </h3>
              <p className="text-sm mt-2">{error || "Something went wrong"}</p>
            </div>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-100">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    profile,
    attendance_summary: atn,
    recent_session_scores: scores,
    recent_study_weeks: weeks,
    recent_online_quizzes: quizzes,
  } = data;

  function calculateAverageScore(recentSessionScores: SessionScore[]) {
    if (!recentSessionScores.length) return "0%";

    // Sum up each score's percentage
    const totalRatio = recentSessionScores.reduce((sum, { score }) => {
      // Split on "/", trim whitespace, parse numbers
      const [obtainedStr, totalStr] = score.split("/").map((s) => s.trim());
      const obtained = parseFloat(obtainedStr);
      const total = parseFloat(totalStr);

      if (isNaN(obtained) || isNaN(total) || total === 0) {
        // Skip invalid entries (or you could throw an error)
        return sum;
      }

      return sum + obtained / total;
    }, 0);

    // Compute average ratio
    const avgRatio = totalRatio / recentSessionScores.length;
    // Convert to percentage and format with two decimals
    return `${(avgRatio * 100).toFixed(2)}%`;
  }

  return (
    <div className="mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back,{" "}
            <span className="font-medium text-indigo-600">
              {profile.full_name}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-indigo-100 text-indigo-700 px-3 py-1.5">
            <Bookmark className="h-4 w-4 mr-2" />
            {profile.grade.name} • {profile.subject_name}
          </Badge>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 bg-transparent hover:text-text-inverse">
                <QrCode className="h-4 w-4" />
                Show ID
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Student ID QR Code
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <QRCode
                    value={profile.student_id}
                    size={200}
                    bgColor="transparent"
                    fgColor="#1f2937"
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Student ID</p>
                  <Badge className="text-lg px-4 py-1.5 bg-indigo-100 text-indigo-800">
                    {profile.student_id}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Use this QR code for attendance check-in at any center
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Attendance
                </h3>
                <p className="text-2xl font-bold">{atn.percentage}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <Progress
                value={Number.parseInt(atn.percentage)}
                className="h-2"
              />
              <p className="text-xs text-gray-500 mt-2">
                {atn.total_attendance} of {atn.total_assigned_sessions} sessions
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Average Score
                </h3>
                <p className="text-2xl font-bold">
                  {calculateAverageScore(scores)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-500">
                <span>
                  Your average score in the last {scores.length}{" "}
                  {scores.length === 1 ? "session" : "sessions"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Study Weeks
                </h3>
                <p className="text-2xl font-bold">{weeks.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-100">
                <BookText className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-transparent p-0">
                <Link
                  href={"/student/studymaterials"}
                  className="w-full h-full flex items-center justify-center hover:text-text-inverse">
                  View Study Weeks
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Pending Quizzes
                </h3>
                <p className="text-2xl font-bold">
                  {quizzes.filter((q) => q.score === null).length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100">
                <Notebook className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-transparent p-0">
                <Link
                  href={"/student/quizzes"}
                  className="w-full h-full flex items-center justify-center hover:text-text-inverse">
                  View Quizzes
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Right Column - Moved to top on mobile */}
        <div className="space-y-6 order-1">
          {/* Profile Card */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-indigo-600" />
                Student Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="flex flex-col items-center text-center">
                <QRCode
                  value={profile.student_id}
                  size={200}
                  bgColor="transparent"
                  fgColor="#1f2937"
                />
                <h3 className="font-bold text-lg mt-4">{profile.full_name}</h3>
                <p className="text-gray-600 mt-1">@{profile.username}</p>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  <div>
                    <p className="text-gray-500 text-sm">Grade</p>
                    <p className="font-medium">{profile.grade.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <School className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  <div>
                    <p className="text-gray-500 text-sm">Center</p>
                    <p className="font-medium">{profile.center.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  <div>
                    <p className="text-gray-500 text-sm">Teacher</p>
                    <p className="font-medium">{profile.teacher.full_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  <div>
                    <p className="text-gray-500 text-sm">Phone</p>
                    <p className="font-medium">{profile.phone_number}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users2 className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  <div>
                    <p className="text-gray-500 text-sm">Parent&apos;s Phone</p>
                    <p className="font-medium">{profile.parent_number}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quizzes Card */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Notebook className="h-5 w-5 text-indigo-600" />
                Online Quizzes
              </CardTitle>
              <CardDescription>
                Recent quiz attempts and results
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {quizzes.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Notebook className="h-10 w-10 mx-auto mb-4 text-gray-300" />
                  <p>No quizzes available</p>
                </div>
              ) : (
                <div className="divide-y">
                  {quizzes.map((q) => (
                    <div
                      key={q.id}
                      className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{q.title}</p>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <BookOpen className="h-4 w-4 mr-1.5" />
                            <span>Online Quiz</span>
                          </div>
                        </div>

                        <div>
                          {q.score ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              {q.score}
                            </Badge>
                          ) : (
                            <Button size="sm">Take Quiz</Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="py-3 bg-gray-50">
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-transparent p-0">
                <Link
                  href={"/student/quizzes"}
                  className="w-full h-full flex items-center justify-center hover:text-text-inverse">
                  View All Quizzes
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6 order-2">
          {/* Session Scores */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-indigo-600" />
                Recent Session Scores
              </CardTitle>
              <CardDescription>
                Your performance in the last 4 sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="py-0">
              <Table className="">
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="w-[60%]">Session</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scores.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center py-8 text-gray-500">
                        <BookOpen className="h-10 w-10 mx-auto mb-4 text-gray-300" />
                        No session scores available
                      </TableCell>
                    </TableRow>
                  ) : (
                    scores.map((s, index) => {
                      const scoreNum = Number.parseInt(s.score.split("/")[0]);
                      const percentage = (scoreNum / 100) * 100;

                      return (
                        <TableRow
                          key={index}
                          className="border-b hover:bg-gray-50">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-lg ${
                                  percentage >= 90
                                    ? "bg-green-100 text-green-800"
                                    : percentage >= 80
                                    ? "bg-blue-100 text-blue-800"
                                    : percentage >= 70
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-red-100 text-red-800"
                                }`}>
                                <BookOpen className="h-5 w-5" />
                              </div>
                              <span>{s.session_title}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {s.date}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end">
                              <Badge
                                className={`font-medium ${
                                  percentage >= 90
                                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                                    : percentage >= 80
                                    ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                    : percentage >= 70
                                    ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                                    : "bg-red-100 text-red-800 hover:bg-red-100"
                                }`}>
                                {s.score}
                              </Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="py-3 bg-gray-50">
              <Button
                variant="ghost"
                className="text-indigo-600 flex items-center ml-auto hover:text-text-inverse">
                <Link
                  href={"/student/quizzes"}
                  className="w-full h-full flex items-center justify-center hover:text-text-inverse">
                  View all sessions
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Study Materials */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <BookText className="h-5 w-5 text-indigo-600" />
                Recent Study Weeks
              </CardTitle>
              <CardDescription>Recently published study weeks</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {weeks.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <BookText className="h-10 w-10 mx-auto mb-4 text-gray-300" />
                  <p>No study materials published yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
                  {weeks.map((w) => (
                    <div
                      key={w.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <BookOpen className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{w.title}</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            Published: {formatUserDate(w.date_created)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="py-3 bg-gray-50">
              <Button
                variant="ghost"
                className="text-indigo-600 flex items-center ml-auto hover:text-text-inverse">
                <Link
                  href={"/student/studymaterials"}
                  className="w-full h-full flex items-center justify-center hover:text-text-inverse">
                  Browse all materials
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
