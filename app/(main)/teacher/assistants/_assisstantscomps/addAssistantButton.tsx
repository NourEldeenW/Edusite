"use client";
import { api } from "@/lib/axiosinterceptor";
import { Button } from "@/components/ui/button";
import { Command, CommandItem, CommandList } from "@/components/ui/command";
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
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Plus,
  UserRoundPen,
  UserRound,
  Phone,
  Lock,
  ChevronsUpDown,
  Check,
  Shuffle,
} from "lucide-react";
import { useState } from "react";
import { showToast } from "@/app/(main)/(common pages)/students/_students comps/main";

const DJANGO_API_URL = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;

interface AddAssistantButtonProps {
  triggerDataRefresh: () => void;
  access: string;
}

interface NewAssistantForm {
  full_name: string;
  phone_number: string;
  gender: string;
  username: string;
  password: string;
}

const initialAssistantForm: NewAssistantForm = {
  full_name: "",
  phone_number: "",
  gender: "Male",
  username: "",
  password: "",
};

export default function AddAssistantButton({
  access,
  triggerDataRefresh,
}: AddAssistantButtonProps) {
  const [isAddAssistantDialogOpen, setIsAddAssistantDialogOpen] =
    useState(false);
  const [isGenderPopoverOpen, setIsGenderPopoverOpen] = useState(false);
  const [newAssistantForm, setNewAssistantForm] =
    useState(initialAssistantForm);

  const generateRandomCredentials = () => {
    const randomStringname = Math.random().toString(36).substring(2, 10);
    const randomStringpass = Math.random().toString(36).substring(2, 10);
    setNewAssistantForm((prev) => ({
      ...prev,
      username: `${randomStringname}`,
      password: `pass_${randomStringpass}`,
    }));
  };

  const handleCreateStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const requestData = {
        ...newAssistantForm,
        gender: newAssistantForm.gender.toLowerCase(),
      };

      const response = await api.post(
        `${DJANGO_API_URL}accounts/assistants/create/`,
        requestData, // Send the data directly as the second argument
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access}`,
          },
        }
      );

      if (!response.data) throw new Error(response.statusText);

      showToast("Assistant added successfully", "success");
      setNewAssistantForm({
        ...initialAssistantForm,
        gender: newAssistantForm.gender,
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

  return (
    <>
      <Dialog
        open={isAddAssistantDialogOpen}
        onOpenChange={setIsAddAssistantDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="gap-2 text-sm bg-primary text-text-inverse hover:text-text-inverse hover:bg-primary-hover h-9 flex-grow sm:flex-grow-0">
            <Plus className="h-4 w-4" /> Add Assistant
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[85dvh] overflow-y-auto md:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Add New Assistant</DialogTitle>
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
                    value={newAssistantForm.full_name}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Assistant's full name"
                    onChange={(e) =>
                      setNewAssistantForm({
                        ...newAssistantForm,
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
                        <span>{newAssistantForm.gender}</span>
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
                            setNewAssistantForm({
                              ...newAssistantForm,
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
                              "Male" === newAssistantForm.gender
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                        <CommandItem
                          value="Female"
                          onSelect={() => {
                            setNewAssistantForm({
                              ...newAssistantForm,
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
                              "Female" === newAssistantForm.gender
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
                    required
                    pattern="[0-9]{11}"
                    maxLength={11}
                    minLength={11}
                    value={newAssistantForm.phone_number}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Phone number"
                    onChange={(e) =>
                      setNewAssistantForm({
                        ...newAssistantForm,
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
                    required
                    minLength={4}
                    maxLength={20}
                    className="w-full px-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Enter username"
                    value={newAssistantForm.username}
                    onChange={(e) =>
                      setNewAssistantForm({
                        ...newAssistantForm,
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
                    value={newAssistantForm.password}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Create a password"
                    onChange={(e) =>
                      setNewAssistantForm({
                        ...newAssistantForm,
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
    </>
  );
}
