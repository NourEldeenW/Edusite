"use client";

import { Button } from "@/components/ui/button";
import { AllStudentsContext, Attendance_StudentType } from "./main";
import {
  User,
  Loader2,
  ClipboardList,
  CheckCircle,
  XCircle,
  MoreVertical,
  CheckCircle2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useContext, useEffect, useId, useMemo, useState } from "react";
import { Student } from "@/app/(main)/admin/students/_studentscomp/mainpage";
import { Badge } from "@/components/ui/badge";
import { homework } from "./context";
import { api } from "@/lib/axiosinterceptor";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { showToast } from "../../students/_students comps/main";

const djangoApi = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;

interface homeworkType {
  id: number;
  session: number;
  student: Student;
  completed: boolean;
  notes: string;
}

interface editedStudentStatusesType {
  homework: "done" | "not_done" | null;
  attended: boolean;
}

interface TableDataProps {
  attended_students: Attendance_StudentType[];
  onNav: () => void;
  centerid: number;
  access: string;
  sessionID: number;
}

export default function TableData({
  attended_students,
  onNav,
  centerid,
  access,
  sessionID,
}: TableDataProps) {
  const [isTakingAttendance, setIsTakingAttendance] = useState(false);
  const [homeworkData, setHomeworkData] = useState<homeworkType[]>([]);
  const [isEditDialogOpen, setIsEditeDialogOpen] = useState(false);
  const [editedStudent, setEditedStudent] = useState<Student | null>(null);
  const [editedStudentStatuses, setEditedStudentStatuses] =
    useState<editedStudentStatusesType>();
  const [isLoading, setIsLoading] = useState(false);
  const [localAttendedStudents, setLocalAttendedStudents] =
    useState<Attendance_StudentType[]>(attended_students);

  const { allStudents } = useContext(AllStudentsContext);
  const hashomework = useContext(homework);

  const formID = useId();
  const fullnameID = useId();
  const phoneID = useId();
  const centerID = useId();
  const parentPhoneID = useId();

  // Memoize attended student IDs for efficient lookup
  const attendedStudentIds = useMemo(() => {
    return new Set(localAttendedStudents.map((student) => student.id));
  }, [localAttendedStudents]);

  // Filter students into attended/absent arrays
  const [attended, absent] = useMemo(() => {
    const attendedArr: Student[] = [];
    const absentArr: Student[] = [];

    allStudents.forEach((student) => {
      if (attendedStudentIds.has(student.id)) {
        attendedArr.push(student);
      } else if (student.center.id === centerid) {
        absentArr.push(student);
      }
    });

    return [attendedArr, absentArr];
  }, [allStudents, attendedStudentIds, centerid]);

  const handleTakeAttendance = () => {
    setIsTakingAttendance(true);
    setTimeout(() => {
      onNav();
      setIsTakingAttendance(false);
    }, 500);
  };

  useEffect(() => {
    if (!hashomework) return;
    const fetchHW = async () => {
      try {
        const res = await api.get(
          `${djangoApi}session/sessions/${sessionID}/homework/`,
          {
            headers: { Authorization: `Bearer ${access}` },
          }
        );
        setHomeworkData(res.data);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchHW();
  }, [sessionID, access, attended, hashomework]);

  useEffect(() => {
    setLocalAttendedStudents(attended_students);
  }, [attended_students]);

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (!editedStudent) {
      setIsLoading(false);
      return;
    }

    // Save original state for rollback
    const originalAttendedStudents = [...localAttendedStudents];
    const originalHomeworkData = [...homeworkData];

    try {
      // Optimistic UI update for attendance
      if (editedStudentStatuses?.attended) {
        // Mark as attended
        if (!attendedStudentIds.has(editedStudent.id)) {
          setLocalAttendedStudents((prev) => [
            ...prev,
            {
              id: editedStudent.id,
              student: editedStudent,
              full_name: editedStudent.full_name,
              student_id: editedStudent.student_id,
            },
          ]);
        }
      } else {
        // Mark as absent
        setLocalAttendedStudents((prev) =>
          prev.filter((s) => s.id !== editedStudent.id)
        );
      }

      // Optimistic UI update for homework
      if (editedStudentStatuses?.attended && editedStudentStatuses.homework) {
        setHomeworkData((prev) => {
          const existingIndex = prev.findIndex(
            (hw) => hw.student.id === editedStudent.id
          );

          if (existingIndex >= 0) {
            // Update existing homework
            return prev.map((hw) =>
              hw.student.id === editedStudent.id
                ? {
                    ...hw,
                    completed: editedStudentStatuses.homework === "done",
                  }
                : hw
            );
          } else {
            // Add new homework record
            return [
              ...prev,
              {
                id: Date.now(), // Temporary ID
                session: sessionID,
                student: editedStudent,
                completed: editedStudentStatuses.homework === "done",
                notes: "",
              },
            ];
          }
        });
      }

      // API calls
      const payload = [
        {
          student_id: editedStudent.id,
          attended: editedStudentStatuses?.attended,
        },
      ];

      await api.post(
        `${djangoApi}session/sessions/${sessionID}/attendance/create/`,
        payload,
        { headers: { Authorization: `Bearer ${access}` } }
      );
      await api.post(
        `${djangoApi}session/sessions/${sessionID}/homework/create/`,
        [
          {
            student_id: editedStudent.id,
            completed: editedStudentStatuses?.homework === "done",
          },
        ],
        { headers: { Authorization: `Bearer ${access}` } }
      );

      // Refresh homework data to get actual IDs
      if (hashomework) {
        const res = await api.get(
          `${djangoApi}session/sessions/${sessionID}/homework/`,
          { headers: { Authorization: `Bearer ${access}` } }
        );
        setHomeworkData(res.data);
      }

      showToast("Attendance updated", "success");
      setIsEditeDialogOpen(false);
    } catch {
      // Rollback on error
      setLocalAttendedStudents(originalAttendedStudents);
      setHomeworkData(originalHomeworkData);
      showToast("Couldn't update attendance", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-8">
        {/* Attended Students Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 border-b border-gray-200">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Attended Students
                <Badge
                  variant="secondary"
                  className="ml-2 bg-green-100 text-green-800">
                  {attended.length}
                </Badge>
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Students who attended this session
              </p>
            </div>
            <Button
              variant="default"
              onClick={handleTakeAttendance}
              disabled={isTakingAttendance}
              className="gap-2 text-sm bg-primary hover:bg-primary/90 shadow-md transition-all min-w-[180px]">
              {isTakingAttendance ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Redirecting...
                </>
              ) : (
                <>
                  <ClipboardList className="w-4 h-4" />
                  Take Attendance
                </>
              )}
            </Button>
          </div>

          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="pl-8">Student</TableHead>
                <TableHead>Center</TableHead>
                <TableHead>Status</TableHead>
                {hashomework && <TableHead>Homework Status</TableHead>}
                <TableHead className="text-right pr-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attended.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-gray-100 rounded-full p-3 mb-4">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-700 mb-1">
                        No Attended Students
                      </h4>
                      <p className="text-gray-500 max-w-md">
                        No students have been marked as attended for this
                        session.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                attended.map((student) => (
                  <TableRow key={student.id} className="hover:bg-gray-50">
                    <TableCell className="pl-8">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {student.full_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            ID: {student.student_id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-gray-700">
                        {student.center?.name || "N/A"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 px-3 py-1">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Attended
                      </Badge>
                    </TableCell>
                    {hashomework && (
                      <TableCell>
                        {homeworkData.find((hw) => hw.student.id === student.id)
                          ?.completed ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 px-3 py-1">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Done
                          </Badge>
                        ) : (
                          <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 px-3 py-1">
                            <XCircle className="w-4 h-4 mr-1" />
                            Not Done
                          </Badge>
                        )}
                      </TableCell>
                    )}
                    <TableCell className="pr-8 text-right">
                      <Button
                        onClick={() => {
                          setEditedStudent(student);
                          setEditedStudentStatuses({
                            homework: homeworkData.find(
                              (hw) => hw.student.id === student.id
                            )?.completed
                              ? "done"
                              : "not_done",
                            attended: true,
                          });
                          setIsEditeDialogOpen(true);
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:bg-primary/20">
                        <MoreVertical></MoreVertical>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Absent Students Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-500" />
              Absent Students
              <Badge
                variant="secondary"
                className="ml-2 bg-rose-100 text-rose-800">
                {absent.length}
              </Badge>
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Students who were absent for this session
            </p>
          </div>

          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="pl-8">Student</TableHead>
                <TableHead>Center</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {absent.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-green-100 rounded-full p-3 mb-4">
                        <User className="w-8 h-8 text-green-500" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-700 mb-1">
                        Perfect Attendance!
                      </h4>
                      <p className="text-gray-500 max-w-md">
                        All students attended this session. Great job!
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                absent.map((student) => (
                  <TableRow key={student.id} className="hover:bg-gray-50">
                    <TableCell className="pl-8">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {student.full_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            ID: {student.student_id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-gray-700">
                        {student.center?.name || "N/A"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 px-3 py-1">
                        <XCircle className="w-4 h-4 mr-1" />
                        Absent
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => {
                          setEditedStudent(student);
                          setEditedStudentStatuses({
                            homework: homeworkData.find(
                              (hw) => hw.student.id === student.id
                            )?.completed
                              ? "done"
                              : "not_done",
                            attended: false,
                          });
                          setIsEditeDialogOpen(true);
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:bg-primary/20">
                        <MoreVertical></MoreVertical>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editedStudent?.full_name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} id={formID}>
            <div className="grid gap-4 py-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor={fullnameID} className="text-foreground/80">
                    Full Name
                  </Label>
                  <Input
                    id={fullnameID}
                    value={editedStudent?.full_name}
                    className="mt-1 font-medium"
                    disabled
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={phoneID} className="text-foreground/80">
                      Phone Number
                    </Label>
                    <Input
                      id={phoneID}
                      value={editedStudent?.phone_number}
                      className="mt-1"
                      disabled
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor={parentPhoneID}
                      className="text-foreground/80">
                      Parent&apos;s Phone
                    </Label>
                    <Input
                      id={parentPhoneID}
                      value={editedStudent?.parent_number}
                      className="mt-1"
                      disabled
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={centerID} className="text-foreground/80">
                    Study Center
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id={centerID}
                      value={editedStudent?.center.name}
                      className="font-medium"
                      disabled
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-foreground/80">
                    Attendance Status
                  </Label>
                  <select
                    value={
                      editedStudentStatuses?.attended
                        ? "attended"
                        : "not_attended"
                    }
                    onChange={(e) => {
                      const isAttended = e.target.value === "attended";
                      setEditedStudentStatuses((prev) => ({
                        ...(prev || { attended: false, homework: null }),
                        attended: isAttended,
                        // Reset homework status if changing to absent
                        homework: isAttended ? prev?.homework || null : null,
                      }));
                    }}
                    className="mt-1 flex h-9 w-full items-center justify-between rounded-md border border-foreground/30 bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                    <option value="attended">Attended</option>
                    <option value="not_attended">Absent</option>
                  </select>
                </div>

                {hashomework && editedStudentStatuses?.attended && (
                  <div>
                    <Label className="text-foreground/80">
                      Homework Status
                    </Label>
                    <select
                      value={editedStudentStatuses.homework || ""}
                      onChange={(e) => {
                        const value = e.target.value as "done" | "not_done";
                        setEditedStudentStatuses((prev) => ({
                          ...(prev || { attended: true, homework: null }),
                          homework: value,
                        }));
                      }}
                      className="mt-1 flex h-9 w-full items-center justify-between rounded-md border border-foreground/30 bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                      <option value="" disabled>
                        Select status
                      </option>
                      <option value="done">Homework Done</option>
                      <option value="not_done">Homework Not Done</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </form>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditeDialogOpen(false)}
              disabled={isLoading}
              className="flex-1 border-foreground/30 hover:bg-foreground/5">
              <XCircle className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              form={formID}
              disabled={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirm Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
