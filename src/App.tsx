import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Award, Brain, Home, Menu, Play, Settings as SettingsIcon, Trophy, User, X } from "lucide-react";
import { Achievements } from "./pages/Achievements";
import { Dashboard } from "./pages/Dashboard";
import { Leaderboard } from "./pages/Leaderboard";
import { Play as PlayPage } from "./pages/Play";
import { Profile } from "./pages/Profile";
import { Results } from "./pages/Results";
import { Settings } from "./pages/Settings";
import { isSupabaseConfigured, supabase } from "./lib/supabase";
import type { GameResult, PageKey, UserProfile } from "./types";
import { applyGameResultToProfile } from "./utils/scoring";
import {
  fetchRemoteProfile,
  resetRemoteProgress,
  saveRemoteGameState,
  saveRemoteProfile,
} from "./utils/supabaseData";
import {
  defaultProfile,
  getSessionGameCount,
  loadLastResult,
  loadProfile,
  resetProfile,
  saveLastResult,
  saveProfile,
  saveSessionGameCount,
} from "./utils/storage";

const navigation: Array<{ key: PageKey; label: string; icon: ReactNode }> = [
  { key: "home", label: "Home", icon: <Home className="h-4 w-4" /> },
  { key: "play", label: "Play", icon: <Play className="h-4 w-4" /> },
  { key: "results", label: "Results", icon: <Brain className="h-4 w-4" /> },
  { key: "leaderboard", label: "Leaderboard", icon: <Trophy className="h-4 w-4" /> },
  { key: "achievements", label: "Achievements", icon: <Award className="h-4 w-4" /> },
  { key: "profile", label: "Cognitive Profile", icon: <User className="h-4 w-4" /> },
  { key: "settings", label: "Settings", icon: <SettingsIcon className="h-4 w-4" /> },
];

