import { Link } from "@tanstack/react-router";
import { GdgLogo } from "./GdgLogo";

export function SiteFooter() {
  return (
    <footer className="border-t bg-secondary/40">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <GdgLogo size={18} />
          <span>Built with the spirit of GDG.</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link to="/contact" className="hover:text-foreground">Contact</Link>
          <Link to="/login" className="hover:text-foreground">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
