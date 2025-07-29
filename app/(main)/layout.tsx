import Navbar from "./navbar";
import { headers } from "next/headers";
import Studentsicon from "@/public/customicons/studentico";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGraduationCap,
  faUserShield,
  faBook,
  faSchoolCircleCheck,
  faBuildingUser,
  faFilePen,
} from "@fortawesome/free-solid-svg-icons";

import { LayoutDashboard } from "lucide-react";

const links = {
  admin: [
    {
      href: "/admin/dashboard",
      key: "dashboard",
      name: "Dashboard",
      icon: (
        <LayoutDashboard
          color="#ffff"
          className="w-[22px] h-[22px]"
          strokeWidth={2}
        />
      ),
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
      icon: (
        <LayoutDashboard
          color="#ffff"
          className="w-[22px] h-[22px]"
          strokeWidth={2}
          fill="#ffff"
        />
      ),
    },
    {
      href: "/students",
      key: "students",
      name: "Students",
      icon: (
        <FontAwesomeIcon
          icon={faGraduationCap}
          color="#ffff"
          className="w-[22px] h-[22px]"
        />
      ),
    },
    {
      href: "/teacher/assistants",
      key: "assistants",
      name: "Assistants",
      icon: (
        <FontAwesomeIcon
          icon={faUserShield}
          color="#ffff"
          className="w-[22px] h-[22px]"
        />
      ),
    },
    {
      href: "/studymaterials",
      key: "studymaterials",
      name: "Study Materials",
      icon: (
        <FontAwesomeIcon
          icon={faBook}
          color="#ffff"
          className="w-[22px] h-[22px]"
        />
      ),
    },
    {
      href: "/attendance",
      key: "attendance",
      name: "Attendance",
      icon: (
        <FontAwesomeIcon
          icon={faSchoolCircleCheck}
          color="#ffff"
          className="w-[22px] h-[22px]"
        />
      ),
    },
    {
      href: "/sessions",
      key: "sessions",
      name: "Sessions",
      icon: (
        <FontAwesomeIcon
          icon={faBuildingUser}
          color="#ffff"
          className="w-[22px] h-[22px]"
        />
      ),
    },
    {
      href: "/quizzes",
      key: "quizzes",
      name: "Online Quizzes",
      icon: (
        <FontAwesomeIcon
          icon={faFilePen}
          color="#ffff"
          className="w-[22px] h-[22px]"
        />
      ),
    },
  ],
  assistant: [
    {
      href: "/students",
      key: "students",
      name: "Students",
      icon: (
        <FontAwesomeIcon
          icon={faGraduationCap}
          color="#ffff"
          className="w-[22px] h-[22px]"
        />
      ),
    },
    {
      href: "/studymaterials",
      key: "studymaterials",
      name: "Study Materials",
      icon: (
        <FontAwesomeIcon
          icon={faBook}
          color="#ffff"
          className="w-[22px] h-[22px]"
        />
      ),
    },
    {
      href: "/attendance",
      key: "attendance",
      name: "Attendance",
      icon: (
        <FontAwesomeIcon
          icon={faSchoolCircleCheck}
          color="#ffff"
          className="w-[22px] h-[22px]"
        />
      ),
    },
    {
      href: "/sessions",
      key: "sessions",
      name: "Sessions",
      icon: (
        <FontAwesomeIcon
          icon={faBuildingUser}
          color="#ffff"
          className="w-[22px] h-[22px]"
        />
      ),
    },
    {
      href: "/quizzes",
      key: "quizzes",
      name: "Online Quizzes",
      icon: (
        <FontAwesomeIcon
          icon={faFilePen}
          color="#ffff"
          className="w-[22px] h-[22px]"
        />
      ),
    },
  ],
  student: [
    {
      href: "/student/dashboard",
      key: "dashboard",
      name: "Dashboard",
      icon: (
        <LayoutDashboard
          color="#ffff"
          className="w-[22px] h-[22px]"
          strokeWidth={2}
          fill="#ffff"
        />
      ),
    },
    {
      href: "/student/studymaterials",
      key: "studymaterials",
      name: "Study Materials",
      icon: (
        <FontAwesomeIcon
          icon={faBook}
          color="#ffff"
          className="w-[22px] h-[22px]"
        />
      ),
    },
  ],
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
