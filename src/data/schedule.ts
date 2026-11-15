import { courseById, sessions, DAY_NAMES, type ClassSession, type SessionStatus } from "@/data/demo";

export { DAY_NAMES };

export type ScheduledClass = {
  session: ClassSession;
  status: SessionStatus;
  start: Date;
  end: Date;
  weekOffset: number;
};

function at(sunday: Date, dayIndex: number, time: string) {
  const [hour, minute] = time.split(":").map(Number);
  const date = new Date(sunday);
  date.setDate(sunday.getDate() + dayIndex);
  date.setHours(hour, minute, 0, 0);
  return date;
}

export function sundayOf(date: Date, weekOffset = 0) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() - next.getDay() + weekOffset * 7);
  return next;
}

export function classesForWeek(now: Date, weekOffset: number): ScheduledClass[] {
  const sunday = sundayOf(now, weekOffset);
  return sessions.map((session) => {
    const status: SessionStatus = weekOffset === 0 ? (session.status ?? "scheduled") : "scheduled";
    return {
      session: weekOffset === 0 ? session : { ...session, status: "scheduled", note: undefined },
      status,
      start: at(sunday, session.day, session.start),
      end: at(sunday, session.day, session.end),
      weekOffset,
    };
  });
}

export function todayClasses(now: Date) {
  return classesForWeek(now, 0).filter((item) => item.start.toDateString() === now.toDateString());
}

export function upcomingClasses(now: Date, limit = 4): ScheduledClass[] {
  const found: ScheduledClass[] = [];
  for (let week = 0; week < 4 && found.length < limit; week += 1) {
    for (const item of classesForWeek(now, week)) {
      if (item.status === "cancelled") continue;
      if (item.end.getTime() <= now.getTime()) continue;
      found.push(item);
      if (found.length >= limit) break;
    }
  }
  return found;
}

export function classPhase(item: ScheduledClass, now: Date) {
  if (item.status === "cancelled") return "Cancelled";
  if (now.getTime() >= item.start.getTime() && now.getTime() < item.end.getTime()) return "In progress";
  if (item.start.getTime() > now.getTime()) return "Upcoming";
  return "Ended";
}

export function courseOf(item: ScheduledClass) {
  return courseById[item.session.courseId];
}

export function formatClock(hhmm: string) {
  const [hourText, minute] = hhmm.split(":");
  let hour = Number(hourText);
  const suffix = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${suffix}`;
}

export function formatRange(start: string, end: string) {
  const startLabel = formatClock(start);
  const endLabel = formatClock(end);
  if (startLabel.slice(-2) === endLabel.slice(-2)) {
    return `${startLabel.slice(0, -3)}–${endLabel}`;
  }
  return `${startLabel} – ${endLabel}`;
}

export function weekRangeLabel(sunday: Date) {
  const end = new Date(sunday);
  end.setDate(sunday.getDate() + 4);
  const sameMonth = sunday.getMonth() === end.getMonth();
  const startText = sameMonth
    ? sunday.toLocaleDateString("en-GB", { day: "numeric" })
    : sunday.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const endText = end.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return `${startText} – ${endText}`;
}
