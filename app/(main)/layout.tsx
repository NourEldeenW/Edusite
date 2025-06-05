import { LayoutDashboard, UsersRound } from "lucide-react";
import Navbar from "./navbar";
import { headers } from "next/headers";
import Studentsicon from "@/public/customicons/studentico";

const links = {
  admin: [
    {
      href: "/admin/dashboard",
      key: "dashboard",
      name: "Dashboard",
      icon: <LayoutDashboard size={22} color="#ffff" strokeWidth={2} />,
    },
    {
      href: "/admin/students",
      key: "students",
      name: "Students",
      icon: <Studentsicon size={22} color="#ffff" strokeWidth={2} />,
    },
  ],
  teacher: [
    {
      href: "/teacher/dashboard",
      key: "dashboard",
      name: "Dashboard",
      icon: <LayoutDashboard size={22} color="#ffff" strokeWidth={2} />,
    },
    {
      href: "/students",
      key: "students",
      name: "Students",
      icon: <UsersRound size={22} color="#ffff" strokeWidth={2} />,
    },
  ],
  assistant: [],
  student: [],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headers_data = await headers();
  const role =
    (headers_data.get("x-user-role") as keyof typeof links) || "student";

  return (
    <div className="grid grid-cols-1 grid-rows-[auto_1fr] sm:grid-cols-[auto_1fr] sm:grid-rows-1 min-h-[100dvh]">
      <Navbar links={links[role]} />
      <main className="p-6 bg-bg-base sm:col-start-2">{children}</main>
    </div>
  );
}
