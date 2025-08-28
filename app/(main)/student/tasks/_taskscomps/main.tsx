"use client";

import { api } from "@/lib/axiosinterceptor";
import useTasksStu from "@/lib/stores/student/tasks/tasks";
import { useEffect, useState } from "react";
import TDashboard from "./tDashboard";
import TSkeletonLoader from "./tSkeletonLoader";

export default function Main({ access }: { access: string }) {
  const [loading, setLoading] = useState(true);
  const setTasks = useTasksStu((state) => state.setTasks);

  useEffect(() => {
    if (!access) return;
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const res = await api.get(
          `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}task/tasks/`,
          {
            headers: { Authorization: `Bearer ${access}` },
          }
        );
        setTasks(res.data);
      } catch {
        console.error("Error fetching tasks");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [access, setTasks]);

  if (loading) return <TSkeletonLoader />;

  return (
    <>
      <TDashboard />
    </>
  );
}
