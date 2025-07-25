import { Input } from "@/components/ui/input";
import useSubmissionsStore from "@/lib/stores/onlineQuizStores/submissions";
import { useCallback, useMemo, useState } from "react";
import { FilterPopover } from "../../../students/_students comps/tabledata";
import {
  Building2,
  Check,
  Eye,
  MoreVertical,
  Phone,
  Trash2,
  User,
  UserCircle,
  Users,
  X,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import useQuizStore_initial from "@/lib/stores/onlineQuizStores/initialData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatUserDate } from "@/lib/formatDate";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { api } from "@/lib/axiosinterceptor";
import { toast } from "sonner";

export default function SubmissionsTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCenter, setSelectedCenter] = useState<string | number>("all");
  const [selectedStatus, setSelectedStatus] = useState<string | number>("all");
  const [isFilterCentersOpen, setIsFilterCentersOpen] = useState(false);
  const [isFilterStatusOpen, setIsFilterStatusOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteSubmissionId, setDeleteSubmissionId] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const access = useQuizStore_initial((state) => state.access);
  const availableCenters = useQuizStore_initial((state) => state.availCenters);
  const submissions = useSubmissionsStore((state) => state.submissions);

  const statusOptions = useMemo(
    () => [
      { id: "all", name: "All Status" },
      { id: "Not Started", name: "Not Started" },
      { id: "In Progress", name: "In Progress" },
      { id: "Finished", name: "Finished" },
    ],
    []
  );

  const handleDeleteClick = (studentId: number) => {
    setDeleteSubmissionId(studentId);
    setIsDeleteDialogOpen(true);
  };

  const selectedCenterName = useMemo(
    () =>
      selectedCenter === "all"
        ? "All Centers"
        : availableCenters.find((c) => c.id.toString() === selectedCenter)
            ?.name || "Select Center",
    [selectedCenter, availableCenters]
  );

  const selectedStatusName = useMemo(
    () =>
      selectedStatus === "all"
        ? "All Status"
        : statusOptions.find((s) => s.id === selectedStatus)?.name ||
          "Select Status",
    [selectedStatus, statusOptions]
  );

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCenter("all");
    setSelectedStatus("all");
  }, []);

  // Helper function to normalize phone numbers
  const normalizePhone = useCallback(
    (phone: string) => phone.replace(/\D/g, ""),
    []
  );

  const tablefilterddata = useMemo(() => {
    return submissions
      .filter((submission) => {
        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const normalizedQuery = normalizePhone(query);
          const hasDigits = normalizedQuery.length > 0;

          const matchesSearch =
            submission.student_name.toLowerCase().includes(query) ||
            (hasDigits &&
              normalizePhone(submission.phone_number).includes(
                normalizedQuery
              )) ||
            (hasDigits &&
              submission.parent_phone_number &&
              normalizePhone(submission.parent_phone_number).includes(
                normalizedQuery
              ));

          if (!matchesSearch) return false;
        }

        // Center filter
        if (
          selectedCenter !== "all" &&
          submission.center.id.toString() !== selectedCenter
        ) {
          return false;
        }

        // Status filter
        if (
          selectedStatus !== "all" &&
          submission.submission_status !== selectedStatus
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const aTime = a.start_time ? new Date(a.start_time).getTime() : 0;
        const bTime = b.start_time ? new Date(b.start_time).getTime() : 0;

        // Primary sort: start time (newest first)
        if (aTime !== bTime) {
          return bTime - aTime;
        }

        // Secondary sort: name (for entries with same/no start time)
        return a.student_name.localeCompare(b.student_name);
      });
  }, [
    normalizePhone,
    searchQuery,
    selectedCenter,
    selectedStatus,
    submissions,
  ]);

  const handleDeleteStudent = useCallback(async () => {
    if (!deleteSubmissionId) return;

    setIsLoading(true);
    try {
      await api.delete(
        `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}onlinequiz/quizzes/${
          useSubmissionsStore.getState().selectedQuizId
        }/submissions/${deleteSubmissionId}/`,
        {
          headers: { Authorization: `Bearer ${access}` },
        }
      );
      toast.success("Submission deleted successfully!");
      const index = submissions.findIndex(
        (submission) => submission.id === deleteSubmissionId
      );
      if (index !== -1) {
        submissions[index].submission_status = "Not Started";
      }
    } catch (error) {
      console.error("Failed to delete Submission:", error);
      toast.error("Failed to delete Submission. Please try again.");
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setDeleteSubmissionId(null);
    }
  }, [access, deleteSubmissionId, submissions]);

  return (
    <>
      <div className="w-full bg-bg-secondary p-4 rounded-xl border border-border-default flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-grow">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full"
          />
        </div>

        <div className="flex flex-wrap gap-2">
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

      {/* Added overflow-x-auto for horizontal scrolling */}
      <div className="w-full bg-bg-secondary rounded-xl border border-border-default overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[160px] text-left">Name</TableHead>
              <TableHead className="min-w-[120px] text-left">Contact</TableHead>
              <TableHead className="min-w-[120px] text-left">
                Start time
              </TableHead>
              <TableHead className="min-w-[120px] text-left">
                End time
              </TableHead>
              <TableHead className="min-w-[100px] text-left">Status</TableHead>
              <TableHead className="min-w-[80px] text-left">
                Time taken
              </TableHead>
              <TableHead className="min-w-[60px] text-left">Score</TableHead>
              <TableHead className="min-w-[60px] text-left">
                Score Released
              </TableHead>
              <TableHead className="min-w-[60px] text-left">
                Answers Released
              </TableHead>
              <TableHead className="min-w-[50px] text-left">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tablefilterddata.length > 0 ? (
              tablefilterddata.map((student) => (
                <TableRow key={student.student} className="hover:bg-bg-subtle">
                  <TableCell className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-text-primary whitespace-nowrap truncate">
                          {student.student_name}
                        </p>
                        <Badge
                          variant="outline"
                          className="gap-1 text-xs px-1 py-0">
                          <Building2 className="h-3 w-3" />
                          <span className="truncate max-w-[100px]">
                            {student.center.name}
                          </span>
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-2 px-3">
                    <div className="flex flex-col gap-0.5 text-sm">
                      <div className="flex items-center gap-1 whitespace-nowrap">
                        <Phone className="h-3 w-3 text-text-secondary" />
                        <span>{student.phone_number}</span>
                      </div>
                      {student.parent_phone_number && (
                        <div className="flex items-center gap-1 text-xs text-text-secondary whitespace-nowrap">
                          <Users className="h-3 w-3" />
                          <span>{student.parent_phone_number}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-2 px-3 whitespace-nowrap text-sm">
                    {student.start_time
                      ? formatUserDate(student.start_time)
                      : "no start time"}
                  </TableCell>
                  <TableCell className="py-2 px-3 whitespace-nowrap text-sm">
                    {student.end_time
                      ? formatUserDate(student.end_time)
                      : "no end time"}
                  </TableCell>
                  <TableCell className="py-2 px-3">
                    <Badge
                      variant="outline"
                      className={`text-xs px-1.5 py-0.5 ${
                        student.submission_status === "Finished"
                          ? "bg-success/10 text-success border-success/30"
                          : student.submission_status === "In Progress"
                          ? "bg-warning/10 text-warning border-warning/30"
                          : "bg-error/10 text-error border-error/30"
                      } border`}>
                      {student.submission_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2 px-3 whitespace-nowrap text-sm">
                    {student.time_taken ? student.time_taken : "no time"}
                  </TableCell>
                  <TableCell className="py-2 px-3 whitespace-nowrap text-sm">
                    {student.score ? student.score : "no score"}
                  </TableCell>
                  <TableCell className="py-2 px-3">
                    <div className="flex justify-start">
                      {student.is_score_released ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-2 px-3">
                    <div className="flex justify-start">
                      {student.are_answers_released ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-2 px-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Actions"
                          className="h-8 w-8 hover:bg-gray-300">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-fit p-2">
                        <DropdownMenuLabel className="text-xs font-medium text-text-secondary px-2 py-1">
                          Actions
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="flex items-center gap-2 px-2 py-1 text-xs hover:bg-bg-subtle hover:cursor-pointer focus:bg-bg-subtle">
                          <Eye className="h-3 w-3 text-text-secondary" />
                          <span>View Details</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(student.id)}
                          className="flex items-center gap-2 px-2 py-1 text-xs text-error hover:cursor-pointer focus:bg-error/20">
                          <Trash2 className="h-3 w-3 text-error" />
                          <span>Delete Submission</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={11}
                  className="text-center py-8 text-text-secondary">
                  No students found matching your filters
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              submission.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button
                variant="outline"
                className="hover:bg-bg-secondary"
                disabled={isLoading}>
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                onClick={handleDeleteStudent}
                disabled={isLoading}>
                {isLoading ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
