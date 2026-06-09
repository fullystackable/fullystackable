import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getSupabasePublicConfig, getSupabaseServerKey } from "@/lib/supabase/config";

export function createSupabaseServerClient() {
  const { url } = getSupabasePublicConfig();
  const serverKey = getSupabaseServerKey();

  return createClient(url, serverKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
