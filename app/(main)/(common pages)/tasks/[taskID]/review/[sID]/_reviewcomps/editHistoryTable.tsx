// components/GradeEditHistoryTable.tsx
"use client";

import { formatUserDate } from "@/lib/formatDate";

export interface GradeEditHistory {
  id: number;
  student_name: string;
  old_score: number | null;
  new_score: number | null;
  feedback_changed: boolean;
  edited_by_name: string;
  edit_date: string;
}

interface GradeEditHistoryTableProps {
  data: GradeEditHistory[];
  isLoading?: boolean;
}

export default function GradeEditHistoryTable({
  data,
  isLoading = false,
}: GradeEditHistoryTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-xl font-semibold text-gray-800">
            Grade Edit History
          </h2>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center py-3">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-xl font-semibold text-gray-800">
            Grade Edit History
          </h2>
        </div>
        <div className="p-6 text-center py-12">
          <div className="mx-auto w-24 h-24 mb-4 text-gray-300">
            <svg
              className="w-full h-full"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            No Grade Edits Recorded
          </h3>
          <p className="text-gray-500">
            This submission hasn&apos;t been edited yet. Any changes to scores
            or feedback will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <h2 className="text-xl font-semibold text-gray-800">
          Grade Edit History
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Track all changes made to this submission&apos;s grading
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-3">Student</th>
              <th className="px-6 py-3">Old Score</th>
              <th className="px-6 py-3">New Score</th>
              <th className="px-6 py-3">Feedback Changed</th>
              <th className="px-6 py-3">Edited By</th>
              <th className="px-6 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">
                    {item.student_name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.old_score === null
                        ? "bg-gray-100 text-gray-800"
                        : "bg-blue-100 text-blue-800"
                    }`}>
                    {item.old_score === null ? "Not set" : item.old_score}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.new_score === null
                        ? "bg-gray-100 text-gray-800"
                        : "bg-green-100 text-green-800"
                    }`}>
                    {item.new_score === null ? "Not set" : item.new_score}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.feedback_changed
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                    {item.feedback_changed ? "Yes" : "No"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.edited_by_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatUserDate(item.edit_date)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
