import {
  Bell,
  Edit2,
  Filter,
  Link as LinkIcon,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  type AppNotification,
  type NotificationKind,
  saveNotifications,
} from "@/data/demo";
import { Button } from "@/components/ui/button";
import { Field, SelectInput, TextArea, TextInput } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { formatDateLabel } from "@/lib/format";

interface AdminNotificationsProps {
  notifications: AppNotification[];
  onDataChange: () => void;
}

interface NotifFormData {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  date: string;
  href: string;
}

const DEFAULT_FORM: NotifFormData = {
  id: "",
  kind: "announcements",
  title: "",
  body: "",
  date: new Date().toISOString().split("T")[0],
  href: "/notices",
};

export function AdminNotifications({ notifications, onDataChange }: AdminNotificationsProps) {
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<string>("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<NotifFormData>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [deleteTarget, setDeleteTarget] = useState<AppNotification | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notifications
      .filter((n) => {
        const matchQ =
          !q ||
          n.title.toLowerCase().includes(q) ||
          n.body.toLowerCase().includes(q) ||
          n.kind.toLowerCase().includes(q);
        const matchKind = kindFilter === "all" || n.kind === kindFilter;
        return matchQ && matchKind;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [notifications, query, kindFilter]);

  function handleOpenCreate() {
    setIsEditing(false);
    setFormData({
      ...DEFAULT_FORM,
      id: `nt-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
    });
    setFormErrors({});
    setModalOpen(true);
  }

  function handleOpenEdit(notif: AppNotification) {
    setIsEditing(true);
    setFormData({
      id: notif.id,
      kind: notif.kind,
      title: notif.title,
      body: notif.body,
      date: notif.date,
      href: notif.href,
    });
    setFormErrors({});
    setModalOpen(true);
  }

  function validateForm(): boolean {
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = "Notification title is required.";
    if (!formData.body.trim()) errors.body = "Notification message body is required.";
    if (!formData.href.trim()) errors.href = "Target redirect path is required.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSaveNotif() {
    if (!validateForm()) return;

    let updated: AppNotification[];
    if (isEditing) {
      updated = notifications.map((n) => (n.id === formData.id ? { ...formData } : n));
      toast.success("Broadcast notification updated.");
    } else {
      const newNotif: AppNotification = {
        ...formData,
        id: formData.id || `nt-${Date.now()}`,
      };
      updated = [newNotif, ...notifications];
      toast.success("Broadcast dispatched to student feed.");
    }

    saveNotifications(updated);
    onDataChange();
    setModalOpen(false);
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    const updated = notifications.filter((n) => n.id !== deleteTarget.id);
    saveNotifications(updated);
    onDataChange();
    toast.success("Notification removed.");
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="type-xl font-semibold text-fg">Broadcast Notifications</h2>
          <p className="type-sm text-muted">
            Dispatch announcements, reminders, and schedule alerts directly to student notification feeds.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 shrink-0">
          <Plus size={16} />
          <span>New Broadcast Alert</span>
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
            placeholder="Search alerts by title or content..."
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

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-muted" />
          <span className="type-xs text-muted">Kind:</span>
          <select
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value)}
            className="rounded-lg border border-line bg-bg px-2.5 py-1.5 type-sm text-fg focus:outline-none"
          >
            <option value="all">All Notification Kinds</option>
            <option value="academic">Academic</option>
            <option value="routine">Routine</option>
            <option value="announcements">Announcements</option>
            <option value="events">Events</option>
            <option value="results">Results</option>
          </select>
        </div>
      </div>

      {/* Notifications Table */}
      <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left type-sm border-collapse">
            <thead>
              <tr className="border-b border-line bg-sunken/60 text-xs font-semibold text-muted uppercase tracking-wider">
                <th className="px-4 py-3.5 whitespace-nowrap">Date</th>
                <th className="px-4 py-3.5">Kind</th>
                <th className="px-4 py-3.5">Title &amp; Message</th>
                <th className="px-4 py-3.5">Destination Link</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted">
                    No broadcast notifications match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="transition-ui hover:bg-sunken/40">
                    <td className="px-4 py-3.5 text-xs text-muted whitespace-nowrap tabular-nums">
                      {formatDateLabel(item.date)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="rounded-md border border-line bg-bg px-2 py-0.5 text-xs font-medium capitalize text-fg">
                        {item.kind}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-fg">{item.title}</p>
                      <p className="type-xs text-muted mt-0.5 line-clamp-1">{item.body}</p>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-muted whitespace-nowrap">
                      {item.href}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          onClick={() => handleOpenEdit(item)}
                          className="size-8 p-0 text-muted hover:text-fg"
                          title="Edit notification"
                        >
                          <Edit2 size={15} />
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => setDeleteTarget(item)}
                          className="size-8 p-0 text-danger/80 hover:text-danger hover:bg-danger/10"
                          title="Delete notification"
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
          <strong className="text-fg">{notifications.length}</strong> broadcasts
        </div>
      </div>

      {/* Add / Edit Notification Modal */}
      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={isEditing ? "Edit Broadcast Alert" : "Publish Broadcast Notification"}
        description="Notify students about routine changes, exam dates, or registration deadlines."
      >
        <div className="space-y-4">
          <Field label="Alert Title" htmlFor="notif-title" error={formErrors.title}>
            <TextInput
              id="notif-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Schedule Alteration Notice"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Alert Kind" htmlFor="notif-kind">
              <SelectInput
                id="notif-kind"
                value={formData.kind}
                onChange={(e) => setFormData({ ...formData, kind: e.target.value as NotificationKind })}
              >
                <option value="announcements">Announcements</option>
                <option value="routine">Routine</option>
                <option value="academic">Academic</option>
                <option value="events">Events</option>
                <option value="results">Results</option>
              </SelectInput>
            </Field>

            <Field label="Destination Path" htmlFor="notif-href" error={formErrors.href}>
              <SelectInput
                id="notif-href"
                value={formData.href}
                onChange={(e) => setFormData({ ...formData, href: e.target.value })}
              >
                <option value="/notices">/notices (Circulars)</option>
                <option value="/routine">/routine (Timetable)</option>
                <option value="/courses">/courses (Catalog)</option>
                <option value="/results">/results (Transcript)</option>
                <option value="/events">/events (Calendar)</option>
                <option value="/academics">/academics (Analytics)</option>
              </SelectInput>
            </Field>
          </div>

          <Field label="Notification Message" htmlFor="notif-body" error={formErrors.body}>
            <TextArea
              id="notif-body"
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              rows={3}
              placeholder="Enter message text shown to students..."
            />
          </Field>

          <div className="flex justify-end gap-3 border-t border-line pt-4">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveNotif}>
              {isEditing ? "Save Alert Changes" : "Dispatch Broadcast"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Notification"
        description="Are you sure you want to remove this broadcast notification?"
      >
        <div className="flex flex-col gap-4">
          <p className="type-sm text-muted">
            The notification will be deleted and removed from all student notification centers.
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
