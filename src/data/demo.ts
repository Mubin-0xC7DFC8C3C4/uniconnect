export const DEMO_EMAIL = "student@metrouni.edu.bd";
export const DEMO_PASSWORD = "12345678";

export type Course = {
  id: string;
  code: string;
  title: string;
  credits: number;
  instructor: string;
  type: string;
  section: string;
  outline: string[];
  assessment: { label: string; weight: number }[];
};

export const INITIAL_COURSES: Course[] = [
  {
    id: "algo",
    code: "SMP-CS-401",
    title: "Algorithms",
    credits: 3,
    instructor: "L. Chowdhury",
    type: "Theory + lab",
    section: "A",
    outline: [
      "Divide-and-conquer recurrences and master theorem",
      "Graph traversals, shortest path trees, and minimum spanning trees",
      "Greedy choice strategies and dynamic programming formulations",
      "Asymptotic complexity analysis and NP-completeness fundamentals",
    ],
    assessment: [
      { label: "Midterm Examination", weight: 30 },
      { label: "Final Examination", weight: 40 },
      { label: "Laboratory Assignments & Quizzes", weight: 30 },
    ],
  },
  {
    id: "db",
    code: "SMP-CS-415",
    title: "Databases",
    credits: 3,
    instructor: "N. Hasan",
    type: "Theory",
    section: "A",
    outline: [
      "Relational data model, integrity constraints, and primary/foreign keys",
      "SQL query formulation, aggregate functions, and nested subqueries",
      "Schema normalization up to BCNF and functional dependency theory",
      "Transaction management, ACID guarantees, and concurrency control",
    ],
    assessment: [
      { label: "Midterm Examination", weight: 25 },
      { label: "Final Examination", weight: 45 },
      { label: "Practical Projects & Exercises", weight: 30 },
    ],
  },
  {
    id: "net",
    code: "SMP-CS-422",
    title: "Computer Networks",
    credits: 3,
    instructor: "R. Islam",
    type: "Theory",
    section: "A",
    outline: [
      "Layered network architectures: ISO-OSI and TCP/IP protocol stacks",
      "IPv4/IPv6 addressing, CIDR subnetting, and routing protocols",
      "Transport layer reliability: TCP windowing, flow, and congestion control",
      "Application layer protocols: DNS, HTTP/3, TLS, and packet inspection",
    ],
    assessment: [
      { label: "Midterm Examination", weight: 30 },
      { label: "Final Examination", weight: 50 },
      { label: "Quizzes & Presentations", weight: 20 },
    ],
  },
  {
    id: "se",
    code: "SMP-CS-430",
    title: "Software Engineering",
    credits: 3,
    instructor: "M. Akter",
    type: "Theory + tutorial",
    section: "A",
    outline: [
      "Software requirements engineering and user story specification",
      "Agile lifecycle planning, sprint velocity, and continuous integration",
      "Architectural patterns, domain modeling, and design pattern reviews",
      "Automated unit testing, test-driven development, and QA standards",
    ],
    assessment: [
      { label: "Sprint Project Deliverables", weight: 40 },
      { label: "Final Examination", weight: 40 },
      { label: "Peer Code Review & Participation", weight: 20 },
    ],
  },
  {
    id: "write",
    code: "SMP-HUM-210",
    title: "Technical Writing",
    credits: 2,
    instructor: "F. Karim",
    type: "Theory",
    section: "A",
    outline: [
      "Audience awareness, executive summaries, and technical memos",
      "Structure of scientific papers, engineering reports, and proposals",
      "Academic citation ethics, IEEE/ACM formats, and bibliography tools",
      "Technical revision for clarity, brevity, and precision",
    ],
    assessment: [
      { label: "Technical Portfolio", weight: 60 },
      { label: "Final Research Essay", weight: 40 },
    ],
  },
];

export type SessionStatus = "scheduled" | "cancelled" | "rescheduled";

export type ClassSession = {
  id: string;
  day: 0 | 1 | 2 | 3 | 4;
  start: string;
  end: string;
  courseId: string;
  room: string;
  kind: string;
  status?: SessionStatus;
  note?: string;
};

export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"] as const;

