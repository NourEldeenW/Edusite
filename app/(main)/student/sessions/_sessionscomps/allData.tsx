"use client";

import React, { useMemo, useState } from "react";
import StatCard from "@/app/(main)/(common pages)/students/_students comps/cards";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useAllSessions_Stu from "@/lib/stores/student/sessions/allSessions";
import {
  faCalendarCheck,
  faCheckCircle,
  faStar,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Badge } from "@/components/ui/badge";
import {
  User,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  Search,
  Filter,
  X,
  ChevronDown,
} from "lucide-react";

/** ----- Types ----- **/
type AttendanceStatus = "Present" | "Absent" | string;

interface Homework {
  completed: boolean;
}

interface TestScore {
  score: number;
  max_score: number;
  percentage: number;
  notes: string;
}

export interface SessionType {
  id: number;
  date: string;
  title: string;
  notes?: string | null;
  center_name: string;
  center_id?: number | string;
  attendance_status: AttendanceStatus;
  has_homework?: boolean;
  homework?: Homework;
  has_test?: boolean;
  test_score?: TestScore;
  test_max_score?: number | string | null;
}

/** typed shape for the store's allData (adjust as needed) */
interface AllDataShape {
  stats: {
    total_sessions_number: number;
    total_sessions_attended: number;
    total_absent: number;
    average_attendance: string | number;
  };
  sessions: SessionType[];
}

