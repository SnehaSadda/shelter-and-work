import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { User, Building2, Briefcase } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — Haven" },
      { name: "description", content: "Create your Haven account as a User, NGO, or Employer." },
      { property: "og:title", content: "Sign up — Haven" },
      { property: "og:description", content: "Join Haven to find help or share help." },
    ],
  }),
  component: SignupPage,
});

type Role = "user" | "ngo" | "employer";

function SignupPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("user");

  const roles: { id: Role; title: string; desc: string; Icon: typeof User }[] = [
    { id: "user", title: "I need help", desc: "Find shelter, food & jobs nearby", Icon: User },
    { id: "ngo", title: "NGO / Volunteer", desc: "Share resources & updates", Icon: Building2 },
    { id: "employer", title: "Employer", desc: "Post short-term work", Icon: Briefcase },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/"><Logo /></Link>
        <ThemeToggle />
      </header>

      <main className="mx-auto grid max-w-md gap-6 px-4 pb-16 pt-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">It's free. No documents required.</p>
        </div>

        <div className="grid gap-2">
          <label className="text-xs font-medium text-muted-foreground">I am a…</label>
          <div className="grid gap-2">
            {roles.map(({ id, title, desc, Icon }) => (
              <button
                type="button"
                key={id}
                onClick={() => setRole(id)}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                  role === id
                    ? "border-primary bg-primary-soft shadow-[var(--shadow-soft)]"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  role === id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{title}</div>
                  <div className="text-xs text-muted-foreground">{desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <form
          className="grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/dashboard" });
          }}
        >
          <Field label="Name (optional)" name="name" placeholder="Your name" />
          <Field label="Phone number (optional)" name="phone" type="tel" placeholder="(555) 123-4567" />
          <Field label="Password" name="password" type="password" placeholder="Choose a password" required />

          <button
            type="submit"
            className="mt-2 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Create account
          </button>
          <p className="text-center text-xs text-muted-foreground">
            Already have one?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
          </p>
        </form>
      </main>
    </div>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        {...rest}
        className="h-11 rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/30"
      />
    </label>
  );
}
