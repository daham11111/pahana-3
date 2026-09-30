import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { fetchSettings } from "@/lib/queries";

export const Route = createFileRoute("/_admin/admin/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Pahana admin" },
      { name: "description", content: "Bank details and pricing tiers shown on the website." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Settings — Pahana admin" },
      { property: "og:description", content: "Site settings." },
    ],
  }),
  component: AdminSettings,
});

function AdminSettings() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });
  const [f, setF] = useState({ bank_name: "", account_name: "", account_no: "", branch: "", instructions: "" });
  const [tiers, setTiers] = useState<[string, number][]>([]);

  useEffect(() => {
    if (data) {
      setF({ bank_name: data.bank_name, account_name: data.account_name, account_no: data.account_no, branch: data.branch, instructions: data.instructions });
      setTiers(data.tiers ?? []);
    }
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("site_settings").update({ ...f, tiers: tiers as never }).eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["settings"] }); toast.success("Settings saved"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const field = (k: keyof typeof f, label: string) => (
    <div>
      <label>{label}</label>
      <input value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
    </div>
  );

  return (
    <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
      <h2>Settings</h2>
      <div className="card" style={{ marginTop: 16 }}>
        <h3>Bank details</h3>
        <div className="fm">
          {field("bank_name", "Bank")}
          {field("account_name", "Account name")}
          {field("account_no", "Account number")}
          {field("branch", "Branch")}
          <div className="full">
            <label>Payment instructions</label>
            <textarea value={f.instructions} onChange={(e) => setF({ ...f, instructions: e.target.value })} />
          </div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <h3>Pricing tiers (LKR per word)</h3>
        {tiers.map(([label, rate], i) => (
          <div className="cmp" key={i}>
            <input value={label} onChange={(e) => setTiers(tiers.map((t, j) => (j === i ? [e.target.value, t[1]] : t)))} />
            <input type="number" style={{ maxWidth: 120 }} value={rate} onChange={(e) => setTiers(tiers.map((t, j) => (j === i ? [t[0], Number(e.target.value)] : t)))} />
            <button type="button" className="x" onClick={() => setTiers(tiers.filter((_, j) => j !== i))}>✕</button>
          </div>
        ))}
        <button type="button" className="btn b2 sm" style={{ marginTop: 12 }} onClick={() => setTiers([...tiers, ["New tier", 0]])}>Add tier</button>
      </div>
      <button className={`btn lg2${save.isPending ? " ld" : ""}`} style={{ marginTop: 16 }}>Save settings</button>
    </form>
  );
}
