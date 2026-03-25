import { useEffect, useState, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, Trash2, FileText, Image, Copy } from "lucide-react";

type StorageFile = { name: string; id: string; created_at: string; metadata: { size: number; mimetype: string } | null };

const BUCKETS = ["media", "resumes"] as const;

const MediaAdmin = () => {
  const [bucket, setBucket] = useState<typeof BUCKETS[number]>("media");
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    const { data } = await supabase.storage.from(bucket).list("", { limit: 100, sortBy: { column: "created_at", order: "desc" } });
    setFiles((data as StorageFile[]) ?? []);
  };

  useEffect(() => { fetchFiles(); }, [bucket]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { error } = await supabase.storage.from(bucket).upload(file.name, file, { upsert: true });
    setUploading(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Uploaded!");
      fetchFiles();
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    const { error } = await supabase.storage.from(bucket).remove([name]);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted!");
      fetchFiles();
    }
  };

  const getPublicUrl = (name: string) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(name);
    return data.publicUrl;
  };

  const copyUrl = (name: string) => {
    navigator.clipboard.writeText(getPublicUrl(name));
    toast.success("URL copied!");
  };

  const isImage = (name: string) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name);

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Media Manager</h1>
        <div className="flex gap-2">
          {BUCKETS.map((b) => (
            <Button key={b} variant={bucket === b ? "default" : "outline"} size="sm" onClick={() => setBucket(b)} className="capitalize">
              {b}
            </Button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <input ref={inputRef} type="file" onChange={handleUpload} className="hidden" accept={bucket === "resumes" ? ".pdf" : "image/*,.pdf"} />
        <Button onClick={() => inputRef.current?.click()} disabled={uploading}>
          <Upload className="h-4 w-4 mr-2" />{uploading ? "Uploading..." : "Upload File"}
        </Button>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">No files in this bucket</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.filter(f => f.name !== ".emptyFolderPlaceholder").map((file) => (
            <div key={file.id} className="border border-border rounded-xl overflow-hidden card-gradient group">
              <div className="aspect-square flex items-center justify-center bg-secondary/20 overflow-hidden">
                {isImage(file.name) ? (
                  <img src={getPublicUrl(file.name)} alt={file.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    {file.name.endsWith(".pdf") ? <FileText className="h-10 w-10" /> : <Image className="h-10 w-10" />}
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-xs text-foreground truncate font-medium">{file.name}</p>
                <div className="flex gap-1 mt-2">
                  <Button variant="ghost" size="sm" onClick={() => copyUrl(file.name)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(file.name)} className="text-destructive">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default MediaAdmin;
