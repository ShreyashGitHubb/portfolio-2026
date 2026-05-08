import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Github, Linkedin, Twitter, Mail, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Portfolio" },
      { name: "description", content: "Get in touch." },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(1, "Name required").max(100),
  email: z.string().trim().email().max(255),
  message: z.string().trim().min(1, "Message required").max(2000),
});

function ContactPage() {
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await supabase.from("profile").select("*").maybeSingle()).data,
  });
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("contact_messages").insert(parsed.data);
    setLoading(false);
    if (error) toast.error("Something went wrong. Try again.");
    else {
      toast.success("Message sent — thanks!");
      setForm({ name: "", email: "", message: "" });
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <p className="text-sm font-medium text-google-green">Contact</p>
      <h1 className="mt-1 font-display text-4xl font-semibold sm:text-5xl">Let's build something</h1>

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <div>
          <p className="text-muted-foreground">Have an idea, talk invite, or just want to say hi? Drop a message.</p>
          <ul className="mt-6 space-y-3 text-sm">
            {profile?.email && <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-google-blue" /> <a href={`mailto:${profile.email}`} className="hover:underline">{profile.email}</a></li>}
            {profile?.location && <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-google-red" /> {profile.location}</li>}
            {profile?.github && <li className="flex items-center gap-2"><Github className="h-4 w-4" /> <a href={profile.github} target="_blank" rel="noreferrer" className="hover:underline">GitHub</a></li>}
            {profile?.linkedin && <li className="flex items-center gap-2"><Linkedin className="h-4 w-4 text-google-blue" /> <a href={profile.linkedin} target="_blank" rel="noreferrer" className="hover:underline">LinkedIn</a></li>}
            {profile?.twitter && <li className="flex items-center gap-2"><Twitter className="h-4 w-4 text-google-blue" /> <a href={profile.twitter} target="_blank" rel="noreferrer" className="hover:underline">Twitter / X</a></li>}
          </ul>
        </div>

        <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border bg-card p-6 shadow-soft">
          <div>
            <label className="text-sm font-medium">Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-google-blue" maxLength={100} />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-google-blue" maxLength={255} />
          </div>
          <div>
            <label className="text-sm font-medium">Message</label>
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-google-blue" maxLength={2000} />
          </div>
          <button disabled={loading} className="w-full rounded-md bg-foreground py-2.5 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-50">
            {loading ? "Sending…" : "Send message"}
          </button>
        </form>
      </div>
    </div>
  );
}