export const INITIAL_SESSIONS: ClassSession[] = [
  { id: "sun-algo", day: 0, start: "09:00", end: "10:30", courseId: "algo", room: "S-204", kind: "Theory" },
  { id: "sun-db", day: 0, start: "11:00", end: "12:30", courseId: "db", room: "S-118", kind: "Theory" },
  {
    id: "mon-net",
    day: 1,
    start: "09:00",
    end: "10:30",
    courseId: "net",
    room: "S-310",
    kind: "Theory",
    status: "cancelled",
    note: "Class cancelled for this week. Instructor will coordinate makeup session.",
  },
  { id: "tue-se", day: 2, start: "10:00", end: "11:30", courseId: "se", room: "S-221", kind: "Theory" },
  { id: "tue-write", day: 2, start: "13:00", end: "14:30", courseId: "write", room: "H-104", kind: "Seminar" },
  { id: "wed-algo", day: 3, start: "09:00", end: "11:00", courseId: "algo", room: "Lab 3", kind: "Lab" },
  { id: "wed-db", day: 3, start: "11:30", end: "13:00", courseId: "db", room: "S-118", kind: "Theory" },
  {
    id: "thu-net",
    day: 4,
    start: "09:00",
    end: "10:30",
    courseId: "net",
    room: "S-210",
    kind: "Theory",
    status: "rescheduled",
    note: "Rescheduled session: held on Thursday instead of Monday for this week.",
  },
  { id: "thu-se", day: 4, start: "14:00", end: "15:30", courseId: "se", room: "S-221", kind: "Tutorial" },
];

export type NoticeCategory = "important" | "academic" | "examination" | "departmental" | "event";

export type Notice = {
  id: string;
  category: NoticeCategory;
  title: string;
  date: string;
  body: string;
};

export const NOTICE_CATEGORIES: { id: "all" | NoticeCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "important", label: "Important" },
  { id: "academic", label: "Academic" },
  { id: "examination", label: "Examination" },
  { id: "departmental", label: "Departmental" },
  { id: "event", label: "Events" },
];

export const INITIAL_NOTICES: Notice[] = [
  {
    id: "n1",
    category: "important",
    title: "Academic records and semester enrollment verification",
    date: "2026-11-13",
    body: "UniConnect portal records reflect your currently registered courses, routine slots, and published semester evaluations. For sealed official transcripts or signed certificates, please contact the University Registrar's Office.",
  },
  {
    id: "n2",
    category: "examination",
    title: "Mid-Term Examination Window for Algorithms",
    date: "2026-11-12",
    body: "The mid-term examination for SMP-CS-401 is scheduled for 24 November 2026, 09:00–11:00 in Room S-204. Students are advised to bring their official university ID card.",
  },
  {
    id: "n3",
    category: "academic",
    title: "Course Add and Drop Period Deadline",
    date: "2026-11-10",
    body: "The add/drop registration adjustment period closes on 20 November 2026 at 17:00. Please ensure all section selections and elective choices are finalized before the deadline.",
  },
  {
    id: "n4",
    category: "departmental",
    title: "Software Engineering Project Architecture Proposal",
    date: "2026-11-08",
    body: "The initial project architecture brief for SMP-CS-430 is due on 19 November 2026. Student groups must submit their design briefs through the designated course repository.",
  },
  {
    id: "n5",
    category: "event",
    title: "Research Paper Reading & Critique Seminar",
    date: "2026-11-07",
    body: "The Computing Society will host an academic reading workshop on 18 November in Auditorium Hall A. Pre-registration is open through the Events portal.",
  },
  {
    id: "n6",
    category: "examination",
    title: "Supplementary Examination Schedule Notification",
    date: "2026-11-04",
    body: "Students with pending supplementary evaluations in Probability for Computing can review the tentative schedule. Standard departmental evaluation guidelines apply.",
  },
  {
    id: "n7",
    category: "academic",
    title: "Central Library Extended Hours During Mid-Terms",
    date: "2026-11-02",
    body: "The central library will observe extended operating hours from 08:00 to 22:00 on class days throughout the mid-term assessment window to accommodate student study groups.",
  },
  {
    id: "n8",
    category: "departmental",
    title: "Section Allocation Confirmation for Semester 7",
    date: "2026-10-28",
    body: "Section allocations for the current term have been finalized. Students must attend their designated lecture halls, laboratory groups, and tutorial sittings accordingly.",
  },
];

