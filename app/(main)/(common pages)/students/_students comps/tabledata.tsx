import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StudentData, GradeType } from "./main";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  BookOpen,
  Building2,
  Check,
  ChevronDown,
  ChevronsUpDown,
  Edit,
  MoreVertical,
  Phone,
  Trash2,
  User,
  UserCircle,
  UserRound,
  UserRoundPen,
  Users,
  UsersRound,
  X,
  Lock,
  FileText,
} from "lucide-react";
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
import { Dialog } from "@radix-ui/react-dialog";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { api } from "@/lib/axiosinterceptor";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import GenerateStudentReportDialog from "./generateStuReport";

interface TableDataProps {
  data: StudentData[];
  availableCentersInitial: GradeType[];
  availableGradesInitial: GradeType[];
  access: string;
  isFetching: boolean;
  triggerDataRefresh: () => void;
}

interface EditStudentData {
  id: number;
  grade: GradeType;
  center: GradeType;
  full_name: string;
  phone_number: string;
  parent_number: string;
  gender: string;
  user: number;
  password: string;
  username: string;
}

const djangoapi = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;

// Skeleton Components
const TableSkeleton = () => (
  <div className="w-full bg-bg-secondary p-4 rounded-xl border border-border-default px-10 pt-6">
    <div className="text-lg sm:text-xl text-text-primary text-left font-semibold pl-5 mb-6">
      <Skeleton className="h-6 w-1/4 bg-gray-200" />
    </div>
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 border-b border-border-default">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full bg-gray-200" />
            <Skeleton className="h-4 w-32 bg-gray-200" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 bg-gray-200" />
            <Skeleton className="h-4 w-32 bg-gray-200" />
          </div>
          <Skeleton className="h-8 w-20 bg-gray-200" />
          <Skeleton className="h-4 w-16 bg-gray-200" />
          <Skeleton className="h-8 w-24 bg-gray-200" />
          <Skeleton className="h-4 w-10 bg-gray-200" />
        </div>
      ))}
    </div>
  </div>
);

