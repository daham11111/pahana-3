import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { Empty, Pill, Stat } from "@/components/site";
import { displayName, useAuth } from "@/hooks/useAuth";
import { fetchMyOrders, fetchNotifications } from "@/lib/queries";
import { ACTIVE_STATUSES, DONE_STATUSES, PENDING_STATUSES, fmt, fmtDate, lkr } from "@/lib/pahana";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Pahana" },
      { name: "description", content: "Your Pahana overview: active orders, quotes and alerts." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Dashboard — Pahana" },
      { property: "og:description", content: "Your Pahana student overview." },
    ],
  }),
  component: Overview,
});

function Overview() {
  const auth = useAuth();
  const orders = useQuery({ queryKey: ["orders", "mine"], queryFn: fetchMyOrders });
  const alerts = useQuery({ queryKey: ["notifications"], queryFn: fetchNotifications });

  const list = orders.data ?? [];
  const pending = list.filter((o) => PENDING_STATUSES.includes(o.status)).length;
  const active = list.filter((o) => ACTIVE_STATUSES.includes(o.status)).length;
  const done = list.filter((o) => DONE_STATUSES.includes(o.status)).length;

  return (
    <>
      <h2>Hi {displayName(auth).split(" ")[0]} 👋</h2>
      <p className="mut">Here&apos;s where your assignments stand today.</p>

      <div className="g g4" style={{ marginTop: 20 }}>
        <Stat label="Total orders" value={list.length} />
        <Stat label="Awaiting action" value={pending} />
        <Stat label="In progress" value={active} />
        <Stat label="Completed" value={done} />
      </div>

      <h3 style={{ marginTop: 30 }}>Recent orders</h3>
      {list.length === 0 ? (
        <Empty title="No orders yet" sub="Submit your first brief to get a quote." />
      ) : (
        list.slice(0, 5).map((o) => (
          <Link className="it" key={o.id} to="/orders/$orderId" params={{ orderId: o.id }}>
            <b>
              {o.code} · {o.title}
              <small style={{ display: "block" }}>
                {o.service_name} · due {fmtDate(o.deadline)}
              </small>
            </b>
            <span className="pill">{o.status}</span>
            <small>{lkr(o.price)}</small>
          </Link>
        ))
      )}

      <h3 style={{ marginTop: 26 }}>Latest alerts</h3>
      {(alerts.data ?? []).length === 0 ? (
        <Empty title="Nothing new" sub="Updates about your orders will appear here." />
      ) : (
        (alerts.data ?? []).slice(0, 4).map((n) => (
          <div className="it" key={n.id}>
            <b>{n.body}</b>
            <small>{fmt(n.created_at)}</small>
            {!n.read && <Pill text="New" />}
          </div>
        ))
      )}

      <div className="bt" style={{ marginTop: 26 }}>
        <Link className="btn" to="/new-assignment">
          Submit a new assignment
        </Link>
        <Link className="btn b2" to="/messages">
          Message the team
        </Link>
      </div>
    </>
  );
}
