import { Input } from "@/components/ui/input";
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
import Link from "next/link";
import { showToast } from "../../../students/_students comps/main";
import useTaskStore from "@/lib/stores/tasksStores/initData";
import useSubmissionsStore from "@/lib/stores/tasksStores/submissions";

export default function TSubmissionsTable({
  access,
  taskId,
}: {
  access: string;
  taskId: number;
}) {
  const availableCenters = useTaskStore((state) => state.availCenters);
  const submissions = useSubmissionsStore((state) => state.submissions);
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

  const statusOptions = useMemo(
    () => [
      { id: "all", name: "All Status" },
      { id: "not_started", name: "Not Started" },
      { id: "in_progress", name: "In Progress" },
      { id: "submitted", name: "Submitted" },
      { id: "corrected", name: "Corrected" },
    ],
    []
  );

  const handleDeleteClick = (studentId: number) => {
    setDeleteSubmissionId(studentId);
    setIsDeleteDialogOpen(true);
  };

  const isValidStudentId = useCallback((id: number | null): id is number => {
    return id !== null && id !== undefined;
  }, []);

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
            submission.student.full_name.toLowerCase().includes(query) ||
            (hasDigits &&
              normalizePhone(submission.student.phone_number).includes(
                normalizedQuery
              )) ||
            (hasDigits &&
              submission.student.parent_number &&
              normalizePhone(submission.student.parent_number).includes(
                normalizedQuery
              ));

          if (!matchesSearch) return false;
        }

        // Center filter
        if (
          selectedCenter !== "all" &&
          submission.student.center_id.toString() !== selectedCenter
        ) {
          return false;
        }

        // Status filter
        if (selectedStatus !== "all" && submission.status !== selectedStatus) {
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
        return a.student.full_name.localeCompare(b.student.full_name);
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
        `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}task/tasks/${taskId}/submissions/${deleteSubmissionId}/`,
        {
          headers: { Authorization: `Bearer ${access}` },
        }
      );
      showToast("Submission Deleted Successfully!", "success");
      const index = submissions.findIndex(
        (submission) => submission.id === deleteSubmissionId
      );
      if (index !== -1) {
        submissions[index].status = "not_started";
      }
    } catch (error) {
      console.error("Failed to delete Submission:", error);
      showToast("Failed to delete Submission!", "error");
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setDeleteSubmissionId(null);
    }
  }, [access, deleteSubmissionId, submissions, taskId]);

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
              {/* Added Corrected by column header */}
              <TableHead className="min-w-[80px] text-left">
                Time taken
              </TableHead>
              <TableHead className="min-w-[60px] text-left">Score</TableHead>
              <TableHead className="min-w-[60px] text-left">
                Score Released
              </TableHead>
              <TableHead className="min-w-[120px] text-left">
                Corrected by
              </TableHead>
              <TableHead className="min-w-[50px] text-left">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tablefilterddata.length > 0 ? (
              tablefilterddata.map((student) => (
                <TableRow
                  key={student.student.id}
                  className="hover:bg-bg-subtle">
                  <TableCell className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-text-primary whitespace-nowrap truncate">
                          {student.student.full_name}
                        </p>
                        <Badge
                          variant="outline"
                          className="gap-1 text-xs px-1 py-0">
                          <Building2 className="h-3 w-3" />
                          <span className="truncate max-w-[100px]">
                            {student.student.center_name}
                          </span>
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-2 px-3">
                    <div className="flex flex-col gap-0.5 text-sm">
                      <div className="flex items-center gap-1 whitespace-nowrap">
                        <Phone className="h-3 w-3 text-text-secondary" />
                        <span>{student.student.phone_number}</span>
                      </div>
                      {student.student.parent_number && (
                        <div className="flex items-center gap-1 text-xs text-text-secondary whitespace-nowrap">
                          <Users className="h-3 w-3" />
                          <span>{student.student.parent_number}</span>
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
                      className={`text-xs px-1.5 py-0.5 rounded-full ${
                        student.status === "not_started"
                          ? "bg-gray-100 text-gray-700 border-gray-300"
                          : student.status === "in_progress"
                          ? "bg-warning/10 text-warning border-warning/30"
                          : student.status === "submitted"
                          ? "bg-info/10 text-info border-info/30"
                          : student.status === "corrected"
                          ? "bg-success/10 text-success border-success/30"
                          : "bg-gray-100 text-gray-700 border-gray-300"
                      } border`}>
                      {student.status === "not_started" && "Not Started"}
                      {student.status === "in_progress" && "In Progress"}
                      {student.status === "submitted" && "Submitted"}
                      {student.status === "corrected" && "Corrected"}
                      {![
                        "not_started",
                        "in_progress",
                        "submitted",
                        "corrected",
                      ].includes(student.status) &&
                        student.status.charAt(0).toUpperCase() +
                          student.status.slice(1)}
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
                      {student.is_released ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="py-2 px-3 whitespace-nowrap text-sm">
                    {student.corrected_by ? (
                      <div className="flex items-center gap-2">
                        <span>
                          {typeof student.corrected_by === "string"
                            ? student.corrected_by
                            : "N/A"}
                        </span>
                      </div>
                    ) : (
                      <span className="text-text-disabled">
                        Not Corrected Yet!
                      </span>
                    )}
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
                        <DropdownMenuItem className="p-0">
                          {isValidStudentId(student.id) ? (
                            <Link
                              href={`/tasks/${taskId}/review/${student.id}`}
                              className="flex items-center gap-2 px-2 py-1 text-xs w-full hover:text-text-inverse hover:cursor-pointer focus:bg-bg-subtle">
                              <Eye className="h-3 w-3 text-text-secondary" />
                              <span>View Details</span>
                            </Link>
                          ) : (
                            <div
                              className="flex items-center gap-2 px-2 py-1 text-xs w-full text-text-disabled"
                              onClick={() =>
                                showToast("Submission not available", "error")
                              }>
                              <Eye className="h-3 w-3 text-text-disabled" />
                              <span>View Details</span>
                            </div>
                          )}
                        </DropdownMenuItem>

                        {/* Delete Submission */}
                        <DropdownMenuItem
                          onClick={() =>
                            isValidStudentId(student.id)
                              ? handleDeleteClick(student.id)
                              : showToast(
                                  "Cannot delete incomplete submission",
                                  "error"
                                )
                          }
                          className="flex items-center gap-2 px-2 py-1 text-xs text-error hover:bg-error/10 focus:bg-error/20">
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
