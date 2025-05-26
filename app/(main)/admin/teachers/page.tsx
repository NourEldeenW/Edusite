import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function teachers() {
  const headerData = await headers();
  const role = headerData.get("x-user-role");
  if (role != "admin") return redirect(`/${role}/dashboard`);
  return <h1>here u can manage all teachers</h1>;
}
