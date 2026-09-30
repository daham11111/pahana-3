import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Icon } from "@/components/Icon";
import { Empty } from "@/components/site";
import { fetchAllOrders, fetchAllUsers } from "@/lib/queries";
import { ALL_STATUSES, fmtDate, lkr } from "@/lib/pahana";

export const Route = createFileRoute("/_admin/admin/orders/")({
  head: () => ({
    meta: [
      { title: "Orders — Pahana admin" },
      { name: "description", content: "All student orders and uploaded assignments." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Orders — Pahana admin" },
      { property: "og:description", content: "Manage all orders." },
    ],
  }),
  component: AdminOrders,
});

function AdminOrders() {
  const orders = useQuery({ queryKey: ["admin", "orders"], queryFn: fetchAllOrders });
  const users = useQuery({ queryKey: ["admin", "users"], queryFn: fetchAllUsers });
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const name = (id: string) => users.data?.find((u) => u.id === id)?.full_name || users.data?.find((u) => u.id === id)?.email || "";

  const list = (orders.data ?? []).filter(
    (o) =>
      (!status || o.status === status) &&
      (!q || `${o.code} ${o.title} ${o.module} ${name(o.user_id)}`.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <>
      <h2>Orders</h2>
      <div className="sr">
        <Icon name="search" />
        <input placeholder="Search code, title, student" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <select style={{ maxWidth: 260 }} value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">All statuses</option>
        {ALL_STATUSES.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>
      {list.length === 0 ? (
        <Empty title="No orders" />
      ) : (
        <div style={{ marginTop: 14 }}>
          {list.map((o) => (
            <Link className="it" key={o.id} to="/admin/orders/$orderId" params={{ orderId: o.id }}>
              <b>
                {o.code} · {o.title}
                <small style={{ display: "block" }}>
                  {name(o.user_id)} · due {fmtDate(o.deadline)}
                </small>
              </b>
              <span className="pill">{o.status}</span>
              <span className={`pill ${o.payment_status === "Payment Verified" ? "ok" : "no"}`}>{o.payment_status}</span>
              <small>{lkr(o.price)}</small>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
