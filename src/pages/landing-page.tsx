import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Menu,
  Moon,
  Phone,
  Sun,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { courses } from "@/data/demo";
import { useAppStore } from "@/lib/store";
import { resolvedTheme, type ThemeChoice } from "@/lib/theme";

interface ShowcaseCourse {
  id: string;
  code: string;
  title: string;
  department: string;
  term: string;
  instructor: string;
}

interface InstructorItem {
  id: string;
  name: string;
  designation: string;
  department: string;
  coursesTaught: string;
  bio: string;
}

const EXTRA_SHOWCASE_COURSES: ShowcaseCourse[] = [
  {
    id: "sc-ai",
    code: "CSE 421",
    title: "Artificial Intelligence & Intelligent Agents",
    department: "Computer Science & Engineering",
    term: "Autumn / Spring",
    instructor: "Dr. Mahmudul Karim",
  },
  {
    id: "sc-se",
    code: "CSE 418",
    title: "Software Engineering & Design Patterns",
    department: "Computer Science & Engineering",
    term: "Autumn / Spring",
    instructor: "Farhana Rahman",
  },
  {
    id: "sc-web",
    code: "CSE 323",
    title: "Full-Stack Web Engineering",
    department: "Software Systems",
    term: "Summer / Autumn",
    instructor: "Tanvir Ahmed",
  },
  {
    id: "sc-toc",
    code: "CSE 405",
    title: "Theory of Computation & Automata",
    department: "Theoretical Computing",
    term: "Winter / Spring",
    instructor: "Prof. Shafiqul Islam",
  },
  {
    id: "sc-db",
    code: "CSE 311",
    title: "Database Management & Distributed Storage",
    department: "Data Engineering",
    term: "Summer / Fall",
    instructor: "Nusrat Jahan",
  },
];

const INSTRUCTORS: InstructorItem[] = [
  {
    id: "ins-1",
    name: "Dr. Mahmudul Karim",
    designation: "Associate Professor · Artificial Intelligence",
    department: "Department of Computer Science & Engineering",
    coursesTaught: "CSE 421 Artificial Intelligence, Machine Learning Sessional",
    bio: "Focuses on probabilistic graphical models, graph-based anomaly detection, and applied machine learning systems for undergraduate research groups.",
  },
  {
    id: "ins-2",
    name: "Farhana Rahman",
    designation: "Assistant Professor · Software Architecture",
    department: "Department of Computer Science & Engineering",
    coursesTaught: "CSE 418 Software Engineering & Design Pattern Lab",
    bio: "Guides student engineering teams in clean object-oriented architecture, maintainable system design, and iterative software delivery.",
  },
  {
    id: "ins-3",
    name: "Prof. Shafiqul Islam",
    designation: "Professor · Theoretical Computer Science",
    department: "Department of Computer Science & Engineering",
    coursesTaught: "CSE 405 Theory of Computation, Compiler Design",
    bio: "Teaches formal languages, finite automata, and algorithmic complexity with an emphasis on rigorous mathematical reasoning.",
  },
  {
    id: "ins-4",
    name: "Tanvir Ahmed",
    designation: "Lecturer · Web & Cloud Systems",
    department: "Department of Computer Science & Engineering",
    coursesTaught: "CSE 323 Web Programming, Modern Frontend Systems",
    bio: "Mentors full-stack student projects covering TypeScript interfaces, relational database schema design, and API engineering.",
  },
];

function GmailIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
      <rect x="2" y="4" width="20" height="16" rx="3" />
      <path d="M2 7l10 7 10-7" />
    </svg>
  );
}

function WhatsAppIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
    </svg>
  );
}

function useResolvedTheme(theme: ThemeChoice) {
  const [value, setValue] = useState<"light" | "dark">("light");
  useEffect(() => {
    const read = () => setValue(resolvedTheme(theme));
    read();
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", read);
    return () => media.removeEventListener("change", read);
  }, [theme]);
  return value;
}

