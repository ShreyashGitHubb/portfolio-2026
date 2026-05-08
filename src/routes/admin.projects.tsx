import { createFileRoute } from "@tanstack/react-router";
import { CrudManager } from "@/components/admin/CrudManager";

export const Route = createFileRoute("/admin/projects")({
  component: () => (
    <CrudManager
      table="projects"
      title="Projects"
      primary="title"
      orderBy={{ column: "sort_order" }}
      fields={[
        { key: "title", label: "Title", required: true },
        { key: "description", label: "Description", type: "textarea" },
        { key: "tags", label: "Tags", type: "tags", placeholder: "react, typescript, firebase" },
        { key: "link", label: "Live URL", type: "url" },
        { key: "repo", label: "Repository URL", type: "url" },
        { key: "image_url", label: "Image URL", type: "url" },
        { key: "featured", label: "Featured", type: "checkbox" },
        { key: "sort_order", label: "Sort order", type: "number" },
      ]}
      defaults={{ tags: [], featured: false, sort_order: 0 }}
    />
  ),
});
