import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StudentData, GradeType } from "./main";
import { useEffect, useMemo, useState } from "react";
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
  Edit,
  Eye,
  MoreVertical,
  Phone,
  Trash2,
  User,
  UserCircle,
  Users,
  X,
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

interface TableDataProps {
  data: StudentData[];
  availableCentersInitial: GradeType[];
  availableGradesInitial: GradeType[];
}
export default function TableData({
  data,
  availableCentersInitial,
  availableGradesInitial,
}: TableDataProps) {
  // State initialization remains the same
  const [filteredData, setFilteredData] = useState<StudentData[]>([]);
  const [availableCenters, setAvailableCenters] = useState<GradeType[]>([]);
  const [availableGrades, setAvailableGrades] = useState<GradeType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCenter, setSelectedCenter] = useState("all");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isCenterPopoverOpen, setIsCenterPopoverOpen] = useState(false);
  const [isGradePopoverOpen, setIsGradePopoverOpen] = useState(false);
  const [isStatusPopoverOpen, setIsStatusPopoverOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success/10 text-success border-success/30";
      case "inactive":
        return "bg-warning/10 text-warning border-warning/30";
      default:
        return "";
    }
  };

  const statusOptions = [
    { id: "all", name: "All Status" },
    { id: "active", name: "Active" },
    { id: "inactive", name: "Inactive" },
  ];

  // Helper function to normalize phone numbers
  const normalizePhone = (phone: string) => phone.replace(/\D/g, "");

  useEffect(() => {
    setFilteredData(data);
    setAvailableCenters(availableCentersInitial);
    setAvailableGrades(availableGradesInitial);
  }, [data, availableCentersInitial, availableGradesInitial]);

  const tablefilterddata = useMemo(() => {
    return filteredData.filter((student) => {
      // Enhanced search logic
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
            normalizePhone(student.parent_number).includes(normalizedQuery));

        if (!matchesSearch) return false;
      }

      // Center filter
      if (selectedCenter !== "all") {
        if (student.center.id.toString() !== selectedCenter) return false;
      }

      // Grade filter
      if (selectedGrade !== "all") {
        if (student.grade.id.toString() !== selectedGrade) return false;
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
  ]);

  // Get display names for selected values
  const selectedCenterName =
    selectedCenter === "all"
      ? "All Centers"
      : availableCenters.find((c) => c.id.toString() === selectedCenter)
          ?.name || "Select Center";

  const selectedGradeName =
    selectedGrade === "all"
      ? "All Grades"
      : availableGrades.find((g) => g.id.toString() === selectedGrade)?.name ||
        "Select Grade";

  const selectedStatusName =
    selectedStatus === "all"
      ? "All Status"
      : statusOptions.find((s) => s.id === selectedStatus)?.name ||
        "Select Status";

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCenter("all");
    setSelectedGrade("all");
    setSelectedStatus("all");
  };

  return (
    <>
      <div className="w-full bg-bg-secondary p-4 rounded-xl border border-border-default flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, or parent phone..."
            className="w-full"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Popover
            open={isGradePopoverOpen}
            onOpenChange={setIsGradePopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <BookOpen size={16} />
                <span>{selectedGradeName}</span>
                <ChevronDown size={16} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-0">
              <Command>
                <CommandInput placeholder="Search grade..." />
                <CommandList>
                  <CommandItem
                    onSelect={() => {
                      setSelectedGrade("all");
                      setIsGradePopoverOpen(false);
                    }}>
                    All Grades
                  </CommandItem>
                  {availableGrades?.map((grade) => (
                    <CommandItem
                      key={grade.id}
                      onSelect={() => {
                        setSelectedGrade(grade.id.toString());
                        setIsGradePopoverOpen(false);
                      }}>
                      {grade.name}
                      {grade.id.toString() === selectedGrade && (
                        <Check className="ml-auto" />
                      )}
                    </CommandItem>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Popover
            open={isCenterPopoverOpen}
            onOpenChange={setIsCenterPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Building2 size={16} />
                <span>{selectedCenterName}</span>
                <ChevronDown size={16} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-0">
              <Command>
                <CommandInput placeholder="Search center..." />
                <CommandList>
                  <CommandItem
                    onSelect={() => {
                      setSelectedCenter("all");
                      setIsCenterPopoverOpen(false);
                    }}>
                    All Centers
                  </CommandItem>
                  {availableCenters?.map((center) => (
                    <CommandItem
                      key={center.id}
                      onSelect={() => {
                        setSelectedCenter(center.id.toString());
                        setIsCenterPopoverOpen(false);
                      }}>
                      {center.name}
                      {center.id.toString() === selectedCenter && (
                        <Check className="ml-auto" />
                      )}
                    </CommandItem>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Popover
            open={isStatusPopoverOpen}
            onOpenChange={setIsStatusPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <UserCircle size={16} />
                <span>{selectedStatusName}</span>
                <ChevronDown size={16} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-0">
              <Command>
                <CommandList>
                  {statusOptions.map((status) => (
                    <CommandItem
                      key={status.id}
                      onSelect={() => {
                        setSelectedStatus(status.id);
                        setIsStatusPopoverOpen(false);
                      }}>
                      {status.name}
                      {status.id === selectedStatus && (
                        <Check className="ml-auto" />
                      )}
                    </CommandItem>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Button
            variant="secondary"
            onClick={resetFilters}
            className="flex items-center gap-2">
            <X size={16} />
            Reset
          </Button>
        </div>
      </div>
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
              <TableHead className="text-left">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tablefilterddata.map((student) => (
              <TableRow key={student.id} className="hover:bg-bg-subtle">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">
                        {student.full_name}
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
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <Users className="h-3 w-3" />
                      <span>{student.parent_number}</span>
                    </div>
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
                      <DropdownMenuItem>
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
          </TableBody>
        </Table>
      </div>
    </>
  );
}
