import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/services/auth";
import { getAll, createRecord, deleteRecord } from "@/services/db";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import {
  MapPin, Newspaper, Briefcase, Heart, Phone, Clock, Bed, Utensils,
  Stethoscope, Shirt, ThumbsUp, LogOut, Plus, Search, Trash2, Loader2, Trophy,
} from "lucide-react";
import { LiveMap } from "@/components/LiveMap";
import { SOSButton } from "@/components/SOSButton";
import { HavenAssistant } from "@/components/HavenAssistant";
import { TrustPanel } from "@/components/TrustPanel";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useRealtimeAlerts } from "@/hooks/useRealtimeAlerts";

type Resource = Database["public"]["Tables"]["resources"]["Row"];
type FeedPost = Database["public"]["Tables"]["feed_posts"]["Row"];
type Job = Database["public"]["Tables"]["jobs"]["Row"];

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
  const { user, loading, isNgo, isEmployer } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("map");
  useRealtimeAlerts();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/"><Logo /></Link>
          <div className="flex items-center gap-2">
            <Link
              to="/impact"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm text-foreground hover:bg-accent"
            >
              <Trophy className="h-4 w-4 text-secondary" /> <span className="hidden sm:inline">Impact</span>
            </Link>
            <ThemeToggle />
            <button
              onClick={handleSignOut}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm text-foreground hover:bg-accent"
            >
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Hello, friend 👋</h1>
          <p className="text-sm text-muted-foreground">
            {isNgo ? "Share resources to help your community." : isEmployer ? "Post jobs to give people opportunity." : "Here's what's available near you today."}
          </p>
        </div>

        <div className="mb-6 inline-flex w-full rounded-xl border border-border bg-card p-1 shadow-[var(--shadow-soft)] sm:w-auto">
          <TabButton active={tab === "map"} onClick={() => setTab("map")} icon={<MapPin className="h-4 w-4" />} label="Resources" />
          <TabButton active={tab === "feed"} onClick={() => setTab("feed")} icon={<Newspaper className="h-4 w-4" />} label="Feed" />
          <TabButton active={tab === "jobs"} onClick={() => setTab("jobs")} icon={<Briefcase className="h-4 w-4" />} label="Jobs" />
        </div>

        {tab === "map" && <ResourcesView />}
        {tab === "feed" && <FeedView />}
        {tab === "jobs" && <JobsView />}
      </main>

      <SOSButton />
      <HavenAssistant />
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

/* ---------- RESOURCES ---------- */
function ResourcesView() {
  const { user, isNgo } = useAuth();
  const [items, setItems] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await getAll("resources", {
      filters: typeFilter ? { type: typeFilter as Resource["type"] } : undefined,
      search: search ? { column: "name", query: search } : undefined,
      orderBy: { column: "created_at", ascending: false },
      pageSize: 100,
    });
    setItems(data);
    setLoading(false);
  }, [search, typeFilter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <div className="grid gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resources…"
              className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 rounded-lg border border-input bg-card px-3 text-sm"
          >
            <option value="">All types</option>
            <option value="shelter">Shelter</option>
            <option value="food">Food</option>
            <option value="medical">Medical</option>
            <option value="clothing">Clothing</option>
          </select>
          {isNgo && (
            <button
              onClick={() => setShowForm((v) => !v)}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          )}
        </div>

        {showForm && isNgo && user && (
          <ResourceForm
            ownerId={user.id}
            onDone={() => { setShowForm(false); load(); }}
          />
        )}

        {loading ? (
          <EmptyState icon={<Loader2 className="h-5 w-5 animate-spin" />} text="Loading…" />
        ) : items.length === 0 ? (
          <EmptyState icon={<MapPin className="h-5 w-5" />} text="No resources yet. Check back soon." />
        ) : (
          items.map((r) => (
            <ResourceCard key={r.id} r={r} canDelete={user?.id === r.owner_id} onDeleted={load} />
          ))
        )}
      </div>

      <MapPanel count={items.length} />
    </div>
  );
}

function MapPanel({ count }: { count: number }) {
  return (
    <div className="relative h-[420px] overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)] lg:sticky lg:top-24">
      <div className="absolute inset-0" style={{
        backgroundImage:
          "radial-gradient(circle at 30% 40%, oklch(0.65 0.15 250 / 0.18), transparent 50%), radial-gradient(circle at 70% 60%, oklch(0.78 0.16 65 / 0.15), transparent 50%), linear-gradient(135deg, var(--color-primary-soft), var(--color-background))",
      }} />
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage:
          "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }} />
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl border border-border bg-background/90 p-3 backdrop-blur">
        <div className="flex items-center gap-2 text-sm">
          <Navigation className="h-4 w-4 text-primary" />
          <span className="font-medium">{count} place{count === 1 ? "" : "s"} nearby</span>
        </div>
      </div>
    </div>
  );
}

const resourceSchema = z.object({
  name: z.string().trim().min(2).max(120),
  type: z.enum(["shelter", "food", "medical", "clothing"]),
  status: z.enum(["available", "full", "closed"]),
  address: z.string().trim().min(2).max(200),
  hours: z.string().trim().max(80).optional(),
  capacity: z.string().trim().max(80).optional(),
});

