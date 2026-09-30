import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Icon } from "@/components/Icon";
import { Empty } from "@/components/site";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { fetchAdminRoles, fetchAllOrders, fetchAllUsers, type AdminUser } from "@/lib/queries";
import { fmtDate } from "@/lib/pahana";

export const Route = createFileRoute("/_admin/admin/students")({
  head: () => ({
    meta: [
      { title: "Users — Pahana admin" },
      { name: "description", content: "View and manage Pahana user accounts." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Users — Pahana admin" },
      { property: "og:description", content: "Manage user accounts." },
    ],
  }),
  component: AdminUsers,
});

function AdminUsers() {
  const me = useAuth();
  const qc = useQueryClient();
  const users = useQuery({ queryKey: ["admin", "users"], queryFn: fetchAllUsers });
  const roles = useQuery({ queryKey: ["admin", "roles"], queryFn: fetchAdminRoles });
  const orders = useQuery({ queryKey: ["admin", "orders"], queryFn: fetchAllOrders });
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const isAdmin = (id: string) => (roles.data ?? []).some((r) => r.user_id === id && r.role === "admin");

  const suspend = useMutation({
    mutationFn: async (u: AdminUser) => {
      const { error } = await supabase.from("profiles").update({ suspended: !u.suspended }).eq("id", u.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "users"] }); toast.success("Updated"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleAdmin = useMutation({
    mutationFn: async (u: AdminUser) => {
      if (isAdmin(u.id)) {
        const { error } = await supabase.from("user_roles").delete().eq("user_id", u.id).eq("role", "admin");
        if (error) throw error;
      } else {
        const { error } = await supabase.from("user_roles").insert({ user_id: u.id, role: "admin" });
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "roles"] }); toast.success("Role updated"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const list = (users.data ?? []).filter((u) =>
    !q || `${u.full_name} ${u.email} ${u.university} ${u.student_id}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <>
      <h2>Users</h2>
      <p className="mut">{(users.data ?? []).length} registered accounts.</p>
      <div className="sr">
        <Icon name="search" />
        <input placeholder="Search name, email, campus" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {list.length === 0 ? <Empty title="No users" /> : list.map((u) => {
        const count = (orders.data ?? []).filter((o) => o.user_id === u.id).length;
        return (
          <div key={u.id}>
            <div className="it" style={{ cursor: "pointer" }} onClick={() => setOpen(open === u.id ? null : u.id)}>
              <b>
                {u.full_name || u.email}
                <small style={{ display: "block" }}>{u.email} · joined {fmtDate(u.created_at)}</small>
              </b>
              {isAdmin(u.id) && <span className="pill">Admin</span>}
              <span className={`pill ${u.suspended ? "no" : "ok"}`}>{u.suspended ? "Suspended" : "Active"}</span>
              <small>{count} orders</small>
            </div>
            {open === u.id && (
              <div className="card" style={{ margin: "-4px 0 12px" }}>
                <div className="g">
                  <div><small>Phone</small><b style={{ display: "block" }}>{u.phone || "—"}</b></div>
                  <div><small>Campus</small><b style={{ display: "block" }}>{u.university || "—"}</b></div>
                  <div><small>Student ID</small><b style={{ display: "block" }}>{u.student_id || "—"}</b></div>
                  <div><small>Sign-in method</small><b style={{ display: "block" }}>{u.provider || "email"}</b></div>
                </div>
                {u.id !== me.user?.id && (
                  <div className="bt" style={{ marginTop: 14 }}>
                    <button className={`btn sm ${u.suspended ? "" : "dg"}`} onClick={() => suspend.mutate(u)}>
                      {u.suspended ? "Reactivate" : "Suspend"}
                    </button>
                    <button className="btn b2 sm" onClick={() => confirm(isAdmin(u.id) ? "Remove admin access?" : "Grant admin access?") && toggleAdmin.mutate(u)}>
                      {isAdmin(u.id) ? "Remove admin" : "Make admin"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
