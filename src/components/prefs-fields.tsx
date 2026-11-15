import type { NotifPrefs } from "@/lib/store";

const ROWS: { key: keyof NotifPrefs; label: string; detail: string }[] = [
  { key: "academic", label: "Academic", detail: "Registration windows and coursework reminders." },
  { key: "routine", label: "Routine changes", detail: "Cancellations and reschedules in the sample week." },
  { key: "announcements", label: "Announcements", detail: "New items in Notices." },
  { key: "events", label: "Events", detail: "Seminars, workshops, and contests." },
  { key: "results", label: "Results", detail: "Transcript and supplementary notes." },
];

export function PrefsFields({
  prefs,
  onChange,
}: {
  prefs: NotifPrefs;
  onChange: (key: keyof NotifPrefs, value: boolean) => void;
}) {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {ROWS.map((row) => (
        <li key={row.key} className="flex items-center justify-between gap-4 py-4">
          <div>
            <p className="type-sm font-medium text-fg">{row.label}</p>
            <p className="mt-1 type-sm text-muted">{row.detail}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={prefs[row.key]}
            onClick={() => onChange(row.key, !prefs[row.key])}
            className={
              "relative h-7 w-12 shrink-0 r-pill border border-line-strong transition-ui " +
              (prefs[row.key] ? "bg-accent" : "bg-sunken")
            }
          >
            <span className="sr-only">{prefs[row.key] ? "On" : "Off"}</span>
            <span
              className={
                "absolute top-0.5 size-5 bg-surface r-pill transition-ui " +
                (prefs[row.key] ? "left-6" : "left-0.5")
              }
            />
          </button>
        </li>
      ))}
    </ul>
  );
}
