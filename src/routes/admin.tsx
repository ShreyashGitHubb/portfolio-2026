import { createFileRoute, Outlet, Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { GdgLogo } from "@/components/GdgLogo";
import { LayoutDashboard, User, Wrench, FolderKanban, Briefcase, Mic, FileText, Mail, LogOut, Settings } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/profile", label: "Profile", icon: User },
  { to: "/admin/skills", label: "Skills", icon: Wrench },
  { to: "/admin/projects", label: "Projects", icon: FolderKanban },
  { to: "/admin/experience", label: "Experience", icon: Briefcase },
  { to: "/admin/events", label: "Events", icon: Mic },
  { to: "/admin/blog", label: "Blog", icon: FileText },
  { to: "/admin/messages", label: "Messages", icon: Mail },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  if (loading) return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading…</div>;
  if (!user) {
    navigate({ to: "/login" });
    return null;
  }
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md rounded-2xl border bg-card p-8 text-center shadow-soft">
          <h1 className="font-display text-2xl font-semibold">Not authorized</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You're signed in as <span className="font-medium">{user.email}</span> but don't have admin access.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Ask the site owner to grant you the <code>admin</code> role.
          </p>
          <button
            onClick={() => supabase.auth.signOut().then(() => navigate({ to: "/login" }))}
            className="mt-5 rounded-md border px-4 py-2 text-sm hover:bg-secondary"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 border-r bg-sidebar md:flex md:flex-col">
        <Link to="/" className="flex h-16 items-center gap-2 px-5 font-display text-base font-semibold">
          <GdgLogo size={20} /> Admin
        </Link>
        <nav className="flex-1 space-y-1 p-3">
          {NAV.map((n) => {
            const active = n.exact ? path === n.to : path.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
                  active ? "bg-secondary font-medium text-foreground" : "text-muted-foreground hover:bg-secondary/60"
                }`}
              >
                <n.icon className="h-4 w-4" /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-3">
          <button
            onClick={() => supabase.auth.signOut().then(() => navigate({ to: "/login" }))}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/60"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>
      <div className="flex-1">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/85 px-4 backdrop-blur md:px-8">
          <div className="md:hidden">
            <Link to="/" className="flex items-center gap-2 font-display font-semibold"><GdgLogo size={18} /> Admin</Link>
          </div>
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </header>
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
        {/* Mobile nav */}
        <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t bg-background py-1 md:hidden">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="flex flex-col items-center px-2 py-1 text-[10px] text-muted-foreground">
              <n.icon className="h-4 w-4" />
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
