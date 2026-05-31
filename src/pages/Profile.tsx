import { Brain, Gauge, LineChart, RotateCcw, ShieldCheck, Target, Trophy } from "lucide-react";
import type { ReactNode } from "react";
import { CategoryStrengthChart } from "../components/CategoryStrengthChart";
import { ProgressBar } from "../components/ProgressBar";
import { RankBadge } from "../components/RankBadge";
import { ScoreLineChart } from "../components/ScoreLineChart";
import type { UserProfile } from "../types";
import { sessionsInLast30Days } from "../utils/achievements";
import { averageReactionTime, categoryLabel, formatDuration, formatMs, formatScore, formatSigned, relativeDate } from "../utils/format";
import { getStrengths, getTrainingRecommendation, getWeaknesses, scoreTrend } from "../utils/profileInsights";

interface ProfileProps {
  profile: UserProfile;
  onProfileChange: (profile: UserProfile) => Promise<void> | void;
  onReset: () => Promise<void> | void;
}

export function Profile({ profile, onReset }: ProfileProps) {
  const strengths = getStrengths(profile);
  const weaknesses = getWeaknesses(profile);
  const recommendation = getTrainingRecommendation(profile);
  const monthlySessions = sessionsInLast30Days(profile.sessions);

  return (
    <div className="space-y-5">
      <section className="surface-gradient p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase text-white/50">Cognitive profile</p>
            <h1 className="mt-1 text-3xl font-black">{profile.displayName || profile.username}</h1>
          </div>
          <RankBadge score={profile.conceptIQScore} compact />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_0.85fr] sm:items-stretch">
          <div className="rounded-lg border border-white/10 bg-ink/38 p-5">
            <p className="text-sm font-bold uppercase text-pulse">ConceptIQ Score</p>
            <p className="mt-2 text-6xl font-black">{formatScore(profile.conceptIQScore)}</p>
            <div className="mt-5">
              <ProgressBar value={profile.conceptIQScore} max={1000} label="Total rating" />
            </div>
          </div>
          <RankBadge score={profile.conceptIQScore} />
        </div>
      </section>

      <section className="surface p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-black">Stat bars</h2>
          <span className="pill">{profile.gamesPlayed} games</span>
        </div>
        <div className="space-y-5">
          <StatBar icon={<Gauge className="h-5 w-5" />} label="Reaction Time" value={profile.categoryScores.reaction} detail={`Avg ${formatMs(averageReactionTime(profile.history))}`} />
          <StatBar icon={<Brain className="h-5 w-5" />} label="Working Memory" value={profile.categoryScores.memory} detail={`Best ${profile.bestMemoryScore}/1000`} tone="mint" />
          <StatBar icon={<Trophy className="h-5 w-5" />} label="Pattern Reasoning" value={profile.categoryScores.pattern} detail={`Best ${profile.bestPatternScore}/1000`} tone="bloom" />
          <StatBar icon={<LineChart className="h-5 w-5" />} label="Growth Score" value={profile.growthScore} detail="Recent score movement" tone="solar" />
          <StatBar icon={<ShieldCheck className="h-5 w-5" />} label="Consistency Score" value={profile.consistencyScore} detail={`${monthlySessions} sessions in 30 days`} tone="mint" />
        </div>
      </section>

      <section className="grid gap-4">
        <ScoreLineChart points={scoreTrend(profile)} />
        <CategoryStrengthChart scores={profile.categoryScores} />
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <InsightCard title="Strengths" icon={<Trophy className="h-5 w-5" />} tone="mint" items={strengths} />
        <InsightCard title="Weaknesses" icon={<Target className="h-5 w-5" />} tone="bloom" items={weaknesses} />
      </section>

      <section className="surface p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase text-white/50">Train next</p>
            <h2 className="mt-1 text-2xl font-black">{recommendation.label}</h2>
          </div>
          <div className="rounded-lg bg-pulse/15 p-3 text-pulse">
            <Brain className="h-5 w-5" />
          </div>
        </div>
        <p className="text-sm leading-6 text-white/64">{recommendation.reason}</p>
        <div className="mt-4">
          <ProgressBar value={profile.categoryScores[recommendation.gameType]} max={1000} label={categoryLabel(recommendation.gameType)} />
        </div>
      </section>

      <section className="surface p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-black">Training history</h2>
          <span className="pill">{profile.attempts.length} attempts</span>
        </div>
        {profile.attempts.length ? (
          <div className="space-y-3">
            {profile.attempts.slice(0, 8).map((attempt) => (
              <div key={attempt.id} className="rounded-lg border border-white/10 bg-white/7 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-white/50">{relativeDate(attempt.attemptedAt)}</p>
                    <p className="mt-1 text-lg font-black">{categoryLabel(attempt.gameType)}</p>
                  </div>
                  <span className="pill">{formatSigned(attempt.scoreChange)}</span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <MiniMetric label="Score" value={`${attempt.normalizedScore}`} />
                  <MiniMetric label="Mistakes" value={`${attempt.mistakes}`} />
                  <MiniMetric label="Time" value={formatDuration(attempt.durationMs)} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-white/14 bg-white/5 p-6 text-center text-white/58">
            Complete a game to start your history.
          </div>
        )}
        <button className="btn-secondary mt-5 w-full border-bloom/30 text-bloom hover:bg-bloom/10" type="button" onClick={onReset}>
          <RotateCcw className="h-4 w-4" />
          Reset Progress
        </button>
      </section>
    </div>
  );
}

function StatBar({
  icon,
  label,
  value,
  detail,
  tone = "cyan",
}: {
  icon: ReactNode;
  label: string;
  value: number;
  detail: string;
  tone?: "cyan" | "mint" | "solar" | "bloom";
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-white/8 p-2 text-pulse">{icon}</span>
          <div>
            <p className="font-black">{label}</p>
            <p className="text-xs font-bold text-white/48">{detail}</p>
          </div>
        </div>
        <span className="font-black">{Math.round(value)}</span>
      </div>
      <ProgressBar value={value} max={1000} tone={tone} />
    </div>
  );
}

function InsightCard({ title, icon, tone, items }: { title: string; icon: ReactNode; tone: "mint" | "bloom"; items: string[] }) {
  const toneClass = tone === "mint" ? "bg-mint/15 text-mint" : "bg-bloom/15 text-bloom";

  return (
    <div className="surface p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className={`rounded-lg p-2 ${toneClass}`}>{icon}</span>
        <h2 className="text-2xl font-black">{title}</h2>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item} className="rounded-lg bg-white/7 p-3 text-sm font-bold leading-6 text-white/72">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-ink/35 p-3">
      <p className="text-xs font-bold text-white/44">{label}</p>
      <p className="mt-1 font-black">{value}</p>
    </div>
  );
}
