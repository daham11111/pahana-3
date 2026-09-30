import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { Empty } from "@/components/site";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllMessages, fetchAllUsers } from "@/lib/queries";
import { fmt } from "@/lib/pahana";

export const Route = createFileRoute("/_admin/admin/messages")({
  head: () => ({
    meta: [
      { title: "Messages — Pahana admin" },
      { name: "description", content: "Reply to student messages." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Messages — Pahana admin" },
      { property: "og:description", content: "Student conversations." },
    ],
  }),
  component: AdminMessages,
});

function AdminMessages() {
  const qc = useQueryClient();
  const msgs = useQuery({ queryKey: ["admin", "messages"], queryFn: fetchAllMessages });
  const users = useQuery({ queryKey: ["admin", "users"], queryFn: fetchAllUsers });
  const [sel, setSel] = useState<string | null>(null);
  const [body, setBody] = useState("");

  useEffect(() => {
    const ch = supabase
      .channel("admin-messages")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () =>
        qc.invalidateQueries({ queryKey: ["admin", "messages"] }),
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  const all = msgs.data ?? [];
  const threads = [...new Set(all.map((m) => m.user_id))].reverse();
  const nameOf = (id: string) => users.data?.find((u) => u.id === id)?.full_name || users.data?.find((u) => u.id === id)?.email || "Student";
  const thread = all.filter((m) => m.user_id === sel);

  useEffect(() => {
    if (!sel) return;
    const unread = all.filter((m) => m.user_id === sel && m.sender === "student" && !m.read);
    if (unread.length)
      supabase.from("messages").update({ read: true }).in("id", unread.map((m) => m.id)).then(() =>
        qc.invalidateQueries({ queryKey: ["admin", "messages"] }),
      );
  }, [sel, all.length]);

  const send = useMutation({
    mutationFn: async () => {
      if (!sel || !body.trim()) return;
      const { error } = await supabase.from("messages").insert({ user_id: sel, sender: "admin", body: body.trim() });
      if (error) throw error;
    },
    onSuccess: () => { setBody(""); qc.invalidateQueries({ queryKey: ["admin", "messages"] }); },
  });

  return (
    <>
      <h2>Messages</h2>
      {threads.length === 0 ? <Empty title="No conversations yet" /> : (
        <div className="g" style={{ marginTop: 16, gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))" }}>
          <div>
            {threads.map((id) => {
              const unread = all.filter((m) => m.user_id === id && m.sender === "student" && !m.read).length;
              return (
                <div className="it" key={id} style={{ cursor: "pointer", borderColor: sel === id ? "var(--ac)" : undefined }} onClick={() => setSel(id)}>
                  <b>{nameOf(id)}</b>
                  {unread > 0 && <span className="pill no">{unread}</span>}
                </div>
              );
            })}
          </div>
          <div className="card">
            {!sel ? <p className="mut">Select a conversation.</p> : (
              <>
                <h3>{nameOf(sel)}</h3>
                <div className="chat" style={{ marginTop: 10 }}>
                  {thread.map((m) => (
                    <div className={`bub${m.sender === "admin" ? " me" : ""}`} key={m.id}>
                      {m.body}<small>{fmt(m.created_at)}</small>
                    </div>
                  ))}
                </div>
                <form className="cmp" onSubmit={(e) => { e.preventDefault(); send.mutate(); }}>
                  <input placeholder="Reply…" value={body} onChange={(e) => setBody(e.target.value)} />
                  <button className="btn" disabled={!body.trim()}>Send</button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
