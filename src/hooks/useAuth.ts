import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  university: string | null;
  student_id: string | null;
  avatar_url: string | null;
  provider: string | null;
  suspended: boolean;
  created_at: string;
};

export type AuthState = {
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
};

async function loadAuth(): Promise<AuthState> {
  const { data } = await supabase.auth.getUser();
  const user = data.user ?? null;
  if (!user) return { user: null, profile: null, isAdmin: false };

  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", user.id),
  ]);

  return {
    user,
    profile: (profile as Profile | null) ?? null,
    isAdmin: (roles ?? []).some((r: { role: string }) => r.role === "admin"),
  };
}

export function useAuth() {
  const query = useQuery({ queryKey: ["auth"], queryFn: loadAuth, staleTime: 30_000 });
  return {
    ...(query.data ?? { user: null, profile: null, isAdmin: false }),
    isLoading: query.isLoading,
  };
}

export function displayName(auth: { profile: Profile | null; user: User | null }) {
  return auth.profile?.full_name || auth.user?.email?.split("@")[0] || "Student";
}

export function useSignOut() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return async (to: "/login" | "/admin-login" = "/login") => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to, replace: true });
  };
}
