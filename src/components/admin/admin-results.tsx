import {
  Award,
  CheckCircle2,
  Edit2,
  Filter,
  GraduationCap,
  LineChart,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  type TranscriptRow,
  GRADE_SCALE,
  saveSemesterGpas,
  saveTranscript,
  semesterGpas,
} from "@/data/demo";
import { Button } from "@/components/ui/button";
import { Field, SelectInput, TextInput } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";

interface AdminResultsProps {
  transcript: TranscriptRow[];
  onDataChange: () => void;
}

interface GradeFormData {
  id: string;
  semester: number;
  code: string;
  title: string;
  credits: number;
  grade: string;
  point: number | null;
  standing: TranscriptRow["standing"];
  note: string;
}

const DEFAULT_FORM: GradeFormData = {
  id: "",
  semester: 6,
  code: "",
  title: "",
  credits: 3,
  grade: "A",
  point: 3.75,
  standing: "Published",
  note: "",
};

const GRADE_POINTS_MAP: Record<string, number | null> = {
  "A+": 4.0,
  A: 3.75,
  "A-": 3.5,
  "B+": 3.25,
  B: 3.0,
  "B-": 2.75,
  "C+": 2.5,
  C: 2.25,
  D: 2.0,
  F: 0.0,
  "—": null,
};

