import { ArrowRight, BadgeCheck, Brain, RotateCcw, Sparkles, TrendingUp } from "lucide-react";
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
        <p className="mt-3 text-white/62">Complete a challenge to generate a results report.</p>
        <button className="btn-primary mt-6" type="button" onClick={() => onNavigate("play")}>
          Play a Game
        </button>
      </div>
    );
  }

  const currentResult = result;
  const unlocked = achievements.filter((achievement) => currentResult.unlockedAchievementIds?.includes(achievement.id));
  const previousScore = currentResult.conceptIQBefore ?? 0;
  const newScore = currentResult.conceptIQAfter ?? previousScore;
  const scoreChange = currentResult.conceptIQChange ?? newScore - previousScore;
  const recommendedLabel = currentResult.recommendedGameType ? categoryLabel(currentResult.recommendedGameType) : "Play Lab";

  function trainRecommended() {
    if (currentResult.recommendedGameType) {
      sessionStorage.setItem("conceptiq-preferred-game", currentResult.recommendedGameType);
    }

    onNavigate("play");
  }

  return (
    <div className="space-y-6">
      <section className="surface p-6">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
          <div>
            <p className="text-sm font-bold uppercase text-pulse">{categoryLabel(currentResult.gameType)} Result</p>
            <h1 className="mt-2 text-4xl font-black">{currentResult.title}</h1>
            <p className="mt-3 text-lg text-white/66">{currentResult.percentileLabel}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/7 p-4 text-center">
            <p className="text-sm font-semibold text-white/56">Score Gained/Lost</p>
            <p className={`mt-1 text-4xl font-black ${scoreChange >= 0 ? "text-mint" : "text-bloom"}`}>
              {formatSigned(scoreChange)}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-white/10 bg-white/6 p-4">
            <p className="text-sm text-white/54">Previous score</p>
            <p className="mt-1 text-2xl font-bold">{formatScore(previousScore)}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/6 p-4">
            <p className="text-sm text-white/54">New score</p>
            <p className="mt-1 text-2xl font-bold">{formatScore(newScore)}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/6 p-4">
            <p className="text-sm text-white/54">Raw score</p>
            <p className="mt-1 text-2xl font-bold">{currentResult.rawScore}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/6 p-4">
            <p className="text-sm text-white/54">Normalized score</p>
            <p className="mt-1 text-2xl font-bold">{currentResult.normalizedScore}/1000</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="surface-soft p-4">
            <div className="mb-3 flex items-center gap-2 text-mint">
              <TrendingUp className="h-5 w-5" />
              <h2 className="font-bold">Best stat improved</h2>
            </div>
            <p className="text-white/66">{currentResult.bestStatImproved ?? currentResult.whatImproved}</p>
          </div>
          <div className="surface-soft p-4">
            <div className="mb-3 flex items-center gap-2 text-solar">
              <ArrowRight className="h-5 w-5" />
              <h2 className="font-bold">Recommended next</h2>
            </div>
            <p className="font-bold">{recommendedLabel}</p>
            <p className="mt-1 text-sm text-white/62">{currentResult.trainNext}</p>
          </div>
          <div className="surface-soft p-4">
            <div className="mb-3 flex items-center gap-2 text-pulse">
              <Sparkles className="h-5 w-5" />
              <h2 className="font-bold">Attempt saved</h2>
            </div>
            <p className="text-white/66">
              {currentResult.mistakes} mistake{currentResult.mistakes === 1 ? "" : "s"} - {formatDuration(currentResult.durationMs)}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="surface p-5">
          <h2 className="text-2xl font-bold">Metrics</h2>
          <div className="mt-4 grid gap-3">
            {currentResult.metrics.map((metric) => (
              <div key={metric.label} className="flex items-center justify-between rounded-lg bg-white/7 p-3">
                <span className="text-white/62">{metric.label}</span>
                <span className="font-bold">{metric.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="surface p-5">
          <h2 className="text-2xl font-bold">Unlocked</h2>
          {unlocked.length ? (
            <div className="mt-4 space-y-3">
              {unlocked.map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 rounded-lg border border-mint/30 bg-mint/10 p-3">
                  <span className="rounded-lg bg-mint/15 p-2 text-mint">{achievement.icon}</span>
                  <div>
                    <p className="font-bold">{achievement.name}</p>
                    <p className="text-sm text-white/62">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-lg border border-dashed border-white/16 bg-white/5 p-6 text-center text-white/58">
              No new achievements this round.
            </div>
          )}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button className="btn-primary" type="button" onClick={trainRecommended}>
          <RotateCcw className="h-4 w-4" />
          Train {recommendedLabel}
        </button>
        <button className="btn-secondary" type="button" onClick={() => onNavigate("leaderboard")}>
          <BadgeCheck className="h-4 w-4" />
          View Leaderboard
        </button>
      </div>
    </div>
  );
}
