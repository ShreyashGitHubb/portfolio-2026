import { useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useSiteSettings } from "./useSiteSettings";

export function useSecretAccess() {
  const { settings } = useSiteSettings();
  const navigate = useNavigate();
  const clickCount = useRef(0);
  const clickTimer = useRef<NodeJS.Timeout | null>(null);
  const keyBuffer = useRef<string[]>([]);
  const keyTimer = useRef<NodeJS.Timeout | null>(null);

  const gestureType = settings.secretDashboard?.gestureType ?? "click_logo_triple";
  const shortcutKey = settings.secretDashboard?.shortcutKey ?? "Ctrl+Shift+A";

  const triggerRedirect = () => {
    console.log("[SecretAccess] Secret combination detected! Navigating to login...");
    navigate({ to: "/login" });
  };

  // 1. Keyboard Shortcut Listener
  useEffect(() => {
    if (shortcutKey === "none") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check exact hotkeys (Ctrl + Shift + A / L)
      if (shortcutKey === "Ctrl+Shift+A") {
        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") {
          e.preventDefault();
          triggerRedirect();
          return;
        }
      }

      if (shortcutKey === "Ctrl+Shift+L") {
        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "l") {
          e.preventDefault();
          triggerRedirect();
          return;
        }
      }

      // Check key sequence typing "admin"
      if (shortcutKey === "admin_typing") {
        // Reset timer on new keystroke
        if (keyTimer.current) clearTimeout(keyTimer.current);

        // Keep character keys only
        if (e.key.length === 1) {
          keyBuffer.current.push(e.key.toLowerCase());
          const typed = keyBuffer.current.slice(-5).join("");
          if (typed === "admin") {
            keyBuffer.current = [];
            triggerRedirect();
          }
        }

        // Reset buffer after 2 seconds of inactivity
        keyTimer.current = setTimeout(() => {
          keyBuffer.current = [];
        }, 2000);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (keyTimer.current) clearTimeout(keyTimer.current);
    };
  }, [shortcutKey, navigate]);

  // 2. Click Gesture Trigger (Double or Triple click handler)
  const handleLogoClick = () => {
    if (gestureType === "none" || gestureType === "shortcut_only") return;

    clickCount.current += 1;

    if (clickTimer.current) clearTimeout(clickTimer.current);

    const requiredClicks = gestureType === "click_logo_triple" ? 3 : 2;
    const timeLimit = gestureType === "click_logo_triple" ? 1000 : 500;

    if (clickCount.current >= requiredClicks) {
      clickCount.current = 0;
      triggerRedirect();
    } else {
      clickTimer.current = setTimeout(() => {
        clickCount.current = 0;
      }, timeLimit);
    }
  };

  return {
    handleLogoClick,
    hideFooterLink: settings.secretDashboard?.hideFooterLink ?? true,
  };
}
