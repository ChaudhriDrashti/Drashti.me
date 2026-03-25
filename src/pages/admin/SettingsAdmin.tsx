import { useEffect, useMemo, useRef, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload } from "lucide-react";

const SETTINGS_KEYS = [
  { key: "site_title", label: "Site Title" },
  { key: "tagline", label: "Tagline" },
  { key: "linkedin_url", label: "LinkedIn URL" },
  { key: "github_url", label: "GitHub URL" },
  { key: "email", label: "Contact Email" },
  { key: "phone", label: "Phone" },
  { key: "meta_description", label: "Meta Description" },
  { key: "hero_intro", label: "Hero Intro" },
  { key: "hero_name", label: "Hero Name" },
  { key: "hero_subtitle", label: "Hero Subtitle" },
  { key: "hero_description", label: "Hero Description" },
  { key: "about_paragraph_1", label: "About Paragraph 1" },
  { key: "about_paragraph_2", label: "About Paragraph 2" },
  { key: "about_paragraph_3", label: "About Paragraph 3" },
  { key: "theme_primary_hsl", label: "Theme Primary HSL (e.g. 166 100% 70%)" },
  { key: "theme_background_hsl", label: "Theme Background HSL (e.g. 222 47% 6%)" },
  { key: "theme_card_hsl", label: "Theme Card HSL (e.g. 222 47% 9%)" },
  { key: "theme_radius", label: "Theme Radius (e.g. 0.75rem)" },
  { key: "theme_card_gradient_start_hsl", label: "Card Gradient Start HSL" },
  { key: "theme_card_gradient_end_hsl", label: "Card Gradient End HSL" },
];

const MEDIA_SETTING_KEYS = ["hero_bg_url", "profile_image_url", "resume_url"] as const;

type StorageFile = {
  id: string;
  name: string;
};

