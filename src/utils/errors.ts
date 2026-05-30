type SupabaseLikeError = {
  code?: unknown;
  details?: unknown;
  hint?: unknown;
  message?: unknown;
};

export function appErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (error && typeof error === "object") {
    const supabaseError = error as SupabaseLikeError;
    const message = typeof supabaseError.message === "string" ? supabaseError.message : "";
    const details = typeof supabaseError.details === "string" ? supabaseError.details : "";
    const hint = typeof supabaseError.hint === "string" ? supabaseError.hint : "";
    const code = typeof supabaseError.code === "string" ? supabaseError.code : "";

    const combined = [message, details, hint].filter(Boolean).join(" ");

    if (code === "PGRST205" || /schema cache|could not find the table|relation .*does not exist/i.test(combined)) {
      return `Supabase tables are not ready. Run supabase-schema.sql in the Supabase SQL editor, then log in again. Supabase said: ${combined || code}`;
    }

    if (combined) {
      return combined;
    }
  }

  return fallback;
}
