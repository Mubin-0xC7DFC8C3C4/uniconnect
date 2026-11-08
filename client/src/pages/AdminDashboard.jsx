import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import useAcademicLists from '../hooks/useAcademicLists';
import DashboardLayout from '../components/DashboardLayout';
import Field, { inputClass } from '../components/Field';
import Alert from '../components/Alert';

const menu = [
  { label: 'Admission Records', active: true },
  { label: 'Audit Logs', active: true },
  { label: 'Academic Structure' },
  { label: 'Enrollment' },
  { label: 'Routine Generator' },
  { label: 'Marks Review' },
  { label: 'Results' },
  { label: 'Notices' },
  { label: 'Settings' },
];

const emptyForm = {
  type: 'student',
  idNo: '',
  fullName: '',
  email: '',
  dob: '',
  deptId: '',
  batchId: '',
  sectionId: '',
  position: '',
};

export default function AdminDashboard() {
  const { token } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [records, setRecords] = useState([]);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState({ message: '', errors: [] });
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  const { departments, positions, batches, sections } = useAcademicLists(form.deptId, form.batchId);

  async function loadData() {
    try {
      setRecords(await api('/admin/verified-records', { token }));
      setLogs(await api('/admin/audit-logs', { token }));
    } catch (err) {
      setError({ message: err.message, errors: [] });
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    const next = { ...form, [name]: value };
    if (name === 'deptId') {
      next.batchId = '';
      next.sectionId = '';
    }
    if (name === 'batchId') next.sectionId = '';
    setForm(next);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError({ message: '', errors: [] });
    setSuccess('');
    setBusy(true);

    try {
      await api('/admin/verified-records', { method: 'POST', token, body: form });
      setSuccess('Record saved');
      setForm({ ...emptyForm, type: form.type });
      await loadData();
    } catch (err) {
      setError({ message: err.message, errors: err.errors });
    } finally {
      setBusy(false);
    }
  }

  const isStudent = form.type === 'student';

  return (
    <DashboardLayout title="Super Admin" menu={menu}>
      <section className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-800">
        <h2 className="text-lg font-semibold">Add an admission record</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Sign-up is only possible for people whose details match a record here.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <Alert message={error.message} errors={error.errors} />
          <Alert type="success" message={success} />

          <div className="flex gap-4">
            {['student', 'teacher'].map((t) => (
              <label key={t} className="flex items-center gap-2 capitalize">
                <input
                  type="radio"
                  name="type"
                  value={t}
                  checked={form.type === t}
                  onChange={handleChange}
                />
                {t}
              </label>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="ID number">
              <input name="idNo" required className={inputClass} value={form.idNo} onChange={handleChange} />
            </Field>

            <Field label="Full name">
              <input name="fullName" required className={inputClass} value={form.fullName} onChange={handleChange} />
            </Field>

            <Field label="Email">
              <input name="email" type="email" required className={inputClass} value={form.email} onChange={handleChange} />
            </Field>

            <Field label="Date of birth">
              <input name="dob" type="date" required className={inputClass} value={form.dob} onChange={handleChange} />
            </Field>

            <Field label="Department">
              <select name="deptId" required className={inputClass} value={form.deptId} onChange={handleChange}>
                <option value="">Choose...</option>
                {departments.map((d) => (
                  <option key={d.dept_id} value={d.dept_id}>
                    {d.code}
                  </option>
                ))}
              </select>
            </Field>

            {isStudent ? (
              <>
                <Field label="Batch">
                  <select name="batchId" required className={inputClass} value={form.batchId} onChange={handleChange}>
                    <option value="">Choose...</option>
                    {batches.map((b) => (
                      <option key={b.batch_id} value={b.batch_id}>
                        Batch {b.batch_no}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Section">
                  <select name="sectionId" required className={inputClass} value={form.sectionId} onChange={handleChange}>
                    <option value="">Choose...</option>
                    {sections.map((s) => (
                      <option key={s.section_id} value={s.section_id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </>
            ) : (
              <Field label="Academic rank">
                <select name="position" required className={inputClass} value={form.position} onChange={handleChange}>
                  <option value="">Choose...</option>
                  {positions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </Field>
            )}
          </div>

          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {busy ? 'Saving...' : 'Save record'}
          </button>
        </form>
      </section>

      <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-800">
        <h2 className="text-lg font-semibold">Admission records ({records.length})</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400">
              <tr>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Dept</th>
                <th className="py-2 pr-4">Batch / Rank</th>
                <th className="py-2">Account</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.record_id} className="border-b border-slate-100 dark:border-slate-700/50">
                  <td className="py-2 pr-4 capitalize">{r.type}</td>
                  <td className="py-2 pr-4">{r.id_no}</td>
                  <td className="py-2 pr-4">{r.full_name}</td>
                  <td className="py-2 pr-4">{r.email}</td>
                  <td className="py-2 pr-4">{r.dept}</td>
                  <td className="py-2 pr-4">
                    {r.type === 'student' ? `${r.batch_no}-${r.section}` : r.position}
                  </td>
                  <td className="py-2">{r.is_used ? 'Created' : 'Not yet'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-800">
        <h2 className="text-lg font-semibold">Recent activity (audit log)</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400">
              <tr>
                <th className="py-2 pr-4">Time</th>
                <th className="py-2 pr-4">Action</th>
                <th className="py-2 pr-4">Record</th>
                <th className="py-2">Reason</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.log_id} className="border-b border-slate-100 dark:border-slate-700/50">
                  <td className="py-2 pr-4 whitespace-nowrap">{l.created_at}</td>
                  <td className="py-2 pr-4">{l.action}</td>
                  <td className="py-2 pr-4">{l.record}</td>
                  <td className="py-2">{l.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardLayout>
  );
}