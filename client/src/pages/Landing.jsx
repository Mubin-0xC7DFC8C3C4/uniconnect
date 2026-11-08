import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

const features = [
  { icon: '🎓', title: 'Verified sign-up', text: 'Accounts are checked against the university admission records.' },
  { icon: '📚', title: 'Courses & classwork', text: 'Enrolled courses, assignments and deadlines in one place.' },
  { icon: '🗓️', title: 'Routine & attendance', text: 'See today’s classes and your attendance at a glance.' },
  { icon: '📊', title: 'Marks & results', text: 'Published results and GPA, available whenever you need them.' },
  { icon: '📢', title: 'Notices', text: 'Choose which notice categories should notify you.' },
  { icon: '🔒', title: 'Secure by design', text: 'Role-based access: everyone sees only what they should.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-slate-50 to-fuchsia-100 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">UniConnect</span>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/login" className="text-sm font-medium hover:underline">
            Log in
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          One portal for students, teachers and administrators
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
          UniConnect replaces scattered notice boards, paper registers and chat groups with a single, secure university portal.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/signup"
            className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow hover:bg-indigo-700"
          >
            Sign up
          </Link>
          <Link
            to="/login"
            className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            Log in
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-16 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-800">
            <div className="text-3xl">{f.icon}</div>
            <h2 className="mt-2 font-semibold">{f.title}</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{f.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}