import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function AuthCard({ title, subtitle, wide = false, children }) {
  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-indigo-100 via-slate-50 to-fuchsia-100 px-4 py-8 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950">
      <div className="mb-6 flex w-full max-w-3xl items-center justify-between">
        <Link to="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
          UniConnect
        </Link>
        <ThemeToggle />
      </div>
      <div className={`w-full ${wide ? 'max-w-2xl' : 'max-w-md'} rounded-2xl bg-white p-6 shadow-lg dark:bg-slate-800 sm:p-8`}>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}