"use client";
import axios, { AxiosResponse } from "axios";
import { UserRound, UsersRound, Clock } from "lucide-react";
import Table from "./table";
import { AddTeacherButton } from "./addtechbutton";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/next";

const djangoapi = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;

interface proptype {
  access: string | null;
  acc_name: string | null;
}

export default function Mainpage({ access, acc_name }: proptype) {
  const [res, setRes] = useState<AxiosResponse>();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function getdata() {
      try {
        const res = await axios.get(`${djangoapi}accounts/dashboard/admin/`, {
          headers: { Authorization: `Bearer ${access}` },
          signal: controller.signal,
        });
        return res;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) redirect("/admin/dashboard");
          if (err.name === "CanceledError") return;
        }
      }
    }

    async function fetchData() {
      const result = await getdata();
      if (result) {
        setRes(result);
      }
    }

    fetchData();
    return () => controller.abort();
  }, [access, refreshKey]);

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  return (
    <>
      {/* headings */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-text-primary animate-slide-in">
            Welcome, Admin {acc_name}
          </h2>
          <p className="text-text-secondary mt-1 transition-opacity hover:opacity-80">
            Manage all teachers and their students
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <AddTeacherButton accesss={access} triggerRefresh={triggerRefresh} />
        </div>
      </div>

      {/* cards */}
      <div
        className="grid gap-[25px] mb-8"
        style={{
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
        }}>
        {/* card 1 */}
        <div
          className="bg-bg-secondary p-6 rounded-xl shadow-sm border border-border-default 
                      hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-text-secondary text-nowrap">Total Teachers</p>
              <p className="text-2xl font-bold mt-2 text-text-primary">
                {res?.data["teachers_count"]}
              </p>
            </div>
            <div
              className="rounded-full bg-primary/50 flex items-center justify-center w-10 h-10
                          group-hover:bg-primary/60 transition-colors duration-300 shadow-sm">
              <UserRound
                className="text-white group-hover:scale-110 transition-transform"
                strokeWidth={2}
              />
            </div>
          </div>
        </div>

        {/* card 2 */}
        <div
          className="bg-bg-secondary p-6 rounded-xl shadow-sm border border-border-default 
                      hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-text-secondary text-nowrap">Active Students</p>
              <p className="text-2xl font-bold mt-2 text-text-primary">
                {res?.data["total_active_students"]}
              </p>
            </div>
            <div
              className="rounded-full bg-success/50 flex items-center justify-center w-10 h-10
                          group-hover:bg-success/60 transition-colors duration-300 shadow-sm">
              <UsersRound
                className="text-white group-hover:scale-110 transition-transform"
                strokeWidth={2}
              />
            </div>
          </div>
        </div>

        {/* card 3 */}
        <div
          className="bg-bg-secondary p-6 rounded-xl shadow-sm border border-border-default 
                      hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-text-secondary text-nowrap">
                Inactive Students
              </p>
              <p className="text-2xl font-bold mt-2 text-text-primary">
                {res?.data["total_inactive_students"]}
              </p>
            </div>
            <div
              className="rounded-full bg-warning/40 flex items-center justify-center w-10 h-10
                          group-hover:bg-warning/50 transition-colors duration-300 shadow-sm">
              <Clock
                className="text-white group-hover:scale-110 transition-transform"
                strokeWidth={2}
              />
            </div>
          </div>
        </div>
      </div>
      <Table
        teachers={res?.data["teachers"] || []}
        triggerRefresh={triggerRefresh}
        access={access}
      />

      <Analytics />
    </>
  );
}
