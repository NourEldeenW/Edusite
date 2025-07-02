import { format } from "date-fns";

export function formatUserDate(
  dateString: string,
  includeTime: boolean = true
) {
  const date = new Date(dateString);

  if (includeTime) {
    return format(date, "MMMM d, yyyy h:mm a");
  } else {
    return format(date, "MMMM d, yyyy");
  }
}
