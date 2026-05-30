import { useEffect, useState } from "react";
import { Brain, Gauge, LineChart, Save, ShieldCheck, Target, Trash2, Trophy } from "lucide-react";
import { CategoryStrengthChart } from "../components/CategoryStrengthChart";
import { ProgressBar } from "../components/ProgressBar";
import { RankBadge } from "../components/RankBadge";
import { ScoreLineChart } from "../components/ScoreLineChart";
import { StatCard } from "../components/StatCard";
import type { UserProfile } from "../types";
import { sessionsInLast30Days } from "../utils/achievements";
import { averageReactionTime, categoryLabel, formatDuration, formatMs, formatScore, relativeDate } from "../utils/format";
import { getStrengths, getTrainingRecommendation, getWeaknesses, scoreTrend } from "../utils/profileInsights";

interface ProfileProps {
  profile: UserProfile;
  onProfileChange: (profile: UserProfile) => Promise<void> | void;
  onReset: () => Promise<void> | void;
}

export function Profile({ profile, onProfileChange, onReset }: ProfileProps) {
  const [username, setUsername] = useState(profile.username);
  const strengths = getStrengths(profile);
  const weaknesses = getWeaknesses(profile);
  const recommendation = getTrainingRecommendation(profile);
  const latestAttempt = profile.attempts[0];

  useEffect(() => {
    setUsername(profile.username);
  }, [profile.username]);

  async function saveUsername() {
    const nextUsername = username.trim() || "Local Thinker";
    await onProfileChange({ ...profile, username: nextUsername, displayName: profile.displayName || nextUsername });
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="surface p-5">
          <p className="text-sm font-bold uppercase text-pulse">Cognitive Profile</p>
          <h1 className="mt-2 text-4xl font-black">{profile.displayName || profile.username}'s training map</h1>
          <p className="mt-3 text-white/64">
            ConceptIQ breaks your local attempts into category strengths, weak spots, consistency, and the best next challenge.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
            <label>
              <span className="mb-2 block text-sm font-semibold text-white/64">Username</span>
              <input
                className="w-full rounded-lg border border-white/10 bg-white/8 px-4 py-3 text-lg font-semibold"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </label>
            <button className="btn-primary self-end" type="button" onClick={saveUsername}>
              <Save className="h-4 w-4" />
              Save
            </button>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="btn-secondary border-bloom/30 text-bloom hover:bg-bloom/10" type="button" onClick={onReset}>
              <Trash2 className="h-4 w-4" />
              Reset Progress
            </button>
          </div>
        </div>
        <RankBadge score={profile.conceptIQScore} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Reaction Time" value={formatMs(profile.bestReactionTime)} detail={`Avg ${formatMs(averageReactionTime(profile.history))}`} icon={<Gauge className="h-5 w-5" />} />
        <StatCard label="Working Memory" value={`${profile.categoryScores.memory}/1000`} detail={`Best ${profile.bestMemoryScore}/1000`} icon={<Brain className="h-5 w-5" />} tone="mint" />
        <StatCard label="Pattern Reasoning" value={`${profile.categoryScores.pattern}/1000`} detail={`Best ${profile.bestPatternScore}/1000`} icon={<Trophy className="h-5 w-5" />} tone="bloom" />
        <StatCard label="Growth Score" value={formatScore(profile.growthScore)} detail="Recent improvement" icon={<LineChart className="h-5 w-5" />} tone="solar" />
        <StatCard label="Consistency Score" value={formatScore(profile.consistencyScore)} detail={`${sessionsInLast30Days(profile.sessions)} sessions in 30 days`} icon={<ShieldCheck className="h-5 w-5" />} tone="mint" />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ScoreLineChart points={scoreTrend(profile)} />
        <CategoryStrengthChart scores={profile.categoryScores} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="surface p-5">
          <div className="mb-4 flex items-center gap-2 text-mint">
            <Trophy className="h-5 w-5" />
            <h2 className="text-2xl font-bold text-white">Strengths</h2>
          </div>
          <div className="space-y-3">
            {strengths.map((strength) => (
              <div key={strength} className="rounded-lg bg-white/7 p-3 font-semibold text-white/76">
                {strength}
              </div>
            ))}
          </div>
        </div>

        <div className="surface p-5">
          <div className="mb-4 flex items-center gap-2 text-bloom">
            <Target className="h-5 w-5" />
            <h2 className="text-2xl font-bold text-white">Weaknesses</h2>
          </div>
          <div className="space-y-3">
            {weaknesses.map((weakness) => (
              <div key={weakness} className="rounded-lg bg-white/7 p-3 font-semibold text-white/76">
                {weakness}
              </div>
            ))}
          </div>
        </div>

        <div className="surface p-5">
          <div className="mb-4 flex items-center gap-2 text-pulse">
            <Brain className="h-5 w-5" />
            <h2 className="text-2xl font-bold text-white">Train Next</h2>
          </div>
          <p className="text-3xl font-black">{recommendation.label}</p>
          <p className="mt-3 text-white/64">{recommendation.reason}</p>
          <div className="mt-5">
            <ProgressBar value={profile.categoryScores[recommendation.gameType]} max={1000} label={categoryLabel(recommendation.gameType)} />
          </div>
        </div>
      </section>

      <section className="surface p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold">Attempt Log</h2>
          <span className="pill">{profile.attempts.length} saved attempts</span>
        </div>
        {profile.attempts.length ? (
          <div className="grid gap-3">
            {profile.attempts.slice(0, 8).map((attempt) => (
              <div key={attempt.id} className="grid gap-3 rounded-lg bg-white/7 p-4 md:grid-cols-[1fr_auto_auto_auto] md:items-center">
                <div>
                  <p className="text-sm text-white/54">{relativeDate(attempt.attemptedAt)} - {categoryLabel(attempt.gameType)}</p>
                  <p className="font-bold">Raw {attempt.rawScore} - Normalized {attempt.normalizedScore}/1000</p>
                </div>
                <span className="pill">{attempt.scoreChange >= 0 ? "+" : ""}{attempt.scoreChange} score</span>
                <span className="pill">{attempt.mistakes} mistakes</span>
                <span className="pill">{formatDuration(attempt.durationMs)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-white/16 bg-white/5 p-6 text-center text-white/58">
            Complete a game to start your attempt log.
          </div>
        )}
        {latestAttempt ? (
          <p className="mt-4 text-sm text-white/48">
            Latest saved attempt: {categoryLabel(latestAttempt.gameType)} at {new Date(latestAttempt.attemptedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
          </p>
        ) : null}
      </section>
    </div>
  );
}
