import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Icon } from "@/components/Icon";
import { Logo, ThemeButton } from "@/components/site";
import { displayName, useAuth, useSignOut } from "@/hooks/useAuth";

export type ShellItem = {
  to: string;
  icon: string;
  label: string;
  badge?: number;
  exact?: boolean;
};

export function AppShell({
  items,
  children,
  signOutTo = "/login",
  subtitle,
}: {
  items: ShellItem[];
  children: ReactNode;
  signOutTo?: "/login" | "/admin-login";
  subtitle?: string;
}) {
  const auth = useAuth();
  const signOut = useSignOut();
  const name = displayName(auth);

  const link = (item: ShellItem) => (
    <Link
      key={item.to}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      to={item.to as any}
      activeProps={{ className: "on" }}
      activeOptions={{ exact: item.exact ?? false }}
    >
      <Icon name={item.icon} />
      <em>{item.label}</em>
      {item.badge ? <em className="dot">{item.badge}</em> : null}
    </Link>
  );

  return (
    <div className="app">
      <aside>
        <Logo />
        <nav className="side">{items.map(link)}</nav>
        <button className="btn b2 sm" type="button" onClick={() => signOut(signOutTo)}>
          <Icon name="out" />
          Sign out
        </button>
      </aside>

      <main>
        <div className="top">
          <div className="mob">
            <Logo />
          </div>
          <div className="sp" />
          <div className="who">
            <b>{name}</b>
            <small>{subtitle ?? auth.profile?.email}</small>
          </div>
          {auth.profile?.avatar_url ? (
            <img className="av" src={auth.profile.avatar_url} alt="" />
          ) : (
            <div className="av">{name.charAt(0).toUpperCase()}</div>
          )}
          <ThemeButton />
          <button
            className="tt"
            type="button"
            title="Sign out"
            aria-label="Sign out"
            onClick={() => signOut(signOutTo)}
          >
            <Icon name="out" />
          </button>
        </div>
        {children}
      </main>

      <nav className="bn">{items.map(link)}</nav>
    </div>
  );
}
