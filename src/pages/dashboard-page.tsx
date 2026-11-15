import * as Dialog from "@radix-ui/react-dialog";
import { Link, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  ArrowUpRight,
  Bell,
  Check,
  ChevronRight,
  Clock,
  Contrast,
  Download,
  ExternalLink,
  HardDrive,
  LogOut,
  Plug,
  RotateCcw,
  Search,
  Shield,
  SlidersHorizontal,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  CURRENT_SEMESTER,
  CURRENT_TERM,
  SAMPLE_CGPA,
  courseById,
  courses,
  events,
  notices,
  reminders,
  termCredits,
} from "@/data/demo";
import { formatRange, todayClasses, upcomingClasses } from "@/data/schedule";
import { formatDateLabel } from "@/lib/format";
import { useNow } from "@/lib/use-now";
import { useAppStore } from "@/lib/store";
import { ClassLine } from "@/components/class-line";
import { EmptyState } from "@/components/empty-state";

interface ScheduleRow {
  time: string;
  sun?: { code: string; room: string };
  mon?: { code: string; room: string };
  tue?: { code: string; room: string };
  wed?: { code: string; room: string };
  thu?: { code: string; room: string };
}

type SettingsSectionId =
  | "account"
  | "appearance"
  | "behavior"
  | "notifications"
  | "customize"
  | "apps"
  | "data";

type ThemeMode = "light" | "dark" | "system";

interface WorkspacePrefs {
  theme: ThemeMode;
  language: "en" | "bn";
  compactDensity: boolean;
  defaultLanding: "/dashboard" | "/academics" | "/routine";
  show24HourTime: boolean;
  confirmBeforeReset: boolean;
  classReminders: boolean;
  attendanceWarnings: boolean;
  noticeBadges: boolean;
  hideCgpaOnDashboard: boolean;
  autoMarkNoticeRead: boolean;
  connectedApps: {
    googleCalendar: boolean;
    githubStudent: boolean;
    universityLms: boolean;
  };
}

const SETTINGS_STORAGE_KEY = "uniconnect-workspace-settings-v1";

const DEFAULT_PREFS: WorkspacePrefs = {
  theme: "light",
  language: "en",
  compactDensity: false,
  defaultLanding: "/dashboard",
  show24HourTime: true,
  confirmBeforeReset: true,
  classReminders: true,
  attendanceWarnings: true,
  noticeBadges: true,
  hideCgpaOnDashboard: false,
  autoMarkNoticeRead: true,
  connectedApps: {
    googleCalendar: true,
    githubStudent: true,
    universityLms: false,
  },
};

const SETTINGS_NAV_ITEMS: { id: SettingsSectionId; label: string; icon: typeof User }[] = [
  { id: "account", label: "Account", icon: User },
  { id: "appearance", label: "Appearance", icon: Contrast },
  { id: "behavior", label: "Behavior", icon: SlidersHorizontal },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "customize", label: "Customize", icon: Sparkles },
  { id: "apps", label: "Connected Apps", icon: Plug },
  { id: "data", label: "Data Controls", icon: Shield },
];

const LIGHT_ONLY_BLACK_HOVER =
  "[html:not([data-theme=dark]):not(.dark)_&]:hover:border-neutral-950 [html:not([data-theme=dark]):not(.dark)_&]:hover:bg-neutral-950 [html:not([data-theme=dark]):not(.dark)_&]:hover:text-white";

const LIGHT_ONLY_ICON_HOVER =
  "text-muted transition-ui [html:not([data-theme=dark]):not(.dark)_&]:group-hover:text-white";

const HOVER_BLACK_PILL = `group inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 type-xs font-medium text-fg transition-ui hover:bg-sunken ${LIGHT_ONLY_BLACK_HOVER}`;

const HOVER_BLACK_ACTION = `group inline-flex h-9 items-center gap-2 rounded-full border border-line bg-surface px-4 type-xs font-medium text-fg transition-ui hover:bg-sunken ${LIGHT_ONLY_BLACK_HOVER}`;

function applyThemeToDocument(mode: ThemeMode) {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const shouldBeDark = mode === "dark" || (mode === "system" && prefersDark);
  root.classList.toggle("dark", shouldBeDark);
  root.setAttribute("data-theme", shouldBeDark ? "dark" : "light");
  try {
    localStorage.setItem("theme", mode);
  } catch {
    // Ignore storage quota restrictions
  }
}

const WEEKLY_SCHEDULE: ScheduleRow[] = [
  {
    time: "09:00 - 10:30",
    sun: { code: "SESDP", room: "507" },
    thu: { code: "SE&DP Lab", room: "310" },
  },
  {
    time: "10:30 - 12:00",
    sun: { code: "AI", room: "507" },
    mon: { code: "SE&DP", room: "506" },
    thu: { code: "SE&DP Lab", room: "310" },
  },
  {
    time: "12:00 - 01:30",
    sun: { code: "TOC", room: "506" },
    mon: { code: "Web Project Lab", room: "309" },
    thu: { code: "AI", room: "506" },
  },
  {
    time: "01:30 - 03:00",
    thu: { code: "TOC", room: "507" },
  },
  {
    time: "03:00 - 04:30",
    tue: { code: "AI Lab", room: "311" },
  },
  {
    time: "04:30 - 06:00",
    tue: { code: "AI Lab", room: "311" },
  },
];

