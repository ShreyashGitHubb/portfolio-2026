import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollReveal, ScrollStagger } from "@/components/ui/ScrollReveal";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Portfolio" },
      { name: "description", content: "About me — developer and GDG community organizer." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await supabase.from("profile").select("*").maybeSingle()).data,
  });
  const { data: skills } = useQuery({
    queryKey: ["skills"],
    queryFn: async () => (await supabase.from("skills").select("*").order("sort_order")).data ?? [],
  });

  const grouped = (skills ?? []).reduce<Record<string, typeof skills>>((acc, s: any) => {
    (acc[s.category] ??= [] as any).push(s);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <ScrollReveal animation="fade-in" duration={500}>
        <p className="text-sm font-medium text-google-red">About</p>
        <h1 className="mt-1 font-display text-4xl font-semibold sm:text-5xl">{profile?.name || "About me"}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{profile?.role}</p>
      </ScrollReveal>

      <ScrollReveal animation="slide-up" duration={800} delay={150}>
        <div className="prose prose-neutral mt-8 max-w-none whitespace-pre-line text-foreground/90">
          {profile?.bio || "Add your bio from the admin dashboard."}
        </div>
      </ScrollReveal>

      <div className="mt-14">
        <ScrollReveal animation="slide-up" duration={600}>
          <h2 className="font-display text-2xl font-semibold">Skills</h2>
        </ScrollReveal>
        
        <ScrollStagger animation="scale-up" baseDelay={100} interval={100} className="mt-6 grid gap-6 sm:grid-cols-2">
          {Object.entries(grouped).map(([cat, list]) => (
            <div key={cat} className="rounded-2xl border bg-card p-5 shadow-soft">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{cat}</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {(list ?? []).map((s: any) => (
                  <span key={s.id} className="rounded-full border bg-secondary px-3 py-1 text-sm">{s.name}</span>
                ))}
              </div>
            </div>
          ))}
        </ScrollStagger>
        {(!skills || skills.length === 0) && (
          <p className="text-sm text-muted-foreground mt-4">No skills added yet.</p>
        )}
      </div>
    </div>
  );
}
