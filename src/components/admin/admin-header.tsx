import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Bell,
  BookOpen,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Database,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  Megaphone,
  MessageSquareWarning,
  RotateCcw,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { resetAdminDataToDefaults } from "@/data/demo";
import { useAppStore } from "@/lib/store";

export type AdminTab =
  | "overview"
  | "courses"
  | "notices"
  | "students"
  | "routine"
  | "results"
  | "events"
  | "complaints"
  | "notifications"
  | "backup";

export interface TabItem {
  id: AdminTab;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: number | string;
}

interface AdminHeaderProps {
  currentTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  coursesCount: number;
  noticesCount: number;
  studentsCount: number;
  sessionsCount: number;
  eventsCount: number;
  complaintsCount: number;
  onDataReset: () => void;
}

export function AdminHeader({
  currentTab,
  onTabChange,
  coursesCount,
  noticesCount,
  studentsCount,
  sessionsCount,
  eventsCount,
  complaintsCount,
  onDataReset,
}: AdminHeaderProps) {
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const resetDemo = useAppStore((state) => state.resetDemo);

  const tabs: TabItem[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "courses", label: "Courses", icon: BookOpen, badge: coursesCount },
    { id: "notices", label: "Notices", icon: Megaphone, badge: noticesCount },
    { id: "students", label: "Students", icon: Users, badge: studentsCount },
    { id: "routine", label: "Routines", icon: CalendarDays, badge: sessionsCount },
    { id: "results", label: "Results", icon: LineChart },
    { id: "events", label: "Events", icon: Calendar, badge: eventsCount },
    {
      id: "complaints",
      label: "Complaints",
      icon: MessageSquareWarning,
      badge: complaintsCount > 0 ? complaintsCount : undefined,
    },
    { id: "notifications", label: "Broadcasts", icon: Bell },
    { id: "backup", label: "Data & System", icon: Database },
  ];

  function handleResetConfirm() {
    resetAdminDataToDefaults();
    resetDemo();
    onDataReset();
    setResetModalOpen(false);
    toast.success("All modules reset to initial factory defaults.");
  }

  return (
    <header className="border-b border-line bg-surface">
      {/* Top Banner */}
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3.5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-fg text-bg">
            <ShieldCheck size={22} strokeWidth={2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="type-base font-semibold tracking-tight text-fg">
                UniConnect Control Center
              </h1>
              <span className="inline-flex items-center rounded-full border border-line bg-sunken px-2 py-0.5 text-[11px] font-medium text-muted">
                Registrar Console
              </span>
            </div>
            <p className="type-xs text-muted">
              Direct access only · Changes instantly synchronize with student portal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden items-center gap-2 rounded-full border border-line bg-bg px-3 py-1.5 text-xs text-muted sm:inline-flex">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
            </span>
            <span>Live Data Sync Active</span>
          </div>

          <Button
            variant="secondary"
            onClick={() => setResetModalOpen(true)}
            className="h-9 gap-1.5 px-3 text-xs"
            title="Reset demo data to initial seeds"
          >
            <RotateCcw size={14} className="text-muted" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </Button>

          <Button asChild variant="secondary" className="h-9 gap-1.5 px-3.5 text-xs font-medium">
            <Link to="/dashboard">
              <span>Student Portal</span>
              <ArrowUpRight size={14} className="text-muted" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav
          className="flex space-x-1 overflow-x-auto pb-px"
          aria-label="Admin Navigation Tabs"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`group flex shrink-0 items-center gap-2 border-b-2 px-3.5 py-3 type-sm font-medium transition-ui ${
                  isActive
                    ? "border-fg text-fg"
                    : "border-transparent text-muted hover:border-line hover:text-fg"
                }`}
              >
                <Icon
                  size={16}
                  className={isActive ? "text-fg" : "text-muted group-hover:text-fg"}
                />
                <span>{tab.label}</span>
                {tab.badge !== undefined ? (
                  <span
                    className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] tabular-nums font-semibold ${
                      isActive
                        ? "bg-fg text-bg"
                        : "bg-sunken text-muted group-hover:text-fg"
                    }`}
                  >
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Safety Reset Confirmation Modal */}
      <Modal
        open={resetModalOpen}
        onOpenChange={setResetModalOpen}
        title="Reset All Admin & Student Data"
        description="Are you sure you want to reset all courses, notices, routines, results, events, and student profiles to original factory seeds?"
      >
        <div className="flex flex-col gap-4">
          <p className="type-sm text-muted">
            This will clear custom courses, modified class schedules, announcements, student directory edits, and complaint history stored in this browser.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setResetModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleResetConfirm}>
              Confirm Reset
            </Button>
          </div>
        </div>
      </Modal>
    </header>
  );
}
