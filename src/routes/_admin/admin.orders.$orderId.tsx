import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Empty } from "@/components/site";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { downloadFile, fetchOrder, fetchOrderFiles, notify, uploadOrderFiles, type OrderFile } from "@/lib/queries";
import { ALL_STATUSES, PAYMENT_STATUSES, STATUS_NOTICE, fmtDate, kb } from "@/lib/pahana";

export const Route = createFileRoute("/_admin/admin/orders/$orderId")({
  head: () => ({
    meta: [
      { title: "Manage order — Pahana admin" },
      { name: "description", content: "Update status, price, files and delivery for an order." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Manage order — Pahana admin" },
      { property: "og:description", content: "Manage an order." },
    ],
  }),
  component: AdminOrder,
});

function AdminOrder() {
  const { orderId } = Route.useParams();
  const auth = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const order = useQuery({ queryKey: ["order", orderId], queryFn: () => fetchOrder(orderId) });
  const files = useQuery({ queryKey: ["order-files", orderId], queryFn: () => fetchOrderFiles(orderId) });
  const [f, setF] = useState({ status: "", payment_status: "", price: "", admin_notes: "", delivery_msg: "" });
  const [delivery, setDelivery] = useState<File[]>([]);

  useEffect(() => {
    const o = order.data;
    if (o)
      setF({
        status: o.status,
        payment_status: o.payment_status,
        price: o.price ? String(o.price) : "",
        admin_notes: o.admin_notes ?? "",
        delivery_msg: o.delivery_msg ?? "",
      });
  }, [order.data?.updated_at]);

  const save = useMutation({
    mutationFn: async () => {
      const o = order.data!;
      const { error } = await supabase
        .from("orders")
        .update({
          status: f.status as never,
          payment_status: f.payment_status as never,
          price: f.price ? Number(f.price) : null,
          admin_notes: f.admin_notes,
          delivery_msg: f.delivery_msg || null,
        })
        .eq("id", orderId);
      if (error) throw error;
      if (f.status !== o.status) {
        await supabase.from("order_events").insert({ order_id: orderId, status: f.status as never });
        if (STATUS_NOTICE[f.status]) await notify(o.user_id, `${o.code}: ${STATUS_NOTICE[f.status]}`);
      }
      if (f.payment_status !== o.payment_status && f.payment_status === "Payment Verified")
        await notify(o.user_id, `${o.code}: Your payment has been verified.`);
      if (delivery.length) {
        await uploadOrderFiles(delivery, { orderId, ownerId: o.user_id, uploaderId: auth.user!.id, kind: "delivery" });
        setDelivery([]);
      }
    },
    onSuccess: async () => {
      await qc.invalidateQueries();
      toast.success("Order updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeFile = useMutation({
    mutationFn: async (file: OrderFile) => {
      await supabase.storage.from("assignments").remove([file.path]);
      const { error } = await supabase.from("order_files").delete().eq("id", file.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["order-files", orderId] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async () => {
      const paths = (files.data ?? []).map((x) => x.path);
      if (paths.length) await supabase.storage.from("assignments").remove(paths);
      const { error } = await supabase.from("orders").delete().eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.invalidateQueries();
      toast.success("Order deleted");
      navigate({ to: "/admin/orders" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (order.isLoading) return <p className="mut">Loading…</p>;
  const o = order.data;
  if (!o) return <Empty title="Order not found" />;

  return (
    <>
      <Link to="/admin/orders" className="mut">← All orders</Link>
      <h2 style={{ marginTop: 8 }}>{o.code} · {o.title}</h2>
      <p className="mut">{o.service_name} · {o.module} · due {fmtDate(o.deadline)} · {o.phone}</p>

      <div className="card" style={{ marginTop: 18 }}>
        <h3>Brief</h3>
        <p className="mut" style={{ whiteSpace: "pre-wrap", marginTop: 6 }}>{o.description}</p>
        <small style={{ display: "block", marginTop: 10 }}>
          {o.assign_type} · {o.word_count ?? "—"} words · {o.ref_style} · {o.university} · budget {o.budget ?? "—"}
        </small>
        {o.extra && <p className="mut" style={{ marginTop: 8 }}>{o.extra}</p>}
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <h3>Files</h3>
        {(files.data ?? []).length === 0 && <p className="mut">No files.</p>}
        {(files.data ?? []).map((x) => (
          <div className="it" key={x.id}>
            <b>{x.name}</b>
            <span className="pill">{x.kind}</span>
            <small>{kb(x.size)}</small>
            <button className="btn b2 sm" onClick={() => downloadFile(x)}>Download</button>
            <button className="x" aria-label="Delete file" onClick={() => confirm(`Delete ${x.name}?`) && removeFile.mutate(x)}>✕</button>
          </div>
        ))}
      </div>

      <form className="card" style={{ marginTop: 18 }} onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
        <h3>Manage</h3>
        <div className="fm">
          <div>
            <label>Status</label>
            <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
              {ALL_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label>Payment</label>
            <select value={f.payment_status} onChange={(e) => setF({ ...f, payment_status: e.target.value })}>
              {PAYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label>Price (LKR)</label>
            <input type="number" min="0" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} />
          </div>
          <div className="full">
            <label>Internal notes (staff only)</label>
            <textarea value={f.admin_notes} onChange={(e) => setF({ ...f, admin_notes: e.target.value })} />
          </div>
          <div className="full">
            <label>Delivery message to student</label>
            <textarea value={f.delivery_msg} onChange={(e) => setF({ ...f, delivery_msg: e.target.value })} />
          </div>
          <div className="full">
            <label>Upload delivery files</label>
            <input type="file" multiple onChange={(e) => setDelivery(Array.from(e.target.files ?? []))} />
          </div>
        </div>
        <div className="bt" style={{ marginTop: 16 }}>
          <button className={`btn${save.isPending ? " ld" : ""}`}>Save changes</button>
          <button type="button" className="btn dg" onClick={() => confirm("Delete this order and its files permanently?") && del.mutate()}>
            Delete order
          </button>
        </div>
      </form>
    </>
  );
}
