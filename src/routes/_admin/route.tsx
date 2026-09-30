import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { AppShell, type ShellItem } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/admin-login" });
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .eq("role", "admin");
    if (!roles || roles.length === 0) throw redirect({ to: "/admin-login" });
    return { user: data.user };
  },
  component: AdminLayout,
});

const ITEMS: ShellItem[] = [
  { to: "/admin", icon: "chart", label: "Dashboard", exact: true },
  { to: "/admin/orders", icon: "file", label: "Orders" },
  { to: "/admin/students", icon: "cap", label: "Users" },
  { to: "/admin/services", icon: "grid", label: "Services" },
  { to: "/admin/messages", icon: "msg", label: "Messages" },
  { to: "/admin/reviews", icon: "star", label: "Reviews" },
  { to: "/admin/settings", icon: "sliders", label: "Settings" },
];

function AdminLayout() {
  return (
    <AppShell items={ITEMS} signOutTo="/admin-login" subtitle="Administrator">
      <Outlet />
    </AppShell>
  );
}