export type EventCategory = "seminar" | "workshop" | "competition" | "academic";

export type CampusEvent = {
  id: string;
  category: EventCategory;
  title: string;
  date: string;
  start: string;
  end: string;
  venue: string;
  registration: "open" | "closed" | "waitlist";
  host: string;
  summary: string;
};

export const EVENT_CATEGORIES: { id: "all" | EventCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "seminar", label: "Seminars" },
  { id: "workshop", label: "Workshops" },
  { id: "competition", label: "Competitions" },
  { id: "academic", label: "Academic" },
];

export const INITIAL_EVENTS: CampusEvent[] = [
  {
    id: "e1",
    category: "seminar",
    title: "How to Read an Academic Paper",
    date: "2026-11-18",
    start: "15:00",
    end: "16:30",
    venue: "Auditorium Hall A",
    registration: "open",
    host: "University Computing Society",
    summary:
      "A practical seminar on critical reading, extracting methodology, and synthesizing related literature for undergraduate research and senior capstone projects.",
  },
  {
    id: "e2",
    category: "workshop",
    title: "Literature Review & Research Workshop",
    date: "2026-11-22",
    start: "11:00",
    end: "13:00",
    venue: "Humanities Hall H-210",
    registration: "open",
    host: "Academic Writing Resource Center",
    summary:
      "Hands-on workshop covering structured literature search techniques, citation management tools, and drafting comprehensive academic reviews.",
  },
  {
    id: "e3",
    category: "competition",
    title: "Inter-Department Programming Contest",
    date: "2026-12-02",
    start: "16:00",
    end: "19:00",
    venue: "Computer Systems Lab 2",
    registration: "waitlist",
    host: "Competitive Programming Club",
    summary:
      "A five-problem algorithmic problem-solving contest. Open to all engineering cohorts with live scoreboard tracking.",
  },
  {
    id: "e4",
    category: "academic",
    title: "Senior Capstone Project Showcase",
    date: "2026-12-09",
    start: "10:00",
    end: "12:00",
    venue: "Central Campus Atrium",
    registration: "closed",
    host: "Department of Computer Science & Engineering",
    summary:
      "Annual exhibition of final-year undergraduate engineering and software capstone systems evaluated by faculty and visiting industry experts.",
  },
  {
    id: "e5",
    category: "workshop",
    title: "Database Query Optimization Office Hour",
    date: "2026-11-16",
    start: "14:00",
    end: "15:00",
    venue: "Database Lab 1",
    registration: "open",
    host: "Databases Faculty Group",
    summary:
      "Open clinic on relational algebra, index structures, query execution plans, and SQL performance tuning for SMP-CS-415 students.",
  },
];

export type NotificationKind = "academic" | "routine" | "announcements" | "events" | "results";

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  date: string;
  href: string;
};

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "nt1",
    kind: "routine",
    title: "Networks lecture rescheduled to Thursday",
    body: "SMP-CS-422 Computer Networks will meet on Thursday at 09:00 in S-210 instead of Monday.",
    date: "2026-11-13",
    href: "/routine",
  },
  {
    id: "nt2",
    kind: "announcements",
    title: "Algorithms Mid-Term examination date published",
    body: "Review the examination window and room allocation for SMP-CS-401 in the Notices section.",
    date: "2026-11-12",
    href: "/notices",
  },
  {
    id: "nt3",
    kind: "events",
    title: "Research paper reading seminar registration open",
    body: "'How to Read an Academic Paper' is scheduled for 18 November in Auditorium Hall A.",
    date: "2026-11-13",
    href: "/events",
  },
  {
    id: "nt4",
    kind: "results",
    title: "Transcript update: Supplementary sitting pending",
    body: "Probability for Computing grade record is awaiting supplementary sitting confirmation.",
    date: "2026-11-04",
    href: "/results",
  },
  {
    id: "nt5",
    kind: "academic",
    title: "Add/Drop registration deadline approaching",
    body: "Course adjustment period closes on 20 November at 17:00.",
    date: "2026-11-10",
    href: "/academics",
  },
  {
    id: "nt6",
    kind: "routine",
    title: "Algorithms Lab session confirmed",
    body: "Laboratory session will be conducted on Wednesday, 09:00–11:00 in Computer Lab 3.",
    date: "2026-11-09",
    href: "/routine",
  },
  {
    id: "nt7",
    kind: "announcements",
    title: "Software Engineering proposal deadline",
    body: "Coursework checkpoint documentation is due on 19 November.",
    date: "2026-11-08",
    href: "/notices",
  },
];

