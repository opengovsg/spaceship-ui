import { format as formatDateFns, isAfter } from "date-fns";
import {
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  isSameDay,
  isSameWeek,
} from "date-fns";

type RelativeDateProps = {
  /** The date to display, as a Date object or an ISO string. */
  date: Date | string;
  /** Optional format string for displaying the date (e.g., "dd MMM yyyy, h:mma"). */
  format?: string;
  /** Whether a relative date should always be shown even if the date is older than the current week. */
  forceRelativeDate?: boolean;
};

export function getRelativeDateString(
  date: Date,
  now: Date,
  forceRelativeDate?: boolean,
) {
  if (isAfter(date, now)) {
    // Only show relative date for past dates
    return null;
  }

  const diffMinutes = differenceInMinutes(now, date);
  const diffHours = differenceInHours(now, date);
  const diffDays = differenceInDays(now, date);

  if (diffMinutes < 60) {
    return `${diffMinutes <= 0 ? 1 : diffMinutes}m ago`;
  }
  if (isSameDay(now, date) || diffDays < 1) {
    return `${diffHours}h ago`;
  }
  if (isSameWeek(now, date) || forceRelativeDate) {
    return `${diffDays}d ago`;
  }
  return null;
}

export const RelativeDate: React.FC<RelativeDateProps> = ({
  date,
  format,
  forceRelativeDate,
}) => {
  const parsedDate = typeof date === "string" ? new Date(date) : date;
  const now = new Date();

  let display = getRelativeDateString(parsedDate, now, forceRelativeDate);
  if (!display) {
    display = formatDateFns(parsedDate, format ?? "dd MMM yyyy, h:mma");
  }

  return <span>{display}</span>;
};
