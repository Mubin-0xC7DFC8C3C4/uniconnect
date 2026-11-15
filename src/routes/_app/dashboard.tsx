import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/pages/dashboard-page";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · UniConnect" }] }),
  component: DashboardPage,
});