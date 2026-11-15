import {
  AlertCircle,
  Calendar,
  Clock,
  Edit2,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  type ClassSession,
  type Course,
  type SessionStatus,
  DAY_NAMES,
  saveSessions,
} from "@/data/demo";
import { Button } from "@/components/ui/button";
import { Field, SelectInput, TextInput } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { formatRange } from "@/data/schedule";

interface AdminRoutineProps {
  sessions: ClassSession[];
  courses: Course[];
  onDataChange: () => void;
}

interface SessionFormData {
  id: string;
  day: 0 | 1 | 2 | 3 | 4;
  start: string;
  end: string;
  courseId: string;
  room: string;
  kind: string;
  status: SessionStatus;
  note: string;
}

const DEFAULT_FORM: SessionFormData = {
  id: "",
  day: 0,
  start: "09:00",
  end: "10:30",
  courseId: "",
  room: "S-204",
  kind: "Theory",
  status: "scheduled",
  note: "",
};

export function AdminRoutine({ sessions, courses, onDataChange }: AdminRoutineProps) {
  const [query, setQuery] = useState("");
  const [dayFilter, setDayFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [courseFilter, setCourseFilter] = useState<string>("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<SessionFormData>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [deleteTarget, setDeleteTarget] = useState<ClassSession | null>(null);

  const courseLookup = useMemo(() => {
    return Object.fromEntries(courses.map((c) => [c.id, c]));
  }, [courses]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sessions
      .filter((s) => {
        const c = courseLookup[s.courseId];
        const matchQ =
          !q ||
          s.room.toLowerCase().includes(q) ||
          s.kind.toLowerCase().includes(q) ||
          (s.note && s.note.toLowerCase().includes(q)) ||
          (c && (c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q)));
        const matchDay = dayFilter === "all" || String(s.day) === dayFilter;
        const matchStatus = statusFilter === "all" || (s.status ?? "scheduled") === statusFilter;
        const matchCourse = courseFilter === "all" || s.courseId === courseFilter;
        return matchQ && matchDay && matchStatus && matchCourse;
      })
      .sort((a, b) => {
        if (a.day !== b.day) return a.day - b.day;
        return a.start.localeCompare(b.start);
      });
  }, [sessions, query, dayFilter, statusFilter, courseFilter, courseLookup]);

  function handleOpenCreate() {
    setIsEditing(false);
    setFormData({
      ...DEFAULT_FORM,
      id: `session-${Date.now()}`,
      courseId: courses[0]?.id || "",
    });
    setFormErrors({});
    setModalOpen(true);
  }

  function handleOpenEdit(session: ClassSession) {
    setIsEditing(true);
    setFormData({
      id: session.id,
      day: session.day,
      start: session.start,
      end: session.end,
      courseId: session.courseId,
      room: session.room,
      kind: session.kind,
      status: session.status || "scheduled",
      note: session.note || "",
    });
    setFormErrors({});
    setModalOpen(true);
  }

  function validateForm(): boolean {
    const errors: Record<string, string> = {};
    if (!formData.courseId) errors.courseId = "Please select a course.";
    if (!formData.start.trim()) errors.start = "Start time is required (HH:mm).";
    if (!formData.end.trim()) errors.end = "End time is required (HH:mm).";
    if (formData.start >= formData.end) errors.end = "End time must be after start time.";
    if (!formData.room.trim()) errors.room = "Room allocation is required.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSaveSession() {
    if (!validateForm()) return;

    let updated: ClassSession[];
    if (isEditing) {
      updated = sessions.map((s) =>
        s.id === formData.id
          ? {
              ...formData,
              status: formData.status === "scheduled" ? undefined : formData.status,
              note: formData.note.trim() ? formData.note.trim() : undefined,
            }
          : s,
      );
      toast.success("Routine session updated.");
    } else {
      const newSession: ClassSession = {
        ...formData,
        id: formData.id || `session-${Date.now()}`,
        status: formData.status === "scheduled" ? undefined : formData.status,
        note: formData.note.trim() ? formData.note.trim() : undefined,
      };
      updated = [...sessions, newSession];
      toast.success("New class session scheduled on timetable.");
    }

    saveSessions(updated);
    onDataChange();
    setModalOpen(false);
  }

  function handleQuickToggleStatus(session: ClassSession, newStatus: SessionStatus) {
    const updated = sessions.map((s) => {
      if (s.id !== session.id) return s;
      return {
        ...s,
        status: newStatus === "scheduled" ? undefined : newStatus,
        note:
          newStatus === "cancelled"
            ? s.note || "Cancelled for this week only."
            : newStatus === "rescheduled"
              ? s.note || "Rescheduled class session."
              : undefined,
      };
    });
    saveSessions(updated);
    onDataChange();
    toast.success(`Session status set to ${newStatus}.`);
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    const updated = sessions.filter((s) => s.id !== deleteTarget.id);
    saveSessions(updated);
    onDataChange();
    toast.success("Routine session removed.");
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="type-xl font-semibold text-fg">Master Routine &amp; Schedules</h2>
          <p className="type-sm text-muted">
            Configure weekly classroom sessions, room assignments, faculty timings, and manage weekly cancellations or rescheduling.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 shrink-0">
          <Plus size={16} />
          <span>Schedule Class Session</span>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by room, course code, title, or note..."
            className="w-full rounded-lg border border-line bg-bg pl-9.5 pr-4 py-2 type-sm text-fg placeholder:text-muted focus:border-fg focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-fg"
            >
              <X size={14} />
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 type-xs text-muted">
            <Filter size={14} />
            <span>Day:</span>
          </div>
          <select
            value={dayFilter}
            onChange={(e) => setDayFilter(e.target.value)}
            className="rounded-lg border border-line bg-bg px-2.5 py-1.5 type-sm text-fg focus:outline-none"
          >
            <option value="all">All Days</option>
            {DAY_NAMES.map((name, idx) => (
              <option key={idx} value={String(idx)}>
                {name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 type-xs text-muted">
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-line bg-bg px-2.5 py-1.5 type-sm text-fg focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="cancelled">Cancelled</option>
            <option value="rescheduled">Rescheduled</option>
          </select>
        </div>
      </div>

      {/* Routine Sessions Table */}
      <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left type-sm border-collapse">
            <thead>
              <tr className="border-b border-line bg-sunken/60 text-xs font-semibold text-muted uppercase tracking-wider">
                <th className="px-4 py-3.5">Day</th>
                <th className="px-4 py-3.5">Time Range</th>
                <th className="px-4 py-3.5">Course</th>
                <th className="px-4 py-3.5 text-center">Room</th>
                <th className="px-4 py-3.5 text-center">Kind</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5">Note</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted">
                    No routine sessions found matching the filter.
                  </td>
                </tr>
              ) : (
                filtered.map((session) => {
                  const course = courseLookup[session.courseId];
                  const currentStatus = session.status || "scheduled";
                  return (
                    <tr key={session.id} className="transition-ui hover:bg-sunken/40">
                      <td className="px-4 py-3.5 font-medium text-fg whitespace-nowrap">
                        {DAY_NAMES[session.day]}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs tabular-nums text-fg whitespace-nowrap">
                        {formatRange(session.start, session.end)}
                      </td>
                      <td className="px-4 py-3.5">
                        {course ? (
                          <div>
                            <span className="font-mono text-xs font-medium text-fg">{course.code}</span>
                            <span className="ml-2 text-muted font-normal text-xs">{course.title}</span>
                          </div>
                        ) : (
                          <span className="font-mono text-xs text-muted">{session.courseId}</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span className="rounded-md border border-line bg-bg px-2 py-0.5 font-mono text-xs font-medium text-fg">
                          {session.room}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center text-xs text-muted whitespace-nowrap">
                        {session.kind}
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${
                            currentStatus === "cancelled"
                              ? "border-rose-500/30 bg-rose-50 text-rose-700 line-through dark:bg-rose-950/40 dark:text-rose-400"
                              : currentStatus === "rescheduled"
                                ? "border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                                : "border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                          }`}
                        >
                          {currentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 max-w-xs truncate text-xs text-muted">
                        {session.note || "—"}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {currentStatus !== "cancelled" ? (
                            <Button
                              variant="secondary"
                              onClick={() => handleQuickToggleStatus(session, "cancelled")}
                              className="h-7 px-2 text-[10px] text-danger"
                              title="Mark session cancelled"
                            >
                              Cancel
                            </Button>
                          ) : (
                            <Button
                              variant="secondary"
                              onClick={() => handleQuickToggleStatus(session, "scheduled")}
                              className="h-7 px-2 text-[10px] text-emerald-600 dark:text-emerald-400"
                              title="Restore to scheduled"
                            >
                              Restore
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            onClick={() => handleOpenEdit(session)}
                            className="size-8 p-0 text-muted hover:text-fg"
                            title="Edit session"
                          >
                            <Edit2 size={15} />
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => setDeleteTarget(session)}
                            className="size-8 p-0 text-danger/80 hover:text-danger hover:bg-danger/10"
                            title="Delete session"
                          >
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-line px-4 py-3 text-xs text-muted">
          Showing <strong className="text-fg">{filtered.length}</strong> of{" "}
          <strong className="text-fg">{sessions.length}</strong> scheduled timetable sessions
        </div>
      </div>

      {/* Add / Edit Session Modal */}
      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={isEditing ? "Edit Class Routine Slot" : "Schedule New Class Session"}
        description="Allocate day, timing, room, and attendance format for course meetings."
      >
        <div className="space-y-4">
          <Field label="Course" htmlFor="session-course" error={formErrors.courseId}>
            <SelectInput
              id="session-course"
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} · {c.title} ({c.instructor})
                </option>
              ))}
            </SelectInput>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Day of Week" htmlFor="session-day">
              <SelectInput
                id="session-day"
                value={String(formData.day)}
                onChange={(e) => setFormData({ ...formData, day: Number(e.target.value) as 0 | 1 | 2 | 3 | 4 })}
              >
                {DAY_NAMES.map((name, idx) => (
                  <option key={idx} value={String(idx)}>
                    {name}
                  </option>
                ))}
              </SelectInput>
            </Field>

            <Field label="Start Time" htmlFor="session-start" error={formErrors.start} hint="24-hour (HH:mm)">
              <TextInput
                id="session-start"
                type="time"
                value={formData.start}
                onChange={(e) => setFormData({ ...formData, start: e.target.value })}
              />
            </Field>

            <Field label="End Time" htmlFor="session-end" error={formErrors.end} hint="24-hour (HH:mm)">
              <TextInput
                id="session-end"
                type="time"
                value={formData.end}
                onChange={(e) => setFormData({ ...formData, end: e.target.value })}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Room Assignment" htmlFor="session-room" error={formErrors.room} hint="e.g. S-204">
              <TextInput
                id="session-room"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                placeholder="S-204"
              />
            </Field>

            <Field label="Format / Kind" htmlFor="session-kind">
              <SelectInput
                id="session-kind"
                value={formData.kind}
                onChange={(e) => setFormData({ ...formData, kind: e.target.value })}
              >
                <option value="Theory">Theory</option>
                <option value="Lab">Lab</option>
                <option value="Tutorial">Tutorial</option>
                <option value="Seminar">Seminar</option>
              </SelectInput>
            </Field>

            <Field label="Session Status" htmlFor="session-status">
              <SelectInput
                id="session-status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as SessionStatus })}
              >
                <option value="scheduled">Scheduled</option>
                <option value="cancelled">Cancelled</option>
                <option value="rescheduled">Rescheduled</option>
              </SelectInput>
            </Field>
          </div>

          <Field label="Status Announcement / Note" htmlFor="session-note" hint="Optional rationale displayed to students">
            <TextInput
              id="session-note"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="e.g. Cancelled for this week only. Makeup will be published later."
            />
          </Field>

          <div className="flex justify-end gap-3 border-t border-line pt-4">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveSession}>
              {isEditing ? "Save Session Changes" : "Schedule Session"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Routine Session"
        description="Are you sure you want to remove this scheduled session from the academic routine?"
      >
        <div className="flex flex-col gap-4">
          <p className="type-sm text-muted">
            This will permanently remove the room assignment and class time from the master timetable.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
