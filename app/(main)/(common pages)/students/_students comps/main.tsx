"use client";
import { api } from "@/lib/axiosinterceptor";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Upload,
  Plus,
  UserRoundPen,
  UserRound,
  Phone,
  UsersRound,
  Lock,
  ChevronsUpDown,
  Check,
  Shuffle,
  Building,
  BookOpen,
  Users,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import StatCard from "./cards";
import TableData from "./tabledata";

const DJANGO_API_URL = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;

export interface GradeType {
  id: number;
  name: string;
}

export const showToast = (message: string, type: "success" | "error") => {
  toast[type](type === "success" ? "Success" : "Error", {
    description: message,
    action: { label: "Ok", onClick: () => toast.dismiss() },
    position: "top-center",
  });
};

export interface StudentData {
  id: number;
  student_id: string;
  grade: GradeType;
  center: GradeType;
  added_by: string;
  full_name: string;
  phone_number: string;
  parent_number: string;
  gender: string;
  is_approved: boolean;
  user: number;
  teacher: {
    id: number;
    full_name: string;
  };
}

interface NewStudentForm {
  full_name: string;
  phone_number: string;
  parent_number: string;
  gender: string;
  grade: GradeType;
  username: string;
  password: string;
  center: GradeType;
}

const initialStudentForm: NewStudentForm = {
  full_name: "",
  phone_number: "",
  parent_number: "",
  gender: "Male",
  grade: { id: 0, name: "" },
  username: "",
  password: "",
  center: { id: 0, name: "" },
};

interface StudentManagementProps {
  access: string;
}

