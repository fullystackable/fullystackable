const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const WEEKDAY_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return startOfDay(nextDate);
}

export function toISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function parseISODate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function compareDateStrings(left: string, right: string) {
  return parseISODate(left).getTime() - parseISODate(right).getTime();
}

export function differenceInCalendarDays(
  value: string,
  baseDate: Date = new Date(),
) {
  const currentDate = startOfDay(baseDate);
  const targetDate = parseISODate(value);

  return Math.round(
    (targetDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24),
  );
}

export function formatShortDate(value: string) {
  return SHORT_DATE_FORMATTER.format(parseISODate(value));
}

export function formatWeekdayDate(value: string) {
  return WEEKDAY_DATE_FORMATTER.format(parseISODate(value));
}

export function getRelativeDateLabel(
  value: string,
  baseDate: Date = new Date(),
) {
  const daysUntil = differenceInCalendarDays(value, baseDate);

  if (daysUntil < 0) {
    return `Overdue ${Math.abs(daysUntil)}d`;
  }

  if (daysUntil === 0) {
    return "Today";
  }

  if (daysUntil === 1) {
    return "Tomorrow";
  }

  return `In ${daysUntil}d`;
}

export function getTaskDueDateLabel(
  value: string | null,
  baseDate: Date = new Date(),
) {
  if (!value) {
    return "No due date";
  }

  const daysUntil = differenceInCalendarDays(value, baseDate);

  if (daysUntil < 0) {
    return "Overdue";
  }

  if (daysUntil === 0) {
    return "Due today";
  }

  if (daysUntil <= 7) {
    return "Due this week";
  }

  return "Upcoming";
}
