import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { EVENT_CATEGORIES, events, type EventCategory } from "@/data/demo";
import { formatClock, formatRange } from "@/data/schedule";
import { formatDateLabel } from "@/lib/format";
import { cn } from "@/lib/cn";
import { useAppStore } from "@/lib/store";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export function EventsPage({ eventId }: { eventId?: string }) {
  const registrations = useAppStore((state) => state.registrations);
  const toggleRegistration = useAppStore((state) => state.toggleRegistration);
  const [category, setCategory] = useState<"all" | EventCategory>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (eventId && events.some((event) => event.id === eventId)) setOpenId(eventId);
  }, [eventId]);

  const visible = useMemo(() => {
    return events
      .filter((event) => category === "all" || event.category === category)
      .sort((a, b) => (a.date < b.date ? -1 : 1));
  }, [category]);

  const open = events.find((event) => event.id === openId) ?? null;
  const registered = open ? registrations.includes(open.id) : false;

  function onRegister() {
    if (!open || open.registration === "closed") return;
    const willJoin = !registrations.includes(open.id);
    toggleRegistration(open.id);
    toast(willJoin ? "RSVP confirmed. Event added to your schedule." : "Registration removed.");
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        kicker="Campus Calendar"
        title="Events"
        lede="Upcoming university seminars, departmental workshops, programming contests, and academic conferences."
      />
      <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="Event categories">
        {EVENT_CATEGORIES.map((item) => {
          const selected = category === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setCategory(item.id)}
              className={cn(
                "min-h-11 shrink-0 border px-3 type-sm r-pill",
                selected ? "border-fg bg-fg text-bg" : "border-line text-muted hover:bg-sunken",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {visible.length === 0 ? (
        <EmptyState title="No events in this category." body="Switch category back to All to browse upcoming campus activities." />
      ) : (
        <ul className="border-t border-line">
          {visible.map((event) => {
            const joined = registrations.includes(event.id);
            return (
              <li key={event.id} className="border-b border-line">
                <button type="button" onClick={() => setOpenId(event.id)} className="grid w-full gap-1 py-4 text-left sm:grid-cols-[9rem_1fr_auto] sm:items-baseline">
                  <span className="type-sm text-muted">{formatDateLabel(event.date)}</span>
                  <span>
                    <span className="block type-sm font-medium text-fg">{event.title}</span>
                    <span className="type-sm text-muted">
                      {formatClock(event.start)} · {event.venue}
                    </span>
                  </span>
                  <span className="type-xs text-faint">
                    {event.registration === "closed" ? "Closed" : joined ? "Registered" : event.registration === "waitlist" ? "Waitlist" : "Open"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <Modal
        open={Boolean(open)}
        onOpenChange={(value) => {
          if (!value) setOpenId(null);
        }}
        title={open?.title ?? "Event"}
        description={open ? `${open.host} · ${formatDateLabel(open.date)}` : undefined}
      >
        {open ? (
          <div className="flex flex-col gap-4">
            <p className="type-base text-fg">{open.summary}</p>
            <dl className="grid gap-3 type-sm sm:grid-cols-2">
              <div>
                <dt className="type-label text-fg">When</dt>
                <dd className="mt-1 text-muted">{formatRange(open.start, open.end)}</dd>
              </div>
              <div>
                <dt className="type-label text-fg">Venue</dt>
                <dd className="mt-1 text-muted">{open.venue}</dd>
              </div>
              <div>
                <dt className="type-label text-fg">Category</dt>
                <dd className="mt-1 capitalize text-muted">{open.category}</dd>
              </div>
              <div>
                <dt className="type-label text-fg">Registration</dt>
                <dd className="mt-1 text-muted">
                  {open.registration === "closed" ? "Closed in the sample data" : registered ? "Saved on this browser" : "Not saved"}
                </dd>
              </div>
            </dl>
            <Button type="button" onClick={onRegister} disabled={open.registration === "closed"} variant={registered ? "secondary" : "primary"}>
              {open.registration === "closed" ? "Registration closed" : registered ? "Remove local registration" : open.registration === "waitlist" ? "Join local waitlist" : "Register in this demo"}
            </Button>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}