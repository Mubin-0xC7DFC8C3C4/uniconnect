import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { CURRENT_SEMESTER, CURRENT_TERM, SAMPLE_CGPA, courses, termCredits } from "@/data/demo";
import { useAppStore } from "@/lib/store";
import { PageHeader } from "@/components/page-header";

interface SemesterGpaPoint {
  semester: string;
  shortLabel: string;
  term: string;
  sgpa: number;
  cgpa: number;
  credits: number;
}

interface CourseAnalytics {
  id: string;
  code: string;
  title: string;
  instructor: string;
  credits: number;
  marks: number;
  maxMarks: number;
  grade: string;
  quiz: number;
  midterm: number;
  assignment: number;
  attendancePct: number;
  attendedClasses: number;
  totalClasses: number;
}

interface CalendarEventItem {
  id: string;
  dateKey: string; // YYYY-MM-DD
  title: string;
  category: "Registration" | "Midterm" | "Deadline" | "Final Exam" | "Academic";
  dateLabel: string;
  window: string;
  status: "Upcoming" | "Action Required" | "Scheduled";
}

interface AcademicAlertItem {
  id: string;
  type: "Low Attendance" | "Pending Registration" | "Course Standing";
  severity: "warning" | "ok";
  title: string;
  detail: string;
  actionLabel: string;
  href: "/courses" | "/academics" | "/routine" | "/results";
}

const SEMESTER_TREND: SemesterGpaPoint[] = [
  { semester: "Semester 1", shortLabel: "Sem 1", term: "Spring 2023", sgpa: 3.12, cgpa: 3.12, credits: 15 },
  { semester: "Semester 2", shortLabel: "Sem 2", term: "Summer 2023", sgpa: 3.24, cgpa: 3.18, credits: 18 },
  { semester: "Semester 3", shortLabel: "Sem 3", term: "Autumn 2023", sgpa: 3.31, cgpa: 3.23, credits: 18 },
  { semester: "Semester 4", shortLabel: "Sem 4", term: "Spring 2024", sgpa: 3.28, cgpa: 3.24, credits: 18 },
  { semester: "Semester 5", shortLabel: "Sem 5", term: "Autumn 2024", sgpa: 3.46, cgpa: 3.29, credits: 19 },
  { semester: "Semester 6", shortLabel: "Sem 6", term: "Spring 2025", sgpa: 3.58, cgpa: SAMPLE_CGPA, credits: 18 },
];

const COURSE_METRICS_PRESETS = [
  {
    credits: 4,
    marks: 84,
    grade: "A",
    quiz: 18,
    midterm: 26,
    assignment: 40,
    attendancePct: 92,
    attendedClasses: 22,
    totalClasses: 24,
  },
  {
    credits: 4,
    marks: 79,
    grade: "A-",
    quiz: 16,
    midterm: 24,
    assignment: 39,
    attendancePct: 88,
    attendedClasses: 21,
    totalClasses: 24,
  },
  {
    credits: 3,
    marks: 72,
    grade: "B+",
    quiz: 15,
    midterm: 21,
    assignment: 36,
    attendancePct: 71,
    attendedClasses: 17,
    totalClasses: 24,
  },
  {
    credits: 3,
    marks: 87,
    grade: "A",
    quiz: 19,
    midterm: 27,
    assignment: 41,
    attendancePct: 95,
    attendedClasses: 21,
    totalClasses: 22,
  },
];

