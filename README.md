# UniConnect
> University Management & Student Service Web Portal


## 🛠️ Technology Stack
* **Frontend:** React (Vite) + Tailwind CSS
* **Backend:** Node.js + Express.js
* **Database:** MySQL
* **Authentication:** JSON Web Token (JWT), Bcrypt, OTP verification

---

## ✨ Phase 1 Features (Completed - ~20%)
* **Two-Stage Sign-Up Flow:**
  * Rule-based verification for Students and Faculty against official admission records.
  * Mandatory ID card photo upload (JPG/PNG, max 2MB) with image signature validation.
  * Emailed verification code (OTP) confirmation step.
* **Authentication & Security:**
  * Secure login with JSON Web Tokens (JWT) and role-based access control.
  * Brute-force protection: 15-minute account lockout after 5 consecutive failed login attempts.
  * Forgot password flow with single-use OTP recovery.
* **Role-Based Dashboards:**
  * **Student Dashboard:** View personal academic profile, department, batch, and section details.
  * **Faculty Dashboard:** View academic rank, department, and teaching profile.
  * **Super Admin Dashboard:** Full control over verified admission records and system audit logs.
* **Theme Support:** 
  * Built-in Light and Dark theme toggle using Tailwind CSS.

---

## 📂 Project Structure
```text
uniconnect/
├── client/                 # React (Vite) frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components (AuthCard, Alert, DashboardLayout, etc.)
│   │   ├── context/        # Auth & Theme context providers
│   │   ├── hooks/          # Custom hooks (useAcademicLists, etc.)
│   │   └── pages/          # Page views (Landing, Login, Signup, Dashboards)
│   └── vite.config.js      # Vite configuration with API proxy
│
└── server/                 # Node.js & Express backend application
    ├── sql/                # Database schema and seed files
    ├── src/
    │   ├── config/         # Database connection pool setup
    │   ├── middleware/     # Auth, error handling, and upload middlewares
    │   ├── routes/         # API routes (Auth, Admin, Meta, Profile)
    │   └── utils/          # Helpers (Validators, OTP generators, Mailer, Audit logger)
    └── package.json
```

---

## 🚀 How to Run Locally

### Prerequisites
* Node.js (v18+ recommended)
* MySQL Server running locally

### 1. Database Setup
Open your MySQL client (Workbench or CLI) and run the schema and seed scripts:
```sql
SOURCE server/sql/schema.sql;
SOURCE server/sql/seed.sql;
```

### 2. Backend Server Setup
Navigate to the server directory, configure environment variables, install dependencies, and start the development server:
```bash
cd server
cp .env.example .env   # Open .env and fill in your MySQL credentials & JWT secret
npm install
npm run create-admin   # Create your super admin user account
npm run dev            # Starts server on http://localhost:4000
```
> 💡 *Note: During development, verification codes and OTPs are printed directly in the server terminal.*

### 3. Client (Frontend) Setup
Open a separate terminal window, navigate to the client directory, install dependencies, and start the Vite dev server:
```bash
cd client
npm install
npm run dev            # Opens app on http://localhost:5173
```

---

## 🔮 Upcoming Phases
* Courses & Enrollment, Class Routine
* Attendance Tracking & Faculty Management
* Assignments, Submissions, Marks Entry & Results
* Official Notices & Campus Communications