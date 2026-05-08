import { createFileRoute } from "@tanstack/react-router";
import { CrudManager } from "@/components/admin/CrudManager";

export const Route = createFileRoute("/admin/experience")({
  component: () => (
    <CrudManager
      table="experience"
      title="Experience"
      primary="role"
      orderBy={{ column: "sort_order" }}
      fields={[
        { key: "role", label: "Role", required: true },
        { key: "company", label: "Company", required: true },
        { key: "start_date", label: "Start (e.g. Jan 2023)" },
        { key: "end_date", label: "End (blank = Present)" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "sort_order", label: "Sort order", type: "number" },
      ]}
      defaults={{ sort_order: 0 }}
    />
  ),
});
