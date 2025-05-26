import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function dashboard() {
  const heders = await headers();
  const role = heders.get("x-user-role");
  console.log(role);
  return redirect(`${role}/dashboard`);
}