export function LandingPage() {
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  const resolved = useResolvedTheme(theme);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedInstructorId, setExpandedInstructorId] = useState<string | null>(INSTRUCTORS[0].id);
  const courseScrollerRef = useRef<HTMLDivElement | null>(null);

  const showcaseCourses: ShowcaseCourse[] = [
    ...courses.map((c) => ({
      id: c.id,
      code: c.code,
      title: c.title,
      department: "Core Academic Curriculum",
      term: "Current Term",
      instructor: c.instructor,
    })),
    ...EXTRA_SHOWCASE_COURSES,
  ];

  function scrollToSection(sectionId: string) {
    setMobileMenuOpen(false);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function scrollCourses(direction: "left" | "right") {
    const node = courseScrollerRef.current;
    if (!node) return;
    const distance = direction === "left" ? -340 : 340;
    node.scrollBy({ left: distance, behavior: "smooth" });
  }

  return (
    <div className="min-h-dvh bg-bg text-fg">
      {/* =========================================================
          1. HERO + TRANSPARENT TOP NAVBAR
         ========================================================= */}
      <div className="relative overflow-hidden border-b border-line">
        {/* University Campus Background Image */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-14 bottom-0 z-0">
          <img
            src="/university-bg.jpg"
            alt=""
            className="h-full w-full object-cover object-top opacity-90 dark:opacity-65"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent" />
        </div>

        <header className="relative z-20 border-b border-line/60 bg-bg/45 backdrop-blur-md">
          <div className="container-app flex items-center justify-between gap-4 px-4 py-3.5 md:px-8">
            <Link to="/" className="flex items-center gap-3">
              <span className="inline-flex size-9 items-center justify-center border border-line bg-surface/85 font-semibold tracking-tight text-fg r-sm">
                U
              </span>
              <span className="type-sm font-medium text-fg">UniConnect</span>
            </Link>

            <nav aria-label="Landing Navigation" className="hidden items-center gap-6 md:flex">
              <button
                type="button"
                onClick={() => scrollToSection("about")}
                className="type-sm text-muted transition-ui hover:text-fg"
              >
                About Us
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("courses")}
                className="type-sm text-muted transition-ui hover:text-fg"
              >
                Course
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("instructors")}
                className="type-sm text-muted transition-ui hover:text-fg"
              >
                Instructor
              </button>

              <div className="h-4 w-px bg-line" aria-hidden />

              <button
                type="button"
                onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}
                className="inline-flex size-9 items-center justify-center r-md text-muted hover:bg-sunken/80 hover:text-fg"
                aria-label={resolved === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              >
                {resolved === "dark" ? <Sun size={17} strokeWidth={1.75} /> : <Moon size={17} strokeWidth={1.75} />}
              </button>

              <Link
                to="/login"
                className="inline-flex h-10 items-center justify-center border border-line bg-surface/85 px-4 type-sm font-medium text-fg r-md transition-ui hover:bg-sunken"
              >
                Log in
              </Link>
              <Link
                to="/login"
                className="inline-flex h-10 items-center justify-center bg-fg px-4 type-sm font-medium text-bg r-md transition-ui hover:opacity-90"
              >
                Sign up
              </Link>
            </nav>

            <div className="flex items-center gap-2 md:hidden">
              <button
                type="button"
                onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}
                className="inline-flex size-10 items-center justify-center r-md hover:bg-sunken/80"
                aria-label="Toggle theme"
              >
                {resolved === "dark" ? <Sun size={18} strokeWidth={1.75} /> : <Moon size={18} strokeWidth={1.75} />}
              </button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen((v) => !v)}
                className="inline-flex size-10 items-center justify-center r-md hover:bg-sunken/80"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>

          {mobileMenuOpen ? (
            <div className="border-t border-line bg-surface px-4 py-4 md:hidden">
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => scrollToSection("about")}
                  className="py-1.5 text-left type-sm text-fg"
                >
                  About Us
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection("courses")}
                  className="py-1.5 text-left type-sm text-fg"
                >
                  Course
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection("instructors")}
                  className="py-1.5 text-left type-sm text-fg"
                >
                  Instructor
                </button>
                <div className="mt-2 flex gap-2 border-t border-line pt-3">
                  <Link
                    to="/login"
                    className="inline-flex h-10 flex-1 items-center justify-center border border-line bg-surface px-4 type-sm font-medium text-fg r-md"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex h-10 flex-1 items-center justify-center bg-fg px-4 type-sm font-medium text-bg r-md"
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            </div>
          ) : null}
        </header>

        <section className="relative z-10 container-app flex min-h-[32rem] flex-col justify-center px-4 py-14 md:px-8 md:py-20">
          <div className="max-w-2xl py-6">
            <h1 className="type-4xl font-semibold tracking-tight text-fg">
              Excellence in academic organization.
            </h1>
            <p className="measure mt-5 type-base text-muted">
              Manage your semester courses, daily class schedules, faculty advisories, and academic
              transcripts seamlessly from anywhere.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/login"
                className="inline-flex h-11 items-center justify-center bg-fg px-6 type-sm font-medium text-bg r-md transition-ui hover:opacity-90"
              >
                Log in
              </Link>
              <Link
                to="/login"
                className="inline-flex h-11 items-center justify-center border border-line bg-surface/85 px-6 type-sm font-medium text-fg backdrop-blur-sm r-md transition-ui hover:bg-sunken"
              >
                Sign up
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* =========================================================
          2. ABOUT US SECTION ("UniConnect at a glance")
         ========================================================= */}
      <section id="about" className="scroll-mt-20 border-b border-line bg-bg py-16 md:py-24">
        <div className="container-app px-4 md:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="type-label">About Us</p>
            <h2 className="mt-2 type-2xl text-fg">UniConnect at a glance</h2>
            <p className="mt-3 type-base text-muted">
              Built as a focused academic hub connecting students, faculty instructors, and departmental schedules in
              one structured environment.
            </p>
          </div>

          <div className="mt-12 grid items-center gap-10 md:grid-cols-2">
            <div className="border border-line bg-sunken p-8 r-lg">
              <div className="flex items-center gap-3 text-fg">
                <GraduationCap size={26} strokeWidth={1.75} />
                <span className="type-label text-muted">Academic Workspace</span>
              </div>
              <h3 className="mt-4 type-xl text-fg">Structured learning for every semester</h3>
              <p className="mt-3 type-sm text-muted">
                From daily class routines and sessional labs to faculty announcements and exam calendars, UniConnect
                keeps essential university workflows clear and distraction-free.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-line pt-6">
                <div className="border border-line bg-surface p-3.5 r-md">
                  <BookOpen size={18} className="text-fg" />
                  <p className="mt-2 type-sm font-medium text-fg">Course Catalog</p>
                  <p className="mt-0.5 type-xs text-muted">Credit &amp; syllabus tracking</p>
                </div>
                <div className="border border-line bg-surface p-3.5 r-md">
                  <Users size={18} className="text-fg" />
                  <p className="mt-2 type-sm font-medium text-fg">Faculty Mentorship</p>
                  <p className="mt-0.5 type-xs text-muted">Direct instructor updates</p>
                </div>
              </div>
            </div>

            <dl className="divide-y divide-line border-y border-line">
              <div className="py-5">
                <dt className="type-2xl tabular-nums text-fg">2019</dt>
                <dd className="mt-1 type-sm text-muted">The year the academic framework was established</dd>
              </div>
              <div className="py-5">
                <dt className="type-2xl tabular-nums text-fg">4,500+</dt>
                <dd className="mt-1 type-sm text-muted">Students enrolled across undergraduate &amp; graduate cohorts</dd>
              </div>
              <div className="py-5">
                <dt className="type-2xl tabular-nums text-fg">50+</dt>
                <dd className="mt-1 type-sm text-muted">Core theory and laboratory courses offered each term</dd>
              </div>
              <div className="py-5">
                <dt className="type-2xl tabular-nums text-fg">12k+</dt>
                <dd className="mt-1 type-sm text-muted">Graduates and alumni connected worldwide</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* =========================================================
          3. COURSES SECTION
         ========================================================= */}
      <section id="courses" className="scroll-mt-20 border-b border-line bg-surface py-16 md:py-24">
        <div className="container-app px-4 md:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="type-label">Curriculum</p>
              <h2 className="mt-1 type-2xl text-fg">Courses</h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollCourses("left")}
                className="inline-flex size-10 items-center justify-center border border-line bg-bg text-fg r-md transition-ui hover:bg-sunken"
                aria-label="Scroll courses left"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => scrollCourses("right")}
                className="inline-flex size-10 items-center justify-center border border-line bg-bg text-fg r-md transition-ui hover:bg-sunken"
                aria-label="Scroll courses right"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div
            ref={courseScrollerRef}
            className="mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {showcaseCourses.map((course) => (
              <article
                key={course.id}
                className="flex w-72 shrink-0 snap-start flex-col justify-between border border-line bg-bg p-5 r-lg transition-ui hover:border-fg/40"
              >
                <div>
                  <div className="flex h-36 flex-col justify-between border border-line bg-sunken p-4 r-md">
                    <span className="w-fit border border-line bg-surface px-2.5 py-1 type-xs font-medium text-fg r-sm">
                      {course.code}
                    </span>
                    <p className="type-xs text-muted">{course.term}</p>
                  </div>

                  <h3 className="mt-4 type-base font-medium text-fg">{course.title}</h3>
                  <p className="mt-1.5 type-xs text-muted">{course.department}</p>
                </div>

                <div className="mt-5 border-t border-line pt-3">
                  <p className="type-xs text-faint">Instructor</p>
                  <p className="mt-0.5 type-sm text-fg">{course.instructor}</p>
                </div>
              </article>
            ))}

            <Link
              to="/login"
              className="group flex w-64 shrink-0 snap-start flex-col items-center justify-center border border-dashed border-line bg-sunken/70 p-6 text-center r-lg transition-ui hover:border-fg hover:bg-sunken"
            >
              <span className="inline-flex size-12 items-center justify-center border border-line bg-surface text-fg r-pill transition-ui group-hover:translate-x-1">
                <ArrowRight size={20} strokeWidth={1.75} />
              </span>
              <span className="mt-4 type-base font-medium text-fg">Show All Courses</span>
              <span className="mt-1 type-xs text-muted">Sign in to view full catalog</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          4. INSTRUCTOR SPOTLIGHT SECTION
         ========================================================= */}
      <section
        id="instructors"
        className="scroll-mt-20 border-b border-line bg-[#14140F] py-16 text-[#F5F4F0] md:py-24"
      >
        <div className="container-app px-4 md:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="type-label text-[#A9A69C]">Faculty Directory</p>
            <h2 className="mt-2 type-2xl text-[#F5F4F0]">Instructor spotlight</h2>
            <p className="mt-3 type-base text-[#A9A69C]">
              We enable students to unlock their academic potential with structured courses and dedicated faculty
              instructors.
            </p>
          </div>

          <div className="mx-auto mt-10 flex max-w-3xl flex-col gap-3">
            {INSTRUCTORS.map((person) => {
              const isOpen = expandedInstructorId === person.id;
              const personInitials = person.name
                .split(" ")
                .filter((part) => !part.endsWith("."))
                .slice(0, 2)
                .map((p) => p[0])
                .join("");

              return (
                <div key={person.id} className="overflow-hidden border border-line bg-surface text-fg r-md">
                  <button
                    type="button"
                    onClick={() => setExpandedInstructorId(isOpen ? null : person.id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-ui hover:bg-sunken/60"
                  >
                    <div className="flex items-center gap-4">
                      <span className="inline-flex size-11 shrink-0 items-center justify-center border border-line bg-sunken type-sm font-medium text-fg r-md">
                        {personInitials}
                      </span>
                      <div>
                        <p className="type-base font-medium text-fg">{person.name}</p>
                        <p className="type-xs text-muted">{person.designation}</p>
                      </div>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isOpen ? (
                    <div className="border-t border-line bg-bg px-5 py-4">
                      <p className="type-sm text-muted">{person.bio}</p>
                      <p className="mt-3 type-xs text-faint">
                        <strong className="font-medium text-fg">Courses:</strong> {person.coursesTaught}
                      </p>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="mt-12 flex justify-center">
            <Link
              to="/login"
              className="group inline-flex h-11 items-center gap-2 border border-white/20 bg-white/10 px-6 type-sm font-medium text-[#F5F4F0] r-pill transition-ui hover:bg-[#F5F4F0] hover:text-[#14140F]"
            >
              <span>Show all instructors</span>
              <ArrowUpRight
                size={16}
                strokeWidth={1.75}
                className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          5. FOOTER
         ========================================================= */}
      <footer className="border-t border-white/10 bg-[#14140F] py-14 text-[#A9A69C] md:py-16">
        <div className="container-app flex flex-col justify-between gap-8 px-4 sm:flex-row sm:items-center md:px-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex size-7 items-center justify-center border border-white/15 bg-white/10 type-xs font-semibold text-[#F5F4F0] r-sm">
                U
              </span>
              <span className="type-sm font-medium text-[#F5F4F0]">UniConnect</span>
            </div>
            <p className="type-xs text-[#A9A69C]">
              © 2026 UniConnect · Metropolitan University Student Academic Portal.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <button
              type="button"
              onClick={() => scrollToSection("about")}
              className="type-sm font-medium text-[#F5F4F0] transition-ui hover:text-[#A9A69C]"
            >
              About Us
            </button>

            <div className="h-4 w-px bg-white/15" aria-hidden />

            <div className="flex items-center gap-2.5" aria-label="Contact options">
              <a
                href="mailto:support@uniconnect.edu"
                aria-label="Email via Gmail"
                title="Gmail: support@uniconnect.edu"
                className="inline-flex size-10 items-center justify-center border border-white/15 bg-white/10 text-[#F5F4F0] r-pill transition-ui hover:bg-[#F5F4F0] hover:text-[#14140F]"
              >
                <GmailIcon className="size-4" />
              </a>

              <a
                href="tel:+8801700000000"
                aria-label="Call support"
                title="Call: +880 1700-000000"
                className="inline-flex size-10 items-center justify-center border border-white/15 bg-white/10 text-[#F5F4F0] r-pill transition-ui hover:bg-[#F5F4F0] hover:text-[#14140F]"
              >
                <Phone size={16} strokeWidth={1.75} />
              </a>

              <a
                href="https://wa.me/8801700000000"
                target="_blank"
                rel="noreferrer"
                aria-label="Contact on WhatsApp"
                title="WhatsApp"
                className="inline-flex size-10 items-center justify-center border border-white/15 bg-white/10 text-[#F5F4F0] r-pill transition-ui hover:bg-[#F5F4F0] hover:text-[#14140F]"
              >
                <WhatsAppIcon className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}