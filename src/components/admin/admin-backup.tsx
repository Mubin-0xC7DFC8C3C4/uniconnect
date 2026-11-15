import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Database,
  Download,
  HardDrive,
  RefreshCw,
  RotateCcw,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  type AppNotification,
  type CampusEvent,
  type ClassSession,
  type Course,
  type Notice,
  type StudentRecord,
  type TranscriptRow,
  ADMIN_STORAGE_KEYS,
  courses,
  events,
  notices,
  notifications,
  resetAdminDataToDefaults,
  saveCourses,
  saveEvents,
  saveNotices,
  saveNotifications,
  saveSessions,
  saveStudents,
  saveTranscript,
  sessions,
  students,
  transcript,
} from "@/data/demo";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

interface AdminBackupProps {
  onDataReset: () => void;
}

export function AdminBackup({ onDataReset }: AdminBackupProps) {
  const profile = useAppStore((state) => state.profile);
  const complaints = useAppStore((state) => state.complaints);
  const resetDemo = useAppStore((state) => state.resetDemo);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  function handleExportBackup() {
    const backupData = {
      version: 2,
      exportedAt: new Date().toISOString(),
      institution: "Metropolitan University (Sample UniConnect)",
      courses,
      notices,
      students,
      sessions,
      events,
      transcript,
      notifications,
      complaints,
      activeProfile: profile,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `uniconnect-system-backup-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Full system backup JSON exported successfully.");
  }

  function handleImportFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);

        if (Array.isArray(data.courses)) saveCourses(data.courses);
        if (Array.isArray(data.notices)) saveNotices(data.notices);
        if (Array.isArray(data.students)) saveStudents(data.students);
        if (Array.isArray(data.sessions)) saveSessions(data.sessions);
        if (Array.isArray(data.events)) saveEvents(data.events);
        if (Array.isArray(data.transcript)) saveTranscript(data.transcript);
        if (Array.isArray(data.notifications)) saveNotifications(data.notifications);

        onDataReset();
        toast.success("Database restored successfully from backup.");
      } catch (err) {
        toast.error("Failed to parse backup JSON file. Ensure file is valid.");
      }
    };
    reader.readAsText(file);
  }

  function handleResetConfirm() {
    resetAdminDataToDefaults();
    resetDemo();
    onDataReset();
    setResetModalOpen(false);
    toast.success("Factory defaults restored across all system modules.");
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <h2 className="type-xl font-semibold text-fg">System Storage &amp; Backup Operations</h2>
        <p className="type-sm text-muted">
          Inspect persistent browser storage allocations, export complete JSON database snapshots, or restore institutional factory seeds.
        </p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Export / Import Snapshot */}
        <div className="border border-line bg-surface p-6 r-lg flex flex-col justify-between space-y-4">
          <div>
            <div className="flex size-10 items-center justify-center rounded-lg border border-line bg-bg text-fg">
              <Download size={20} />
            </div>
            <h3 className="mt-3 type-base font-semibold text-fg">Database Export &amp; Snapshot</h3>
            <p className="mt-1 type-xs text-muted leading-relaxed">
              Generate a single complete JSON archive encompassing course syllabi, student roster, class schedule, transcript results, and announcements.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button onClick={handleExportBackup} className="gap-2">
              <Download size={15} />
              <span>Download JSON Backup</span>
            </Button>

            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImportFile(file);
              }}
            />
            <Button
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Upload size={15} className="text-muted" />
              <span>Restore from JSON</span>
            </Button>
          </div>
        </div>

        {/* Factory Reset */}
        <div className="border border-line bg-surface p-6 r-lg flex flex-col justify-between space-y-4">
          <div>
            <div className="flex size-10 items-center justify-center rounded-lg border border-danger/30 bg-danger/10 text-danger">
              <AlertTriangle size={20} />
            </div>
            <h3 className="mt-3 type-base font-semibold text-fg">Restore Factory Seeds</h3>
            <p className="mt-1 type-xs text-muted leading-relaxed">
              Discard all local mutations, added courses, modified routines, student roster changes, and complaint triage entries. Restores the pristine initial demonstration dataset.
            </p>
          </div>

          <div className="pt-2">
            <Button
              variant="danger"
              onClick={() => setResetModalOpen(true)}
              className="gap-2"
            >
              <RotateCcw size={15} />
              <span>Reset All Data to Defaults</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Storage Allocations Inspector */}
      <div className="border border-line bg-surface p-6 r-lg space-y-4">
        <div className="flex items-center gap-2">
          <HardDrive size={18} className="text-fg" />
          <h3 className="type-sm font-semibold text-fg">Active Storage Keys Inspector</h3>
        </div>
        <p className="type-xs text-muted">
          Active LocalStorage items supporting the reactive data layer between `/admin` and student-facing pages:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-line bg-sunken/60 text-muted uppercase font-semibold">
                <th className="py-2.5 px-3">Entity Domain</th>
                <th className="py-2.5 px-3">Storage Key</th>
                <th className="py-2.5 px-3 text-center">Active Records</th>
                <th className="py-2.5 px-3 text-center">Persistence Mode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line font-mono">
              <tr>
                <td className="py-2.5 px-3 font-sans font-medium text-fg">Courses</td>
                <td className="py-2.5 px-3 text-muted">{ADMIN_STORAGE_KEYS.courses}</td>
                <td className="py-2.5 px-3 text-center text-fg font-semibold">{courses.length}</td>
                <td className="py-2.5 px-3 text-center font-sans text-emerald-600 dark:text-emerald-400">Live JSON</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-medium text-fg">Notices</td>
                <td className="py-2.5 px-3 text-muted">{ADMIN_STORAGE_KEYS.notices}</td>
                <td className="py-2.5 px-3 text-center text-fg font-semibold">{notices.length}</td>
                <td className="py-2.5 px-3 text-center font-sans text-emerald-600 dark:text-emerald-400">Live JSON</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-medium text-fg">Students Roster</td>
                <td className="py-2.5 px-3 text-muted">{ADMIN_STORAGE_KEYS.students}</td>
                <td className="py-2.5 px-3 text-center text-fg font-semibold">{students.length}</td>
                <td className="py-2.5 px-3 text-center font-sans text-emerald-600 dark:text-emerald-400">Live JSON</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-medium text-fg">Routine Sessions</td>
                <td className="py-2.5 px-3 text-muted">{ADMIN_STORAGE_KEYS.sessions}</td>
                <td className="py-2.5 px-3 text-center text-fg font-semibold">{sessions.length}</td>
                <td className="py-2.5 px-3 text-center font-sans text-emerald-600 dark:text-emerald-400">Live JSON</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-medium text-fg">Results &amp; Transcripts</td>
                <td className="py-2.5 px-3 text-muted">{ADMIN_STORAGE_KEYS.transcript}</td>
                <td className="py-2.5 px-3 text-center text-fg font-semibold">{transcript.length}</td>
                <td className="py-2.5 px-3 text-center font-sans text-emerald-600 dark:text-emerald-400">Live JSON</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-medium text-fg">Events Calendar</td>
                <td className="py-2.5 px-3 text-muted">{ADMIN_STORAGE_KEYS.events}</td>
                <td className="py-2.5 px-3 text-center text-fg font-semibold">{events.length}</td>
                <td className="py-2.5 px-3 text-center font-sans text-emerald-600 dark:text-emerald-400">Live JSON</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-medium text-fg">Broadcast Notifications</td>
                <td className="py-2.5 px-3 text-muted">{ADMIN_STORAGE_KEYS.notifications}</td>
                <td className="py-2.5 px-3 text-center text-fg font-semibold">{notifications.length}</td>
                <td className="py-2.5 px-3 text-center font-sans text-emerald-600 dark:text-emerald-400">Live JSON</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-medium text-fg">Student Profile &amp; Preferences</td>
                <td className="py-2.5 px-3 text-muted">grok-workspace-v1</td>
                <td className="py-2.5 px-3 text-center text-fg font-semibold">1 active</td>
                <td className="py-2.5 px-3 text-center font-sans text-emerald-600 dark:text-emerald-400">Zustand Persist</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Safety Confirmation Modal */}
      <Modal
        open={resetModalOpen}
        onOpenChange={setResetModalOpen}
        title="Confirm Factory Reset"
        description="Are you sure you want to restore the entire university workspace to original defaults?"
      >
        <div className="flex flex-col gap-4">
          <p className="type-sm text-muted">
            All custom course definitions, scheduled timetable slots, registered students, and student grievance submissions will be permanently replaced with initial seed records.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setResetModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleResetConfirm}>
              Confirm Complete Reset
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
