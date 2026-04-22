import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import {
  MapPin, Newspaper, Briefcase, ArrowRight, Heart,
  ShieldCheck, Users, Sparkles, Building2,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Haven — Find help. Share hope. Rebuild life." },
      { name: "description", content: "Haven connects people experiencing homelessness with nearby shelters, food, and jobs — and helps NGOs share real-time updates." },
      { property: "og:title", content: "Haven — Find help. Share hope. Rebuild life." },
      { property: "og:description", content: "A simple, accessible platform connecting people in need with nearby help and opportunities." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 0%, oklch(0.65 0.15 250 / 0.18), transparent 45%), radial-gradient(circle at 90% 20%, oklch(0.78 0.16 65 / 0.15), transparent 45%)",
          }}
        />
        <div className="mx-auto grid max-w-6xl gap-12 px-4 pb-20 pt-16 lg:grid-cols-[1.1fr_1fr] lg:pt-24">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-secondary" /> Built for everyone, free to use
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Help is closer than{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                you think.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Haven connects people in need with nearby shelters, hot meals, and short-term work —
              and gives NGOs and volunteers one place to share updates that reach the right people instantly.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/signup"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:-translate-y-0.5"
              >
                Find help <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/signup"
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-semibold text-foreground hover:bg-accent"
              >
                <Building2 className="h-4 w-4" /> Join as organization
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-xs text-muted-foreground">
              <Stat n="120+" l="Partner NGOs" />
              <div className="h-8 w-px bg-border" />
              <Stat n="3,400" l="People helped" />
              <div className="h-8 w-px bg-border" />
              <Stat n="24/7" l="Live updates" />
            </div>
          </div>

          {/* Hero card mock */}
          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 blur-2xl" />
            <div className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Nearby help · 1.2 km</span>
                <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">LIVE</span>
              </div>
              <div className="mt-4 grid gap-3">
                <MiniCard icon={<MapPin className="h-4 w-4" />} title="Sunrise Night Shelter" sub="12 beds open · opens 6pm" tag="Available" tagClass="bg-success/15 text-success" />
                <MiniCard icon={<Heart className="h-4 w-4" />} title="Hope Kitchen" sub="Hot dinner until 9pm" tag="Open" tagClass="bg-primary-soft text-primary" />
                <MiniCard icon={<Briefcase className="h-4 w-4" />} title="Warehouse helper · today" sub="$18/hr · cash daily" tag="Hiring" tagClass="bg-secondary/20 text-secondary-foreground" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="border-t border-border/60 bg-muted/40">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            The information gap costs lives.
          </h2>
          <p className="mt-4 text-muted-foreground">
            People sleeping rough rarely know which shelter has open beds tonight, where the next meal is, or
            who's hiring for a day's work. NGOs post updates on scattered channels that never reach the people
            who need them. Haven brings everything into one simple, accessible place.
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-12 max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight">Everything in one place</h2>
          <p className="mt-3 text-muted-foreground">
            Three simple tools — designed to be used on the smallest, oldest phone with the slowest connection.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          <Feature
            icon={<MapPin className="h-5 w-5" />}
            title="Nearby help map"
            desc="Find shelters, food, and clinics with live availability — Available, Full, or Closed."
          />
          <Feature
            icon={<Newspaper className="h-5 w-5" />}
            title="Resource feed"
            desc="NGOs and volunteers post real-time updates. People mark posts as helpful so the best info rises."
          />
          <Feature
            icon={<Briefcase className="h-5 w-5" />}
            title="Job board"
            desc="Local employers post short-term and daily work. One tap to call or message."
          />
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="border-y border-border/60 bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-3xl font-semibold tracking-tight">How Haven works</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <Step n="1" title="Open Haven" desc="No documents, no judgment. Sign up with a name and phone number — both optional." />
            <Step n="2" title="See what's nearby" desc="Map and feed show what's open right now within walking distance." />
            <Step n="3" title="Get there & get help" desc="Tap to call, get directions, or apply for a job in seconds." />
          </div>
        </div>
      </section>

      {/* JOIN */}
      <section id="join" className="mx-auto max-w-6xl px-4 py-20">
        <div className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary to-primary/70 p-10 shadow-[var(--shadow-glow)] sm:p-14">
          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div className="text-primary-foreground">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                For NGOs, shelters & employers
              </h2>
              <p className="mt-3 max-w-xl text-primary-foreground/85">
                Reach the people who need you most. Post updates, manage availability, and offer
                opportunities — all from a single dashboard, free forever for nonprofits.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/signup"
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-secondary px-5 text-sm font-semibold text-secondary-foreground shadow-sm hover:opacity-95"
                >
                  Join as organization <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex h-11 items-center rounded-xl border border-primary-foreground/30 bg-primary-foreground/10 px-5 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/20"
                >
                  Sign in
                </Link>
              </div>
            </div>
            <div className="grid gap-3">
              <Perk icon={<Users className="h-4 w-4" />} text="Reach people in your area instantly" />
              <Perk icon={<ShieldCheck className="h-4 w-4" />} text="Verified organization profiles" />
              <Perk icon={<Sparkles className="h-4 w-4" />} text="Free for nonprofits, forever" />
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Haven · Find help. Share hope. Rebuild life.</p>
          <p>Made with care for our community.</p>
        </div>
      </footer>
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="text-lg font-semibold text-foreground">{n}</div>
      <div>{l}</div>
    </div>
  );
}

function MiniCard({ icon, title, sub, tag, tagClass }: { icon: React.ReactNode; title: string; sub: string; tag: string; tagClass: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">{icon}</div>
      <div className="flex-1">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${tagClass}`}>{tag}</span>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="group rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:border-primary/40">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">{icon}</div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{n}</div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function Perk({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-primary-foreground/20 bg-primary-foreground/10 p-3 text-sm text-primary-foreground">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-foreground/20">{icon}</div>
      {text}
    </div>
  );
}