const FACULTY_LEGEND = [
  {
    name: "Tahsin Jahan Mim",
    courses: [
      "CSE 417 · Software Engineering & Design Pattern (SE&DP)",
      "CSE 418 · Software Engineering & Design Pattern Lab (SE&DP Lab)",
    ],
  },
  {
    name: "Golam Mostofa Naeem Sir",
    courses: ["CSE 323 · Web Programming Lab", "CSE 300 · Project"],
  },
  {
    name: "Bushra Kamal Hussaina Ma'am",
    courses: [
      "CSE 421 · Artificial Intelligence (AI)",
      "CSE 422 · Artificial Intelligence Lab (AI Lab)",
    ],
  },
  {
    name: "Raisa Fairuz Ma'am",
    courses: ["CSE 325 · Theory of Computation (TOC)"],
  },
];

const NOTICE_CARD_COVERS = [
  {
    image: "/university-bg.jpg",
    readTime: "3 min read",
    tags: ["Academic Notice", "Registrar"],
  },
  {
    image: "/dashboard-hero.jpg",
    readTime: "2 min read",
    tags: ["Examination", "Department of CSE"],
  },
  {
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80",
    readTime: "4 min read",
    tags: ["Course Registration", "Semester 7"],
  },
  {
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
    readTime: "2 min read",
    tags: ["Library & Archive", "Campus Update"],
  },
];

const EVENT_CARD_COVERS = [
  {
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
    tags: ["Symposium", "Computer Science"],
  },
  {
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
    tags: ["Workshop", "Student Research"],
  },
  {
    image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=800&q=80",
    tags: ["Campus Seminar", "Open Session"],
  },
  {
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80",
    tags: ["Tech Showcase", "Annual Event"],
  },
];

