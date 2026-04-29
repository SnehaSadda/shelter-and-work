import { ShieldCheck, Lock, Eye, Heart } from "lucide-react";

export function TrustPanel() {
  const items = [
    { icon: ShieldCheck, title: "Verified NGOs", text: "Organizations are reviewed before posting resources." },
    { icon: Lock, title: "End-to-end secure", text: "All data is encrypted in transit and at rest." },
    { icon: Eye, title: "You control privacy", text: "Your location is only shared when you tap SOS." },
    { icon: Heart, title: "Always free", text: "Haven is free for people seeking help — forever." },
  ];
  return (
    <div className="rounded-2xl border border-border bg-gradient-to-br from-primary-soft via-card to-card p-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-semibold">Trust & Safety</h3>
      </div>
      <ul className="mt-3 grid gap-3">
        {items.map((it) => (
          <li key={it.title} className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background">
              <it.icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-xs font-semibold">{it.title}</div>
              <div className="text-xs text-muted-foreground">{it.text}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
