
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Award, ChevronRight, Download, FileText, TrendingUp } from "lucide-react";
import { SAMPLE_CGPA } from "@/data/demo";
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

interface TranscriptCourse {
  code: string;
  title: string;
  credits: number;
  grade: string;
}

interface TranscriptSemester {
  id: string;
  title: string;
  gpa: number;
  courses: TranscriptCourse[];
}

const SEMESTER_TREND: SemesterGpaPoint[] = [
  { semester: "Semester 1", shortLabel: "Sem 1", term: "Spring 2023", sgpa: 3.12, cgpa: 3.12, credits: 15 },
  { semester: "Semester 2", shortLabel: "Sem 2", term: "Summer 2023", sgpa: 3.24, cgpa: 3.18, credits: 18 },
  { semester: "Semester 3", shortLabel: "Sem 3", term: "Autumn 2023", sgpa: 3.31, cgpa: 3.23, credits: 18 },
  { semester: "Semester 4", shortLabel: "Sem 4", term: "Spring 2024", sgpa: 3.28, cgpa: 3.24, credits: 18 },
  { semester: "Semester 5", shortLabel: "Sem 5", term: "Autumn 2024", sgpa: 3.46, cgpa: 3.29, credits: 19 },
  { semester: "Semester 6", shortLabel: "Sem 6", term: "Spring 2025", sgpa: 3.58, cgpa: SAMPLE_CGPA, credits: 18 },
];

const TRANSCRIPT_SEMESTERS_DATA: TranscriptSemester[] = [
  {
    id: "sem-6",
    title: "Semester 6 (Spring 2025)",
    gpa: 3.58,
    courses: [
      { code: "CSE 323", title: "Web Programming Lab", credits: 3.0, grade: "A" },
      { code: "CSE 325", title: "Theory of Computation", credits: 3.0, grade: "A-" },
      { code: "CSE 417", title: "Software Engineering & Design Pattern", credits: 3.0, grade: "A" },
      { code: "CSE 418", title: "Software Engineering Lab", credits: 1.5, grade: "A+" },
      { code: "CSE 421", title: "Artificial Intelligence", credits: 3.0, grade: "B+" },
    ],
  },
  {
    id: "sem-5",
    title: "Semester 5 (Autumn 2024)",
    gpa: 3.46,
    courses: [
      { code: "CSE 311", title: "Database Management Systems", credits: 3.0, grade: "A-" },
      { code: "CSE 312", title: "Database Lab", credits: 1.5, grade: "A" },
      { code: "CSE 315", title: "Operating Systems", credits: 3.0, grade: "B+" },
      { code: "CSE 316", title: "Operating Systems Lab", credits: 1.5, grade: "A" },
      { code: "MAT 301", title: "Numerical Methods", credits: 3.0, grade: "B" },
    ],
  },
];

const LIGHT_ONLY_BLACK_HOVER =
  "[html:not([data-theme=dark]):not(.dark)_&]:hover:border-neutral-950 [html:not([data-theme=dark]):not(.dark)_&]:hover:bg-neutral-950 [html:not([data-theme=dark]):not(.dark)_&]:hover:text-white";

const ACTION_BTN_STYLE = `group inline-flex h-9 items-center gap-2 rounded-full border border-line bg-surface px-4 type-xs font-medium text-fg transition-ui hover:bg-sunken ${LIGHT_ONLY_BLACK_HOVER}`;

