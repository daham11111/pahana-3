import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { Stat } from "@/components/site";
import { fetchAllMessages, fetchAllOrders, fetchAllReviews, fetchAllUsers } from "@/lib/queries";
import { ALL_STATUSES, fmtDate, lkr } from "@/lib/pahana";

export const Route = createFileRoute("/_admin/admin/")({
  head: () => ({
    meta: [
      { title: "Admin dashboard — Pahana" },
      { name: "description", content: "Pahana system statistics and recent activity." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin dashboard — Pahana" },
      { property: "og:description", content: "Pahana admin overview." },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const orders = useQuery({ queryKey: ["admin", "orders"], queryFn: fetchAllOrders });
  const users = useQuery({ queryKey: ["admin", "users"], queryFn: fetchAllUsers });
  const msgs = useQuery({ queryKey: ["admin", "messages"], queryFn: fetchAllMessages });
  const reviews = useQuery({ queryKey: ["admin", "reviews"], queryFn: fetchAllReviews });

  const o = orders.data ?? [];
  const revenue = o
    .filter((x) => x.payment_status === "Payment Verified")
    .reduce((s, x) => s + Number(x.price ?? 0), 0);
  const toVerify = o.filter((x) => x.payment_status === "Payment Submitted").length;
  const unread = (msgs.data ?? []).filter((m) => m.sender === "student" && !m.read).length;
  const pendingReviews = (reviews.data ?? []).filter((r) => !r.approved).length;
  const max = Math.max(1, ...ALL_STATUSES.map((s) => o.filter((x) => x.status === s).length));

  return (
    <>
      <h2>Dashboard</h2>
      <p className="mut">System overview.</p>
      <div className="g g4" style={{ marginTop: 18 }}>
        <Stat label="Users" value={(users.data ?? []).length} />
        <Stat label="Orders" value={o.length} />
        <Stat label="Verified revenue" value={<span style={{ fontSize: "1.2rem" }}>{lkr(revenue)}</span>} />
        <Stat label="Payments to verify" value={toVerify} />
        <Stat label="Unread messages" value={unread} />
        <Stat label="Reviews pending" value={pendingReviews} />
        <Stat label="Suspended users" value={(users.data ?? []).filter((u) => u.suspended).length} />
        <Stat label="Completed" value={o.filter((x) => ["Completed", "Delivered"].includes(x.status)).length} />
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <h3>Orders by status</h3>
        <div className="bars">
          {ALL_STATUSES.map((s) => {
            const n = o.filter((x) => x.status === s).length;
            return (
              <div key={s}>
                <span>{s}</span>
                <i style={{ width: `${(n / max) * 60}%`, minWidth: n ? 6 : 0 }} />
                {n}
              </div>
            );
          })}
        </div>
      </div>

      <h3 style={{ marginTop: 24 }}>Latest orders</h3>
      {o.slice(0, 6).map((x) => (
        <Link className="it" key={x.id} to="/admin/orders/$orderId" params={{ orderId: x.id }}>
          <b>
            {x.code} · {x.title}
            <small style={{ display: "block" }}>{fmtDate(x.created_at)}</small>
          </b>
          <span className="pill">{x.status}</span>
          <small>{lkr(x.price)}</small>
        </Link>
      ))}
    </>
  );
}
