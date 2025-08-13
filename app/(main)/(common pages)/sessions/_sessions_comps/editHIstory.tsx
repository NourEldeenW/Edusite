import { api } from "@/lib/axiosinterceptor";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { formatUserDate } from "@/lib/formatDate";

interface record {
  id: number;
  student_name: string;
  session_title: string;
  old_score: number;
  new_score: number;
  edited_by: string;
  edit_date: string;
}

const django = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;

export default function EditHis({
  access,
  sID,
  refCount,
}: {
  access: string;
  sID: number;
  refCount: number;
}) {
  const [allRecords, setAllRecords] = useState<record[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!access || !sID) return;

    const fetchRecords = async () => {
      try {
        setLoading(true);
        const res = await api.get(
          `${django}session/sessions/${sID}/scores/history/`
        );
        if (res.status !== 200) return;
        setAllRecords(res.data);
      } catch (error) {
        console.error("Error fetching edit history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [access, sID, refCount]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-border-default p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4">Edit History</h2>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3 border-b border-border-default">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-4 w-16 rounded-md" />
              <Skeleton className="h-4 w-16 rounded-md" />
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-4 w-24 rounded-md" />
            </div>
          ))}
        </div>
      ) : allRecords.length === 0 ? (
        <div className="py-8 text-center">
          <AlertCircle className="w-10 h-10 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500">No edit history available</p>
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10">
              <tr className="border-b border-border-default dark:border-gray-700">
                <th className="text-left py-3 px-6 font-semibold">Student</th>
                <th className="text-left py-3 px-2 font-semibold">Old Score</th>
                <th className="text-left py-3 px-2 font-semibold">New Score</th>
                <th className="text-left py-3 px-6 font-semibold">Edited By</th>
                <th className="text-left py-3 px-4 font-semibold">Edit Date</th>
              </tr>
            </thead>
            <tbody>
              {allRecords.map((record) => (
                <tr
                  key={record.id}
                  className="border-b border-border-default dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-4 px-6 font-medium">
                    {record.student_name}
                  </td>
                  <td className="py-4 px-6">{record.old_score}</td>
                  <td className="py-4 px-6">{record.new_score}</td>
                  <td className="py-4 px-6">{record.edited_by}</td>
                  <td className="py-4 px-6 text-gray-500">
                    {formatUserDate(record.edit_date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
