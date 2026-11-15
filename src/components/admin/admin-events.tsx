import {
  Calendar,
  Clock,
  Edit2,
  Filter,
  MapPin,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  type CampusEvent,
  type EventCategory,
  EVENT_CATEGORIES,
  saveEvents,
} from "@/data/demo";
import { Button } from "@/components/ui/button";
import { Field, SelectInput, TextArea, TextInput } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { formatClock, formatRange } from "@/data/schedule";
import { formatDateLabel } from "@/lib/format";

interface AdminEventsProps {
  events: CampusEvent[];
  onDataChange: () => void;
}

interface EventFormData {
  id: string;
  category: EventCategory;
  title: string;
  date: string;
  start: string;
  end: string;
  venue: string;
  registration: CampusEvent["registration"];
  host: string;
  summary: string;
}

const DEFAULT_FORM: EventFormData = {
  id: "",
  category: "seminar",
  title: "",
  date: new Date().toISOString().split("T")[0],
  start: "14:00",
  end: "15:30",
  venue: "Auditorium Hall 1",
  registration: "open",
  host: "Department of Computing",
  summary: "",
};

export function AdminEvents({ events, onDataChange }: AdminEventsProps) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [regFilter, setRegFilter] = useState<string>("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<EventFormData>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [deleteTarget, setDeleteTarget] = useState<CampusEvent | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events
      .filter((e) => {
        const matchQ =
          !q ||
          e.title.toLowerCase().includes(q) ||
          e.host.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          e.summary.toLowerCase().includes(q);
        const matchCat = categoryFilter === "all" || e.category === categoryFilter;
        const matchReg = regFilter === "all" || e.registration === regFilter;
        return matchQ && matchCat && matchReg;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [events, query, categoryFilter, regFilter]);

  function handleOpenCreate() {
    setIsEditing(false);
    setFormData({
      ...DEFAULT_FORM,
      id: `e-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
    });
    setFormErrors({});
    setModalOpen(true);
  }

  function handleOpenEdit(event: CampusEvent) {
    setIsEditing(true);
    setFormData({
      id: event.id,
      category: event.category,
      title: event.title,
      date: event.date,
      start: event.start,
      end: event.end,
      venue: event.venue,
      registration: event.registration,
      host: event.host,
      summary: event.summary,
    });
    setFormErrors({});
    setModalOpen(true);
  }

  function validateForm(): boolean {
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = "Event title is required.";
    if (!formData.date.trim()) errors.date = "Event date is required (YYYY-MM-DD).";
    if (!formData.start.trim()) errors.start = "Start time is required.";
    if (!formData.end.trim()) errors.end = "End time is required.";
    if (formData.start >= formData.end) errors.end = "End time must be after start time.";
    if (!formData.venue.trim()) errors.venue = "Venue location is required.";
    if (!formData.host.trim()) errors.host = "Host or organizing body is required.";
    if (!formData.summary.trim()) errors.summary = "Event description summary is required.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSaveEvent() {
    if (!validateForm()) return;

    let updated: CampusEvent[];
    if (isEditing) {
      updated = events.map((e) => (e.id === formData.id ? { ...formData } : e));
      toast.success("Event details updated.");
    } else {
      const newEvent: CampusEvent = {
        ...formData,
        id: formData.id || `e-${Date.now()}`,
      };
      updated = [...events, newEvent];
      toast.success("Campus event published to student calendar.");
    }

    saveEvents(updated);
    onDataChange();
    setModalOpen(false);
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    const updated = events.filter((e) => e.id !== deleteTarget.id);
    saveEvents(updated);
    onDataChange();
    toast.success("Campus event removed.");
    setDeleteTarget(null);
  }

  function getCategoryBadge(cat: EventCategory) {
    switch (cat) {
      case "seminar":
        return "border-blue-500/30 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400";
      case "workshop":
        return "border-purple-500/30 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400";
      case "competition":
        return "border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400";
      case "academic":
        return "border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400";
      default:
        return "border-line bg-sunken text-muted";
    }
  }

  function getRegistrationBadge(reg: CampusEvent["registration"]) {
    switch (reg) {
      case "open":
        return "border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400";
      case "waitlist":
        return "border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400";
      case "closed":
        return "border-line bg-sunken text-muted";
      default:
        return "border-line bg-sunken text-muted";
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="type-xl font-semibold text-fg">Campus Events &amp; Seminars</h2>
          <p className="type-sm text-muted">
            Coordinate guest lectures, departmental workshops, hackathons, and monitor registration quotas.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 shrink-0">
          <Plus size={16} />
          <span>Create Campus Event</span>
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
            placeholder="Search events by title, venue, host, or keyword..."
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
            <span>Category:</span>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-line bg-bg px-2.5 py-1.5 type-sm text-fg focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="seminar">Seminars</option>
            <option value="workshop">Workshops</option>
            <option value="competition">Competitions</option>
            <option value="academic">Academic</option>
          </select>

          <div className="flex items-center gap-1.5 type-xs text-muted">
            <span>Status:</span>
          </div>
          <select
            value={regFilter}
            onChange={(e) => setRegFilter(e.target.value)}
            className="rounded-lg border border-line bg-bg px-2.5 py-1.5 type-sm text-fg focus:outline-none"
          >
            <option value="all">All Registrations</option>
            <option value="open">Open</option>
            <option value="waitlist">Waitlist</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left type-sm border-collapse">
            <thead>
              <tr className="border-b border-line bg-sunken/60 text-xs font-semibold text-muted uppercase tracking-wider">
                <th className="px-4 py-3.5 whitespace-nowrap">Date &amp; Time</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Event Title &amp; Host</th>
                <th className="px-4 py-3.5">Venue</th>
                <th className="px-4 py-3.5 text-center">Registration</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted">
                    No campus events match your filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((event) => (
                  <tr key={event.id} className="transition-ui hover:bg-sunken/40">
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-medium text-fg">{formatDateLabel(event.date)}</div>
                      <div className="font-mono type-xs text-muted">
                        {formatRange(event.start, event.end)}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize ${getCategoryBadge(
                          event.category,
                        )}`}
                      >
                        {event.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-fg">{event.title}</p>
                      <p className="type-xs text-muted">{event.host}</p>
                    </td>
                    <td className="px-4 py-3.5 text-muted whitespace-nowrap">{event.venue}</td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize ${getRegistrationBadge(
                          event.registration,
                        )}`}
                      >
                        {event.registration}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          onClick={() => handleOpenEdit(event)}
                          className="size-8 p-0 text-muted hover:text-fg"
                          title="Edit event"
                        >
                          <Edit2 size={15} />
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => setDeleteTarget(event)}
                          className="size-8 p-0 text-danger/80 hover:text-danger hover:bg-danger/10"
                          title="Delete event"
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-line px-4 py-3 text-xs text-muted">
          Showing <strong className="text-fg">{filtered.length}</strong> of{" "}
          <strong className="text-fg">{events.length}</strong> campus events
        </div>
      </div>

      {/* Add / Edit Event Modal */}
      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={isEditing ? "Edit Campus Event" : "Create New Campus Event"}
        description="Publish academic lectures, society workshops, and competition dates to student feeds."
        wide={true}
      >
        <div className="space-y-4">
          <Field label="Event Title" htmlFor="event-title" error={formErrors.title}>
            <TextInput
              id="event-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Machine Learning Workshop"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Category" htmlFor="event-category">
              <SelectInput
                id="event-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as EventCategory })}
              >
                <option value="seminar">Seminar</option>
                <option value="workshop">Workshop</option>
                <option value="competition">Competition</option>
                <option value="academic">Academic Activity</option>
              </SelectInput>
            </Field>

            <Field label="Date" htmlFor="event-date" error={formErrors.date} hint="YYYY-MM-DD">
              <TextInput
                id="event-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </Field>

            <Field label="Registration" htmlFor="event-reg">
              <SelectInput
                id="event-reg"
                value={formData.registration}
                onChange={(e) =>
                  setFormData({ ...formData, registration: e.target.value as CampusEvent["registration"] })
                }
              >
                <option value="open">Open</option>
                <option value="waitlist">Waitlist</option>
                <option value="closed">Closed</option>
              </SelectInput>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Start Time" htmlFor="event-start" error={formErrors.start}>
              <TextInput
                id="event-start"
                type="time"
                value={formData.start}
                onChange={(e) => setFormData({ ...formData, start: e.target.value })}
              />
            </Field>

            <Field label="End Time" htmlFor="event-end" error={formErrors.end}>
              <TextInput
                id="event-end"
                type="time"
                value={formData.end}
                onChange={(e) => setFormData({ ...formData, end: e.target.value })}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Venue Location" htmlFor="event-venue" error={formErrors.venue}>
              <TextInput
                id="event-venue"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="e.g. Auditorium Hall 1"
              />
            </Field>

            <Field label="Host Organization" htmlFor="event-host" error={formErrors.host}>
              <TextInput
                id="event-host"
                value={formData.host}
                onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                placeholder="e.g. Computing Club"
              />
            </Field>
          </div>

          <Field label="Event Summary &amp; Agenda" htmlFor="event-summary" error={formErrors.summary}>
            <TextArea
              id="event-summary"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              rows={4}
              placeholder="Detailed description for student attendees..."
            />
          </Field>

          <div className="flex justify-end gap-3 border-t border-line pt-4">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveEvent}>
              {isEditing ? "Save Event Changes" : "Publish Event"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Campus Event"
        description={deleteTarget ? `Are you sure you want to remove "${deleteTarget.title}"?` : undefined}
      >
        <div className="flex flex-col gap-4">
          <p className="type-sm text-muted">
            This will permanently remove the event from student calendars and clear any existing registrations.
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
