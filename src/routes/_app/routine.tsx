import { createFileRoute } from "@tanstack/react-router";
import { RoutinePage } from "@/pages/routine-page";

export const Route = createFileRoute("/_app/routine")({
  head: () => ({ meta: [{ title: "Routine · UniConnect" }] }),
  component: RoutinePage,
});
