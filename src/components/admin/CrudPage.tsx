import { useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { GripVertical, Plus, Pencil, Trash2 } from "lucide-react";

export interface FieldDef {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "date" | "tags" | "boolean";
  required?: boolean;
}

interface CrudPageProps {
  title: string;
  table: "projects" | "experience" | "education" | "skills" | "certifications" | "blog_posts";
  fields: FieldDef[];
  displayColumns: string[];
  renderRow?: (item: Record<string, unknown>) => ReactNode;
}

const CrudPage = ({ title, table, fields, displayColumns }: CrudPageProps) => {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  const getNextSortOrder = () => {
    const maxSort = items.reduce((max, item) => {
      const value = item.sort_order;
      const parsed = typeof value === "number" ? value : Number(value);
      return Number.isFinite(parsed) ? Math.max(max, parsed) : max;
    }, 0);
    return maxSort + 1;
  };

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order("sort_order", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (error) {
      toast.error(error.message);
      return;
    }
    setItems((data as Record<string, unknown>[]) ?? []);
  };

  useEffect(() => { fetchItems(); }, [table]);

  const openCreate = () => {
    setEditing(null);
    const defaults: Record<string, unknown> = {};
    fields.forEach((f) => {
      if (f.type === "boolean") defaults[f.name] = false;
      else if (f.name === "sort_order") defaults[f.name] = getNextSortOrder();
      else if (f.type === "tags") defaults[f.name] = "";
      else defaults[f.name] = "";
    });
    setFormData(defaults);
    setDialogOpen(true);
  };

  const openEdit = (item: Record<string, unknown>) => {
    setEditing(item);
    const data: Record<string, unknown> = {};
    fields.forEach((f) => {
      if (f.type === "tags" && Array.isArray(item[f.name])) {
        data[f.name] = (item[f.name] as string[]).join(", ");
      } else {
        data[f.name] = item[f.name] ?? "";
      }
    });
    setFormData(data);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setLoading(true);
    const payload: Record<string, unknown> = {};
    fields.forEach((f) => {
      if (f.type === "tags") {
        payload[f.name] = (formData[f.name] as string).split(",").map((s: string) => s.trim()).filter(Boolean);
      } else if (f.type === "number") {
        payload[f.name] = formData[f.name] ? Number(formData[f.name]) : null;
      } else if (f.type === "boolean") {
        payload[f.name] = !!formData[f.name];
      } else {
        payload[f.name] = formData[f.name] || null;
      }
    });

    let error;
    if (editing) {
      ({ error } = await supabase.from(table).update(payload).eq("id", editing.id as string));
    } else {
      ({ error } = await supabase.from(table).insert(payload as never));
    }

    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(editing ? "Updated!" : "Created!");
      setDialogOpen(false);
      fetchItems();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted!");
      fetchItems();
    }
  };

  const handleReorder = async (sourceId: string, targetId: string) => {
    if (sourceId === targetId || reordering) return;

    const fromIndex = items.findIndex((item) => item.id === sourceId);
    const toIndex = items.findIndex((item) => item.id === targetId);
    if (fromIndex < 0 || toIndex < 0) return;

    const previousItems = items;
    const reordered = [...items];
    const [movedItem] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, movedItem);

    const withSortOrder = reordered.map((item, index) => ({
      ...item,
      sort_order: index + 1,
    }));

    setItems(withSortOrder);
    setReordering(true);

    const updates = withSortOrder.map((item) =>
      supabase.from(table).update({ sort_order: item.sort_order as number }).eq("id", item.id as string),
    );

    const results = await Promise.all(updates);
    const failed = results.find((result) => result.error);

    setReordering(false);

    if (failed?.error) {
      setItems(previousItems);
      toast.error(failed.error.message);
      return;
    }

    toast.success("Order updated");
  };

  const updateField = (name: string, value: unknown) => setFormData((prev) => ({ ...prev, [name]: value }));

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add New</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit" : "Create"} {title.replace(/s$/, "")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {fields.map((f) => (
                <div key={f.name} className="space-y-1.5">
                  <Label>{f.label}</Label>
                  {f.type === "textarea" ? (
                    <Textarea
                      value={(formData[f.name] as string) ?? ""}
                      onChange={(e) => updateField(f.name, e.target.value)}
                      rows={4}
                    />
                  ) : f.type === "boolean" ? (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!formData[f.name]}
                        onChange={(e) => updateField(f.name, e.target.checked)}
                        className="rounded border-border"
                      />
                      <span className="text-sm text-foreground">{f.label}</span>
                    </label>
                  ) : (
                    <Input
                      type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                      value={(formData[f.name] as string) ?? ""}
                      onChange={(e) => updateField(f.name, e.target.value)}
                      placeholder={f.type === "tags" ? "comma separated" : ""}
                    />
                  )}
                </div>
              ))}
              <Button onClick={handleSave} disabled={loading} className="w-full">
                {loading ? "Saving..." : "Save"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">No items yet. Click "Add New" to create one.</div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-2 text-xs text-muted-foreground border-b border-border bg-secondary/20">
            Drag rows using the handle to reorder. Changes save automatically.
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="w-10 px-2 py-3 text-muted-foreground">&nbsp;</th>
                {displayColumns.map((col) => (
                  <th key={col} className="text-left px-4 py-3 font-medium text-muted-foreground capitalize">{col.replace(/_/g, " ")}</th>
                ))}
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id as string}
                  draggable={!reordering}
                  onDragStart={() => setDraggingId(item.id as string)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (draggingId) handleReorder(draggingId, item.id as string);
                    setDraggingId(null);
                  }}
                  onDragEnd={() => setDraggingId(null)}
                  className={`border-b border-border hover:bg-secondary/10 transition-colors ${draggingId === (item.id as string) ? "opacity-50" : ""}`}
                >
                  <td className="px-2 py-3 text-muted-foreground">
                    <div className="flex justify-center cursor-grab active:cursor-grabbing">
                      <GripVertical className="h-4 w-4" />
                    </div>
                  </td>
                  {displayColumns.map((col) => (
                    <td key={col} className="px-4 py-3 text-foreground max-w-[200px] truncate">
                      {Array.isArray(item[col]) ? (item[col] as string[]).join(", ") : String(item[col] ?? "—")}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id as string)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
};

export default CrudPage;
