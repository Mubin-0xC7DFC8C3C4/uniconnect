import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import Alert from '../components/Alert';

const menu = [
  { label: 'Dashboard', active: true },
  { label: 'Courses & Calendar' },
  { label: 'Classwork' },
  { label: 'Attendance' },
  { label: 'Results' },
  { label: 'Routine' },
  { label: 'Notices' },
  { label: 'Faculty Info' },
  { label: 'Settings' },
];

const upcoming = ['Today’s classes', 'Upcoming deadlines', 'Attendance summary', 'Latest notices'];

export default function StudentDashboard() {
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/student/me', { token })
      .then(setProfile)
      .catch((err) => setError(err.message));
  }, [token]);

  return (
    <DashboardLayout title="Student Dashboard" menu={menu}>
      <Alert message={error} />
      {profile && (
        <>
          <section className="rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 p-6 text-white shadow">
            <h2 className="text-2xl font-bold">Welcome, {profile.full_name}</h2>
            <p className="mt-1 text-indigo-100">
              {profile.department} · Batch {profile.batch_no} · Section {profile.section} · ID {profile.id_no}
            </p>
          </section>

          <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {upcoming.map((title) => (
              <div key={title} className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-800">
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Coming in a later phase.</p>
              </div>
            ))}
          </section>
        </>
      )}
    </DashboardLayout>
  );
}