// app/(teacher)/studymaterials/page.tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import Main from "./_studymatcomp/main";

export const metadata: Metadata = {
  title: "EduSite | Study Materials",
  description:
    "This page is for teachers and assistants to upload and manage study materials for their students.",
};

export default async function page() {
  const headerData = await headers();
  const role = headerData.get("x-user-role");
  if (role !== "teacher" && role !== "assistant")
    return redirect(`/${role}/dashboard`);

  const access = headerData.get("access");
  if (!access) redirect("/login");

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
          Study Materials Management
        </h1>
        <p className="text-sm sm:text-base text-text-secondary mt-1">
          Organize and manage your teaching materials
        </p>
      </div>

      <Main access={access} />
    </>
  );
}
