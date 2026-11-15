import {
  CheckCircle2,
  Edit2,
  Filter,
  GraduationCap,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  type DemoProfile,
  type StudentRecord,
  saveStudents,
} from "@/data/demo";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Field, SelectInput, TextArea, TextInput } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";

interface AdminStudentsProps {
  students: StudentRecord[];
  onDataChange: () => void;
}

interface StudentFormData {
  id: string;
  studentId: string;
  name: string;
  email: string;
  department: string;
  batch: string;
  semesterLabel: string;
  program: string;
  section: string;
  phone: string;
  altEmail: string;
  bio: string;
  photoDataUrl: string | null;
  cgpa: number;
  creditsEarned: number;
  status: "active" | "probation" | "graduated" | "leave";
  admissionDate: string;
}

const DEFAULT_FORM: StudentFormData = {
  id: "",
  studentId: "",
  name: "",
  email: "",
  department: "Computing (sample department)",
  batch: "2023 sample cohort",
  semesterLabel: "Semester 5",
  program: "Undergraduate sample program",
  section: "A",
  phone: "+880 1700-000000",
  altEmail: "",
  bio: "",
  photoDataUrl: null,
  cgpa: 3.5,
  creditsEarned: 75,
  status: "active",
  admissionDate: "2023-01-15",
};

