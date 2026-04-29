import { useState } from "react";
import { ShieldAlert, Phone, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function SOSButton() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  async function sendSOS() {
    if (!user) return toast.error("Sign in to send an SOS");
    setSending(true);
    let coords: { latitude: number; longitude: number } | null = null;
    try {
      coords = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(
          (p) => res({ latitude: p.coords.latitude, longitude: p.coords.longitude }),
          (e) => rej(e),
          { timeout: 6000 }
        )
      );
    } catch {
      // location optional
    }

    const { error } = await supabase.from("sos_alerts").insert({
      user_id: user.id,
      latitude: coords?.latitude ?? null,
      longitude: coords?.longitude ?? null,
      message: message.trim() || null,
    });
    setSending(false);
    if (error) return toast.error(error.message);
    toast.success("🚨 SOS sent. Nearby NGOs notified.");
    setOpen(false);
    setMessage("");
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Emergency SOS"
        className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-[0_10px_40px_-8px_oklch(0.6_0.22_27/0.6)] ring-4 ring-destructive/20 transition-all hover:scale-110 active:scale-95"
      >
        <span className="absolute h-full w-full animate-ping rounded-full bg-destructive opacity-30" />
        <ShieldAlert className="relative h-7 w-7" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold">Emergency SOS</h2>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>

            <p className="mt-3 text-sm text-muted-foreground">
              We'll share your location with nearby verified NGOs. For life-threatening emergencies, also call your local number below.
            </p>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 280))}
              placeholder="What's happening? (optional)"
              className="mt-4 min-h-20 w-full rounded-lg border border-input bg-background p-3 text-sm outline-none focus:border-primary"
            />

            <button
              onClick={sendSOS}
              disabled={sending}
              className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-destructive text-base font-semibold text-destructive-foreground shadow-lg hover:bg-destructive/90 disabled:opacity-60"
            >
              {sending ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : <><ShieldAlert className="h-5 w-5" /> Send SOS now</>}
            </button>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { label: "US", num: "911" },
                { label: "EU", num: "112" },
                { label: "India", num: "112" },
              ].map((c) => (
                <a key={c.label} href={`tel:${c.num}`} className="flex flex-col items-center rounded-lg border border-border bg-background p-2 text-xs hover:border-destructive">
                  <Phone className="h-4 w-4 text-destructive" />
                  <span className="mt-1 font-semibold">{c.num}</span>
                  <span className="text-muted-foreground">{c.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
