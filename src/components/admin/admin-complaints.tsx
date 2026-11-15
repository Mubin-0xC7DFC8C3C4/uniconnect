import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
  MessageSquareWarning,
  Search,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { type Complaint, type ComplaintCategory, type ComplaintStatus, COMPLAINT_CATEGORIES } from "@/data/demo";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { formatDateLabel } from "@/lib/format";

export function AdminComplaints() {
  const complaints = useAppStore((state) => state.complaints);
  const updateComplaintStatus = useAppStore((state) => state.updateComplaintStatus);
  const deleteComplaint = useAppStore((state) => state.deleteComplaint);

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Complaint | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return complaints.filter((c) => {
      const matchQ =
        !q ||
        c.subject.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q);
      const matchCat = categoryFilter === "all" || c.category === categoryFilter;
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      return matchQ && matchCat && matchStatus;
    });
  }, [complaints, query, categoryFilter, statusFilter]);

  const pendingCount = complaints.filter((c) => c.status === "pending").length;
  const inReviewCount = complaints.filter((c) => c.status === "in_review").length;
  const resolvedCount = complaints.filter((c) => c.status === "resolved").length;

  function handleStatusChange(id: string, newStatus: ComplaintStatus) {
    updateComplaintStatus(id, newStatus);
    toast.success(`Complaint status marked as ${newStatus.replace("_", " ")}.`);
    if (selectedComplaint && selectedComplaint.id === id) {
      setSelectedComplaint({ ...selectedComplaint, status: newStatus });
    }
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteComplaint(deleteTarget.id);
    toast.success("Complaint removed from registry.");
    setDeleteTarget(null);
  }

  function getStatusBadge(status: ComplaintStatus) {
    switch (status) {
      case "pending":
        return "border-rose-500/30 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400";
      case "in_review":
        return "border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400";
      case "resolved":
        return "border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400";
      default:
        return "border-line bg-sunken text-muted";
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="type-xl font-semibold text-fg">Student Inquiries &amp; Grievances</h2>
        <p className="type-sm text-muted">
          Review, triage, and resolve student complaints regarding facilities, academic schedules, and examinations.
        </p>
      </div>

      {/* Metrics Row */}
      <dl className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4 r-lg overflow-hidden">
        <div className="bg-bg p-4">
          <dt className="type-label">Pending Triage</dt>
          <dd className="mt-1.5 type-2xl font-semibold tabular-nums text-rose-600 dark:text-rose-400">
            {pendingCount}
          </dd>
          <p className="mt-0.5 type-xs text-muted">Awaiting administrative review</p>
        </div>
        <div className="bg-bg p-4">
          <dt className="type-label">In Review</dt>
          <dd className="mt-1.5 type-2xl font-semibold tabular-nums text-amber-600 dark:text-amber-400">
            {inReviewCount}
          </dd>
          <p className="mt-0.5 type-xs text-muted">Under department investigation</p>
        </div>
        <div className="bg-bg p-4">
          <dt className="type-label">Resolved</dt>
          <dd className="mt-1.5 type-2xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
            {resolvedCount}
          </dd>
          <p className="mt-0.5 type-xs text-muted">Closed issues</p>
        </div>
        <div className="bg-bg p-4">
          <dt className="type-label">Total Logged</dt>
          <dd className="mt-1.5 type-2xl font-semibold tabular-nums text-fg">{complaints.length}</dd>
          <p className="mt-0.5 type-xs text-muted">All active records</p>
        </div>
      </dl>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search inquiries by subject, description, or category..."
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
            {COMPLAINT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
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
            <option value="pending">Pending</option>
            <option value="in_review">In Review</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left type-sm border-collapse">
            <thead>
              <tr className="border-b border-line bg-sunken/60 text-xs font-semibold text-muted uppercase tracking-wider">
                <th className="px-4 py-3.5 whitespace-nowrap">Submitted</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Subject &amp; Details</th>
                <th className="px-4 py-3.5 text-center">Source</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted">
                    No student complaints or inquiries found.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="transition-ui hover:bg-sunken/40">
                    <td className="px-4 py-3.5 text-xs text-muted whitespace-nowrap tabular-nums">
                      {formatDateLabel(item.createdAt)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="rounded-md border border-line bg-bg px-2 py-0.5 text-xs font-medium text-fg">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 max-w-md">
                      <button
                        type="button"
                        onClick={() => setSelectedComplaint(item)}
                        className="text-left font-medium text-fg hover:underline block truncate"
                      >
                        {item.subject}
                      </button>
                      <p className="mt-0.5 line-clamp-1 type-xs text-muted">{item.description}</p>
                    </td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <span className="type-xs text-muted capitalize">
                        {item.source === "you" ? "Portal Student" : "System Sample"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize ${getStatusBadge(
                          item.status,
                        )}`}
                      >
                        {item.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value as ComplaintStatus)}
                          className="rounded-md border border-line bg-bg px-2 py-1 text-xs text-fg focus:outline-none"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_review">In Review</option>
                          <option value="resolved">Resolved</option>
                        </select>
                        <Button
                          variant="ghost"
                          onClick={() => setDeleteTarget(item)}
                          className="size-8 p-0 text-danger/80 hover:text-danger hover:bg-danger/10"
                          title="Delete complaint"
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
          <strong className="text-fg">{complaints.length}</strong> inquiries
        </div>
      </div>

      {/* Inspect / Detail Modal */}
      <Modal
        open={Boolean(selectedComplaint)}
        onOpenChange={(open) => !open && setSelectedComplaint(null)}
        title={selectedComplaint?.subject ?? "Complaint Details"}
        description={selectedComplaint ? `Category: ${selectedComplaint.category} · Submitted ${formatDateLabel(selectedComplaint.createdAt)}` : undefined}
      >
        {selectedComplaint ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-line bg-sunken/40 p-4">
              <p className="type-xs text-muted mb-1 font-semibold uppercase tracking-wider">
                Full Description
              </p>
              <p className="type-sm text-fg leading-relaxed whitespace-pre-wrap">
                {selectedComplaint.description}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-line pt-3">
              <span className="type-sm text-muted">Change Status:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant={selectedComplaint.status === "pending" ? "primary" : "secondary"}
                  onClick={() => handleStatusChange(selectedComplaint.id, "pending")}
                  className="h-8 px-2.5 text-xs"
                >
                  Pending
                </Button>
                <Button
                  variant={selectedComplaint.status === "in_review" ? "primary" : "secondary"}
                  onClick={() => handleStatusChange(selectedComplaint.id, "in_review")}
                  className="h-8 px-2.5 text-xs"
                >
                  In Review
                </Button>
                <Button
                  variant={selectedComplaint.status === "resolved" ? "primary" : "secondary"}
                  onClick={() => handleStatusChange(selectedComplaint.id, "resolved")}
                  className="h-8 px-2.5 text-xs text-emerald-600 dark:text-emerald-400"
                >
                  Resolved
                </Button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setSelectedComplaint(null)}>
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Inquiry Record"
        description="Are you sure you want to delete this complaint record?"
      >
        <div className="flex flex-col gap-4">
          <p className="type-sm text-muted">
            This will permanently remove the complaint from the grievance history.
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
