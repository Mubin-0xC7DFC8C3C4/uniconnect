import { useState } from "react";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  Download,
  Printer,
  Sparkles,
} from "lucide-react";
import { CURRENT_SEMESTER, CURRENT_TERM, courses } from "@/data/demo";
import { PageHeader } from "@/components/page-header";

interface ScheduleRow {
  time: string;
  sun?: { code: string; room: string; title: string };
  mon?: { code: string; room: string; title: string };
  tue?: { code: string; room: string; title: string };
  wed?: { code: string; room: string; title: string };
  thu?: { code: string; room: string; title: string };
}

const FULL_YEAR_ROUTINES: Record<string, { label: string; schedule: ScheduleRow[] }> = {
  "spring-2026": {
    label: "Spring 2026 (Current 1-Year Academic Routine)",
    schedule: [
      {
        time: "09:00 - 10:30",
        sun: { code: "SESDP", room: "507", title: "Software Engineering & Design Pattern" },
        thu: { code: "SE&DP Lab", room: "310", title: "Software Engineering Lab" },
      },
      {
        time: "10:30 - 12:00",
        sun: { code: "AI", room: "507", title: "Artificial Intelligence" },
        mon: { code: "SE&DP", room: "506", title: "Software Engineering & Design Pattern" },
        thu: { code: "SE&DP Lab", room: "310", title: "Software Engineering Lab" },
      },
      {
        time: "12:00 - 01:30",
        sun: { code: "TOC", room: "506", title: "Theory of Computation" },
        mon: { code: "Web Project Lab", room: "309", title: "Web Programming Lab" },
        thu: { code: "AI", room: "506", title: "Artificial Intelligence" },
      },
      {
        time: "01:30 - 03:00",
        thu: { code: "TOC", room: "507", title: "Theory of Computation" },
      },
      {
        time: "03:00 - 04:30",
        tue: { code: "AI Lab", room: "311", title: "Artificial Intelligence Lab" },
      },
      {
        time: "04:30 - 06:00",
        tue: { code: "AI Lab", room: "311", title: "Artificial Intelligence Lab" },
      },
    ],
  },
  "autumn-2026": {
    label: "Autumn 2026 (Advance 1-Year Preview)",
    schedule: [
      {
        time: "09:00 - 10:30",
        mon: { code: "Distributed Systems", room: "508", title: "Distributed Computing" },
        wed: { code: "Machine Learning", room: "402", title: "Intro to ML & Data Pipelines" },
      },
      {
        time: "10:30 - 12:00",
        mon: { code: "Machine Learning", room: "402", title: "Intro to ML & Data Pipelines" },
        wed: { code: "Cloud Architecture", room: "505", title: "AWS & Containerization" },
      },
      {
        time: "12:00 - 01:30",
        tue: { code: "Capstone Project", room: "Lab 3", title: "Final Year Design Project" },
        thu: { code: "Information Security", room: "501", title: "Cybersecurity Fundamentals" },
      },
    ],
  },
};

const FACULTY_DIRECTORY = [
  {
    name: "Tahsin Jahan Mim",
    role: "Assistant Professor & Course Coordinator",
    courses: [
      "CSE 417 · Software Engineering & Design Pattern (SE&DP)",
      "CSE 418 · Software Engineering & Design Pattern Lab (SE&DP Lab)",
    ],
  },
  {
    name: "Golam Mostofa Naeem Sir",
    role: "Senior Lecturer",
    courses: ["CSE 323 · Web Programming Lab", "CSE 300 · Capstone Project Supervision"],
  },
  {
    name: "Bushra Kamal Hussaina Ma'am",
    role: "Assistant Professor",
    courses: [
      "CSE 421 · Artificial Intelligence (AI)",
      "CSE 422 · Artificial Intelligence Lab (AI Lab)",
    ],
  },
  {
    name: "Raisa Fairuz Ma'am",
    role: "Lecturer",
    courses: ["CSE 325 · Theory of Computation (TOC)"],
  },
];

// Shudhu Light mode-e hover korle black hobe, text o clear thakbe
const LIGHT_ONLY_BLACK_HOVER =
  "[html:not([data-theme=dark]):not(.dark)_&]:hover:border-neutral-950 [html:not([data-theme=dark]):not(.dark)_&]:hover:bg-neutral-950 [html:not([data-theme=dark]):not(.dark)_&]:hover:text-white";

const ACTION_BTN_STYLE = `group inline-flex h-9 items-center gap-2 rounded-full border border-line bg-surface px-4 type-xs font-medium text-fg transition-ui hover:bg-sunken ${LIGHT_ONLY_BLACK_HOVER}`;

