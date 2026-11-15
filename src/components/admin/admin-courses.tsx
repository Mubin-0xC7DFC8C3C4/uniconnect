import {
  BookOpen,
  Edit2,
  Filter,
  Plus,
  PlusCircle,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { type Course, saveCourses } from "@/data/demo";
import { Button } from "@/components/ui/button";
import { Field, SelectInput, TextInput } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";

interface AdminCoursesProps {
  courses: Course[];
  onDataChange: () => void;
}

interface CourseFormData {
  id: string;
  code: string;
  title: string;
  credits: number;
  instructor: string;
  type: string;
  section: string;
  outline: string[];
  assessment: { label: string; weight: number }[];
}

const DEFAULT_FORM: CourseFormData = {
  id: "",
  code: "",
  title: "",
  credits: 3,
  instructor: "",
  type: "Theory",
  section: "A",
  outline: ["Fundamental concepts", "Practical case studies", "Final project submission"],
  assessment: [
    { label: "Midterm Examination", weight: 30 },
    { label: "Final Examination", weight: 40 },
    { label: "Continuous Assessment / Lab", weight: 30 },
  ],
};

export function AdminCourses({ courses, onDataChange }: AdminCoursesProps) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<CourseFormData>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);

  // New outline/assessment buffer
  const [newOutlineTopic, setNewOutlineTopic] = useState("");
  const [newAssessLabel, setNewAssessLabel] = useState("");
  const [newAssessWeight, setNewAssessWeight] = useState<number>(10);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter((c) => {
      const matchQ =
        !q ||
        c.code.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q);
      const matchType = typeFilter === "all" || c.type.toLowerCase().includes(typeFilter.toLowerCase());
      const matchSection = sectionFilter === "all" || c.section.toLowerCase() === sectionFilter.toLowerCase();
      return matchQ && matchType && matchSection;
    });
  }, [courses, query, typeFilter, sectionFilter]);

  function handleOpenCreate() {
    setIsEditing(false);
    setFormData({
      ...DEFAULT_FORM,
      id: `course-${Date.now()}`,
    });
    setFormErrors({});
    setNewOutlineTopic("");
    setModalOpen(true);
  }

  function handleOpenEdit(course: Course) {
    setIsEditing(true);
    setFormData({
      id: course.id,
      code: course.code,
      title: course.title,
      credits: course.credits,
      instructor: course.instructor,
      type: course.type,
      section: course.section,
      outline: [...(course.outline || [])],
      assessment: course.assessment ? [...course.assessment] : [],
    });
    setFormErrors({});
    setNewOutlineTopic("");
    setModalOpen(true);
  }

  function validateForm(): boolean {
    const errors: Record<string, string> = {};
    if (!formData.code.trim()) errors.code = "Course code is required (e.g. SMP-CS-401).";
    if (!formData.title.trim()) errors.title = "Course title is required.";
    if (!formData.instructor.trim()) errors.instructor = "Instructor name is required.";
    if (formData.credits < 1 || formData.credits > 6) errors.credits = "Credits must be between 1 and 6.";
    if (!formData.section.trim()) errors.section = "Section is required.";
    if (!formData.type.trim()) errors.type = "Course format/type is required.";
    if (formData.outline.length === 0) errors.outline = "Provide at least one syllabus outline item.";

    // Check unique course code when creating
    if (!isEditing && courses.some((c) => c.code.trim().toLowerCase() === formData.code.trim().toLowerCase())) {
      errors.code = "A course with this code already exists in the catalog.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSaveCourse() {
    if (!validateForm()) return;

    let updatedList: Course[];
    if (isEditing) {
      updatedList = courses.map((c) => (c.id === formData.id ? { ...formData } : c));
      toast.success(`Course ${formData.code} updated successfully.`);
    } else {
      const newCourse: Course = {
        ...formData,
        id: formData.id || formData.code.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      };
      updatedList = [newCourse, ...courses];
      toast.success(`Course ${newCourse.code} created and added to catalog.`);
    }

    saveCourses(updatedList);
    onDataChange();
    setModalOpen(false);
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    const updated = courses.filter((c) => c.id !== deleteTarget.id);
    saveCourses(updated);
    onDataChange();
    toast.success(`Course ${deleteTarget.code} deleted.`);
    setDeleteTarget(null);
  }

  function handleAddOutline() {
    const topic = newOutlineTopic.trim();
    if (!topic) return;
    setFormData((prev) => ({
      ...prev,
      outline: [...prev.outline, topic],
    }));
    setNewOutlineTopic("");
  }

  function handleRemoveOutline(idx: number) {
    setFormData((prev) => ({
      ...prev,
      outline: prev.outline.filter((_, i) => i !== idx),
    }));
  }

  function handleAddAssessment() {
    const label = newAssessLabel.trim();
    if (!label || !newAssessWeight) return;
    setFormData((prev) => ({
      ...prev,
      assessment: [...prev.assessment, { label, weight: Number(newAssessWeight) }],
    }));
    setNewAssessLabel("");
    setNewAssessWeight(10);
  }

  function handleRemoveAssessment(idx: number) {
    setFormData((prev) => ({
      ...prev,
      assessment: prev.assessment.filter((_, i) => i !== idx),
    }));
  }

  const totalAssessmentWeight = formData.assessment.reduce((s, a) => s + a.weight, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="type-xl font-semibold text-fg">Course Catalog</h2>
          <p className="type-sm text-muted">
            Manage institutional course offerings, credit allocations, syllabus outlines, and grading breakdowns.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 shrink-0">
          <Plus size={16} />
          <span>Add New Course</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by course code, title, or instructor..."
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

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 type-xs text-muted">
            <Filter size={14} />
            <span>Format:</span>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-line bg-bg px-2.5 py-1.5 type-sm text-fg focus:outline-none"
          >
            <option value="all">All Formats</option>
            <option value="theory">Theory</option>
            <option value="lab">Lab</option>
            <option value="tutorial">Tutorial</option>
            <option value="seminar">Seminar</option>
          </select>

          <div className="flex items-center gap-1.5 type-xs text-muted">
            <span>Section:</span>
          </div>
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="rounded-lg border border-line bg-bg px-2.5 py-1.5 type-sm text-fg focus:outline-none"
          >
            <option value="all">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>
      </div>

      {/* Course Data Table */}
      <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left type-sm border-collapse">
            <thead>
              <tr className="border-b border-line bg-sunken/60 text-xs font-semibold text-muted uppercase tracking-wider">
                <th className="px-4 py-3.5">Code</th>
                <th className="px-4 py-3.5">Course Title</th>
                <th className="px-4 py-3.5 text-center">Credits</th>
                <th className="px-4 py-3.5">Instructor</th>
                <th className="px-4 py-3.5 text-center">Section</th>
                <th className="px-4 py-3.5">Format</th>
                <th className="px-4 py-3.5 text-center">Outline</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted">
                    No courses match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((course) => (
                  <tr key={course.id} className="transition-ui hover:bg-sunken/40">
                    <td className="px-4 py-3.5 font-mono text-xs font-medium text-fg whitespace-nowrap">
                      {course.code}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-fg">
                      <div>{course.title}</div>
                      <div className="type-xs text-muted sm:hidden">{course.instructor}</div>
                    </td>
                    <td className="px-4 py-3.5 text-center tabular-nums text-fg font-medium">
                      {course.credits}
                    </td>
                    <td className="px-4 py-3.5 text-muted">{course.instructor}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-block rounded-md border border-line bg-bg px-2 py-0.5 text-xs font-medium text-fg">
                        {course.section}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-muted">{course.type}</td>
                    <td className="px-4 py-3.5 text-center tabular-nums text-muted">
                      {course.outline?.length || 0} topics
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          onClick={() => handleOpenEdit(course)}
                          className="size-8 p-0 text-muted hover:text-fg"
                          title="Edit course"
                        >
                          <Edit2 size={15} />
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => setDeleteTarget(course)}
                          className="size-8 p-0 text-danger/80 hover:text-danger hover:bg-danger/10"
                          title="Delete course"
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
            <strong className="text-fg">{courses.length}</strong> courses
          </span>
          <span className="tabular-nums">
            Total Term Credits:{" "}
            <strong className="text-fg font-medium">
              {courses.reduce((sum, c) => sum + c.credits, 0)}
            </strong>
          </span>
        </div>
      </div>

      {/* Add / Edit Course Modal */}
      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={isEditing ? `Edit Course · ${formData.code}` : "Add New Course"}
        description="Fill in course syllabus parameters, instructor attribution, and grading weights."
        wide={true}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Course Code" htmlFor="course-code" error={formErrors.code} hint="e.g. SMP-CS-401">
              <TextInput
                id="course-code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="SMP-CS-401"
              />
            </Field>

            <Field label="Course Title" htmlFor="course-title" error={formErrors.title} hint="e.g. Algorithms">
              <TextInput
                id="course-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Algorithms"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Credits" htmlFor="course-credits" error={formErrors.credits}>
              <TextInput
                id="course-credits"
                type="number"
                min={1}
                max={6}
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) || 1 })}
              />
            </Field>

            <Field label="Section" htmlFor="course-section" error={formErrors.section}>
              <SelectInput
                id="course-section"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </SelectInput>
            </Field>

            <Field label="Format / Type" htmlFor="course-type" error={formErrors.type}>
              <SelectInput
                id="course-type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Theory">Theory</option>
                <option value="Theory + lab">Theory + lab</option>
                <option value="Theory + tutorial">Theory + tutorial</option>
                <option value="Seminar">Seminar</option>
                <option value="Lab">Lab</option>
              </SelectInput>
            </Field>
          </div>

          <Field label="Instructor" htmlFor="course-instructor" error={formErrors.instructor} hint="Faculty member name">
            <TextInput
              id="course-instructor"
              value={formData.instructor}
              onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
              placeholder="e.g. Dr. L. Chowdhury"
            />
          </Field>

          {/* Syllabus Outline Editor */}
          <div className="space-y-2 border-t border-line pt-4">
            <div className="flex items-center justify-between">
              <label className="type-sm font-medium text-fg">Syllabus Outline Topics</label>
              <span className="type-xs text-muted">{formData.outline.length} topics</span>
            </div>
            {formErrors.outline ? (
              <p className="type-xs text-danger">{formErrors.outline}</p>
            ) : null}

            <ul className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {formData.outline.map((topic, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between gap-2 rounded-md border border-line bg-sunken/40 px-3 py-1.5 text-xs text-fg"
                >
                  <span className="truncate">{topic}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveOutline(idx)}
                    className="text-muted hover:text-danger"
                    title="Remove topic"
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newOutlineTopic}
                onChange={(e) => setNewOutlineTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddOutline();
                  }
                }}
                placeholder="Add syllabus topic..."
                className="flex-1 rounded-md border border-line bg-bg px-3 py-1.5 type-xs text-fg focus:outline-none"
              />
              <Button variant="secondary" onClick={handleAddOutline} className="h-8 px-2.5 text-xs">
                <Plus size={14} />
                <span>Add</span>
              </Button>
            </div>
          </div>

          {/* Assessment Breakdown Editor */}
          <div className="space-y-2 border-t border-line pt-4">
            <div className="flex items-center justify-between">
              <label className="type-sm font-medium text-fg">Assessment Breakdown</label>
              <span
                className={`type-xs font-medium tabular-nums ${
                  totalAssessmentWeight === 100 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                }`}
              >
                Total Weight: {totalAssessmentWeight}% {totalAssessmentWeight === 100 ? "✓" : "(target 100%)"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 max-h-36 overflow-y-auto">
              {formData.assessment.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 rounded-md border border-line bg-sunken/40 px-3 py-1.5 text-xs"
                >
                  <span className="truncate text-fg">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium text-fg tabular-nums">{item.weight}%</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAssessment(idx)}
                      className="text-muted hover:text-danger"
                      title="Remove component"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newAssessLabel}
                onChange={(e) => setNewAssessLabel(e.target.value)}
                placeholder="Component (e.g. Quizzes)"
                className="flex-1 rounded-md border border-line bg-bg px-3 py-1.5 type-xs text-fg focus:outline-none"
              />
              <input
                type="number"
                min={1}
                max={100}
                value={newAssessWeight}
                onChange={(e) => setNewAssessWeight(Number(e.target.value) || 0)}
                className="w-16 rounded-md border border-line bg-bg px-2 py-1.5 text-center font-mono type-xs text-fg focus:outline-none"
              />
              <span className="text-xs text-muted">%</span>
              <Button variant="secondary" onClick={handleAddAssessment} className="h-8 px-2.5 text-xs">
                <Plus size={14} />
                <span>Add</span>
              </Button>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-3 border-t border-line pt-4">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveCourse}>
              {isEditing ? "Save Course Changes" : "Create Course"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Course from Catalog"
        description={
          deleteTarget
            ? `Are you sure you want to remove ${deleteTarget.code} (${deleteTarget.title}) from the active courses?`
            : undefined
        }
      >
        <div className="flex flex-col gap-4">
          <p className="type-sm text-muted">
            Removing this course will delete it from the student catalog, credit computations, and search indices.
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
