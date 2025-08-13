import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function dashboard() {
  const heders = await headers();
  const role = heders.get("x-user-role");
  if (!role) return redirect("/login");
  switch (role) {
    case "teacher":
      return redirect("/students");
    case "assistant":
      return redirect("/students");
    default:
      return redirect(`/${role}/dashboard`);
  }
}
