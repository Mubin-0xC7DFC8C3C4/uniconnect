import assert from "node:assert/strict";
import { test } from "node:test";
import {
  courses,
  courseById,
  sessions,
  notices,
  events,
  transcript,
  students,
  termCredits,
  saveCourses,
  saveSessions,
  saveNotices,
  saveEvents,
  saveTranscript,
  saveStudents,
  resetAdminDataToDefaults,
  INITIAL_COURSES,
  INITIAL_SESSIONS,
  INITIAL_NOTICES,
  INITIAL_EVENTS,
  INITIAL_TRANSCRIPT,
  INITIAL_STUDENTS,
} from "../src/data/demo.ts";

test("Admin Control Center - Courses CRUD and Proxy Synchronization", () => {
  const initialCount = courses.length;
  const initialCredits = termCredits();

  // 1. Create Course
  const testCourse = {
    id: "test-cloud-arch",
    code: "SMP-CS-499",
    title: "Cloud Native Architecture",
    credits: 4,
    instructor: "Dr. K. Alam",
    type: "Theory + lab",
    section: "A",
    outline: ["Containers", "Kubernetes", "Serverless orchestration"],
    assessment: [
      { label: "Midterm", weight: 30 },
      { label: "Project", weight: 40 },
      { label: "Quizzes", weight: 30 },
    ],
  };

  saveCourses([testCourse, ...courses]);
  assert.equal(courses.length, initialCount + 1, "Course count increased by 1");
  assert.equal(termCredits(), initialCredits + 4, "termCredits() immediately includes new course credits");

  // Verify courseById Proxy resolution
  const resolved = courseById["test-cloud-arch"];
  assert.ok(resolved, "courseById Proxy must resolve new course by ID");
  assert.equal(resolved?.code, "SMP-CS-499");
  assert.equal(resolved?.title, "Cloud Native Architecture");

  // 2. Update Course
  const updatedCourse = {
    ...testCourse,
    title: "Advanced Cloud Native Architecture",
    credits: 3,
  };
  saveCourses(courses.map((c) => (c.id === testCourse.id ? updatedCourse : c)));
  assert.equal(courseById["test-cloud-arch"]?.title, "Advanced Cloud Native Architecture");
  assert.equal(termCredits(), initialCredits + 3);

  // 3. Delete Course
  saveCourses(courses.filter((c) => c.id !== testCourse.id));
  assert.equal(courses.length, initialCount);
  assert.equal(courseById["test-cloud-arch"], undefined, "Deleted course must not be in courseById");
  assert.equal(termCredits(), initialCredits);
});

test("Admin Control Center - Notices CRUD Operations", () => {
  const initialCount = notices.length;

  const newNotice = {
    id: "test-notice-1",
    category: "important",
    title: "Campus Closure for National Holiday",
    date: "2026-11-20",
    body: "The campus will remain closed on 20 November 2026 for institutional observance.",
  };

  // Create
  saveNotices([newNotice, ...notices]);
  assert.equal(notices.length, initialCount + 1);
  assert.equal(notices[0].id, "test-notice-1");

  // Update
  const updatedNotice = {
    ...newNotice,
    title: "Campus Closure Update - Extended Holiday",
  };
  saveNotices(notices.map((n) => (n.id === newNotice.id ? updatedNotice : n)));
  assert.equal(notices.find((n) => n.id === "test-notice-1")?.title, "Campus Closure Update - Extended Holiday");

  // Delete
  saveNotices(notices.filter((n) => n.id !== "test-notice-1"));
  assert.equal(notices.length, initialCount);
});

