import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Menu, Moon, Phone, Search, Sun, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { notices } from "@/data/demo";
import { formatDateLabel } from "@/lib/format";
import { useAppStore } from "@/lib/store";
import { resolvedTheme, type ThemeChoice } from "@/lib/theme";
import { NAV } from "@/components/shell/nav";
import { SearchDialog } from "@/components/shell/search-dialog";

function useResolved(theme: ThemeChoice) {
  const [value, setValue] = useState<"light" | "dark">("light");
  useEffect(() => {
    const read = () => setValue(resolvedTheme(theme));
    read();
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", read);
    return () => media.removeEventListener("change", read);
  }, [theme]);
  return value;
}

function GmailIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
      <rect x="2" y="4" width="20" height="16" rx="3" />
      <path d="M2 7l10 7 10-7" />
    </svg>
  );
}

function WhatsAppIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
    </svg>
  );
}

// Keep ONLY Home (/dashboard), Results, and Routine in the top horizontal navbar
const TOP_BAR_ROUTES = new Set(["/dashboard", "/results", "/routine"]);

export function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  const profile = useAppStore((state) => state.profile);
  const signOut = useAppStore((state) => state.signOut);
  const readNoticeIds = useAppStore((state) => state.readNoticeIds);
  const markNoticeRead = useAppStore((state) => state.markNoticeRead);
  const resolved = useResolved(theme);

  const displayName =
    !profile.name || profile.name === "Rahim Ahmed" ? "Tahmid Anwar Mubin" : profile.name;
  const displayStudentId =
    !profile.studentId || profile.studentId === "DEMO-2022-0148"
      ? "232-115-310"
      : profile.studentId;

  const unreadNoticesList = notices.filter((notice) => !readNoticeIds.includes(notice.id));
  const topNavItems = NAV.filter((item) => TOP_BAR_ROUTES.has(item.to as string));

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (event.key === "/" && !typing) {
        event.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function toggleTheme() {
    setTheme(resolved === "dark" ? "light" : "dark");
  }

  return (
    <div className="relative min-h-dvh bg-bg text-fg">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-surface focus:px-3 focus:py-2 focus:r-md"
      >
        Skip to content
      </a>

      <div className="relative z-10 flex min-h-dvh flex-col">
        {/* Clean Top Header */}
        <header className="sticky top-0 z-30 border-b border-line bg-bg transition-ui">
          <div className="container-app flex items-center justify-between gap-3 px-4 py-3 md:px-8">
            {/* Left: Mobile Hamburger + Brand Lockup */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex size-10 items-center justify-center r-md hover:bg-sunken/80 lg:hidden"
                aria-label="Open menu"
                onClick={() => setMenuOpen(true)}
              >
                <Menu size={18} strokeWidth={1.75} />
              </button>

              <Link to="/dashboard" className="flex items-center gap-3 pr-2">
                <span className="inline-flex size-9 items-center justify-center border border-line bg-surface font-semibold tracking-tight text-fg r-sm">
                  U
                </span>
                <span className="leading-tight">
                  <span className="block type-sm font-medium text-fg">UniConnect</span>
                  <span className="hidden type-xs text-muted sm:block">Metropolitan University</span>
                </span>
              </Link>
            </div>

            {/* Right: Navigation Links (Home, Results, Routine) + Utility Controls */}
            <div className="ml-auto flex items-center gap-4 lg:gap-6">
              <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
                {topNavItems.map((item) => {
                  const navLabel = item.to === "/dashboard" ? "Home" : item.label;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      activeOptions={{ exact: item.exact }}
                      preload="intent"
                      className="inline-flex h-10 items-center gap-2 border-b-2 border-transparent px-3 type-sm text-muted transition-ui hover:text-fg"
                      activeProps={{
                        className:
                          "inline-flex h-10 items-center gap-2 border-b-2 border-fg px-3 type-sm font-medium text-fg transition-ui",
                      }}
                    >
                      <span>{navLabel}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="hidden h-4 w-px bg-line lg:block" aria-hidden />

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  className="inline-flex h-10 items-center gap-2 border border-line/70 bg-surface px-3 type-sm text-muted r-md hover:bg-sunken hover:text-fg"
                  onClick={() => setSearchOpen(true)}
                >
                  <Search size={16} strokeWidth={1.75} aria-hidden />
                  <span className="hidden sm:inline">Search</span>
                  <span className="hidden type-xs text-faint xl:inline">/</span>
                </button>

                <button
                  type="button"
                  className="inline-flex size-10 items-center justify-center r-md hover:bg-sunken/80"
                  onClick={toggleTheme}
                  aria-label={resolved === "dark" ? "Switch to light theme" : "Switch to dark theme"}
                >
                  {resolved === "dark" ? <Sun size={18} strokeWidth={1.75} /> : <Moon size={18} strokeWidth={1.75} />}
                </button>

                {/* Notice Notification Bell Icon */}
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger
                    className="relative inline-flex size-10 items-center justify-center r-md hover:bg-sunken/80"
                    aria-label={
                      unreadNoticesList.length ? `Notices, ${unreadNoticesList.length} unread` : "Notices"
                    }
                  >
                    <Bell size={18} strokeWidth={1.75} />
                    {unreadNoticesList.length > 0 ? (
                      <span className="absolute top-1 right-1 min-w-4 bg-fg px-1 text-center type-xs text-bg r-pill tabular-nums">
                        {unreadNoticesList.length > 9 ? "9+" : unreadNoticesList.length}
                      </span>
                    ) : null}
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      align="end"
                      className="z-50 w-80 border border-line bg-surface p-2 text-fg shadow-float r-md"
                    >
                      <p className="px-2 py-2 type-xs text-faint">
                        Unread notices ({unreadNoticesList.length})
                      </p>
                      {unreadNoticesList.length === 0 ? (
                        <p className="px-2 py-3 type-sm text-muted">All notices have been read.</p>
                      ) : (
                        unreadNoticesList.slice(0, 5).map((notice) => (
                          <DropdownMenu.Item key={notice.id} asChild>
                            <Link
                              to="/notices"
                              search={{ notice: notice.id }}
                              className="block px-2 py-2 type-sm text-fg r-sm outline-none data-[highlighted]:bg-sunken"
                              onClick={() => markNoticeRead(notice.id)}
                            >
                              <span className="block font-medium text-fg">{notice.title}</span>
                              <span className="mt-1 block type-xs text-muted">{formatDateLabel(notice.date)}</span>
                            </Link>
                          </DropdownMenu.Item>
                        ))
                      )}
                      <DropdownMenu.Item asChild>
                        <Link
                          to="/settings"
                          className="mt-1 block border-t border-line px-2 pt-2.5 pb-1.5 type-sm font-medium text-fg r-sm outline-none data-[highlighted]:bg-sunken"
                        >
                          All notifications
                        </Link>
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>

                {/* Account Dropdown Menu (MU) */}
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger
                    className="inline-flex size-10 items-center justify-center r-pill hover:bg-sunken/80"
                    aria-label="Account menu"
                  >
                    {profile.photoDataUrl ? (
                      <img src={profile.photoDataUrl} alt="" className="size-8 object-cover r-pill" />
                    ) : (
                      <span className="inline-flex size-8 items-center justify-center border border-line bg-surface type-xs font-semibold text-fg r-pill">
                        MU
                      </span>
                    )}
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      align="end"
                      className="z-50 w-60 border border-line bg-surface p-2 text-fg shadow-float r-md"
                    >
                      <p className="px-2 pt-2 pb-0.5 type-sm font-medium text-fg">{displayName}</p>
                      <p className="mb-1 border-b border-line px-2 pb-2 type-xs tabular-nums text-muted">
                        {displayStudentId}
                      </p>

                      <DropdownMenu.Item asChild>
                        <Link
                          to="/profile"
                          className="block px-2 py-2 type-sm text-fg r-sm outline-none data-[highlighted]:bg-sunken"
                        >
                          Profile
                        </Link>
                      </DropdownMenu.Item>

                      <div className="my-1 border-t border-line" />

                      <DropdownMenu.Item asChild>
                        <Link
                          to="/academics"
                          className="block px-2 py-2 type-sm text-fg r-sm outline-none data-[highlighted]:bg-sunken"
                        >
                          Academics
                        </Link>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item asChild>
                        <Link
                          to="/courses"
                          className="block px-2 py-2 type-sm text-fg r-sm outline-none data-[highlighted]:bg-sunken"
                        >
                          Courses
                        </Link>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item asChild>
                        <Link
                          to="/events"
                          className="block px-2 py-2 type-sm text-fg r-sm outline-none data-[highlighted]:bg-sunken"
                        >
                          Events
                        </Link>
                      </DropdownMenu.Item>

                      <div className="my-1 border-t border-line" />

                      <DropdownMenu.Item asChild>
                        <Link
                          to="/settings"
                          className="block px-2 py-2 type-sm text-fg r-sm outline-none data-[highlighted]:bg-sunken"
                        >
                          Settings
                        </Link>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        className="block w-full cursor-pointer px-2 py-2 text-left type-sm text-danger r-sm outline-none data-[highlighted]:bg-sunken"
                        onSelect={() => signOut()}
                      >
                        Sign out
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </div>
            </div>
          </div>
        </header>

        <main id="main" className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="container-app">{children}</div>
        </main>

        {/* Footer */}
        <footer className="mt-12 border-t border-line bg-[#14140F] py-12 text-[#A9A69C] md:py-14">
          <div className="container-app flex flex-col justify-between gap-8 px-4 sm:flex-row sm:items-center md:px-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex size-7 items-center justify-center border border-white/15 bg-white/10 type-xs font-semibold text-[#F5F4F0] r-sm">
                  U
                </span>
                <span className="type-sm font-medium text-[#F5F4F0]">UniConnect</span>
              </div>
              <p className="type-xs text-[#A9A69C]">
                © 2026 UniConnect · Metropolitan University Student Academic Portal.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <Link
                to="/"
                className="type-sm font-medium text-[#F5F4F0] transition-ui hover:text-[#A9A69C]"
              >
                About Us
              </Link>

              <div className="h-4 w-px bg-white/15" aria-hidden />

              <div className="flex items-center gap-2.5" aria-label="Contact options">
                <a
                  href="mailto:support@uniconnect.edu"
                  aria-label="Email via Gmail"
                  title="Gmail: support@uniconnect.edu"
                  className="inline-flex size-10 items-center justify-center border border-white/15 bg-white/10 text-[#F5F4F0] r-pill transition-ui hover:bg-[#F5F4F0] hover:text-[#14140F]"
                >
                  <GmailIcon className="size-4" />
                </a>

                <a
                  href="tel:+8801700000000"
                  aria-label="Call support"
                  title="Call: +880 1700-000000"
                  className="inline-flex size-10 items-center justify-center border border-white/15 bg-white/10 text-[#F5F4F0] r-pill transition-ui hover:bg-[#F5F4F0] hover:text-[#14140F]"
                >
                  <Phone size={16} strokeWidth={1.75} />
                </a>

                <a
                  href="https://wa.me/8801700000000"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Contact on WhatsApp"
                  title="WhatsApp"
                  className="inline-flex size-10 items-center justify-center border border-white/15 bg-white/10 text-[#F5F4F0] r-pill transition-ui hover:bg-[#F5F4F0] hover:text-[#14140F]"
                >
                  <WhatsAppIcon className="size-4" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Navigation Drawer */}
      <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay fixed inset-0 z-50 lg:hidden" />
          <Dialog.Content
            aria-describedby={undefined}
            className="dialog-panel fixed inset-y-0 left-0 z-50 w-[min(18rem,calc(100%-3rem))] overflow-y-auto border-r border-line bg-surface text-fg shadow-float lg:hidden"
          >
            <Dialog.Title className="sr-only">Menu</Dialog.Title>
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <span className="type-sm font-medium text-fg">UniConnect</span>
              <Dialog.Close
                className="inline-flex size-10 items-center justify-center r-md hover:bg-sunken"
                aria-label="Close menu"
              >
                <X size={18} strokeWidth={1.75} />
              </Dialog.Close>
            </div>
            <nav aria-label="Mobile Primary" className="flex flex-col gap-1 p-3">
              {NAV.map((item) => {
                const Icon = item.icon;
                const navLabel = item.to === "/dashboard" ? "Home" : item.label;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    activeOptions={{ exact: item.exact }}
                    onClick={() => setMenuOpen(false)}
                    className="flex min-h-11 items-center gap-3 px-3 type-sm text-muted r-md transition-ui hover:bg-sunken hover:text-fg"
                    activeProps={{
                      className:
                        "flex min-h-11 items-center gap-3 bg-sunken px-3 type-sm font-medium text-fg r-md transition-ui",
                    }}
                  >
                    <Icon size={18} strokeWidth={1.75} aria-hidden />
                    <span className="flex-1">{navLabel}</span>
                  </Link>
                );
              })}
            </nav>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}