function ResourceForm({ ownerId, onDone }: { ownerId: string; onDone: () => void }) {
  const [form, setForm] = useState({ name: "", type: "shelter", status: "available", address: "", hours: "", capacity: "" });
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = resourceSchema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setBusy(true);
    const { error } = await createRecord("resources", { ...parsed.data, owner_id: ownerId });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Resource added");
    onDone();
  }

  return (
    <form onSubmit={submit} className="grid gap-2 rounded-xl border border-border bg-card p-4">
      <input className="h-10 rounded-lg border border-input bg-background px-3 text-sm" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input className="h-10 rounded-lg border border-input bg-background px-3 text-sm" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
      <div className="grid grid-cols-2 gap-2">
        <select className="h-10 rounded-lg border border-input bg-background px-2 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="shelter">Shelter</option><option value="food">Food</option><option value="medical">Medical</option><option value="clothing">Clothing</option>
        </select>
        <select className="h-10 rounded-lg border border-input bg-background px-2 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="available">Available</option><option value="full">Full</option><option value="closed">Closed</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input className="h-10 rounded-lg border border-input bg-background px-3 text-sm" placeholder="Hours (e.g. 8am–8pm)" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} />
        <input className="h-10 rounded-lg border border-input bg-background px-3 text-sm" placeholder="Capacity (optional)" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
      </div>
      <button disabled={busy} className="mt-1 h-10 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
        {busy ? "Saving…" : "Save resource"}
      </button>
    </form>
  );
}

