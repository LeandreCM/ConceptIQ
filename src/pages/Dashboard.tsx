import { Brain, CalendarCheck, ChevronRight, LineChart, ShieldCheck, Sparkles, Target, Zap } from "lucide-react";
import { ProgressBar } from "../components/ProgressBar";
import { RankBadge } from "../components/RankBadge";
import { StatCard } from "../components/StatCard";
import type { PageKey, UserProfile } from "../types";
import { sessionsInLast30Days } from "../utils/achievements";
import { categoryLabel, formatScore, formatSigned, relativeDate } from "../utils/format";
import { getTrainingRecommendation } from "../utils/profileInsights";

interface DashboardProps {
  profile: UserProfile;
  onNavigate: (page: PageKey) => void;
}

export function Dashboard({ profile, onNavigate }: DashboardProps) {
  const latestResult = profile.history[0];
  const recommendation = getTrainingRecommendation(profile, latestResult);
  const displayName = profile.displayName || profile.username;
  const monthlySessions = sessionsInLast30Days(profile.sessions);
  const weeklyProgress = Math.min(7, monthlySessions);

  function continueTraining() {
    sessionStorage.setItem("conceptiq-preferred-game", recommendation.gameType);
    onNavigate("play");
  }

  return (
    <div className="space-y-5">
      <section className="surface-gradient overflow-hidden p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-white/58">Welcome back</p>
            <h1 className="mt-1 text-3xl font-black leading-tight text-white sm:text-4xl">{displayName}</h1>
          </div>
          <RankBadge score={profile.conceptIQScore} compact />
        </div>

        <div className="mt-6 rounded-lg border border-white/10 bg-ink/38 p-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase text-pulse">ConceptIQ Score</p>
              <p className="mt-2 text-6xl font-black tracking-normal">{formatScore(profile.conceptIQScore)}</p>
            </div>
            <div className="rounded-lg bg-pulse/15 p-3 text-pulse">
              <Brain className="h-7 w-7" />
            </div>
          </div>
          <div className="mt-5">
            <ProgressBar value={profile.conceptIQScore} max={1000} label="Progress to Concept Titan" />
          </div>
        </div>
      </section>

      <section className="surface p-5">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-mint/15 p-3 text-mint">
            <Target className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold uppercase text-white/50">Today's training</p>
            <h2 className="mt-1 text-2xl font-black">{recommendation.label}</h2>
            <p className="mt-2 text-sm leading-6 text-white/64">{recommendation.reason}</p>
          </div>
        </div>
        <button className="btn-primary mt-5 w-full" type="button" onClick={continueTraining}>
          <Zap className="h-4 w-4" />
          Continue Training
          <ChevronRight className="h-4 w-4" />
        </button>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Ability" value={formatScore(profile.abilityScore)} detail="Current performance" icon={<Sparkles className="h-5 w-5" />} />
        <StatCard label="Growth" value={formatScore(profile.growthScore)} detail="Recent improvement" icon={<LineChart className="h-5 w-5" />} tone="mint" />
        <StatCard label="Consistency" value={formatScore(profile.consistencyScore)} detail={`${monthlySessions} sessions in 30 days`} icon={<ShieldCheck className="h-5 w-5" />} tone="solar" />
      </section>

      <section className="surface p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase text-white/50">Training path</p>
            <h2 className="mt-1 text-2xl font-black">This week</h2>
          </div>
          <div className="rounded-lg bg-white/8 p-2.5 text-solar">
            <CalendarCheck className="h-5 w-5" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }, (_, index) => {
            const complete = index < weeklyProgress;
            return (
              <div
                key={index}
                className={`h-12 rounded-lg border transition ${complete ? "border-mint/40 bg-mint/18" : "border-white/10 bg-white/6"}`}
              />
            );
          })}
        </div>
        <p className="mt-4 text-sm leading-6 text-white/58">
          Complete short sessions through the week. ConceptIQ tracks consistency over 30 days, not daily streaks.
        </p>
      </section>

      <section className="surface-soft p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-white/50">Latest result</p>
            {latestResult ? (
              <p className="mt-1 font-bold">
                {relativeDate(latestResult.timestamp)} | {categoryLabel(latestResult.gameType)}
              </p>
            ) : (
              <p className="mt-1 font-bold">No attempts yet</p>
            )}
          </div>
          <span className="pill">{latestResult ? `${formatSigned(latestResult.conceptIQChange)} score` : "Ready"}</span>
        </div>
      </section>
    </div>
  );
}
