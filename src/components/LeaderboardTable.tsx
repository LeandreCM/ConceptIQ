import type { LeaderboardUser } from "../types";
import { formatMs, formatScore, strongestCategory } from "../utils/format";
import { RankBadge } from "./RankBadge";

interface LeaderboardTableProps {
  users: LeaderboardUser[];
}

export function LeaderboardTable({ users }: LeaderboardTableProps) {
  return (
    <div className="surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-[880px] w-full text-left">
          <thead className="border-b border-white/10 bg-white/6 text-xs uppercase text-white/56">
            <tr>
              <th className="px-4 py-4">Rank</th>
              <th className="px-4 py-4">Player</th>
              <th className="px-4 py-4">ConceptIQ Score</th>
              <th className="px-4 py-4">Growth Score</th>
              <th className="px-4 py-4">Consistency Score</th>
              <th className="px-4 py-4">Strongest Category</th>
              <th className="px-4 py-4">Avg Reaction</th>
              <th className="px-4 py-4">Best Reaction</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {users.map((user, index) => (
              <tr key={`${user.username}-${index}`} className={user.isCurrentUser ? "bg-pulse/8" : ""}>
                <td className="px-4 py-4">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/8 font-bold">
                    {index + 1}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-2">
                    <span className="font-bold">{user.username}</span>
                    <RankBadge score={user.conceptIQScore} compact />
                  </div>
                </td>
                <td className="px-4 py-4 text-lg font-bold">{formatScore(user.conceptIQScore)}</td>
                <td className="px-4 py-4">{formatScore(user.growthScore)}</td>
                <td className="px-4 py-4">{formatScore(user.consistencyScore)}</td>
                <td className="px-4 py-4">{strongestCategory(user.categoryScores)}</td>
                <td className="px-4 py-4">{formatMs(user.averageReactionTime)}</td>
                <td className="px-4 py-4">{formatMs(user.bestReactionTime)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