export function DashboardPage({ defaultSettingsOpen = false }: { defaultSettingsOpen?: boolean }) {
  const navigate = useNavigate();
  const profile = useAppStore((state) => state.profile);
  const readNoticeIds = useAppStore((state) => state.readNoticeIds);
  const markNoticeRead = useAppStore((state) => state.markNoticeRead);

  const displayName =
    !profile.name || profile.name === "Rahim Ahmed" ? "Tahmid Anwar Mubin" : profile.name;
  const displayStudentId =
    !profile.studentId || profile.studentId === "DEMO-2022-0148"
      ? "232-115-310"
      : profile.studentId;
  const displayBatch = !profile.batch ? "45" : profile.batch;
  const displaySection = !profile.section ? "A" : profile.section;

  const [routineModalOpen, setRoutineModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(defaultSettingsOpen);
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsSectionId>("account");
  const [settingsSearch, setSettingsSearch] = useState("");
  const [completedReminderIds, setCompletedReminderIds] = useState<string[]>([]);

  const [browserPermission, setBrowserPermission] = useState<NotificationPermission | "unsupported">(
    () => {
      if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
      return Notification.permission;
    },
  );

  const [prefs, setPrefs] = useState<WorkspacePrefs>(() => {
    if (typeof window === "undefined") return DEFAULT_PREFS;
    const isCurrentlyDark =
      document.documentElement.classList.contains("dark") ||
      document.documentElement.dataset.theme === "dark";
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_PREFS,
          ...parsed,
          theme: isCurrentlyDark ? "dark" : "light",
          connectedApps: {
            ...DEFAULT_PREFS.connectedApps,
            ...(parsed.connectedApps ?? {}),
          },
        };
      }
    } catch {
      // Fallback to DOM state
    }
    return { ...DEFAULT_PREFS, theme: isCurrentlyDark ? "dark" : "light" };
  });

  useEffect(() => {
    setSettingsModalOpen(defaultSettingsOpen);
  }, [defaultSettingsOpen]);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // Ignore storage quota errors
    }
  }, [prefs]);

  function handleSettingsOpenChange(open: boolean) {
    setSettingsModalOpen(open);
    if (!open && defaultSettingsOpen) {
      navigate({ to: "/dashboard" });
    }
  }

  function updatePref<K extends keyof WorkspacePrefs>(key: K, value: WorkspacePrefs[K]) {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  }

  function handleThemeChange(mode: ThemeMode) {
    updatePref("theme", mode);
    applyThemeToDocument(mode);
    toast(`Theme set to ${mode === "system" ? "System default" : mode === "dark" ? "Dark" : "Light"}.`);
  }

  function toggleConnectedApp(appKey: keyof WorkspacePrefs["connectedApps"], label: string) {
    const nextValue = !prefs.connectedApps[appKey];
    setPrefs((prev) => ({
      ...prev,
      connectedApps: {
        ...prev.connectedApps,
        [appKey]: nextValue,
      },
    }));
    toast(nextValue ? `${label} connected.` : `${label} disconnected.`);
  }

  async function requestSystemNotifications() {
    if (typeof window === "undefined" || !("Notification" in window)) {
      toast("Browser desktop notifications are not supported on this device.");
      return;
    }
    const result = await Notification.requestPermission();
    setBrowserPermission(result);
    if (result === "granted") {
      toast("Desktop notifications enabled for class and exam alerts.");
    } else {
      toast("Notification permission was not granted by the browser.");
    }
  }

  function handleMarkAllNoticesRead() {
    notices.forEach((notice) => markNoticeRead(notice.id));
    toast(`Marked all ${notices.length} notices as read.`);
  }

  function handleExportWorkspaceJson() {
    const payload = {
      exportedAt: new Date().toISOString(),
      workspace: "Metropolitan University Student Portal",
      term: CURRENT_TERM,
      profile: {
        ...profile,
        name: displayName,
        studentId: displayStudentId,
      },
      preferences: prefs,
      readNoticeIds,
      enrolledCourses: courses.map((c) => ({ id: c.id, code: c.code, title: c.title })),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${displayStudentId}-workspace-backup.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast("Workspace backup downloaded as JSON.");
  }

  function handleExportCalendarIcs() {
    const icsLines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Metropolitan University//Student Workspace//EN",
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
    link.download = `${CURRENT_SEMESTER.toLowerCase().replace(/\s+/g, "-")}-schedule.ics`;
    link.click();
    URL.revokeObjectURL(url);
    toast("Course schedule exported (.ics) for Google/Apple Calendar.");
  }

  function handleResetBrowserStorage() {
    try {
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
    } catch {
      // Ignore
    }
    setPrefs(DEFAULT_PREFS);
    applyThemeToDocument(DEFAULT_PREFS.theme);
    toast("Workspace preferences reset to defaults.");
  }

  function toggleReminder(id: string) {
    setCompletedReminderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  const now = useNow();
  const unread = notices.filter((notice) => !readNoticeIds.includes(notice.id)).length;
  const today = now ? todayClasses(now) : [];
  const upcoming = now ? upcomingClasses(now, 3) : [];
  const next = upcoming[0];
  const latestNotices = [...notices].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 4);
  const soonEvents = [...events].sort((a, b) => (a.date < b.date ? -1 : 1)).slice(0, 4);

  const normalizedQuery = settingsSearch.trim().toLowerCase();

  const searchableItems: {
    id: string;
    section: string;
    tabId: SettingsSectionId;
    title: string;
    description: string;
  }[] = [
    {
      id: "s-account",
      section: "Account",
      tabId: "account",
      title: "Manage Account & Student Identity",
      description: `${displayName} · ${profile.email} · ${displayStudentId}`,
    },
    {
      id: "s-lang",
      section: "Account",
      tabId: "account",
      title: "Workspace Language",
      description: "Switch display language between English and Bangla",
    },
    {
      id: "s-theme",
      section: "Appearance",
      tabId: "appearance",
      title: "Color Mode (Light, Dark, System)",
      description: "Control light surface or dark interface mode",
    },
    {
      id: "s-density",
      section: "Appearance",
      tabId: "appearance",
      title: "Compact Table Density",
      description: "Reduce vertical spacing across courses and routine tables",
    },
    {
      id: "s-landing",
      section: "Behavior",
      tabId: "behavior",
      title: "Default Startup View",
      description: "Choose Home, Academics, or Weekly Routine on launch",
    },
    {
      id: "s-notif",
      section: "Notifications",
      tabId: "notifications",
      title: "Desktop Alerts & Attendance Warnings",
      description: "Class reminders and 75% minimum attendance notifications",
    },
    {
      id: "s-privacy",
      section: "Customize",
      tabId: "customize",
      title: "Mask CGPA on Shared Screens",
      description: "Hide cumulative GPA figure on the home stat grid",
    },
    {
      id: "s-apps",
      section: "Connected Apps",
      tabId: "apps",
      title: "Google Calendar (.ics), GitHub Student & University LMS",
      description: "Manage external academic tool connections",
    },
    {
      id: "s-data",
      section: "Data Controls",
      tabId: "data",
      title: "Export Workspace Backup & Clear Local Storage",
      description: "Download JSON snapshot or reset browser preferences",
    },
  ];

  const matchingSearchItems = normalizedQuery
    ? searchableItems.filter(
        (item) =>
          item.title.toLowerCase().includes(normalizedQuery) ||
          item.description.toLowerCase().includes(normalizedQuery) ||
          item.section.toLowerCase().includes(normalizedQuery),
      )
    : [];

  return (
    <div className="flex flex-col gap-12">
      {/* Formal Academic Header */}
      <header className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div className="measure">
          <p className="type-label">{CURRENT_TERM} · METROPOLITAN UNIVERSITY</p>
          <h1 className="mt-2 type-3xl font-semibold tracking-tight text-fg">
            Academic Overview
          </h1>
          <p className="mt-3 type-base text-muted">
            {displayName} · ID: {displayStudentId} · {CURRENT_SEMESTER} ({profile.department || "CSE"}) · {termCredits()} credits enrolled
            {now ? ` · ${format(now, "EEEE, d MMMM yyyy")}` : ""}.
          </p>
        </div>

        {/* Action Button Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/academics" className={HOVER_BLACK_ACTION}>
            <span>Curriculum &amp; Grades</span>
            <ArrowUpRight size={14} strokeWidth={1.75} className={LIGHT_ONLY_ICON_HOVER} />
          </Link>
        </div>
      </header>

      {/* 3-Column Stat Grid */}
      <dl className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-3">
        <Stat
          label="Cumulative CGPA"
          value={prefs.hideCgpaOnDashboard ? "••••" : SAMPLE_CGPA.toFixed(2)}
          note={prefs.hideCgpaOnDashboard ? "Masked in Settings · Customize" : "Based on completed semester evaluations"}
        />
        <Stat label="This term" value={String(termCredits())} note="Enrolled credit hours" />
        <Stat label="Unread notices" value={String(unread)} note="Active bulletins" />
      </dl>

      {/* Today & Coming Up Schedule Row */}
      <div className="grid items-start gap-10 lg:grid-cols-2">
        <section>
          <div className="flex items-end justify-between gap-4">
            <h2 className="type-lg text-fg">Today</h2>
            <button
              type="button"
              onClick={() => setRoutineModalOpen(true)}
              className={HOVER_BLACK_PILL}
            >
              <span>Full routine</span>
              <ArrowUpRight size={12} className={LIGHT_ONLY_ICON_HOVER} />
            </button>
          </div>
          {!now ? (
            <div className="mt-4 space-y-3" aria-hidden>
              <div className="h-4 w-40 bg-sunken" />
              <div className="h-12 bg-sunken" />
              <div className="h-12 bg-sunken" />
            </div>
          ) : today.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title="No classes scheduled for today."
                body={
                  next
                    ? `Next class is ${courseById[next.session.courseId]?.title ?? "a class"} on ${next.start.toLocaleDateString("en-GB", { weekday: "long" })}.`
                    : "No further lectures scheduled for this week."
                }
              />
            </div>
          ) : (
            <ul className="mt-2">
              {today.map((item) => (
                <li key={item.session.id}>
                  <ClassLine item={item} now={now} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <div className="flex items-end justify-between gap-4">
            <h2 className="type-lg text-fg">Coming up</h2>
            <Link to="/routine" className={HOVER_BLACK_PILL}>
              <span>Weekly view</span>
              <ChevronRight size={13} className={LIGHT_ONLY_ICON_HOVER} />
            </Link>
          </div>
          {!now ? null : upcoming.length === 0 ? (
            <p className="mt-3 type-sm text-muted">No upcoming classes scheduled.</p>
          ) : (
            <ul className="mt-2 divide-y divide-line border-y border-line">
              {upcoming.map((item) => {
                const course = courseById[item.session.courseId];
                return (
                  <li key={`${item.weekOffset}-${item.session.id}`} className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr]">
                    <p className="type-sm text-muted">
                      {item.start.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                    </p>
                    <div>
                      <p className="type-sm font-medium text-fg">{course?.title}</p>
                      <p className="type-sm text-muted">
                        {formatRange(item.session.start, item.session.end)} · {item.session.room}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* Editorial 4-Column Notices & News Section */}
      <section className="border-t border-line pt-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="type-2xl text-fg">Latest notices and news</h2>
          <Link to="/notices" className={HOVER_BLACK_ACTION}>
            <span>Read all notices</span>
            <ChevronRight size={15} strokeWidth={1.75} className={LIGHT_ONLY_ICON_HOVER} />
          </Link>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {latestNotices.map((notice, idx) => {
            const isUnread = !readNoticeIds.includes(notice.id);
            const cover = NOTICE_CARD_COVERS[idx % NOTICE_CARD_COVERS.length];

            return (
              <Link
                key={notice.id}
                to="/notices"
                search={{ notice: notice.id }}
                onClick={() => {
                  if (prefs.autoMarkNoticeRead) markNoticeRead(notice.id);
                }}
                className="group flex flex-col"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden border border-line bg-sunken r-md">
                  <img
                    src={cover.image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/15" />

                  <div
                    className={`absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium shadow-xs r-sm ${
                      isUnread
                        ? "bg-fg text-bg"
                        : "border border-line bg-surface/95 text-fg backdrop-blur-xs"
                    }`}
                  >
                    <span>{formatDateLabel(notice.date)}</span>
                    <span className="opacity-50">|</span>
                    <span>{isUnread ? "Unread" : cover.readTime}</span>
                  </div>
                </div>

                <h3 className="mt-3.5 line-clamp-3 type-base font-medium leading-snug text-fg underline-offset-4 group-hover:underline">
                  {notice.title}
                </h3>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {cover.tags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-line bg-sunken px-2 py-0.5 text-[11px] text-muted r-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Editorial 4-Column Events Section */}
      <section className="border-t border-line pt-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="type-2xl text-fg">Upcoming campus events</h2>
          <Link to="/events" className={HOVER_BLACK_ACTION}>
            <span>View all events</span>
            <ChevronRight size={15} strokeWidth={1.75} className={LIGHT_ONLY_ICON_HOVER} />
          </Link>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {soonEvents.map((event, idx) => {
            const cover = EVENT_CARD_COVERS[idx % EVENT_CARD_COVERS.length];

            return (
              <Link
                key={event.id}
                to="/events"
                search={{ event: event.id }}
                className="group flex flex-col"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden border border-line bg-sunken r-md">
                  <img
                    src={cover.image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/15" />

                  <div className="absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 border border-line bg-surface/95 px-2.5 py-1 text-[11px] font-medium text-fg shadow-xs backdrop-blur-xs r-sm">
                    <span>{formatDateLabel(event.date)}</span>
                  </div>
                </div>

                <h3 className="mt-3.5 line-clamp-2 type-base font-medium leading-snug text-fg underline-offset-4 group-hover:underline">
                  {event.title}
                </h3>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="border border-line bg-surface px-2 py-0.5 text-[11px] font-medium text-fg r-sm">
                    {event.venue}
                  </span>
                  {cover.tags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-line bg-sunken px-2 py-0.5 text-[11px] text-muted r-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Modern Interactive Reminders Grid */}
      <section className="border-t border-line pt-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="type-2xl text-fg">Reminders</h2>
            <span className="border border-line bg-sunken px-2.5 py-0.5 type-xs font-medium text-muted r-pill tabular-nums">
              {reminders.length - completedReminderIds.length > 0
                ? `${reminders.length - completedReminderIds.length} pending`
                : "All caught up"}
            </span>
          </div>
          <p className="type-xs text-faint">Click the circle to mark an item complete</p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reminders.map((item) => {
            const isDone = completedReminderIds.includes(item.id);

            return (
              <div
                key={item.id}
                className={`flex flex-col justify-between border p-5 r-lg transition-ui ${
                  isDone
                    ? "border-line/60 bg-sunken/50 opacity-70"
                    : "border-line bg-surface hover:border-fg/40"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 border px-2.5 py-0.5 text-[11px] font-medium r-pill ${
                        isDone
                          ? "border-line bg-bg text-faint"
                          : "border-line bg-sunken text-fg"
                      }`}
                    >
                      <span
                        className={`size-1.5 r-pill ${isDone ? "bg-faint" : "bg-fg"}`}
                        aria-hidden
                      />
                      {isDone ? "Completed" : "Action item"}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleReminder(item.id)}
                      aria-pressed={isDone}
                      aria-label={isDone ? `Mark "${item.title}" as pending` : `Mark "${item.title}" as done`}
                      className={`inline-flex size-7 items-center justify-center border r-pill transition-ui ${
                        isDone
                          ? "border-fg bg-fg text-bg"
                          : `border-line bg-bg text-transparent hover:bg-sunken ${LIGHT_ONLY_BLACK_HOVER}`
                      }`}
                    >
                      <Check size={14} strokeWidth={2.25} />
                    </button>
                  </div>

                  <h3
                    className={`mt-4 type-base font-medium leading-snug ${
                      isDone ? "line-through text-muted" : "text-fg"
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p className="mt-1.5 type-sm text-muted">{item.detail}</p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-line/70 pt-3.5">
                  <span className="type-xs text-faint">{isDone ? "Done" : "Workspace shortcut"}</span>
                  <Link to={item.href} className={HOVER_BLACK_PILL}>
                    <span>Open</span>
                    <ArrowUpRight size={12} strokeWidth={1.75} className={LIGHT_ONLY_ICON_HOVER} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================
          UNICONNECT SETTINGS FLOATING MODAL
         ========================================================= */}
      <Dialog.Root open={settingsModalOpen} onOpenChange={handleSettingsOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay fixed inset-0 z-50 bg-black/50 backdrop-blur-xs" />
          <Dialog.Content
            aria-describedby={undefined}
            className="dialog-panel fixed top-1/2 left-1/2 z-50 flex h-[36rem] max-h-[88dvh] w-[min(54rem,calc(100%-1.5rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-line bg-surface text-fg shadow-2xl md:flex-row"
          >
            {/* LEFT SIDEBAR */}
            <aside className="flex w-full shrink-0 flex-col border-b border-line bg-bg/60 p-3.5 md:w-60 md:border-r md:border-b-0 md:p-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search
                    size={14}
                    strokeWidth={1.75}
                    className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
                  />
                  <input
                    type="search"
                    value={settingsSearch}
                    onChange={(event) => setSettingsSearch(event.target.value)}
                    placeholder="Search"
                    aria-label="Search settings"
                    className="h-9 w-full rounded-xl border border-line bg-surface pr-3 pl-8.5 type-sm text-fg placeholder:text-muted focus:border-fg/40 focus:outline-none"
                  />
                </div>

                <Dialog.Close
                  className={`inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-muted transition-ui hover:bg-sunken ${LIGHT_ONLY_BLACK_HOVER} md:hidden`}
                  aria-label="Close settings"
                >
                  <X size={16} />
                </Dialog.Close>
              </div>

              <nav
                aria-label="Settings categories"
                className="mt-3 flex gap-1 overflow-x-auto pb-1 md:mt-4 md:flex-col md:overflow-visible md:pb-0"
              >
                {SETTINGS_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = !normalizedQuery && activeSettingsTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSettingsSearch("");
                        setActiveSettingsTab(item.id);
                      }}
                      className={`group flex shrink-0 items-center gap-3 rounded-xl px-3 py-2 text-left type-sm font-medium transition-ui hover:bg-sunken/70 ${LIGHT_ONLY_BLACK_HOVER} ${
                        isActive ? "bg-sunken text-fg" : "text-muted"
                      }`}
                    >
                      <Icon
                        size={15}
                        strokeWidth={1.75}
                        className={`transition-ui [html:not([data-theme=dark]):not(.dark)_&]:group-hover:text-white ${
                          isActive ? "text-fg" : "text-muted"
                        }`}
                      />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* RIGHT CONTENT PANE */}
            <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-between">
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 md:p-7">
                <div className="flex items-center justify-between gap-4">
                  <Dialog.Title className="type-lg font-medium text-fg">
                    {normalizedQuery
                      ? "Search Results"
                      : SETTINGS_NAV_ITEMS.find((i) => i.id === activeSettingsTab)?.label ?? "Account"}
                  </Dialog.Title>

                  <Dialog.Close
                    className={`hidden size-8 items-center justify-center rounded-full border border-line bg-bg text-muted transition-ui hover:bg-sunken md:inline-flex ${LIGHT_ONLY_BLACK_HOVER}`}
                    aria-label="Close settings"
                  >
                    <X size={15} />
                  </Dialog.Close>
                </div>

                {/* LIVE SEARCH VIEW */}
                {normalizedQuery ? (
                  <div className="mt-5">
                    {matchingSearchItems.length === 0 ? (
                      <div className="rounded-xl border border-line bg-bg/50 p-6 text-center">
                        <p className="type-sm font-medium text-fg">No matching settings</p>
                        <p className="mt-1 type-xs text-muted">
                          Try searching for theme, notifications, calendar, CGPA, or backup.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-bg/50">
                        {matchingSearchItems.map((match) => (
                          <div
                            key={match.id}
                            className="flex items-center justify-between gap-4 px-4 py-3"
                          >
                            <div>
                              <p className="text-[11px] text-muted">{match.section}</p>
                              <p className="type-sm font-medium text-fg">{match.title}</p>
                              <p className="type-xs text-muted">{match.description}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveSettingsTab(match.tabId);
                                setSettingsSearch("");
                              }}
                              className={HOVER_BLACK_PILL}
                            >
                              <span>Open</span>
                              <ArrowUpRight size={12} className={LIGHT_ONLY_ICON_HOVER} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}

                {/* 1. ACCOUNT TAB */}
                {!normalizedQuery && activeSettingsTab === "account" ? (
                  <div className="mt-5 space-y-5">
                    <div>
                      <p className="mb-2 type-xs font-medium text-muted">Account</p>
                      <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-bg/50">
                        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            {profile.photoDataUrl ? (
                              <img
                                src={profile.photoDataUrl}
                                alt={displayName}
                                className="size-10 rounded-full border border-line object-cover"
                              />
                            ) : (
                              <div className="flex size-10 items-center justify-center rounded-full border border-line bg-sunken type-sm font-medium text-fg">
                                MU
                              </div>
                            )}
                            <div>
                              <p className="type-sm font-medium text-fg">{displayName}</p>
                              <p className="type-xs text-muted">{profile.email}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Link
                              to="/profile"
                              onClick={() => handleSettingsOpenChange(false)}
                              className={HOVER_BLACK_PILL}
                            >
                              <span>Manage Account</span>
                              <ExternalLink size={12} strokeWidth={1.75} className={LIGHT_ONLY_ICON_HOVER} />
                            </Link>
                            <button
                              type="button"
                              onClick={() => {
                                handleSettingsOpenChange(false);
                                toast("Signed out from session.");
                              }}
                              className={HOVER_BLACK_PILL}
                            >
                              <LogOut size={12} strokeWidth={1.75} className={LIGHT_ONLY_ICON_HOVER} />
                              <span>Sign out</span>
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
                          <div>
                            <p className="type-sm font-medium text-fg">Registrar Student ID</p>
                            <p className="type-xs text-muted">
                              {displayStudentId} · Batch {displayBatch} (Sec {displaySection})
                            </p>
                          </div>
                          <span className={HOVER_BLACK_PILL}>
                            <Check size={12} strokeWidth={2} className={LIGHT_ONLY_ICON_HOVER} />
                            <span>Verified</span>
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-4 px-4 py-3.5">
                          <p className="type-sm font-medium text-fg">Department</p>
                          <p className="type-sm text-muted">{profile.department || "Computer Science & Engineering"}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 type-xs font-medium text-muted">App</p>
                      <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-bg/50">
                        <div className="flex items-center justify-between gap-4 px-4 py-3.5">
                          <p className="type-sm font-medium text-fg">Language</p>
                          <select
                            aria-label="Language"
                            value={prefs.language}
                            onChange={(event) => {
                              const next = event.target.value as "en" | "bn";
                              updatePref("language", next);
                              toast(
                                next === "bn"
                                  ? "Language set to Bangla."
                                  : "Language set to English.",
                              );
                            }}
                            className={`h-8 rounded-full border border-line bg-surface px-3.5 type-xs font-medium text-fg transition-ui hover:bg-sunken focus:outline-none ${LIGHT_ONLY_BLACK_HOVER}`}
                          >
                            <option value="en">English</option>
                            <option value="bn">বাংলা (Bangla)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 type-xs font-medium text-muted">Enrollment</p>
                      <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-bg/50">
                        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
                          <div>
                            <p className="type-sm font-medium text-fg">
                              {CURRENT_SEMESTER} · {CURRENT_TERM}
                            </p>
                            <p className="type-xs text-muted">{profile.program}</p>
                          </div>
                          <Link
                            to="/academics"
                            onClick={() => handleSettingsOpenChange(false)}
                            className={HOVER_BLACK_PILL}
                          >
                            <span>Academic Overview</span>
                            <ArrowUpRight size={12} className={LIGHT_ONLY_ICON_HOVER} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* 2. APPEARANCE TAB */}
                {!normalizedQuery && activeSettingsTab === "appearance" ? (
                  <div className="mt-5 space-y-5">
                    <div>
                      <p className="mb-2 type-xs font-medium text-muted">Theme</p>
                      <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-bg/50">
                        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
                          <div>
                            <p className="type-sm font-medium text-fg">Color Mode</p>
                            <p className="type-xs text-muted">
                              Switch between Light, Dark, or System preference
                            </p>
                          </div>

                          <div className="inline-flex rounded-full border border-line bg-surface p-0.5">
                            {(["light", "dark", "system"] as const).map((mode) => {
                              const active = prefs.theme === mode;
                              return (
                                <button
                                  key={mode}
                                  type="button"
                                  onClick={() => handleThemeChange(mode)}
                                  className={`rounded-full px-3 py-1 type-xs font-medium capitalize transition-ui ${LIGHT_ONLY_BLACK_HOVER} ${
                                    active
                                      ? "bg-sunken text-fg"
                                      : "text-muted hover:text-fg"
                                  }`}
                                >
                                  {mode}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <ModalToggleRow
                          title="Compact table density"
                          description="Tighter spacing across course syllabi and routine tables"
                          checked={prefs.compactDensity}
                          onChange={(checked) => updatePref("compactDensity", checked)}
                        />
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* 3. BEHAVIOR TAB */}
                {!normalizedQuery && activeSettingsTab === "behavior" ? (
                  <div className="mt-5 space-y-5">
                    <div>
                      <p className="mb-2 type-xs font-medium text-muted">Workspace Behavior</p>
                      <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-bg/50">
                        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
                          <div>
                            <p className="type-sm font-medium text-fg">Default startup view</p>
                            <p className="type-xs text-muted">Primary page opened on launch</p>
                          </div>

                          <select
                            aria-label="Default startup view"
                            value={prefs.defaultLanding}
                            onChange={(event) => {
                              updatePref(
                                "defaultLanding",
                                event.target.value as WorkspacePrefs["defaultLanding"],
                              );
                              toast("Default startup view updated.");
                            }}
                            className={`h-8 rounded-full border border-line bg-surface px-3.5 type-xs font-medium text-fg transition-ui hover:bg-sunken focus:outline-none ${LIGHT_ONLY_BLACK_HOVER}`}
                          >
                            <option value="/dashboard">Home</option>
                            <option value="/academics">Academic Overview</option>
                            <option value="/routine">Weekly Routine</option>
                          </select>
                        </div>

                        <ModalToggleRow
                          title="24-hour academic clock"
                          description="Show class slots in 24-hour format"
                          checked={prefs.show24HourTime}
                          onChange={(checked) => updatePref("show24HourTime", checked)}
                        />

                        <ModalToggleRow
                          title="Auto-mark notices read on open"
                          description="Clear unread badge immediately when clicking a notice"
                          checked={prefs.autoMarkNoticeRead}
                          onChange={(checked) => updatePref("autoMarkNoticeRead", checked)}
                        />
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* 4. NOTIFICATIONS TAB */}
                {!normalizedQuery && activeSettingsTab === "notifications" ? (
                  <div className="mt-5 space-y-5">
                    <div>
                      <p className="mb-2 type-xs font-medium text-muted">System Access</p>
                      <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-bg/50">
                        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
                          <div>
                            <p className="type-sm font-medium text-fg">Desktop notifications</p>
                            <p className="type-xs text-muted">
                              Permission: <span className="capitalize text-fg">{browserPermission}</span>
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={requestSystemNotifications}
                            className={HOVER_BLACK_PILL}
                          >
                            {browserPermission === "granted" ? "Enabled" : "Allow Access"}
                          </button>
                        </div>

                        <ModalToggleRow
                          title="Upcoming class reminders"
                          description="Alert 15 minutes before scheduled classes"
                          checked={prefs.classReminders}
                          onChange={(checked) => updatePref("classReminders", checked)}
                        />

                        <ModalToggleRow
                          title="75% attendance warnings"
                          description="Highlight courses below minimum exam eligibility"
                          checked={prefs.attendanceWarnings}
                          onChange={(checked) => updatePref("attendanceWarnings", checked)}
                        />
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* 5. CUSTOMIZE TAB */}
                {!normalizedQuery && activeSettingsTab === "customize" ? (
                  <div className="mt-5 space-y-5">
                    <div>
                      <p className="mb-2 type-xs font-medium text-muted">Home Display</p>
                      <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-bg/50">
                        <ModalToggleRow
                          title="Mask CGPA on home"
                          description="Hide cumulative GPA figure when sharing your screen"
                          checked={prefs.hideCgpaOnDashboard}
                          onChange={(checked) => updatePref("hideCgpaOnDashboard", checked)}
                        />

                        <ModalToggleRow
                          title="Confirm before resetting storage"
                          description="Ask before clearing local browser preferences"
                          checked={prefs.confirmBeforeReset}
                          onChange={(checked) => updatePref("confirmBeforeReset", checked)}
                        />
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* 6. CONNECTED APPS TAB */}
                {!normalizedQuery && activeSettingsTab === "apps" ? (
                  <div className="mt-5 space-y-5">
                    <div>
                      <p className="mb-2 type-xs font-medium text-muted">External Tools</p>
                      <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-bg/50">
                        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
                          <div>
                            <p className="type-sm font-medium text-fg">Calendar Schedule (.ics)</p>
                            <p className="type-xs text-muted">
                              Download {CURRENT_SEMESTER} timetable for Google/Apple Calendar
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleExportCalendarIcs}
                              className={HOVER_BLACK_PILL}
                            >
                              <Download size={12} className={LIGHT_ONLY_ICON_HOVER} />
                              <span>Export .ics</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleConnectedApp("googleCalendar", "Google Calendar")}
                              className={HOVER_BLACK_PILL}
                            >
                              {prefs.connectedApps.googleCalendar ? "Connected" : "Connect"}
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
                          <div>
                            <p className="type-sm font-medium text-fg">GitHub Student</p>
                            <p className="type-xs text-muted">Sync lab repositories and project links</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleConnectedApp("githubStudent", "GitHub Student")}
                            className={HOVER_BLACK_PILL}
                          >
                            {prefs.connectedApps.githubStudent ? "Connected" : "Connect"}
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
                          <div>
                            <p className="type-sm font-medium text-fg">University LMS</p>
                            <p className="type-xs text-muted">Sync admit cards and official routines</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleConnectedApp("universityLms", "University LMS")}
                            className={HOVER_BLACK_PILL}
                          >
                            {prefs.connectedApps.universityLms ? "Connected" : "Connect"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* 7. DATA CONTROLS TAB */}
                {!normalizedQuery && activeSettingsTab === "data" ? (
                  <div className="mt-5 space-y-5">
                    <div>
                      <p className="mb-2 type-xs font-medium text-muted">Storage &amp; Backups</p>
                      <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-bg/50">
                        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
                          <div>
                            <p className="type-sm font-medium text-fg">Export workspace JSON</p>
                            <p className="type-xs text-muted">Save profile edits and preferences</p>
                          </div>
                          <button
                            type="button"
                            onClick={handleExportWorkspaceJson}
                            className={HOVER_BLACK_PILL}
                          >
                            <Download size={12} className={LIGHT_ONLY_ICON_HOVER} />
                            <span>Download JSON</span>
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
                          <div>
                            <p className="type-sm font-medium text-fg">Mark all notices read</p>
                            <p className="type-xs text-muted">
                              {readNoticeIds.length}/{notices.length} notices read
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleMarkAllNoticesRead}
                            className={HOVER_BLACK_PILL}
                          >
                            <Check size={12} className={LIGHT_ONLY_ICON_HOVER} />
                            <span>Mark Read</span>
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
                          <div>
                            <p className="type-sm font-medium text-danger">Reset preferences</p>
                            <p className="type-xs text-muted">Restore default local settings</p>
                          </div>
                          <button
                            type="button"
                            onClick={handleResetBrowserStorage}
                            className={`group inline-flex h-8 items-center gap-1.5 rounded-full border border-danger/40 bg-surface px-3.5 type-xs font-medium text-danger transition-ui hover:bg-sunken ${LIGHT_ONLY_BLACK_HOVER}`}
                          >
                            <RotateCcw size={12} />
                            <span>Reset</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* BOTTOM STATUS BAR */}
              <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-line bg-bg/60 px-5 py-3 sm:px-6">
                <div className="flex items-center gap-2 type-xs text-muted">
                  <HardDrive size={13} strokeWidth={1.75} className="shrink-0 text-fg" />
                  <span>
                    <strong className="font-medium text-fg">Browser-local storage</strong> · Auto-saved on this device
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleExportWorkspaceJson}
                  className={HOVER_BLACK_PILL}
                >
                  Export Backup
                </button>
              </footer>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Full Routine Popup Modal */}
      <Dialog.Root open={routineModalOpen} onOpenChange={setRoutineModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay fixed inset-0 z-50 bg-black/50 backdrop-blur-xs" />
          <Dialog.Content
            aria-describedby={undefined}
            className="dialog-panel fixed top-1/2 left-1/2 z-50 max-h-[90dvh] w-[min(56rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto border border-line bg-surface p-6 shadow-float r-lg md:p-8"
          >
            <div className="flex items-start justify-between gap-4 border-b border-line pb-5">
              <div>
                <p className="type-label text-muted">Metropolitan University · Department of CSE</p>
                <Dialog.Title className="mt-1.5 type-xl font-medium text-fg">
                  CSE 45th (A) — Class Schedule
                </Dialog.Title>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/routine"
                  onClick={() => setRoutineModalOpen(false)}
                  className={HOVER_BLACK_PILL}
                >
                  <span>Full page</span>
                  <ArrowUpRight size={13} className={LIGHT_ONLY_ICON_HOVER} />
                </Link>
                <Dialog.Close
                  className={`inline-flex size-8 items-center justify-center rounded-full border border-line bg-bg text-muted transition-ui hover:bg-sunken ${LIGHT_ONLY_BLACK_HOVER}`}
                  aria-label="Close routine modal"
                >
                  <X size={15} />
                </Dialog.Close>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto border border-line bg-bg r-md">
              <table className="w-full min-w-[42rem] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line bg-sunken">
                    <th className="w-36 border-r border-line px-3.5 py-3 type-xs font-medium text-fg">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock size={13} className="text-muted" />
                        Time
                      </span>
                    </th>
                    <th className="border-r border-line px-3.5 py-3 text-center type-xs font-medium text-fg">
                      Sunday
                    </th>
                    <th className="border-r border-line px-3.5 py-3 text-center type-xs font-medium text-fg">
                      Monday
                    </th>
                    <th className="border-r border-line px-3.5 py-3 text-center type-xs font-medium text-fg">
                      Tuesday
                    </th>
                    <th className="border-r border-line px-3.5 py-3 text-center type-xs font-medium text-fg">
                      Wednesday
                    </th>
                    <th className="px-3.5 py-3 text-center type-xs font-medium text-fg">
                      Thursday
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {WEEKLY_SCHEDULE.map((row) => (
                    <tr key={row.time} className="transition-ui hover:bg-sunken/40">
                      <td className="border-r border-line bg-sunken/40 px-3.5 py-3 type-xs font-medium tabular-nums text-muted">
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
                              <div className="inline-flex flex-col items-center rounded border border-line bg-surface px-2.5 py-1">
                                <span className="type-xs font-medium text-fg">{slot.code}</span>
                                <span className="text-[11px] tabular-nums text-muted">Room {slot.room}</span>
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

            <div className="mt-6">
              <p className="type-label text-muted">Course &amp; Faculty Directory</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {FACULTY_LEGEND.map((faculty) => (
                  <div key={faculty.name} className="border border-line bg-bg p-3.5 r-md">
                    <p className="type-sm font-medium text-fg">{faculty.name}</p>
                    <ul className="mt-1.5 space-y-1">
                      {faculty.courses.map((courseLine) => (
                        <li key={courseLine} className="type-xs text-muted">
                          {courseLine}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

function ModalToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5">
      <div>
        <p className="type-sm font-medium text-fg">{title}</p>
        <p className="type-xs text-muted">{description}</p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-ui ${
          checked ? "border-fg bg-fg" : "border-line bg-sunken"
        }`}
      >
        <span
          className={`inline-block size-4 rounded-full transition-transform duration-200 ${
            checked ? "translate-x-5.5 bg-bg" : "translate-x-1 bg-muted"
          }`}
        />
      </button>
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="bg-bg px-4 py-4">
      <dt className="type-label">{label}</dt>
      <dd className="mt-2 type-xl tabular-nums text-fg">{value}</dd>
      <p className="mt-1 type-xs text-faint">{note}</p>
    </div>
  );
}