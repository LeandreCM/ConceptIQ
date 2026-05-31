import type { LeaderboardUser } from "../types";
import { formatMs, formatScore } from "../utils/format";
import { strongestCognitiveDomainName } from "../utils/cognitiveScoring";
import { RankBadge } from "./RankBadge";

interface LeaderboardTableProps {
  users: LeaderboardUser[];
}

export function LeaderboardTable({ users }: LeaderboardTableProps) {
  return (
    <div className="space-y-3">
      {users.map((user, index) => {
        const podium = index < 3;

        return (
          <article
            key={`${user.username}-${index}`}
            className={`surface p-4 transition duration-200 ${
              user.isCurrentUser ? "border-pulse/50 bg-pulse/10" : podium ? "border-solar/24" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-lg font-black ${podium ? "bg-solar text-ink" : "bg-white/8 text-white"}`}>
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="truncate text-xl font-black">{user.username}</h3>
                    <div className="mt-2">
                      <RankBadge score={user.conceptIQScore} compact />
                    </div>
                  </div>
                  {user.isCurrentUser ? <span className="pill">You</span> : null}
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <ScorePill label="ConceptIQ" value={formatScore(user.conceptIQScore)} />
                  <ScorePill label="Growth" value={formatScore(user.growthScore)} />
                  <ScorePill label="Consistency" value={formatScore(user.consistencyScore)} />
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  <Meta label="Strongest" value={strongestCognitiveDomainName(user.categoryScores)} />
                  <Meta label="Avg reaction" value={formatMs(user.averageReactionTime)} />
                  <Meta label="Best reaction" value={formatMs(user.bestReactionTime)} />
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function ScorePill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/7 p-3 text-center">
      <p className="text-[11px] font-bold uppercase text-white/44">{label}</p>
      <p className="mt-1 text-lg font-black">{value}</p>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-white/8 bg-ink/32 px-3 py-2 text-sm">
      <span className="font-bold text-white/48">{label}</span>
      <span className="font-black">{value}</span>
    </div>
  );
}
