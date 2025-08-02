import { Button } from "@/components/ui/button";
import useQuizStore_initial from "@/lib/stores/onlineQuizStores/initialData";
import { BookOpen, Check, X, AlertCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { FilterPopover } from "../../students/_students comps/tabledata";
import {
  CommandInput,
  CommandItem,
  CommandList,
  Command,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import useViewStore from "@/lib/stores/onlineQuizStores/viewStore";
import useQEditStore from "@/lib/stores/onlineQuizStores/editQuiz";
import useSubmissionsStore from "@/lib/stores/onlineQuizStores/submissions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/lib/axiosinterceptor";
import { showToast } from "../../students/_students comps/main";

// Date formatting helper
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// Status class mapping
const getStatusClass = (status: string) => {
  switch (status) {
    case "open":
      return "bg-green-100 text-green-800";
    case "upcoming":
      return "bg-yellow-100 text-yellow-800";
    case "closed":
      return "bg-red-100 text-red-800";
    case "Not Assigned":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function QDashboard({
  isLoading,
  error,
}: {
  isLoading: boolean;
  error: string | null;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterGradesOpen, setIsFilterGradesOpen] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<string | number>("all");
  const [selectedGrade, setSelectedGrade] = useState<string | number>("all");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleting, setIsDeleting] = useState(false);
  const [deleteQuiz, setDeleteQuiz] = useState<number | null>(null);

  const { allQuizzes, availGrades } = useQuizStore_initial();

  const deleteQuizFromUI = useQuizStore_initial.getState().deleteQuiz;

  const { updateCurrentMainView } = useViewStore();

  const setSelectedQuizId = useQEditStore((state) => state.setSelectedQuizId);

  const setSelectedQuizId_Submissions = useSubmissionsStore(
    (state) => state.setSelectedQuizId
  );

  const selectedGradeName = useMemo(
    () =>
      selectedGrade === "all"
        ? "All Grades"
        : availGrades.find((g) => g.id.toString() === selectedGrade)?.name ||
          "Select Grade",
    [selectedGrade, availGrades]
  );

  const resetFilters = () => {
    setSelectedCenter("all");
    setSelectedGrade("all");
    setSearchQuery("");
  };

  const filteredQuizzes = useMemo(() => {
    return allQuizzes.filter((quiz) => {
      const matchesSearch = quiz.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesCenter =
        selectedCenter === "all" ||
        quiz.center_times.some(
          (ct) => ct.center.id.toString() === selectedCenter
        );

      const matchesGrade =
        selectedGrade === "all" || quiz.grade?.id.toString() === selectedGrade;

      return matchesSearch && matchesCenter && matchesGrade;
    });
  }, [allQuizzes, searchQuery, selectedCenter, selectedGrade]);

  const onConfirm = async () => {
    if (!deleteQuiz) return;
    setIsDeleting(true);
    try {
      await api.delete(
        `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}onlinequiz/quizzes/${deleteQuiz}/delete/`
      );
      deleteQuizFromUI(deleteQuiz);
      setDeleteQuiz(null);
      setIsDeleteDialogOpen(false);
      showToast("Quiz deleted successfully", "success");
    } catch {
      showToast("couldn't delete quiz", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Skeleton Loaders
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="header flex justify-between items-center flex-wrap gap-4 mb-8">
          <div>
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-80" />
          </div>
          <Skeleton className="h-9 w-44" />
        </div>

        <div className="w-full bg-bg-secondary p-4 rounded-xl border border-border-default flex flex-col md:flex-row gap-6 mb-6">
          <Skeleton className="h-10 flex-grow" />
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>

        <div className="quiz-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="quiz-card bg-white rounded-md overflow-hidden shadow-sm border border-border-default">
              <div className="quiz-header p-5 pb-4 border-b border-border-default flex-1">
                <Skeleton className="h-7 w-4/5 mb-4" />
                <div className="flex flex-wrap gap-2 mb-4">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-5/6" />
              </div>

              <div className="quiz-details p-4 bg-gray-50 border-t border-border-default">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-8" />
                </div>
              </div>

              <div className="quiz-actions p-4 flex gap-3">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 flex-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="p-6">
        <div className="header flex justify-between items-center flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
              Quizzes Dashboard
            </h1>
            <p className="text-text-secondary max-w-[600px]">
              Manage, create and assign quizzes to students.
            </p>
          </div>
          <div>
            <Button
              variant="outline"
              className="gap-2 text-sm bg-primary text-text-inverse hover:text-text-inverse hover:bg-primary-hover h-9"
              onClick={() => updateCurrentMainView("create")}>
              Create Online Quiz
            </Button>
          </div>
        </div>

        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading quizzes</AlertTitle>
          <AlertDescription>
            {error}
            <Button
              variant="link"
              className="ml-2 p-0 h-auto"
              onClick={() => window.location.reload()}>
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Main Content
  return (
    <>
      <div className="header flex justify-between items-center flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
            Quizzes Dashboard
          </h1>
          <p className="text-text-secondary max-w-[600px]">
            Manage, create and assign quizzes to students.
          </p>
        </div>
        <div>
          <Button
            variant="outline"
            className="gap-2 text-sm bg-primary text-text-inverse hover:text-text-inverse hover:bg-primary-hover h-9"
            onClick={() => updateCurrentMainView("create")}>
            Create Online Quiz
          </Button>
        </div>
      </div>

      <div className="w-full bg-bg-secondary p-4 rounded-xl border border-border-default flex flex-col md:flex-row gap-6 mb-6">
        <div className="flex-grow">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by quiz title..."
            className="w-full"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-wrap gap-3 w-full">
            <FilterPopover
              icon={<BookOpen size={16} />}
              label={selectedGradeName}
              openState={isFilterGradesOpen}
              onOpenChange={setIsFilterGradesOpen}>
              <Command>
                <CommandInput placeholder="Search grade..." />
                <CommandList>
                  <CommandItem
                    onSelect={() => {
                      setSelectedGrade("all");
                      setIsFilterGradesOpen(false);
                    }}>
                    All Grades
                  </CommandItem>
                  {availGrades?.map((grade) => (
                    <CommandItem
                      key={grade.id}
                      onSelect={() => {
                        setSelectedGrade(grade.id.toString());
                        setIsFilterGradesOpen(false);
                      }}>
                      {grade.name}
                      {grade.id.toString() === selectedGrade && (
                        <Check className="ml-auto" size={16} />
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
      </div>

      {/* Quiz Grid */}
      {filteredQuizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => {
            return (
              <div
                key={quiz.id}
                className="bg-bg-secondary rounded-xl overflow-hidden shadow-sm border border-border-default transition-all duration-300 flex flex-col hover:-translate-y-1 hover:shadow-lg">
                <div className="quiz-header p-5 pb-4 border-b border-border-default flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="quiz-title text-xl font-semibold">
                      {quiz.title}
                    </h2>
                    <Button
                      onClick={() => {
                        setIsDeleteDialogOpen(true);
                        setDeleteQuiz(quiz.id);
                      }}
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-full">
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </div>
                  <div className="quiz-meta flex flex-wrap gap-2 mb-3">
                    {quiz.grade && (
                      <span className="quiz-tag grade-tag inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {quiz.grade.name}
                      </span>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {quiz.center_times.map((ct) => {
                        if (ct.status === "Not Assigned") return null;
                        return (
                          <span
                            key={ct.center.id}
                            className="quiz-tag center-tag inline-block px-3 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-800 truncate max-w-[120px]"
                            title={`${ct.center.name}: ${formatDate(
                              ct.open_date
                            )} - ${formatDate(ct.close_date)}`}>
                            {ct.center.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <p className="quiz-description text-text-secondary text-sm leading-normal mb-4">
                    {quiz.description || "No description available"}
                  </p>
                </div>

                <div className="quiz-details p-4 bg-gray-50 border-t border-border-default">
                  {quiz.center_times.map((ct, index) => (
                    <div
                      key={ct.center.id}
                      className={`pb-4 ${
                        index !== quiz.center_times.length - 1
                          ? "border-b border-gray-200 mb-4"
                          : "pb-0"
                      }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">
                          {ct.center.name}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-sm text-xs font-medium ${getStatusClass(
                            ct.status
                          )}`}>
                          {ct.status.charAt(0).toUpperCase() +
                            ct.status.slice(1)}
                        </span>
                      </div>
                      <div className="quiz-detail flex justify-between text-sm mb-1">
                        <span className="detail-label text-text-secondary">
                          Opens:
                        </span>
                        <span className="detail-value font-medium">
                          {ct.open_date ? formatDate(ct.open_date) : "No date"}
                        </span>
                      </div>
                      <div className="quiz-detail flex justify-between text-sm">
                        <span className="detail-label text-text-secondary">
                          Closes:
                        </span>
                        <span className="detail-value font-medium">
                          {ct.close_date
                            ? formatDate(ct.close_date)
                            : "No date"}
                        </span>
                      </div>
                    </div>
                  ))}

                  <div className="quiz-detail flex justify-between text-sm mt-4 pt-4 border-t border-gray-200">
                    <span className="detail-label text-text-secondary">
                      Questions:
                    </span>
                    <span className="detail-value font-medium">
                      {quiz.question_count}
                    </span>
                  </div>
                </div>

                <div className="quiz-actions p-4 flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 hover:text-text-inverse"
                    onClick={() => {
                      setSelectedQuizId_Submissions(quiz.id);
                      updateCurrentMainView("submissions");
                    }}>
                    View Results
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 hover:text-text-inverse"
                    onClick={() => {
                      setSelectedQuizId(quiz.id);
                      updateCurrentMainView("edit");
                    }}>
                    Edit
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <BookOpen className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No quizzes found
          </h3>
          <p className="text-gray-500 text-center max-w-md">
            Try adjusting your filters or create a new quiz to get started.
          </p>
          <Button
            className="mt-4"
            onClick={() => updateCurrentMainView("create")}>
            Create Quiz
          </Button>
        </div>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Are you sure you want to delete this quiz?
            </DialogTitle>
            <DialogDescription>
              All submissions and data about this quiz will be permanently
              deleted. This action cannot be undone!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleting}
              className="hover:bg-bg-secondary">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
