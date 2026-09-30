import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Empty } from "@/components/site";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllReviews, type Review } from "@/lib/queries";
import { fmtDate } from "@/lib/pahana";

export const Route = createFileRoute("/_admin/admin/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews — Pahana admin" },
      { name: "description", content: "Approve, hide or delete student reviews." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Reviews — Pahana admin" },
      { property: "og:description", content: "Moderate reviews." },
    ],
  }),
  component: AdminReviews,
});

function AdminReviews() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin", "reviews"], queryFn: fetchAllReviews });
  const done = () => { qc.invalidateQueries({ queryKey: ["admin", "reviews"] }); qc.invalidateQueries({ queryKey: ["reviews"] }); };

  const toggle = useMutation({
    mutationFn: async (r: Review) => {
      const { error } = await supabase.from("reviews").update({ approved: !r.approved }).eq("id", r.id);
      if (error) throw error;
    },
    onSuccess: done,
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: done,
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <h2>Reviews</h2>
      <p className="mut">Approved reviews show on the homepage.</p>
      {(data ?? []).length === 0 ? <Empty title="No reviews yet" /> : (data ?? []).map((r) => (
        <div className="it" key={r.id}>
          <b>
            {"★".repeat(r.rating)} {r.name}
            <small style={{ display: "block" }}>{r.body}</small>
            <small style={{ display: "block" }}>{fmtDate(r.created_at)}</small>
          </b>
          <span className={`pill ${r.approved ? "ok" : "no"}`}>{r.approved ? "Live" : "Pending"}</span>
          <button className="btn b2 sm" onClick={() => toggle.mutate(r)}>{r.approved ? "Hide" : "Approve"}</button>
          <button className="x" aria-label="Delete" onClick={() => confirm("Delete this review?") && del.mutate(r.id)}>✕</button>
        </div>
      ))}
    </>
  );
}