test("Admin Control Center - Students Roster and Directory", () => {
  const initialCount = students.length;

  const newStudent = {
    id: "DEMO-2025-0001",
    studentId: "DEMO-2025-0001",
    name: "Ayesha Siddiqua",
    email: "ayesha.s@metrouni.edu.bd",
    department: "Software Engineering",
    batch: "2025 cohort",
    semesterLabel: "Semester 1",
    program: "Undergraduate sample program",
    section: "A",
    phone: "+880 1711-000000",
    altEmail: "ayesha@gmail.com",
    bio: "Freshman enthusiast in web development.",
    photoDataUrl: null,
    cgpa: 3.9,
    creditsEarned: 18,
    status: "active",
    admissionDate: "2025-01-10",
  };

  // Add student
  saveStudents([newStudent, ...students]);
  assert.equal(students.length, initialCount + 1);

  // Edit student
  const updatedStudent = { ...newStudent, cgpa: 3.95 };
  saveStudents(students.map((s) => (s.id === newStudent.id ? updatedStudent : s)));
  assert.equal(students.find((s) => s.id === "DEMO-2025-0001")?.cgpa, 3.95);

  // Delete student
  saveStudents(students.filter((s) => s.id !== "DEMO-2025-0001"));
  assert.equal(students.length, initialCount);
});

test("Admin Control Center - Class Routines & Timetable Scheduling", () => {
  const initialCount = sessions.length;

  const newSession = {
    id: "test-sun-cloud",
    day: 0,
    start: "14:00",
    end: "15:30",
    courseId: "algo",
    room: "Lab 5",
    kind: "Lab",
    status: "scheduled",
  };

  // Create
  saveSessions([...sessions, newSession]);
  assert.equal(sessions.length, initialCount + 1);

  // Mark Cancelled
  saveSessions(
    sessions.map((s) =>
      s.id === "test-sun-cloud" ? { ...s, status: "cancelled", note: "Cancelled for lab maintenance" } : s,
    ),
  );
  assert.equal(sessions.find((s) => s.id === "test-sun-cloud")?.status, "cancelled");

  // Delete
  saveSessions(sessions.filter((s) => s.id !== "test-sun-cloud"));
  assert.equal(sessions.length, initialCount);
});

test("Admin Control Center - Results & Transcript Grade Records", () => {
  const initialCount = transcript.length;

  const newGrade = {
    id: "test-t-cloud",
    semester: 7,
    code: "SMP-CS-490",
    title: "Cloud Computing",
    credits: 3,
    grade: "A",
    point: 3.75,
    standing: "Published",
  };

  // Create
  saveTranscript([newGrade, ...transcript]);
  assert.equal(transcript.length, initialCount + 1);

  // Update standing to supplementary
  saveTranscript(
    transcript.map((t) =>
      t.id === "test-t-cloud" ? { ...t, grade: "—", point: null, standing: "Supplementary" } : t,
    ),
  );
  assert.equal(transcript.find((t) => t.id === "test-t-cloud")?.standing, "Supplementary");

  // Delete
  saveTranscript(transcript.filter((t) => t.id !== "test-t-cloud"));
  assert.equal(transcript.length, initialCount);
});

test("Admin Control Center - Campus Events Management", () => {
  const initialCount = events.length;

  const newEvent = {
    id: "test-hackathon",
    category: "competition",
    title: "Inter-University Hackathon 2026",
    date: "2026-12-15",
    start: "09:00",
    end: "21:00",
    venue: "Main Campus Auditorium",
    registration: "open",
    host: "Computing Club",
    summary: "Annual 12-hour programming marathon.",
  };

  // Create
  saveEvents([...events, newEvent]);
  assert.equal(events.length, initialCount + 1);

  // Toggle registration to waitlist
  saveEvents(events.map((e) => (e.id === "test-hackathon" ? { ...e, registration: "waitlist" } : e)));
  assert.equal(events.find((e) => e.id === "test-hackathon")?.registration, "waitlist");

  // Delete
  saveEvents(events.filter((e) => e.id !== "test-hackathon"));
  assert.equal(events.length, initialCount);
});

test("Admin Control Center - Factory Reset Restores All Initial Seeds", () => {
  // Mutate multiple collections
  saveCourses([]);
  saveNotices([]);
  saveStudents([]);
  assert.equal(courses.length, 0);
  assert.equal(notices.length, 0);

  // Execute Factory Reset
  resetAdminDataToDefaults();

  assert.equal(courses.length, INITIAL_COURSES.length);
  assert.equal(sessions.length, INITIAL_SESSIONS.length);
  assert.equal(notices.length, INITIAL_NOTICES.length);
  assert.equal(events.length, INITIAL_EVENTS.length);
  assert.equal(transcript.length, INITIAL_TRANSCRIPT.length);
  assert.equal(students.length, INITIAL_STUDENTS.length);
});
