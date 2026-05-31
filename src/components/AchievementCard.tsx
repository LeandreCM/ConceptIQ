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
    <div className={`surface-soft min-h-64 p-5 text-center transition duration-200 ${unlocked ? "border-mint/40 bg-mint/10" : "opacity-78"}`}>
      <div className="flex justify-center">
        <div className={`flex h-16 w-16 items-center justify-center rounded-lg ${unlocked ? "bg-mint/18 text-mint" : "bg-white/8 text-white/46"}`}>
          {unlocked ? achievement.icon : <Lock className="h-7 w-7" />}
        </div>
      </div>
      <div className="mt-4">
        <div className="flex min-h-8 items-center justify-center gap-2">
          <h3 className="text-xl font-black">{achievement.name}</h3>
          {unlocked ? <Sparkles className="h-4 w-4 text-solar" /> : null}
        </div>
        <p className="mt-2 min-h-12 text-sm leading-6 text-white/62">{achievement.description}</p>
        <div className="mt-5">
          <ProgressBar value={unlocked ? 100 : progress} label={achievementTargetLabel(achievement.id)} tone={unlocked ? "mint" : "solar"} />
        </div>
        <span className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-black ${unlocked ? "bg-mint/15 text-mint" : "bg-white/8 text-white/50"}`}>
          {unlocked ? "Unlocked" : "Locked"}
        </span>
      </div>
    </div>
  );
}
