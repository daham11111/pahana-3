import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Icon } from "@/components/Icon";
import { useAuth } from "@/hooks/useAuth";
import { toggleTheme } from "@/lib/theme";

export function Logo() {
  return (
    <Link to="/" className="lg">
      <i className="lm">
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path
            d="M12 3.5c1 3 5 4.8 5 8.6a5 5 0 0 1-10 0c0-2 1-3.2 2-4 0 2 1 3 2 3 0-3-1-5 1-7.6z"
            fill="#fff"
          />
        </svg>
      </i>
      Pahana
    </Link>
  );
}

export function ThemeButton() {
  return (
    <button
      className="tt"
      type="button"
      onClick={toggleTheme}
      aria-label="Switch between light and dark theme"
      title="Switch theme"
    >
      <Icon name="sun" className="i sun" />
      <Icon name="moon" className="i moon" />
    </button>
  );
}

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin } = useAuth();

  useEffect(() => setOpen(false), [user?.id]);

  return (
    <header className="nav">
      <div className="w">
        <Logo />
        <div className={`links${open ? " open" : ""}`} onClick={() => setOpen(false)}>
          <Link to="/services">Services</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/how-it-works">How it works</Link>
          <Link to="/faq">FAQ</Link>
          {user ? (
            isAdmin ? (
              <Link className="btn sm" to="/admin">
                Admin panel
              </Link>
            ) : (
              <Link className="btn sm" to="/dashboard">
                Dashboard
              </Link>
            )
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link className="btn sm" to="/register">
                Get started
              </Link>
            </>
          )}
        </div>
        <div className="nr">
          <ThemeButton />
          <button
            className="hb"
            type="button"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name={open ? "x" : "menu"} />
          </button>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer>
      <div className="w">
        <div className="g">
          <div>
            <Logo />
            <p className="mut" style={{ marginTop: 8 }}>
              Academic assistance for Sri Lankan campus students.
            </p>
          </div>
          <div>
            <b>Services</b>
            <Link to="/services">Assignment Writing</Link>
            <Link to="/services">Report Writing</Link>
            <Link to="/services">Programming Help</Link>
            <Link to="/services">Proofreading</Link>
          </div>
          <div>
            <b>Quick links</b>
            <Link to="/login">Log in</Link>
            <Link to="/register">Register</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/admin-login">Staff</Link>
          </div>
          <div>
            <b>Legal</b>
            <Link to="/faq">Terms &amp; Conditions</Link>
            <Link to="/faq">Privacy Policy</Link>
            <Link to="/faq">Refund Policy</Link>
          </div>
        </div>
        <p className="mut" style={{ marginTop: 22, fontSize: ".85rem" }}>
          Pahana provides academic assistance (guidance, formatting, research support and model
          material). Students remain responsible for following their institution&apos;s
          academic-integrity rules. We do not guarantee grades. © 2026 Pahana.
        </p>
      </div>
    </footer>
  );
}

export function PublicPage({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteNav />
      {children}
      <SiteFooter />
    </>
  );
}

export function Pill({ text, tone }: { text: string; tone?: "ok" | "no" }) {
  return <span className={`pill${tone ? " " + tone : ""}`}>{text}</span>;
}

export function Empty({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="emp">
      🗂️<b>{title}</b>
      {sub ? <p>{sub}</p> : null}
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="card stat">
      <small>{label}</small>
      <b>{value}</b>
    </div>
  );
}