function ResourceCard({ r, canDelete, onDeleted }: { r: Resource; canDelete: boolean; onDeleted: () => void }) {
  const Icon = r.type === "shelter" ? Bed : r.type === "food" ? Utensils : r.type === "medical" ? Stethoscope : Shirt;
  const statusStyles = {
    available: "bg-success/15 text-success",
    full: "bg-warning/20 text-warning-foreground",
    closed: "bg-muted text-muted-foreground",
  }[r.status];
  const statusLabel = { available: "Available", full: "Full", closed: "Closed" }[r.status];

  async function del() {
    if (!confirm(`Delete "${r.name}"?`)) return;
    const { error } = await deleteRecord("resources", r.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    onDeleted();
  }

  return (
    <div className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-soft)] transition-all hover:border-primary/40">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold">{r.name}</h3>
            <p className="text-xs text-muted-foreground">{r.address}</p>
          </div>
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusStyles}`}>{statusLabel}</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {r.hours && <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {r.hours}</span>}
          {r.capacity && <span>· {r.capacity}</span>}
        </div>
      </div>
      {canDelete && (
        <button onClick={del} className="text-muted-foreground hover:text-destructive" aria-label="Delete">
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

/* ---------- FEED ---------- */
function FeedView() {
  const { user, isNgo } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [myVotes, setMyVotes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await getAll("feed_posts", {
      orderBy: { column: "created_at", ascending: false },
      pageSize: 50,
    });
    setPosts(data);

    if (data.length) {
      const ids = data.map((p) => p.id);
      const { data: votes } = await supabase
        .from("post_helpful")
        .select("post_id, user_id")
        .in("post_id", ids);
      const c: Record<string, number> = {};
      const mine = new Set<string>();
      (votes ?? []).forEach((v) => {
        c[v.post_id] = (c[v.post_id] ?? 0) + 1;
        if (user && v.user_id === user.id) mine.add(v.post_id);
      });
      setCounts(c);
      setMyVotes(mine);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  async function toggleVote(postId: string) {
    if (!user) return;
    if (myVotes.has(postId)) {
      await supabase.from("post_helpful").delete().eq("post_id", postId).eq("user_id", user.id);
      setMyVotes((s) => { const n = new Set(s); n.delete(postId); return n; });
      setCounts((c) => ({ ...c, [postId]: Math.max(0, (c[postId] ?? 1) - 1) }));
    } else {
      const { error } = await supabase.from("post_helpful").insert({ post_id: postId, user_id: user.id });
      if (error) return toast.error(error.message);
      setMyVotes((s) => new Set(s).add(postId));
      setCounts((c) => ({ ...c, [postId]: (c[postId] ?? 0) + 1 }));
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="grid gap-4">
        {isNgo && (
          <div>
            <button
              onClick={() => setShowForm((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" /> New post
            </button>
          </div>
        )}
        {showForm && user && (
          <FeedForm authorId={user.id} onDone={() => { setShowForm(false); load(); }} />
        )}

        {loading ? <EmptyState icon={<Loader2 className="h-5 w-5 animate-spin" />} text="Loading…" />
          : posts.length === 0 ? <EmptyState icon={<Newspaper className="h-5 w-5" />} text="No posts yet." />
          : posts.map((p) => {
              const isHelpful = myVotes.has(p.id);
              return (
                <article key={p.id} className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-sm font-semibold text-primary-foreground">
                      {p.title[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="flex-1">
                      <span className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <h3 className="mt-3 text-base font-semibold">{p.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{p.body}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => toggleVote(p.id)}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                        isHelpful ? "border-primary bg-primary-soft text-primary" : "border-border bg-card text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" /> Helpful · {counts[p.id] ?? 0}
                    </button>
                    {p.author_id === user?.id && (
                      <button
                        onClick={async () => {
                          if (!confirm("Delete this post?")) return;
                          const { error } = await deleteRecord("feed_posts", p.id);
                          if (error) return toast.error(error.message);
                          load();
                        }}
                        className="ml-auto text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
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
            {isNgo ? "Post resources to reach people who need them most." : "Sign up as an NGO to share updates."}
          </p>
        </div>
      </aside>
    </div>
  );
}

const feedSchema = z.object({
  title: z.string().trim().min(3).max(120),
  body: z.string().trim().min(5).max(2000),
});

function FeedForm({ authorId, onDone }: { authorId: string; onDone: () => void }) {
  const [form, setForm] = useState({ title: "", body: "" });
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = feedSchema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setBusy(true);
    const { error } = await createRecord("feed_posts", { ...parsed.data, author_id: authorId });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Posted");
    onDone();
  }
  return (
    <form onSubmit={submit} className="grid gap-2 rounded-xl border border-border bg-card p-4">
      <input className="h-10 rounded-lg border border-input bg-background px-3 text-sm" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <textarea className="min-h-24 rounded-lg border border-input bg-background p-3 text-sm" placeholder="Share an update…" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
      <button disabled={busy} className="h-10 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
        {busy ? "Posting…" : "Post"}
      </button>
    </form>
  );
}

/* ---------- JOBS ---------- */
function JobsView() {
  const { user, isEmployer } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await getAll("jobs", {
      filters: { active: true },
      search: search ? { column: "title", query: search } : undefined,
      orderBy: { column: "created_at", ascending: false },
    });
    setJobs(data);
    setLoading(false);
  }, [search]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs…"
            className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        {isEmployer && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Post a job
          </button>
        )}
      </div>

      {showForm && user && (
        <JobForm employerId={user.id} onDone={() => { setShowForm(false); load(); }} />
      )}

      {loading ? <EmptyState icon={<Loader2 className="h-5 w-5 animate-spin" />} text="Loading…" />
        : jobs.length === 0 ? <EmptyState icon={<Briefcase className="h-5 w-5" />} text="No open jobs right now." />
        : (
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
                {j.description && <p className="mt-2 text-xs text-muted-foreground">{j.description}</p>}
                <div className="mt-4 flex items-center gap-2">
                  <a
                    href={`tel:${j.contact}`}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    <Phone className="h-4 w-4" /> {j.contact}
                  </a>
                  {j.employer_id === user?.id && (
                    <button
                      onClick={async () => {
                        if (!confirm("Delete this job?")) return;
                        const { error } = await deleteRecord("jobs", j.id);
                        if (error) return toast.error(error.message);
                        load();
                      }}
                      className="rounded-lg border border-border p-2 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

const jobSchema = z.object({
  title: z.string().trim().min(2).max(120),
  org: z.string().trim().min(2).max(120),
  type: z.enum(["daily", "short-term", "part-time", "full-time"]),
  location: z.string().trim().min(2).max(120),
  pay: z.string().trim().min(1).max(80),
  contact: z.string().trim().min(5).max(80),
  description: z.string().trim().max(1000).optional(),
});

function JobForm({ employerId, onDone }: { employerId: string; onDone: () => void }) {
  const [form, setForm] = useState({ title: "", org: "", type: "daily", location: "", pay: "", contact: "", description: "" });
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = jobSchema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setBusy(true);
    const { error } = await createRecord("jobs", { ...parsed.data, employer_id: employerId });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Job posted");
    onDone();
  }
  return (
    <form onSubmit={submit} className="grid gap-2 rounded-xl border border-border bg-card p-4">
      <div className="grid grid-cols-2 gap-2">
        <input className="h-10 rounded-lg border border-input bg-background px-3 text-sm" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input className="h-10 rounded-lg border border-input bg-background px-3 text-sm" placeholder="Organization" value={form.org} onChange={(e) => setForm({ ...form, org: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <select className="h-10 rounded-lg border border-input bg-background px-2 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="daily">Daily</option><option value="short-term">Short-term</option><option value="part-time">Part-time</option><option value="full-time">Full-time</option>
        </select>
        <input className="h-10 rounded-lg border border-input bg-background px-3 text-sm" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input className="h-10 rounded-lg border border-input bg-background px-3 text-sm" placeholder="Pay (e.g. $80/day)" value={form.pay} onChange={(e) => setForm({ ...form, pay: e.target.value })} />
        <input className="h-10 rounded-lg border border-input bg-background px-3 text-sm" placeholder="Contact (phone)" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
      </div>
      <textarea className="min-h-20 rounded-lg border border-input bg-background p-3 text-sm" placeholder="Short description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <button disabled={busy} className="h-10 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
        {busy ? "Saving…" : "Post job"}
      </button>
    </form>
  );
}

/* ---------- shared ---------- */
function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card p-8 text-sm text-muted-foreground">
      {icon} {text}
    </div>
  );
}
