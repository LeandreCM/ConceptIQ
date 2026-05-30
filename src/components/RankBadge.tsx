import { Crown } from "lucide-react";
import { getNextRank, getRankForScore, getRankProgress } from "../utils/ranks";
import { ProgressBar } from "./ProgressBar";

interface RankBadgeProps {
  score: number;
  compact?: boolean;
}

export function RankBadge({ score, compact = false }: RankBadgeProps) {
  const rank = getRankForScore(score);
  const nextRank = getNextRank(score);
  const progress = getRankProgress(score);

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${rank.accent}`}>
        <Crown className="h-3.5 w-3.5" />
        {rank.name}
      </span>
    );
  }

  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white/58">Current rank</p>
          <h2 className="mt-1 text-2xl font-bold">{rank.name}</h2>
        </div>
        <div className={`rounded-lg p-3 ${rank.accent}`}>
          <Crown className="h-6 w-6" />
        </div>
      </div>
      <div className="mt-5">
        <ProgressBar value={progress} label={nextRank ? `Next: ${nextRank.name}` : "Max rank"} tone="solar" />
      </div>
    </div>
  );
}
