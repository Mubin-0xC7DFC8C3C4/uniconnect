import { Link } from "@tanstack/react-router";
import {
  AtSign,
  BookOpen,
  Building2,
  Camera,
  Check,
  FileText,
  Lock,
  Mail,
  Phone,
  Users,
} from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { CURRENT_TERM, SAMPLE_CGPA, courses, termCredits } from "@/data/demo";
import { initials, isEmail } from "@/lib/format";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Field, TextArea, TextInput } from "@/components/ui/field";

export function ProfilePage() {
  const profile = useAppStore((state) => state.profile);
  const updateProfile = useAppStore((state) => state.updateProfile);

  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState(profile.phone);
  const [altEmail, setAltEmail] = useState(profile.altEmail);
  const [bio, setBio] = useState(profile.bio);
  const [photo, setPhoto] = useState<string | null>(profile.photoDataUrl);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function startEditing() {
    setPhone(profile.phone);
    setAltEmail(profile.altEmail);
    setBio(profile.bio);
    setPhoto(profile.photoDataUrl);
    setErrors({});
    setIsEditing(true);
  }

  function cancelEditing() {
    setPhone(profile.phone);
    setAltEmail(profile.altEmail);
    setBio(profile.bio);
    setPhoto(profile.photoDataUrl);
    setErrors({});
    setIsEditing(false);
  }

  function onPhoto(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((current) => ({ ...current, photo: "Choose an image file." }));
      return;
    }
    if (file.size > 400_000) {
      setErrors((current) => ({
        ...current,
        photo: "Use an image under 400 KB. It stays in this browser.",
      }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPhoto(reader.result);
        setErrors((current) => ({ ...current, photo: "" }));
        // If user uploads directly via avatar camera button outside edit mode, save immediately
        if (!isEditing) {
          updateProfile({ photoDataUrl: reader.result });
          toast("Profile photo updated in this browser.");
        }
      }
    };
    reader.readAsDataURL(file);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (phone.trim() && !/^[0-9+\-\s()]{7,20}$/.test(phone.trim())) {
      next.phone = "Use 7–20 digits, spaces, plus signs, or brackets.";
    }
    if (altEmail.trim() && !isEmail(altEmail.trim())) {
      next.altEmail = "Enter a valid email, or leave this blank.";
    }
    if (bio.trim().length > 280) next.bio = "Keep this under 280 characters.";

    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    updateProfile({
      phone: phone.trim(),
      altEmail: altEmail.trim(),
      bio: bio.trim(),
      photoDataUrl: photo,
    });
    setIsEditing(false);
    toast("Profile saved on this browser.");
  }

  const activePhoto = isEditing ? photo : profile.photoDataUrl;

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[19rem_minmax(0,1fr)] lg:gap-10">
      {/* =========================================================
          LEFT SIDEBAR: GITHUB-STYLE PROFILE IDENTITY & INLINE EDIT
         ========================================================= */}
      <aside className="flex flex-col gap-5">
        {/* Circular Avatar + Camera Trigger */}
        <div className="flex items-center gap-5 lg:flex-col lg:items-start">
          <div className="relative shrink-0">
            {activePhoto ? (
              <img
                src={activePhoto}
                alt={profile.name}
                className="size-24 border border-line object-cover r-pill sm:size-28 lg:size-64"
              />
            ) : (
              <div className="flex size-24 items-center justify-center border border-line bg-sunken type-2xl font-medium text-fg r-pill sm:size-28 lg:size-64 lg:text-5xl">
                {initials(profile.name)}
              </div>
            )}

            <input
              ref={fileInputRef}
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => onPhoto(event.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Change profile photo (max 400 KB)"
              aria-label="Change profile photo"
              className="absolute right-1 bottom-1 inline-flex size-9 items-center justify-center border border-line bg-surface text-fg shadow-xs r-pill transition-ui hover:bg-sunken lg:right-3 lg:bottom-3 lg:size-10"
            >
              <Camera size={16} strokeWidth={1.75} />
            </button>
          </div>

          {/* Name & Student ID Handle */}
          <div className="lg:w-full">
            <h1 className="type-2xl font-medium text-fg">{profile.name}</h1>
            <p className="mt-0.5 type-base text-muted">{profile.studentId}</p>
          </div>
        </div>

        {errors.photo ? (
          <p role="alert" className="type-xs text-danger">
            {errors.photo}
          </p>
        ) : null}

        {/* View Mode vs Inline GitHub Edit Mode */}
        {!isEditing ? (
          <>
            {profile.bio ? (
              <p className="type-sm leading-relaxed text-fg">{profile.bio}</p>
            ) : (
              <p className="type-sm italic text-faint">Add a brief academic note or personal bio (max 280 characters).</p>
            )}

            <button
              type="button"
              onClick={startEditing}
              className="inline-flex h-10 w-full items-center justify-center border border-line bg-surface px-4 type-sm font-medium text-fg r-md transition-ui hover:bg-sunken"
            >
              Edit profile
            </button>

            {/* GitHub-Style Metadata Icon Rows */}
            <ul className="space-y-2.5 border-t border-line pt-4 type-sm text-muted">
              <li className="flex items-center gap-2.5">
                <Building2 size={15} strokeWidth={1.75} className="shrink-0 text-faint" />
                <span className="truncate text-fg">{profile.department}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Users size={15} strokeWidth={1.75} className="shrink-0 text-faint" />
                <span>
                  {profile.batch} · Section {profile.section}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={15} strokeWidth={1.75} className="shrink-0 text-faint" />
                <span className="truncate">{profile.email}</span>
              </li>
              {profile.phone ? (
                <li className="flex items-center gap-2.5">
                  <Phone size={15} strokeWidth={1.75} className="shrink-0 text-faint" />
                  <span>{profile.phone}</span>
                </li>
              ) : null}
              {profile.altEmail ? (
                <li className="flex items-center gap-2.5">
                  <AtSign size={15} strokeWidth={1.75} className="shrink-0 text-faint" />
                  <span className="truncate">{profile.altEmail}</span>
                </li>
              ) : null}
            </ul>
          </>
        ) : (
          /* Inline Sidebar Edit Form (Like GitHub Profile Edit) */
          <form onSubmit={onSubmit} className="flex flex-col gap-4 border-t border-line pt-4" noValidate>
            <div className="flex items-center justify-between">
              <span className="type-xs text-muted">Photo max 400 KB (local)</span>
              {photo ? (
                <button
                  type="button"
                  onClick={() => setPhoto(null)}
                  className="type-xs text-danger underline-offset-4 hover:underline"
                >
                  Remove photo
                </button>
              ) : null}
            </div>

            <Field label="Bio / Note" htmlFor="bio" error={errors.bio} hint={`${bio.trim().length}/280`}>
              <TextArea
                id="bio"
                rows={3}
                placeholder="Write a short note about your academic focus..."
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                aria-invalid={Boolean(errors.bio)}
              />
            </Field>

            <Field label="Phone" htmlFor="phone" error={errors.phone} hint="Optional · Stored locally">
              <TextInput
                id="phone"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+880 1XXX-XXXXXX"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                aria-invalid={Boolean(errors.phone)}
              />
            </Field>

            <Field label="Alternate email" htmlFor="alt-email" error={errors.altEmail}>
              <TextInput
                id="alt-email"
                type="email"
                autoComplete="email"
                placeholder="personal@example.com"
                value={altEmail}
                onChange={(event) => setAltEmail(event.target.value)}
                aria-invalid={Boolean(errors.altEmail)}
              />
            </Field>

            <div className="flex items-center gap-2 pt-1">
              <Button type="submit" className="flex-1">
                Save
              </Button>
              <button
                type="button"
                onClick={cancelEditing}
                className="inline-flex h-10 items-center justify-center border border-line bg-surface px-4 type-sm font-medium text-fg r-md transition-ui hover:bg-sunken"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </aside>

      {/* =========================================================
          RIGHT MAIN AREA: REGISTRAR RECORD & PINNED COURSES
         ========================================================= */}
      <main className="flex flex-col gap-8">
        {/* 1. GitHub README-Style Institutional Record Box */}
        <section className="overflow-hidden border border-line bg-surface r-lg">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-sunken px-4 py-3 md:px-6">
            <div className="flex items-center gap-2 type-xs font-medium text-fg">
              <FileText size={14} strokeWidth={1.75} className="text-muted" />
              <span>{profile.studentId}</span>
              <span className="text-faint">/</span>
              <span>ACADEMIC_RECORD.md</span>
            </div>
            <span className="inline-flex items-center gap-1.5 border border-line bg-surface px-2.5 py-0.5 text-[11px] font-medium text-muted r-pill">
              <Lock size={11} strokeWidth={1.75} />
              Registrar Locked
            </span>
          </div>

          <div className="p-5 md:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-4">
              <div>
                <p className="type-label">Institutional Identity</p>
                <h2 className="mt-1 type-xl text-fg">{profile.program}</h2>
              </div>
              <span className="type-xs text-muted">{CURRENT_TERM}</span>
            </div>

            <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 md:grid-cols-3">
              <RecordField label="Department" value={profile.department} />
              <RecordField label="Batch" value={profile.batch} />
              <RecordField label="Semester" value={profile.semesterLabel} />
              <RecordField label="Section" value={profile.section} />
              <RecordField label="Student ID" value={profile.studentId} />
              <RecordField label="University email" value={profile.email} />
            </dl>

            <p className="mt-6 border-t border-line pt-4 type-xs text-faint">
              Identity and enrollment records originate from the university registrar and cannot be modified in this
              demonstration workspace.
            </p>
          </div>
        </section>

        {/* 2. Academic Overview Metrics */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="border border-line bg-surface p-4 r-lg">
            <p className="type-label">Sample CGPA</p>
            <p className="mt-2 type-2xl tabular-nums text-fg">{SAMPLE_CGPA.toFixed(2)}</p>
            <p className="mt-1 type-xs text-muted">Cumulative standing</p>
          </div>
          <div className="border border-line bg-surface p-4 r-lg">
            <p className="type-label">Current Load</p>
            <p className="mt-2 type-2xl tabular-nums text-fg">{termCredits()} Credits</p>
            <p className="mt-1 type-xs text-muted">{profile.semesterLabel}</p>
          </div>
          <div className="border border-line bg-surface p-4 r-lg">
            <p className="type-label">Storage Mode</p>
            <p className="mt-2 inline-flex items-center gap-1.5 type-base font-medium text-fg">
              <Check size={16} className="text-fg" />
              Browser Local
            </p>
            <p className="mt-1.5 type-xs text-muted">Edits stay on this device</p>
          </div>
        </section>

        {/* 3. GitHub "Pinned Repositories"-Style Enrolled Courses Grid */}
        <section>
          <div className="flex items-center justify-between gap-4">
            <h2 className="type-base font-medium text-fg">Enrolled courses</h2>
            <Link
              to="/courses"
              className="type-xs text-muted underline-offset-4 transition-ui hover:text-fg hover:underline"
            >
              View all courses
            </Link>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
            {courses.map((course) => (
              <Link
                key={course.id}
                to="/courses"
                search={{ course: course.id }}
                className="group flex flex-col justify-between border border-line bg-surface p-4 r-md transition-ui hover:border-fg/40"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <BookOpen size={15} strokeWidth={1.75} className="shrink-0 text-muted" />
                      <span className="type-sm font-medium text-fg underline-offset-4 group-hover:underline">
                        {course.title}
                      </span>
                    </div>
                    <span className="shrink-0 border border-line bg-sunken px-2 py-0.5 text-[11px] font-medium text-muted r-pill">
                      {course.code}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 type-xs text-muted">
                  <span className="inline-block size-2.5 bg-fg r-pill" aria-hidden />
                  <span>{course.instructor}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function RecordField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="type-label">{label}</dt>
      <dd className="mt-1 type-sm font-medium text-fg">{value}</dd>
    </div>
  );
}