export const INITIAL_SEMESTER_GPAS = [
  { semester: "1", gpa: 3.18 },
  { semester: "2", gpa: 3.25 },
  { semester: "3", gpa: 3.42 },
  { semester: "4", gpa: 3.55 },
  { semester: "5", gpa: 3.1 },
  { semester: "6", gpa: 3.61 },
];

export const SAMPLE_CGPA = 3.35;

export type TranscriptRow = {
  id: string;
  semester: number;
  code: string;
  title: string;
  credits: number;
  grade: string;
  point: number | null;
  standing: "Published" | "Supplementary" | "Retake required" | "Retake published" | "In progress";
  note?: string;
};

export const INITIAL_TRANSCRIPT: TranscriptRow[] = [
  {
    id: "t1",
    semester: 6,
    code: "SMP-CS-380",
    title: "Operating Systems",
    credits: 3,
    grade: "A-",
    point: 3.5,
    standing: "Published",
  },
  {
    id: "t2",
    semester: 6,
    code: "SMP-CS-370",
    title: "Artificial Intelligence",
    credits: 3,
    grade: "A",
    point: 3.75,
    standing: "Published",
  },
  {
    id: "t3",
    semester: 6,
    code: "SMP-CS-360",
    title: "Computer Architecture",
    credits: 3,
    grade: "B+",
    point: 3.25,
    standing: "Published",
  },
  {
    id: "t4",
    semester: 6,
    code: "SMP-STAT-210",
    title: "Probability for Computing",
    credits: 3,
    grade: "—",
    point: null,
    standing: "Supplementary",
    note: "Supplementary sitting pending evaluation.",
  },
  {
    id: "t5",
    semester: 5,
    code: "SMP-MAT-220",
    title: "Discrete Mathematics",
    credits: 3,
    grade: "F",
    point: 0,
    standing: "Retake required",
    note: "Previous attempt requirement recorded.",
  },
  {
    id: "t6",
    semester: 6,
    code: "SMP-MAT-220",
    title: "Discrete Mathematics",
    credits: 3,
    grade: "B",
    point: 3,
    standing: "Retake published",
    note: "Retake grade successfully recorded.",
  },
  {
    id: "t7",
    semester: 5,
    code: "SMP-CS-340",
    title: "Database Systems I",
    credits: 3,
    grade: "B+",
    point: 3.25,
    standing: "Published",
  },
  {
    id: "t8",
    semester: 4,
    code: "SMP-CS-310",
    title: "Data Structures",
    credits: 3,
    grade: "A",
    point: 3.75,
    standing: "Published",
  },
];

export const GRADE_SCALE = [
  ["A", "3.75"],
  ["A-", "3.50"],
  ["B+", "3.25"],
  ["B", "3.00"],
  ["F", "0.00"],
] as const;

export const reminders = [
  {
    id: "r1",
    title: "Course add/drop deadline",
    detail: "Adjustment window closes 20 November 2026 at 17:00.",
    href: "/notices" as const,
  },
  {
    id: "r2",
    title: "Algorithms coursework milestone",
    detail: "Project proposal due 19 November 2026.",
    href: "/courses" as const,
  },
  {
    id: "r3",
    title: "Supplementary sitting schedule",
    detail: "Review department notice for confirmed examination date.",
    href: "/results" as const,
  },
];

export const places = [
  { name: "Academic Block", detail: "Houses lecture theatres S-100 through S-400 and faculty offices." },
  { name: "Computing Labs", detail: "Specialized labs for algorithms, networks, and databases (Labs 1–3)." },
  { name: "Central Library", detail: "Main library featuring study carrels and reference collections." },
  { name: "Student Affairs Center", detail: "Administrative support, student advisory, and society desks." },
  { name: "Quiet Study Rooms", detail: "Reserved quiet study areas and collaborative workspaces." },
];

export const facilities = [
  { name: "Teaching Laboratories", detail: "Equipped for computer science, software engineering, and hardware coursework." },
  { name: "Campus Cafeteria", detail: "Student dining hall open Monday through Friday." },
  { name: "Medical Center", detail: "Campus first-aid and student health advisory desk." },
  { name: "Student Printing Station", detail: "High-speed document printing and binding services." },
];

