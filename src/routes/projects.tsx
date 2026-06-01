import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, Github, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { ScrollReveal, ScrollStagger } from "@/components/ui/ScrollReveal";

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
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ["projects"],
    queryFn: async () =>
      (await supabase.from("projects").select("*").order("featured", { ascending: false }).order("sort_order")).data ?? [],
  });

  // Extract all unique tags dynamically
  const allTags = useMemo(() => {
    if (!data) return [];
    const tagsSet = new Set<string>();
    data.forEach((p) => {
      if (Array.isArray(p.tags)) {
        p.tags.forEach((t) => {
          if (t && t.trim()) tagsSet.add(t.trim());
        });
      }
    });
    return Array.from(tagsSet).sort();
  }, [data]);

  // Filter projects based on search query and selected tag
  const filteredProjects = useMemo(() => {
    if (!data) return [];
    return data.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        (Array.isArray(p.tags) && p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));
      
      const matchesTag = !selectedTag || (Array.isArray(p.tags) && p.tags.includes(selectedTag));

      return matchesSearch && matchesTag;
    });
  }, [data, search, selectedTag]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <ScrollReveal animation="fade-in" duration={500}>
        <p className="text-sm font-medium text-google-blue">Projects</p>
        <h1 className="mt-1 font-display text-4xl font-semibold sm:text-5xl">Things I've built</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">A growing collection of side projects, open-source work and community tools.</p>
      </ScrollReveal>

      {/* Search and Filter Section */}
      <ScrollReveal animation="slide-up" duration={600} delay={150} className="mt-8 space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects by title, tech stack..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border bg-background pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-google-blue transition-all"
          />
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
            <span className="text-muted-foreground mr-1.5 font-medium">Filter:</span>
            <button
              onClick={() => setSelectedTag(null)}
              className={`rounded-full px-3 py-1 transition-all ${
                !selectedTag
                  ? "bg-foreground text-background font-medium"
                  : "bg-secondary hover:bg-secondary/80 text-muted-foreground"
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={`rounded-full px-3 py-1 transition-all ${
                  tag === selectedTag
                    ? "bg-google-blue text-white font-medium"
                    : "bg-secondary hover:bg-secondary/80 text-muted-foreground"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </ScrollReveal>

      {/* Projects Grid */}
      <div className="mt-10">
        {filteredProjects.length > 0 ? (
          <ScrollStagger
            animation="slide-up"
            baseDelay={200}
            interval={80}
            className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredProjects.map((p: any, i) => {
              const c = COLORS[i % 4];
              return (
                <article
                  key={p.id}
                  className="group flex flex-col rounded-2xl border bg-card p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-md-google"
                >
                  <div className="h-1.5 w-12 rounded-full" style={{ background: `var(--${c})` }} />
                  <h3 className="mt-4 font-display text-lg font-semibold">{p.title}</h3>
                  <p className="mt-1 flex-1 text-sm text-muted-foreground leading-relaxed">{p.description}</p>
                  
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {(p.tags ?? []).map((t: string) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTag(t === selectedTag ? null : t)}
                        className={`rounded-full px-2 py-0.5 text-xs transition-colors ${
                          t === selectedTag
                            ? "bg-google-blue/15 text-google-blue font-medium"
                            : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center gap-3 text-sm pt-2 border-t border-border/40">
                    {p.link && (
                      <a
                        href={p.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-google-blue hover:underline font-medium"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Live demo
                      </a>
                    )}
                    {p.repo && (
                      <a
                        href={p.repo}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-foreground hover:underline font-medium"
                      >
                        <Github className="h-3.5 w-3.5" /> Repository
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </ScrollStagger>
        ) : (
          <ScrollReveal animation="fade-in" className="text-center py-12">
            <p className="text-muted-foreground">No projects found matching the criteria.</p>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}
