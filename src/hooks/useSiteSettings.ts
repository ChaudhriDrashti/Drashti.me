import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type SettingsMap = Record<string, string>;

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SettingsMap>({});

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("*")
        .order("created_at", { ascending: false });

      const map: SettingsMap = {};
      ((data as Array<Record<string, unknown>> | null) ?? []).forEach((row) => {
        const key = String(row.key ?? "").trim();
        if (!key) return;
        map[key] = String(row.value ?? "");
      });

      setSettings(map);
    };

    load();
  }, []);

  const get = useMemo(() => {
    return (key: string, fallback = "") => settings[key] || fallback;
  }, [settings]);

  return { settings, get };
};
