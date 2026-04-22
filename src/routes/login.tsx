import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Haven" },
      { name: "description", content: "Sign in to Haven to access nearby help, updates, and jobs." },
      { property: "og:title", content: "Sign in — Haven" },
      { property: "og:description", content: "Welcome back to Haven." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/"><Logo /></Link>
        <ThemeToggle />
      </header>

      <main className="mx-auto grid max-w-sm gap-6 px-4 pb-16 pt-10">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to continue.</p>
        </div>

        <form
          className="grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/dashboard" });
          }}
        >
          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Phone or username</span>
            <input
              required
              className="h-11 rounded-lg border border-input bg-card px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
              placeholder="(555) 123-4567"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Password</span>
            <input
              required
              type="password"
              className="h-11 rounded-lg border border-input bg-card px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            className="mt-2 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Sign in
          </button>
          <p className="text-center text-xs text-muted-foreground">
            New to Haven?{" "}
            <Link to="/signup" className="font-medium text-primary hover:underline">Create an account</Link>
          </p>
        </form>
      </main>
    </div>
  );
}
