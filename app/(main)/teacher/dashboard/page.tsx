import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "EduSite | Students",
  description:
    "The Students' Page to Manage and Controle all Students' Accounts and Data.",
};

export default async function page() {
  const headerData = await headers();
  const role = headerData.get("x-user-role");
  if (role != "teacher" && role != "assistant")
    return redirect(`/${role}/dashboard`);
  const acces = headerData.get("access");
  if (!acces) redirect("/login");
  const acc_name = headerData.get("username");

  return <h1>Hello {acc_name}, welcome to your dashboard</h1>;
}
