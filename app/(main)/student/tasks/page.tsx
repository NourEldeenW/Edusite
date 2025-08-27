import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import Main from "./_taskscomps/main";

export const metadata: Metadata = {
  title: "EduTrack | Tasks",
  description: "The Tasks' Page to Submit and Review all Tasks for Students.",
};

export default async function page() {
  const headerData = await headers();
  const role = headerData.get("x-user-role");
  if (role != "student") return redirect(`/${role}/dashboard`);
  const acces = headerData.get("access");
  if (!acces) return redirect("/login");

  return (
    <>
      <Main access={acces} />
    </>
  );
}