export default function StudentManagementPage({
  access,
}: StudentManagementProps) {
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [isAddCenterDialogOpen, setIsAddCenterDialogOpen] = useState(false);
  const [isGenderPopoverOpen, setIsGenderPopoverOpen] = useState(false);
  const [isGradePopoverOpen, setIsGradePopoverOpen] = useState(false);

  const [newStudentForm, setNewStudentForm] = useState(initialStudentForm);
  const [newCenterName, setNewCenterName] = useState("");
  const [availableGrades, setAvailableGrades] = useState<GradeType[]>([]);
  const [availableCenters, setAvailableCenters] = useState<GradeType[]>([]);
  const [allStudents, setAllStudents] = useState<StudentData[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    setIsFetching(true);
    const fetchInitialData = async () => {
      try {
        const [gradesResponse, centersResponse, studentsResponse] =
          await Promise.all([
            api.get(`${DJANGO_API_URL}accounts/grades/`, {
              headers: { Authorization: `Bearer ${access}` },
            }),
            api.get(`${DJANGO_API_URL}accounts/centers/`, {
              headers: { Authorization: `Bearer ${access}` },
            }),
            api.get(`${DJANGO_API_URL}accounts/students/`, {
              headers: { Authorization: `Bearer ${access}` },
            }),
          ]);

        setAvailableGrades(await gradesResponse.data);
        setAvailableCenters(await centersResponse.data);
        setAllStudents(await studentsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchInitialData();
  }, [access, refreshCounter]);

  const triggerDataRefresh = () => setRefreshCounter((prev) => prev + 1);

  const handleCreateStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const requestData = {
        ...newStudentForm,
        gender: newStudentForm.gender.toLowerCase(),
        grade: newStudentForm.grade.id,
        center: newStudentForm.center.id,
      };

      const response = await api.post(
        `${DJANGO_API_URL}accounts/students/create/`,
        requestData, // Send the data directly as the second argument
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access}`,
          },
        }
      );

      if (!response.data) throw new Error(response.statusText);

      showToast("Student added successfully", "success");
      setNewStudentForm({
        ...initialStudentForm,
        grade: newStudentForm.grade,
        center: newStudentForm.center,
        gender: newStudentForm.gender,
      });
      triggerDataRefresh();
    } catch (error) {
      console.error("Error creating student:", error);
      showToast(
        error instanceof Error ? error.message : "Operation failed",
        "error"
      );
    }
  };

  const handleCreateCenter = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await api.post(
        `${DJANGO_API_URL}accounts/centers/create/`,
        { name: newCenterName },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access}`,
          },
        }
      );

      if (!response.data) throw new Error(response.statusText);

      showToast("Center added successfully", "success");
      setNewCenterName("");
      triggerDataRefresh();
      setIsAddCenterDialogOpen(false);
    } catch (error) {
      console.error("Error adding center:", error);
      showToast("Failed to create center", "error");
    }
  };

  const generateRandomCredentials = () => {
    const randomString = Math.random().toString(36).substring(2, 10);
    setNewStudentForm((prev) => ({
      ...prev,
      username: `stu_${randomString}`,
      password: `pass_${randomString}`,
    }));
  };

  return (
    <div className="space-y-4 sm:space-y-6 bg-bg-base min-h-screen dark:bg-bg-subtle">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
            Student Management
          </h1>
          <p className="text-sm sm:text-base text-text-secondary mt-1">
            Manage and monitor all your students&apos; performance and data
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto justify-end">
          <Button
            variant="outline"
            className="gap-2 text-sm hover:text-text-inverse h-9 flex-grow sm:flex-grow-0">
            <Upload className="h-4 w-4" /> Export
          </Button>

          {/* Add Center Dialog */}
          <Dialog
            open={isAddCenterDialogOpen}
            onOpenChange={setIsAddCenterDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 text-sm hover:text-text-inverse h-9 flex-grow sm:flex-grow-0">
                <Building className="h-4 w-4" /> Add Center
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Center</DialogTitle>
              </DialogHeader>
              <form
                id="add-center-form"
                className="pb-4"
                onSubmit={handleCreateCenter}>
                <div className="space-y-2">
                  <Label
                    htmlFor="center-name"
                    className="block text-sm font-medium text-text-primary">
                    Center Name
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="text-gray-400 h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      id="center-name"
                      required
                      minLength={3}
                      maxLength={50}
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      placeholder="Enter center name"
                      value={newCenterName}
                      onChange={(e) => setNewCenterName(e.target.value)}
                    />
                  </div>
                  <p className="mt-1 text-xs text-text-secondary">
                    Must be 3-50 characters
                  </p>
                </div>
              </form>
              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    className="hover:bg-bg-base active:scale-90">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  form="add-center-form"
                  variant="outline"
                  className="bg-primary hover:bg-primary/90 text-text-inverse hover:text-text-inverse/90 active:scale-90">
                  Create Center
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add Student Dialog */}
          <Dialog
            open={isAddStudentDialogOpen}
            onOpenChange={setIsAddStudentDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 text-sm bg-primary text-text-inverse hover:text-text-inverse hover:bg-primary-hover h-9 flex-grow sm:flex-grow-0">
                <Plus className="h-4 w-4" /> Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85dvh] overflow-y-auto md:max-w-[650px]">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
              </DialogHeader>
              <form id="add-student-form" onSubmit={handleCreateStudent}>
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
                        required
                        value={newStudentForm.full_name}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        placeholder="Student full name"
                        onChange={(e) =>
                          setNewStudentForm({
                            ...newStudentForm,
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
                            <span>{newStudentForm.gender}</span>
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
                                setNewStudentForm({
                                  ...newStudentForm,
                                  gender: "Male",
                                });
                                setIsGenderPopoverOpen(false);
                              }}
                              className="data-[selected=true]:bg-gray-100 data-[selected=true]:text-text-primary py-2">
                              <div className="flex items-center">
                                <UserRound className="h-4 w-4 mr-2" />
                                Male
                              </div>
                              <Check
                                className={cn(
                                  "ml-auto",
                                  "Male" === newStudentForm.gender
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </CommandItem>
                            <CommandItem
                              value="Female"
                              onSelect={() => {
                                setNewStudentForm({
                                  ...newStudentForm,
                                  gender: "Female",
                                });
                                setIsGenderPopoverOpen(false);
                              }}
                              className="data-[selected=true]:bg-gray-100 data-[selected=true]:text-text-primary py-2">
                              <div className="flex items-center">
                                <UserRound className="h-4 w-4 mr-2" />
                                Female
                              </div>
                              <Check
                                className={cn(
                                  "ml-auto",
                                  "Female" === newStudentForm.gender
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
                              {newStudentForm.grade.name || "Select Grade"}
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
                                  setNewStudentForm({
                                    ...newStudentForm,
                                    grade,
                                  });
                                  setIsGradePopoverOpen(false);
                                }}
                                className="data-[selected=true]:bg-gray-100 data-[selected=true]:text-text-primary py-2">
                                {grade.name}
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    grade.name === newStudentForm.grade.name
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
                        required
                        pattern="[0-9]{11}"
                        maxLength={11}
                        minLength={11}
                        value={newStudentForm.phone_number}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        placeholder="Phone number"
                        onChange={(e) =>
                          setNewStudentForm({
                            ...newStudentForm,
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
                        required
                        pattern="[0-9]{11}"
                        maxLength={11}
                        minLength={11}
                        value={newStudentForm.parent_number}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        placeholder="Parent's phone number"
                        onChange={(e) =>
                          setNewStudentForm({
                            ...newStudentForm,
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
                        required
                        minLength={4}
                        maxLength={20}
                        className="w-full px-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        placeholder="Enter username"
                        value={newStudentForm.username}
                        onChange={(e) =>
                          setNewStudentForm({
                            ...newStudentForm,
                            username: e.target.value,
                          })
                        }
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-full text-text-secondary hover:bg-gray-100"
                          onClick={generateRandomCredentials}>
                          <Shuffle className="h-4 w-4" />
                        </Button>
                      </div>
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
                        required
                        minLength={8}
                        value={newStudentForm.password}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        placeholder="Create a password"
                        onChange={(e) =>
                          setNewStudentForm({
                            ...newStudentForm,
                            password: e.target.value,
                          })
                        }
                      />
                    </div>
                    <p className="mt-1 text-xs text-text-secondary">
                      Minimum 8 characters
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
                      defaultValue={newStudentForm.center.name}>
                      {availableCenters.map((center) => (
                        <div
                          key={center.id}
                          className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={center.name}
                            id={`center-${center.id}`}
                            className="text-primary border-gray-300"
                            onClick={() => {
                              setNewStudentForm({
                                ...newStudentForm,
                                center,
                              });
                            }}
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
              </form>
              <Separator className="my-1 bg-text-secondary" />
              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    className="hover:bg-bg-base active:scale-90">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  form="add-student-form"
                  variant="outline"
                  className="bg-primary hover:bg-primary/90 text-text-inverse hover:text-text-inverse/90 active:scale-90">
                  Create Account
                </Button>
              </DialogFooter>
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
        <StatCard
          iconContainerClass="bg-primary/10"
          title="Total Students"
          value={allStudents.length}
          icon={<Users className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />}
        />
        <StatCard
          iconContainerClass="bg-success/10"
          title="Active Students"
          value={
            allStudents.filter((student) => student.is_approved === true).length
          }
          icon={<CheckCircle className="h-4 w-4 sm:h-6 sm:w-6 text-success" />}
        />
        <StatCard
          iconContainerClass="bg-warning/10"
          title="Inactive Students"
          value={
            allStudents.filter((student) => student.is_approved === false)
              .length
          }
          icon={<AlertCircle className="h-4 w-4 sm:h-6 sm:w-6 text-warning" />}
        />
      </div>

      {/* table data */}

      <TableData
        data={allStudents}
        availableCentersInitial={availableCenters}
        availableGradesInitial={availableGrades}
        access={access}
        triggerDataRefresh={triggerDataRefresh}
        isFetching={isFetching}
      />
    </div>
  );
}
