import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Save, Trash2 } from "lucide-react";
import { AuthPanel } from "../components/AuthPanel";
import type { UserProfile } from "../types";

interface SettingsProps {
  profile: UserProfile;
  user: User | null;
  configured: boolean;
  authLoading: boolean;
  dataLoading: boolean;
  error: string | null;
  message: string | null;
  onProfileChange: (profile: UserProfile) => Promise<void> | void;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string, username: string, displayName: string) => Promise<void>;
  onSignOut: () => Promise<void>;
  onReset: () => Promise<void> | void;
}

export function Settings({
  profile,
  user,
  configured,
  authLoading,
  dataLoading,
  error,
  message,
  onProfileChange,
  onSignIn,
  onSignUp,
  onSignOut,
  onReset,
}: SettingsProps) {
  const [username, setUsername] = useState(profile.username);
  const [displayName, setDisplayName] = useState(profile.displayName);

  useEffect(() => {
    setUsername(profile.username);
    setDisplayName(profile.displayName);
  }, [profile.displayName, profile.username]);

  async function saveSettings() {
    await onProfileChange({
      ...profile,
      username: username.trim() || "Local Thinker",
      displayName: displayName.trim() || username.trim() || "Local Thinker",
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase text-pulse">Settings</p>
        <h1 className="mt-2 text-4xl font-black">Account and profile</h1>
        <p className="mt-3 max-w-2xl text-white/64">
          Logged-in accounts sync attempts, achievements, profile stats, and leaderboard presence through Supabase.
        </p>
      </div>

      <AuthPanel
        user={user}
        configured={configured}
        loading={authLoading || dataLoading}
        error={error}
        message={message}
        onSignIn={onSignIn}
        onSignUp={onSignUp}
        onSignOut={onSignOut}
      />

      <section className="surface p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">Public profile</h2>
            <p className="mt-1 text-sm text-white/58">
              {user ? `Signed in as ${user.email}` : "Demo mode saves these values locally in this browser."}
            </p>
          </div>
          {dataLoading ? <span className="pill">Syncing...</span> : <span className="pill">{user ? "Supabase" : "Local demo"}</span>}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-semibold text-white/64">Username</span>
            <input
              className="w-full rounded-lg border border-white/10 bg-white/8 px-4 py-3 text-lg font-semibold"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-white/64">Display name</span>
            <input
              className="w-full rounded-lg border border-white/10 bg-white/8 px-4 py-3 text-lg font-semibold"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button className="btn-primary" type="button" onClick={saveSettings} disabled={dataLoading}>
            <Save className="h-4 w-4" />
            Save Profile
          </button>
          <button className="btn-secondary border-bloom/30 text-bloom hover:bg-bloom/10" type="button" onClick={onReset} disabled={dataLoading}>
            <Trash2 className="h-4 w-4" />
            Reset Progress
          </button>
        </div>
      </section>
    </div>
  );
}