const SettingsAdmin = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<StorageFile[]>([]);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const imageFiles = useMemo(
    () => mediaFiles.filter((f) => /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(f.name)),
    [mediaFiles],
  );
  const resumeFiles = useMemo(
    () => mediaFiles.filter((f) => /\.(pdf|doc|docx)$/i.test(f.name)),
    [mediaFiles],
  );

  const fetchMediaFiles = async () => {
    const { data, error } = await supabase.storage.from("media").list("", {
      limit: 200,
      sortBy: { column: "created_at", order: "desc" },
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setMediaFiles(((data as StorageFile[] | null) ?? []).filter((f) => !f.name.startsWith(".")));
  };

  const getPublicUrl = (name: string) => supabase.storage.from("media").getPublicUrl(name).data.publicUrl;

  const persistSetting = async (key: string, value: string) => {
    const { error } = await supabase.from("site_settings").upsert({ key, value }, { onConflict: "key" });
    if (error) {
      toast.error(error.message);
      return false;
    }
    return true;
  };

  const uploadMediaFile = async (
    file: File,
    targetKey: (typeof MEDIA_SETTING_KEYS)[number],
  ) => {
    const setUploading =
      targetKey === "hero_bg_url"
        ? setUploadingHero
        : targetKey === "profile_image_url"
          ? setUploadingProfile
          : setUploadingResume;
    setUploading(true);
    const safeName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const { error } = await supabase.storage.from("media").upload(safeName, file, { upsert: true });
    setUploading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    const publicUrl = getPublicUrl(safeName);
    setSettings((prev) => ({ ...prev, [targetKey]: publicUrl }));
    const saved = await persistSetting(targetKey, publicUrl);
    if (saved) {
      toast.success("File uploaded and saved.");
    }
    fetchMediaFiles();
  };

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("site_settings").select("*");
      const map: Record<string, string> = {};
      (data ?? []).forEach((s) => { map[s.key] = s.value ?? ""; });
      setSettings(map);
    };
    fetch();
    fetchMediaFiles();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    let failed = false;
    for (const { key } of SETTINGS_KEYS) {
      const value = settings[key] ?? "";
      const ok = await persistSetting(key, value);
      if (!ok) failed = true;
    }
    setSaving(false);
    if (failed) toast.error("Some settings failed to save.");
    else toast.success("Settings saved!");
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Settings</h1>

      <div className="max-w-4xl space-y-6">
        <div className="border border-border rounded-xl p-5 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Images From Media Library</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Hero Background Image</Label>
              {settings.hero_bg_url ? (
                <img src={settings.hero_bg_url} alt="Hero preview" className="w-full h-36 object-cover rounded border border-border" />
              ) : (
                <div className="w-full h-36 rounded border border-dashed border-border flex items-center justify-center text-muted-foreground text-sm">No hero image selected</div>
              )}
              <div className="flex gap-2">
                <select
                  value=""
                  onChange={(e) => {
                    const fileName = e.target.value;
                    if (!fileName) return;
                    const url = getPublicUrl(fileName);
                    setSettings((prev) => ({ ...prev, hero_bg_url: url }));
                    persistSetting("hero_bg_url", url).then((ok) => {
                      if (ok) toast.success("Hero image selected and saved.");
                    });
                  }}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select image from Media...</option>
                  {imageFiles.map((f) => (
                    <option key={f.id} value={f.name}>{f.name}</option>
                  ))}
                </select>
                <input
                  ref={heroInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadMediaFile(file, "hero_bg_url");
                    if (heroInputRef.current) heroInputRef.current.value = "";
                  }}
                />
                <Button type="button" variant="outline" onClick={() => heroInputRef.current?.click()} disabled={uploadingHero}>
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadingHero ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Profile Image</Label>
              {settings.profile_image_url ? (
                <img src={settings.profile_image_url} alt="Profile preview" className="w-full h-36 object-cover rounded border border-border" />
              ) : (
                <div className="w-full h-36 rounded border border-dashed border-border flex items-center justify-center text-muted-foreground text-sm">No profile image selected</div>
              )}
              <div className="flex gap-2">
                <select
                  value=""
                  onChange={(e) => {
                    const fileName = e.target.value;
                    if (!fileName) return;
                    const url = getPublicUrl(fileName);
                    setSettings((prev) => ({ ...prev, profile_image_url: url }));
                    persistSetting("profile_image_url", url).then((ok) => {
                      if (ok) toast.success("Profile image selected and saved.");
                    });
                  }}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select image from Media...</option>
                  {imageFiles.map((f) => (
                    <option key={f.id} value={f.name}>{f.name}</option>
                  ))}
                </select>
                <input
                  ref={profileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadMediaFile(file, "profile_image_url");
                    if (profileInputRef.current) profileInputRef.current.value = "";
                  }}
                />
                <Button type="button" variant="outline" onClick={() => profileInputRef.current?.click()} disabled={uploadingProfile}>
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadingProfile ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Resume File</Label>
              {settings.resume_url ? (
                <a
                  href={settings.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-primary hover:underline"
                >
                  Preview current resume
                </a>
              ) : (
                <div className="w-full h-10 rounded border border-dashed border-border flex items-center justify-center text-muted-foreground text-sm">No resume selected</div>
              )}
              <div className="flex gap-2">
                <select
                  value=""
                  onChange={(e) => {
                    const fileName = e.target.value;
                    if (!fileName) return;
                    const url = getPublicUrl(fileName);
                    setSettings((prev) => ({ ...prev, resume_url: url }));
                    persistSetting("resume_url", url).then((ok) => {
                      if (ok) toast.success("Resume selected and saved.");
                    });
                  }}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select resume from Media...</option>
                  {resumeFiles.map((f) => (
                    <option key={f.id} value={f.name}>{f.name}</option>
                  ))}
                </select>
                <input
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadMediaFile(file, "resume_url");
                    if (resumeInputRef.current) resumeInputRef.current.value = "";
                  }}
                />
                <Button type="button" variant="outline" onClick={() => resumeInputRef.current?.click()} disabled={uploadingResume}>
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadingResume ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-border rounded-xl p-5 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">All Settings</h2>
        {SETTINGS_KEYS.map(({ key, label }) => (
          <div key={key} className="space-y-1.5">
            <Label>{label}</Label>
            <Input
              value={settings[key] ?? ""}
              onChange={(e) => setSettings((p) => ({ ...p, [key]: e.target.value }))}
            />
          </div>
        ))}

          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SettingsAdmin;
