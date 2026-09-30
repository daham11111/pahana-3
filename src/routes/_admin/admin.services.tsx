import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { fetchAllServices, type Service } from "@/lib/queries";
import { lkr } from "@/lib/pahana";

export const Route = createFileRoute("/_admin/admin/services")({
  head: () => ({
    meta: [
      { title: "Services — Pahana admin" },
      { name: "description", content: "Add, edit and remove services shown on the website." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Services — Pahana admin" },
      { property: "og:description", content: "Manage website services." },
    ],
  }),
  component: AdminServices,
});

const BLANK = { icon: "📄", name: "", description: "", price: "", turnaround: "3–5 days", active: true, sort_order: "0" };

function AdminServices() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["services", "all"], queryFn: fetchAllServices });
  const [edit, setEdit] = useState<string | null>(null);
  const [f, setF] = useState({ ...BLANK });

  const start = (s?: Service) => {
    setEdit(s?.id ?? "new");
    setF(s ? { icon: s.icon, name: s.name, description: s.description, price: String(s.price ?? ""), turnaround: s.turnaround, active: s.active, sort_order: String(s.sort_order) } : { ...BLANK, sort_order: String((data?.length ?? 0) + 1) });
  };

  const save = useMutation({
    mutationFn: async () => {
      const row = { icon: f.icon, name: f.name, description: f.description, price: Number(f.price || 0), turnaround: f.turnaround, active: f.active, sort_order: Number(f.sort_order || 0) };
      const { error } = edit === "new"
        ? await supabase.from("services").insert(row)
        : await supabase.from("services").update(row).eq("id", edit!);
      if (error) throw error;
    },
    onSuccess: () => { setEdit(null); qc.invalidateQueries({ queryKey: ["services"] }); toast.success("Service saved"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["services"] }); toast.success("Service deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <h2>Services</h2>
      <p className="mut">These appear on the website and in the student order form.</p>
      <button className="btn sm" style={{ marginTop: 12 }} onClick={() => start()}>Add service</button>

      {edit && (
        <form className="card" style={{ marginTop: 16 }} onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
          <h3>{edit === "new" ? "New service" : "Edit service"}</h3>
          <div className="fm">
            <div><label>Icon (emoji)</label><input value={f.icon} onChange={(e) => setF({ ...f, icon: e.target.value })} /></div>
            <div><label>Name</label><input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
            <div><label>Starting price (LKR, 0 = custom quote)</label><input type="number" min="0" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} /></div>
            <div><label>Turnaround</label><input value={f.turnaround} onChange={(e) => setF({ ...f, turnaround: e.target.value })} /></div>
            <div><label>Display order</label><input type="number" value={f.sort_order} onChange={(e) => setF({ ...f, sort_order: e.target.value })} /></div>
            <div className="full"><label>Description</label><textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
          </div>
          <label className="ck"><input type="checkbox" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} /> Show on website</label>
          <div className="bt" style={{ marginTop: 14 }}>
            <button className={`btn${save.isPending ? " ld" : ""}`}>Save</button>
            <button type="button" className="btn b2" onClick={() => setEdit(null)}>Cancel</button>
          </div>
        </form>
      )}

      <div style={{ marginTop: 14 }}>
        {(data ?? []).map((s) => (
          <div className="it" key={s.id}>
            <span style={{ fontSize: "1.3rem" }}>{s.icon}</span>
            <b>{s.name}<small style={{ display: "block" }}>{lkr(s.price)} · {s.turnaround}</small></b>
            <span className={`pill ${s.active ? "ok" : "no"}`}>{s.active ? "Visible" : "Hidden"}</span>
            <button className="btn b2 sm" onClick={() => start(s)}>Edit</button>
            <button className="x" aria-label="Delete" onClick={() => confirm(`Delete ${s.name}?`) && del.mutate(s.id)}>✕</button>
          </div>
        ))}
      </div>
    </>
  );
}
