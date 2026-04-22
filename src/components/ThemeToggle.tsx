import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { initTheme, isDark, toggleTheme } from "@/lib/theme";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    initTheme();
    setDark(isDark());
  }, []);

  return (
    <button
      onClick={() => setDark(toggleTheme())}
      aria-label="Toggle theme"
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-accent"
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
