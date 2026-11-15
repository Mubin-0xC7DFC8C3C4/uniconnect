import {
  Edit2,
  Filter,
  Megaphone,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  type Notice,
  type NoticeCategory,
  NOTICE_CATEGORIES,
  saveNotices,
} from "@/data/demo";
import { Button } from "@/components/ui/button";
import { Field, SelectInput, TextArea, TextInput } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { formatDateLabel } from "@/lib/format";

interface AdminNoticesProps {
  notices: Notice[];
  onDataChange: () => void;
}

interface NoticeFormData {
  id: string;
  category: NoticeCategory;
  title: string;
  date: string;
  body: string;
}

const DEFAULT_FORM: NoticeFormData = {
  id: "",
  category: "academic",
  title: "",
  date: new Date().toISOString().split("T")[0],
  body: "",
};

export function AdminNotices({ notices, onDataChange }: AdminNoticesProps) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<NoticeFormData>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [deleteTarget, setDeleteTarget] = useState<Notice | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notices
      .filter((n) => {
        const matchQ =
          !q ||
          n.title.toLowerCase().includes(q) ||
          n.body.toLowerCase().includes(q) ||
          n.category.toLowerCase().includes(q);
        const matchCat = categoryFilter === "all" || n.category === categoryFilter;
        return matchQ && matchCat;
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [notices, query, categoryFilter]);

  function handleOpenCreate() {
    setIsEditing(false);
    setFormData({
      ...DEFAULT_FORM,
      id: `notice-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
    });
    setFormErrors({});
    setModalOpen(true);
  }

  function handleOpenEdit(notice: Notice) {
    setIsEditing(true);
    setFormData({
      id: notice.id,
      category: notice.category,
      title: notice.title,
      date: notice.date,
      body: notice.body,
    });
    setFormErrors({});
    setModalOpen(true);
  }

  function validateForm(): boolean {
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = "Notice title is required.";
    if (!formData.body.trim()) errors.body = "Notice body text is required.";
    if (!formData.date.trim()) errors.date = "Notice publication date is required (YYYY-MM-DD).";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSaveNotice() {
    if (!validateForm()) return;

    let updated: Notice[];
    if (isEditing) {
      updated = notices.map((n) => (n.id === formData.id ? { ...formData } : n));
      toast.success("Notice updated successfully.");
    } else {
      const newNotice: Notice = {
        ...formData,
        id: formData.id || `n-${Date.now()}`,
      };
      updated = [newNotice, ...notices];
      toast.success("Notice published to student portal.");
    }

    saveNotices(updated);
    onDataChange();
    setModalOpen(false);
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    const updated = notices.filter((n) => n.id !== deleteTarget.id);
    saveNotices(updated);
    onDataChange();
    toast.success("Notice removed.");
    setDeleteTarget(null);
  }

  function getCategoryBadge(cat: NoticeCategory) {
    switch (cat) {
      case "important":
        return "border-rose-500/30 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400";
      case "examination":
        return "border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400";
      case "academic":
        return "border-blue-500/30 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400";
      case "departmental":
        return "border-purple-500/30 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400";
      case "event":
        return "border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400";
      default:
        return "border-line bg-sunken text-muted";
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="type-xl font-semibold text-fg">Notices &amp; Circulars</h2>
          <p className="type-sm text-muted">
            Draft, publish, and manage campus-wide circulars, examination memos, and departmental notices.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 shrink-0">
          <Plus size={16} />
          <span>Publish Notice</span>
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
            placeholder="Search circulars by title, keyword, or excerpt..."
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
          <span className="type-xs text-muted">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-line bg-bg px-2.5 py-1.5 type-sm text-fg focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="important">Important</option>
            <option value="academic">Academic</option>
            <option value="examination">Examination</option>
            <option value="departmental">Departmental</option>
            <option value="event">Events</option>
          </select>
        </div>
      </div>

      {/* Notices Table */}
      <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left type-sm border-collapse">
            <thead>
              <tr className="border-b border-line bg-sunken/60 text-xs font-semibold text-muted uppercase tracking-wider">
                <th className="px-4 py-3.5 whitespace-nowrap">Date</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Title &amp; Excerpt</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-muted">
                    No notices match your search or filter.
                  </td>
                </tr>
              ) : (
                filtered.map((notice) => (
                  <tr key={notice.id} className="transition-ui hover:bg-sunken/40">
                    <td className="px-4 py-3.5 text-xs text-muted whitespace-nowrap tabular-nums">
                      {formatDateLabel(notice.date)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize ${getCategoryBadge(
                          notice.category,
                        )}`}
                      >
                        {notice.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-fg">{notice.title}</p>
                      <p className="mt-0.5 line-clamp-1 type-xs text-muted">{notice.body}</p>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          onClick={() => handleOpenEdit(notice)}
                          className="size-8 p-0 text-muted hover:text-fg"
                          title="Edit notice"
                        >
                          <Edit2 size={15} />
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => setDeleteTarget(notice)}
                          className="size-8 p-0 text-danger/80 hover:text-danger hover:bg-danger/10"
                          title="Delete notice"
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
          <strong className="text-fg">{notices.length}</strong> notices
        </div>
      </div>

      {/* Add / Edit Notice Modal */}
      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={isEditing ? "Edit Notice Record" : "Publish Institutional Notice"}
        description="Notices are displayed on the student portal /notices page and top notifications feed."
      >
        <div className="space-y-4">
          <Field label="Notice Title" htmlFor="notice-title" error={formErrors.title}>
            <TextInput
              id="notice-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Schedule for Mid-Term Sittings"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Category" htmlFor="notice-category">
              <SelectInput
                id="notice-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as NoticeCategory })}
              >
                <option value="important">Important Circular</option>
                <option value="academic">Academic Memo</option>
                <option value="examination">Examination</option>
                <option value="departmental">Departmental</option>
                <option value="event">Campus Event</option>
              </SelectInput>
            </Field>

            <Field label="Date" htmlFor="notice-date" error={formErrors.date} hint="YYYY-MM-DD">
              <TextInput
                id="notice-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </Field>
          </div>

          <Field label="Notice Body" htmlFor="notice-body" error={formErrors.body} hint="Full announcement text">
            <TextArea
              id="notice-body"
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              rows={5}
              placeholder="Enter official circular text..."
            />
          </Field>

          <div className="flex justify-end gap-3 border-t border-line pt-4">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveNotice}>
              {isEditing ? "Save Notice Changes" : "Publish Notice"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Notice"
        description={deleteTarget ? `Are you sure you want to delete "${deleteTarget.title}"?` : undefined}
      >
        <div className="flex flex-col gap-4">
          <p className="type-sm text-muted">
            This action will permanently remove the circular from all student feeds and search results.
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
