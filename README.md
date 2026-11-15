# UniConnect — Student Academic Portal

> **Excellence in academic organization.**  
> A centralized student and faculty academic portal designed for **Metropolitan University** to manage semester courses, daily class routines, examination results, departmental notices, and administrative workflows in one unified workspace.

---

## Overview

**UniConnect** streamlines university academic management by bringing essential student services and registrar administration into a clean, responsive, and distraction-free web interface. Students can track their weekly schedules, inspect course syllabi, view GPA/CGPA transcripts, register for campus events, and submit facility or academic inquiries, while administrators can manage institutional records in real time.

---

## Key Features

### Student Portal
- **Home & Academic Summary:** Instant overview of enrolled credits, current CGPA standing, upcoming classes, and active academic reminders.
- **Interactive Weekly Routine (`/routine`):** Day-by-day class schedule featuring theory, lab, and tutorial slots with real-time status indicators (`Scheduled`, `Rescheduled`, `Cancelled`).
- **Course Catalog & Syllabi (`/courses`):** Detailed breakdowns of course outlines, credit hours, assigned instructors, and assessment weight distributions.
- **Academic Results & Transcript (`/results`):** Semester-by-semester GPA progression, cumulative CGPA summary, and full course grade history including retake and supplementary records.
- **Notices & Announcements (`/notices`):** Categorized departmental, examination, and academic notices with unread tracking and instant search.
- **Campus Events (`/events`):** Seminar, workshop, and programming contest listings with one-click event registration.
- **Inquiries & Support (`/complaints`):** Submit and track academic, routine, or campus facility inquiries.
- **Global Quick Search (`/`):** Keyboard-accessible instant search across courses, notices, routines, and portal pages.
- **Adaptive Theme Support:** Seamless Light, Dark, and System theme switching.

### Registrar & Admin Control Center (`/admin`)
- **Centralized Management:** Dedicated administrative dashboard to create, update, and synchronize courses, class routines, student records, examination transcripts, notices, events, and notifications.
- **Inquiry Resolution:** Review and update the status (`Pending`, `In Review`, `Resolved`) of student-submitted inquiries.
- **Real-Time State Sync:** Instant synchronization across student and administrative views via persistent client storage and custom event dispatchers.

---

## Tech Stack

- **Framework & Routing:** React, TypeScript, Vite, TanStack Router
- **State Management:** Zustand (with `localStorage` persistence)
- **UI & Styling:** Tailwind CSS, Radix UI Primitives, Lucide React Icons

---

## Project Structure

```text
uniconnect/
├── public/                 # Static assets (campus photography, icons)
├── src/
│   ├── components/
│   │   ├── admin/          # Registrar & Admin control center modules
│   │   ├── shell/          # AppShell, navigation, search dialog, boot screen
│   │   └── ui/             # Reusable form fields, buttons, and primitives
│   ├── data/               # Academic schemas, course/routine data & persistence helpers
│   ├── lib/                # Zustand store, theme utilities, and formatters
│   ├── pages/              # Landing, Login/Auth, and core portal page views
│   └── routes/             # TanStack Router file-based route definitions
├── index.html
├── package.json
└── tsconfig.json
```

---

## Getting Started

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** or **pnpm**

### Installation & Local Development

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Mubin-0xC7DFC8C3C4/uniconnect.git](https://github.com/Mubin-0xC7DFC8C3C4/uniconnect.git)
   cd uniconnect
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:8080` (or the port displayed in your terminal) in your browser.

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## Portal Access

- **Landing Page:** `/`
- **Student Login / Sign Up:** `/login`
- **Student Workspace:** `/dashboard`
- **Admin Control Center:** `/admin`

---
