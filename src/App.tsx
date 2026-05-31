import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Award, Brain, Home, Play, Settings as SettingsIcon, Trophy, User } from "lucide-react";
import { BottomNavigation } from "./components/BottomNavigation";
import { Achievements } from "./pages/Achievements";
import { Dashboard } from "./pages/Dashboard";
import { Debug } from "./pages/Debug";
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
import { appErrorMessage } from "./utils/errors";
import { completeEmailConfirmationLogin } from "./utils/authCallback";

const primaryNavigation: Array<{ key: PageKey; label: string; icon: ReactNode }> = [
  { key: "home", label: "Home", icon: <Home className="h-4 w-4" /> },
  { key: "play", label: "Train", icon: <Play className="h-4 w-4" /> },
  { key: "leaderboard", label: "Leaderboard", icon: <Trophy className="h-4 w-4" /> },
  { key: "profile", label: "Cognitive Profile", icon: <User className="h-4 w-4" /> },
  { key: "achievements", label: "Achievements", icon: <Award className="h-4 w-4" /> },
];

const allPages: PageKey[] = ["home", "play", "results", "profile", "leaderboard", "achievements", "settings", "debug"];

function pageFromLocation(): PageKey {
  if (window.location.pathname.replace(/\/$/, "").endsWith("/debug")) {
    return "debug";
  }

  const raw = window.location.hash.replace("#", "");
  return allPages.includes(raw as PageKey) ? (raw as PageKey) : "home";
}

function authRedirectUrl() {
  // Future backend/auth providers can swap this for a configured canonical app URL.
  return window.location.origin;
}

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(() => loadProfile());
  const [lastResult, setLastResult] = useState<GameResult | null>(() => loadLastResult());
  const [page, setPage] = useState<PageKey>(() => pageFromLocation());
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [appError, setAppError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleLocationChange = () => setPage(pageFromLocation());
    window.addEventListener("hashchange", handleLocationChange);
    window.addEventListener("popstate", handleLocationChange);
    return () => {
      window.removeEventListener("hashchange", handleLocationChange);
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let active = true;

    async function loadInitialSession() {
      setAuthLoading(true);

      try {
        const confirmedUser = await completeEmailConfirmationLogin(supabase!);

        if (!active) {
          return;
        }

        if (confirmedUser) {
          setAuthUser(confirmedUser);
          setAuthMessage("Email confirmed. You're logged in to ConceptIQ.");
          await loadRemoteUserProfile(confirmedUser);
          navigate("settings");
          return;
        }

        const { data, error } = await supabase!.auth.getSession();

        if (!active) {
          return;
        }

        if (error) {
          setAppError(appErrorMessage(error, "Could not load Supabase session."));
        }

        const user = data.session?.user ?? null;
        setAuthUser(user);

        if (user) {
          await loadRemoteUserProfile(user);
        }
      } catch (error) {
        if (active) {
          setAppError(appErrorMessage(error, "Could not complete email confirmation."));
          navigate("settings");
        }
      } finally {
        if (active) {
          setAuthLoading(false);
        }
      }
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
    if (nextPage === "debug") {
      window.history.pushState({}, "", "/debug");
      return;
    }

    const path = window.location.pathname.replace(/\/debug\/?$/, "/");
    window.history.pushState({}, "", `${path || "/"}#${nextPage}`);
  }

  async function loadRemoteUserProfile(user: SupabaseUser) {
    setDataLoading(true);
    setAppError(null);

    try {
      const remoteProfile = await fetchRemoteProfile(user);
      setProfile(remoteProfile);
      setLastResult(remoteProfile.history[0] ?? null);
    } catch (error) {
      setAppError(appErrorMessage(error, "Could not load Supabase profile."));
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
      setAppError(appErrorMessage(error, "Could not save profile settings."));
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
        setAppError(appErrorMessage(error, "Could not save attempt to Supabase."));
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
      setAppError(appErrorMessage(error, "Could not reset Supabase progress."));
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
        emailRedirectTo: authRedirectUrl(),
        data: {
          username: safeUsername,
          display_name: safeDisplayName,
        },
      },
    });

    if (error) {
      setAppError(error.message);
    } else if (!data.session) {
      setAuthMessage("Account created. Confirm your email and this browser will log you in automatically.");
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
    debug: <Debug profile={profile} />,
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
      <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <button type="button" onClick={() => navigate("home")} className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-pulse text-ink shadow-glow">
              <Brain className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-lg font-black leading-tight">ConceptIQ</span>
              <span className="block text-xs font-bold text-white/50">{authUser ? "Synced account" : "Local demo"}</span>
            </span>
          </button>

          <div className="flex items-center gap-2">
            <div className="hidden rounded-full border border-white/10 bg-white/7 px-3 py-1.5 text-xs font-bold text-white/66 sm:block">
              {profile.conceptIQScore} IQ | {unlockedLabel}
            </div>
            <button className="btn-icon" type="button" onClick={() => navigate("settings")} aria-label="Open settings">
              <SettingsIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-28 pt-5 sm:px-6">{pageContent}</main>

      <BottomNavigation
        items={primaryNavigation}
        activePage={page}
        onNavigate={navigate}
      />
    </div>
  );
}
