import {
  ArrowRight,
  BookOpen,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Database,
  GraduationCap,
  LineChart,
  Megaphone,
  MessageSquareWarning,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { type AdminTab } from "./admin-header";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { type StudentRecord } from "@/data/demo";

interface AdminOverviewProps {
  onNavigateTab: (tab: AdminTab) => void;
  coursesCount: number;
  noticesCount: number;
  studentsCount: number;
  sessionsCount: number;
  eventsCount: number;
  complaintsCount: number;
  transcriptCount: number;
  notificationsCount: number;
  activeStudent: StudentRecord | null;
}

export function AdminOverview({
  onNavigateTab,
  coursesCount,
  noticesCount,
  studentsCount,
  sessionsCount,
  eventsCount,
  complaintsCount,
  transcriptCount,
  notificationsCount,
  activeStudent,
}: AdminOverviewProps) {
  const profile = useAppStore((state) => state.profile);

  return (
    <div className="space-y-10">
      {/* Editorial Title */}
      <div>
        <p className="type-label">System Overview</p>
        <h2 className="mt-1 type-2xl font-semibold tracking-tight text-fg">
          Administrative Control Dashboard
        </h2>
        <p className="mt-1 type-sm text-muted">
          Real-time registrar operations, course catalog management, academic schedule dispatching, and student record synchronization.
        </p>
      </div>

      {/* Metrics Row */}
      <dl className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3 lg:grid-cols-6">
        <div className="bg-bg p-4 sm:p-5">
          <dt className="type-label">Courses</dt>
          <dd className="mt-2 type-2xl font-semibold tabular-nums text-fg">{coursesCount}</dd>
          <p className="mt-1 type-xs text-muted">Active in catalog</p>
        </div>
        <div className="bg-bg p-4 sm:p-5">
          <dt className="type-label">Notices</dt>
          <dd className="mt-2 type-2xl font-semibold tabular-nums text-fg">{noticesCount}</dd>
          <p className="mt-1 type-xs text-muted">Published circulars</p>
        </div>
        <div className="bg-bg p-4 sm:p-5">
          <dt className="type-label">Students</dt>
          <dd className="mt-2 type-2xl font-semibold tabular-nums text-fg">{studentsCount}</dd>
          <p className="mt-1 type-xs text-muted">Directory roster</p>
        </div>
        <div className="bg-bg p-4 sm:p-5">
          <dt className="type-label">Sessions</dt>
          <dd className="mt-2 type-2xl font-semibold tabular-nums text-fg">{sessionsCount}</dd>
          <p className="mt-1 type-xs text-muted">Weekly timetable</p>
        </div>
        <div className="bg-bg p-4 sm:p-5">
          <dt className="type-label">Events</dt>
          <dd className="mt-2 type-2xl font-semibold tabular-nums text-fg">{eventsCount}</dd>
          <p className="mt-1 type-xs text-muted">Campus activities</p>
        </div>
        <div className="bg-bg p-4 sm:p-5">
          <dt className="type-label">Complaints</dt>
          <dd className="mt-2 type-2xl font-semibold tabular-nums text-fg">{complaintsCount}</dd>
          <p className="mt-1 type-xs text-muted">Inquiry queue</p>
        </div>
      </dl>

      {/* Active Student Portal Session Card */}
      <div className="border border-line bg-surface p-6 r-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-line bg-sunken text-fg">
              <UserCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="type-label">Portal Active Student</span>
                <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                  Logged In
                </span>
              </div>
              <h3 className="mt-1 type-lg font-medium text-fg">
                {profile.name}{" "}
                <span className="font-mono type-sm text-muted">({profile.studentId})</span>
              </h3>
              <p className="mt-0.5 type-sm text-muted">
                {profile.department} · {profile.batch} · {profile.semesterLabel} · Section {profile.section}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="secondary"
              onClick={() => onNavigateTab("students")}
              className="h-9 px-3.5 text-xs"
            >
              <Users size={14} className="text-muted" />
              <span>Switch Active Student</span>
            </Button>
            <Button asChild variant="secondary" className="h-9 px-3.5 text-xs font-medium">
              <Link to="/profile">
                <span>View Profile View</span>
                <ArrowRight size={14} className="text-muted" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Operational Dispatch Modules */}
      <div>
        <h3 className="type-lg font-semibold text-fg">Module Management</h3>
        <p className="mt-0.5 type-sm text-muted">
          Select a system domain to create, update, filter, or delete active institutional records.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <button
            type="button"
            onClick={() => onNavigateTab("courses")}
            className="group flex flex-col justify-between border border-line bg-surface p-5 text-left r-lg transition-ui hover:border-fg/40 hover:bg-sunken/40"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex size-9 items-center justify-center rounded-md border border-line bg-bg text-fg">
                  <BookOpen size={18} />
                </div>
                <span className="type-xs font-medium tabular-nums text-muted">{coursesCount} courses</span>
              </div>
              <h4 className="mt-3 type-base font-medium text-fg">Course Catalog</h4>
              <p className="mt-1 type-xs text-muted">
                Course syllabi, credit allocations, faculty instructor assignments, and assessment weighting.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 type-xs font-medium text-fg group-hover:underline">
              <span>Manage Courses</span>
              <ArrowRight size={12} />
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab("notices")}
            className="group flex flex-col justify-between border border-line bg-surface p-5 text-left r-lg transition-ui hover:border-fg/40 hover:bg-sunken/40"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex size-9 items-center justify-center rounded-md border border-line bg-bg text-fg">
                  <Megaphone size={18} />
                </div>
                <span className="type-xs font-medium tabular-nums text-muted">{noticesCount} notices</span>
              </div>
              <h4 className="mt-3 type-base font-medium text-fg">Notices & Circulars</h4>
              <p className="mt-1 type-xs text-muted">
                Publish academic memos, examination schedules, departmental updates, and urgent alerts.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 type-xs font-medium text-fg group-hover:underline">
              <span>Manage Notices</span>
              <ArrowRight size={12} />
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab("students")}
            className="group flex flex-col justify-between border border-line bg-surface p-5 text-left r-lg transition-ui hover:border-fg/40 hover:bg-sunken/40"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex size-9 items-center justify-center rounded-md border border-line bg-bg text-fg">
                  <Users size={18} />
                </div>
                <span className="type-xs font-medium tabular-nums text-muted">{studentsCount} enrolled</span>
              </div>
              <h4 className="mt-3 type-base font-medium text-fg">Student Directory</h4>
              <p className="mt-1 type-xs text-muted">
                Student roster, department allotments, contact credentials, and session identity switching.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 type-xs font-medium text-fg group-hover:underline">
              <span>Manage Students</span>
              <ArrowRight size={12} />
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab("routine")}
            className="group flex flex-col justify-between border border-line bg-surface p-5 text-left r-lg transition-ui hover:border-fg/40 hover:bg-sunken/40"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex size-9 items-center justify-center rounded-md border border-line bg-bg text-fg">
                  <CalendarDays size={18} />
                </div>
                <span className="type-xs font-medium tabular-nums text-muted">{sessionsCount} sessions</span>
              </div>
              <h4 className="mt-3 type-base font-medium text-fg">Class Routines</h4>
              <p className="mt-1 type-xs text-muted">
                Weekly timetable scheduling, room numbers, class format, and quick cancellation/rescheduling.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 type-xs font-medium text-fg group-hover:underline">
              <span>Manage Timetable</span>
              <ArrowRight size={12} />
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab("results")}
            className="group flex flex-col justify-between border border-line bg-surface p-5 text-left r-lg transition-ui hover:border-fg/40 hover:bg-sunken/40"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex size-9 items-center justify-center rounded-md border border-line bg-bg text-fg">
                  <LineChart size={18} />
                </div>
                <span className="type-xs font-medium tabular-nums text-muted">{transcriptCount} entries</span>
              </div>
              <h4 className="mt-3 type-base font-medium text-fg">Results & Transcripts</h4>
              <p className="mt-1 type-xs text-muted">
                Official course grades, semester GPAs, grade point calculation, and supplementary sitting records.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 type-xs font-medium text-fg group-hover:underline">
              <span>Manage Results</span>
              <ArrowRight size={12} />
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab("events")}
            className="group flex flex-col justify-between border border-line bg-surface p-5 text-left r-lg transition-ui hover:border-fg/40 hover:bg-sunken/40"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex size-9 items-center justify-center rounded-md border border-line bg-bg text-fg">
                  <Calendar size={18} />
                </div>
                <span className="type-xs font-medium tabular-nums text-muted">{eventsCount} events</span>
              </div>
              <h4 className="mt-3 type-base font-medium text-fg">Campus Events</h4>
              <p className="mt-1 type-xs text-muted">
                Seminars, hackathons, workshops, venue reservations, and RSVP registration states.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 type-xs font-medium text-fg group-hover:underline">
              <span>Manage Events</span>
              <ArrowRight size={12} />
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab("complaints")}
            className="group flex flex-col justify-between border border-line bg-surface p-5 text-left r-lg transition-ui hover:border-fg/40 hover:bg-sunken/40"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex size-9 items-center justify-center rounded-md border border-line bg-bg text-fg">
                  <MessageSquareWarning size={18} />
                </div>
                <span className="type-xs font-medium tabular-nums text-muted">{complaintsCount} total</span>
              </div>
              <h4 className="mt-3 type-base font-medium text-fg">Student Inquiries</h4>
              <p className="mt-1 type-xs text-muted">
                Grievance triage, complaint lifecycle tracking, facility bug reports, and resolution dispatch.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 type-xs font-medium text-fg group-hover:underline">
              <span>Review Inquiries</span>
              <ArrowRight size={12} />
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab("notifications")}
            className="group flex flex-col justify-between border border-line bg-surface p-5 text-left r-lg transition-ui hover:border-fg/40 hover:bg-sunken/40"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex size-9 items-center justify-center rounded-md border border-line bg-bg text-fg">
                  <Megaphone size={18} />
                </div>
                <span className="type-xs font-medium tabular-nums text-muted">{notificationsCount} notifications</span>
              </div>
              <h4 className="mt-3 type-base font-medium text-fg">Broadcast Notifications</h4>
              <p className="mt-1 type-xs text-muted">
                Send push notifications and banner alerts to students across all active portal categories.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 type-xs font-medium text-fg group-hover:underline">
              <span>Manage Broadcasts</span>
              <ArrowRight size={12} />
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab("backup")}
            className="group flex flex-col justify-between border border-line bg-surface p-5 text-left r-lg transition-ui hover:border-fg/40 hover:bg-sunken/40"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex size-9 items-center justify-center rounded-md border border-line bg-bg text-fg">
                  <Database size={18} />
                </div>
                <span className="type-xs font-medium text-muted">System State</span>
              </div>
              <h4 className="mt-3 type-base font-medium text-fg">Data & Backup</h4>
              <p className="mt-1 type-xs text-muted">
                Export complete JSON snapshot, restore from backup file, or inspect storage key allocations.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 type-xs font-medium text-fg group-hover:underline">
              <span>System Tools</span>
              <ArrowRight size={12} />
            </div>
          </button>
        </div>
      </div>

      {/* Synchronization Architecture Card */}
      <div className="border border-line bg-surface p-6 r-lg space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
          <h4 className="type-sm font-semibold text-fg">Data Synchronization Protocol</h4>
        </div>
        <p className="type-xs leading-relaxed text-muted">
          All modifications performed in this Admin Control Center are committed directly to the shared local storage state and in-memory module proxies. Any newly created course, revised schedule slot, published circular, or student profile switch immediately reflects in the student portal without requiring manual cache invalidation or server re-compilation.
        </p>
        <div className="grid grid-cols-1 gap-3 pt-2 text-xs sm:grid-cols-3">
          <div className="flex items-center gap-2 border border-line bg-bg p-3 r-md">
            <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400" />
            <span className="text-muted">Storage: <strong className="text-fg">LocalStorage v2</strong></span>
          </div>
          <div className="flex items-center gap-2 border border-line bg-bg p-3 r-md">
            <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400" />
            <span className="text-muted">Proxy: <strong className="text-fg">Live courseById</strong></span>
          </div>
          <div className="flex items-center gap-2 border border-line bg-bg p-3 r-md">
            <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400" />
            <span className="text-muted">Navigation: <strong className="text-fg">Hidden from /_app</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
