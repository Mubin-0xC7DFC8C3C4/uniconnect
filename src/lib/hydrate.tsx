import { useEffect } from "react";
import { applyTheme } from "@/lib/theme";
import { useAppStore } from "@/lib/store";

export function Hydrate() {
  const hydrated = useAppStore((state) => state.hydrated);
  const theme = useAppStore((state) => state.theme);
  const setHydrated = useAppStore((state) => state.setHydrated);

  useEffect(() => {
    let active = true;
    void Promise.resolve(useAppStore.persist.rehydrate()).finally(() => {
      if (active) setHydrated();
    });
    return () => {
      active = false;
    };
  }, [setHydrated]);

  useEffect(() => {
    if (!hydrated) return;
    applyTheme(theme);
  }, [hydrated, theme]);

  return null;
}
