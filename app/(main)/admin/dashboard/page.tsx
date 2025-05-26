import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import Mainpage from "./_dashcomp/mainpage";

export const metadata: Metadata = {
  title: "EduSite | Admin Dashboard",
  description:
    "The Admin Dashboard to Manage and Controle all Students' and Teachers' Accounts",
};

export default async function dashboard() {
  const headerData = await headers();
  const role = headerData.get("x-user-role");
  if (role != "admin") return redirect(`/${role}/dashboard`);
  const acces = headerData.get("access");
  if (!acces) redirect("/login");
  const acc_name = headerData.get("username");

  return <Mainpage acc_name={acc_name} access={acces} />;
}
