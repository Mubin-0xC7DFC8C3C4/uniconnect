import { createFileRoute } from "@tanstack/react-router";
import { NoticesPage } from "@/pages/notices-page";

type NoticeSearch = { notice?: string };

export const Route = createFileRoute("/_app/notices")({
  validateSearch: (search: Record<string, unknown>): NoticeSearch => ({
    notice: typeof search.notice === "string" ? search.notice : undefined,
  }),
  head: () => ({ meta: [{ title: "Notices · UniConnect" }] }),
  component: NoticesRoute,
});

function NoticesRoute() {
  const { notice } = Route.useSearch();
  return <NoticesPage noticeId={notice} />;
}
