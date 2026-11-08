import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import useAcademicLists from '../hooks/useAcademicLists';
import AuthCard from '../components/AuthCard';
import Field, { inputClass } from '../components/Field';
import Alert from '../components/Alert';

const emptyForm = {
  type: 'student',
  fullName: '',
  idNo: '',
  email: '',
  phone: '',
  dob: '',
  deptId: '',
  batchId: '',
  sectionId: '',
  position: '',
};

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [idCard, setIdCard] = useState(null);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState({ message: '', errors: [] });
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  const { departments, positions, batches, sections } = useAcademicLists(form.deptId, form.batchId);

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

  async function handleStart(event) {
    event.preventDefault();
    setError({ message: '', errors: [] });
    setBusy(true);

    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== '') data.append(key, value);
      });
      if (idCard) data.append('idCard', idCard);

      const result = await api('/auth/signup/start', { method: 'POST', formData: data });
      setInfo(result.message);
      setStep(2);
    } catch (err) {
      setError({ message: err.message, errors: err.errors });
    } finally {
      setBusy(false);
    }
  }

  async function handleComplete(event) {
    event.preventDefault();
    setError({ message: '', errors: [] });
    setBusy(true);

    try {
      await api('/auth/signup/complete', {
        method: 'POST',
        body: { email: form.email, code, password, confirmPassword },
      });
      navigate('/login');
    } catch (err) {
      setError({ message: err.message, errors: err.errors });
    } finally {
      setBusy(false);
    }
  }

  const isStudent = form.type === 'student';

  if (step === 2) {
    return (
      <AuthCard title="Verify your email" subtitle="Enter the 6-digit code we emailed you and choose a password.">
        <form onSubmit={handleComplete} className="space-y-4">
          <Alert type="success" message={info} />
          <Alert message={error.message} />

          <Field label="Verification code">
            <input
              required
              inputMode="numeric"
              maxLength={6}
              className={inputClass}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </Field>

          <Field label="Password">
            <input
              type="password"
              required
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            At least 8 characters with an upper-case letter, a lower-case letter and a digit.
          </p>

          <Field label="Confirm password">
            <input
              type="password"
              required
              className={inputClass}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Field>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {busy ? 'Creating account...' : 'Create account'}
          </button>

          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full text-sm text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Back to my details
          </button>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      wide
      title="Create your account"
      subtitle="We check your details against the university admission records."
    >
      <form onSubmit={handleStart} className="space-y-4">
        <Alert message={error.message} errors={error.errors} />

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

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <input
              name="fullName"
              required
              className={inputClass}
              value={form.fullName}
              onChange={handleChange}
            />
          </Field>

          <Field label={isStudent ? 'Student ID' : 'Teacher ID'}>
            <input
              name="idNo"
              required
              className={inputClass}
              value={form.idNo}
              onChange={handleChange}
            />
          </Field>

          <Field label="Email">
            <input
              name="email"
              type="email"
              required
              className={inputClass}
              value={form.email}
              onChange={handleChange}
            />
          </Field>

          <Field label="Mobile number">
            <input
              name="phone"
              required
              placeholder="01XXXXXXXXX"
              className={inputClass}
              value={form.phone}
              onChange={handleChange}
            />
          </Field>

          <Field label="Date of birth">
            <input
              name="dob"
              type="date"
              required
              className={inputClass}
              value={form.dob}
              onChange={handleChange}
            />
          </Field>

          <Field label="Department">
            <select
              name="deptId"
              required
              className={inputClass}
              value={form.deptId}
              onChange={handleChange}
            >
              <option value="">Choose...</option>
              {departments.map((d) => (
                <option key={d.dept_id} value={d.dept_id}>
                  {d.name}
                </option>
              ))}
            </select>
          </Field>

          {isStudent ? (
            <>
              <Field label="Batch">
                <select
                  name="batchId"
                  required
                  className={inputClass}
                  value={form.batchId}
                  onChange={handleChange}
                >
                  <option value="">Choose...</option>
                  {batches.map((b) => (
                    <option key={b.batch_id} value={b.batch_id}>
                      Batch {b.batch_no}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Section">
                <select
                  name="sectionId"
                  required
                  className={inputClass}
                  value={form.sectionId}
                  onChange={handleChange}
                >
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
              <select
                name="position"
                required
                className={inputClass}
                value={form.position}
                onChange={handleChange}
              >
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

        <Field label="ID card photo (JPG or PNG, max 2 MB)">
          <input
            type="file"
            accept="image/jpeg,image/png"
            required
            className={inputClass}
            onChange={(e) => setIdCard(e.target.files[0] || null)}
          />
        </Field>

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {busy ? 'Checking...' : 'Verify and continue'}
        </button>

        <p className="text-center text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline dark:text-indigo-400">
            Log in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}