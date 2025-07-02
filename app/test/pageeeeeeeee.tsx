"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  QrCode,
  User,
  Phone,
  Clock,
  FileText,
  Edit,
  Trash2,
} from "lucide-react";

// Define interfaces for our data types
interface Student {
  id: number;
  name: string;
  phone: string;
  grade: string;
  center: string;
}

interface Session {
  id: number;
  grade: string;
  center: string;
  date: string;
  time: string;
  description: string;
}

interface AttendanceRecord {
  sessionId: number;
  studentId: number;
  status: "present" | "absent";
  homeworkStatus: "completed" | "incomplete" | "not-submitted";
  testScore?: string;
}

export default function AttendanceManagementPage() {
  // State management
  const [activeTab, setActiveTab] = useState("sessions");
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [grades] = useState<string[]>([
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
  ]);
  const [centers] = useState<string[]>([
    "Center A",
    "Center B",
    "Center C",
    "Center D",
  ]);
  const [isCreateSessionModalOpen, setIsCreateSessionModalOpen] =
    useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    null
  );
  const [selectedSessionDetailId, setSelectedSessionDetailId] = useState<
    number | null
  >(null);
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [currentAttendance, setCurrentAttendance] = useState<{
    sessionId: number;
    studentId: number;
    studentName: string;
    status: "present" | "absent";
    homeworkStatus: "completed" | "incomplete" | "not-submitted";
    testScore: string;
  } | null>(null);

  // Mock data initialization
  useEffect(() => {
    // Initialize with some mock data
    const initialStudents: Student[] = [
      {
        id: 1,
        name: "John Doe",
        phone: "1234567890",
        grade: "Grade 1",
        center: "Center A",
      },
      {
        id: 2,
        name: "Jane Smith",
        phone: "0987654321",
        grade: "Grade 1",
        center: "Center A",
      },
      {
        id: 3,
        name: "Mike Johnson",
        phone: "1122334455",
        grade: "Grade 1",
        center: "Center A",
      },
      {
        id: 4,
        name: "Sarah Williams",
        phone: "5566778899",
        grade: "Grade 2",
        center: "Center B",
      },
      {
        id: 5,
        name: "David Brown",
        phone: "9988776655",
        grade: "Grade 2",
        center: "Center B",
      },
      {
        id: 6,
        name: "Emily Davis",
        phone: "1122334456",
        grade: "Grade 3",
        center: "Center C",
      },
      {
        id: 7,
        name: "Michael Wilson",
        phone: "6677889900",
        grade: "Grade 3",
        center: "Center C",
      },
      {
        id: 8,
        name: "Jessica Taylor",
        phone: "2233445566",
        grade: "Grade 4",
        center: "Center D",
      },
      {
        id: 9,
        name: "Robert Anderson",
        phone: "4455667788",
        grade: "Grade 4",
        center: "Center D",
      },
      {
        id: 10,
        name: "Jennifer Martinez",
        phone: "7788990011",
        grade: "Grade 5",
        center: "Center A",
      },
    ];

    const initialSessions: Session[] = [
      {
        id: 1,
        grade: "Grade 1",
        center: "Center A",
        date: "2023-10-01",
        time: "10:00",
        description: "Math Lesson",
      },
      {
        id: 2,
        grade: "Grade 2",
        center: "Center B",
        date: "2023-10-02",
        time: "11:00",
        description: "Science Experiment",
      },
      {
        id: 3,
        grade: "Grade 3",
        center: "Center C",
        date: "2023-10-03",
        time: "09:00",
        description: "History Lecture",
      },
      {
        id: 4,
        grade: "Grade 4",
        center: "Center D",
        date: "2023-10-04",
        time: "14:00",
        description: "English Workshop",
      },
    ];

    const initialAttendanceRecords: AttendanceRecord[] = [
      {
        sessionId: 1,
        studentId: 1,
        status: "present",
        homeworkStatus: "completed",
        testScore: "9/10",
      },
      {
        sessionId: 1,
        studentId: 2,
        status: "present",
        homeworkStatus: "completed",
        testScore: "8/10",
      },
      {
        sessionId: 2,
        studentId: 4,
        status: "present",
        homeworkStatus: "incomplete",
        testScore: "7/10",
      },
      {
        sessionId: 2,
        studentId: 5,
        status: "absent",
        homeworkStatus: "not-submitted",
        testScore: "",
      },
      {
        sessionId: 3,
        studentId: 6,
        status: "present",
        homeworkStatus: "completed",
        testScore: "10/10",
      },
      {
        sessionId: 3,
        studentId: 7,
        status: "present",
        homeworkStatus: "completed",
        testScore: "9/10",
      },
      {
        sessionId: 4,
        studentId: 8,
        status: "present",
        homeworkStatus: "incomplete",
        testScore: "8/10",
      },
      {
        sessionId: 4,
        studentId: 9,
        status: "absent",
        homeworkStatus: "not-submitted",
        testScore: "",
      },
    ];

    setStudents(initialStudents);
    setSessions(initialSessions);
    setAttendanceRecords(initialAttendanceRecords);

    // If there are sessions, select the first one by default for attendance and details tabs
    if (initialSessions.length > 0) {
      setSelectedSessionId(initialSessions[0].id);
      setSelectedSessionDetailId(initialSessions[0].id);
    }
  }, []);

  // Helper functions
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const countAttendanceStatus = (
    records: AttendanceRecord[],
    status: "present" | "absent"
  ) => {
    return records.filter((r) => r.status === status).length;
  };

  const countHomeworkStatus = (
    records: AttendanceRecord[],
    status: "completed" | "incomplete" | "not-submitted"
  ) => {
    return records.filter((r) => r.homeworkStatus === status).length;
  };

  // Form handlers
  const handleCreateSession = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const grade = formData.get("grade") as string;
    const center = formData.get("center") as string;
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    const description = formData.get("description") as string;

    if (!grade || !center || !date || !time) {
      alert("Please fill in all required fields.");
      return;
    }

    if (editingSessionId) {
      // Update existing session
      setSessions((prev) =>
        prev.map((session) =>
          session.id === editingSessionId
            ? { ...session, grade, center, date, time, description }
            : session
        )
      );
    } else {
      // Create new session
      const newId =
        sessions.length > 0 ? Math.max(...sessions.map((s) => s.id)) + 1 : 1;
      const newSession: Session = {
        id: newId,
        grade,
        center,
        date,
        time,
        description,
      };
      setSessions((prev) => [...prev, newSession]);

      // If this is the first session, select it for attendance and details tabs
      if (sessions.length === 0) {
        setSelectedSessionId(newId);
        setSelectedSessionDetailId(newId);
      }
    }

    setIsCreateSessionModalOpen(false);
    setEditingSessionId(null);
  };

  const handleEditSession = (sessionId: number) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setEditingSessionId(sessionId);
      setIsCreateSessionModalOpen(true);
    }
  };

  const handleDeleteSession = (sessionId: number) => {
    if (confirm("Are you sure you want to delete this session?")) {
      // Remove the session
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      // Remove related attendance records
      setAttendanceRecords((prev) =>
        prev.filter((r) => r.sessionId !== sessionId)
      );

      // Reset selection if the deleted session was selected
      if (selectedSessionId === sessionId) {
        setSelectedSessionId(null);
      }
      if (selectedSessionDetailId === sessionId) {
        setSelectedSessionDetailId(null);
      }
    }
  };

  const handleMarkAttendance = (sessionId: number, studentId: number) => {
    const session = sessions.find((s) => s.id === sessionId);
    const student = students.find((s) => s.id === studentId);

    if (session && student) {
      const existingRecord = attendanceRecords.find(
        (r) => r.sessionId === sessionId && r.studentId === studentId
      );

      setCurrentAttendance({
        sessionId,
        studentId,
        studentName: student.name,
        status: existingRecord?.status || "absent",
        homeworkStatus: existingRecord?.homeworkStatus || "not-submitted",
        testScore: existingRecord?.testScore || "",
      });

      setIsAttendanceModalOpen(true);
    }
  };

  const handleSaveAttendance = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentAttendance) return;

    const formData = new FormData(event.currentTarget);
    const status = formData.get("status") as "present" | "absent";
    const homeworkStatus = formData.get("homeworkStatus") as
      | "completed"
      | "incomplete"
      | "not-submitted";
    const testScore = formData.get("testScore") as string;

    const newRecord: AttendanceRecord = {
      sessionId: currentAttendance.sessionId,
      studentId: currentAttendance.studentId,
      status,
      homeworkStatus,
      testScore: testScore || undefined,
    };

    setAttendanceRecords((prev) => {
      // Remove existing record if it exists
      const filtered = prev.filter(
        (r) =>
          !(
            r.sessionId === newRecord.sessionId &&
            r.studentId === newRecord.studentId
          )
      );
      // Add the new/updated record
      return [...filtered, newRecord];
    });

    setIsAttendanceModalOpen(false);
    setCurrentAttendance(null);
  };

  const handleMarkById = () => {
    const studentIdInput = document.getElementById(
      "student-id-input"
    ) as HTMLInputElement;
    const sessionId = selectedSessionId;

    if (!sessionId) {
      alert("Please select a session first.");
      return;
    }

    const studentId = parseInt(studentIdInput.value.trim());
    if (isNaN(studentId)) {
      alert("Please enter a valid student ID.");
      return;
    }

    const session = sessions.find((s) => s.id === sessionId);
    const student = students.find((s) => s.id === studentId);

    if (!student) {
      alert("Student not found with ID: " + studentId);
      return;
    }

    if (!session) {
      alert("Selected session not found!");
      return;
    }

    // Check if student belongs to the session's grade and center
    if (student.grade !== session.grade || student.center !== session.center) {
      alert("This student does not belong to the selected session.");
      return;
    }

    handleMarkAttendance(sessionId, studentId);
    studentIdInput.value = "";
  };

  const handleMarkByPhone = () => {
    const phoneNumberInput = document.getElementById(
      "phone-number-input"
    ) as HTMLInputElement;
    const sessionId = selectedSessionId;

    if (!sessionId) {
      alert("Please select a session first.");
      return;
    }

    const phoneNumber = phoneNumberInput.value.trim();
    if (!phoneNumber) {
      alert("Please enter a phone number.");
      return;
    }

    const session = sessions.find((s) => s.id === sessionId);
    const student = students.find((s) => s.phone === phoneNumber);

    if (!student) {
      alert("Student not found with phone number: " + phoneNumber);
      return;
    }

    if (!session) {
      alert("Selected session not found!");
      return;
    }

    // Check if student belongs to the session's grade and center
    if (student.grade !== session.grade || student.center !== session.center) {
      alert("This student does not belong to the selected session.");
      return;
    }

    handleMarkAttendance(sessionId, student.id);
    phoneNumberInput.value = "";
  };

  const simulateQrScan = () => {
    const sessionId = selectedSessionId;

    if (!sessionId) {
      alert("Please select a session first.");
      return;
    }

    // Simple simulation - in a real app this would use a QR scanner library
    const choice = prompt(
      "Simulate QR scan:\n1. Scan by Student ID\n2. Scan by Phone Number\nEnter 1 or 2:"
    );
    if (choice === "1") {
      const studentId = prompt("Enter Student ID:");
      if (studentId) {
        const input = document.getElementById(
          "student-id-input"
        ) as HTMLInputElement;
        input.value = studentId;
        handleMarkById();
      }
    } else if (choice === "2") {
      const phoneNumber = prompt("Enter Phone Number:");
      if (phoneNumber) {
        const input = document.getElementById(
          "phone-number-input"
        ) as HTMLInputElement;
        input.value = phoneNumber;
        handleMarkByPhone();
      }
    } else {
      alert("Invalid choice. Please enter 1 or 2.");
    }
  };

  // Render functions
  const renderSessionsTab = () => {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-semibold text-text-primary">Sessions</h2>
          <Dialog
            open={isCreateSessionModalOpen}
            onOpenChange={setIsCreateSessionModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary-hover text-button-text">
                Create New Session
              </Button>
            </DialogTrigger>
            <DialogContent className="animate-fade-in bg-bg-secondary rounded-lg max-w-md">
              <DialogHeader>
                <DialogTitle className="text-text-primary">
                  {editingSessionId ? "Edit Session" : "Create New Session"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateSession} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="grade" className="text-text-secondary">
                    Grade
                  </Label>
                  <Select
                    name="grade"
                    defaultValue={
                      editingSessionId
                        ? sessions.find((s) => s.id === editingSessionId)?.grade
                        : undefined
                    }>
                    <SelectTrigger className="bg-bg-secondary border-border-default">
                      <SelectValue
                        placeholder="Select Grade"
                        className="text-text-primary"
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-bg-secondary border-border-default">
                      {grades.map((grade) => (
                        <SelectItem
                          key={grade}
                          value={grade}
                          className="hover:bg-bg-subtle">
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="center" className="text-text-secondary">
                    Center
                  </Label>
                  <Select
                    name="center"
                    defaultValue={
                      editingSessionId
                        ? sessions.find((s) => s.id === editingSessionId)
                            ?.center
                        : undefined
                    }>
                    <SelectTrigger className="bg-bg-secondary border-border-default">
                      <SelectValue
                        placeholder="Select Center"
                        className="text-text-primary"
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-bg-secondary border-border-default">
                      {centers.map((center) => (
                        <SelectItem
                          key={center}
                          value={center}
                          className="hover:bg-bg-subtle">
                          {center}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-text-secondary">
                    Date
                  </Label>
                  <Input
                    type="date"
                    name="date"
                    className="bg-bg-secondary border-border-default"
                    defaultValue={
                      editingSessionId
                        ? sessions.find((s) => s.id === editingSessionId)?.date
                        : undefined
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time" className="text-text-secondary">
                    Time
                  </Label>
                  <Input
                    type="time"
                    name="time"
                    className="bg-bg-secondary border-border-default"
                    defaultValue={
                      editingSessionId
                        ? sessions.find((s) => s.id === editingSessionId)?.time
                        : undefined
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-text-secondary">
                    Description
                  </Label>
                  <Textarea
                    name="description"
                    className="bg-bg-secondary border-border-default min-h-[100px]"
                    defaultValue={
                      editingSessionId
                        ? sessions.find((s) => s.id === editingSessionId)
                            ?.description
                        : undefined
                    }
                  />
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-border-default text-text-secondary hover:bg-bg-subtle w-full sm:w-auto">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary-hover text-button-text w-full sm:w-auto">
                    {editingSessionId ? "Update Session" : "Create Session"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <ScrollArea className="h-[calc(80vh-200px)] rounded-lg border border-border-card">
          <Table className="bg-bg-secondary">
            <TableHeader className="bg-bg-subtle sticky top-0">
              <TableRow>
                <TableHead className="text-text-primary">Grade</TableHead>
                <TableHead className="text-text-primary">Center</TableHead>
                <TableHead className="text-text-primary">Date</TableHead>
                <TableHead className="text-text-primary">Time</TableHead>
                <TableHead className="text-text-primary">Description</TableHead>
                <TableHead className="text-text-primary">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow
                  key={session.id}
                  className="border-border-default hover:bg-bg-subtle">
                  <TableCell className="text-text-primary">
                    {session.grade}
                  </TableCell>
                  <TableCell className="text-text-primary">
                    {session.center}
                  </TableCell>
                  <TableCell className="text-text-primary">
                    {formatDate(session.date)}
                  </TableCell>
                  <TableCell className="text-text-primary">
                    {session.time}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {session.description || "-"}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border-default text-text-secondary hover:bg-bg-subtle"
                      onClick={() => handleEditSession(session.id)}>
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="bg-destructive text-button-text hover:bg-destructive/90"
                      onClick={() => handleDeleteSession(session.id)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    );
  };

  const renderAttendanceTab = () => {
    const sessionId = selectedSessionId;
    const session = sessions.find((s) => s.id === sessionId);
    const filteredStudents = session
      ? students.filter(
          (s) => s.grade === session.grade && s.center === session.center
        )
      : [];
    const sessionRecords = attendanceRecords.filter(
      (r) => r.sessionId === sessionId
    );

    // Create a map of student IDs to their attendance records for quick lookup
    const recordsMap = new Map();
    sessionRecords.forEach((record) => {
      recordsMap.set(record.studentId, record);
    });

    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-semibold text-text-primary">
            Take Attendance
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <Label htmlFor="session-select" className="text-text-secondary">
                Select Session:
              </Label>
              <Select
                value={selectedSessionId?.toString()}
                onValueChange={(value) =>
                  setSelectedSessionId(parseInt(value))
                }>
                <SelectTrigger className="bg-bg-secondary border-border-default w-[280px]">
                  <SelectValue
                    placeholder="Select a session"
                    className="text-text-primary"
                  />
                </SelectTrigger>
                <SelectContent className="bg-bg-secondary border-border-default">
                  {sessions.map((session) => (
                    <SelectItem
                      key={session.id}
                      value={session.id.toString()}
                      className="hover:bg-bg-subtle">
                      {session.grade} - {session.center} (
                      {formatDate(session.date)} at {session.time})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        {session && (
          <>
            <div className="attendance-header-info mb-4 p-4 bg-bg-subtle rounded-lg">
              <h3 className="text-lg font-medium text-text-primary">
                Attendance for {session.grade} - {session.center} (
                {formatDate(session.date)} at {session.time})
              </h3>
              <p className="text-sm text-text-secondary mt-1">
                {session.description || "No description"}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-bg-secondary border-border-card rounded-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2 text-text-primary">
                    <QrCode className="h-4 w-4" />
                    Scan QR Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    id="qr-scanner"
                    className="h-32 bg-bg-subtle border-dashed border-2 border-border-default rounded-lg flex items-center justify-center cursor-pointer hover:bg-bg-subtle/80 transition-colors text-text-secondary"
                    onClick={simulateQrScan}>
                    Click to simulate QR scan
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-bg-secondary border-border-card rounded-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2 text-text-primary">
                    <User className="h-4 w-4" />
                    Enter Student ID
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    id="student-id-input"
                    placeholder="Student ID"
                    className="bg-bg-secondary border-border-default"
                  />
                  <Button
                    onClick={handleMarkById}
                    className="w-full bg-primary hover:bg-primary-hover text-button-text">
                    Mark Attendance
                  </Button>
                </CardContent>
              </Card>
              <Card className="bg-bg-secondary border-border-card rounded-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2 text-text-primary">
                    <Phone className="h-4 w-4" />
                    Enter Phone Number
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    id="phone-number-input"
                    placeholder="Phone Number"
                    className="bg-bg-secondary border-border-default"
                  />
                  <Button
                    onClick={handleMarkByPhone}
                    className="w-full bg-primary hover:bg-primary-hover text-button-text">
                    Mark Attendance
                  </Button>
                </CardContent>
              </Card>
            </div>
            <ScrollArea className="h-[calc(80vh-350px)] rounded-lg border border-border-card">
              <Table className="bg-bg-secondary">
                <TableHeader className="bg-bg-subtle sticky top-0">
                  <TableRow>
                    <TableHead className="text-text-primary">
                      Student Name
                    </TableHead>
                    <TableHead className="text-text-primary">Status</TableHead>
                    <TableHead className="text-text-primary">
                      Homework
                    </TableHead>
                    <TableHead className="text-text-primary">
                      Test Score
                    </TableHead>
                    <TableHead className="text-text-primary">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-text-secondary py-8">
                        No students found for this grade and center.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => {
                      const record = recordsMap.get(student.id) || {
                        status: "absent" as const,
                        homeworkStatus: "not-submitted" as const,
                        testScore: undefined,
                      };
                      return (
                        <TableRow
                          key={student.id}
                          className="border-border-default hover:bg-bg-subtle">
                          <TableCell className="text-text-primary">
                            {student.name}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                record.status === "present"
                                  ? "bg-success/20 text-success"
                                  : "bg-destructive/20 text-destructive"
                              }`}>
                              {record.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-text-primary">
                              {record.homeworkStatus}
                            </span>
                          </TableCell>
                          <TableCell className="text-text-primary">
                            {record.testScore || "-"}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-border-default text-text-secondary hover:bg-bg-subtle"
                              onClick={() =>
                                handleMarkAttendance(
                                  sessionId ? sessionId : 0,
                                  student.id
                                )
                              }>
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </>
        )}
      </div>
    );
  };

  const renderDetailsTab = () => {
    const sessionId = selectedSessionDetailId;
    const session = sessions.find((s) => s.id === sessionId);

    if (!session) {
      return (
        <div className="flex justify-center items-center h-64 bg-bg-secondary rounded-lg border border-border-card">
          <p className="text-text-secondary">
            Please select a session to view details.
          </p>
        </div>
      );
    }

    const filteredStudents = students.filter(
      (s) => s.grade === session.grade && s.center === session.center
    );
    const sessionRecords = attendanceRecords.filter(
      (r) => r.sessionId === sessionId
    );

    // Create a map of student IDs to their attendance records for quick lookup
    const recordsMap = new Map();
    sessionRecords.forEach((record) => {
      recordsMap.set(record.studentId, record);
    });

    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-semibold text-text-primary">
            Session Details
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <Label
                htmlFor="session-detail-select"
                className="text-text-secondary">
                Select Session:
              </Label>
              <Select
                value={selectedSessionDetailId?.toString()}
                onValueChange={(value) =>
                  setSelectedSessionDetailId(parseInt(value))
                }>
                <SelectTrigger className="bg-bg-secondary border-border-default w-[280px]">
                  <SelectValue
                    placeholder="Select a session"
                    className="text-text-primary"
                  />
                </SelectTrigger>
                <SelectContent className="bg-bg-secondary border-border-default">
                  {sessions.map((session) => (
                    <SelectItem
                      key={session.id}
                      value={session.id.toString()}
                      className="hover:bg-bg-subtle">
                      {session.grade} - {session.center} (
                      {formatDate(session.date)} at {session.time})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="session-detail-header bg-bg-subtle p-4 rounded-lg">
          <h3 className="text-lg font-medium text-text-primary mb-2">
            Details for {session.grade} - {session.center} (
            {formatDate(session.date)})
          </h3>
          <div className="session-meta flex flex-col sm:flex-row gap-3 text-sm text-text-secondary">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                <strong>Time:</strong> {session.time}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>
                <strong>Description:</strong>{" "}
                {session.description || "No description"}
              </span>
            </div>
          </div>
        </div>
        <div className="attendance-stats grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="bg-bg-secondary border-border-card rounded-lg">
            <CardContent className="pt-6 pb-4">
              <div className="stat-value text-2xl font-bold text-center text-text-primary mb-1">
                {countAttendanceStatus(sessionRecords, "present")}
              </div>
              <div className="stat-label text-sm text-text-secondary text-center">
                Present
              </div>
            </CardContent>
          </Card>
          <Card className="bg-bg-secondary border-border-card rounded-lg">
            <CardContent className="pt-6 pb-4">
              <div className="stat-value text-2xl font-bold text-center text-text-primary mb-1">
                {countAttendanceStatus(sessionRecords, "absent")}
              </div>
              <div className="stat-label text-sm text-text-secondary text-center">
                Absent
              </div>
            </CardContent>
          </Card>
          <Card className="bg-bg-secondary border-border-card rounded-lg">
            <CardContent className="pt-6 pb-4">
              <div className="stat-value text-2xl font-bold text-center text-text-primary mb-1">
                {countHomeworkStatus(sessionRecords, "completed")}
              </div>
              <div className="stat-label text-sm text-text-secondary text-center">
                Homework Completed
              </div>
            </CardContent>
          </Card>
        </div>
        <ScrollArea className="h-[calc(80vh-400px)] rounded-lg border border-border-card">
          <Table className="bg-bg-secondary">
            <TableHeader className="bg-bg-subtle sticky top-0">
              <TableRow>
                <TableHead className="text-text-primary">
                  Student Name
                </TableHead>
                <TableHead className="text-text-primary">Status</TableHead>
                <TableHead className="text-text-primary">Homework</TableHead>
                <TableHead className="text-text-primary">Test Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-text-secondary py-8">
                    No students found for this grade and center.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => {
                  const record = recordsMap.get(student.id) || {
                    status: "absent" as const,
                    homeworkStatus: "not-submitted" as const,
                    testScore: undefined,
                  };
                  return (
                    <TableRow
                      key={student.id}
                      className="border-border-default hover:bg-bg-subtle">
                      <TableCell className="text-text-primary">
                        {student.name}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            record.status === "present"
                              ? "bg-success/20 text-success"
                              : "bg-destructive/20 text-destructive"
                          }`}>
                          {record.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-text-primary">
                        {record.homeworkStatus}
                      </TableCell>
                      <TableCell className="text-text-primary">
                        {record.testScore || "-"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 bg-bg-base min-h-screen p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
            Attendance Management
          </h1>
          <p className="text-sm sm:text-base text-text-secondary mt-1">
            Manage and track student attendance for sessions
          </p>
        </div>
        <div className="bg-bg-subtle px-4 py-2 rounded-full text-sm text-text-secondary">
          Logged in as: Teacher
        </div>
      </div>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-bg-subtle">
          <TabsTrigger
            value="sessions"
            className="data-[state=active]:bg-primary data-[state=active]:text-button-text">
            Sessions
          </TabsTrigger>
          <TabsTrigger
            value="attendance"
            className="data-[state=active]:bg-primary data-[state=active]:text-button-text">
            Attendance
          </TabsTrigger>
          <TabsTrigger
            value="details"
            className="data-[state=active]:bg-primary data-[state=active]:text-button-text">
            Session Details
          </TabsTrigger>
        </TabsList>
        <TabsContent value="sessions">{renderSessionsTab()}</TabsContent>
        <TabsContent value="attendance">{renderAttendanceTab()}</TabsContent>
        <TabsContent value="details">{renderDetailsTab()}</TabsContent>
      </Tabs>
      {/* Attendance Modal */}
      <Dialog
        open={isAttendanceModalOpen}
        onOpenChange={setIsAttendanceModalOpen}>
        <DialogContent className="animate-fade-in bg-bg-secondary rounded-lg max-w-md">
          <DialogHeader>
            <DialogTitle className="text-text-primary">
              Mark Attendance
            </DialogTitle>
          </DialogHeader>
          {currentAttendance && (
            <form onSubmit={handleSaveAttendance} className="space-y-4">
              <input
                type="hidden"
                name="sessionId"
                value={currentAttendance.sessionId}
              />
              <input
                type="hidden"
                name="studentId"
                value={currentAttendance.studentId}
              />
              <div className="space-y-2">
                <Label htmlFor="student-name" className="text-text-secondary">
                  Student
                </Label>
                <Input
                  id="student-name"
                  value={currentAttendance.studentName}
                  readOnly
                  className="bg-bg-secondary border-border-default"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-text-secondary">
                  Status
                </Label>
                <Select name="status" defaultValue={currentAttendance.status}>
                  <SelectTrigger className="bg-bg-secondary border-border-default">
                    <SelectValue
                      placeholder="Select status"
                      className="text-text-primary"
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-bg-secondary border-border-default">
                    <SelectItem value="present" className="hover:bg-bg-subtle">
                      Present
                    </SelectItem>
                    <SelectItem value="absent" className="hover:bg-bg-subtle">
                      Absent
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="homeworkStatus" className="text-text-secondary">
                  Homework Status
                </Label>
                <Select
                  name="homeworkStatus"
                  defaultValue={currentAttendance.homeworkStatus}>
                  <SelectTrigger className="bg-bg-secondary border-border-default">
                    <SelectValue
                      placeholder="Select homework status"
                      className="text-text-primary"
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-bg-secondary border-border-default">
                    <SelectItem
                      value="completed"
                      className="hover:bg-bg-subtle">
                      Completed
                    </SelectItem>
                    <SelectItem
                      value="incomplete"
                      className="hover:bg-bg-subtle">
                      Incomplete
                    </SelectItem>
                    <SelectItem
                      value="not-submitted"
                      className="hover:bg-bg-subtle">
                      Not Submitted
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="testScore" className="text-text-secondary">
                  Test Score (if any)
                </Label>
                <Input
                  id="testScore"
                  name="testScore"
                  placeholder="Score out of total"
                  className="bg-bg-secondary border-border-default"
                  defaultValue={currentAttendance.testScore}
                />
              </div>
              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-border-default text-text-secondary hover:bg-bg-subtle w-full sm:w-auto">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary-hover text-button-text w-full sm:w-auto">
                  Save Attendance
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
