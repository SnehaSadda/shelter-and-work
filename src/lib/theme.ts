export function initTheme() {
  if (typeof window === "undefined") return;
  const saved = localStorage.getItem("haven-theme");
  if (saved === "dark") document.documentElement.classList.add("dark");
}

export function toggleTheme() {
  const isDark = document.documentElement.classList.toggle("dark");
  localStorage.setItem("haven-theme", isDark ? "dark" : "light");
  return isDark;
}

export function isDark() {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}
