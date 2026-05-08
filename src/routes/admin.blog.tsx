import { createFileRoute } from "@tanstack/react-router";
import { CrudManager } from "@/components/admin/CrudManager";

export const Route = createFileRoute("/admin/blog")({
  component: () => (
    <CrudManager
      table="blog_posts"
      title="Blog posts"
      description="Toggle 'published' to make a post live."
      primary="title"
      orderBy={{ column: "created_at", ascending: false }}
      fields={[
        { key: "title", label: "Title", required: true },
        { key: "slug", label: "Slug", placeholder: "my-first-post", required: true },
        { key: "excerpt", label: "Excerpt", type: "textarea" },
        { key: "content", label: "Content (plain text / markdown)", type: "textarea" },
        { key: "cover_url", label: "Cover image URL", type: "url" },
        { key: "published", label: "Published", type: "checkbox" },
        { key: "published_at", label: "Published at (ISO date)" },
      ]}
      defaults={{ published: false }}
    />
  ),
});
