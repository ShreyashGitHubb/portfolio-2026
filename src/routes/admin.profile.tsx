import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/profile")({ component: ProfileAdmin });

const FIELDS = [
  { k: "name", label: "Name" },
  { k: "role", label: "Role / Title" },
  { k: "tagline", label: "Tagline (hero)" },
  { k: "email", label: "Email" },
  { k: "location", label: "Location" },
  { k: "github", label: "GitHub URL" },
  { k: "linkedin", label: "LinkedIn URL" },
  { k: "twitter", label: "Twitter / X URL" },
  { k: "avatar_url", label: "Avatar URL" },
  { k: "resume_url", label: "Resume URL" },
] as const;

function ProfileAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["profile-admin"],
    queryFn: async () => (await supabase.from("profile").select("*").maybeSingle()).data,
  });
  const [form, setForm] = useState<any>({});
  useEffect(() => { if (data) setForm(data); }, [data]);

  const save = async () => {
    if (!data?.id) return;
    const { id, created_at, updated_at, ...payload } = form;
    const { error } = await supabase.from("profile").update(payload).eq("id", data.id);
    if (error) toast.error(error.message);
    else { toast.success("Profile saved"); qc.invalidateQueries({ queryKey: ["profile"] }); }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-semibold">Profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">Edit your name, bio, contact links and tagline.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <div key={f.k} className={f.k === "tagline" ? "sm:col-span-2" : ""}>
            <label className="text-sm font-medium">{f.label}</label>
            <input value={form[f.k] ?? ""} onChange={(e) => setForm({ ...form, [f.k]: e.target.value })} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-google-blue" />
          </div>
        ))}
        <div className="sm:col-span-2">
          <label className="text-sm font-medium">Bio</label>
          <textarea value={form.bio ?? ""} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={6} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-google-blue" />
        </div>
      </div>
      <div className="mt-6">
        <button onClick={save} className="rounded-md bg-foreground px-5 py-2 text-sm font-medium text-background hover:opacity-90">Save changes</button>
      </div>
    </div>
  );
}