function pageFromHash(): PageKey {
  const raw = window.location.hash.replace("#", "");
  return navigation.some((item) => item.key === raw) ? (raw as PageKey) : "home";
}

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(() => loadProfile());
  const [lastResult, setLastResult] = useState<GameResult | null>(() => loadLastResult());
  const [page, setPage] = useState<PageKey>(() => pageFromHash());
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [appError, setAppError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleHashChange = () => setPage(pageFromHash());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let active = true;

    async function loadInitialSession() {
      setAuthLoading(true);
      const { data, error } = await supabase!.auth.getSession();

      if (!active) {
        return;
      }

      if (error) {
        setAppError(error.message);
      }

      const user = data.session?.user ?? null;
      setAuthUser(user);

      if (user) {
        await loadRemoteUserProfile(user);
      }

      setAuthLoading(false);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setAuthUser(user);

      if (user) {
        void loadRemoteUserProfile(user);
        return;
      }

      setProfile(loadProfile());
      setLastResult(loadLastResult());
    });

    void loadInitialSession();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const unlockedLabel = useMemo(
    () => `${profile.achievementsUnlocked.length} unlock${profile.achievementsUnlocked.length === 1 ? "" : "s"}`,
    [profile.achievementsUnlocked.length],
  );

  function navigate(nextPage: PageKey) {
    setPage(nextPage);
    setMobileOpen(false);
    window.location.hash = nextPage;
  }

  async function loadRemoteUserProfile(user: SupabaseUser) {
    setDataLoading(true);
    setAppError(null);

    try {
      const remoteProfile = await fetchRemoteProfile(user);
      setProfile(remoteProfile);
      setLastResult(remoteProfile.history[0] ?? null);
    } catch (error) {
      setAppError(error instanceof Error ? error.message : "Could not load Supabase profile.");
    } finally {
      setDataLoading(false);
    }
  }

  async function updateProfile(nextProfile: UserProfile) {
    setProfile(nextProfile);

    if (!authUser) {
      saveProfile(nextProfile);
      return;
    }

    setDataLoading(true);
    setAppError(null);

    try {
      await saveRemoteProfile(authUser.id, nextProfile);
      await supabase?.auth.updateUser({
        data: {
          username: nextProfile.username,
          display_name: nextProfile.displayName,
        },
      });
    } catch (error) {
      setAppError(error instanceof Error ? error.message : "Could not save profile settings.");
    } finally {
      setDataLoading(false);
    }
  }

  async function handleGameComplete(result: GameResult) {
    const sessionGameCount = getSessionGameCount() + 1;
    saveSessionGameCount(sessionGameCount);
    const updated = applyGameResultToProfile(profile, result, sessionGameCount);
    setProfile(updated.profile);
    setLastResult(updated.result);

    if (!authUser) {
      saveProfile(updated.profile);
      saveLastResult(updated.result);
    } else {
      setDataLoading(true);
      setAppError(null);

      try {
        await saveRemoteGameState(authUser.id, updated.profile, updated.result);
      } catch (error) {
        setAppError(error instanceof Error ? error.message : "Could not save attempt to Supabase.");
      } finally {
        setDataLoading(false);
      }
    }

    navigate("results");
  }

  async function handleReset() {
    const confirmed = window.confirm(authUser ? "Reset your Supabase ConceptIQ progress?" : "Reset all local ConceptIQ progress in this browser?");
    if (!confirmed) {
      return;
    }

    if (!authUser) {
      resetProfile();
      setProfile(defaultProfile);
      setLastResult(null);
      navigate("home");
      return;
    }

    setDataLoading(true);
    setAppError(null);

    try {
      const reset = await resetRemoteProgress(authUser.id, profile);
      setProfile(reset);
      setLastResult(null);
      navigate("home");
    } catch (error) {
      setAppError(error instanceof Error ? error.message : "Could not reset Supabase progress.");
    } finally {
      setDataLoading(false);
    }
  }

  async function handleSignIn(email: string, password: string) {
    if (!supabase) {
      setAppError("Supabase is not configured.");
      return;
    }

    setAuthLoading(true);
    setAppError(null);
    setAuthMessage(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setAppError(error.message);
    } else {
      setAuthMessage("Logged in. Your Supabase profile is now active.");
      navigate("settings");
    }

    setAuthLoading(false);
  }

  async function handleSignUp(email: string, password: string, username: string, displayName: string) {
    if (!supabase) {
      setAppError("Supabase is not configured.");
      return;
    }

    setAuthLoading(true);
    setAppError(null);
    setAuthMessage(null);

    const safeUsername = username.trim() || email.split("@")[0] || "conceptiq-user";
    const safeDisplayName = displayName.trim() || safeUsername;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: safeUsername,
          display_name: safeDisplayName,
        },
      },
    });

    if (error) {
      setAppError(error.message);
    } else if (!data.session) {
      setAuthMessage("Account created. Check your email if confirmation is enabled for this Supabase project.");
    } else {
      setAuthMessage("Account created. Your Supabase profile is active.");
      navigate("settings");
    }

    setAuthLoading(false);
  }

  async function handleSignOut() {
    if (!supabase) {
      return;
    }

    setAuthLoading(true);
    setAppError(null);
    const { error } = await supabase.auth.signOut();

    if (error) {
      setAppError(error.message);
    } else {
      setAuthMessage("Logged out. Demo mode is using localStorage again.");
      setAuthUser(null);
      setProfile(loadProfile());
      setLastResult(loadLastResult());
      navigate("home");
    }

    setAuthLoading(false);
  }

  const pageContent = {
    home: <Dashboard profile={profile} onNavigate={navigate} />,
    play: <PlayPage profile={profile} onComplete={handleGameComplete} />,
    results: <Results result={lastResult} onNavigate={navigate} />,
    profile: <Profile profile={profile} onProfileChange={updateProfile} onReset={handleReset} />,
    leaderboard: <Leaderboard profile={profile} useRemote={Boolean(authUser)} currentUserId={authUser?.id ?? null} />,
    achievements: <Achievements profile={profile} />,
    settings: (
      <Settings
        profile={profile}
        user={authUser}
        configured={isSupabaseConfigured}
        authLoading={authLoading}
        dataLoading={dataLoading}
        error={appError}
        message={authMessage}
        onProfileChange={updateProfile}
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        onSignOut={handleSignOut}
        onReset={handleReset}
      />
    ),
  }[page];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/86 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <button type="button" onClick={() => navigate("home")} className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-pulse text-ink">
              <Brain className="h-6 w-6" />
            </span>
            <span>
              <span className="block text-xl font-black">ConceptIQ</span>
              <span className="block text-xs font-semibold text-white/50">{unlockedLabel}</span>
            </span>
          </button>

          <nav className="hidden items-center gap-1 lg:flex">
            {navigation.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => navigate(item.key)}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  page === item.key ? "bg-pulse text-ink" : "text-white/68 hover:bg-white/8 hover:text-white"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => navigate("settings")}
            className="hidden min-w-36 rounded-lg border border-white/10 bg-white/6 px-3 py-2 text-left text-xs font-semibold text-white/72 transition hover:border-pulse/40 hover:bg-pulse/10 xl:block"
          >
            <span className="block text-white">{authUser ? profile.displayName || profile.username : "Demo mode"}</span>
            <span className="block truncate text-white/48">{authUser?.email ?? (isSupabaseConfigured ? "Log in to sync" : "Supabase not configured")}</span>
          </button>

          <button className="btn-icon lg:hidden" type="button" onClick={() => setMobileOpen((open) => !open)} aria-label="Open menu">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen ? (
          <nav className="border-t border-white/10 px-4 py-3 lg:hidden">
            <div className="grid gap-2">
              {navigation.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => navigate(item.key)}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold transition ${
                    page === item.key ? "bg-pulse text-ink" : "bg-white/6 text-white/72"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </nav>
        ) : null}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{pageContent}</main>
    </div>
  );
}
