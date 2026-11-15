import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/pages/landing-page";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "UniConnect — Student Academic Portal" }] }),
  component: LandingPage,
});