import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Icon } from "@/components/Icon";
import { PublicPage } from "@/components/site";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin-login")({
  head: () => ({
    meta: [
      { title: "Staff login — Pahana" },
      { name: "description", content: "Secure sign-in for Pahana staff and administrators." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Staff login — Pahana" },
      { property: "og:description", content: "Secure sign-in for Pahana staff." },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErr(error.message);
      setBusy(false);
      return;
    }
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .eq("role", "admin");
    if (!roles || roles.length === 0) {
      await supabase.auth.signOut();
      setErr("This account does not have admin access.");
      setBusy(false);
      return;
    }
    await queryClient.invalidateQueries();
    navigate({ to: "/admin" });
  }

  return (
    <PublicPage>
      <div className="w">
        <div className="card auth">
          <div className="ico">
            <Icon name="shield" />
          </div>
          <h2>Staff login</h2>
          <p className="mut">Authorised Pahana administrators only.</p>
          <form onSubmit={submit}>
            <label htmlFor="ae">Work email</label>
            <input
              id="ae"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="ap">Password</label>
            <input
              id="ap"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="err">{err}</p>
            <button className={`btn lg2${busy ? " ld" : ""}`} style={{ width: "100%" }}>
              Enter admin panel
            </button>
          </form>
          <p className="mut" style={{ marginTop: 18, fontSize: ".9rem" }}>
            Student?{" "}
            <Link to="/login" style={{ color: "var(--ac)", fontWeight: 600 }}>
              Use the student login
            </Link>
          </p>
        </div>
      </div>
    </PublicPage>
  );
}
