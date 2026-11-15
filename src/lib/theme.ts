export type ThemeChoice = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "uniconnect-demo";

export function applyTheme(theme: ThemeChoice) {
  const root = document.documentElement;
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
}

export function resolvedTheme(theme: ThemeChoice): "light" | "dark" {
  if (theme === "light" || theme === "dark") return theme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export const THEME_BOOT_SCRIPT = `(function(){try{var raw=localStorage.getItem("${THEME_STORAGE_KEY}");if(!raw)return;var parsed=JSON.parse(raw);var theme=parsed&&parsed.state&&parsed.state.theme;if(theme==="light"||theme==="dark")document.documentElement.setAttribute("data-theme",theme);}catch(e){}})();`;