export const contacts = [
  { label: "Registrar Office", value: "registrar@metrouni.edu.bd" },
  { label: "Department Office", value: "cse.office@metrouni.edu.bd" },
  { label: "IT Helpdesk", value: "helpdesk@metrouni.edu.bd" },
  { label: "Campus Emergency", value: "+880 1711-999999" },
];

export const departments = [
  { name: "Department of Computer Science & Engineering", note: "Undergraduate and graduate computing programs." },
  { name: "Department of Humanities & Social Sciences", note: "Languages, technical writing, and communication courses." },
  { name: "Office of Student Affairs", note: "Student governance, advisory, and university societies." },
];

export const campusNotes = [
  {
    title: "Campus Guidelines & Access",
    body: "Standard campus building access hours are 07:30 to 21:00 on class days. Please carry your student ID card at all times.",
  },
  {
    title: "Reporting Campus & Facility Inquiries",
    body: "Submit facility inquiries, equipment maintenance requests, or academic notes through the Complaints & Inquiries section.",
  },
];

export type ComplaintCategory =
  | "Academic"
  | "Routine"
  | "Results"
  | "Campus facility"
  | "Technical"
  | "Other";

export const COMPLAINT_CATEGORIES: ComplaintCategory[] = [
  "Academic",
  "Routine",
  "Results",
  "Campus facility",
  "Technical",
  "Other",
];

export type ComplaintStatus = "pending" | "in_review" | "resolved";

export type Complaint = {
  id: string;
  category: ComplaintCategory;
  subject: string;
  description: string;
  createdAt: string;
  status: ComplaintStatus;
  source: "sample" | "you";
};

export const seedComplaints: Complaint[] = [
  {
    id: "sample-1",
    category: "Campus facility",
    subject: "Multimedia projector in Room S-204",
    description:
      "The multimedia projector in lecture hall S-204 experiences intermittent signal loss during morning classes.",
    createdAt: "2026-11-02",
    status: "in_review",
    source: "sample",
  },
  {
    id: "sample-2",
    category: "Academic",
    subject: "Course outline and reference reading list",
    description:
      "Requesting updated digital references and lecture note reading list for the theory section.",
    createdAt: "2026-10-20",
    status: "resolved",
    source: "sample",
  },
];

export type DemoProfile = {
  name: string;
  email: string;
  studentId: string;
  department: string;
  batch: string;
  semesterLabel: string;
  program: string;
  section: string;
  phone: string;
  altEmail: string;
  bio: string;
  photoDataUrl: string | null;
};

export const defaultProfile: DemoProfile = {
  name: "Tahmid Anwar Mubin",
  email: DEMO_EMAIL,
  studentId: "232-115-310",
  department: "Computer Science & Engineering",
  batch: "45",
  semesterLabel: "Semester 7",
  program: "B.Sc. in Computer Science & Engineering",
  section: "A",
  phone: "+880 1712-345678",
  altEmail: "mubin.personal@gmail.com",
  bio: "Undergraduate student majoring in Computer Science & Engineering at Metropolitan University with interests in Machine Learning, Data Science, and full-stack software systems.",
  photoDataUrl: null,
};

export type StudentRecord = DemoProfile & {
  id: string;
  cgpa: number;
  creditsEarned: number;
  status: "active" | "probation" | "graduated" | "leave";
  admissionDate: string;
};

