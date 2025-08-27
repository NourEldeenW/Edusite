"use client";

import { api, djangoApi } from "@/lib/axiosinterceptor";
import useTaskStore from "@/lib/stores/tasksStores/initData";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import TDashboard from "./tDashboard";
import TDashboardSkeleton from "./_tDashboardcomps/dashSkeleton";
import TSubmissions from "./tSubmissions";

interface props {
  access: string;
}

export default function TasksPage({ access }: props) {
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const { setAllTasks, setAvailGrades, setAvailCenters } = useTaskStore();
  useEffect(() => {
    if (!access) return;
    const fetchData = async () => {
      try {
        const [grades_res, centers_res, tasks_res] = await Promise.all([
          api.get(`${djangoApi}accounts/grades/`, {
            headers: { Authorization: `Bearer ${access}` },
          }),
          api.get(`${djangoApi}accounts/centers/`, {
            headers: { Authorization: `Bearer ${access}` },
          }),
          api.get(`${djangoApi}task/tasks/`, {
            headers: { Authorization: `Bearer ${access}` },
          }),
        ]);

        setAllTasks(tasks_res.data);
        setAvailGrades(grades_res.data);
        setAvailCenters(centers_res.data);
        setLoading(false);
      } catch {}
    };
    fetchData();
  }, [access, setAllTasks, setAvailCenters, setAvailGrades]);

  const view = searchParams?.get("view") ?? "dashboard";

  // Render based on current view
  if (view === "submissions") {
    return <TSubmissions access={access} />;
  }

  if (loading) return <TDashboardSkeleton />;
  return <TDashboard access={access} />;
}