const EditFormSkeleton = () => (
  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
    {[...Array(8)].map((_, i) => (
      <div key={i} className={i === 0 ? "md:col-span-2" : ""}>
        <Skeleton className="h-4 w-1/4 mb-2 bg-gray-200" />
        <Skeleton className="h-10 w-full bg-gray-200" />
      </div>
    ))}
    <div className="mt-3 md:col-span-2">
      <Skeleton className="h-4 w-1/4 mb-2 bg-gray-200" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4 rounded-full bg-gray-200" />
            <Skeleton className="h-4 w-20 bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default function TableData({
  data,
  availableCentersInitial,
  availableGradesInitial,
  access,
  triggerDataRefresh,
  isFetching,
}: TableDataProps) {
  // State initialization
  const [filteredData, setFilteredData] = useState<StudentData[]>([]);
  const [availableCenters, setAvailableCenters] = useState<GradeType[]>([]);
  const [availableGrades, setAvailableGrades] = useState<GradeType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCenter, setSelectedCenter] = useState("all");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isFilterGradesOpen, setIsFilterGradesOpen] = useState(false);
  const [isFilterCentersOpen, setIsFilterCentersOpen] = useState(false);
  const [isFilterStatusOpen, setIsFilterStatusOpen] = useState(false);
  const [isEditStudentDialogOpen, setIsEditStudentDialogOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteStudentId, setDeleteStudentId] = useState<number | null>(null);
  const [editStudentId, setEditStudentId] = useState<number | null>(null);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialStudentData, setInitialStudentData] =
    useState<EditStudentData | null>(null);
  const [isGenerateReportDialogOpen, setIsGenerateReportDialogOpen] =
    useState(false);
  const [selectedStudentForReport, setSelectedStudentForReport] =
    useState<StudentData | null>(null);

  // Edit student data state
  const [editstudentdata, setEditstudentdata] = useState<EditStudentData>({
    id: 0,
    grade: { id: 0, name: "" },
    center: { id: 0, name: "" },
    full_name: "",
    phone_number: "",
    parent_number: "",
    gender: "",
    user: 0,
    password: "",
    username: "",
  });

  // Status options
  const statusOptions = useMemo(
    () => [
      { id: "all", name: "All Status" },
      { id: "active", name: "Active" },
      { id: "inactive", name: "Inactive" },
    ],
    []
  );

  const handleGenerateReport = useCallback((student: StudentData) => {
    setSelectedStudentForReport(student);
    setIsGenerateReportDialogOpen(true);
  }, []);

  // Get status color class
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "active":
        return "bg-success/10 text-success border-success/30";
      case "inactive":
        return "bg-warning/10 text-warning border-warning/30";
      default:
        return "";
    }
  }, []);

  // Helper function to normalize phone numbers
  const normalizePhone = useCallback(
    (phone: string) => phone.replace(/\D/g, ""),
    []
  );

  // Initialize data
  useEffect(() => {
    setFilteredData(data);
    setAvailableCenters(availableCentersInitial);
    setAvailableGrades(availableGradesInitial);
    if (data.length > 0) setIsTableLoading(false);
  }, [data, availableCentersInitial, availableGradesInitial]);

  useEffect(() => {
    if (isFetching) {
      setIsTableLoading(true);
    } else {
      setIsTableLoading(false);
    }
  }, [isFetching]);

  // Fetch student data for editing
  useEffect(() => {
    const fetchEditData = async () => {
      if (!editStudentId) return;

      setIsEditLoading(true);
      try {
        const res = await api.get(
          `${djangoapi}accounts/students/${editStudentId}/`,
          { headers: { Authorization: `Bearer ${access}` } }
        );
        setEditstudentdata(res.data);
        setInitialStudentData(res.data);
      } catch (error) {
        console.error("Failed to fetch student data:", error);
        toast.error("Failed to load student data. Please try again.");
      } finally {
        setIsEditLoading(false);
      }
    };

    fetchEditData();
  }, [access, editStudentId]);

  // Filter data based on selections
  const tablefilterddata = useMemo(() => {
    return filteredData.filter((student) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const normalizedQuery = normalizePhone(query);
        const hasDigits = normalizedQuery.length > 0;

        const matchesSearch =
          student.full_name.toLowerCase().includes(query) ||
          (hasDigits &&
            normalizePhone(student.phone_number).includes(normalizedQuery)) ||
          (hasDigits &&
            student.parent_number &&
            normalizePhone(student.parent_number).includes(normalizedQuery)) ||
          (hasDigits &&
            normalizePhone(student.student_id).includes(normalizedQuery));

        if (!matchesSearch) return false;
      }

      // Center filter
      if (
        selectedCenter !== "all" &&
        student.center.id.toString() !== selectedCenter
      ) {
        return false;
      }

      // Grade filter
      if (
        selectedGrade !== "all" &&
        student.grade.id.toString() !== selectedGrade
      ) {
        return false;
      }

      // Status filter
      if (selectedStatus !== "all") {
        const shouldBeActive = selectedStatus === "active";
        if (student.is_approved !== shouldBeActive) return false;
      }

      return true;
    });
  }, [
    filteredData,
    searchQuery,
    selectedCenter,
    selectedGrade,
    selectedStatus,
    normalizePhone,
  ]);

  // Get display names for selected filters
  const selectedCenterName = useMemo(
    () =>
      selectedCenter === "all"
        ? "All Centers"
        : availableCenters.find((c) => c.id.toString() === selectedCenter)
            ?.name || "Select Center",
    [selectedCenter, availableCenters]
  );

  const selectedGradeName = useMemo(
    () =>
      selectedGrade === "all"
        ? "All Grades"
        : availableGrades.find((g) => g.id.toString() === selectedGrade)
            ?.name || "Select Grade",
    [selectedGrade, availableGrades]
  );

  const selectedStatusName = useMemo(
    () =>
      selectedStatus === "all"
        ? "All Status"
        : statusOptions.find((s) => s.id === selectedStatus)?.name ||
          "Select Status",
    [selectedStatus, statusOptions]
  );

  // Reset all filters
  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCenter("all");
    setSelectedGrade("all");
    setSelectedStatus("all");
  }, []);

  // Handle student edit submission
  const handleSubmitEdit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!editstudentdata || !editstudentdata.id || !initialStudentData)
        return;

      setIsSubmitting(true);
      try {
        interface payloadtype {
          full_name?: string;
          phone_number?: string;
          parent_number?: string;
          gender?: string;
          username?: string;
          password?: string;
          grade?: number;
          center?: number;
        }
        // Create payload with only changed fields
        const payload: payloadtype = {};

        // Compare and add changed fields
        if (editstudentdata.full_name !== initialStudentData.full_name) {
          payload.full_name = editstudentdata.full_name;
        }
        if (editstudentdata.phone_number !== initialStudentData.phone_number) {
          payload.phone_number = editstudentdata.phone_number;
        }
        if (
          editstudentdata.parent_number !== initialStudentData.parent_number
        ) {
          payload.parent_number = editstudentdata.parent_number;
        }
        if (editstudentdata.gender !== initialStudentData.gender) {
          payload.gender = editstudentdata.gender.toLowerCase();
        }
        if (editstudentdata.username !== initialStudentData.username) {
          payload.username = editstudentdata.username;
        }
        if (
          editstudentdata.password &&
          editstudentdata.password !== initialStudentData.password
        ) {
          payload.password = editstudentdata.password;
        }
        if (editstudentdata.grade.id !== initialStudentData.grade.id) {
          payload.grade = editstudentdata.grade.id;
        }
        if (editstudentdata.center.id !== initialStudentData.center.id) {
          payload.center = editstudentdata.center.id;
        }
        await api.put(
          `${djangoapi}accounts/students/${editstudentdata.id}/`,
          payload,
          { headers: { Authorization: `Bearer ${access}` } }
        );
        toast.success("Student updated successfully!");
        triggerDataRefresh();
        setIsEditStudentDialogOpen(false);
      } catch (error) {
        console.error("Failed to update student:", error);
        toast.error("Failed to update student. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [access, editstudentdata, initialStudentData, triggerDataRefresh]
  );

  // Handle student deletion
  const handleDeleteStudent = useCallback(async () => {
    if (!deleteStudentId) return;

    setIsTableLoading(true);
    try {
      await api.delete(`${djangoapi}accounts/students/${deleteStudentId}/`, {
        headers: { Authorization: `Bearer ${access}` },
      });
      toast.success("Student deleted successfully!");
      triggerDataRefresh();
    } catch (error) {
      console.error("Failed to delete student:", error);
      toast.error("Failed to delete student. Please try again.");
    } finally {
      setIsTableLoading(false);
      setShowDeleteDialog(false);
      setDeleteStudentId(null);
    }
  }, [access, deleteStudentId, triggerDataRefresh]);

  return (
    <>
      {/* Filter Controls */}
      <div className="w-full bg-bg-secondary p-4 rounded-xl border border-border-default flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, or ID..."
            className="w-full"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterPopover
            icon={<BookOpen size={16} />}
            label={selectedGradeName}
            openState={isFilterGradesOpen}
            onOpenChange={setIsFilterGradesOpen}>
            <Command>
              <CommandInput placeholder="Search grade..." />
              <CommandList>
                <CommandItem onSelect={() => setSelectedGrade("all")}>
                  All Grades
                </CommandItem>
                {availableGrades?.map((grade) => (
                  <CommandItem
                    key={grade.id}
                    onSelect={() => setSelectedGrade(grade.id.toString())}>
                    {grade.name}
                    {grade.id.toString() === selectedGrade && (
                      <Check className="ml-auto" />
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
            <Command>
              <CommandInput placeholder="Search center..." />
              <CommandList>
                <CommandItem onSelect={() => setSelectedCenter("all")}>
                  All Centers
                </CommandItem>
                {availableCenters?.map((center) => (
                  <CommandItem
                    key={center.id}
                    onSelect={() => setSelectedCenter(center.id.toString())}>
                    {center.name}
                    {center.id.toString() === selectedCenter && (
                      <Check className="ml-auto" />
                    )}
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          </FilterPopover>

          <FilterPopover
            icon={<UserCircle size={16} />}
            label={selectedStatusName}
            openState={isFilterStatusOpen}
            onOpenChange={setIsFilterStatusOpen}>
            <Command>
              <CommandList>
                {statusOptions.map((status) => (
                  <CommandItem
                    key={status.id}
                    onSelect={() => setSelectedStatus(status.id)}>
                    {status.name}
                    {status.id === selectedStatus && (
                      <Check className="ml-auto" />
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

      {/* Student Table */}
      {isTableLoading ? (
        <TableSkeleton />
      ) : (
        <div className="w-full bg-bg-secondary p-4 rounded-xl border border-border-default px-10 pt-6">
          <div className="text-lg sm:text-xl text-text-primary text-left font-semibold pl-5 mb-6">
            Students ({tablefilterddata.length})
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Name</TableHead>
                <TableHead className="text-left">Contact</TableHead>
                <TableHead className="text-left">Center</TableHead>
                <TableHead className="text-left">Grade</TableHead>
                <TableHead className="text-left">Status</TableHead>
                <TableHead className="text-left">Created by</TableHead>
                <TableHead className="text-left">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tablefilterddata.length > 0 ? (
                tablefilterddata.map((student) => (
                  <StudentRow
                    key={student.id}
                    student={student}
                    getStatusColor={getStatusColor}
                    onEdit={() => {
                      setIsEditStudentDialogOpen(true);
                      setEditStudentId(student.id);
                    }}
                    onDelete={() => {
                      setDeleteStudentId(student.id);
                      setShowDeleteDialog(true);
                    }}
                    onGenerateReport={() => handleGenerateReport(student)} // Add this line
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-text-secondary">
                    No students found matching your filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteStudent}
        isLoading={isTableLoading}
      />

      {/* Edit Student Dialog */}
      <EditStudentDialog
        open={isEditStudentDialogOpen}
        onOpenChange={(open) => {
          setIsEditStudentDialogOpen(open);
          if (!open) {
            setEditStudentId(null);
            setInitialStudentData(null);
          }
        }}
        studentData={editstudentdata}
        availableCenters={availableCenters}
        availableGrades={availableGrades}
        onDataChange={setEditstudentdata}
        onSubmit={handleSubmitEdit}
        isLoading={isEditLoading}
        isSubmitting={isSubmitting}
      />

      {selectedStudentForReport && (
        <GenerateStudentReportDialog
          access={access}
          student={selectedStudentForReport}
          open={isGenerateReportDialogOpen}
          onOpenChange={setIsGenerateReportDialogOpen}
        />
      )}
    </>
  );
}

// Sub-components
interface FilterPopoverProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  openState: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FilterPopover = ({
  icon,
  label,
  children,
  openState,
  onOpenChange,
}: FilterPopoverProps) => (
  <Popover open={openState} onOpenChange={onOpenChange}>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        className="gap-2 text-sm hover:text-text-inverse h-9 flex-grow sm:flex-grow-0">
        {icon}
        <span>{label}</span>
        <ChevronDown size={16} />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-[minmax(var(--radix-popover-trigger-width),fit-content)]">
      {children}
    </PopoverContent>
  </Popover>
);

interface StudentRowProps {
  student: StudentData;
  getStatusColor: (status: string) => string;
  onEdit: () => void;
  onDelete: () => void;
  onGenerateReport: () => void; // Make sure this is included
}

const StudentRow = ({
  student,
  getStatusColor,
  onEdit,
  onDelete,
  onGenerateReport, // Add this line to destructure the prop
}: StudentRowProps) => {
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);

  return (
    <TableRow className="hover:bg-bg-subtle">
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-text-primary">{student.full_name}</p>
            <p className="text-sm text-text-secondary font-medium">
              ID: {student.student_id}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-3 w-3 text-text-secondary" />
            <span>{student.phone_number}</span>
          </div>
          {student.parent_number && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Users className="h-3 w-3" />
              <span>{student.parent_number}</span>
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="gap-1">
          <Building2 className="h-4 w-4" />
          {student.center.name}
        </Badge>
      </TableCell>
      <TableCell>{student.grade.name}</TableCell>
      <TableCell>
        <Badge
          className={`${getStatusColor(
            student.is_approved ? "active" : "inactive"
          )} border`}>
          {student.is_approved ? "Active" : "Inactive"}
        </Badge>
      </TableCell>
      <TableCell>{student.added_by}</TableCell>
      <TableCell>
        <DropdownMenu open={isDropDownOpen} onOpenChange={setIsDropDownOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Actions"
              className="hover:bg-gray-300">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-fit p-3">
            <DropdownMenuLabel className="text-sm font-medium text-text-secondary">
              Actions
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* Add the Generate Report option */}
            <DropdownMenuItem
              className="flex items-center gap-2 px-2 py-2 text-sm hover:bg-bg-subtle hover:cursor-pointer focus:bg-bg-subtle"
              onSelect={(e) => {
                e.preventDefault();
                setIsDropDownOpen(false);
                onGenerateReport(); // This should now work
              }}>
              <FileText className="h-4 w-4 text-emerald-600" />
              <span className="text-emerald-700">Generate Report</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="flex items-center gap-2 px-2 py-2 text-sm hover:bg-bg-subtle hover:cursor-pointer focus:bg-bg-subtle"
              onSelect={(e) => {
                e.preventDefault();
                setIsDropDownOpen(false);
                onEdit();
              }}>
              <Edit className="h-4 w-4 text-text-secondary" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2 px-2 py-2 text-sm text-error hover:cursor-pointer focus:bg-error/20"
              onSelect={(e) => {
                e.preventDefault();
                setIsDropDownOpen(false);
                onDelete();
              }}>
              <Trash2 className="h-4 w-4 text-error" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const DeleteDialog = ({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: DeleteDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Are you sure you want to delete this student?</DialogTitle>
        <DialogDescription>This action cannot be undone!</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isLoading}
          className="hover:bg-bg-secondary">
          Cancel
        </Button>
        <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
          {isLoading ? "Deleting..." : "Delete"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

interface EditStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentData: EditStudentData;
  availableCenters: GradeType[];
  availableGrades: GradeType[];
  onDataChange: (data: EditStudentData) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  isSubmitting: boolean;
}

const EditStudentDialog = ({
  open,
  onOpenChange,
  studentData,
  availableCenters,
  availableGrades,
  onDataChange,
  onSubmit,
  isLoading,
  isSubmitting,
}: EditStudentDialogProps) => {
  const [isGenderPopoverOpen, setIsGenderPopoverOpen] = useState(false);
  const [isGradePopoverOpen, setIsGradePopoverOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Edit Student - {studentData?.full_name || "Student"}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <EditFormSkeleton />
        ) : (
          <form id="edit-student-form" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Full Name */}
              <div className="md:col-span-2">
                <Label
                  htmlFor="full-name"
                  className="block text-sm font-medium text-text-primary mb-2">
                  Full Name
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserRound className="text-gray-400 h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    id="full-name"
                    value={studentData?.full_name}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Student full name"
                    onChange={(e) =>
                      onDataChange({
                        ...studentData,
                        full_name: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <Label
                  htmlFor="gender"
                  className="block text-sm font-medium text-text-primary mb-2">
                  Gender
                </Label>
                <Popover
                  open={isGenderPopoverOpen}
                  onOpenChange={setIsGenderPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="gender"
                      variant="outline"
                      role="combobox"
                      aria-expanded={isGenderPopoverOpen}
                      className="w-full justify-between hover:bg-bg-secondary px-3 py-2 h-auto">
                      <div className="flex items-center gap-2">
                        <UserRound className="h-4 w-4" />
                        <span>{studentData?.gender || "Select Gender"}</span>
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)]">
                    <Command>
                      <CommandList>
                        <CommandItem
                          value="Male"
                          onSelect={() => {
                            onDataChange({ ...studentData, gender: "Male" });
                            setIsGenderPopoverOpen(false);
                          }}
                          className="py-2">
                          <div className="flex items-center">
                            <UserRound className="h-4 w-4 mr-2" />
                            Male
                          </div>
                          <Check
                            className={cn(
                              "ml-auto",
                              "Male" === studentData?.gender
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                        <CommandItem
                          value="Female"
                          onSelect={() => {
                            onDataChange({ ...studentData, gender: "Female" });
                            setIsGenderPopoverOpen(false);
                          }}
                          className="py-2">
                          <div className="flex items-center">
                            <UserRound className="h-4 w-4 mr-2" />
                            Female
                          </div>
                          <Check
                            className={cn(
                              "ml-auto",
                              "Female" === studentData?.gender
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Grade */}
              <div>
                <Label
                  htmlFor="grade"
                  className="block text-sm font-medium text-text-primary mb-2">
                  Grade
                </Label>
                <Popover
                  open={isGradePopoverOpen}
                  onOpenChange={setIsGradePopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="grade"
                      variant="outline"
                      role="combobox"
                      aria-expanded={isGradePopoverOpen}
                      className="w-full justify-between hover:bg-bg-secondary px-3 py-2 h-auto">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span>
                          {studentData?.grade?.name || "Select Grade"}
                        </span>
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-h-60 overflow-y-auto">
                    <Command>
                      <CommandInput
                        placeholder="Search grade..."
                        className="h-9"
                      />
                      <CommandList>
                        {availableGrades.map((grade) => (
                          <CommandItem
                            key={grade.id}
                            value={grade.name}
                            onSelect={() => {
                              onDataChange({
                                ...studentData,
                                grade: { id: grade.id, name: grade.name },
                              });
                              setIsGradePopoverOpen(false);
                            }}
                            className="py-2">
                            {grade.name}
                            <Check
                              className={cn(
                                "ml-auto",
                                grade.id === studentData?.grade?.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Phone Number */}
              <div>
                <Label
                  htmlFor="phone"
                  className="block text-sm font-medium text-text-primary mb-2">
                  Phone Number
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="text-gray-400 h-4 w-4" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    pattern="[0-9]{11}"
                    maxLength={11}
                    minLength={11}
                    value={studentData?.phone_number}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Phone number"
                    onChange={(e) =>
                      onDataChange({
                        ...studentData,
                        phone_number: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Parent's Phone Number */}
              <div>
                <Label
                  htmlFor="parent-phone"
                  className="block text-sm font-medium text-text-primary mb-2">
                  Parent&apos;s Phone Number
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UsersRound className="text-gray-400 h-4 w-4" />
                  </div>
                  <input
                    type="tel"
                    id="parent-phone"
                    pattern="[0-9]{11}"
                    maxLength={11}
                    minLength={11}
                    value={studentData?.parent_number}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Parent's phone number"
                    onChange={(e) =>
                      onDataChange({
                        ...studentData,
                        parent_number: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <Label
                  htmlFor="username"
                  className="block text-sm font-medium text-text-primary mb-2">
                  Username
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserRoundPen className="text-gray-400 h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    id="username"
                    minLength={4}
                    maxLength={35}
                    className="w-full px-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Enter username"
                    value={studentData?.username}
                    onChange={(e) =>
                      onDataChange({ ...studentData, username: e.target.value })
                    }
                  />
                </div>
                <p className="mt-1 text-xs text-text-secondary">
                  Must be 4-35 characters
                </p>
              </div>

              {/* Password */}
              <div>
                <Label
                  htmlFor="password"
                  className="block text-sm font-medium text-text-primary mb-2">
                  Password
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="text-gray-400 h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    id="password"
                    minLength={8}
                    value={studentData?.password}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Create a password"
                    onChange={(e) =>
                      onDataChange({ ...studentData, password: e.target.value })
                    }
                  />
                </div>
                <p className="mt-1 text-xs text-text-secondary">
                  Minimum 8 characters (leave blank to keep current)
                </p>
              </div>
            </div>

            {/* Center Selection */}
            <div className="mt-3">
              <Label className="block text-sm font-medium text-text-primary mb-2">
                Center
              </Label>
              <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
                <RadioGroup
                  className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                  value={studentData?.center?.id.toString()}>
                  {availableCenters.map((center) => (
                    <div
                      key={center.id}
                      className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={center.id.toString()}
                        id={`center-${center.id}`}
                        className="text-primary border-gray-300"
                        onClick={() =>
                          onDataChange({
                            ...studentData,
                            center: { id: center.id, name: center.name },
                          })
                        }
                      />
                      <Label
                        htmlFor={`center-${center.id}`}
                        className="text-sm font-normal text-text-primary">
                        {center.name}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                type="button"
                className="hover:bg-bg-secondary">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
