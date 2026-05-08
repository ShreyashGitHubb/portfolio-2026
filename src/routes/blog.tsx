import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — Portfolio" },
      { name: "description", content: "Articles, tutorials and notes." },
    ],
  }),
  component: BlogPage,
});

function BlogPage() {
  const { data } = useQuery({
    queryKey: ["blog-published"],
    queryFn: async () =>
      (await supabase.from("blog_posts").select("*").eq("published", true).order("published_at", { ascending: false })).data ?? [],
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-sm font-medium text-google-red">Blog</p>
      <h1 className="mt-1 font-display text-4xl font-semibold sm:text-5xl">Writing</h1>

      <div className="mt-10 divide-y">
        {(data ?? []).map((p: any) => (
          <Link key={p.id} to="/blog/$slug" params={{ slug: p.slug }} className="block py-6 transition hover:bg-secondary/40">
            <h2 className="font-display text-2xl font-semibold group-hover:underline">{p.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{p.excerpt}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {p.published_at ? new Date(p.published_at).toLocaleDateString() : ""}
            </p>
          </Link>
        ))}
        {(!data || data.length === 0) && (
          <p className="py-6 text-sm text-muted-foreground">No posts yet.</p>
        )}
      </div>
    </div>
  );
}
