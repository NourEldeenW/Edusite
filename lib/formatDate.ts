import { format } from "date-fns";

export function formatUserDate(
  dateString: string,
  includeTime: boolean = true,
  includeYear: boolean = true
) {
  const date = new Date(dateString);

  if (includeTime && includeYear) {
    return format(date, "MMMM d, yyyy h:mm a");
  } else if (includeYear) {
    return format(date, "MMMM d, yyyy");
  } else if (includeTime) {
    return format(date, "MMMM d h:mm a");
  } else {
    return format(date, "MMMM d");
  }
}
