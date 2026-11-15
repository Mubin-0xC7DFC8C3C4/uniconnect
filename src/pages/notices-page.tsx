import { useEffect, useMemo, useState } from "react";
import { NOTICE_CATEGORIES, notices, type NoticeCategory } from "@/data/demo";
import { formatDateLabel } from "@/lib/format";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/cn";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { Link } from "@tanstack/react-router";

export function NoticesPage({ noticeId }: { noticeId?: string }) {
  const readNoticeIds = useAppStore((state) => state.readNoticeIds);
  const markNoticeRead = useAppStore((state) => state.markNoticeRead);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | NoticeCategory>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (!noticeId) return;
    if (!notices.some((notice) => notice.id === noticeId)) return;
    setOpenId(noticeId);
    markNoticeRead(noticeId);
  }, [noticeId, markNoticeRead]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return notices
      .filter((notice) => category === "all" || notice.category === category)
      .filter((notice) => !needle || `${notice.title} ${notice.body}`.toLowerCase().includes(needle))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [query, category]);

  const open = notices.find((notice) => notice.id === openId) ?? null;
  const unread = notices.filter((notice) => !readNoticeIds.includes(notice.id)).length;

  function openNotice(id: string) {
    setOpenId(id);
    markNoticeRead(id);
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        kicker={`${unread} unread`}
        title="Notices"
        lede="Official academic circulars, examination announcements, departmental updates, and campus event memos."
        actions={
          <Button asChild variant="secondary">
            <Link to="/settings">Notification preferences</Link>
          </Button>
        }
      />
      <div className="flex flex-col gap-4">
        <label htmlFor="notice-search" className="sr-only">
          Search notices
        </label>
        <TextInput
          id="notice-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search notices by keyword or title..."
        />
        <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="Notice categories">
          {NOTICE_CATEGORIES.map((item) => {
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
      </div>
      {visible.length === 0 ? (
        <EmptyState title="No notices found." body="Try adjusting your search terms or switch category back to All." />
      ) : (
        <ul className="border-t border-line">
          {visible.map((notice) => {
            const isUnread = !readNoticeIds.includes(notice.id);
            return (
              <li key={notice.id} className="border-b border-line">
                <button type="button" onClick={() => openNotice(notice.id)} className="flex w-full flex-col items-start gap-1 py-4 text-left">
                  <span className="type-xs text-faint">
                    {isUnread ? "Unread · " : "Read · "}
                    {labelFor(notice.category)} · {formatDateLabel(notice.date)}
                  </span>
                  <span className="type-sm font-medium text-fg">{notice.title}</span>
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
        title={open?.title ?? "Notice"}
        description={open ? `${labelFor(open.category)} · ${formatDateLabel(open.date)}` : undefined}
      >
        <p className="type-base text-fg">{open?.body}</p>
        <p className="mt-4 type-xs text-faint">Sample text. Not an official circular.</p>
      </Modal>
    </div>
  );
}

function labelFor(category: NoticeCategory) {
  return NOTICE_CATEGORIES.find((item) => item.id === category)?.label ?? category;
}
