import { createFileRoute } from "@tanstack/react-router";
import { EventsPage } from "@/pages/events-page";

type EventSearch = { event?: string };

export const Route = createFileRoute("/_app/events")({
  validateSearch: (search: Record<string, unknown>): EventSearch => ({
    event: typeof search.event === "string" ? search.event : undefined,
  }),
  head: () => ({ meta: [{ title: "Events · UniConnect" }] }),
  component: EventsRoute,
});

function EventsRoute() {
  const { event } = Route.useSearch();
  return <EventsPage eventId={event} />;
}
