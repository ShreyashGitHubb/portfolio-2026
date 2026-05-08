import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Mail, MailOpen } from "lucide-react";

export const Route = createFileRoute("/admin/messages")({
  component: MessagesPage,
});

function MessagesPage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => (await supabase.from("contact_messages").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const toggle = async (id: string, read: boolean) => {
    await supabase.from("contact_messages").update({ read: !read }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-messages"] });
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-messages"] }); }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Messages</h1>
      <p className="mt-1 text-sm text-muted-foreground">Submissions from the contact form.</p>
      <div className="mt-6 space-y-3">
        {data?.length === 0 && <p className="text-sm text-muted-foreground">No messages yet.</p>}
        {data?.map((m: any) => (
          <article key={m.id} className={`rounded-2xl border p-5 shadow-soft ${m.read ? "bg-card" : "bg-secondary/40"}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{m.name} <span className="text-xs text-muted-foreground">· {m.email}</span></p>
                <p className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggle(m.id, m.read)} className="rounded-md border p-1.5 hover:bg-secondary" title={m.read ? "Mark unread" : "Mark read"}>
                  {m.read ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                </button>
                <button onClick={() => remove(m.id)} className="rounded-md border p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm">{m.message}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
