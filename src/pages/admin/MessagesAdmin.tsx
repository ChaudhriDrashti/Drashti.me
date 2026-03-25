import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, Trash2, Download, Mail } from "lucide-react";
import { format } from "date-fns";

type Message = {
  id: string;
  name: string;
  email: string;
  message: string;
  status: string | null;
  created_at: string;
};

const MessagesAdmin = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Message | null>(null);

  const fetchMessages = async () => {
    const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
    setMessages((data as Message[]) ?? []);
  };

  useEffect(() => { fetchMessages(); }, []);

  const markRead = async (id: string) => {
    await supabase.from("contact_messages").update({ status: "read" }).eq("id", id);
    toast.success("Marked as read");
    fetchMessages();
  };

  const deleteMsg = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    await supabase.from("contact_messages").delete().eq("id", id);
    toast.success("Deleted");
    if (selected?.id === id) setSelected(null);
    fetchMessages();
  };

  const exportCsv = () => {
    const csv = ["Name,Email,Message,Status,Date", ...messages.map((m) =>
      `"${m.name}","${m.email}","${m.message.replace(/"/g, '""')}","${m.status}","${m.created_at}"`
    )].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contact_messages.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const unreadCount = messages.filter((m) => m.status === "unread").length;

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">Messages</h1>
          {unreadCount > 0 && <Badge variant="destructive">{unreadCount} unread</Badge>}
        </div>
        <Button variant="outline" onClick={exportCsv} size="sm">
          <Download className="h-4 w-4 mr-2" />Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Message list */}
        <div className="lg:col-span-1 border border-border rounded-xl overflow-hidden">
          {messages.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No messages yet</div>
          ) : (
            <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
              {messages.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelected(m)}
                  className={`w-full text-left p-4 hover:bg-secondary/20 transition-colors ${
                    selected?.id === m.id ? "bg-secondary/30" : ""
                  } ${m.status === "unread" ? "border-l-2 border-l-primary" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground text-sm">{m.name}</span>
                    <span className="text-xs text-muted-foreground">{format(new Date(m.created_at), "MMM d")}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-1">{m.message}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Message detail */}
        <div className="lg:col-span-2 border border-border rounded-xl p-6">
          {selected ? (
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{selected.name}</h2>
                  <a href={`mailto:${selected.email}`} className="text-primary text-sm flex items-center gap-1">
                    <Mail className="h-3 w-3" />{selected.email}
                  </a>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(selected.created_at), "PPpp")}
                  </p>
                </div>
                <div className="flex gap-2">
                  {selected.status === "unread" && (
                    <Button variant="outline" size="sm" onClick={() => markRead(selected.id)}>
                      <Check className="h-3.5 w-3.5 mr-1" />Read
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => deleteMsg(selected.id)} className="text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="bg-secondary/20 rounded-lg p-4 text-foreground text-sm whitespace-pre-wrap">
                {selected.message}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground py-16">
              Select a message to read
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default MessagesAdmin;
