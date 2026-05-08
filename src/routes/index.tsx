import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GdgLogo } from "@/components/GdgLogo";
import { ArrowRight, Sparkles, Code2, Users } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Portfolio · GDG Developer" },
      { name: "description", content: "Developer portfolio inspired by Google Developer Groups." },
      { property: "og:title", content: "Portfolio · GDG Developer" },
      { property: "og:description", content: "Developer portfolio inspired by Google Developer Groups." },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await supabase.from("profile").select("*").limit(1).maybeSingle();
      return data;
    },
  });
  const { data: projects } = useQuery({
    queryKey: ["projects-featured"],
    queryFn: async () => {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .order("featured", { ascending: false })
        .order("sort_order")
        .limit(3);
      return data ?? [];
    },
  });

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="dot-grid absolute inset-0 opacity-50" aria-hidden />
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-google-blue/20 blur-3xl" aria-hidden />
        <div className="absolute -right-20 top-20 h-72 w-72 rounded-full bg-google-red/15 blur-3xl" aria-hidden />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-google-yellow/20 blur-3xl" aria-hidden />

        <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-20 sm:px-6 sm:pt-28">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">
            <GdgLogo size={14} />
            <span>Google Developer Group · Community</span>
          </div>
          <h1 className="mt-6 max-w-3xl font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            Hi, I'm <span className="text-gradient-google">{profile?.name || "Your Name"}</span>.
            <br />
            <span className="text-foreground/80">I build with the </span>
            <span className="underline-google">web</span>
            <span className="text-foreground/80"> & ship with </span>
            <span className="underline-google">community</span>
            <span className="text-foreground/80">.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            {profile?.tagline || "Building for the web, organizing for the community."}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background shadow-md-google transition hover:opacity-90"
            >
              View my work <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border bg-background px-5 py-2.5 text-sm font-medium hover:bg-secondary"
            >
              Get in touch
            </Link>
          </div>

          {/* Pillars */}
          <div className="mt-16 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Code2, color: "google-blue", title: "Build", text: "Production web apps with modern stacks." },
              { icon: Users, color: "google-green", title: "Community", text: "Organize GDG events & developer talks." },
              { icon: Sparkles, color: "google-yellow", title: "Share", text: "Write tutorials and open-source code." },
            ].map((p) => (
              <div key={p.title} className="rounded-2xl border bg-card p-5 shadow-soft transition hover:shadow-md-google">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-white`} style={{ background: `var(--${p.color})` }}>
                  <p.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold">{p.title}</h3>
                <p className="text-sm text-muted-foreground">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured projects */}
      <section className="border-t bg-secondary/40">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-google-blue">Selected work</p>
              <h2 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">Featured projects</h2>
            </div>
            <Link to="/projects" className="text-sm text-muted-foreground hover:text-foreground">All projects →</Link>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {(projects ?? []).map((p, i) => {
              const colors = ["google-blue", "google-red", "google-yellow", "google-green"] as const;
              const c = colors[i % colors.length];
              return (
                <a key={p.id} href={p.link ?? "#"} target="_blank" rel="noreferrer" className="group rounded-2xl border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-md-google">
                  <div className="h-1.5 w-12 rounded-full" style={{ background: `var(--${c})` }} />
                  <h3 className="mt-4 font-display text-lg font-semibold">{p.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{p.description}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {(p.tags ?? []).slice(0, 4).map((t: string) => (
                      <span key={t} className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">{t}</span>
                    ))}
                  </div>
                </a>
              );
            })}
            {(!projects || projects.length === 0) && (
              <p className="col-span-3 text-center text-sm text-muted-foreground">No projects yet — add some from the admin dashboard.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
