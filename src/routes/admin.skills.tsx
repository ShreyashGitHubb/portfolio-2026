import { createFileRoute } from "@tanstack/react-router";
import { CrudManager } from "@/components/admin/CrudManager";

export const Route = createFileRoute("/admin/skills")({
  component: () => (
    <CrudManager
      table="skills"
      title="Skills"
      description="Group your skills by category."
      primary="name"
      orderBy={{ column: "sort_order" }}
      fields={[
        { key: "name", label: "Name", required: true },
        { key: "category", label: "Category", placeholder: "frontend, backend, tools…" },
        { key: "level", label: "Level (0-100)", type: "number" },
        { key: "sort_order", label: "Sort order", type: "number" },
      ]}
      defaults={{ category: "general", level: 80, sort_order: 0 }}
    />
  ),
});
