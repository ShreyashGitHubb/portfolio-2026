import { createFileRoute } from "@tanstack/react-router";
import { useSiteSettings, SiteSettings, DEFAULT_SETTINGS } from "@/hooks/useSiteSettings";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save, AlertTriangle, Copy, Check } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsAdmin,
});

function SettingsAdmin() {
  const { settings, isColumnMissing, isLoading, updateSettings, isUpdating } = useSiteSettings();
  const [form, setForm] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm(settings);
    }
  }, [settings]);

  const copySql = () => {
    const sql = "ALTER TABLE public.profile ADD COLUMN settings jsonb DEFAULT '{}'::jsonb;";
    navigator.clipboard.writeText(sql);
    setCopied(true);
    toast.success("SQL command copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(form);
      toast.success("Settings updated successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update settings");
    }
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading settings...</div>;
  }

  return (
    <div className="max-w-4xl space-y-6 pb-12">
      <div>
        <h1 className="font-display text-3xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Customize theme aesthetics, scroll animations, and secret dashboard access.
        </p>
      </div>

      {isColumnMissing && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 dark:border-amber-900/30 dark:bg-amber-950/10">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-500" />
            <div className="space-y-2">
              <h3 className="font-display text-sm font-semibold text-amber-900 dark:text-amber-400">
                Database Column Missing
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-500/90 leading-relaxed">
                The <code>settings</code> column was not found in your Supabase <code>profile</code> table. 
                Changes will be saved to your browser's local storage for now. To persist settings permanently:
              </p>
              <div className="mt-3 flex items-center justify-between rounded-lg border bg-background p-2.5 font-mono text-xs">
                <span className="text-muted-foreground select-all">
                  ALTER TABLE public.profile ADD COLUMN settings jsonb DEFAULT '{"{}"}'::jsonb;
                </span>
                <button
                  onClick={copySql}
                  type="button"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border bg-card hover:bg-secondary text-muted-foreground"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
              <p className="text-[11px] text-amber-600/90 dark:text-amber-600">
                Paste and run the command above in your <strong>Supabase SQL Editor</strong> to enable permanent cloud storage.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* THEME SETTINGS */}
        <div className="rounded-2xl border bg-card p-6 shadow-soft space-y-4">
          <h2 className="font-display text-lg font-semibold border-b pb-2">1. Theme & Design Aesthetics</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Primary Accent Color</label>
              <select
                value={form.theme.primaryColor}
                onChange={(e) => setForm({
                  ...form,
                  theme: { ...form.theme, primaryColor: e.target.value }
                })}
                className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-google-blue"
              >
                <option value="google-blue">Google Blue (#4285F4)</option>
                <option value="google-red">Google Red (#EA4335)</option>
                <option value="google-yellow">Google Yellow (#FBBC04)</option>
                <option value="google-green">Google Green (#34A853)</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Hero Background Grid Pattern</label>
              <select
                value={form.theme.heroBgPattern}
                onChange={(e) => setForm({
                  ...form,
                  theme: { ...form.theme, heroBgPattern: e.target.value as any }
                })}
                className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-google-blue"
              >
                <option value="dots">Animated Dot Grid (GDG Spirit)</option>
                <option value="grid">Clean Lines Grid</option>
                <option value="none">No Grid (Pure Gradient Blur)</option>
              </select>
            </div>
          </div>
        </div>

        {/* SCROLL REVEAL SETTINGS */}
        <div className="rounded-2xl border bg-card p-6 shadow-soft space-y-4">
          <h2 className="font-display text-lg font-semibold border-b pb-2">2. Scroll Animations</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="scroll-enabled"
                checked={form.scrollReveal.enabled}
                onChange={(e) => setForm({
                  ...form,
                  scrollReveal: { ...form.scrollReveal, enabled: e.target.checked }
                })}
                className="h-4 w-4 rounded border-gray-300 text-google-blue focus:ring-google-blue"
              />
              <label htmlFor="scroll-enabled" className="text-sm font-medium select-none">
                Enable Professional Scroll Reveal animations
              </label>
            </div>

            {form.scrollReveal.enabled && (
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-sm font-medium">Default Entrance Animation</label>
                  <select
                    value={form.scrollReveal.animationType}
                    onChange={(e) => setForm({
                      ...form,
                      scrollReveal: { ...form.scrollReveal, animationType: e.target.value as any }
                    })}
                    className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-google-blue"
                  >
                    <option value="slide-up">Slide Up (Clean Reveal)</option>
                    <option value="slide-down">Slide Down</option>
                    <option value="slide-left">Slide In from Left</option>
                    <option value="slide-right">Slide In from Right</option>
                    <option value="fade-in">Fade In Only</option>
                    <option value="scale-up">Scale & Fade (Premium)</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Transition Duration (ms)</label>
                  <input
                    type="number"
                    value={form.scrollReveal.duration}
                    min={100}
                    max={3000}
                    step={50}
                    onChange={(e) => setForm({
                      ...form,
                      scrollReveal: { ...form.scrollReveal, duration: parseInt(e.target.value) || 800 }
                    })}
                    className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-google-blue"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Initial Delay Offset (ms)</label>
                  <input
                    type="number"
                    value={form.scrollReveal.delay}
                    min={0}
                    max={2000}
                    step={50}
                    onChange={(e) => setForm({
                      ...form,
                      scrollReveal: { ...form.scrollReveal, delay: parseInt(e.target.value) || 0 }
                    })}
                    className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-google-blue"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECRET ACCESS SETTINGS */}
        <div className="rounded-2xl border bg-card p-6 shadow-soft space-y-4">
          <h2 className="font-display text-lg font-semibold border-b pb-2">3. Secret Dashboard Access</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Hidden Click Gesture (on GDG Logo)</label>
              <select
                value={form.secretDashboard.gestureType}
                onChange={(e) => setForm({
                  ...form,
                  secretDashboard: { ...form.secretDashboard, gestureType: e.target.value as any }
                })}
                className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-google-blue"
              >
                <option value="click_logo_triple">Triple-click the Logo (Recommended)</option>
                <option value="click_logo_double">Double-click the Logo</option>
                <option value="shortcut_only">No clicks (Keyboard shortcuts only)</option>
                <option value="none">Disable Click Gestures</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Keyboard Shortcut Trigger</label>
              <select
                value={form.secretDashboard.shortcutKey}
                onChange={(e) => setForm({
                  ...form,
                  secretDashboard: { ...form.secretDashboard, shortcutKey: e.target.value as any }
                })}
                className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-google-blue"
              >
                <option value="Ctrl+Shift+A">Press Ctrl + Shift + A</option>
                <option value="Ctrl+Shift+L">Press Ctrl + Shift + L</option>
                <option value="admin_typing">Typing "admin" sequentially on page</option>
                <option value="none">Disable Keyboard Trigger</option>
              </select>
            </div>

            <div className="sm:col-span-2 flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="hide-footer"
                checked={form.secretDashboard.hideFooterLink}
                onChange={(e) => setForm({
                  ...form,
                  secretDashboard: { ...form.secretDashboard, hideFooterLink: e.target.checked }
                })}
                className="h-4 w-4 rounded border-gray-300 text-google-blue focus:ring-google-blue"
              />
              <label htmlFor="hide-footer" className="text-sm font-medium select-none">
                Hide the visible "Admin" link in the footer (make access secret)
              </label>
            </div>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isUpdating}
            className="inline-flex items-center gap-2 rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            {isUpdating ? "Saving changes..." : "Save settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