const CALENDAR_MONTHS = [
  { year: 2026, monthIndex: 10, label: "November 2026" },
  { year: 2026, monthIndex: 11, label: "December 2026" },
  { year: 2027, monthIndex: 0, label: "January 2027" },
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const ACADEMIC_CALENDAR_EVENTS: CalendarEventItem[] = [
  {
    id: "cal-today",
    dateKey: "2026-11-16",
    title: "Advisor Section Verification & Routine Lock",
    category: "Academic",
    dateLabel: "16 Nov 2026",
    window: "10:00 AM – 04:00 PM · Dept. Office",
    status: "Scheduled",
  },
  {
    id: "cal-reg",
    dateKey: "2026-11-20",
    title: "Course Add / Drop & Elective Confirmation",
    category: "Registration",
    dateLabel: "20 Nov 2026",
    window: "Closes 11:59 PM · Registrar Portal",
    status: "Action Required",
  },
  {
    id: "cal-quiz",
    dateKey: "2026-11-26",
    title: "Continuous Assessment Quiz-02 Week",
    category: "Academic",
    dateLabel: "26 Nov 2026",
    window: "During scheduled theory slots",
    status: "Upcoming",
  },
  {
    id: "cal-mid-start",
    dateKey: "2026-12-02",
    title: "Mid-Term Examination Week Begins",
    category: "Midterm",
    dateLabel: "02 Dec – 09 Dec 2026",
    window: "Admit card clearance required",
    status: "Upcoming",
  },
  {
    id: "cal-mid-end",
    dateKey: "2026-12-09",
    title: "Mid-Term Examination Week Concludes",
    category: "Midterm",
    dateLabel: "09 Dec 2026",
    window: "Final day of Mid-Term slots",
    status: "Upcoming",
  },
  {
    id: "cal-proj",
    dateKey: "2026-12-24",
    title: "Sessional Lab & Capstone Proposal Submission",
    category: "Deadline",
    dateLabel: "24 Dec 2026",
    window: "11:59 PM · Department Archive",
    status: "Upcoming",
  },
  {
    id: "cal-final-start",
    dateKey: "2027-01-14",
    title: "Term Final Examinations Begin (Spring 2026)",
    category: "Final Exam",
    dateLabel: "14 Jan – 26 Jan 2027",
    window: "Central Exam Routine · Hall 501–507",
    status: "Scheduled",
  },
  {
    id: "cal-final-end",
    dateKey: "2027-01-26",
    title: "Term Final Examinations Conclude",
    category: "Final Exam",
    dateLabel: "26 Jan 2027",
    window: "Semester break follows",
    status: "Scheduled",
  },
];

const TOTAL_DEGREE_CREDITS = 140;
const COMPLETED_CREDITS = 106;

function padTwo(num: number): string {
  return String(num).padStart(2, "0");
}

export function AcademicsPage() {
  const profile = useAppStore((state) => state.profile);
  const [selectedSemIdx, setSelectedSemIdx] = useState<number>(SEMESTER_TREND.length - 1);
  const [selectedCourseIdx, setSelectedCourseIdx] = useState<number>(0);
  const [calendarMonthIdx, setCalendarMonthIdx] = useState<number>(0);
  const [hoveredDateKey, setHoveredDateKey] = useState<string | null>(null);

  const activeSem = SEMESTER_TREND[selectedSemIdx];
  const currentCredits = termCredits();
  const remainingCredits = Math.max(0, TOTAL_DEGREE_CREDITS - COMPLETED_CREDITS - currentCredits);

  const completedPct = ((COMPLETED_CREDITS / TOTAL_DEGREE_CREDITS) * 100).toFixed(1);
  const inProgressPct = ((currentCredits / TOTAL_DEGREE_CREDITS) * 100).toFixed(1);
  const remainingPct = ((remainingCredits / TOTAL_DEGREE_CREDITS) * 100).toFixed(1);

  const courseAnalytics: CourseAnalytics[] = courses.map((course, idx) => {
    const preset = COURSE_METRICS_PRESETS[idx % COURSE_METRICS_PRESETS.length];
    const resolvedCredits = (course as { credits?: number }).credits ?? preset.credits;
    return {
      id: course.id,
      code: course.code,
      title: course.title,
      instructor: course.instructor,
      credits: resolvedCredits,
      marks: preset.marks,
      maxMarks: 100,
      grade: preset.grade,
      quiz: preset.quiz,
      midterm: preset.midterm,
      assignment: preset.assignment,
      attendancePct: preset.attendancePct,
      attendedClasses: preset.attendedClasses,
      totalClasses: preset.totalClasses,
    };
  });

  const activeCourse = courseAnalytics[selectedCourseIdx] ?? courseAnalytics[0];
  const lowAttendanceCourse = courseAnalytics.find((c) => c.attendancePct < 75);

  const overallAttendancePct = Math.round(
    courseAnalytics.reduce((sum, item) => sum + item.attendancePct, 0) /
      Math.max(1, courseAnalytics.length),
  );

  const academicAlerts: AcademicAlertItem[] = [
    ...(lowAttendanceCourse
      ? [
          {
            id: "alert-att",
            type: "Low Attendance" as const,
            severity: "warning" as const,
            title: `${lowAttendanceCourse.code} attendance is ${lowAttendanceCourse.attendancePct}%`,
            detail: `Below the 75% exam eligibility threshold (${lowAttendanceCourse.attendedClasses}/${lowAttendanceCourse.totalClasses} classes attended).`,
            actionLabel: "View routine",
            href: "/routine" as const,
          },
        ]
      : []),
    {
      id: "alert-reg",
      type: "Pending Registration",
      severity: "warning",
      title: "Add / Drop window closes on 20 Nov 2026",
      detail: "Verify section enrollment and advisor approval before registration locks.",
      actionLabel: "Review courses",
      href: "/courses",
    },
    {
      id: "alert-fail",
      type: "Course Standing",
      severity: "ok",
      title: "0 Failed or Retake Courses",
      detail: "All 106 completed credits cleared in regular standing with no academic probation.",
      actionLabel: "View Results",
      href: "/results",
    },
  ];

  // SVG Trendline coordinates
  const chartW = 520;
  const chartH = 190;
  const padX = 36;
  const padTop = 22;
  const padBottom = 30;
  const minGpa = 2.8;
  const maxGpa = 4.0;

  const points = SEMESTER_TREND.map((item, idx) => {
    const x =
      padX + (idx / Math.max(1, SEMESTER_TREND.length - 1)) * (chartW - padX * 2);
    const ySgpa =
      padTop +
      ((maxGpa - item.sgpa) / (maxGpa - minGpa)) * (chartH - padTop - padBottom);
    const yCgpa =
      padTop +
      ((maxGpa - item.cgpa) / (maxGpa - minGpa)) * (chartH - padTop - padBottom);
    return { ...item, x, ySgpa, yCgpa, idx };
  });

  const sgpaPolyline = points.map((p) => `${p.x},${p.ySgpa}`).join(" ");
  const cgpaPolyline = points.map((p) => `${p.x},${p.yCgpa}`).join(" ");
  const areaPath = `M ${points[0].x},${chartH - padBottom} L ${sgpaPolyline.replace(/ /g, " L ")} L ${
    points[points.length - 1].x
  },${chartH - padBottom} Z`;

  // Attendance Ring Gauge geometry
  const ringRadius = 46;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - overallAttendancePct / 100);

  // Interactive Monthly Calendar Grid Builder
  const activeMonth = CALENDAR_MONTHS[calendarMonthIdx];
  const firstDayOfWeek = new Date(activeMonth.year, activeMonth.monthIndex, 1).getDay();
  const daysInMonth = new Date(activeMonth.year, activeMonth.monthIndex + 1, 0).getDate();

  const calendarCells: (number | null)[] = [
    ...Array.from({ length: firstDayOfWeek }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (calendarCells.length % 7 !== 0) {
    calendarCells.push(null);
  }

  const eventsForActiveMonth = ACADEMIC_CALENDAR_EVENTS.filter((ev) =>
    ev.dateKey.startsWith(`${activeMonth.year}-${padTwo(activeMonth.monthIndex + 1)}`),
  );

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        kicker={CURRENT_TERM}
        title="Academic overview"
        lede={`Enrollment standing, GPA analytics, degree progress, and attendance metrics for ${profile.name} (${profile.studentId}).`}
      />

      {/* =========================================================
          1. ACADEMIC SUMMARY (4-Metric Hairline Grid)
         ========================================================= */}
      <section aria-label="Academic summary">
        <dl className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-bg px-5 py-4">
            <dt className="type-label">Cumulative CGPA</dt>
            <dd className="mt-2 type-2xl font-medium tabular-nums text-fg">
              {SAMPLE_CGPA.toFixed(2)}
              <span className="ml-1 type-sm font-normal text-muted">/ 4.00</span>
            </dd>
            <p className="mt-1 type-xs text-faint">Across 6 completed semesters</p>
          </div>

          <div className="bg-bg px-5 py-4">
            <dt className="type-label">Completed Credits</dt>
            <dd className="mt-2 type-2xl font-medium tabular-nums text-fg">
              {COMPLETED_CREDITS}
              <span className="ml-1 type-sm font-normal text-muted">/ {TOTAL_DEGREE_CREDITS}</span>
            </dd>
            <p className="mt-1 type-xs text-faint">{completedPct}% of degree requirement</p>
          </div>

          <div className="bg-bg px-5 py-4">
            <dt className="type-label">Current Semester</dt>
            <dd className="mt-2 type-2xl font-medium text-fg">{CURRENT_SEMESTER}</dd>
            <p className="mt-1 type-xs text-faint">
              Batch {profile.batch} · Section {profile.section}
            </p>
          </div>

          <div className="bg-bg px-5 py-4">
            <dt className="type-label">Enrolled Courses</dt>
            <dd className="mt-2 type-2xl font-medium tabular-nums text-fg">
              {courseAnalytics.length} Courses
            </dd>
            <p className="mt-1 type-xs text-faint">{currentCredits} active credit hours this term</p>
          </div>
        </dl>
      </section>

      {/* =========================================================
          2. ACADEMIC ALERTS (Low Attendance, Registration, Standing)
         ========================================================= */}
      <section aria-labelledby="alerts-heading">
        <div className="flex items-center justify-between gap-4">
          <h2 id="alerts-heading" className="type-lg text-fg">
            Academic alerts
          </h2>
          <span className="type-xs text-muted">
            {academicAlerts.filter((a) => a.severity === "warning").length} active notices
          </span>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {academicAlerts.map((alert) => {
            const isWarning = alert.severity === "warning";
            return (
              <div
                key={alert.id}
                className="flex flex-col justify-between border border-line bg-surface p-4 r-lg"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 border px-2.5 py-0.5 text-[11px] font-medium r-pill ${
                        isWarning
                          ? "border-danger/40 bg-sunken text-danger"
                          : "border-line bg-sunken text-fg dark:border-emerald-500/30 dark:text-[var(--success,#10b981)]"
                      }`}
                    >
                      {isWarning ? (
                        <AlertTriangle size={12} strokeWidth={2} />
                      ) : (
                        <CheckCircle2 size={12} strokeWidth={2} />
                      )}
                      {alert.type}
                    </span>
                  </div>

                  <p className="mt-3 type-sm font-medium text-fg">{alert.title}</p>
                  <p className="mt-1 type-xs leading-relaxed text-muted">{alert.detail}</p>
                </div>

                <div className="mt-4 border-t border-line/70 pt-3">
                  <Link
                    to={alert.href}
                    className="inline-flex items-center gap-1 type-xs font-medium text-fg underline-offset-4 hover:underline"
                  >
                    <span>{alert.actionLabel}</span>
                    <ArrowUpRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================
          3. GPA & CGPA ANALYTICS + DEGREE PROGRESS (2-Column Row)
         ========================================================= */}
      <div className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        {/* GPA & CGPA Trend Graph */}
        <section className="flex flex-col justify-between border border-line bg-surface p-5 r-lg md:p-6">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="type-label">GPA &amp; CGPA Analytics</p>
                <h2 className="mt-1 type-lg text-fg">Semester-wise GPA trend</h2>
              </div>

              <div className="flex items-center gap-4 type-xs text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block h-0.5 w-4 bg-fg dark:bg-[var(--success,#10b981)]" />
                  Term SGPA
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block h-0.5 w-4 border-t border-dashed border-muted" />
                  Cumulative CGPA
                </span>
              </div>
            </div>

            {/* Interactive SVG Trend Chart */}
            <div className="mt-5 overflow-x-auto">
              <svg
                viewBox={`0 0 ${chartW} ${chartH}`}
                className="h-48 w-full min-w-[24rem]"
                role="img"
                aria-label="Semester-wise GPA and CGPA trend chart"
              >
                <defs>
                  <linearGradient id="academicsGpaArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {[4.0, 3.6, 3.2, 2.8].map((tick) => {
                  const y =
                    padTop +
                    ((maxGpa - tick) / (maxGpa - minGpa)) * (chartH - padTop - padBottom);
                  return (
                    <g key={tick}>
                      <line
                        x1={padX}
                        y1={y}
                        x2={chartW - padX}
                        y2={y}
                        stroke="currentColor"
                        className="text-line"
                        strokeWidth="1"
                      />
                      <text
                        x={padX - 8}
                        y={y + 3}
                        textAnchor="end"
                        className="fill-current text-[10px] tabular-nums text-faint"
                      >
                        {tick.toFixed(1)}
                      </text>
                    </g>
                  );
                })}

                <path
                  d={areaPath}
                  fill="url(#academicsGpaArea)"
                  className="text-fg dark:text-[var(--success,#10b981)]"
                />

                <polyline
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  className="text-muted"
                  points={cgpaPolyline}
                />

                <polyline
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.25"
                  className="text-fg dark:text-[var(--success,#10b981)]"
                  points={sgpaPolyline}
                />

                {points.map((pt) => {
                  const isSelected = pt.idx === selectedSemIdx;
                  return (
                    <g
                      key={pt.semester}
                      className="cursor-pointer"
                      onClick={() => setSelectedSemIdx(pt.idx)}
                      onMouseEnter={() => setSelectedSemIdx(pt.idx)}
                    >
                      {isSelected ? (
                        <line
                          x1={pt.x}
                          y1={padTop}
                          x2={pt.x}
                          y2={chartH - padBottom}
                          stroke="currentColor"
                          strokeDasharray="2 2"
                          className="text-muted"
                        />
                      ) : null}

                      <circle
                        cx={pt.x}
                        cy={pt.ySgpa}
                        r={isSelected ? 5 : 3.5}
                        className={
                          isSelected
                            ? "fill-fg stroke-bg dark:fill-[var(--success,#10b981)]"
                            : "fill-surface stroke-fg dark:stroke-[var(--success,#10b981)]"
                        }
                        strokeWidth="2"
                      />

                      <text
                        x={pt.x}
                        y={chartH - 8}
                        textAnchor="middle"
                        className={`text-[11px] ${
                          isSelected
                            ? "fill-current font-medium text-fg"
                            : "fill-current text-muted"
                        }`}
                      >
                        {pt.shortLabel}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3.5 type-xs">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-fg dark:text-[var(--success,#10b981)]" />
              <span className="font-medium text-fg">
                {activeSem.semester} ({activeSem.term})
              </span>
            </div>
            <div className="flex items-center gap-4 tabular-nums text-muted">
              <span>
                Term SGPA: <strong className="font-medium text-fg">{activeSem.sgpa.toFixed(2)}</strong>
              </span>
              <span>
                CGPA: <strong className="font-medium text-fg">{activeSem.cgpa.toFixed(2)}</strong>
              </span>
              <span>
                Earned: <strong className="font-medium text-fg">{activeSem.credits} cr</strong>
              </span>
            </div>
          </div>
        </section>

        {/* Degree Progress */}
        <section className="flex flex-col justify-between border border-line bg-surface p-5 r-lg md:p-6">
          <div>
            <p className="type-label">Degree Progress</p>
            <h2 className="mt-1 type-lg text-fg">Credit completion standing</h2>
            <p className="mt-1 type-xs text-muted">
              B.Sc. in Computer Science &amp; Engineering ({TOTAL_DEGREE_CREDITS} total required credits)
            </p>

            <div className="mt-6">
              <div className="flex items-baseline justify-between">
                <span className="type-label">Progress toward graduation</span>
                <span className="type-sm font-medium tabular-nums text-fg">{completedPct}%</span>
              </div>

              <div
                className="mt-2.5 flex h-3.5 w-full overflow-hidden border border-line bg-sunken r-pill dark:border-white/15 dark:bg-white/10"
                role="img"
                aria-label={`${COMPLETED_CREDITS} completed, ${currentCredits} in progress, ${remainingCredits} remaining credits`}
              >
                <div
                  style={{ width: `${completedPct}%` }}
                  className="h-full bg-fg transition-all duration-500 dark:bg-[var(--success,#10b981)]"
                  title={`Completed: ${COMPLETED_CREDITS} credits`}
                />
                <div
                  style={{ width: `${inProgressPct}%` }}
                  className="h-full border-l border-bg bg-muted transition-all duration-500 dark:bg-emerald-500/40"
                  title={`In Progress: ${currentCredits} credits`}
                />
              </div>
            </div>

            <ul className="mt-6 space-y-3 border-t border-line pt-5 type-sm">
              <li className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-fg">
                  <span className="size-2.5 bg-fg r-pill dark:bg-[var(--success,#10b981)]" />
                  Completed credits
                </span>
                <span className="tabular-nums text-muted">
                  <strong className="font-medium text-fg">{COMPLETED_CREDITS} cr</strong> ({completedPct}%)
                </span>
              </li>

              <li className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-fg">
                  <span className="size-2.5 bg-muted r-pill dark:bg-emerald-500/40" />
                  In-progress ({CURRENT_SEMESTER})
                </span>
                <span className="tabular-nums text-muted">
                  <strong className="font-medium text-fg">{currentCredits} cr</strong> ({inProgressPct}%)
                </span>
              </li>

              <li className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-muted">
                  <span className="size-2.5 border border-line bg-sunken r-pill dark:border-white/20 dark:bg-white/10" />
                  Remaining credits
                </span>
                <span className="tabular-nums text-muted">
                  <strong className="font-medium text-fg">{remainingCredits} cr</strong> ({remainingPct}%)
                </span>
              </li>
            </ul>
          </div>

          <p className="mt-6 border-t border-line pt-3.5 type-xs text-faint">
            Expected graduation: Autumn 2027 upon clearing remaining {remainingCredits + currentCredits} credits.
          </p>
        </section>
      </div>

      {/* =========================================================
          4. ACADEMIC PERFORMANCE & ATTENDANCE SUMMARY (Charts Row)
         ========================================================= */}
      <div className="grid items-stretch gap-6 lg:grid-cols-2">
        <section className="flex flex-col justify-between border border-line bg-surface p-5 r-lg md:p-6">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="type-label">Academic Performance</p>
                <h2 className="mt-1 type-lg text-fg">Course score vs max marks</h2>
              </div>
              <div className="flex items-center gap-3 type-xs text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-2.5 border border-line bg-sunken r-sm dark:border-transparent dark:bg-[var(--success,#10b981)]" />
                  Max (100)
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-2.5 bg-fg r-sm" />
                  Earned Score
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2 border-b border-line pb-4 sm:grid-cols-3 xl:grid-cols-5">
              {courseAnalytics.map((course, idx) => {
                const isSelected = idx === selectedCourseIdx;
                return (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => setSelectedCourseIdx(idx)}
                    className={`group flex flex-col items-center rounded p-2 text-center transition-ui ${
                      isSelected ? "bg-sunken/80 ring-1 ring-line" : "hover:bg-sunken/40"
                    }`}
                  >
                    <span className="type-xs font-medium tabular-nums text-fg">
                      {course.marks}%
                    </span>

                    <div className="mt-2 flex h-32 w-full max-w-[3rem] items-end justify-center gap-1.5">
                      <div
                        className="h-full w-3.5 border border-line bg-sunken r-sm dark:border-transparent dark:bg-[var(--success,#10b981)]"
                        title="Max Marks: 100"
                      />
                      <div
                        style={{ height: `${course.marks}%` }}
                        className="w-3.5 bg-fg r-sm transition-all duration-300"
                        title={`${course.code}: ${course.marks}/100 (${course.grade})`}
                      />
                    </div>

                    <span className="mt-2.5 text-[11px] font-medium text-fg">{course.code}</span>
                    <span className="mt-0.5 border border-line bg-bg px-1.5 py-0.2 text-[10px] font-medium text-muted r-sm">
                      Grade {course.grade}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {activeCourse ? (
            <div className="mt-4">
              <div className="flex items-center justify-between type-xs">
                <span className="font-medium text-fg">
                  {activeCourse.code} · {activeCourse.title}
                </span>
                <span className="text-muted">Projected: {activeCourse.grade}</span>
              </div>
              <div className="mt-2.5 grid grid-cols-3 gap-2 text-center">
                <div className="border border-line bg-bg px-2.5 py-2 r-md">
                  <p className="text-[11px] text-muted">Quiz (20)</p>
                  <p className="mt-0.5 type-sm font-medium tabular-nums text-fg">{activeCourse.quiz}</p>
                </div>
                <div className="border border-line bg-bg px-2.5 py-2 r-md">
                  <p className="text-[11px] text-muted">Midterm (30)</p>
                  <p className="mt-0.5 type-sm font-medium tabular-nums text-fg">{activeCourse.midterm}</p>
                </div>
                <div className="border border-line bg-bg px-2.5 py-2 r-md">
                  <p className="text-[11px] text-muted">Lab / Final (50)</p>
                  <p className="mt-0.5 type-sm font-medium tabular-nums text-fg">{activeCourse.assignment}</p>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        <section className="flex flex-col justify-between border border-line bg-surface p-5 r-lg md:p-6">
          <div>
            <p className="type-label">Attendance Summary</p>
            <h2 className="mt-1 type-lg text-fg">Overall &amp; course-wise attendance</h2>

            <div className="mt-5 flex items-center gap-5 border-b border-line pb-5">
              <div className="relative flex size-28 shrink-0 items-center justify-center">
                <svg className="size-28 -rotate-90" viewBox="0 0 112 112" aria-hidden>
                  <circle
                    cx="56"
                    cy="56"
                    r={ringRadius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-sunken dark:text-white/10"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r={ringRadius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringOffset}
                    className="text-fg transition-all duration-500 dark:text-[var(--success,#10b981)]"
                  />
                </svg>
                <span className="absolute type-lg font-medium tabular-nums text-fg">
                  {overallAttendancePct}%
                </span>
              </div>

              <div className="space-y-1">
                <p className="type-sm font-medium text-fg">Aggregate term attendance</p>
                <p className="type-xs leading-relaxed text-muted">
                  Minimum <strong className="font-medium text-fg">75%</strong> attendance per course is required to sit
                  for final examinations without collegiate penalty.
                </p>
              </div>
            </div>

            <ul className="mt-5 space-y-3.5">
              {courseAnalytics.map((course) => {
                const isLow = course.attendancePct < 75;
                return (
                  <li key={course.id}>
                    <div className="flex items-center justify-between gap-2 type-xs">
                      <span className="truncate font-medium text-fg">
                        {course.code} · {course.title}
                      </span>
                      <span
                        className={`shrink-0 tabular-nums font-medium ${
                          isLow ? "text-danger" : "text-fg dark:text-[var(--success,#10b981)]"
                        }`}
                      >
                        {course.attendancePct}%{" "}
                        <span className="font-normal text-muted">
                          ({course.attendedClasses}/{course.totalClasses})
                        </span>
                      </span>
                    </div>
                    <div className="relative mt-1.5 h-2 w-full overflow-hidden border border-line bg-sunken r-pill dark:border-white/10 dark:bg-white/10">
                      <div
                        style={{ width: `${course.attendancePct}%` }}
                        className={`h-full transition-all duration-500 ${
                          isLow ? "bg-danger" : "bg-fg dark:bg-[var(--success,#10b981)]"
                        }`}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <p className="mt-5 border-t border-line pt-3.5 type-xs text-faint">
            Updated after each scheduled lecture and laboratory session.
          </p>
        </section>
      </div>

      {/* =========================================================
          5. CURRENT COURSES (Structured Enrollment Table)
         ========================================================= */}
      <section className="border-t border-line pt-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="type-label">Current Courses</p>
            <h2 className="mt-1 type-xl text-fg">Enrolled subjects ({CURRENT_SEMESTER})</h2>
          </div>
          <Link
            to="/courses"
            className="inline-flex items-center gap-1.5 type-sm text-muted underline-offset-4 hover:text-fg hover:underline"
          >
            <BookOpen size={15} />
            <span>Open course syllabi</span>
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto border border-line bg-surface r-lg">
          <table className="w-full min-w-[38rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-sunken">
                <th className="px-4 py-3 type-xs font-medium text-fg">Code</th>
                <th className="px-4 py-3 type-xs font-medium text-fg">Course Title</th>
                <th className="px-4 py-3 type-xs font-medium text-fg">Instructor</th>
                <th className="px-4 py-3 text-right type-xs font-medium text-fg">Credit Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {courseAnalytics.map((course) => (
                <tr key={course.id} className="transition-ui hover:bg-sunken/50">
                  <td className="px-4 py-3.5 type-xs font-medium text-fg">
                    <span className="border border-line bg-bg px-2 py-0.5 r-sm">{course.code}</span>
                  </td>
                  <td className="px-4 py-3.5 type-sm font-medium text-fg">
                    <Link
                      to="/courses"
                      search={{ course: course.id }}
                      className="underline-offset-4 hover:underline"
                    >
                      {course.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 type-sm text-muted">{course.instructor}</td>
                  <td className="px-4 py-3.5 text-right type-sm font-medium tabular-nums text-fg">
                    {course.credits.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* =========================================================
          6. INTERACTIVE ACADEMIC CALENDAR WITH HOVER POPOVER
         ========================================================= */}
      <section className="border-t border-line pt-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="type-label">Academic Calendar</p>
            <h2 className="mt-1 type-xl text-fg">Key dates, exams &amp; deadlines</h2>
          </div>
          <span className="inline-flex items-center gap-1.5 type-xs text-muted">
            <Calendar size={14} />
            Hover over highlighted dates to inspect schedule
          </span>
        </div>

        <div className="mt-5 grid items-start gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
          {/* Interactive Monthly Calendar Matrix */}
          <div className="border border-line bg-surface p-5 r-lg md:p-6">
            {/* Month Switcher Header */}
            <div className="flex items-center justify-between gap-4 border-b border-line pb-4">
              <div>
                <h3 className="type-lg font-medium text-fg">{activeMonth.label}</h3>
                <p className="type-xs text-muted">
                  {eventsForActiveMonth.length} scheduled milestones this month
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={calendarMonthIdx === 0}
                  onClick={() => {
                    setHoveredDateKey(null);
                    setCalendarMonthIdx((prev) => Math.max(0, prev - 1));
                  }}
                  aria-label="Previous month"
                  className="inline-flex size-8 items-center justify-center rounded-full border border-line bg-bg text-fg transition-ui hover:bg-sunken disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  type="button"
                  disabled={calendarMonthIdx === CALENDAR_MONTHS.length - 1}
                  onClick={() => {
                    setHoveredDateKey(null);
                    setCalendarMonthIdx((prev) => Math.min(CALENDAR_MONTHS.length - 1, prev + 1));
                  }}
                  aria-label="Next month"
                  className="inline-flex size-8 items-center justify-center rounded-full border border-line bg-bg text-fg transition-ui hover:bg-sunken disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>

            {/* Weekday Column Headers */}
            <div className="mt-4 grid grid-cols-7 gap-1.5 text-center">
              {WEEKDAYS.map((day) => (
                <div key={day} className="py-1.5 text-[11px] font-medium text-muted">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Day Cells with Hover Popover */}
            <div className="mt-1 grid grid-cols-7 gap-1.5">
              {calendarCells.map((day, idx) => {
                if (!day) {
                  return <div key={`empty-${idx}`} className="h-12 rounded-lg bg-bg/30" />;
                }

                const dateKey = `${activeMonth.year}-${padTwo(activeMonth.monthIndex + 1)}-${padTwo(day)}`;
                const dayEvents = ACADEMIC_CALENDAR_EVENTS.filter((e) => e.dateKey === dateKey);
                const hasEvents = dayEvents.length > 0;
                const isActionRequired = dayEvents.some((e) => e.status === "Action Required");
                const isToday = dateKey === "2026-11-16";
                const isHovered = hoveredDateKey === dateKey;
                const colIndex = idx % 7;

                // Keep popover inside horizontal bounds on left/right edge columns
                const popoverHorizontalClass =
                  colIndex <= 1
                    ? "left-0"
                    : colIndex >= 5
                      ? "right-0"
                      : "left-1/2 -translate-x-1/2";

                return (
                  <div
                    key={dateKey}
                    onMouseEnter={() => setHoveredDateKey(dateKey)}
                    onMouseLeave={() => setHoveredDateKey(null)}
                    className="relative"
                  >
                    <button
                      type="button"
                      onClick={() => setHoveredDateKey(isHovered ? null : dateKey)}
                      className={`flex h-12 w-full flex-col items-center justify-center rounded-xl border text-center transition-ui ${
                        hasEvents
                          ? isActionRequired
                            ? "border-fg bg-fg text-bg shadow-xs dark:border-emerald-400 dark:bg-emerald-500/20 dark:text-fg"
                            : "border-fg/35 bg-sunken font-medium text-fg hover:border-fg dark:border-emerald-500/40 dark:bg-emerald-500/10"
                          : isToday
                            ? "border-line bg-bg font-medium text-fg"
                            : "border-transparent bg-bg/50 text-muted hover:border-line hover:bg-sunken/50 hover:text-fg"
                      }`}
                    >
                      <span className="type-xs tabular-nums">{day}</span>

                      {/* Event Indicator Dots */}
                      {hasEvents ? (
                        <span className="mt-1 flex items-center gap-0.5">
                          {dayEvents.map((ev) => (
                            <span
                              key={ev.id}
                              className={`size-1.5 rounded-full ${
                                isActionRequired
                                  ? "bg-bg dark:bg-[var(--success,#10b981)]"
                                  : "bg-fg dark:bg-[var(--success,#10b981)]"
                              }`}
                            />
                          ))}
                        </span>
                      ) : isToday ? (
                        <span className="mt-1 text-[9px] leading-none text-muted">Today</span>
                      ) : null}
                    </button>

                    {/* FLOATING HOVER POPOVER CARD */}
                    {isHovered ? (
                      <div
                        role="tooltip"
                        className={`pointer-events-none absolute bottom-[calc(100%+0.5rem)] z-30 w-64 rounded-xl border border-line bg-surface p-3.5 text-left shadow-xl ${popoverHorizontalClass}`}
                      >
                        <div className="flex items-center justify-between gap-2 border-b border-line pb-2">
                          <span className="text-[11px] font-medium text-fg">
                            {day} {activeMonth.label}
                          </span>
                          <span className="text-[10px] text-muted">
                            {hasEvents ? `${dayEvents.length} item${dayEvents.length > 1 ? "s" : ""}` : "Open day"}
                          </span>
                        </div>

                        {hasEvents ? (
                          <div className="mt-2.5 space-y-2.5">
                            {dayEvents.map((ev) => (
                              <div key={ev.id} className="space-y-1">
                                <div className="flex items-center justify-between gap-1.5">
                                  <span className="rounded border border-line bg-sunken px-1.5 py-0.5 text-[10px] font-medium text-fg">
                                    {ev.category}
                                  </span>
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                      ev.status === "Action Required"
                                        ? "bg-fg text-bg dark:bg-[var(--success,#10b981)] dark:text-black"
                                        : "border border-line bg-bg text-muted"
                                    }`}
                                  >
                                    {ev.status}
                                  </span>
                                </div>
                                <p className="type-xs font-medium leading-snug text-fg">
                                  {ev.title}
                                </p>
                                <p className="text-[11px] text-muted">{ev.window}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-2 text-[11px] text-muted">
                            Regular academic classes; no exams or deadlines scheduled.
                          </p>
                        )}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* Calendar Legend Footer */}
            <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-line pt-3.5 text-[11px] text-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-fg dark:bg-emerald-500/30 dark:ring-1 dark:ring-emerald-400" />
                Action Required
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm border border-fg/40 bg-sunken dark:border-emerald-500/40 dark:bg-emerald-500/10" />
                Exam / Deadline Date
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm border border-line bg-bg" />
                Regular Class Day
              </span>
            </div>
          </div>

          {/* Month Milestone Quick List */}
          <div className="border border-line bg-surface p-5 r-lg md:p-6">
            <p className="type-label">{activeMonth.label} Schedule</p>
            <h3 className="mt-1 type-lg text-fg">Events in this month</h3>

            <div className="mt-4 space-y-3">
              {eventsForActiveMonth.map((item) => (
                <div
                  key={item.id}
                  onMouseEnter={() => setHoveredDateKey(item.dateKey)}
                  onMouseLeave={() => setHoveredDateKey(null)}
                  className={`cursor-pointer rounded-xl border p-3.5 transition-ui ${
                    hoveredDateKey === item.dateKey
                      ? "border-fg bg-sunken/70 dark:border-emerald-400/60"
                      : "border-line bg-bg/50 hover:border-fg/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="border border-line bg-sunken px-2 py-0.5 text-[10px] font-medium text-fg r-sm">
                      {item.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-fg">
                      <Clock size={11} className="text-muted" />
                      {item.dateLabel}
                    </span>
                  </div>
                  <p className="mt-2 type-sm font-medium text-fg">{item.title}</p>
                  <p className="mt-0.5 type-xs text-muted">{item.window}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}