export function ResultsPage() {
  const profile = useAppStore((state) => state.profile);

  const [activeTab, setActiveTab] = useState<"overview" | "transcript" | "retake">("overview");
  const [selectedSemIdx, setSelectedSemIdx] = useState<number>(SEMESTER_TREND.length - 1);

  const activeSem = SEMESTER_TREND[selectedSemIdx];

  const chartW = 560;
  const chartH = 210;
  const padX = 40;
  const padTop = 24;
  const padBottom = 34;
  const minGpa = 2.8;
  const maxGpa = 4.0;

  const points = SEMESTER_TREND.map((item, idx) => {
    const x =
      padX + (idx / Math.max(1, SEMESTER_TREND.length - 1)) * (chartW - padX * 2);

    const ySgpa =
      padTop +
      ((maxGpa - item.sgpa) / (maxGpa - minGpa)) *
        (chartH - padTop - padBottom);

    const yCgpa =
      padTop +
      ((maxGpa - item.cgpa) / (maxGpa - minGpa)) *
        (chartH - padTop - padBottom);

    return { ...item, x, ySgpa, yCgpa, idx };
  });

  const sgpaPolyline = points.map((p) => `${p.x},${p.ySgpa}`).join(" ");
  const cgpaPolyline = points.map((p) => `${p.x},${p.yCgpa}`).join(" ");

  const areaPath = `M ${points[0].x},${chartH - padBottom} L ${sgpaPolyline.replace(/ /g, " L ")} L ${
    points[points.length - 1].x
  },${chartH - padBottom} Z`;

  function handleDownloadTranscript() {
    const payload = {
      studentName: profile.name,
      studentId: profile.studentId,
      department: profile.department,
      cgpa: SAMPLE_CGPA,
      semesters: TRANSCRIPT_SEMESTERS_DATA,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${profile.studentId || "transcript"}-official-record.json`;
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <PageHeader
          kicker="Academic Records"
          title="Results &amp; Transcript"
          lede="Official semester grade reports, cumulative GPA analytics, and course evaluation history."
        />

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadTranscript}
            className={ACTION_BTN_STYLE}
          >
            <Download
              size={14}
              strokeWidth={1.75}
              className="text-muted transition-ui [html:not([data-theme=dark]):not(.dark)_&]:group-hover:text-white"
            />
            <span>Download Transcript JSON</span>
          </button>
        </div>
      </div>

      <div className="border-b border-line">
        <nav className="flex gap-8" aria-label="Results sections">
          {[
            { id: "overview", label: "Overview & Analytics" },
            { id: "transcript", label: "Transcript Records" },
            { id: "retake", label: "Retake & Supplementary" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  setActiveTab(tab.id as "overview" | "transcript" | "retake")
                }
                className={`pb-3.5 type-sm font-medium transition-ui border-b-2 -mb-px ${
                  isActive
                    ? "border-fg text-fg"
                    : "border-transparent text-muted hover:text-fg"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {activeTab === "overview" ? (
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
          <div className="border border-line bg-surface p-6 r-lg space-y-6">
            <div>
              <p className="type-label">Cumulative CGPA</p>

              <p className="mt-2 type-3xl font-medium tabular-nums text-fg">
                {SAMPLE_CGPA.toFixed(2)}
                <span className="ml-1 type-sm font-normal text-muted">/ 4.00</span>
              </p>

              <p className="mt-2 type-xs leading-relaxed text-muted">
                Cumulative GPA calculated across completed academic semesters. Official
                university transcripts reflect weighted averages based on earned credit hours.
              </p>
            </div>

            <div className="border-t border-line pt-5 space-y-3">
              <div className="flex items-center justify-between type-sm">
                <span className="text-muted">Completed Semesters</span>
                <span className="font-medium tabular-nums text-fg">6 Semesters</span>
              </div>

              <div className="flex items-center justify-between type-sm">
                <span className="text-muted">Total Earned Credits</span>
                <span className="font-medium tabular-nums text-fg">106 Credits</span>
              </div>

              <div className="flex items-center justify-between type-sm">
                <span className="text-muted">Academic Standing</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  Regular / Dean's List
                </span>
              </div>
            </div>

            <div className="border-t border-line pt-5">
              <button
                type="button"
                onClick={() => setActiveTab("transcript")}
                className="inline-flex w-full items-center justify-between rounded-xl border border-line bg-bg p-3.5 text-left transition-ui hover:bg-sunken"
              >
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-muted" />

                  <div>
                    <p className="type-sm font-medium text-fg">
                      View full transcript table
                    </p>
                    <p className="type-xs text-muted">
                      Inspect course-wise grades
                    </p>
                  </div>
                </div>

                <ChevronRight size={16} className="text-muted" />
              </button>
            </div>
          </div>

          <section className="border border-line bg-surface p-6 r-lg">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="type-label">GPA &amp; CGPA Analytics</p>
                <h2 className="mt-1 type-lg text-fg">
                  Semester-wise GPA trend
                </h2>
              </div>

              <div className="flex items-center gap-4 type-xs text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block h-0.5 w-4 bg-emerald-500" />
                  Term SGPA
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block h-0.5 w-4 border-t border-dashed border-muted" />
                  Cumulative CGPA
                </span>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <svg
                viewBox={`0 0 ${chartW} ${chartH}`}
                className="h-56 w-full min-w-[28rem]"
                role="img"
                aria-label="Semester-wise GPA and CGPA trend chart"
              >
                <defs>
                  <linearGradient
                    id="resultsGpaArea"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {[4.0, 3.6, 3.2, 2.8].map((tick) => {
                  const y =
                    padTop +
                    ((maxGpa - tick) / (maxGpa - minGpa)) *
                      (chartH - padTop - padBottom);

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
                        x={padX - 10}
                        y={y + 4}
                        textAnchor="end"
                        className="fill-current text-[11px] tabular-nums text-muted"
                      >
                        {tick.toFixed(1)}
                      </text>
                    </g>
                  );
                })}

                <path d={areaPath} fill="url(#resultsGpaArea)" />

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
                  stroke="#10b981"
                  strokeWidth="2.5"
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
                        r={isSelected ? 6 : 4}
                        className={
                          isSelected
                            ? "fill-emerald-500 stroke-surface"
                            : "fill-surface stroke-emerald-500"
                        }
                        strokeWidth="2"
                      />

                      <text
                        x={pt.x}
                        y={chartH - 8}
                        textAnchor="middle"
                        className={`text-[12px] ${
                          isSelected ? "fill-fg font-medium" : "fill-muted"
                        }`}
                      >
                        {pt.shortLabel}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 type-xs">
              <div className="flex items-center gap-2">
                <TrendingUp size={15} className="text-emerald-500" />
                <span className="font-medium text-fg">
                  {activeSem.semester} ({activeSem.term})
                </span>
              </div>

              <div className="flex items-center gap-4 tabular-nums text-muted">
                <span>
                  Term SGPA:{" "}
                  <strong className="font-medium text-fg">
                    {activeSem.sgpa.toFixed(2)}
                  </strong>
                </span>

                <span>
                  CGPA:{" "}
                  <strong className="font-medium text-fg">
                    {activeSem.cgpa.toFixed(2)}
                  </strong>
                </span>

                <span>
                  Earned:{" "}
                  <strong className="font-medium text-fg">
                    {activeSem.credits} cr
                  </strong>
                </span>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {activeTab === "transcript" ? (
        <div className="space-y-8">
          {TRANSCRIPT_SEMESTERS_DATA.map((sem: TranscriptSemester) => (
            <div
              key={sem.id}
              className="border border-line bg-surface p-6 r-lg"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
                <div>
                  <h3 className="type-lg font-medium text-fg">{sem.title}</h3>
                  <p className="type-xs text-muted">
                    Term GPA: {sem.gpa.toFixed(2)}
                  </p>
                </div>

                <span className="border border-line bg-sunken px-3 py-1 text-xs font-medium text-fg r-pill tabular-nums">
                  SGPA {sem.gpa.toFixed(2)}
                </span>
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-line text-xs font-medium text-muted">
                      <th className="pb-3">Code</th>
                      <th className="pb-3">Course Title</th>
                      <th className="pb-3 text-right">Credits</th>
                      <th className="pb-3 text-right">Grade</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-line">
                    {sem.courses.map((c: TranscriptCourse) => (
                      <tr
                        key={c.code}
                        className="transition-ui hover:bg-sunken/40"
                      >
                        <td className="py-3 font-medium text-fg">{c.code}</td>
                        <td className="py-3 text-fg">{c.title}</td>
                        <td className="py-3 text-right tabular-nums text-muted">
                          {c.credits.toFixed(1)}
                        </td>
                        <td className="py-3 text-right font-medium tabular-nums text-fg">
                          {c.grade}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {activeTab === "retake" ? (
        <div className="border border-line bg-surface p-8 r-lg text-center">
          <Award size={36} className="mx-auto text-muted" />

          <h3 className="mt-4 type-lg font-medium text-fg">
            No supplementary or retake records
          </h3>

          <p className="mt-1 type-sm text-muted">
            All 106 completed credits were successfully cleared in regular
            semester evaluations without probationary standing.
          </p>
        </div>
      ) : null}
    </div>
  );
}

export default ResultsPage;
