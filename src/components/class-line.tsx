import { courseOf, formatRange, classPhase, type ScheduledClass } from "@/data/schedule";
import { cn } from "@/lib/cn";

export function ClassLine({ item, now, compact = false }: { item: ScheduledClass; now: Date; compact?: boolean }) {
  const course = courseOf(item);
  if (!course) return null;
  const phase = classPhase(item, now);
  const cancelled = item.status === "cancelled";
  return (
    <article className={compact ? "" : "border-b border-line py-4"}>
      <p className="type-xs text-faint tabular-nums">{formatRange(item.session.start, item.session.end)}</p>
      <h3 className={cn("mt-1 type-sm font-medium text-fg", cancelled && "text-muted line-through")}>
        {course.title}
      </h3>
      <p className="mt-1 type-sm text-muted">
        {course.code} · {item.session.kind}
      </p>
      <p className="type-sm text-muted">
        {item.session.room} · {course.instructor}
      </p>
      <p className={cn("mt-2 type-xs font-medium", cancelled ? "text-danger" : "text-fg")}>
        {item.status === "rescheduled" ? "Rescheduled" : phase}
      </p>
      {item.session.note ? <p className="mt-1 type-sm text-muted">{item.session.note}</p> : null}
    </article>
  );
}
