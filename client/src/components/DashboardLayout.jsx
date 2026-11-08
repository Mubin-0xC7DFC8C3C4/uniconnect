import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function DashboardLayout({ title, menu, children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen md:flex">
      <aside className="bg-indigo-700 p-4 text-indigo-100 md:min-h-screen md:w-64 dark:bg-indigo-950">
        <p className="mb-4 text-xl font-bold text-white">UniConnect</p>
        <nav>
          <ul className="flex gap-2 overflow-x-auto md:flex-col md:gap-1">
            {menu.map((item) => (
              <li
                key={item.label}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm ${
                  item.active ? 'bg-white/20 font-semibold text-white' : 'text-indigo-200'
                }`}
              >
                {item.label}
                {!item.active && <span className="ml-2 rounded bg-white/10 px-1.5 text-xs">soon</span>}
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
          <h1 className="text-lg font-semibold">{title}</h1>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-600 sm:inline dark:text-slate-300">
              {user?.email}
            </span>
            <ThemeToggle />
            <button
              type="button"
              onClick={logout}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
            >
              Log out
            </button>
          </div>
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}