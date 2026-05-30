import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

export async function completeEmailConfirmationLogin(client: SupabaseClient<Database>): Promise<User | null> {
  const queryParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash);
  const authError = queryParams.get("error_description") ?? hashParams.get("error_description") ?? queryParams.get("error") ?? hashParams.get("error");

  if (authError) {
    cleanAuthCallbackUrl("settings");
    throw new Error(authError);
  }

  const code = queryParams.get("code");
  if (code) {
    const { data, error } = await client.auth.exchangeCodeForSession(code);

    if (error) {
      cleanAuthCallbackUrl("settings");
      throw error;
    }

    cleanAuthCallbackUrl("settings");
    return data.session?.user ?? data.user ?? null;
  }

  const accessToken = hashParams.get("access_token");
  const refreshToken = hashParams.get("refresh_token");

  if (accessToken && refreshToken) {
    const { data, error } = await client.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      cleanAuthCallbackUrl("settings");
      throw error;
    }

    cleanAuthCallbackUrl("settings");
    return data.session?.user ?? data.user ?? null;
  }

  return null;
}

function cleanAuthCallbackUrl(page: string) {
  window.history.replaceState({}, document.title, `${window.location.pathname}#${page}`);
}
