import { Award } from "lucide-react";
import { AchievementCard } from "../components/AchievementCard";
import { ProgressBar } from "../components/ProgressBar";
import { achievements } from "../data/achievements";
import type { UserProfile } from "../types";

interface AchievementsProps {
  profile: UserProfile;
}

export function Achievements({ profile }: AchievementsProps) {
  const unlockedCount = profile.achievementsUnlocked.length;

  return (
    <div className="space-y-6">
      <section className="surface p-6">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold uppercase text-pulse">Achievements</p>
            <h1 className="mt-2 text-4xl font-black">Milestones with attitude</h1>
            <p className="mt-3 max-w-2xl text-white/64">
              Unlocks are calculated locally from your scores, sessions, and challenge history.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/7 p-4 text-center">
            <Award className="mx-auto mb-2 h-7 w-7 text-solar" />
            <p className="text-3xl font-black">{unlockedCount}/{achievements.length}</p>
            <p className="text-sm text-white/56">Unlocked</p>
          </div>
        </div>
        <div className="mt-5">
          <ProgressBar value={unlockedCount} max={achievements.length} label="Achievement collection" tone="solar" />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {achievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} profile={profile} />
        ))}
      </section>
    </div>
  );
}
