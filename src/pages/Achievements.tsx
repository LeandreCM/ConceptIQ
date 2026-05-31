import { Award, Sparkles } from "lucide-react";
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
    <div className="space-y-5">
      <section className="surface-gradient p-5">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-solar/15 p-3 text-solar">
            <Award className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold uppercase text-white/50">Achievements</p>
            <h1 className="mt-1 text-3xl font-black">Badge collection</h1>
            <p className="mt-2 text-sm leading-6 text-white/64">Funny little milestones for speed, memory, reasoning, growth, consistency, and glorious failure.</p>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-white/10 bg-ink/38 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-white/50">Unlocked</p>
              <p className="mt-1 text-4xl font-black">{unlockedCount}/{achievements.length}</p>
            </div>
            <Sparkles className="h-7 w-7 text-solar" />
          </div>
          <ProgressBar value={unlockedCount} max={achievements.length} label="Collection progress" tone="solar" />
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {achievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} profile={profile} />
        ))}
      </section>
    </div>
  );
}