export const INITIAL_STUDENTS: StudentRecord[] = [
  {
    id: "232-115-310",
    name: "Tahmid Anwar Mubin",
    email: DEMO_EMAIL,
    studentId: "232-115-310",
    department: "Computer Science & Engineering",
    batch: "45",
    semesterLabel: "Semester 7",
    program: "B.Sc. in Computer Science & Engineering",
    section: "A",
    phone: "+880 1712-345678",
    altEmail: "mubin.personal@gmail.com",
    bio: "Undergraduate student majoring in Computer Science & Engineering at Metropolitan University with interests in Machine Learning, Data Science, and full-stack software systems.",
    photoDataUrl: null,
    cgpa: 3.35,
    creditsEarned: 106,
    status: "active",
    admissionDate: "2023-05-10",
  },
  {
    id: "232-115-102",
    name: "Nusrat Jahan",
    email: "nusrat.jahan@metrouni.edu.bd",
    studentId: "232-115-102",
    department: "Computer Science & Engineering",
    batch: "45",
    semesterLabel: "Semester 7",
    program: "B.Sc. in Computer Science & Engineering",
    section: "A",
    phone: "+880 1819-234567",
    altEmail: "nusrat.j@gmail.com",
    bio: "Dean's list scholar interested in machine learning and distributed systems.",
    photoDataUrl: null,
    cgpa: 3.82,
    creditsEarned: 106,
    status: "active",
    admissionDate: "2023-05-10",
  },
  {
    id: "232-115-045",
    name: "Farhan Tanvir",
    email: "farhan.tanvir@metrouni.edu.bd",
    studentId: "232-115-045",
    department: "Computer Science & Engineering",
    batch: "45",
    semesterLabel: "Semester 7",
    program: "B.Sc. in Computer Science & Engineering",
    section: "A",
    phone: "+880 1911-987654",
    altEmail: "farhan.t@gmail.com",
    bio: "Web and systems developer actively participating in programming contests.",
    photoDataUrl: null,
    cgpa: 3.45,
    creditsEarned: 106,
    status: "active",
    admissionDate: "2023-05-10",
  },
  {
    id: "231-115-211",
    name: "Sadia Afrin",
    email: "sadia.afrin@metrouni.edu.bd",
    studentId: "231-115-211",
    department: "Computer Science & Engineering",
    batch: "44",
    semesterLabel: "Semester 8",
    program: "B.Sc. in Computer Science & Engineering",
    section: "A",
    phone: "+880 1612-876543",
    altEmail: "sadia.afrin@gmail.com",
    bio: "Senior year student preparing final year capstone project on AI safety.",
    photoDataUrl: null,
    cgpa: 3.91,
    creditsEarned: 132,
    status: "active",
    admissionDate: "2023-01-12",
  },
  {
    id: "241-115-019",
    name: "Tanvir Hasan",
    email: "tanvir.hasan@metrouni.edu.bd",
    studentId: "241-115-019",
    department: "Computer Science & Engineering",
    batch: "46",
    semesterLabel: "Semester 5",
    program: "B.Sc. in Computer Science & Engineering",
    section: "B",
    phone: "+880 1515-432109",
    altEmail: "tanvir.hasan@gmail.com",
    bio: "Undergraduate student passionate about competitive programming.",
    photoDataUrl: null,
    cgpa: 3.15,
    creditsEarned: 74,
    status: "active",
    admissionDate: "2024-01-18",
  },
];

export const CURRENT_TERM = "Spring 2026";
export const CURRENT_SEMESTER = "Semester 7";

// --- LocalStorage Persistence & Live State Synchronization ---

export const ADMIN_STORAGE_KEYS = {
  courses: "uniconnect_admin_courses_v2",
  sessions: "uniconnect_admin_sessions_v2",
  notices: "uniconnect_admin_notices_v2",
  events: "uniconnect_admin_events_v2",
  transcript: "uniconnect_admin_transcript_v2",
  notifications: "uniconnect_admin_notifications_v2",
  students: "uniconnect_admin_students_v2",
  semesterGpas: "uniconnect_admin_semester_gpas_v2",
} as const;

function loadStoredArray<T>(key: string, initial: T[]): T[] {
  if (typeof window === "undefined") return [...initial];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [...initial];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return [...initial];
  } catch {
    return [...initial];
  }
}

export const courses: Course[] = loadStoredArray(ADMIN_STORAGE_KEYS.courses, INITIAL_COURSES);
export const sessions: ClassSession[] = loadStoredArray(ADMIN_STORAGE_KEYS.sessions, INITIAL_SESSIONS);
export const notices: Notice[] = loadStoredArray(ADMIN_STORAGE_KEYS.notices, INITIAL_NOTICES);
export const events: CampusEvent[] = loadStoredArray(ADMIN_STORAGE_KEYS.events, INITIAL_EVENTS);
export const notifications: AppNotification[] = loadStoredArray(ADMIN_STORAGE_KEYS.notifications, INITIAL_NOTIFICATIONS);
export const transcript: TranscriptRow[] = loadStoredArray(ADMIN_STORAGE_KEYS.transcript, INITIAL_TRANSCRIPT);
export const semesterGpas: { semester: string; gpa: number }[] = loadStoredArray(ADMIN_STORAGE_KEYS.semesterGpas, INITIAL_SEMESTER_GPAS);
export const students: StudentRecord[] = loadStoredArray(ADMIN_STORAGE_KEYS.students, INITIAL_STUDENTS);

