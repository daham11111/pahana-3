import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Empty, Pill } from "@/components/site";
import { supabase } from "@/integrations/supabase/client";
import { fetchNotifications } from "@/lib/queries";
import { fmt } from "@/lib/pahana";

export const Route = createFileRoute("/_authenticated/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts — Pahana" },
      { name: "description", content: "Updates about quotes, payments and deliveries for your orders." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Alerts — Pahana" },
      { property: "og:description", content: "Updates about your Pahana orders." },
    ],
  }),
  component: AlertsPage,
});

function AlertsPage() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["notifications"], queryFn: fetchNotifications });

  const markAll = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("notifications").update({ read: true }).eq("read", false);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const list = data ?? [];
  const unread = list.filter((n) => !n.read).length;

  return (
    <>
      <h2>Alerts</h2>
      <p className="mut">{unread ? `${unread} unread update${unread > 1 ? "s" : ""}.` : "You're all caught up."}</p>

      {unread > 0 && (
        <button className="btn b2 sm" style={{ marginTop: 14 }} onClick={() => markAll.mutate()}>
          Mark all as read
        </button>
      )}

      <div style={{ marginTop: 14 }}>
        {list.length === 0 ? (
          <Empty title="Nothing here yet" sub="We'll let you know when something changes." />
        ) : (
          list.map((n) => (
            <div className="it" key={n.id}>
              <b>{n.body}</b>
              <small>{fmt(n.created_at)}</small>
              {!n.read && <Pill text="New" />}
            </div>
          ))
        )}
      </div>
    </>
  );
}
