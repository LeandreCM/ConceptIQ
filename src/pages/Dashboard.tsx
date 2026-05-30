import { Brain, Gauge, LineChart, ShieldCheck, Trophy, Zap } from "lucide-react";
import { AchievementCard } from "../components/AchievementCard";
import { GameCard } from "../components/GameCard";
import { ProgressBar } from "../components/ProgressBar";
import { RankBadge } from "../components/RankBadge";
import { ScoreLineChart } from "../components/ScoreLineChart";
import { StatCard } from "../components/StatCard";
import { achievements } from "../data/achievements";
import type { PageKey, UserProfile } from "../types";
import { sessionsInLast30Days } from "../utils/achievements";
import { categoryLabel, formatMs, formatScore, formatSigned, relativeDate } from "../utils/format";
import { getTrainingRecommendation, scoreTrend } from "../utils/profileInsights";

interface DashboardProps {
  profile: UserProfile;
  onNavigate: (page: PageKey) => void;
}

export function Dashboard({ profile, onNavigate }: DashboardProps) {
  const latestResult = profile.history[0];
  const featuredAchievements = achievements.slice(0, 3);
  const recommendation = getTrainingRecommendation(profile, latestResult);

  function playRecommended() {
    sessionStorage.setItem("conceptiq-preferred-game", recommendation.gameType);
    onNavigate("play");
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="surface overflow-hidden p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase text-pulse">ConceptIQ Command Center</p>
              <h1 className="mt-3 max-w-2xl text-4xl font-black leading-tight text-white md:text-6xl">
                {profile.displayName || profile.username}, tune the machine upstairs.
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-white/66">
                Play short cognitive challenges, raise your ConceptIQ Score, and unlock rank badges as your profile learns from each session.
              </p>
            </div>
            <button className="btn-primary min-w-40" type="button" onClick={() => onNavigate("play")}>
              <Zap className="h-5 w-5" />
              Play Now
            </button>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <StatCard label="ConceptIQ Score" value={formatScore(profile.conceptIQScore)} detail="0 to 1000 rating" icon={<Brain className="h-5 w-5" />} />
            <StatCard label="Growth Score" value={formatScore(profile.growthScore)} detail="Recent improvement" icon={<LineChart className="h-5 w-5" />} tone="mint" />
            <StatCard label="Consistency Score" value={formatScore(profile.consistencyScore)} detail={`${sessionsInLast30Days(profile.sessions)} sessions in 30 days`} icon={<ShieldCheck className="h-5 w-5" />} tone="solar" />
          </div>
        </div>
        <RankBadge score={profile.conceptIQScore} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <GameCard
          title="Reaction Time"
          description="Wait for the signal, then click as fast as possible. Early clicks are penalized."
          stat={`Best: ${formatMs(profile.bestReactionTime)}`}
          icon={<Gauge className="h-7 w-7" />}
          onClick={() => onNavigate("play")}
        />
        <GameCard
          title="Working Memory"
          description="Memorize a growing sequence, hide it, then type it back with precision."
          stat={`Best: ${profile.bestMemoryScore}/1000`}
          icon={<Brain className="h-7 w-7" />}
          onClick={() => onNavigate("play")}
        />
        <GameCard
          title="Pattern Reasoning"
          description="Find missing symbols in visual and numeric patterns across 10 questions."
          stat={`Best: ${profile.bestPatternScore}/1000`}
          icon={<Trophy className="h-7 w-7" />}
          onClick={() => onNavigate("play")}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="surface p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Ability Mix</h2>
            <span className="pill">Current performance</span>
          </div>
          <div className="space-y-5">
            <ProgressBar value={profile.categoryScores.reaction} max={1000} label={categoryLabel("reaction")} />
            <ProgressBar value={profile.categoryScores.memory} max={1000} label={categoryLabel("memory")} tone="mint" />
            <ProgressBar value={profile.categoryScores.pattern} max={1000} label={categoryLabel("pattern")} tone="bloom" />
          </div>
        </div>

        <div className="surface p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold">Latest Result</h2>
            <button className="btn-secondary" type="button" onClick={() => onNavigate("results")}>
              View Results
            </button>
          </div>
          {latestResult ? (
            <div className="rounded-lg border border-white/10 bg-white/6 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-white/54">{relativeDate(latestResult.timestamp)} - {categoryLabel(latestResult.gameType)}</p>
                  <h3 className="mt-1 text-2xl font-bold">{latestResult.title}</h3>
                </div>
                <span className="pill">{formatSigned(latestResult.conceptIQChange)} score</span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {latestResult.metrics.map((metric) => (
                  <div key={metric.label} className="rounded-lg bg-white/7 p-3">
                    <p className="text-xs text-white/50">{metric.label}</p>
                    <p className="mt-1 text-lg font-bold">{metric.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-white/16 bg-white/5 p-8 text-center text-white/62">
              No result yet. Play any challenge to generate your first ConceptIQ update.
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <ScoreLineChart points={scoreTrend(profile)} />
        <div className="surface p-5">
          <p className="text-sm font-bold uppercase text-pulse">Product Loop</p>
          <h2 className="mt-2 text-2xl font-bold">Next satisfying move</h2>
          <p className="mt-3 text-white/64">
            Train {recommendation.label}, review the score change, collect any unlocks, then jump to the leaderboard.
          </p>
          <div className="mt-5 rounded-lg bg-white/7 p-4">
            <p className="text-sm text-white/54">Recommended challenge</p>
            <p className="mt-1 text-2xl font-black">{recommendation.label}</p>
            <p className="mt-2 text-sm text-white/62">{recommendation.reason}</p>
          </div>
          <button className="btn-primary mt-5 w-full" type="button" onClick={playRecommended}>
            <Zap className="h-4 w-4" />
            Play Recommended
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {featuredAchievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} profile={profile} />
        ))}
      </section>
    </div>
  );
}
