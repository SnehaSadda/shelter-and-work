import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { resources, feed, jobs, type Resource } from "@/lib/mockData";
import {
  MapPin, Newspaper, Briefcase, Heart, Phone, Clock, Bed, Utensils,
  Stethoscope, Shirt, Navigation, ThumbsUp, LogOut, Plus
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Haven" },
      { name: "description", content: "Your hub for nearby help, community updates, and job opportunities." },
      { property: "og:title", content: "Dashboard — Haven" },
      { property: "og:description", content: "Find help, share hope, rebuild life." },
    ],
  }),
  component: Dashboard,
});

type Tab = "map" | "feed" | "jobs";

function Dashboard() {
  const [tab, setTab] = useState<Tab>("map");

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/"><Logo /></Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm text-foreground hover:bg-accent"
            >
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sign out</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Hello, friend 👋</h1>
            <p className="text-sm text-muted-foreground">Here's what's available near you today.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 inline-flex w-full rounded-xl border border-border bg-card p-1 shadow-[var(--shadow-soft)] sm:w-auto">
          <TabButton active={tab === "map"} onClick={() => setTab("map")} icon={<MapPin className="h-4 w-4" />} label="Map" />
          <TabButton active={tab === "feed"} onClick={() => setTab("feed")} icon={<Newspaper className="h-4 w-4" />} label="Feed" />
          <TabButton active={tab === "jobs"} onClick={() => setTab("jobs")} icon={<Briefcase className="h-4 w-4" />} label="Jobs" />
        </div>

        {tab === "map" && <MapView />}
        {tab === "feed" && <FeedView />}
        {tab === "jobs" && <JobsView />}
      </main>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all sm:flex-none ${
        active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon} {label}
    </button>
  );
}

/* ---------- MAP ---------- */
function MapView() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="relative h-[360px] overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)] lg:h-auto">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 40%, oklch(0.65 0.15 250 / 0.18), transparent 50%), radial-gradient(circle at 70% 60%, oklch(0.78 0.16 65 / 0.15), transparent 50%), linear-gradient(135deg, var(--color-primary-soft), var(--color-background))",
          }}
        />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* fake pins */}
        {[
          { top: "30%", left: "25%", color: "var(--color-primary)" },
          { top: "55%", left: "45%", color: "var(--color-secondary)" },
          { top: "40%", left: "70%", color: "var(--color-primary)" },
          { top: "70%", left: "30%", color: "var(--color-success)" },
          { top: "20%", left: "60%", color: "var(--color-secondary)" },
        ].map((p, i) => (
          <div key={i} className="absolute -translate-x-1/2 -translate-y-full" style={{ top: p.top, left: p.left }}>
            <div className="flex h-8 w-8 items-center justify-center rounded-full shadow-lg ring-4 ring-background" style={{ backgroundColor: p.color }}>
              <MapPin className="h-4 w-4 text-white" />
            </div>
          </div>
        ))}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl border border-border bg-background/90 p-3 backdrop-blur">
          <div className="flex items-center gap-2 text-sm">
            <Navigation className="h-4 w-4 text-primary" />
            <span className="font-medium">Showing places within 5 km</span>
          </div>
          <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
            Recenter
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {resources.map((r) => <ResourceCard key={r.id} r={r} />)}
      </div>
    </div>
  );
}

function ResourceCard({ r }: { r: Resource }) {
  const Icon = r.type === "shelter" ? Bed : r.type === "food" ? Utensils : r.type === "medical" ? Stethoscope : Shirt;
  const statusStyles = {
    available: "bg-success/15 text-success",
    full: "bg-warning/20 text-warning-foreground",
    closed: "bg-muted text-muted-foreground",
  }[r.status];
  const statusLabel = { available: "Available", full: "Full", closed: "Closed" }[r.status];

  return (
    <div className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-soft)] transition-all hover:border-primary/40">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold">{r.name}</h3>
            <p className="text-xs text-muted-foreground">{r.address} · {r.distanceKm} km</p>
          </div>
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusStyles}`}>{statusLabel}</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {r.hours}</span>
          {r.capacity && <span>· {r.capacity}</span>}
        </div>
      </div>
    </div>
  );
}

/* ---------- FEED ---------- */
function FeedView() {
  const [helpful, setHelpful] = useState<Record<string, boolean>>({});
  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="grid gap-4">
        {feed.map((p) => {
          const isHelpful = helpful[p.id];
          return (
            <article key={p.id} className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-sm font-semibold text-primary-foreground">
                  {p.org[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{p.org}</span>
                    <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent-foreground">
                      {p.role}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{p.time}</span>
                </div>
              </div>
              <h3 className="mt-3 text-base font-semibold">{p.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.body}</p>
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => setHelpful((s) => ({ ...s, [p.id]: !s[p.id] }))}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    isHelpful
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ThumbsUp className="h-3.5 w-3.5" /> Helpful · {p.helpful + (isHelpful ? 1 : 0)}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-2xl border border-border bg-gradient-to-br from-primary-soft to-card p-5 shadow-[var(--shadow-soft)]">
          <Heart className="h-6 w-6 text-secondary" />
          <h3 className="mt-2 text-base font-semibold">Share an update</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            NGOs and volunteers can post resources to reach people who need them most.
          </p>
          <button className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" /> New post
          </button>
        </div>
      </aside>
    </div>
  );
}

/* ---------- JOBS ---------- */
function JobsView() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {jobs.map((j) => (
        <div key={j.id} className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] transition-all hover:border-primary/40">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold">{j.title}</h3>
              <p className="text-xs text-muted-foreground">{j.org}</p>
            </div>
            <span className="rounded-full bg-secondary/20 px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
              {j.type}
            </span>
          </div>
          <div className="mt-3 grid gap-1.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {j.location}</span>
            <span className="inline-flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" /> {j.pay}</span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <button className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <Phone className="h-4 w-4" /> {j.contact}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
