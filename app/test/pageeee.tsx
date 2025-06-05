"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Download,
  Upload,
  Plus,
  MoreVertical,
  Calendar,
  GraduationCap,
  BookOpen,
  Phone,
  Users,
  Building2,
  AlertCircle,
  CheckCircle,
  Mail,
  MapPin,
  User,
  Edit,
  Trash2,
  Eye,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Student {
  id: string;
  fullName: string;
  phoneNumber: string;
  parentPhoneNumber: string;
  email: string;
  address: string;
  center: string;
  grade: string;
  enrollmentDate: string;
  status: "active" | "inactive" | "suspended";
  attendanceRate: number;
  averageGrade: number;
  homeworkCompletion: number;
  lastAttendance: string;
  totalClasses: number;
  attendedClasses: number;
  missedClasses: number;
  recentGrades: { subject: string; grade: number; date: string }[];
  upcomingHomework: {
    subject: string;
    title: string;
    dueDate: string;
    status: "pending" | "submitted" | "late";
  }[];
}

// Mock data for demonstration
const mockStudents: Student[] = [
  {
    id: "1",
    fullName: "Ahmed Mohamed Hassan",
    phoneNumber: "01234567890",
    parentPhoneNumber: "01098765432",
    email: "ahmed.hassan@example.com",
    address: "15 Tahrir Street, Cairo",
    center: "Task Center",
    grade: "2nd Secondary",
    enrollmentDate: "2024-01-15",
    status: "active",
    attendanceRate: 92,
    averageGrade: 85,
    homeworkCompletion: 88,
    lastAttendance: "2024-12-28",
    totalClasses: 120,
    attendedClasses: 110,
    missedClasses: 10,
    recentGrades: [
      { subject: "Mathematics", grade: 90, date: "2024-12-25" },
      { subject: "Physics", grade: 85, date: "2024-12-24" },
      { subject: "Chemistry", grade: 82, date: "2024-12-23" },
    ],
    upcomingHomework: [
      {
        subject: "Mathematics",
        title: "Chapter 5 Problems",
        dueDate: "2024-12-30",
        status: "pending",
      },
      {
        subject: "Physics",
        title: "Lab Report",
        dueDate: "2024-12-31",
        status: "submitted",
      },
    ],
  },
  {
    id: "2",
    fullName: "Fatima Ali Ibrahim",
    phoneNumber: "01122334455",
    parentPhoneNumber: "01199887766",
    email: "fatima.ali@example.com",
    address: "23 Nasr City, Cairo",
    center: "Yes Center",
    grade: "1st Secondary",
    enrollmentDate: "2024-02-01",
    status: "active",
    attendanceRate: 95,
    averageGrade: 92,
    homeworkCompletion: 95,
    lastAttendance: "2024-12-29",
    totalClasses: 100,
    attendedClasses: 95,
    missedClasses: 5,
    recentGrades: [
      { subject: "Mathematics", grade: 95, date: "2024-12-26" },
      { subject: "Physics", grade: 92, date: "2024-12-25" },
      { subject: "Chemistry", grade: 90, date: "2024-12-24" },
    ],
    upcomingHomework: [
      {
        subject: "Chemistry",
        title: "Periodic Table Quiz",
        dueDate: "2024-12-30",
        status: "pending",
      },
    ],
  },
  {
    id: "3",
    fullName: "Omar Khaled Mahmoud",
    phoneNumber: "01555666777",
    parentPhoneNumber: "01444333222",
    email: "omar.khaled@example.com",
    address: "45 Heliopolis, Cairo",
    center: "Omar Ibn ElKhattab Center",
    grade: "3rd Secondary",
    enrollmentDate: "2023-09-15",
    status: "inactive",
    attendanceRate: 65,
    averageGrade: 70,
    homeworkCompletion: 60,
    lastAttendance: "2024-12-15",
    totalClasses: 150,
    attendedClasses: 98,
    missedClasses: 52,
    recentGrades: [
      { subject: "Mathematics", grade: 72, date: "2024-12-15" },
      { subject: "Physics", grade: 68, date: "2024-12-14" },
      { subject: "Chemistry", grade: 70, date: "2024-12-13" },
    ],
    upcomingHomework: [
      {
        subject: "Mathematics",
        title: "Final Review",
        dueDate: "2024-12-25",
        status: "late",
      },
      {
        subject: "Physics",
        title: "Chapter Summary",
        dueDate: "2024-12-26",
        status: "late",
      },
    ],
  },
];

