import { useEffect, useMemo, useState } from "react";
import { ArrowDownWideNarrow, Trophy } from "lucide-react";
import { LeaderboardTable } from "../components/LeaderboardTable";
import { mockLeaderboardUsers } from "../data/mockLeaderboard";
import type { LeaderboardUser, UserProfile } from "../types";
import { averageReactionTime as getAverageReactionTime } from "../utils/format";
import { fetchRemoteLeaderboard } from "../utils/supabaseData";
import { appErrorMessage } from "../utils/errors";

type SortKey =
  | "overall"
  | "growth"
  | "consistency"
  | "reaction"
  | "memory"
  | "pattern"
  | "fastest"
  | "improved";

const sortButtons: Array<{ key: SortKey; label: string }> = [
  { key: "overall", label: "Overall" },
  { key: "growth", label: "Growth" },
  { key: "consistency", label: "Consistency" },
  { key: "reaction", label: "Reaction" },
  { key: "memory", label: "Memory" },
  { key: "pattern", label: "Pattern" },
  { key: "fastest", label: "Fastest" },
  { key: "improved", label: "Most Improved" },
];

interface LeaderboardProps {
  profile: UserProfile;
  useRemote?: boolean;
  currentUserId?: string | null;
}

export function Leaderboard({ profile, useRemote = false, currentUserId = null }: LeaderboardProps) {
  const [sortKey, setSortKey] = useState<SortKey>("overall");
  const [remoteUsers, setRemoteUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!useRemote) {
      setRemoteUsers([]);
      setError(null);
      return;
    }

    let active = true;

    async function loadLeaderboard() {
      setLoading(true);
      setError(null);

      try {
        const users = await fetchRemoteLeaderboard();

        if (active) {
          setRemoteUsers(users);
        }
      } catch (caught) {
        if (active) {
          setError(appErrorMessage(caught, "Could not load Supabase leaderboard."));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadLeaderboard();

    return () => {
      active = false;
    };
  }, [useRemote]);

  const users = useMemo(() => {
    if (useRemote) {
      return remoteUsers
        .map((user) => ({
          ...user,
          isCurrentUser: Boolean(currentUserId && user.id === currentUserId),
        }))
        .sort((a, b) => sortUsers(a, b, sortKey));
    }

    const currentUser: LeaderboardUser = {
      username: `${profile.username} (You)`,
      displayName: profile.displayName,
      conceptIQScore: profile.conceptIQScore,
      growthScore: profile.growthScore,
      consistencyScore: profile.consistencyScore,
      categoryScores: profile.categoryScores,
      bestReactionTime: profile.bestReactionTime,
      averageReactionTime: getAverageReactionTime(profile.history),
      isCurrentUser: true,
    };

    return [...mockLeaderboardUsers, currentUser].sort((a, b) => sortUsers(a, b, sortKey));
  }, [currentUserId, profile, remoteUsers, sortKey, useRemote]);

  return (
    <div className="space-y-5">
      <section className="surface-gradient p-5">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-solar/15 p-3 text-solar">
            <Trophy className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold uppercase text-white/50">Leaderboard</p>
            <h1 className="mt-1 text-3xl font-black">Compare your pace</h1>
            <p className="mt-2 text-sm leading-6 text-white/64">
              Default ranking shows ConceptIQ, Growth, and Consistency. Reaction filters use average speed.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="pill">{useRemote ? "Supabase" : "Demo mode"}</span>
          <span className="pill">{users.length} players</span>
        </div>
      </section>

      <section className="surface p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white/68">
          <ArrowDownWideNarrow className="h-4 w-4 text-pulse" />
          Filter rank type
        </div>
        <div className="flex flex-wrap gap-2">
          {sortButtons.map((button) => (
            <button
              key={button.key}
              type="button"
              className={`chip ${sortKey === button.key ? "chip-active" : ""}`}
              onClick={() => setSortKey(button.key)}
            >
              {button.label}
            </button>
          ))}
        </div>
      </section>

      {loading ? <div className="surface p-5 text-white/64">Loading Supabase leaderboard...</div> : null}
      {error ? <div className="surface border-bloom/40 p-5 text-bloom">{error}</div> : null}
      <LeaderboardTable users={users} />
    </div>
  );
}

function sortUsers(a: LeaderboardUser, b: LeaderboardUser, sortKey: SortKey) {
  switch (sortKey) {
    case "growth":
    case "improved":
      return b.growthScore - a.growthScore;
    case "consistency":
      return b.consistencyScore - a.consistencyScore;
    case "reaction":
      return sortByAverageReaction(a, b);
    case "memory":
      return b.categoryScores.memory - a.categoryScores.memory;
    case "pattern":
      return b.categoryScores.pattern - a.categoryScores.pattern;
    case "fastest":
      return sortByAverageReaction(a, b);
    case "overall":
    default:
      return b.conceptIQScore - a.conceptIQScore;
  }
}

function sortByAverageReaction(a: LeaderboardUser, b: LeaderboardUser) {
  const aTime = a.averageReactionTime ?? a.bestReactionTime ?? Number.POSITIVE_INFINITY;
  const bTime = b.averageReactionTime ?? b.bestReactionTime ?? Number.POSITIVE_INFINITY;

  if (aTime !== bTime) {
    return aTime - bTime;
  }

  return sortByBestReaction(a, b);
}

function sortByBestReaction(a: LeaderboardUser, b: LeaderboardUser) {
  const aTime = a.bestReactionTime ?? Number.POSITIVE_INFINITY;
  const bTime = b.bestReactionTime ?? Number.POSITIVE_INFINITY;

  if (aTime !== bTime) {
    return aTime - bTime;
  }

  return b.categoryScores.reaction - a.categoryScores.reaction;
}
