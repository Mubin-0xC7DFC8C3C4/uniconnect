import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/shell/app-shell";
import { BootScreen } from "@/components/shell/boot-screen";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const hydrated = useAppStore((state) => state.hydrated);
  const signedIn = useAppStore((state) => state.signedIn);
  const navigate = useNavigate();

  useEffect(() => {
    if (hydrated && !signedIn) void navigate({ to: "/login", replace: true });
  }, [hydrated, signedIn, navigate]);

  if (!hydrated || !signedIn) return <BootScreen />;

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
