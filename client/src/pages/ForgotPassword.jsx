import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import AuthCard from '../components/AuthCard';
import Field, { inputClass } from '../components/Field';
import Alert from '../components/Alert';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1 = request otp, 2 = reset with otp
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [info, setInfo] = useState('');
  const [error, setError] = useState({ message: '', errors: [] });
  const [busy, setBusy] = useState(false);

  async function handleRequest(event) {
    event.preventDefault();
    setError({ message: '', errors: [] });
    setBusy(true);

    try {
      const data = await api('/auth/forgot-password', {
        method: 'POST',
        body: { email },
      });
      setInfo(data.message || 'OTP sent to your email.');
      setStep(2);
    } catch (err) {
      setError({ message: err.message, errors: err.errors });
    } finally {
      setBusy(false);
    }
  }

  async function handleReset(event) {
    event.preventDefault();
    setError({ message: '', errors: [] });
    setBusy(true);

    try {
      const data = await api('/auth/reset-password', {
        method: 'POST',
        body: { email, code: otp, password: newPassword },
      });
      setInfo(data.message || 'Password reset successful! You can now log in.');
      setStep(3); 
    } catch (err) {
      setError({ message: err.message, errors: err.errors });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard title="Reset password" subtitle="Recover access to your UniConnect account.">
      <Alert message={error.message} errors={error.errors} />
      <Alert type="success" message={info} />

      {step === 1 && (
        <form onSubmit={handleRequest} className="mt-4 space-y-4">
          <Field label="Email">
            <input
              type="email"
              required
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {busy ? 'Sending OTP...' : 'Send reset code'}
          </button>

          <p className="text-center text-sm">
            Remembered your password?{' '}
            <Link to="/login" className="text-indigo-600 hover:underline dark:text-indigo-400">
              Log in
            </Link>
          </p>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleReset} className="mt-4 space-y-4">
          <Field label="Verification Code (OTP)">
            <input
              required
              inputMode="numeric"
              maxLength={6}
              className={inputClass}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </Field>

          <Field label="New Password">
            <input
              type="password"
              required
              className={inputClass}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Field>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {busy ? 'Resetting...' : 'Reset password'}
          </button>
        </form>
      )}

      {step === 3 && (
        <div className="mt-4 space-y-4 text-center">
          <Link
            to="/login"
            className="inline-block w-full rounded-lg bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700"
          >
            Go to Login
          </Link>
        </div>
      )}
    </AuthCard>
  );
}