import { createFileRoute } from "@tanstack/react-router";
import { ResultsPage } from "@/pages/results-page";

export const Route = createFileRoute("/_app/results")({
  head: () => ({ meta: [{ title: "Results · UniConnect" }] }),
  component: ResultsPage,
});