export function AdminResults({ transcript, onDataChange }: AdminResultsProps) {
  const [query, setQuery] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [standingFilter, setStandingFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<GradeFormData>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [deleteTarget, setDeleteTarget] = useState<TranscriptRow | null>(null);

  // Semester GPA trend inline edit
  const [editingGpaSem, setEditingGpaSem] = useState<string | null>(null);
  const [tempGpaValue, setTempGpaValue] = useState<string>("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transcript
      .filter((t) => {
        const matchQ =
          !q ||
          t.code.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          t.grade.toLowerCase().includes(q) ||
          t.standing.toLowerCase().includes(q) ||
          (t.note && t.note.toLowerCase().includes(q));
        const matchSem = semesterFilter === "all" || String(t.semester) === semesterFilter;
        const matchStanding = standingFilter === "all" || t.standing === standingFilter;
        return matchQ && matchSem && matchStanding;
      })
      .sort((a, b) => {
        if (a.semester !== b.semester) return b.semester - a.semester;
        return a.code.localeCompare(b.code);
      });
  }, [transcript, query, semesterFilter, standingFilter]);

  // Derived statistics
  const { calculatedCgpa, totalEarnedCredits, publishedCount, alertCount } = useMemo(() => {
    let weightedPoints = 0;
    let totalCreds = 0;
    let earned = 0;
    let published = 0;
    let alerts = 0;

    for (const row of transcript) {
      if (row.standing === "Published" || row.standing === "Retake published") {
        published += 1;
        if (row.point !== null) {
          weightedPoints += row.point * row.credits;
          totalCreds += row.credits;
          earned += row.credits;
        }
      } else if (row.standing === "Supplementary" || row.standing === "Retake required") {
        alerts += 1;
      }
    }

    const cgpa = totalCreds > 0 ? (weightedPoints / totalCreds).toFixed(2) : "3.35";
    return {
      calculatedCgpa: cgpa,
      totalEarnedCredits: earned,
      publishedCount: published,
      alertCount: alerts,
    };
  }, [transcript]);

  function handleOpenCreate() {
    setIsEditing(false);
    setFormData({
      ...DEFAULT_FORM,
      id: `t-${Date.now()}`,
    });
    setFormErrors({});
    setModalOpen(true);
  }

  function handleOpenEdit(row: TranscriptRow) {
    setIsEditing(true);
    setFormData({
      id: row.id,
      semester: row.semester,
      code: row.code,
      title: row.title,
      credits: row.credits,
      grade: row.grade,
      point: row.point,
      standing: row.standing,
      note: row.note || "",
    });
    setFormErrors({});
    setModalOpen(true);
  }

  function handleGradeChange(grade: string) {
    const pt = GRADE_POINTS_MAP[grade] ?? null;
    let standing: TranscriptRow["standing"] = formData.standing;
    if (grade === "F") standing = "Retake required";
    else if (grade === "—") standing = "Supplementary";
    else if (standing === "Supplementary" || standing === "Retake required") standing = "Published";

    setFormData({
      ...formData,
      grade,
      point: pt,
      standing,
    });
  }

  function validateForm(): boolean {
    const errors: Record<string, string> = {};
    if (!formData.code.trim()) errors.code = "Course code is required (e.g. SMP-CS-380).";
    if (!formData.title.trim()) errors.title = "Course title is required.";
    if (formData.credits < 1 || formData.credits > 6) errors.credits = "Credits must be between 1 and 6.";
    if (formData.semester < 1 || formData.semester > 8) errors.semester = "Semester must be between 1 and 8.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSaveGrade() {
    if (!validateForm()) return;

    let updated: TranscriptRow[];
    if (isEditing) {
      updated = transcript.map((t) =>
        t.id === formData.id
          ? {
              ...formData,
              note: formData.note.trim() ? formData.note.trim() : undefined,
            }
          : t,
      );
      toast.success(`Grade entry for ${formData.code} updated.`);
    } else {
      const newRow: TranscriptRow = {
        ...formData,
        id: formData.id || `t-${Date.now()}`,
        note: formData.note.trim() ? formData.note.trim() : undefined,
      };
      updated = [newRow, ...transcript];
      toast.success(`Grade entry for ${newRow.code} published to transcript.`);
    }

    saveTranscript(updated);
    onDataChange();
    setModalOpen(false);
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    const updated = transcript.filter((t) => t.id !== deleteTarget.id);
    saveTranscript(updated);
    onDataChange();
    toast.success(`Grade record for ${deleteTarget.code} deleted.`);
    setDeleteTarget(null);
  }

  function handleSaveGpa(semester: string) {
    const val = parseFloat(tempGpaValue);
    if (isNaN(val) || val < 0 || val > 4.0) {
      toast.error("Please enter a valid GPA between 0.00 and 4.00");
      return;
    }
    const updated = semesterGpas.map((item) =>
      item.semester === semester ? { ...item, gpa: Number(val.toFixed(2)) } : item,
    );
    saveSemesterGpas(updated);
    onDataChange();
    setEditingGpaSem(null);
    toast.success(`Semester ${semester} GPA updated to ${val.toFixed(2)}.`);
  }

  function getStandingBadge(standing: TranscriptRow["standing"]) {
    switch (standing) {
      case "Published":
        return "border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400";
      case "Retake published":
        return "border-blue-500/30 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400";
      case "Supplementary":
        return "border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400";
      case "Retake required":
        return "border-rose-500/30 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400";
      case "In progress":
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
          <h2 className="type-xl font-semibold text-fg">Results &amp; Transcript Records</h2>
          <p className="type-sm text-muted">
            Manage course grade books, grade points, academic standing flags, and semester GPA analytics.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 shrink-0">
          <Plus size={16} />
          <span>Add Grade Record</span>
        </Button>
      </div>

      {/* Summary Metrics Bar */}
      <dl className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4 r-lg overflow-hidden">
        <div className="bg-bg p-4">
          <dt className="type-label">Weighted CGPA</dt>
          <dd className="mt-1.5 type-2xl font-semibold tabular-nums text-fg">{calculatedCgpa}</dd>
          <p className="mt-0.5 type-xs text-muted">Scale of 4.00</p>
        </div>
        <div className="bg-bg p-4">
          <dt className="type-label">Earned Credits</dt>
          <dd className="mt-1.5 type-2xl font-semibold tabular-nums text-fg">{totalEarnedCredits} cr</dd>
          <p className="mt-0.5 type-xs text-muted">Cleared courses</p>
        </div>
        <div className="bg-bg p-4">
          <dt className="type-label">Published Courses</dt>
          <dd className="mt-1.5 type-2xl font-semibold tabular-nums text-fg">{publishedCount}</dd>
          <p className="mt-0.5 type-xs text-muted">Evaluated subjects</p>
        </div>
        <div className="bg-bg p-4">
          <dt className="type-label">Academic Flags</dt>
          <dd className="mt-1.5 type-2xl font-semibold tabular-nums text-amber-600 dark:text-amber-400">
            {alertCount}
          </dd>
          <p className="mt-0.5 type-xs text-muted">Supplementary / Retake</p>
        </div>
      </dl>

      {/* Semester GPA Trend Summary with quick edit */}
      <div className="border border-line bg-surface p-5 r-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-600 dark:text-emerald-400" />
            <h3 className="type-sm font-semibold text-fg">Semester SGPA Distribution</h3>
          </div>
          <span className="type-xs text-muted">Click any semester to calibrate GPA value</span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {semesterGpas.map((item) => (
            <div
              key={item.semester}
              className="border border-line bg-bg p-2.5 r-md flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="type-xs text-muted">Semester {item.semester}</span>
                {editingGpaSem === item.semester ? (
                  <button
                    type="button"
                    onClick={() => setEditingGpaSem(null)}
                    className="text-muted hover:text-fg text-[10px]"
                  >
                    Cancel
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingGpaSem(item.semester);
                      setTempGpaValue(String(item.gpa));
                    }}
                    className="text-muted hover:text-fg"
                    title="Edit SGPA"
                  >
                    <Edit2 size={12} />
                  </button>
                )}
              </div>

              {editingGpaSem === item.semester ? (
                <div className="mt-1.5 flex items-center gap-1">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    value={tempGpaValue}
                    onChange={(e) => setTempGpaValue(e.target.value)}
                    className="w-full rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-xs text-fg focus:outline-none"
                    autoFocus
                  />
                  <Button
                    variant="primary"
                    onClick={() => handleSaveGpa(item.semester)}
                    className="h-6 px-1.5 text-[10px]"
                  >
                    Save
                  </Button>
                </div>
              ) : (
                <p className="mt-1 font-mono text-base font-semibold tabular-nums text-fg">
                  {item.gpa.toFixed(2)}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search grade entries by code, title, standing, or grade..."
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
            <span>Semester:</span>
          </div>
          <select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            className="rounded-lg border border-line bg-bg px-2.5 py-1.5 type-sm text-fg focus:outline-none"
          >
            <option value="all">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={String(s)}>
                Semester {s}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 type-xs text-muted">
            <span>Standing:</span>
          </div>
          <select
            value={standingFilter}
            onChange={(e) => setStandingFilter(e.target.value)}
            className="rounded-lg border border-line bg-bg px-2.5 py-1.5 type-sm text-fg focus:outline-none"
          >
            <option value="all">All Standings</option>
            <option value="Published">Published</option>
            <option value="Supplementary">Supplementary</option>
            <option value="Retake required">Retake required</option>
            <option value="Retake published">Retake published</option>
            <option value="In progress">In progress</option>
          </select>
        </div>
      </div>

      {/* Transcript Table */}
      <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left type-sm border-collapse">
            <thead>
              <tr className="border-b border-line bg-sunken/60 text-xs font-semibold text-muted uppercase tracking-wider">
                <th className="px-4 py-3.5">Sem</th>
                <th className="px-4 py-3.5">Code</th>
                <th className="px-4 py-3.5">Course Title</th>
                <th className="px-4 py-3.5 text-center">Credits</th>
                <th className="px-4 py-3.5 text-center">Grade</th>
                <th className="px-4 py-3.5 text-center">Point</th>
                <th className="px-4 py-3.5 text-center">Standing</th>
                <th className="px-4 py-3.5">Note</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-muted">
                    No transcript entries match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="transition-ui hover:bg-sunken/40">
                    <td className="px-4 py-3.5 font-medium text-fg whitespace-nowrap">
                      Sem {row.semester}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs font-medium text-fg whitespace-nowrap">
                      {row.code}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-fg">{row.title}</td>
                    <td className="px-4 py-3.5 text-center tabular-nums text-muted">{row.credits}</td>
                    <td className="px-4 py-3.5 text-center font-bold tabular-nums text-fg">
                      {row.grade}
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono tabular-nums text-muted">
                      {row.point !== null ? row.point.toFixed(2) : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <span
                        className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-medium ${getStandingBadge(
                          row.standing,
                        )}`}
                      >
                        {row.standing}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 max-w-xs truncate text-xs text-muted">
                      {row.note || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          onClick={() => handleOpenEdit(row)}
                          className="size-8 p-0 text-muted hover:text-fg"
                          title="Edit grade record"
                        >
                          <Edit2 size={15} />
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => setDeleteTarget(row)}
                          className="size-8 p-0 text-danger/80 hover:text-danger hover:bg-danger/10"
                          title="Delete grade record"
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
        <div className="border-t border-line px-4 py-3 text-xs text-muted flex items-center justify-between">
          <span>
            Showing <strong className="text-fg">{filtered.length}</strong> of{" "}
            <strong className="text-fg">{transcript.length}</strong> transcript records
          </span>
          <span className="tabular-nums">
            Calculated Cumulative CGPA: <strong className="text-fg font-medium">{calculatedCgpa}</strong>
          </span>
        </div>
      </div>

      {/* Add / Edit Grade Modal */}
      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={isEditing ? `Edit Grade Record · ${formData.code}` : "Publish Grade to Transcript"}
        description="Record course completion, letter grade, and grade points for official transcripts."
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Semester" htmlFor="grade-semester" error={formErrors.semester}>
              <SelectInput
                id="grade-semester"
                value={String(formData.semester)}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) || 1 })}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={String(s)}>
                    Semester {s}
                  </option>
                ))}
              </SelectInput>
            </Field>

            <Field label="Course Code" htmlFor="grade-code" error={formErrors.code} hint="e.g. SMP-CS-380">
              <TextInput
                id="grade-code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="SMP-CS-380"
              />
            </Field>

            <Field label="Credits" htmlFor="grade-credits" error={formErrors.credits}>
              <TextInput
                id="grade-credits"
                type="number"
                min={1}
                max={6}
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) || 1 })}
              />
            </Field>
          </div>

          <Field label="Course Title" htmlFor="grade-title" error={formErrors.title}>
            <TextInput
              id="grade-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Operating Systems"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Letter Grade" htmlFor="grade-letter">
              <SelectInput
                id="grade-letter"
                value={formData.grade}
                onChange={(e) => handleGradeChange(e.target.value)}
              >
                {Object.keys(GRADE_POINTS_MAP).map((g) => (
                  <option key={g} value={g}>
                    {g} {GRADE_POINTS_MAP[g] !== null ? `(${GRADE_POINTS_MAP[g]?.toFixed(2)})` : "(No GPA)"}
                  </option>
                ))}
              </SelectInput>
            </Field>

            <Field label="Grade Point" htmlFor="grade-point" hint="Scale 4.00">
              <TextInput
                id="grade-point"
                type="number"
                step="0.01"
                min="0.00"
                max="4.00"
                value={formData.point !== null ? formData.point : ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    point: e.target.value === "" ? null : Number(e.target.value),
                  })
                }
                placeholder="e.g. 3.75"
              />
            </Field>

            <Field label="Academic Standing" htmlFor="grade-standing">
              <SelectInput
                id="grade-standing"
                value={formData.standing}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    standing: e.target.value as TranscriptRow["standing"],
                  })
                }
              >
                <option value="Published">Published</option>
                <option value="Retake published">Retake published</option>
                <option value="Supplementary">Supplementary</option>
                <option value="Retake required">Retake required</option>
                <option value="In progress">In progress</option>
              </SelectInput>
            </Field>
          </div>

          <Field label="Official Registrar Note" htmlFor="grade-note" hint="Optional rationale or supplementary sitting note">
            <TextInput
              id="grade-note"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="e.g. Supplementary sitting pending departmental schedule."
            />
          </Field>

          <div className="flex justify-end gap-3 border-t border-line pt-4">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveGrade}>
              {isEditing ? "Save Grade Changes" : "Commit Grade to Record"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Grade Record"
        description={
          deleteTarget
            ? `Are you sure you want to remove ${deleteTarget.code} (${deleteTarget.title}) from the official transcript?`
            : undefined
        }
      >
        <div className="flex flex-col gap-4">
          <p className="type-sm text-muted">
            This will remove this grade from credit calculations, transcript downloads, and GPA trends.
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
