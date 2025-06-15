import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import Main from "./_assisstantscomps/main";

export const metadata: Metadata = {
  title: "EduSite | Assistants",
  description:
    "The Assistants' Page to Manage and Controle all Assistants' Accounts and Data.",
};

export default async function page() {
  const headerData = await headers();
  const role = headerData.get("x-user-role");
  if (role != "teacher") return redirect(`/${role}/dashboard`);
  const acces = headerData.get("access");
  if (!acces) redirect("/login");
  return <Main access={acces}></Main>;
}