export function AdminStudents({ students, onDataChange }: AdminStudentsProps) {
  const activeProfile = useAppStore((state) => state.profile);
  const updateProfile = useAppStore((state) => state.updateProfile);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<StudentFormData>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [deleteTarget, setDeleteTarget] = useState<StudentRecord | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students.filter((s) => {
      const matchQ =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      return matchQ && matchStatus;
    });
  }, [students, query, statusFilter]);

  function handleOpenCreate() {
    setIsEditing(false);
    setFormData({
      ...DEFAULT_FORM,
      id: `student-${Date.now()}`,
      studentId: `DEMO-2024-${Math.floor(1000 + Math.random() * 9000)}`,
    });
    setFormErrors({});
    setModalOpen(true);
  }

  function handleOpenEdit(student: StudentRecord) {
    setIsEditing(true);
    setFormData({
      id: student.id,
      studentId: student.studentId,
      name: student.name,
      email: student.email,
      department: student.department,
      batch: student.batch,
      semesterLabel: student.semesterLabel,
      program: student.program,
      section: student.section,
      phone: student.phone || "",
      altEmail: student.altEmail || "",
      bio: student.bio || "",
      photoDataUrl: student.photoDataUrl,
      cgpa: student.cgpa ?? 3.5,
      creditsEarned: student.creditsEarned ?? 100,
      status: student.status ?? "active",
      admissionDate: student.admissionDate || "2023-01-15",
    });
    setFormErrors({});
    setModalOpen(true);
  }

  function validateForm(): boolean {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Student name is required.";
    if (!formData.studentId.trim()) errors.studentId = "Student ID is required.";
    if (!formData.email.trim() || !formData.email.includes("@")) errors.email = "Valid student email is required.";
    if (!formData.department.trim()) errors.department = "Department is required.";
    if (formData.cgpa < 0 || formData.cgpa > 4.0) errors.cgpa = "CGPA must be between 0.00 and 4.00.";
    if (formData.creditsEarned < 0) errors.creditsEarned = "Earned credits cannot be negative.";

    // ID uniqueness when creating
    if (!isEditing && students.some((s) => s.studentId.trim().toLowerCase() === formData.studentId.trim().toLowerCase())) {
      errors.studentId = "A student with this Student ID already exists.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSaveStudent() {
    if (!validateForm()) return;

    let updated: StudentRecord[];
    if (isEditing) {
      updated = students.map((s) => (s.id === formData.id ? { ...formData } : s));
      toast.success(`Student record for ${formData.name} updated.`);

      // If this student is currently active in the portal, also update the store profile!
      if (activeProfile.studentId === formData.studentId) {
        updateProfile({
          name: formData.name,
          email: formData.email,
          studentId: formData.studentId,
          department: formData.department,
          batch: formData.batch,
          semesterLabel: formData.semesterLabel,
          program: formData.program,
          section: formData.section,
          phone: formData.phone,
          altEmail: formData.altEmail,
          bio: formData.bio,
        });
      }
    } else {
      const newRecord: StudentRecord = {
        ...formData,
        id: formData.id || formData.studentId,
      };
      updated = [newRecord, ...students];
      toast.success(`Student ${newRecord.name} registered.`);
    }

    saveStudents(updated);
    onDataChange();
    setModalOpen(false);
  }

  function handleSetActive(student: StudentRecord) {
    updateProfile({
      name: student.name,
      email: student.email,
      studentId: student.studentId,
      department: student.department,
      batch: student.batch,
      semesterLabel: student.semesterLabel,
      program: student.program,
      section: student.section,
      phone: student.phone,
      altEmail: student.altEmail,
      bio: student.bio,
      photoDataUrl: student.photoDataUrl,
    });
    toast.success(`Active portal profile switched to ${student.name} (${student.studentId}).`);
    onDataChange();
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    if (activeProfile.studentId === deleteTarget.studentId) {
      toast.error("Cannot delete the currently active portal student. Switch active student first.");
      setDeleteTarget(null);
      return;
    }
    const updated = students.filter((s) => s.id !== deleteTarget.id);
    saveStudents(updated);
    onDataChange();
    toast.success(`Student ${deleteTarget.name} removed from roster.`);
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="type-xl font-semibold text-fg">Student Directory &amp; Records</h2>
          <p className="type-sm text-muted">
            Manage student registrations, academic standings, and assign the currently active student session.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 shrink-0">
          <UserPlus size={16} />
          <span>Register New Student</span>
        </Button>
      </div>

      {/* Active Profile Banner */}
      <div className="border border-line bg-surface p-5 r-lg flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex size-11 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
            <UserCheck size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="type-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Portal Session Identity
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.2 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                Active
              </span>
            </div>
            <p className="type-base font-medium text-fg">
              {activeProfile.name} · <span className="font-mono type-xs text-muted">{activeProfile.studentId}</span>
            </p>
            <p className="type-xs text-muted">
              {activeProfile.department} · {activeProfile.semesterLabel} · Section {activeProfile.section}
            </p>
          </div>
        </div>
        <span className="type-xs text-muted max-w-xs text-right hidden lg:block">
          Click &quot;Make Active&quot; on any student below to immediately switch the student portal credentials.
        </span>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students by name, ID, email, or department..."
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
          <span className="type-xs text-muted">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-line bg-bg px-2.5 py-1.5 type-sm text-fg focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="probation">Probation</option>
            <option value="graduated">Graduated</option>
            <option value="leave">Leave of Absence</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left type-sm border-collapse">
            <thead>
              <tr className="border-b border-line bg-sunken/60 text-xs font-semibold text-muted uppercase tracking-wider">
                <th className="px-4 py-3.5">Student ID</th>
                <th className="px-4 py-3.5">Name &amp; Email</th>
                <th className="px-4 py-3.5">Department &amp; Batch</th>
                <th className="px-4 py-3.5 text-center">Semester</th>
                <th className="px-4 py-3.5 text-center">CGPA</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted">
                    No students found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map((student) => {
                  const isActive = activeProfile.studentId === student.studentId;
                  return (
                    <tr
                      key={student.id}
                      className={`transition-ui ${isActive ? "bg-emerald-500/5 hover:bg-emerald-500/10" : "hover:bg-sunken/40"}`}
                    >
                      <td className="px-4 py-3.5 font-mono text-xs font-medium text-fg whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {isActive ? (
                            <span className="size-2 rounded-full bg-emerald-500" title="Active student session" />
                          ) : null}
                          <span>{student.studentId}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-fg">{student.name}</p>
                        <p className="type-xs text-muted">{student.email}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-fg">{student.department}</p>
                        <p className="type-xs text-muted">{student.batch}</p>
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span className="rounded-md border border-line bg-bg px-2 py-0.5 text-xs text-fg">
                          {student.semesterLabel} ({student.section})
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono font-medium tabular-nums text-fg">
                        {student.cgpa?.toFixed(2) ?? "—"}
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${
                            student.status === "active"
                              ? "border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : student.status === "probation"
                                ? "border-rose-500/30 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                                : "border-line bg-sunken text-muted"
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isActive ? (
                            <Button
                              variant="secondary"
                              onClick={() => handleSetActive(student)}
                              className="h-7 px-2.5 text-[11px]"
                              title="Set as portal active student"
                            >
                              Make Active
                            </Button>
                          ) : (
                            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 px-2">
                              Active ✓
                            </span>
                          )}
                          <Button
                            variant="ghost"
                            onClick={() => handleOpenEdit(student)}
                            className="size-8 p-0 text-muted hover:text-fg"
                            title="Edit student record"
                          >
                            <Edit2 size={15} />
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => setDeleteTarget(student)}
                            disabled={isActive}
                            className="size-8 p-0 text-danger/80 hover:text-danger hover:bg-danger/10 disabled:opacity-30"
                            title={isActive ? "Cannot delete active student" : "Delete student record"}
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
        <div className="border-t border-line px-4 py-3 text-xs text-muted flex items-center justify-between">
          <span>
            Showing <strong className="text-fg">{filtered.length}</strong> of{" "}
            <strong className="text-fg">{students.length}</strong> registered students
          </span>
          <span className="text-muted">
            Active Student ID: <strong className="font-mono text-fg">{activeProfile.studentId}</strong>
          </span>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={isEditing ? `Edit Student · ${formData.studentId}` : "Register New Student"}
        description="Add or update university credentials, semester placement, and academic standing."
        wide={true}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Full Name" htmlFor="student-name" error={formErrors.name}>
              <TextInput
                id="student-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Rahim Ahmed"
              />
            </Field>

            <Field label="Student ID" htmlFor="student-id" error={formErrors.studentId} hint="Unique registrar roll number">
              <TextInput
                id="student-id"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                placeholder="DEMO-2022-0148"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Institutional Email" htmlFor="student-email" error={formErrors.email}>
              <TextInput
                id="student-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="student@metrouni.edu.bd"
              />
            </Field>

            <Field label="Phone Contact" htmlFor="student-phone">
              <TextInput
                id="student-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+880 1712-345678"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Department" htmlFor="student-dept" error={formErrors.department}>
              <TextInput
                id="student-dept"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Computing"
              />
            </Field>

            <Field label="Batch" htmlFor="student-batch">
              <TextInput
                id="student-batch"
                value={formData.batch}
                onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                placeholder="2022 sample cohort"
              />
            </Field>

            <Field label="Semester Label" htmlFor="student-sem">
              <TextInput
                id="student-sem"
                value={formData.semesterLabel}
                onChange={(e) => setFormData({ ...formData, semesterLabel: e.target.value })}
                placeholder="Semester 7"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <Field label="Section" htmlFor="student-section">
              <SelectInput
                id="student-section"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </SelectInput>
            </Field>

            <Field label="CGPA" htmlFor="student-cgpa" error={formErrors.cgpa}>
              <TextInput
                id="student-cgpa"
                type="number"
                step="0.01"
                min="0.00"
                max="4.00"
                value={formData.cgpa}
                onChange={(e) => setFormData({ ...formData, cgpa: Number(e.target.value) || 0 })}
              />
            </Field>

            <Field label="Credits" htmlFor="student-credits" error={formErrors.creditsEarned}>
              <TextInput
                id="student-credits"
                type="number"
                value={formData.creditsEarned}
                onChange={(e) => setFormData({ ...formData, creditsEarned: Number(e.target.value) || 0 })}
              />
            </Field>

            <Field label="Academic Status" htmlFor="student-status">
              <SelectInput
                id="student-status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as StudentFormData["status"] })}
              >
                <option value="active">Active</option>
                <option value="probation">Probation</option>
                <option value="graduated">Graduated</option>
                <option value="leave">Leave</option>
              </SelectInput>
            </Field>
          </div>

          <Field label="Student Bio &amp; Academic Note" htmlFor="student-bio">
            <TextArea
              id="student-bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
              placeholder="Short bio or adviser notes..."
            />
          </Field>

          <div className="flex justify-end gap-3 border-t border-line pt-4">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveStudent}>
              {isEditing ? "Save Student Changes" : "Register Student"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Student Record"
        description={deleteTarget ? `Are you sure you want to remove ${deleteTarget.name} (${deleteTarget.studentId}) from the directory?` : undefined}
      >
        <div className="flex flex-col gap-4">
          <p className="type-sm text-muted">
            This action will permanently delete this student record from the registrar directory.
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
