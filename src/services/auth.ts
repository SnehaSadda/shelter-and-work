import { supabase } from "@/integrations/supabase/client";

export type Role = "user" | "ngo" | "employer";

export async function signUpWithEmail(args: {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  orgName?: string;
  role: Role;
}) {
  const redirectUrl = `${window.location.origin}/dashboard`;
  return supabase.auth.signUp({
    email: args.email,
    password: args.password,
    options: {
      emailRedirectTo: redirectUrl,
      data: {
        name: args.name,
        phone: args.phone,
        org_name: args.orgName,
        role: args.role,
      },
    },
  });
}

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getCurrentRoles(userId: string): Promise<Role[]> {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).map((r) => r.role as Role);
}
