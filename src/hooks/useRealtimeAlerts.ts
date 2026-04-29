import { useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Newspaper, Briefcase, MapPin } from "lucide-react";
import { createElement } from "react";

/** Subscribes to live inserts on key tables and shows toasts. */
export function useRealtimeAlerts() {
  useEffect(() => {
    const ch = supabase
      .channel("haven-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "feed_posts" }, (p) => {
        const row = p.new as { title?: string };
        toast("New community update", {
          description: row.title ?? "Open the Feed to see it",
          icon: createElement(Newspaper, { className: "h-4 w-4" }),
        });
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "jobs" }, (p) => {
        const row = p.new as { title?: string };
        toast("New job posted", {
          description: row.title ?? "Open Jobs to apply",
          icon: createElement(Briefcase, { className: "h-4 w-4" }),
        });
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "resources" }, (p) => {
        const row = p.new as { name?: string };
        toast("New resource added", {
          description: row.name ?? "Open Resources to view",
          icon: createElement(MapPin, { className: "h-4 w-4" }),
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);
}
