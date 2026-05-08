import { createFileRoute } from "@tanstack/react-router";
import { CrudManager } from "@/components/admin/CrudManager";

export const Route = createFileRoute("/admin/events")({
  component: () => (
    <CrudManager
      table="events"
      title="Events & Talks"
      primary="title"
      orderBy={{ column: "event_date", ascending: false }}
      fields={[
        { key: "title", label: "Talk / session title", required: true },
        { key: "event_name", label: "Event name" },
        { key: "event_date", label: "Date" },
        { key: "location", label: "Location" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "link", label: "Link", type: "url" },
      ]}
    />
  ),
});
