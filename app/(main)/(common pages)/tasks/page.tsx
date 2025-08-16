import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import TasksPage from "./_taskscomps/main";

export const metadata: Metadata = {
  title: "EduTrack | Tasks",
  description:
    "The Tasks' Page to Manage and Controle all Tasks and Assignments for Students.",
};

export default async function page() {
  const headerData = await headers();
  const role = headerData.get("x-user-role");
  if (role != "teacher" && role != "assistant")
    return redirect(`/${role}/dashboard`);
  const acces = headerData.get("access");
  if (!acces) return redirect("/login");

  return <TasksPage access={acces} />;
}
