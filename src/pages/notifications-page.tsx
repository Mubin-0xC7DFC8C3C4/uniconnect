import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { notifications, type NotificationKind } from "@/data/demo";
import { formatDateLabel } from "@/lib/format";
import { cn } from "@/lib/cn";
import { useAppStore, type NotifPrefs } from "@/lib/store";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { PrefsFields } from "@/components/prefs-fields";
import { Button } from "@/components/ui/button";

const FILTERS: { id: "all" | NotificationKind; label: string }[] = [
  { id: "all", label: "All" },
  { id: "academic", label: "Academic" },
  { id: "routine", label: "Routine" },
  { id: "announcements", label: "Announcements" },
  { id: "events", label: "Events" },
  { id: "results", label: "Results" },
];

export function NotificationsPage() {
  const prefs = useAppStore((state) => state.prefs);
  const setPrefs = useAppStore((state) => state.setPrefs);
  const readIds = useAppStore((state) => state.readNotificationIds);
  const markNotificationRead = useAppStore((state) => state.markNotificationRead);
  const markNotificationsRead = useAppStore((state) => state.markNotificationsRead);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [showPrefs, setShowPrefs] = useState(false);

  const visible = useMemo(() => {
    return notifications.filter((item) => {
      if (!prefs[item.kind]) return false;
      if (filter !== "all" && item.kind !== filter) return false;
      return true;
    });
  }, [filter, prefs]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        kicker="This browser"
        title="Notifications"
        lede="Routine changes, notices, events, and result notes from the sample set. Preferences hide a category. They do not subscribe you to anything."
        actions={
          <Button
            variant="secondary"
            onClick={() => markNotificationsRead(visible.map((item) => item.id))}
            disabled={visible.every((item) => readIds.includes(item.id))}
          >
            Mark visible as read
          </Button>
        }
      />
      <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="Notification type">
        {FILTERS.map((item) => {
          const selected = filter === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setFilter(item.id)}
              className={cn(
                "min-h-11 shrink-0 border px-3 type-sm r-pill",
                selected ? "border-fg bg-fg text-bg" : "border-line text-muted",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {visible.length === 0 ? (
        <EmptyState
          title="Nothing in this view."
          body="A category may be turned off in preferences, or the sample list has no items of this type."
        />
      ) : (
        <ul className="border-t border-line">
          {visible.map((item) => {
            const unread = !readIds.includes(item.id);
            return (
              <li key={item.id} className="border-b border-line">
                <Link
                  to={item.href as "/"}
                  onClick={() => markNotificationRead(item.id)}
                  className="block py-4"
                >
                  <p className="type-xs text-faint">
                    {unread ? "Unread · " : "Read · "}
                    {item.kind} · {formatDateLabel(item.date)}
                  </p>
                  <p className="mt-1 type-sm font-medium text-fg">{item.title}</p>
                  <p className="mt-1 type-sm text-muted">{item.body}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      <section>
        <button type="button" className="type-sm font-medium underline-offset-4 hover:underline" onClick={() => setShowPrefs((value) => !value)} aria-expanded={showPrefs}>
          {showPrefs ? "Hide preferences" : "Notification preferences"}
        </button>
        {showPrefs ? (
          <div className="mt-4">
            <PrefsFields prefs={prefs} onChange={(key: keyof NotifPrefs, value) => setPrefs({ [key]: value })} />
          </div>
        ) : null}
      </section>
    </div>
  );
}
