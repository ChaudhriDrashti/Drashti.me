import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

type SettingsMap = Record<string, string>;

interface SiteSettingsContextType {
  settings: SettingsMap;
  get: (key: string, fallback?: string) => string;
  isLoading: boolean;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export const SiteSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("*")
          .order("created_at", { ascending: false });

        if (!isMounted) return;

        const map: SettingsMap = {};
        ((data as Array<Record<string, unknown>> | null) ?? []).forEach((row) => {
          const key = String(row.key ?? "").trim();
          if (!key) return;
          map[key] = String(row.value ?? "");
        });

        setSettings(map);
      } catch (error) {
        console.error("Failed to load site settings:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const get = (key: string, fallback = "") => settings[key] || fallback;

  return (
    <SiteSettingsContext.Provider value={{ settings, get, isLoading }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (context === undefined) {
    throw new Error("useSiteSettings must be used within a SiteSettingsProvider");
  }
  return context;
};
