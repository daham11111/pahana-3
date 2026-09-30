import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { OAuthButtons } from "@/components/OAuthButtons";
import { PublicPage } from "@/components/site";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — Pahana" },
      { name: "description", content: "Log in to your Pahana student dashboard to track orders, messages and payments." },
      { property: "og:title", content: "Log in — Pahana" },
      { property: "og:description", content: "Access your Pahana student dashboard." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
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
      .eq("user_id", data.user.id);
    await queryClient.invalidateQueries();
    toast.success("Welcome back!");
    const isAdmin = (roles ?? []).some((r: { role: string }) => r.role === "admin");
    navigate({ to: isAdmin ? "/admin" : "/dashboard" });
  }

  return (
    <PublicPage>
      <div className="w">
        <div className="card auth">
          <h2>Welcome back</h2>
          <p className="mut">Log in to track your assignments.</p>
          <form onSubmit={submit}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="err">{err}</p>
            <button className={`btn lg2${busy ? " ld" : ""}`} style={{ width: "100%" }}>
              Log in
            </button>
          </form>
          <OAuthButtons />
          <p className="mut" style={{ marginTop: 18, fontSize: ".9rem" }}>
            New here? <Link to="/register" style={{ color: "var(--ac)", fontWeight: 600 }}>Create an account</Link>
          </p>
          <p className="mut" style={{ marginTop: 6, fontSize: ".85rem" }}>
            Staff? <Link to="/admin-login" style={{ color: "var(--ac)" }}>Admin login</Link>
          </p>
        </div>
      </div>
    </PublicPage>
  );
}