export default function AllData() {
  const allData = useAllSessions_Stu(
    (state) => state.allData
  ) as AllDataShape | null;

  // UI state
  const [query, setQuery] = useState("");
  const [centerFilter, setCenterFilter] = useState<string | number | "all">(
    "all"
  );
  const [statusFilter, setStatusFilter] = useState<
    "all" | "attended" | "absent"
  >("all");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Work on a safe array even if allData is null
  const sessionsSafe = useMemo<SessionType[]>(
    () => allData?.sessions ?? [],
    [allData]
  );

  // Helper: formatted centers (unique)
  const centers = useMemo(() => {
    const map = new Map<string | number, string>();
    sessionsSafe.forEach((s) => {
      const id = s.center_id ?? s.center_name;
      if (s.center_name) map.set(id, s.center_name);
    });
    return [
      { id: "all", name: "All Centers" },
      ...Array.from(map, ([id, name]) => ({ id, name })),
    ];
  }, [sessionsSafe]);

  // Filtered sessions (search + filters)
  const filteredSessions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sessionsSafe.filter((s) => {
      if (
        centerFilter !== "all" &&
        String(s.center_id ?? s.center_name) !== String(centerFilter)
      )
        return false;
      if (statusFilter === "attended" && s.attendance_status !== "present")
        return false;
      if (statusFilter === "absent" && s.attendance_status === "present")
        return false;

      if (!q) return true;
      return [s.title, s.notes, s.center_name, s.date]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q));
    });
  }, [sessionsSafe, query, centerFilter, statusFilter]);

  // Reset all filters
  const resetFilters = () => {
    setQuery("");
    setCenterFilter("all");
    setStatusFilter("all");
    setMobileFiltersOpen(false);
  };

  // Loading state
  if (!allData) {
    return null;
  }

  return (
    <>
      <div className="space-y-1 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 sm:text-3xl">
          Learning Sessions
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 sm:text-base">
          View your attendance, homework status, and test scores
        </p>
      </div>

      {/* Stats */}
      <div
        className="grid gap-5 mb-8"
        style={{
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
        }}>
        <StatCard
          value={allData.stats.total_sessions_number}
          title="Total Sessions"
          icon={
            <FontAwesomeIcon icon={faCalendarCheck} className="text-blue-600" />
          }
          iconContainerClass="bg-blue-100 dark:bg-blue-900/30"
          valueClass="text-blue-700 dark:text-blue-300"
        />
        <StatCard
          value={allData.stats.total_sessions_attended}
          title="Total Attended"
          icon={
            <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
          }
          iconContainerClass="bg-green-100 dark:bg-green-900/30"
          valueClass="text-green-700 dark:text-green-300"
        />
        <StatCard
          value={allData.stats.total_absent}
          title="Total Absent"
          icon={
            <FontAwesomeIcon icon={faTimesCircle} className="text-rose-600" />
          }
          iconContainerClass="bg-rose-100 dark:bg-rose-900/30"
          valueClass="text-rose-700 dark:text-rose-300"
        />
        <StatCard
          value={allData.stats.average_attendance}
          title="Average Attendance"
          icon={<FontAwesomeIcon icon={faStar} className="text-yellow-600" />}
          iconContainerClass="bg-yellow-100 dark:bg-yellow-900/30"
          valueClass="text-yellow-700 dark:text-yellow-300"
        />
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <div className="relative w-full sm:w-[320px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2">
              <Search className="w-4 h-4 text-gray-400" />
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sessions, notes, center..."
              className="pl-10 pr-3 h-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <div className="relative">
              <select
                value={String(centerFilter)}
                onChange={(e) =>
                  setCenterFilter(
                    e.target.value === "all" ? "all" : e.target.value
                  )
                }
                className="h-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 pr-8 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none transition-all">
                {centers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as "all" | "attended" | "absent"
                  )
                }
                className="h-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 pr-8 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none transition-all">
                <option value="all">All Statuses</option>
                <option value="attended">Attended</option>
                <option value="absent">Absent</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Mobile filter button */}
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="sm:hidden flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm shadow-sm">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetFilters}
            className="h-10 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            Reset
          </button>
        </div>
      </div>

      {/* Mobile filters */}
      {mobileFiltersOpen && (
        <div className="sm:hidden bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-800 dark:text-gray-200">
              Filters
            </h3>
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Center
            </label>
            <select
              value={String(centerFilter)}
              onChange={(e) =>
                setCenterFilter(
                  e.target.value === "all" ? "all" : e.target.value
                )
              }
              className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              {centers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | "attended" | "absent")
              }
              className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="all">All Statuses</option>
              <option value="attended">Attended</option>
              <option value="absent">Absent</option>
            </select>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[700px] sm:min-w-full">
            <TableHeader className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6 py-4 text-gray-600 dark:text-gray-300 font-medium">
                  Date
                </TableHead>
                <TableHead className="py-4 text-gray-600 dark:text-gray-300 font-medium">
                  Session
                </TableHead>
                <TableHead className="py-4 text-gray-600 dark:text-gray-300 font-medium">
                  Center
                </TableHead>
                <TableHead className="py-4 text-gray-600 dark:text-gray-300 font-medium">
                  Attendance
                </TableHead>
                <TableHead className="py-4 text-gray-600 dark:text-gray-300 font-medium">
                  Homework
                </TableHead>
                <TableHead className="py-4 text-gray-600 dark:text-gray-300 font-medium">
                  Test Score
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-16 text-center bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
                      <div className="mb-4 bg-gray-100 dark:bg-gray-700 rounded-full p-4">
                        <User className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                        No Sessions Found
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Try adjusting your search or filters.
                      </p>
                      <button
                        onClick={resetFilters}
                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">
                        Reset Filters
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSessions.map((session) => (
                  <TableRow
                    key={session.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <TableCell className="pl-6 w-[170px] font-medium text-gray-800 dark:text-gray-200">
                      {session.date}
                    </TableCell>

                    <TableCell className="max-w-[320px]">
                      <div className="flex flex-col">
                        <p className="font-medium text-gray-800 dark:text-gray-200 truncate">
                          {session.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                          {session.notes || "No notes"}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="text-gray-700 dark:text-gray-300">
                      {session.center_name}
                    </TableCell>

                    <TableCell>
                      {session.attendance_status === "Present" ? (
                        <Badge className="bg-green-100 hover:bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full">
                          <CheckCircleIcon className="w-4 h-4 mr-1.5" />
                          Attended
                        </Badge>
                      ) : (
                        <Badge className="bg-rose-100 hover:bg-rose-100 dark:bg-rose-900/30 dark:hover:bg-rose-900/30 text-rose-800 dark:text-rose-300 px-3 py-1 rounded-full">
                          <XCircleIcon className="w-4 h-4 mr-1.5" />
                          Absent
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      {session.has_homework ? (
                        session.homework?.completed ? (
                          <Badge className="bg-green-100 hover:bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full">
                            <CheckCircleIcon className="w-4 h-4 mr-1.5" /> Done
                          </Badge>
                        ) : (
                          <Badge className="bg-rose-100 hover:bg-rose-100 dark:bg-rose-900/30 dark:hover:bg-rose-900/30 text-rose-800 dark:text-rose-300 px-3 py-1 rounded-full">
                            <XCircleIcon className="w-4 h-4 mr-1.5" /> Not Done
                          </Badge>
                        )
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          No Homework
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      {session.has_test ? (
                        session.attendance_status === "Present" ? (
                          // only show the progress UI when we actually have a test_score object
                          session.test_score ? (
                            <div className="flex items-center">
                              <div className=" mr-3">
                                ({session.test_score.percentage}
                                {" %"})
                              </div>
                              <span className="font-medium text-gray-800 dark:text-gray-200">
                                {session.test_score.score} /{" "}
                                {session.test_score.max_score}
                              </span>
                            </div>
                          ) : (
                            // clean fallback when there's a test but no grade yet
                            <span className="text-gray-500 text-sm">
                              {session.test_max_score
                                ? `- / ${session.test_max_score}`
                                : "-"}
                            </span>
                          )
                        ) : (
                          <span className="text-gray-500 text-sm">-</span>
                        )
                      ) : (
                        <span className="text-gray-500 text-sm">No Test</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
