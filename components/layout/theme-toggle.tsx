"use client";

import { Moon, Sun } from "lucide-react";
import { THEME_STORAGE_KEY } from "@/lib/theme";

/**
 * Switches the `dark` class on <html>, which is the source of truth the
 * inline head script also writes to. The label is driven by CSS from that
 * class, so the server can render it without knowing the palette.
 */
export function ThemeToggle() {
  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // Storage can be unavailable; the toggle still works for this page view.
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between light and dark theme"
      className="inline-flex h-8 items-center gap-1.5 border border-line px-2.5 text-[12px] text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
    >
      <Sun aria-hidden="true" className="size-3.5 dark:hidden" />
      <Moon aria-hidden="true" className="hidden size-3.5 dark:block" />
      <span>
        theme: <span className="dark:hidden">light</span>
        <span className="hidden dark:inline">dark</span>
      </span>
    </button>
  );
}
