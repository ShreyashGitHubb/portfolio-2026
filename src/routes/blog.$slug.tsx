import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/blog/$slug")({
  component: BlogPost,
});

function BlogPost() {
  const { slug } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["blog", slug],
    queryFn: async () => {
      const { data } = await supabase.from("blog_posts").select("*").eq("slug", slug).eq("published", true).maybeSingle();
      return data;
    },
  });

  if (isLoading) return <div className="mx-auto max-w-3xl px-4 py-16">Loading…</div>;
  if (!data) return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <p>Post not found.</p>
      <Link to="/blog" className="text-google-blue hover:underline">← Back to blog</Link>
    </div>
  );

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground">← All posts</Link>
      <h1 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">{data.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {data.published_at ? new Date(data.published_at).toLocaleDateString() : ""}
      </p>
      <div className="prose prose-neutral mt-8 max-w-none whitespace-pre-line text-foreground/90">
        {data.content}
      </div>
    </article>
  );
}
