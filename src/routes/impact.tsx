import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Award, Newspaper, MapPin, Briefcase, ThumbsUp, ShieldCheck, Trophy, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      { title: "Your Impact — Haven" },
      { name: "description", content: "See the lives you've touched and earn badges as you help your community." },
    ],
  }),
  component: ImpactPage,
});

type Stats = {
  user_id: string;
  name: string | null;
  org_name: string | null;
  verified: boolean;
  posts_count: number;
  resources_count: number;
  jobs_count: number;
  helpful_received: number;
};

function ImpactPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [me, setMe] = useState<Stats | null>(null);
  const [board, setBoard] = useState<Stats[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [loading, user, navigate]);

  useEffect(() => {
    (async () => {
      if (!user) return;
      const [{ data: mine }, { data: top }] = await Promise.all([
        supabase.from("user_impact").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("user_impact").select("*").order("helpful_received", { ascending: false }).limit(10),
      ]);
      setMe((mine as Stats | null) ?? null);
      setBoard((top as Stats[]) ?? []);
      setBusy(false);
    })();
  }, [user]);

  if (loading || !user) return <div className="grid min-h-screen place-items-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const totalActions = me ? me.posts_count + me.resources_count + me.jobs_count : 0;
  const badges = computeBadges(me, totalActions);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/"><Logo /></Link>
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-accent">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary via-primary to-primary/70 p-8 text-primary-foreground shadow-[var(--shadow-glow)]">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-secondary/30 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-sm opacity-90">
              <Trophy className="h-4 w-4" /> Your Impact
              {me?.verified && <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold"><ShieldCheck className="h-3 w-3" /> Verified</span>}
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">{me?.org_name || me?.name || "Welcome"}</h1>
            <p className="mt-1 text-sm opacity-80">Every action you take helps someone find their footing.</p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat icon={Newspaper} label="Posts" value={me?.posts_count ?? 0} />
              <Stat icon={MapPin} label="Resources" value={me?.resources_count ?? 0} />
              <Stat icon={Briefcase} label="Jobs" value={me?.jobs_count ?? 0} />
              <Stat icon={ThumbsUp} label="Helpful votes" value={me?.helpful_received ?? 0} />
            </div>
          </div>
        </div>

        {/* Badges */}
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">Badges earned</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {badges.map((b) => (
              <div key={b.title} className={`group relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)] transition-all ${b.unlocked ? "" : "opacity-50"}`}>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${b.unlocked ? "bg-gradient-to-br from-primary to-secondary text-white" : "bg-muted text-muted-foreground"}`}>
                  <Award className="h-6 w-6" />
                </div>
                <div className="mt-3 text-sm font-semibold">{b.title}</div>
                <div className="text-xs text-muted-foreground">{b.text}</div>
                {b.unlocked && <div className="absolute right-3 top-3 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">Unlocked</div>}
              </div>
            ))}
          </div>
        </section>

        {/* Leaderboard */}
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">Top helpers this week</h2>
          {busy ? (
            <div className="grid place-items-center rounded-xl border border-dashed border-border p-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]">
              {board.map((row, i) => (
                <div key={row.user_id} className={`flex items-center gap-3 p-4 ${i !== board.length - 1 ? "border-b border-border" : ""} ${row.user_id === user.id ? "bg-primary-soft" : ""}`}>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${i === 0 ? "bg-secondary text-secondary-foreground" : i < 3 ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 text-sm font-semibold">
                      {row.org_name || row.name || "Anonymous"}
                      {row.verified && <ShieldCheck className="h-3.5 w-3.5 text-primary" />}
                    </div>
                    <div className="text-xs text-muted-foreground">{row.posts_count + row.resources_count + row.jobs_count} actions</div>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                    <ThumbsUp className="h-4 w-4" /> {row.helpful_received}
                  </div>
                </div>
              ))}
              {board.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">Be the first to make an impact 💛</div>}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Newspaper; label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white/15 p-3 backdrop-blur">
      <Icon className="h-4 w-4 opacity-80" />
      <div className="mt-1 text-2xl font-bold">{value}</div>
      <div className="text-[11px] uppercase tracking-wide opacity-80">{label}</div>
    </div>
  );
}

function computeBadges(me: Stats | null, total: number) {
  return [
    { title: "First Step", text: "Take your first action.", unlocked: total >= 1 },
    { title: "Helping Hand", text: "Reach 5 contributions.", unlocked: total >= 5 },
    { title: "Community Hero", text: "Reach 25 contributions.", unlocked: total >= 25 },
    { title: "Lifeline", text: "Receive 10 helpful votes.", unlocked: (me?.helpful_received ?? 0) >= 10 },
  ];
}
