import { createClient, hasSupabaseServerEnv } from "@/lib/supabase/server";

export async function getSession() {
  if (!hasSupabaseServerEnv()) {
    return null;
  }

  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

export async function requireAdminSession() {
  const session = await getSession();
  return session;
}
