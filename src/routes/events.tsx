import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, MapPin, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events & Talks — Portfolio" },
      { name: "description", content: "GDG events, conference talks and meetups." },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const { data } = useQuery({
    queryKey: ["events"],
    queryFn: async () => (await supabase.from("events").select("*").order("event_date", { ascending: false })).data ?? [],
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="text-sm font-medium text-google-yellow">Events & Talks</p>
      <h1 className="mt-1 font-display text-4xl font-semibold sm:text-5xl">Speaking & community</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">Talks, workshops, and GDG events I've organized or spoken at.</p>

      <div className="mt-10 grid gap-4">
        {(data ?? []).map((e: any) => (
          <article key={e.id} className="rounded-2xl border bg-card p-5 shadow-soft transition hover:shadow-md-google">
            <h3 className="font-display text-lg font-semibold">{e.title}</h3>
            <p className="text-sm font-medium text-google-blue">{e.event_name}</p>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {e.event_date}</span>
              {e.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {e.location}</span>}
              {e.link && <a href={e.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-google-blue hover:underline"><ExternalLink className="h-3.5 w-3.5" /> Link</a>}
            </div>
            {e.description && <p className="mt-3 text-sm">{e.description}</p>}
          </article>
        ))}
        {(!data || data.length === 0) && (
          <p className="text-sm text-muted-foreground">No events yet.</p>
        )}
      </div>
    </div>
  );
}
