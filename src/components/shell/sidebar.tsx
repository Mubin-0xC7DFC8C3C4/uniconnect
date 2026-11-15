import { Link } from "@tanstack/react-router";
import { notices, notifications } from "@/data/demo";
import { useAppStore } from "@/lib/store";
import { NAV } from "@/components/shell/nav";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const readNoticeIds = useAppStore((state) => state.readNoticeIds);
  const readNotificationIds = useAppStore((state) => state.readNotificationIds);
  const prefs = useAppStore((state) => state.prefs);
  const unreadNotices = notices.filter((notice) => !readNoticeIds.includes(notice.id)).length;
  const unreadNotifications = notifications.filter(
    (item) => prefs[item.kind] && !readNotificationIds.includes(item.id),
  ).length;

  return (
    <div className="flex h-full flex-col">
      <div className="px-3 py-5">
        <p className="type-sm font-medium text-fg">UniConnect</p>
        <p className="mt-1 type-xs text-faint">Student workspace</p>
      </div>
      <nav aria-label="Primary" className="flex flex-1 flex-col gap-1 px-2 pb-6">
        {NAV.map((item) => {
          const badge =
            item.to === "/notices" ? unreadNotices : item.to === "/notifications" ? unreadNotifications : 0;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.exact }}
              preload="intent"
              onClick={onNavigate}
              className="flex min-h-11 items-center gap-3 px-3 type-sm text-muted r-md transition-ui hover:bg-sunken hover:text-fg"
              activeProps={{
                className:
                  "flex min-h-11 items-center gap-3 bg-sunken px-3 type-sm font-medium text-fg r-md transition-ui",
              }}
            >
              <Icon size={18} strokeWidth={1.75} aria-hidden />
              <span className="flex-1">{item.label}</span>
              {badge > 0 ? (
                <span className="type-xs tabular-nums text-faint">{badge}</span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
