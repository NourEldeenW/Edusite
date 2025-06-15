"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandItem, CommandList } from "@/components/ui/command";
import {
  Check,
  ChevronsUpDown,
  Edit,
  MoreVertical,
  Phone,
  Trash2,
  User,
  UserRound,
  UserRoundPen,
  X,
  Lock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
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
import { api } from "@/lib/axiosinterceptor";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface AssistantData {
  id: number;
  full_name: string;
  phone_number: string;
  gender: string;
  user: number;
  password: string;
  username: string;
}

interface TableDataProps {
  data: AssistantData[];
  access: string;
  isFetching: boolean;
  triggerDataRefresh: () => void;
}

interface EditAssistantData {
  id: number;
  full_name: string;
  phone_number: string;
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
  access,
  triggerDataRefresh,
  isFetching,
}: TableDataProps) {
  // State initialization
  const [filteredData, setFilteredData] = useState<AssistantData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditAssistantDialogOpen, setIsEditAssistantDialogOpen] =
    useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteAssistantId, setDeleteAssistantId] = useState<number | null>(
    null
  );
  const [editAssistantId, setEditAssistantId] = useState<number | null>(null);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialAssistanttData, setInitialAssistantData] =
    useState<EditAssistantData | null>(null);

  // Edit Assistant data state
  const [editAssistantdata, setEditAssistantdata] = useState<EditAssistantData>(
    {
      id: 0,
      full_name: "",
      phone_number: "",
      gender: "",
      user: 0,
      password: "",
      username: "",
    }
  );

  // Helper function to normalize phone numbers
  const normalizePhone = useCallback(
    (phone: string) => phone.replace(/\D/g, ""),
    []
  );

  // Initialize data
  useEffect(() => {
    setFilteredData(data);
    if (data.length > 0) setIsTableLoading(false);
  }, [data]);

  useEffect(() => {
    if (isFetching) {
      setIsTableLoading(true);
    } else {
      setIsTableLoading(false);
    }
  }, [isFetching]);

  // Fetch Assistant data for editing
  useEffect(() => {
    const fetchEditData = async () => {
      if (!editAssistantId) return;

      setIsEditLoading(true);
      try {
        const res = await api.get(
          `${djangoapi}accounts/assistants/${editAssistantId}/`,
          { headers: { Authorization: `Bearer ${access}` } }
        );
        setEditAssistantdata(res.data);
        setInitialAssistantData(res.data);
      } catch (error) {
        console.error("Failed to fetch assistant data:", error);
        toast.error("Failed to load assistant data. Please try again.");
      } finally {
        setIsEditLoading(false);
      }
    };

    fetchEditData();
  }, [access, editAssistantId]);

  // Filter data based on selections
  const tablefilterddata = useMemo(() => {
    return filteredData.filter((assistant) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const normalizedQuery = normalizePhone(query);
        const hasDigits = normalizedQuery.length > 0;

        const matchesSearch =
          assistant.full_name.toLowerCase().includes(query) ||
          (hasDigits &&
            normalizePhone(assistant.phone_number).includes(normalizedQuery));

        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [filteredData, searchQuery, normalizePhone]);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setSearchQuery("");
  }, []);

  // Handle Assistant edit submission
  const handleSubmitEdit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!editAssistantdata || !editAssistantdata.id || !initialAssistanttData)
        return;

      setIsSubmitting(true);
      try {
        interface payloadtype {
          full_name?: string;
          phone_number?: string;
          gender?: string;
          username?: string;
          password?: string;
        }
        // Create payload with only changed fields
        const payload: payloadtype = {};

        // Compare and add changed fields
        if (editAssistantdata.full_name !== initialAssistanttData.full_name) {
          payload.full_name = editAssistantdata.full_name;
        }
        if (
          editAssistantdata.phone_number !== initialAssistanttData.phone_number
        ) {
          payload.phone_number = editAssistantdata.phone_number;
        }
        if (editAssistantdata.gender !== initialAssistanttData.gender) {
          payload.gender = editAssistantdata.gender;
        }
        if (editAssistantdata.username !== initialAssistanttData.username) {
          payload.username = editAssistantdata.username;
        }
        if (
          editAssistantdata.password &&
          editAssistantdata.password !== initialAssistanttData.password
        ) {
          payload.password = editAssistantdata.password;
        }
        await api.put(
          `${djangoapi}accounts/assistants/${editAssistantdata.id}/`,
          payload,
          { headers: { Authorization: `Bearer ${access}` } }
        );
        toast.success("Assistant updated successfully!");
        triggerDataRefresh();
        setIsEditAssistantDialogOpen(false);
      } catch (error) {
        console.error("Failed to update assistant:", error);
        toast.error("Failed to update assistant. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [access, editAssistantdata, initialAssistanttData, triggerDataRefresh]
  );

  // Handle Assistant deletion
  const handleDeleteAssistant = useCallback(async () => {
    if (!deleteAssistantId) return;

    setIsTableLoading(true);
    try {
      await api.delete(
        `${djangoapi}accounts/assistants/${deleteAssistantId}/`,
        {
          headers: { Authorization: `Bearer ${access}` },
        }
      );
      toast.success("Assistant deleted successfully!");
      triggerDataRefresh();
    } catch (error) {
      console.error("Failed to delete assistant:", error);
      toast.error("Failed to delete assistant. Please try again.");
    } finally {
      setIsTableLoading(false);
      setShowDeleteDialog(false);
      setDeleteAssistantId(null);
    }
  }, [access, deleteAssistantId, triggerDataRefresh]);

  return (
    <>
      {/* Filter Controls */}
      <div className="w-full bg-bg-secondary p-4 rounded-xl border border-border-default flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or phone"
            className="w-full"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={resetFilters}
            className="flex items-center w-fit rounded-full"
            aria-label="Reset filters">
            <X size={16} />
          </Button>
        </div>
      </div>

      {/* Assistant Table */}
      {isTableLoading ? (
        <TableSkeleton />
      ) : (
        <div className="w-full bg-bg-secondary p-4 rounded-xl border border-border-default px-10 pt-6">
          <div className="text-lg sm:text-xl text-text-primary text-left font-semibold pl-5 mb-6">
            Assistants ({tablefilterddata.length})
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Name</TableHead>
                <TableHead className="text-left">Contact</TableHead>
                <TableHead className="text-left">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tablefilterddata.length > 0 ? (
                tablefilterddata.map((assistant) => (
                  <StudentRow
                    key={assistant.id}
                    assistant={assistant}
                    onEdit={() => {
                      setIsEditAssistantDialogOpen(true);
                      setEditAssistantId(assistant.id);
                    }}
                    onDelete={() => {
                      setDeleteAssistantId(assistant.id);
                      setShowDeleteDialog(true);
                    }}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-text-secondary">
                    No assistant found matching your filters
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
        onConfirm={handleDeleteAssistant}
        isLoading={isTableLoading}
      />

      {/* Edit Assistant Dialog */}
      <EditAssistantDialog
        open={isEditAssistantDialogOpen}
        onOpenChange={(open) => {
          setIsEditAssistantDialogOpen(open);
          if (!open) {
            setEditAssistantId(null);
            setInitialAssistantData(null);
          }
        }}
        assistantData={editAssistantdata}
        onDataChange={setEditAssistantdata}
        onSubmit={handleSubmitEdit}
        isLoading={isEditLoading}
        isSubmitting={isSubmitting}
      />
    </>
  );
}

interface StudentRowProps {
  assistant: AssistantData;
  onEdit: () => void;
  onDelete: () => void;
}

const StudentRow = ({
  assistant: assistant,
  onEdit,
  onDelete,
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
            <p className="font-medium text-text-primary">
              {assistant.full_name}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-3 w-3 text-text-secondary" />
            <span>{assistant.phone_number}</span>
          </div>
        </div>
      </TableCell>
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
        <DialogTitle>
          Are you sure you want to delete this assistant?
        </DialogTitle>
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

interface EditAssistantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assistantData: EditAssistantData;
  onDataChange: (data: EditAssistantData) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  isSubmitting: boolean;
}

const EditAssistantDialog = ({
  open,
  onOpenChange,
  assistantData: assistantData,
  onDataChange,
  onSubmit,
  isLoading,
  isSubmitting,
}: EditAssistantDialogProps) => {
  const [isGenderPopoverOpen, setIsGenderPopoverOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Edit Assistant - {assistantData?.full_name || "Assistant"}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <EditFormSkeleton />
        ) : (
          <form id="edit-assistant-form" onSubmit={onSubmit}>
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
                    value={assistantData?.full_name}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Assistant full name"
                    onChange={(e) =>
                      onDataChange({
                        ...assistantData,
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
                        <span>{assistantData?.gender || "Select Gender"}</span>
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
                            onDataChange({ ...assistantData, gender: "Male" });
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
                              "Male" === assistantData?.gender
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                        <CommandItem
                          value="Female"
                          onSelect={() => {
                            onDataChange({
                              ...assistantData,
                              gender: "Female",
                            });
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
                              "Female" === assistantData?.gender
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
                    value={assistantData?.phone_number}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Phone number"
                    onChange={(e) =>
                      onDataChange({
                        ...assistantData,
                        phone_number: e.target.value,
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
                    maxLength={20}
                    className="w-full px-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Enter username"
                    value={assistantData?.username}
                    onChange={(e) =>
                      onDataChange({
                        ...assistantData,
                        username: e.target.value,
                      })
                    }
                  />
                </div>
                <p className="mt-1 text-xs text-text-secondary">
                  Must be 4-20 characters
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
                    value={assistantData?.password}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Create a password"
                    onChange={(e) =>
                      onDataChange({
                        ...assistantData,
                        password: e.target.value,
                      })
                    }
                  />
                </div>
                <p className="mt-1 text-xs text-text-secondary">
                  Minimum 8 characters (leave blank to keep current)
                </p>
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
