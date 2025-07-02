"use client";

import { UserRound, Clock, GraduationCap } from "lucide-react";
import StudentsTable from "./table";
import { api } from "@/lib/axiosinterceptor";
import { useEffect, useState } from "react";

export interface Student {
  id: number;
  student_id: string;
  full_name: string;
  phone_number: string;
  parent_number: string;
  gender: string;
  is_approved: boolean;
  user: number;
  teacher: number;
  grade: { id: number; name: "string" };
  center: { id: number; name: "string" };
}

const djangoapi = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;

export interface propstype {
  access: string;
}

export default function Mainpage({ access }: propstype) {
  const [studentsdata, setStudentsdata] = useState<Student[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function fetchStudents() {
      if (!access) return;
      try {
        const res = await api.get(`${djangoapi}accounts/students/`, {
          headers: { Authorization: `Bearer ${access}` },
          signal: controller.signal,
        });

        setStudentsdata(res.data);
      } catch (err) {
        console.error("Failed to fetch students:", err);
        setStudentsdata([]);
      }
    }
    fetchStudents();
    return () => controller.abort();
  }, [access, refreshKey]);

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  return (
    <>
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Student Management
          </h1>
          <p className="text-text-secondary mt-1">
            Manage student accounts, enrollment, and academic records
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div
        className="grid gap-[25px] mb-8"
        style={{
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
        }}>
        <StatCard
          title="Total Students"
          value={studentsdata.length}
          icon={<GraduationCap className="h-5 w-5" />}
          color="bg-primary/50"
        />
        <StatCard
          title="Active Students"
          value={studentsdata.filter((student) => student.is_approved).length}
          icon={<UserRound className="h-5 w-5" />}
          color="bg-success/50"
        />
        <StatCard
          title="Inactive Students"
          value={studentsdata.filter((student) => !student.is_approved).length}
          icon={<Clock className="h-5 w-5" />}
          color="bg-warning/50"
        />
      </div>

      <StudentsTable
        access={access}
        triggerRefresh={triggerRefresh}
        refkey={refreshKey}
      />
    </>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
  isDecimal = false,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  isDecimal?: boolean;
}) {
  return (
    <div className="bg-bg-secondary p-4 rounded-xl border border-border-default hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-text-secondary">{title}</p>
          <p className="text-2xl font-bold mt-1 text-text-primary">
            {isDecimal ? value.toFixed(1) : value}
          </p>
        </div>
        <div
          className={`${color} rounded-full w-10 h-10 flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
