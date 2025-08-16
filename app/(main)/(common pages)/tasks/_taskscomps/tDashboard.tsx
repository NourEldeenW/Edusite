import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useTaskStore from "@/lib/stores/tasksStores/initData";
import { Edit, Trash2, Search, FileText, Filter, Plus } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap } from "@fortawesome/free-solid-svg-icons";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TDashboard() {
  const pathname = usePathname();
  const allTasks = useTaskStore((state) => state.allTasks);

  // State for filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");

  // Get unique grades for filter options
  const uniqueGrades = useMemo(() => {
    const grades = allTasks.map((task) => task.grade_name);
    return Array.from(new Set(grades)).sort();
  }, [allTasks]);

  // Filter tasks based on search and grade
  const filteredTasks = useMemo(() => {
    return allTasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.grade_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGrade =
        gradeFilter === "all" || task.grade_name === gradeFilter;
      return matchesSearch && matchesGrade;
    });
  }, [allTasks, searchQuery, gradeFilter]);

  return (
    <div className="max-w-screen-2xl mx-auto">
      <div className="header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Task Management
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Create, assign, and manage tasks for your students. Monitor
            submissions and provide feedback.
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <Button asChild className="h-10 w-full sm:w-auto">
            <Link href={`${pathname}?view=create`}>
              <Plus className="mr-2 h-4 w-4" />
              Create Online Task
            </Link>
          </Button>
        </div>
      </div>

      {/* Filter Controls */}
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

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-gray-500 bg-bg-secondary" />
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className="w-full sm:w-48 h-11 bg-bg-secondary">
                <SelectValue placeholder="Filter by grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {uniqueGrades.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredTasks.length === 0 ? (
        <Card className="border-dashed border-2 bg-muted/40 max-w-2xl mx-auto">
          <CardContent className="py-16 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <CardTitle className="text-xl mb-2">
              {allTasks.length === 0
                ? "No tasks created yet"
                : "No tasks found"}
            </CardTitle>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {allTasks.length === 0
                ? "Get started by creating your first task"
                : "Try adjusting your search or filter criteria"}
            </p>
            <Button asChild>
              <Link href={`${pathname}?view=create`}>
                <Plus className="mr-2 h-4 w-4" />
                Create Online Task
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Task Grid */
        <div
          className="grid gap-6 mb-8"
          style={{
            gridTemplateColumns:
              "repeat(auto-fill, minmax(min(100%, 360px), 1fr))",
          }}>
          {filteredTasks.map((task) => (
            <Card
              key={task.id}
              className="bg-white rounded-xl shadow-sm transition-all hover:shadow-md border border-gray-200 hover:border-gray-300 group overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {task.title}
                    </h3>
                    <div className="mt-2 text-text-secondary dark:text-gray-400">
                      <p className="text-sm line-clamp-3 break-words">
                        {task.details || "No description available"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      className="p-2 text-gray-500 hover:text-primary transition-colors rounded-lg hover:bg-gray-100"
                      aria-label="Edit task">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-gray-500 hover:text-destructive transition-colors rounded-lg hover:bg-gray-100"
                      aria-label="Delete task">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-5">
                  <FontAwesomeIcon
                    icon={faGraduationCap}
                    className="text-gray-500 text-sm"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {task.grade_name}
                  </span>
                </div>

                <div className="mb-5">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Centers
                  </h4>
                  <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                    {task.centers.map((center) => (
                      <div
                        key={center.center.id}
                        className="bg-gray-50 p-3 rounded-lg">
                        <div className="font-medium text-sm text-gray-900 mb-1">
                          {center.center.name}
                        </div>
                        <div className="flex justify-between text-xs text-gray-600">
                          <div>Open: {formatDate(center.open_date)}</div>
                          <div>Close: {formatDate(center.close_date)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Content Type:</span>
                    <Badge variant="secondary" className="font-medium">
                      {task.task_content_type === "pdf" ? "PDF" : "Text"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Submission Type:
                    </span>
                    <Badge variant="secondary" className="font-medium">
                      {task.submission_type === "both"
                        ? "PDF and Text"
                        : task.task_content_type === "pdf"
                        ? "PDF"
                        : "Text"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Content Policy:
                    </span>
                    <Badge variant="secondary" className="font-medium">
                      {task.submission_policy === "single"
                        ? "Single Submission"
                        : "Editable"}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