export function RoutinePage() {
  const [selectedTerm, setSelectedTerm] = useState<string>("spring-2026");
  const activeRoutineData = FULL_YEAR_ROUTINES[selectedTerm] ?? FULL_YEAR_ROUTINES["spring-2026"];

  function handleDownloadScheduleIcs() {
    const icsLines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Metropolitan University//CSE 60th Routine//EN",
      ...courses.map(
        (course, idx) =>
          [
            "BEGIN:VEVENT",
            `UID:${course.id}@metrouni.edu.bd`,
            `SUMMARY:${course.code} - ${course.title}`,
            `DESCRIPTION:Instructor: ${course.instructor} (${CURRENT_SEMESTER})`,
            `DTSTART:20261116T0${(idx % 4) + 9}0000`,
            `DTEND:20261116T0${(idx % 4) + 10}3000`,
            "END:VEVENT",
          ].join("\r\n"),
      ),
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsLines], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `metropolitan-university-routine-${selectedTerm}.ics`;
    link.click();
    URL.revokeObjectURL(url);
    toast("Academic routine downloaded (.ics for Calendar).");
  }

  function handlePrintRoutine() {
    window.print();
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Header + Download Action Button */}
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <PageHeader
          kicker={CURRENT_TERM}
          title="Master Class Routine"
          lede="Department of Computer Science & Engineering · Metropolitan University. Official weekly academic schedule for Semester 7."
        />

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadScheduleIcs}
            className={ACTION_BTN_STYLE}
          >
            <Download size={14} strokeWidth={1.75} className="text-muted transition-ui [html:not([data-theme=dark]):not(.dark)_&]:group-hover:text-white" />
            <span>Download Schedule (.ics)</span>
          </button>

          <button
            type="button"
            onClick={handlePrintRoutine}
            className={ACTION_BTN_STYLE}
          >
            <Printer size={14} strokeWidth={1.75} className="text-muted transition-ui [html:not([data-theme=dark]):not(.dark)_&]:group-hover:text-white" />
            <span>Print Routine</span>
          </button>
        </div>
      </div>

      {/* 1-Year Term Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border border-line bg-surface p-4 r-lg">
        <div className="flex items-center gap-2.5">
          <Calendar size={18} className="text-muted" />
          <div>
            <p className="type-sm font-medium text-fg">Select Academic Year &amp; Term</p>
            <p className="type-xs text-muted">Showing 1-year structured routine slots</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {Object.entries(FULL_YEAR_ROUTINES).map(([key, item]) => {
            const isActive = selectedTerm === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedTerm(key)}
                className={`rounded-full px-4 py-1.5 type-xs font-medium transition-ui ${
                  isActive
                    ? "border border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-black"
                    : "border border-line bg-surface text-muted hover:text-fg hover:bg-sunken"
                }`}
              >
                {item.label.split(" ")[0]} {item.label.split(" ")[1]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Full Weekly Schedule Table */}
      <section className="border border-line bg-surface p-5 r-lg md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
          <div>
            <span className="inline-flex items-center gap-1.5 border border-line bg-sunken px-2.5 py-0.5 text-[11px] font-medium text-fg r-sm">
              <Sparkles size={12} />
              CSE 60th (C) Batch Routine
            </span>
            <h2 className="mt-2 type-xl font-medium text-fg">{activeRoutineData.label}</h2>
          </div>

          <span className="type-xs text-muted">Sunday through Thursday · Room assignments verified</span>
        </div>

        <div className="mt-6 overflow-x-auto border border-line bg-bg r-md">
          <table className="w-full min-w-[50rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-sunken">
                <th className="w-36 border-r border-line px-4 py-3.5 type-xs font-medium text-fg">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={13} className="text-muted" />
                    Time Slot
                  </span>
                </th>
                <th className="border-r border-line px-4 py-3.5 text-center type-xs font-medium text-fg">Sunday</th>
                <th className="border-r border-line px-4 py-3.5 text-center type-xs font-medium text-fg">Monday</th>
                <th className="border-r border-line px-4 py-3.5 text-center type-xs font-medium text-fg">Tuesday</th>
                <th className="border-r border-line px-4 py-3.5 text-center type-xs font-medium text-fg">Wednesday</th>
                <th className="px-4 py-3.5 text-center type-xs font-medium text-fg">Thursday</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {activeRoutineData.schedule.map((row) => (
                <tr key={row.time} className="transition-ui hover:bg-sunken/40">
                  <td className="border-r border-line bg-sunken/40 px-4 py-3.5 type-xs font-medium tabular-nums text-muted">
                    {row.time}
                  </td>
                  {(["sun", "mon", "tue", "wed", "thu"] as const).map((dayKey, index) => {
                    const slot = row[dayKey];
                    return (
                      <td
                        key={dayKey}
                        className={`px-3 py-3 text-center ${index < 4 ? "border-r border-line" : ""}`}
                      >
                        {slot ? (
                          <div
                            className="inline-flex flex-col items-center rounded-xl border border-line bg-surface p-2.5 shadow-xs transition-ui hover:border-fg/40"
                            title={slot.title}
                          >
                            <span className="type-sm font-medium text-fg">{slot.code}</span>
                            <span className="mt-0.5 text-[11px] tabular-nums text-muted">Room {slot.room}</span>
                          </div>
                        ) : (
                          <span className="type-xs text-faint">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Course & Faculty Directory */}
      <section className="border-t border-line pt-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="type-label">Faculty Directory</p>
            <h2 className="mt-1 type-xl text-fg">Assigned instructors &amp; course mapping</h2>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {FACULTY_DIRECTORY.map((faculty) => (
            <div key={faculty.name} className="border border-line bg-surface p-4.5 r-lg">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="type-base font-medium text-fg">{faculty.name}</p>
                  <p className="type-xs text-muted">{faculty.role}</p>
                </div>
              </div>
              <ul className="mt-3.5 space-y-1.5 border-t border-line/70 pt-3">
                {faculty.courses.map((courseLine) => (
                  <li key={courseLine} className="type-xs text-fg">
                    {courseLine}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default RoutinePage;