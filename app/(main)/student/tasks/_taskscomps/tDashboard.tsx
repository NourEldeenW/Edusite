import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileText, Eye, Play, Clock, XCircle } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap } from "@fortawesome/free-solid-svg-icons";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatUserDate } from "@/lib/formatDate";
import useTasksStu from "@/lib/stores/student/tasks/tasks";
import { useRouter } from "next/navigation";
import { api, djangoApi } from "@/lib/axiosinterceptor";

export default function TDashboard() {
  const allTasks = useTasksStu((state) => state.tasks);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingStates, setLoadingStates] = useState<
    Record<number, "starting" | "redirecting" | null>
  >({});

  const filteredTasks = useMemo(() => {
    return allTasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.grade_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [allTasks, searchQuery]);

  const getTaskStatusBadgeVariant = (status: string) => {
    if (status === "Open") return "bg-green-600 text-white";
    if (status === "Closed") return "bg-red-600 text-white";
    if (status === "Upcoming") return "bg-orange-500 text-white";
    return "bg-gray-600 text-white";
  };

  const onStart = async (taskId: number) => {
    setLoadingStates((prev) => ({ ...prev, [taskId]: "starting" }));
    try {
      const res = await api.post(`${djangoApi}task/tasks/${taskId}/start/`);
      router.push(
        `/student/tasks/task/${taskId}?subId=${res.data.submission_id}`
      );
    } catch (error) {
      console.error("starting failed:", error);
      setLoadingStates((prev) => ({ ...prev, [taskId]: null }));
    }
  };

  const handleNavigation = (taskId: number, url: string) => {
    setLoadingStates((prev) => ({ ...prev, [taskId]: "redirecting" }));
    try {
      router.push(url);
    } catch (error) {
      console.error("Redirect failed:", error);
      setLoadingStates((prev) => ({ ...prev, [taskId]: null }));
    }
  };

  return (
    <div className="max-w-screen-2xl mx-auto">
      <div className="header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Online Tasks
          </h1>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8 w-full">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search tasks by title or grade..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-bg-secondary"
          />
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <Card className="border-dashed border-2 bg-muted/40 max-w-2xl mx-auto">
          <CardContent className="py-16 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <CardTitle className="text-xl mb-2">
              {allTasks.length === 0 ? "No tasks" : "No tasks found"}
            </CardTitle>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {allTasks.length === 0
                ? "No tasks Yet!"
                : "Try adjusting your search or filter criteria"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div
          className="grid gap-6 mb-8"
          style={{
            gridTemplateColumns:
              "repeat(auto-fill, minmax(min(100%, 360px), 1fr))",
          }}>
          {filteredTasks.map((task) => {
            const isLoading =
              loadingStates[task.id] !== undefined &&
              loadingStates[task.id] !== null;
            const loadingAction = loadingStates[task.id];

            let buttonText = "View Details";
            let ButtonIcon = Eye;
            let isDisabled = false;
            let buttonClass =
              "flex-1 transition-colors hover:text-text-inverse";
            let buttonOnClick = () =>
              handleNavigation(
                task.id,
                `/tasks/${task.id}/review/${task.submission_id}`
              );

            if (task.student_submission_status === "Not Started") {
              if (task.availability_status === "Open") {
                buttonText = "Start Task";
                ButtonIcon = Play;
                buttonOnClick = () => onStart(task.id);
                buttonClass += " bg-green-600 hover:bg-green-700 text-white";
              } else if (task.availability_status === "Closed") {
                buttonText = "Missed";
                ButtonIcon = XCircle;
                isDisabled = true;
                buttonClass += " text-gray-500 bg-gray-100";
              } else if (task.availability_status === "Upcoming") {
                buttonText = "Upcoming";
                ButtonIcon = Clock;
                isDisabled = true;
                buttonClass += " text-gray-500 bg-gray-100";
              }
            } else if (task.student_submission_status === "In Progress") {
              buttonText = "Continue";
              ButtonIcon = Play;
              buttonOnClick = () =>
                handleNavigation(
                  task.id,
                  `/student/tasks/task/${task.id}?subId=${task.submission_id}`
                );
              buttonClass += " bg-blue-600 hover:bg-blue-700 text-white";
            } else if (
              task.student_submission_status === "Submitted" ||
              task.student_submission_status === "corrected"
            ) {
              buttonText = "Review Submission";
              ButtonIcon = Eye;
              buttonOnClick = () =>
                handleNavigation(
                  task.id,
                  `/tasks/${task.id}/review/${task.submission_id}`
                );
              buttonClass += " bg-gray-600 hover:bg-gray-700 text-white";
            }

            return (
              <Card
                key={task.id}
                className="bg-white rounded-xl shadow-sm transition-all hover:shadow-lg border border-gray-200 hover:border-primary/40 group overflow-hidden">
                <div className="p-6 h-full flex flex-col">
                  <div>
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                          {task.title}
                        </h3>
                        <p className="mt-2 text-sm text-gray-500 line-clamp-3">
                          {task.details || "No description available"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-5">
                      <FontAwesomeIcon
                        icon={faGraduationCap}
                        className="text-primary text-sm"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {task.grade_name}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Center
                      </h4>
                      <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                        <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg">
                          <div className="font-medium text-sm text-gray-900 mb-1">
                            {task.center_schedule.center.name}
                          </div>
                          <div className="flex justify-between text-xs text-gray-600">
                            <div>
                              Open:{" "}
                              {formatUserDate(
                                task.center_schedule.open_date,
                                true,
                                false
                              )}
                            </div>
                            <div>
                              Close:{" "}
                              {formatUserDate(
                                task.center_schedule.close_date,
                                true,
                                false
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">
                        Task Status:
                      </span>
                      <Badge
                        className={`font-medium ${getTaskStatusBadgeVariant(
                          task.availability_status
                        )}`}>
                        {task.availability_status}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">
                        Submission Status:
                      </span>
                      <Badge
                        className={`font-medium ${
                          task.student_submission_status === "In Progress"
                            ? "bg-orange-500 text-white"
                            : task.student_submission_status === "Submitted" ||
                              task.student_submission_status === "corrected"
                            ? "bg-green-600 text-white"
                            : ""
                        }`}>
                        {task.student_submission_status}
                        {task.student_submission_status === "Submitted" &&
                          !task.is_graded &&
                          " (Not Graded)"}
                        {task.is_graded &&
                          task.grade !== null &&
                          `: ${task.grade}/${task.max_score}`}
                      </Badge>
                    </div>
                  </div>
                </div>
                <CardFooter className="p-4 border-t border-gray-100">
                  <Button
                    onClick={buttonOnClick}
                    disabled={isDisabled || isLoading}
                    className={buttonClass}>
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        {loadingAction === "starting"
                          ? "Starting..."
                          : "Redirecting..."}
                      </>
                    ) : (
                      <>
                        <ButtonIcon className="w-5 h-5" />
                        <span>{buttonText}</span>
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
