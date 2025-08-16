"use client";

import { api, djangoApi } from "@/lib/axiosinterceptor";
import useTaskStore from "@/lib/stores/tasksStores/initData";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import TDashboard from "./tDashboard";

interface props {
  access: string;
}

export default function TasksPage({ access }: props) {
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
      } catch {}
    };
    fetchData();
  }, [access, setAllTasks, setAvailCenters, setAvailGrades]);

  const view = searchParams?.get("view") ?? "dashboard";

  switch (view) {
    case "dashboard":
      return <TDashboard />;
    default:
      return <TDashboard />;
  }
}
