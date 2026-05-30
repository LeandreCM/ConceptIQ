import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { LogIn, LogOut, UserPlus } from "lucide-react";

interface AuthPanelProps {
  user: User | null;
  configured: boolean;
  loading: boolean;
  error: string | null;
  message: string | null;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string, username: string, displayName: string) => Promise<void>;
  onSignOut: () => Promise<void>;
}

export function AuthPanel({ user, configured, loading, error, message, onSignIn, onSignUp, onSignOut }: AuthPanelProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");

  async function submit() {
    if (mode === "signup") {
      await onSignUp(email, password, username, displayName);
      return;
    }

    await onSignIn(email, password);
  }

  if (!configured) {
    return (
      <div className="surface p-5">
        <h2 className="text-2xl font-bold">Account</h2>
        <p className="mt-3 text-white/64">
          Supabase is not configured yet. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to use accounts.
        </p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="surface p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold uppercase text-pulse">Signed in</p>
            <h2 className="mt-1 text-2xl font-black">{user.user_metadata.display_name || user.user_metadata.username || user.email}</h2>
            <p className="mt-1 text-white/58">{user.email}</p>
          </div>
          <button className="btn-secondary" type="button" onClick={onSignOut} disabled={loading}>
            <LogOut className="h-4 w-4" />
            Log Out
          </button>
        </div>
        {error ? <p className="mt-4 rounded-lg border border-bloom/30 bg-bloom/10 p-3 text-sm text-bloom">{error}</p> : null}
        {message ? <p className="mt-4 rounded-lg border border-mint/30 bg-mint/10 p-3 text-sm text-mint">{message}</p> : null}
      </div>
    );
  }

  return (
    <div className="surface p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase text-pulse">Account</p>
          <h2 className="mt-1 text-2xl font-black">{mode === "signup" ? "Create your ConceptIQ account" : "Log in to sync progress"}</h2>
        </div>
        <div className="flex gap-2">
          <button className={mode === "login" ? "btn-primary" : "btn-secondary"} type="button" onClick={() => setMode("login")}>
            Log In
          </button>
          <button className={mode === "signup" ? "btn-primary" : "btn-secondary"} type="button" onClick={() => setMode("signup")}>
            Sign Up
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        <label>
          <span className="mb-2 block text-sm font-semibold text-white/64">Email</span>
          <input
            className="w-full rounded-lg border border-white/10 bg-white/8 px-4 py-3 font-semibold"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            placeholder="you@example.com"
          />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-white/64">Password</span>
          <input
            className="w-full rounded-lg border border-white/10 bg-white/8 px-4 py-3 font-semibold"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            placeholder="At least 6 characters"
          />
        </label>
        {mode === "signup" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-semibold text-white/64">Username</span>
              <input
                className="w-full rounded-lg border border-white/10 bg-white/8 px-4 py-3 font-semibold"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="the_architect"
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-white/64">Display name</span>
              <input
                className="w-full rounded-lg border border-white/10 bg-white/8 px-4 py-3 font-semibold"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="The Architect"
              />
            </label>
          </div>
        ) : null}
      </div>

      {error ? <p className="mt-4 rounded-lg border border-bloom/30 bg-bloom/10 p-3 text-sm text-bloom">{error}</p> : null}
      {message ? <p className="mt-4 rounded-lg border border-mint/30 bg-mint/10 p-3 text-sm text-mint">{message}</p> : null}

      <button className="btn-primary mt-5 w-full" type="button" onClick={submit} disabled={loading || !email || !password}>
        {mode === "signup" ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
        {loading ? "Working..." : mode === "signup" ? "Sign Up" : "Log In"}
      </button>
    </div>
  );
}
