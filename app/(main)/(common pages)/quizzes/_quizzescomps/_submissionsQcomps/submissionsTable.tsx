import { Input } from "@/components/ui/input";
import useSubmissionsStore from "@/lib/stores/onlineQuizStores/submissions";
import { useCallback, useMemo, useState } from "react";
import { FilterPopover } from "../../../students/_students comps/tabledata";
import {
  Building2,
  Check,
  Phone,
  User,
  UserCircle,
  Users,
  X,
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

export default function SubmissionsTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCenter, setSelectedCenter] = useState<string | number>("all");
  const [selectedStatus, setSelectedStatus] = useState<string | number>("all");
  const [isFilterCentersOpen, setIsFilterCentersOpen] = useState(false);
  const [isFilterStatusOpen, setIsFilterStatusOpen] = useState(false);
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
    return submissions.filter((submission) => {
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
    });
  }, [
    normalizePhone,
    searchQuery,
    selectedCenter,
    selectedStatus,
    submissions,
  ]);

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

      <div className="w-full bg-bg-secondary p-4 rounded-xl border border-border-default px-10 pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left">Name</TableHead>
              <TableHead className="text-left">Contact</TableHead>
              <TableHead className="text-left">Center</TableHead>
              <TableHead className="text-left">Start time</TableHead>
              <TableHead className="text-left">End time</TableHead>
              <TableHead className="text-left">Status</TableHead>
              <TableHead className="text-left">Time taken</TableHead>
              <TableHead className="text-left">Score</TableHead>
              <TableHead className="text-left">View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tablefilterddata.length > 0 ? (
              tablefilterddata.map((student) => (
                <TableRow key={student.id} className="hover:bg-bg-subtle">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">
                          {student.student_name}
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
                      {student.parent_phone_number && (
                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                          <Users className="h-3 w-3" />
                          <span>{student.parent_phone_number}</span>
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
                  <TableCell>
                    {student.start_time
                      ? formatUserDate(student.start_time)
                      : "no start time"}
                  </TableCell>
                  <TableCell>
                    {student.end_time
                      ? formatUserDate(student.end_time)
                      : "no end time"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${
                        student.submission_status === "Finished"
                          ? "bg-success/10 text-success border-success/30"
                          : student.submission_status === "In Progress"
                          ? "bg-warning/10 text-warning border-warning/30"
                          : "bg-error/10 text-error border-error/30"
                      } border`}>
                      {student.submission_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {student.time_taken ? student.time_taken : "no time"}
                  </TableCell>
                  <TableCell>
                    {student.score ? student.score : "no score"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-text-secondary">
                  No students found matching your filters
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
