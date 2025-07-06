"use client";
import {
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  QrCode,
  Smartphone,
  User,
  UserSquare,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { showToast } from "../../students/_students comps/main";
import BarcodeScanner from "react-qr-barcode-scanner";
import { AllStudentsContext } from "./main";
import { Student } from "@/app/(main)/admin/students/_studentscomp/mainpage";
import ConfDialog from "./confirmationdialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/lib/axiosinterceptor";
import { homework } from "./context";

const djangoApi = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;

interface AttendanceFormProps {
  sessionId: number | null;
  access: string;
  preventNavigation: (shouldPrevent: boolean) => void; // Add this prop
}

interface AttendanceRecord {
  id: number;
  student_id: string;
  name: string;
  grade: string;
  center: string;
  timestamp: string;
  method: "qr" | "manual";
  homework?: "done" | "not_done";
}

export default function AttendanceForm({
  sessionId,
  access,
  preventNavigation, // Add this prop
}: AttendanceFormProps) {
  const [activeTab, setActiveTab] = useState<"qr" | "manual">("qr");
  const [qrData, setQrData] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [formData, setFormData] = useState({
    parentPhone: "",
    studentPhone: "",
    studentId: "",
  });
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState<boolean>(false);
  const [multipleFoundStudents, setMultipleFoundStudents] = useState<Student[]>(
    []
  );
  const [isMultipleFoundDialogOpen, setIsMultipleFoundDialogOpen] =
    useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const hashomework = useContext(homework);

  // Track the current session ID for localStorage
  const currentSessionRef = useRef<number | null>(null);

  // Track if we need to show reload confirmation
  const showReloadWarningRef = useRef(false);

  const { allStudents } = useContext(AllStudentsContext);

  // Memoized student map for faster lookups
  const studentIdMap = useMemo(() => {
    const map = new Map<string, Student>();
    allStudents.forEach((student) => {
      map.set(student.student_id, student);
    });
    return map;
  }, [allStudents]);

  // NEW: Prevent navigation when there are unsaved records
  useEffect(() => {
    preventNavigation(attendanceRecords.length > 0);
  }, [attendanceRecords, preventNavigation]);

  // Handle beforeunload event
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (attendanceRecords.length > 0) {
        e.preventDefault();
        return "You have unsaved attendance records. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [attendanceRecords]);

  // Load saved attendance records
  useEffect(() => {
    if (!sessionId) return;

    // Clear records if session changes
    if (
      currentSessionRef.current !== null &&
      currentSessionRef.current !== sessionId
    ) {
      setAttendanceRecords([]);
      localStorage.removeItem(`attendance_${currentSessionRef.current}`);
      showToast("Session changed - Previous records cleared", "error");
    }

    // Update current session reference
    currentSessionRef.current = sessionId;

    // Load records for current session
    const savedRecords = localStorage.getItem(`attendance_${sessionId}`);
    if (savedRecords) {
      try {
        const parsedRecords = JSON.parse(savedRecords);
        if (parsedRecords.length > 0) {
          setAttendanceRecords(parsedRecords);
          showToast("Restored unsaved attendance records", "success");
        }
      } catch (error) {
        console.error("Error loading saved attendance:", error);
        showToast("Error loading saved attendance", "error");
      }
    }
  }, [sessionId]);

  // Save attendance records
  useEffect(() => {
    if (sessionId && attendanceRecords.length > 0) {
      localStorage.setItem(
        `attendance_${sessionId}`,
        JSON.stringify(attendanceRecords)
      );
      showReloadWarningRef.current = true;
    } else {
      showReloadWarningRef.current = false;
    }
  }, [attendanceRecords, sessionId]);

  // Network status detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Submit attendance records
  const submitAttendance = useCallback(async () => {
    if (!sessionId || attendanceRecords.length === 0 || isSubmitting) return;

    setIsSubmitting(true);

    try {
      if (!navigator.onLine) {
        showToast("Offline - Records saved locally", "error");
        return;
      }

      // Prepare payload
      const attendancePayload = attendanceRecords.map((record) => ({
        student_id: record.id,
        attended: true,
      }));

      const response = await api.post(
        `${djangoApi}session/sessions/${sessionId}/attendance/create/`,
        attendancePayload,
        { headers: { Authorization: `Bearer ${access}` } }
      );

      // Handle homework if needed
      if (hashomework) {
        const homeworkPayload = attendanceRecords.map((record) => ({
          student_id: record.id,
          completed: record.homework === "done",
        }));

        await api.post(
          `${djangoApi}session/sessions/${sessionId}/homework/create/`,
          homeworkPayload,
          { headers: { Authorization: `Bearer ${access}` } }
        );
      }

      // Handle success
      if (response.status === 200 || response.status === 201) {
        showToast("Attendance submitted successfully!", "success");
        setAttendanceRecords([]);
        localStorage.removeItem(`attendance_${sessionId}`);
        showReloadWarningRef.current = false;
      } else {
        throw new Error(`Unexpected status: ${response.status}`);
      }
    } catch (error) {
      console.error("Submission error:", error);
      showToast("Failed to submit. Records saved locally.", "error");
    } finally {
      setIsSubmitting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, attendanceRecords, access, hashomework]);

  // Auto-submit when online
  useEffect(() => {
    if (isOnline && attendanceRecords.length > 0) {
      submitAttendance();
    }
  }, [isOnline, attendanceRecords, submitAttendance]);

  // Handle QR data
  useEffect(() => {
    if (!qrData) return;
    handleQRSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrData]);

  // QR scanner handlers
  const startScanner = useCallback(() => {
    setIsScanning(true);
    showToast("Position QR code within frame", "success");
  }, []);

  const stopScanner = useCallback(() => {
    setIsScanning(false);
    setQrData(null);
  }, []);

  // Form input handler
  const handleFormChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  // Manual submission handler
  const handleManualSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      let foundStudents: Student[] = [];

      // Search priority
      if (formData.studentId) {
        const student = studentIdMap.get(formData.studentId);
        if (student) foundStudents = [student];
      }

      if (foundStudents.length === 0 && formData.studentPhone) {
        foundStudents = allStudents.filter(
          (student) => student.phone_number === formData.studentPhone
        );
      }

      if (foundStudents.length === 0 && formData.parentPhone) {
        foundStudents = allStudents.filter(
          (student) => student.parent_number === formData.parentPhone
        );
      }

      if (foundStudents.length === 1) {
        setSelectedStudent(foundStudents[0]);
        setIsConfirmationDialogOpen(true);
      } else if (foundStudents.length === 0) {
        showToast("Student not found", "error");
      } else if (foundStudents.length > 1) {
        setMultipleFoundStudents(foundStudents);
        setIsMultipleFoundDialogOpen(true);
      }

      // Clear form
      setFormData({ parentPhone: "", studentPhone: "", studentId: "" });
    },
    [formData, allStudents, studentIdMap]
  );

  // Student selection handler
  const handleStudentSelect = useCallback((student: Student) => {
    setSelectedStudent(student);
    setIsMultipleFoundDialogOpen(false);
    setIsConfirmationDialogOpen(true);
  }, []);

  // Attendance confirmation
  const handleFormConf = useCallback(
    (
      student: Student,
      method: "qr" | "manual",
      hw_status?: "done" | "not_done"
    ) => {
      const newRecord: AttendanceRecord = {
        id: student.id,
        student_id: student.student_id,
        name: student.full_name,
        grade: student.grade.name,
        center: student.center.name,
        timestamp: new Date().toISOString(),
        method,
        homework: hw_status,
      };

      setAttendanceRecords((prev) => [...prev, newRecord]);
      showToast("Attendance recorded", "success");
    },
    []
  );

  // QR submission handler
  const handleQRSubmit = useCallback(() => {
    if (!qrData) return;

    const student = studentIdMap.get(qrData);
    if (student) {
      setSelectedStudent(student);
      setIsConfirmationDialogOpen(true);
      setQrData(null);
    } else {
      showToast("Student not found", "error");
    }

    setQrData(null);
  }, [qrData, studentIdMap]);

  // Clear records handler
  const clearAttendanceRecords = useCallback(() => {
    setAttendanceRecords([]);
    if (sessionId) {
      localStorage.removeItem(`attendance_${sessionId}`);
    }
    showToast("Records cleared", "success");
    showReloadWarningRef.current = false;
  }, [sessionId]);

  // Memoized components
  const QRScannerContent = useMemo(
    () => (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-1 sm:mb-2">
            Scan Student QR Code
          </h3>
          <p className="text-gray-500 text-sm sm:text-base">
            Use your device&apos;s camera to scan the student&apos;s QR code
          </p>
        </div>

        <div className="relative bg-gray-50 rounded-xl border-2 border-dashed py-4 border-gray-300 min-h-[250px] sm:min-h-[300px] flex flex-col items-center justify-center overflow-hidden">
          {isScanning ? (
            <>
              <div className="w-full h-fit flex flex-col items-center p-1 sm:p-4">
                <div className="w-full h-0 max-w-lg rounded-xl overflow-hidden relative shadow-2xl flex-1 qr-scanner-container">
                  <BarcodeScanner
                    width="100%"
                    height="100%"
                    onUpdate={(_, res) => res && setQrData(res.getText())}
                    delay={150}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="border-[3px] border-white/80 rounded-xl w-[55%] max-w-[280px] aspect-square relative shadow-[0_0_0_100vmax_rgba(0,0,0,0.7)]"></div>
                  </div>
                </div>
                <div className="mt-2 sm:mt-4 flex flex-col sm:flex-row gap-2 w-full px-2 sm:px-4 max-w-lg">
                  <Button
                    onClick={stopScanner}
                    variant="outline"
                    className="border-gray-300 text-xs sm:text-sm py-2">
                    Stop Scanner
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-6 sm:py-10 px-4">
              <div className="bg-blue-100 rounded-full p-3 sm:p-4 inline-block mb-3 sm:mb-4">
                <QrCode className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600" />
              </div>
              <h4 className="text-base sm:text-lg font-medium text-gray-700 mb-1 sm:mb-2">
                Ready to Scan
              </h4>
              <p className="text-gray-500 text-sm sm:text-base max-w-md mb-4 sm:mb-6">
                Position the student&apos;s QR code within the frame
              </p>
              <Button
                onClick={startScanner}
                className="bg-primary hover:bg-primary/90 text-xs sm:text-sm">
                Start QR Scanner
              </Button>
            </div>
          )}
        </div>
      </div>
    ),
    [isScanning, startScanner, stopScanner]
  );

  const ManualEntryForm = useMemo(
    () => (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-1 sm:mb-2">
            Manual Attendance Entry
          </h3>
          <p className="text-gray-500 text-sm sm:text-base">
            Enter student information using one of these methods
          </p>
        </div>

        <form onSubmit={handleManualSubmit} className="space-y-3 sm:space-y-4">
          <div className="space-y-1 sm:space-y-2">
            <Label
              htmlFor="studentId"
              className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
              <UserSquare className="w-3 h-3 sm:w-4 sm:h-4" /> Student ID
            </Label>
            <Input
              id="studentId"
              name="studentId"
              type="text"
              value={formData.studentId}
              onChange={handleFormChange}
              placeholder="000000"
              className="text-sm sm:text-base"
              maxLength={6}
              minLength={6}
              pattern="[0-9]{6}"
            />
          </div>

          <div className="relative flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500 text-xs sm:text-sm">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <div className="space-y-1 sm:space-y-2">
            <Label
              htmlFor="studentPhone"
              className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
              <Smartphone className="w-3 h-3 sm:w-4 sm:h-4" /> Student&apos;s
              Phone
            </Label>
            <Input
              id="studentPhone"
              name="studentPhone"
              type="tel"
              value={formData.studentPhone}
              onChange={handleFormChange}
              placeholder="01xxxxxxxxx"
              className="text-sm sm:text-base"
              maxLength={11}
              minLength={11}
              pattern="[0-9]{11}"
            />
          </div>

          <div className="relative flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500 text-xs sm:text-sm">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <div className="space-y-1 sm:space-y-2">
            <Label
              htmlFor="parentPhone"
              className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
              <User className="w-3 h-3 sm:w-4 sm:h-4" /> Parent&apos;s Phone
            </Label>
            <Input
              id="parentPhone"
              name="parentPhone"
              type="tel"
              value={formData.parentPhone}
              onChange={handleFormChange}
              placeholder="01xxxxxxxxx"
              className="text-sm sm:text-base"
              maxLength={11}
              minLength={11}
              pattern="[0-9]{11}"
            />
          </div>

          <Button
            type="submit"
            className="w-full mt-3 sm:mt-4 bg-primary hover:bg-primary/90 text-sm sm:text-base"
            disabled={
              !formData.parentPhone &&
              !formData.studentPhone &&
              !formData.studentId
            }>
            Record Attendance
          </Button>
        </form>
      </div>
    ),
    [formData, handleFormChange, handleManualSubmit]
  );

  const AttendanceRecordsList = useMemo(
    () => (
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {attendanceRecords.map((record) => (
          <div
            key={`record-${record.id}-${record.timestamp}`}
            className="p-4 border border-gray-200 rounded-lg flex flex-wrap items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-[100px]">
              <div className="flex flex-wrap justify-between items-start gap-2">
                <h4 className="font-medium text-gray-800">{record.name}</h4>
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  {new Date(record.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  ID: {record.id}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {record.grade}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {record.center}
                </Badge>
              </div>
            </div>
            <Badge className="bg-blue-100 text-blue-800 text-xs sm:text-sm ml-auto sm:ml-0">
              {record.method.toUpperCase()}
            </Badge>
          </div>
        ))}
      </div>
    ),
    [attendanceRecords]
  );

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm max-w-full overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={(value: string) =>
            (value === "qr" || value === "manual") && setActiveTab(value)
          }>
          <TabsList className="grid grid-cols-2 w-full max-w-md mb-4 sm:mb-6 self-center justify-self-center">
            <TabsTrigger
              value="qr"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <QrCode className="w-3 h-3 sm:w-4 sm:h-4" /> QR
            </TabsTrigger>
            <TabsTrigger
              value="manual"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <UserSquare className="w-3 h-3 sm:w-4 sm:h-4" /> Manual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="qr">{QRScannerContent}</TabsContent>
          <TabsContent value="manual">{ManualEntryForm}</TabsContent>
        </Tabs>
      </div>

      {attendanceRecords.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm w-full">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
            <h3 className="text-lg font-medium text-gray-800">
              Attendance Records
            </h3>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2 max-w-2xl">
              <div className="bg-amber-100 p-1.5 rounded-full mt-0.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-amber-600"
                  viewBox="0 0 20 20"
                  fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium text-amber-800">Important Notice</p>
                <p className="text-sm text-amber-700 mt-1">
                  DO NOT CLOSE OR REFRESH THIS TAB UNTIL ALL RECORDS ARE
                  SUBMITTED
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full">
                {attendanceRecords.length} recorded
              </span>
              {!isOnline && (
                <span className="text-orange-500 border border-orange-300 text-xs font-medium px-2.5 py-1 rounded-full">
                  Offline
                </span>
              )}
            </div>
          </div>

          {AttendanceRecordsList}

          <div className="mt-6 flex flex-wrap gap-3 justify-end">
            <Button
              variant="outline"
              className="border-gray-300"
              onClick={clearAttendanceRecords}
              disabled={isSubmitting}>
              Clear All
            </Button>
            <Button
              onClick={submitAttendance}
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90">
              {isSubmitting ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </span>
              ) : isOnline ? (
                "Submit Attendance"
              ) : (
                "Submit When Online"
              )}
            </Button>
          </div>
        </div>
      )}

      <Dialog
        open={isMultipleFoundDialogOpen}
        onOpenChange={setIsMultipleFoundDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Multiple Students Found</DialogTitle>
            <DialogDescription className="mt-1">
              Please select the correct student
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {multipleFoundStudents.map((student) => (
              <div
                key={student.id}
                className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => handleStudentSelect(student)}>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800 truncate">
                    {student.full_name}
                  </h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <Badge variant="outline" className="text-xs">
                      ID: {student.student_id}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {student.center.name}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Grade: {student.grade.name}
                    </Badge>
                  </div>
                  <p className="text-gray-500 text-sm truncate mt-1">
                    Student Phone: {student.phone_number}
                  </p>
                  <p className="text-gray-500 text-sm truncate">
                    Parent Phone: {student.parent_number}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsMultipleFoundDialogOpen(false)}
              className="border-gray-300">
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfDialog
        isConfirmationDialogOpen={isConfirmationDialogOpen}
        setIsConfirmationDialogOpen={setIsConfirmationDialogOpen}
        selectedStudent={selectedStudent ? [selectedStudent] : []}
        onconf={handleFormConf}
      />
    </div>
  );
}
