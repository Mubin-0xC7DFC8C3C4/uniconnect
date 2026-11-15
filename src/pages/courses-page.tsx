import { useEffect, useMemo, useState } from "react";
import { courses, DAY_NAMES, sessions } from "@/data/demo";
import { formatRange } from "@/data/schedule";
import { PageHeader } from "@/components/page-header";
import { TextInput } from "@/components/ui/field";
import { cn } from "@/lib/cn";

export function CoursesPage({ initialCourseId }: { initialCourseId?: string }) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(initialCourseId ?? courses[0]?.id ?? "");

  useEffect(() => {
    if (initialCourseId && courses.some((course) => course.id === initialCourseId)) {
      setSelectedId(initialCourseId);
    }
  }, [initialCourseId]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return courses;
    return courses.filter((course) =>
      `${course.code} ${course.title} ${course.instructor}`.toLowerCase().includes(needle),
    );
  }, [query]);

  const selected = courses.find((course) => course.id === selectedId) ?? filtered[0] ?? null;
  const meetings = selected ? sessions.filter((session) => session.courseId === selected.id) : [];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        kicker="Academic Catalog"
        title="Courses"
        lede="Review active semester syllabi, faculty assignments, credit weighting, and weekly lecture schedules."
      />
      <div className="grid items-start gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <div>
          <label htmlFor="course-search" className="type-label">
            Filter
          </label>
          <TextInput
            id="course-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Code, title, or instructor"
            className="mt-2"
          />
          <ul className="mt-4 border-t border-line" role="listbox" aria-label="Courses">
            {filtered.length === 0 ? (
              <li className="py-4 type-sm text-muted">No courses match your filter.</li>
            ) : (
              filtered.map((course) => {
                const active = selected?.id === course.id;
                return (
                  <li key={course.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => setSelectedId(course.id)}
                      className={cn(
                        "flex min-h-11 w-full flex-col items-start border-b border-line py-3 text-left",
                        active ? "text-fg" : "text-muted hover:text-fg",
                      )}
                    >
                      <span className="type-sm font-medium">{course.title}</span>
                      <span className="type-xs">{course.code}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
        {selected ? (
          <article>
            <p className="type-label">{selected.code}</p>
            <h2 className="mt-2 type-xl text-fg">{selected.title}</h2>
            <dl className="mt-6 grid gap-px bg-line sm:grid-cols-2">
              <Meta label="Credits" value={String(selected.credits)} />
              <Meta label="Section" value={selected.section} />
              <Meta label="Instructor" value={selected.instructor} />
              <Meta label="Format" value={selected.type} />
            </dl>
            <h3 className="mt-8 type-lg text-fg">Meetings</h3>
            <ul className="mt-3 divide-y divide-line border-y border-line">
              {meetings.map((session) => (
                <li key={session.id} className="py-3 type-sm">
                  <p className="font-medium text-fg">
                    {DAY_NAMES[session.day]} · {formatRange(session.start, session.end)}
                  </p>
                  <p className="text-muted">
                    {session.kind} · {session.room}
                    {session.status === "cancelled"
                      ? " · Cancelled for this week"
                      : session.status === "rescheduled"
                        ? " · Rescheduled for this week"
                        : ""}
                  </p>
                </li>
              ))}
            </ul>
            <h3 className="mt-8 type-lg text-fg">Outline</h3>
            <ol className="mt-3 list-decimal space-y-2 pl-5 type-sm text-muted">
              {selected.outline.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
            <h3 className="mt-8 type-lg text-fg">Assessment</h3>
            <p className="mt-2 type-sm text-muted">Evaluation breakdown and syllabus component weighting.</p>
            <ul className="mt-4 flex flex-col gap-3">
              {selected.assessment.map((item) => (
                <li key={item.label}>
                  <div className="flex justify-between type-sm">
                    <span>{item.label}</span>
                    <span className="tabular-nums text-muted">{item.weight}%</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-sunken">
                    <div className="h-full bg-fg" style={{ width: `${item.weight}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </article>
        ) : null}
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-bg px-4 py-4">
      <dt className="type-label">{label}</dt>
      <dd className="mt-2 type-sm font-medium text-fg">{value}</dd>
    </div>
  );
}