export const courseById: Record<string, Course> = new Proxy({} as Record<string, Course>, {
  get(target, prop: string) {
    return courses.find((course) => course.id === prop);
  },
  has(target, prop: string) {
    return courses.some((course) => course.id === prop);
  },
  ownKeys() {
    return courses.map((course) => course.id);
  },
  getOwnPropertyDescriptor(target, prop) {
    const found = courses.find((course) => course.id === prop);
    return found ? { configurable: true, enumerable: true, value: found } : undefined;
  },
});

export function termCredits() {
  return courses.reduce((sum, course) => sum + course.credits, 0);
}

// Live synchronizers
export function saveCourses(updated: Course[]) {
  courses.splice(0, courses.length, ...updated);
  if (typeof window !== "undefined") {
    localStorage.setItem(ADMIN_STORAGE_KEYS.courses, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("uniconnect:data-changed", { detail: { entity: "courses" } }));
  }
}

export function saveSessions(updated: ClassSession[]) {
  sessions.splice(0, sessions.length, ...updated);
  if (typeof window !== "undefined") {
    localStorage.setItem(ADMIN_STORAGE_KEYS.sessions, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("uniconnect:data-changed", { detail: { entity: "sessions" } }));
  }
}

export function saveNotices(updated: Notice[]) {
  notices.splice(0, notices.length, ...updated);
  if (typeof window !== "undefined") {
    localStorage.setItem(ADMIN_STORAGE_KEYS.notices, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("uniconnect:data-changed", { detail: { entity: "notices" } }));
  }
}

export function saveEvents(updated: CampusEvent[]) {
  events.splice(0, events.length, ...updated);
  if (typeof window !== "undefined") {
    localStorage.setItem(ADMIN_STORAGE_KEYS.events, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("uniconnect:data-changed", { detail: { entity: "events" } }));
  }
}

export function saveTranscript(updated: TranscriptRow[]) {
  transcript.splice(0, transcript.length, ...updated);
  if (typeof window !== "undefined") {
    localStorage.setItem(ADMIN_STORAGE_KEYS.transcript, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("uniconnect:data-changed", { detail: { entity: "transcript" } }));
  }
}

export function saveNotifications(updated: AppNotification[]) {
  notifications.splice(0, notifications.length, ...updated);
  if (typeof window !== "undefined") {
    localStorage.setItem(ADMIN_STORAGE_KEYS.notifications, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("uniconnect:data-changed", { detail: { entity: "notifications" } }));
  }
}

export function saveStudents(updated: StudentRecord[]) {
  students.splice(0, students.length, ...updated);
  if (typeof window !== "undefined") {
    localStorage.setItem(ADMIN_STORAGE_KEYS.students, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("uniconnect:data-changed", { detail: { entity: "students" } }));
  }
}

export function saveSemesterGpas(updated: { semester: string; gpa: number }[]) {
  semesterGpas.splice(0, semesterGpas.length, ...updated);
  if (typeof window !== "undefined") {
    localStorage.setItem(ADMIN_STORAGE_KEYS.semesterGpas, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("uniconnect:data-changed", { detail: { entity: "semesterGpas" } }));
  }
}

export function resetAdminDataToDefaults() {
  saveCourses(INITIAL_COURSES);
  saveSessions(INITIAL_SESSIONS);
  saveNotices(INITIAL_NOTICES);
  saveEvents(INITIAL_EVENTS);
  saveTranscript(INITIAL_TRANSCRIPT);
  saveNotifications(INITIAL_NOTIFICATIONS);
  saveStudents(INITIAL_STUDENTS);
  saveSemesterGpas(INITIAL_SEMESTER_GPAS);
  if (typeof window !== "undefined") {
    Object.values(ADMIN_STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    window.dispatchEvent(new CustomEvent("uniconnect:data-changed", { detail: { entity: "all" } }));
  }
}