const centers = [
  "All Centers",
  "Task Center",
  "Yes Center",
  "Omar Ibn ElKhattab Center",
];
const grades = [
  "All Grades",
  "1st Secondary",
  "2nd Secondary",
  "3rd Secondary",
];
const statuses = ["All Status", "Active", "Inactive", "Suspended"];

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCenter, setSelectedCenter] = useState("All Centers");
  const [selectedGrade, setSelectedGrade] = useState("All Grades");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobileView, setIsMobileView] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  // Add resize listener for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Filter students based on search and filters
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.phoneNumber.includes(searchQuery) ||
      student.parentPhoneNumber.includes(searchQuery);
    const matchesCenter =
      selectedCenter === "All Centers" || student.center === selectedCenter;
    const matchesGrade =
      selectedGrade === "All Grades" || student.grade === selectedGrade;
    const matchesStatus =
      selectedStatus === "All Status" ||
      (selectedStatus === "Active" && student.status === "active") ||
      (selectedStatus === "Inactive" && student.status === "inactive") ||
      (selectedStatus === "Suspended" && student.status === "suspended");

    return matchesSearch && matchesCenter && matchesGrade && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    totalStudents: students.length,
    activeStudents: students.filter((s) => s.status === "active").length,
    inactiveStudents: students.filter((s) => s.status === "inactive").length,
    averageAttendance: Math.round(
      students.reduce((acc, s) => acc + s.attendanceRate, 0) / students.length
    ),
    averageGrade: Math.round(
      students.reduce((acc, s) => acc + s.averageGrade, 0) / students.length
    ),
    homeworkCompletion: Math.round(
      students.reduce((acc, s) => acc + s.homeworkCompletion, 0) /
        students.length
    ),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success/10 text-success border-success/30";
      case "inactive":
        return "bg-warning/10 text-warning border-warning/30";
      case "suspended":
        return "bg-error/10 text-error border-error/30";
      default:
        return "";
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return "text-success";
    if (grade >= 80) return "text-primary";
    if (grade >= 70) return "text-warning";
    return "text-error";
  };

  // Student card component for mobile view
  const StudentCard = ({ student }: { student: Student }) => (
    <Card className="mb-4 hover:shadow-md transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-text-primary">
                {student.fullName}
              </p>
              <p className="text-sm text-text-secondary">{student.email}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSelectedStudent(student)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-error">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-3 w-3 text-text-secondary" />
              <span className="truncate">{student.phoneNumber}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Users className="h-3 w-3" />
              <span className="truncate">{student.parentPhoneNumber}</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap gap-2 justify-end">
              <Badge variant="outline" className="gap-1 text-xs">
                <Building2 className="h-3 w-3" />
                <span className="truncate">{student.center}</span>
              </Badge>
            </div>
            <div className="flex justify-end">
              <Badge
                className={`${getStatusColor(student.status)} border text-xs`}>
                {student.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          <div>
            <p className="text-xs text-text-secondary mb-1">Attendance</p>
            <div className="flex items-center gap-1">
              <Progress value={student.attendanceRate} className="h-2" />
              <span
                className={`text-xs font-medium ${getGradeColor(
                  student.attendanceRate
                )}`}>
                {student.attendanceRate}%
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs text-text-secondary mb-1">Grade</p>
            <span
              className={`text-xs font-medium ${getGradeColor(
                student.averageGrade
              )}`}>
              {student.averageGrade}%
            </span>
          </div>

          <div>
            <p className="text-xs text-text-secondary mb-1">Homework</p>
            <div className="flex items-center gap-1">
              <Progress value={student.homeworkCompletion} className="h-2" />
              <span
                className={`text-xs font-medium ${getGradeColor(
                  student.homeworkCompletion
                )}`}>
                {student.homeworkCompletion}%
              </span>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          className="w-full mt-3 text-primary justify-between"
          onClick={() => setSelectedStudent(student)}>
          View Details
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4 sm:space-y-6 bg-bg-base min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
            Student Management
          </h1>
          <p className="text-sm sm:text-base text-text-secondary mt-1">
            Manage and monitor all your students&apos; performance and data
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            className="gap-2 text-sm h-9 flex-grow sm:flex-grow-0">
            <Upload className="h-4 w-4" />
            <span className="sm:inline">Import</span>
          </Button>
          <Button
            variant="outline"
            className="gap-2 text-sm h-9 flex-grow sm:flex-grow-0">
            <Download className="h-4 w-4" />
            <span className="sm:inline">Export</span>
          </Button>
          <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary hover:bg-primary-hover text-sm h-9 flex-grow sm:flex-grow-0">
                <Plus className="h-4 w-4" />
                <span className="sm:inline">Add Student</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>
                  Enter the student&apos;s information to add them to your class
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" placeholder="Enter student name" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="student@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="01234567890" />
                  </div>
                  <div>
                    <Label htmlFor="parentPhone">Parent Phone</Label>
                    <Input id="parentPhone" placeholder="01234567890" />
                  </div>
                  <div>
                    <Label htmlFor="center">Center</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select center" />
                      </SelectTrigger>
                      <SelectContent>
                        {centers.slice(1).map((center) => (
                          <SelectItem key={center} value={center}>
                            {center}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="grade">Grade</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {grades.slice(1).map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" placeholder="Enter student address" />
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddStudentOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary-hover">
                    Add Student
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div
        className="grid gap-[25px] mb-8"
        style={{
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
        }}>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-text-secondary">
                  Total Students
                </p>
                <p className="text-lg sm:text-2xl font-bold text-text-primary">
                  {stats.totalStudents}
                </p>
              </div>
              <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-text-secondary">Active</p>
                <p className="text-lg sm:text-2xl font-bold text-success">
                  {stats.activeStudents}
                </p>
              </div>
              <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-text-secondary">
                  Inactive
                </p>
                <p className="text-lg sm:text-2xl font-bold text-warning">
                  {stats.inactiveStudents}
                </p>
              </div>
              <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-warning/10 flex items-center justify-center">
                <AlertCircle className="h-4 w-4 sm:h-6 sm:w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-text-secondary">
                  Avg Attendance
                </p>
                <p className="text-lg sm:text-2xl font-bold text-text-primary">
                  {stats.averageAttendance}%
                </p>
              </div>
              <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-text-secondary">
                  Avg Grade
                </p>
                <p className="text-lg sm:text-2xl font-bold text-text-primary">
                  {stats.averageGrade}%
                </p>
              </div>
              <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-accent/10 flex items-center justify-center">
                <GraduationCap className="h-4 w-4 sm:h-6 sm:w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-text-secondary">
                  Homework Rate
                </p>
                <p className="text-lg sm:text-2xl font-bold text-text-primary">
                  {stats.homeworkCompletion}%
                </p>
              </div>
              <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-3 sm:p-6">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-text-secondary" />
              <Input
                placeholder="Search by name or phone number..."
                className="pl-10 h-10 min-w-[200px] max-w-full"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
              />
            </div>
            <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-4">
              <Select value={selectedCenter} onValueChange={setSelectedCenter}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {centers.map((center) => (
                    <SelectItem
                      key={center}
                      value={center}
                      className="hover:text-text-inverse">
                      {center}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table/Cards */}
      <Card>
        <CardHeader className="p-4 sm:p-6 pb-0 sm:pb-0">
          <CardTitle className="text-lg sm:text-xl">
            Students ({filteredStudents.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {/* Mobile view - Cards */}
          <div className="md:hidden">
            {filteredStudents.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
            {filteredStudents.length === 0 && (
              <div className="text-center py-8 text-text-secondary">
                No students match your filters
              </div>
            )}
          </div>

          {/* Desktop view - Table */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Center</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Average</TableHead>
                  <TableHead>Homework</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id} className="hover:bg-bg-subtle">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">
                            {student.fullName}
                          </p>
                          <p className="text-sm text-text-secondary">
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3 text-text-secondary" />
                          <span>{student.phoneNumber}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                          <Users className="h-3 w-3" />
                          <span>{student.parentPhoneNumber}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        <Building2 className="h-3 w-3" />
                        {student.center}
                      </Badge>
                    </TableCell>
                    <TableCell>{student.grade}</TableCell>
                    <TableCell>
                      <Badge
                        className={`${getStatusColor(student.status)} border`}>
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={student.attendanceRate}
                          className="w-16"
                        />
                        <span
                          className={`text-sm font-medium ${getGradeColor(
                            student.attendanceRate
                          )}`}>
                          {student.attendanceRate}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`font-medium ${getGradeColor(
                          student.averageGrade
                        )}`}>
                        {student.averageGrade}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={student.homeworkCompletion}
                          className="w-16"
                        />
                        <span
                          className={`text-sm font-medium ${getGradeColor(
                            student.homeworkCompletion
                          )}`}>
                          {student.homeworkCompletion}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setSelectedStudent(student)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-error">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredStudents.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-8 text-text-secondary">
                      No students match your filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Student Details Dialog */}
      <Dialog
        open={!!selectedStudent}
        onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          {selectedStudent && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl">
                  {selectedStudent.fullName}
                </DialogTitle>
                <DialogDescription>
                  Complete student profile and performance data
                </DialogDescription>
              </DialogHeader>

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="mt-6">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="attendance">Attendance</TabsTrigger>
                  <TabsTrigger value="grades">Grades</TabsTrigger>
                  <TabsTrigger value="homework">Homework</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader className="p-4">
                        <CardTitle className="text-base sm:text-lg">
                          Personal Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 space-y-3">
                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-text-secondary shrink-0" />
                          <span className="text-sm break-words">
                            {selectedStudent.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-text-secondary shrink-0" />
                          <span className="text-sm">
                            {selectedStudent.phoneNumber}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Users className="h-4 w-4 text-text-secondary shrink-0" />
                          <span className="text-sm">
                            Parent: {selectedStudent.parentPhoneNumber}
                          </span>
                        </div>
                        <div className="flex items-start gap-3">
                          <MapPin className="h-4 w-4 text-text-secondary shrink-0 mt-0.5" />
                          <span className="text-sm break-words">
                            {selectedStudent.address}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="p-4">
                        <CardTitle className="text-base sm:text-lg">
                          Academic Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-text-secondary">
                            Center
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {selectedStudent.center}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-text-secondary">
                            Grade
                          </span>
                          <span className="text-sm font-medium">
                            {selectedStudent.grade}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-text-secondary">
                            Status
                          </span>
                          <Badge
                            className={`${getStatusColor(
                              selectedStudent.status
                            )} border text-xs`}>
                            {selectedStudent.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-text-secondary">
                            Enrolled
                          </span>
                          <span className="text-sm">
                            {new Date(
                              selectedStudent.enrollmentDate
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                          <span
                            className={`text-xl sm:text-2xl font-bold ${getGradeColor(
                              selectedStudent.attendanceRate
                            )}`}>
                            {selectedStudent.attendanceRate}%
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary">
                          Attendance Rate
                        </p>
                        <Progress
                          value={selectedStudent.attendanceRate}
                          className="mt-2"
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                          <span
                            className={`text-xl sm:text-2xl font-bold ${getGradeColor(
                              selectedStudent.averageGrade
                            )}`}>
                            {selectedStudent.averageGrade}%
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary">
                          Average Grade
                        </p>
                        <Progress
                          value={selectedStudent.averageGrade}
                          className="mt-2"
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                          <span
                            className={`text-xl sm:text-2xl font-bold ${getGradeColor(
                              selectedStudent.homeworkCompletion
                            )}`}>
                            {selectedStudent.homeworkCompletion}%
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary">
                          Homework Completion
                        </p>
                        <Progress
                          value={selectedStudent.homeworkCompletion}
                          className="mt-2"
                        />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="attendance" className="space-y-6">
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base sm:text-lg">
                        Attendance Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-2 bg-bg-subtle rounded-lg">
                          <p className="text-xl sm:text-3xl font-bold text-text-primary">
                            {selectedStudent.totalClasses}
                          </p>
                          <p className="text-xs sm:text-sm text-text-secondary">
                            Total Classes
                          </p>
                        </div>
                        <div className="text-center p-2 bg-bg-subtle rounded-lg">
                          <p className="text-xl sm:text-3xl font-bold text-success">
                            {selectedStudent.attendedClasses}
                          </p>
                          <p className="text-xs sm:text-sm text-text-secondary">
                            Attended
                          </p>
                        </div>
                        <div className="text-center p-2 bg-bg-subtle rounded-lg">
                          <p className="text-xl sm:text-3xl font-bold text-error">
                            {selectedStudent.missedClasses}
                          </p>
                          <p className="text-xs sm:text-sm text-text-secondary">
                            Missed
                          </p>
                        </div>
                        <div className="text-center p-2 bg-bg-subtle rounded-lg">
                          <p className="text-xl sm:text-3xl font-bold text-primary">
                            {selectedStudent.attendanceRate}%
                          </p>
                          <p className="text-xs sm:text-sm text-text-secondary">
                            Attendance Rate
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-text-secondary">
                            Last Attendance
                          </span>
                          <span className="font-medium">
                            {new Date(
                              selectedStudent.lastAttendance
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="grades" className="space-y-6">
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base sm:text-lg">
                        Recent Grades
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="space-y-4">
                        {selectedStudent.recentGrades.map((grade, index) => (
                          <div
                            key={index}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg bg-bg-subtle">
                            <div className="mb-2 sm:mb-0">
                              <p className="font-medium">{grade.subject}</p>
                              <p className="text-xs sm:text-sm text-text-secondary">
                                {new Date(grade.date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Progress
                                value={grade.grade}
                                className="w-full sm:w-24"
                              />
                              <span
                                className={`font-bold ${getGradeColor(
                                  grade.grade
                                )}`}>
                                {grade.grade}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="homework" className="space-y-6">
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base sm:text-lg">
                        Upcoming Homework
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="space-y-4">
                        {selectedStudent.upcomingHomework.map((hw, index) => (
                          <div
                            key={index}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg bg-bg-subtle">
                            <div className="mb-2 sm:mb-0">
                              <p className="font-medium">{hw.title}</p>
                              <p className="text-xs sm:text-sm text-text-secondary">
                                {hw.subject}
                              </p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                              <span className="text-xs sm:text-sm text-text-secondary">
                                Due: {new Date(hw.dueDate).toLocaleDateString()}
                              </span>
                              <Badge
                                className={
                                  hw.status === "submitted"
                                    ? "bg-success/10 text-success border-success/30"
                                    : hw.status === "late"
                                    ? "bg-error/10 text-error border-error/30"
                                    : "bg-warning/10 text-warning border-warning/30"
                                }>
                                {hw.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
