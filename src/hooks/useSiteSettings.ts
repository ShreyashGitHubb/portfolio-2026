import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SiteSettings {
  theme: {
    primaryColor: "google-blue" | "google-red" | "google-yellow" | "google-green" | string;
    themeMode: "light" | "dark" | "system";
    heroBgPattern: "dots" | "grid" | "none";
  };
  scrollReveal: {
    enabled: boolean;
    animationType: "fade-in" | "slide-up" | "slide-down" | "slide-left" | "slide-right" | "scale-up";
    duration: number; // in ms
    delay: number; // in ms
  };
  secretDashboard: {
    gestureType: "click_logo_triple" | "click_logo_double" | "shortcut_only" | "none";
    shortcutKey: "Ctrl+Shift+A" | "Ctrl+Shift+L" | "admin_typing" | "none";
    hideFooterLink: boolean;
  };
}

export const DEFAULT_SETTINGS: SiteSettings = {
  theme: {
    primaryColor: "google-blue",
    themeMode: "system",
    heroBgPattern: "dots",
  },
  scrollReveal: {
    enabled: true,
    animationType: "slide-up",
    duration: 800,
    delay: 0,
  },
  secretDashboard: {
    gestureType: "click_logo_triple",
    shortcutKey: "Ctrl+Shift+A",
    hideFooterLink: true,
  },
};

const LOCAL_STORAGE_KEY = "gdg-portfolio-settings-fallback";

export function useSiteSettings() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("profile").select("settings").maybeSingle();
        
        // Check for specific error code 42703 (undefined_column in Postgres)
        // or code 42P21 etc., or error message contains "column"
        if (error) {
          if (error.code === "42703" || error.message.includes("column")) {
            console.warn("[SiteSettings] settings column does not exist in profile table. Using local fallback.");
            const local = localStorage.getItem(LOCAL_STORAGE_KEY);
            return {
              settings: local ? JSON.parse(local) : DEFAULT_SETTINGS,
              isColumnMissing: true,
            };
          }
          throw error;
        }

        // If no error but settings is empty/null, return default
        const parsedSettings = (data?.settings as unknown as SiteSettings) || DEFAULT_SETTINGS;
        return {
          settings: {
            theme: { ...DEFAULT_SETTINGS.theme, ...parsedSettings.theme },
            scrollReveal: { ...DEFAULT_SETTINGS.scrollReveal, ...parsedSettings.scrollReveal },
            secretDashboard: { ...DEFAULT_SETTINGS.secretDashboard, ...parsedSettings.secretDashboard },
          },
          isColumnMissing: false,
          profileId: data?.id,
        };
      } catch (e) {
        console.error("[SiteSettings] Failed to fetch settings:", e);
        const local = localStorage.getItem(LOCAL_STORAGE_KEY);
        return {
          settings: local ? JSON.parse(local) : DEFAULT_SETTINGS,
          isColumnMissing: true,
        };
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (newSettings: SiteSettings) => {
      const { data: current } = await supabase.from("profile").select("id, settings").maybeSingle();
      if (!current?.id) {
        throw new Error("No profile found to update settings.");
      }

      // First write to local fallback
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSettings));

      const { error } = await supabase
        .from("profile")
        .update({ settings: newSettings as any })
        .eq("id", current.id);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
    },
  });

  return {
    settings: data?.settings ?? DEFAULT_SETTINGS,
    isColumnMissing: !!data?.isColumnMissing,
    isLoading,
    updateSettings: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
