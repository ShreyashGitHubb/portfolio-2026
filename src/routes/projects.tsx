import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, Github } from "lucide-react";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Portfolio" },
      { name: "description", content: "Selected projects and open source work." },
    ],
  }),
  component: ProjectsPage,
});

const COLORS = ["google-blue", "google-red", "google-yellow", "google-green"] as const;

function ProjectsPage() {
  const { data } = useQuery({
    queryKey: ["projects"],
    queryFn: async () =>
      (await supabase.from("projects").select("*").order("featured", { ascending: false }).order("sort_order")).data ?? [],
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="text-sm font-medium text-google-blue">Projects</p>
      <h1 className="mt-1 font-display text-4xl font-semibold sm:text-5xl">Things I've built</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">A growing collection of side projects, open-source work and community tools.</p>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).map((p: any, i) => {
          const c = COLORS[i % 4];
          return (
            <article key={p.id} className="group flex flex-col rounded-2xl border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-md-google">
              <div className="h-1.5 w-12 rounded-full" style={{ background: `var(--${c})` }} />
              <h3 className="mt-4 font-display text-lg font-semibold">{p.title}</h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{p.description}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {(p.tags ?? []).map((t: string) => (
                  <span key={t} className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">{t}</span>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3 text-sm">
                {p.link && (
                  <a href={p.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-google-blue hover:underline">
                    <ExternalLink className="h-3.5 w-3.5" /> Live
                  </a>
                )}
                {p.repo && (
                  <a href={p.repo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-foreground hover:underline">
                    <Github className="h-3.5 w-3.5" /> Code
                  </a>
                )}
              </div>
            </article>
          );
        })}
        {(!data || data.length === 0) && (
          <p className="col-span-full text-center text-sm text-muted-foreground">No projects yet.</p>
        )}
      </div>
    </div>
  );
}
