export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-[var(--shadow-glow)]">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-primary-foreground">
          <path d="M12 2.5 3 10v11h6v-6h6v6h6V10z" fill="currentColor" />
          <circle cx="12" cy="13" r="1.5" fill="var(--color-secondary)" />
        </svg>
      </div>
      <span className="text-lg font-semibold tracking-tight">Haven</span>
    </div>
  );
}
