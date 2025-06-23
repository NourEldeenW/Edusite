import { format } from "date-fns";

export function formatUserDate(dateString: string) {
  const date = new Date(dateString);
  return format(date, "MMMM d, yyyy h:mm a");
}
