import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export const Route = createFileRoute("/experience")({
  head: () => ({
    meta: [
      { title: "Experience — Portfolio" },
      { name: "description", content: "Work history and roles." },
    ],
  }),
  component: ExperiencePage,
});

function ExperiencePage() {
  const { data } = useQuery({
    queryKey: ["experience"],
    queryFn: async () => (await supabase.from("experience").select("*").order("sort_order")).data ?? [],
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <ScrollReveal animation="fade-in" duration={500}>
        <p className="text-sm font-medium text-google-green">Experience</p>
        <h1 className="mt-1 font-display text-4xl font-semibold sm:text-5xl">Where I've worked</h1>
      </ScrollReveal>

      <ol className="relative mt-12 border-l-2 border-dashed pl-6">
        {(data ?? []).map((e: any, i) => {
          const colors = ["google-blue", "google-red", "google-yellow", "google-green"] as const;
          const c = colors[i % 4];
          return (
            <li key={e.id} className="relative mb-10">
              <span className="absolute -left-[33px] top-1 inline-block h-4 w-4 rounded-full border-4 border-background" style={{ background: `var(--${c})` }} />
              <ScrollReveal animation="slide-up" duration={700} delay={i * 50}>
                <div className="rounded-2xl border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-md-google">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-display text-lg font-semibold">{e.role}</h3>
                    <span className="text-sm text-muted-foreground">{e.start_date} — {e.end_date || "Present"}</span>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">{e.company}</p>
                  <p className="mt-2 text-sm">{e.description}</p>
                </div>
              </ScrollReveal>
            </li>
          );
        })}
        {(!data || data.length === 0) && (
          <p className="text-sm text-muted-foreground">No experience entries yet.</p>
        )}
      </ol>
    </div>
  );
}
