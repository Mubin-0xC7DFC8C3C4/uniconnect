import { createFileRoute } from "@tanstack/react-router";
import { AcademicsPage } from "@/pages/academics-page";

export const Route = createFileRoute("/_app/academics")({
  head: () => ({ meta: [{ title: "Academics · UniConnect" }] }),
  component: AcademicsPage,
});
