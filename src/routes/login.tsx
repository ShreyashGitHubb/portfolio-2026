import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { GdgLogo } from "@/components/GdgLogo";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Admin Login" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  const onEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error(error.message);
    else navigate({ to: "/admin" });
  };

  const onGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/admin" });
    if (result.error) toast.error("Google sign-in failed");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="dot-grid absolute inset-0 opacity-50" aria-hidden />
      <div className="relative w-full max-w-md rounded-2xl border bg-card p-8 shadow-md-google">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <GdgLogo size={18} /> Back to site
        </Link>
        <h1 className="font-display text-3xl font-semibold">Admin <span className="text-gradient-google">access</span></h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to manage your portfolio content.</p>

        <form onSubmit={onEmailLogin} className="mt-6 space-y-3">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-google-blue" />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-google-blue" />
          </div>
          <button disabled={loading} className="w-full rounded-md bg-foreground py-2.5 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50">
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" />
        </div>
        <button onClick={onGoogle} className="flex w-full items-center justify-center gap-2 rounded-md border bg-background py-2.5 text-sm font-medium hover:bg-secondary">
          <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.2C29.2 35.6 26.7 36.5 24 36.5c-5.2 0-9.6-3.4-11.2-8L6.2 33.4C9.5 39.8 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.2 5.2C40.6 36 44 30.5 44 24c0-1.3-.1-2.3-.4-3.5z"/></svg>
          Continue with Google
        </button>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Signups are disabled. Only the site owner can sign in.
        </p>
      </div>
    </div>
  );
}
