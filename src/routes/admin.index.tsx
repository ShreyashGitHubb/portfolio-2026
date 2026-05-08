import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const counts = useQuery({
    queryKey: ["admin-counts"],
    queryFn: async () => {
      const tables = ["projects", "skills", "experience", "events", "blog_posts", "contact_messages"] as const;
      const out: Record<string, number> = {};
      await Promise.all(
        tables.map(async (t) => {
          const { count } = await supabase.from(t).select("*", { head: true, count: "exact" });
          out[t] = count ?? 0;
        }),
      );
      return out;
    },
  });

  const cards = [
    { label: "Projects", to: "/admin/projects", key: "projects", color: "google-blue" },
    { label: "Skills", to: "/admin/skills", key: "skills", color: "google-red" },
    { label: "Experience", to: "/admin/experience", key: "experience", color: "google-yellow" },
    { label: "Events", to: "/admin/events", key: "events", color: "google-green" },
    { label: "Blog posts", to: "/admin/blog", key: "blog_posts", color: "google-blue" },
    { label: "Messages", to: "/admin/messages", key: "contact_messages", color: "google-red" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Welcome back</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage your portfolio content.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.key} to={c.to} className="group rounded-2xl border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-md-google">
            <div className="h-1.5 w-12 rounded-full" style={{ background: `var(--${c.color})` }} />
            <p className="mt-4 text-sm text-muted-foreground">{c.label}</p>
            <p className="mt-1 font-display text-3xl font-semibold">{counts.data?.[c.key] ?? "—"}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
