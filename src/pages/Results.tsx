import { ArrowRight, BadgeCheck, Brain, Home, RotateCcw, Sparkles, TrendingUp } from "lucide-react";
import { achievements } from "../data/achievements";
import type { GameResult, PageKey } from "../types";
import { categoryLabel, formatDuration, formatScore, formatSigned } from "../utils/format";

interface ResultsProps {
  result: GameResult | null;
  onNavigate: (page: PageKey) => void;
}

export function Results({ result, onNavigate }: ResultsProps) {
  if (!result) {
    return (
      <div className="surface p-8 text-center">
        <Brain className="mx-auto mb-4 h-12 w-12 text-pulse" />
        <h1 className="text-3xl font-black">No result yet</h1>
        <p className="mt-3 text-white/62">Complete a challenge to generate your next score update.</p>
        <button className="btn-primary mt-6 w-full sm:w-auto" type="button" onClick={() => onNavigate("play")}>
          Start Training
        </button>
      </div>
    );
  }

  const currentResult = result;
  const unlocked = achievements.filter((achievement) => result.unlockedAchievementIds?.includes(achievement.id));
  const previousScore = result.conceptIQBefore ?? 0;
  const newScore = result.conceptIQAfter ?? previousScore;
  const scoreChange = result.conceptIQChange ?? newScore - previousScore;
  const recommendedLabel = result.recommendedGameType ? categoryLabel(result.recommendedGameType) : "Training";
  const improved = result.bestStatImproved ?? result.whatImproved;

  function playAgain() {
    sessionStorage.setItem("conceptiq-preferred-game", currentResult.recommendedGameType ?? currentResult.gameType);
    onNavigate("play");
  }

  return (
    <div className="space-y-5">
      <section className="surface-gradient overflow-hidden p-5 text-center">
        <p className="text-sm font-bold uppercase text-white/50">{categoryLabel(result.gameType)} complete</p>
        <div className="score-pop mt-5">
          <p className={`text-7xl font-black leading-none ${scoreChange >= 0 ? "text-mint" : "text-bloom"}`}>
            {formatSigned(scoreChange)}
          </p>
          <p className="mt-2 text-sm font-bold uppercase text-white/54">ConceptIQ change</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-white/10 bg-ink/38 p-4">
            <p className="text-xs font-bold uppercase text-white/48">Previous</p>
            <p className="mt-1 text-3xl font-black">{formatScore(previousScore)}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-ink/38 p-4">
            <p className="text-xs font-bold uppercase text-white/48">New score</p>
            <p className="mt-1 text-3xl font-black">{formatScore(newScore)}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-3">
        <div className="surface p-5">
          <div className="flex gap-4">
            <div className="rounded-lg bg-mint/15 p-3 text-mint">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase text-white/50">You improved in</p>
              <h2 className="mt-1 text-2xl font-black">{improved}</h2>
            </div>
          </div>
        </div>

        <div className="surface p-5">
          <div className="flex gap-4">
            <div className="rounded-lg bg-solar/15 p-3 text-solar">
              <ArrowRight className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase text-white/50">Train next</p>
              <h2 className="mt-1 text-2xl font-black">{recommendedLabel}</h2>
              <p className="mt-2 text-sm leading-6 text-white/62">{result.trainNext}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="surface p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-black">Round details</h2>
          <span className="pill">{result.percentileLabel}</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Metric label="Raw score" value={String(result.rawScore)} />
          <Metric label="Normalized" value={`${result.normalizedScore}/1000`} />
          <Metric label="Duration" value={formatDuration(result.durationMs)} />
        </div>
        <div className="mt-3 grid gap-3">
          {result.metrics.map((metric) => (
            <div key={metric.label} className="flex items-center justify-between rounded-lg bg-white/7 p-3">
              <span className="text-sm font-bold text-white/54">{metric.label}</span>
              <span className="font-black">{metric.value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="surface p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-black">Achievement unlocks</h2>
          <Sparkles className="h-5 w-5 text-solar" />
        </div>
        {unlocked.length ? (
          <div className="grid gap-3">
            {unlocked.map((achievement, index) => (
              <div
                key={achievement.id}
                className="unlock-pop flex items-center gap-3 rounded-lg border border-mint/30 bg-mint/10 p-4"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <span className="rounded-lg bg-mint/15 p-3 text-mint">{achievement.icon}</span>
                <div>
                  <p className="font-black">{achievement.name}</p>
                  <p className="text-sm text-white/62">{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-white/14 bg-white/5 p-6 text-center text-white/58">
            No new badges this round. The next one is closer.
          </div>
        )}
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <button className="btn-primary sm:col-span-2" type="button" onClick={playAgain}>
          <RotateCcw className="h-4 w-4" />
          Play Again
        </button>
        <button className="btn-secondary" type="button" onClick={() => onNavigate("home")}>
          <Home className="h-4 w-4" />
          Home
        </button>
        <button className="btn-secondary sm:col-span-3" type="button" onClick={() => onNavigate("leaderboard")}>
          <BadgeCheck className="h-4 w-4" />
          Compare on Leaderboard
        </button>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/7 p-4">
      <p className="text-xs font-bold uppercase text-white/48">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}
