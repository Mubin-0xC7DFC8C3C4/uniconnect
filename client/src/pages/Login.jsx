import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, homePathFor } from '../context/AuthContext';
import AuthCard from '../components/AuthCard';
import Field, { inputClass } from '../components/Field';
import Alert from '../components/Alert';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);

    try {
      const user = await login(email, password);
      navigate(homePathFor(user.role));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard title="Log in" subtitle="Welcome back to UniConnect.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Alert message={error} />

        <Field label="Email">
          <input
            type="email"
            required
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {busy ? 'Logging in...' : 'Log in'}
        </button>

        <div className="flex justify-between text-sm">
          <Link to="/forgot-password" className="text-indigo-600 hover:underline dark:text-indigo-400">
            Forgot password?
          </Link>
          <Link to="/signup" className="text-indigo-600 hover:underline dark:text-indigo-400">
            Create an account
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}