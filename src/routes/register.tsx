import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { OAuthButtons } from "@/components/OAuthButtons";
import { PublicPage } from "@/components/site";
import { supabase } from "@/integrations/supabase/client";
import { CAMPUSES, PASSWORD_RE } from "@/lib/pahana";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your account — Pahana" },
      {
        name: "description",
        content:
          "Register free to submit assignment briefs, receive fixed LKR quotes and track your orders with Pahana.",
      },
      { property: "og:title", content: "Create your account — Pahana" },
      { property: "og:description", content: "Register free and submit your first brief in minutes." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    university: "",
    student_id: "",
    password: "",
    confirm: "",
    agree: false,
  });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!PASSWORD_RE.test(form.password)) {
      setErr("Password needs 8+ characters with upper, lower, a number and a symbol.");
      return;
    }
    if (form.password !== form.confirm) {
      setErr("Passwords do not match.");
      return;
    }
    if (!form.agree) {
      setErr("Please accept the terms to continue.");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: form.full_name,
          phone: form.phone,
          university: form.university,
          student_id: form.student_id,
        },
      },
    });
    if (error) {
      setErr(error.message);
      setBusy(false);
      return;
    }
    if (!data.session) {
      setSent(true);
      setBusy(false);
      return;
    }
    await queryClient.invalidateQueries();
    toast.success("Account created");
    navigate({ to: "/dashboard" });
  }

  if (sent) {
    return (
      <PublicPage>
        <div className="w">
          <div className="card auth">
            <h2>Check your email</h2>
            <p className="mut" style={{ marginTop: 8 }}>
              We sent a confirmation link to <b>{form.email}</b>. Click it to activate your account,
              then log in.
            </p>
            <Link className="btn" to="/login" style={{ marginTop: 18 }}>
              Go to log in
            </Link>
          </div>
        </div>
      </PublicPage>
    );
  }

  return (
    <PublicPage>
      <div className="w">
        <div className="card auth" style={{ maxWidth: 560 }}>
          <h2>Create your account</h2>
          <p className="mut">Free to join — you only pay once you accept a quote.</p>
          <form onSubmit={submit}>
            <div className="fm">
              <div>
                <label htmlFor="fn">Full name</label>
                <input
                  id="fn"
                  required
                  value={form.full_name}
                  onChange={(e) => set("full_name", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="em">Email</label>
                <input
                  id="em"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="ph">Phone</label>
                <input
                  id="ph"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="sid">Student ID (optional)</label>
                <input
                  id="sid"
                  value={form.student_id}
                  onChange={(e) => set("student_id", e.target.value)}
                />
              </div>
              <div className="full">
                <label htmlFor="uni">University / campus</label>
                <select
                  id="uni"
                  required
                  value={form.university}
                  onChange={(e) => set("university", e.target.value)}
                >
                  <option value="">Select your campus</option>
                  {Object.entries(CAMPUSES).map(([group, list]) => (
                    <optgroup key={group} label={group}>
                      {list.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="pw">Password</label>
                <input
                  id="pw"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="pw2">Confirm password</label>
                <input
                  id="pw2"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={form.confirm}
                  onChange={(e) => set("confirm", e.target.value)}
                />
              </div>
            </div>
            <label className="ck" style={{ marginTop: 16 }}>
              <input
                type="checkbox"
                checked={form.agree}
                onChange={(e) => set("agree", e.target.checked)}
              />
              <span>
                I agree to the terms and understand Pahana provides academic assistance, not
                guaranteed grades.
              </span>
            </label>
            <p className="err">{err}</p>
            <button className={`btn lg2${busy ? " ld" : ""}`} style={{ width: "100%" }}>
              Create account
            </button>
          </form>
          <OAuthButtons label="or sign up with" />
          <p className="mut" style={{ marginTop: 18, fontSize: ".9rem" }}>
            Already registered?{" "}
            <Link to="/login" style={{ color: "var(--ac)", fontWeight: 600 }}>
              Log in
            </Link>
          </p>
        </div>
      </div>
    </PublicPage>
  );
}
