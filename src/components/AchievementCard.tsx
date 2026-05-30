import { Lock, Sparkles } from "lucide-react";
import type { AchievementDefinition, UserProfile } from "../types";
import { achievementTargetLabel, getAchievementProgress, isAchievementUnlocked } from "../utils/achievements";
import { ProgressBar } from "./ProgressBar";

interface AchievementCardProps {
  achievement: AchievementDefinition;
  profile: UserProfile;
}

export function AchievementCard({ achievement, profile }: AchievementCardProps) {
  const unlocked = isAchievementUnlocked(profile, achievement.id);
  const progress = getAchievementProgress(profile, achievement.id);

  return (
    <div className={`surface-soft p-4 ${unlocked ? "border-mint/40" : ""}`}>
      <div className="flex items-start gap-3">
        <div className={`rounded-lg p-2.5 ${unlocked ? "bg-mint/15 text-mint" : "bg-white/8 text-white/50"}`}>
          {unlocked ? achievement.icon : <Lock className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold">{achievement.name}</h3>
            {unlocked ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-mint/15 px-2.5 py-1 text-xs font-bold text-mint">
                <Sparkles className="h-3.5 w-3.5" />
                Unlocked
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-white/62">{achievement.description}</p>
          <div className="mt-4">
            <ProgressBar value={unlocked ? 100 : progress} label={achievementTargetLabel(achievement.id)} tone="mint" />
          </div>
        </div>
      </div>
    </div>
  );
}
