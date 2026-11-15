import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  INITIAL_STUDENTS,
  courses,
  events,
  notices,
  notifications,
  saveStudents,
  sessions,
  students,
  transcript,
} from "@/data/demo";
import { useAppStore } from "@/lib/store";
import { AdminHeader, type AdminTab } from "@/components/admin/admin-header";
import { AdminOverview } from "@/components/admin/admin-overview";
import { AdminCourses } from "@/components/admin/admin-courses";
import { AdminNotices } from "@/components/admin/admin-notices";
import { AdminStudents } from "@/components/admin/admin-students";
import { AdminRoutine } from "@/components/admin/admin-routine";
import { AdminResults } from "@/components/admin/admin-results";
import { AdminEvents } from "@/components/admin/admin-events";
import { AdminComplaints } from "@/components/admin/admin-complaints";
import { AdminNotifications } from "@/components/admin/admin-notifications";
import { AdminBackup } from "@/components/admin/admin-backup";

export const Route = createFileRoute("/admin")({
  component: AdminControlCenterPage,
});

function AdminControlCenterPage() {
  const [currentTab, setCurrentTab] = useState<AdminTab>("overview");
  const [, setDataVersion] = useState(0);

  const activeProfile = useAppStore((state) => state.profile);
  const complaints = useAppStore((state) => state.complaints);

  function handleDataChange() {
    setDataVersion((v) => v + 1);
  }

  useEffect(() => {
    // Automatically migrate legacy cached student records to Mubin's updated record
    if (students.some((s) => s.studentId === "DEMO-2022-0148" || s.name === "Rahim Ahmed")) {
      saveStudents(INITIAL_STUDENTS);
    }

    function onDataSync() {
      setDataVersion((v) => v + 1);
    }
    window.addEventListener("uniconnect:data-changed", onDataSync);
    return () => window.removeEventListener("uniconnect:data-changed", onDataSync);
  }, []);

  const activeStudent =
    students.find((s) => s.studentId === activeProfile.studentId) ||
    students.find((s) => s.studentId === "232-115-310") ||
    null;

  return (
    <div className="min-h-screen bg-bg text-fg flex flex-col">
      {/* Top Registrar Admin Navigation & Header */}
      <AdminHeader
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        coursesCount={courses.length}
        noticesCount={notices.length}
        studentsCount={students.length}
        sessionsCount={sessions.length}
        eventsCount={events.length}
        complaintsCount={complaints.length}
        onDataReset={handleDataChange}
      />

      {/* Main Administrative Control Workspace */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {currentTab === "overview" && (
          <AdminOverview
            onNavigateTab={setCurrentTab}
            coursesCount={courses.length}
            noticesCount={notices.length}
            studentsCount={students.length}
            sessionsCount={sessions.length}
            eventsCount={events.length}
            complaintsCount={complaints.length}
            transcriptCount={transcript.length}
            notificationsCount={notifications.length}
            activeStudent={activeStudent}
          />
        )}

        {currentTab === "courses" && (
          <AdminCourses
            courses={courses}
            onDataChange={handleDataChange}
          />
        )}

        {currentTab === "notices" && (
          <AdminNotices
            notices={notices}
            onDataChange={handleDataChange}
          />
        )}

        {currentTab === "students" && (
          <AdminStudents
            students={students}
            onDataChange={handleDataChange}
          />
        )}

        {currentTab === "routine" && (
          <AdminRoutine
            sessions={sessions}
            courses={courses}
            onDataChange={handleDataChange}
          />
        )}

        {currentTab === "results" && (
          <AdminResults
            transcript={transcript}
            onDataChange={handleDataChange}
          />
        )}

        {currentTab === "events" && (
          <AdminEvents
            events={events}
            onDataChange={handleDataChange}
          />
        )}

        {currentTab === "complaints" && (
          <AdminComplaints />
        )}

        {currentTab === "notifications" && (
          <AdminNotifications
            notifications={notifications}
            onDataChange={handleDataChange}
          />
        )}

        {currentTab === "backup" && (
          <AdminBackup
            onDataReset={handleDataChange}
          />
        )}
      </main>

      {/* Admin Footer */}
      <footer className="border-t border-line bg-surface/50 py-6 text-center text-xs text-muted">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            UniConnect Registrar &amp; Academic Administration Control Center · Metropolitan University
          </p>
          <p className="type-xs text-muted">
            Direct Access Control · Real-Time Data Synchronization
          </p>
        </div>
      </footer>
    </div>
  );
}