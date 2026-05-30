import { useRef, useState } from "react";
import { RotateCcw, Timer, Zap } from "lucide-react";
import type { GameResult, UserProfile } from "../types";
import { averageReactionTime, formatMs } from "../utils/format";
import { buildResultId, reactionTimeToScore, scorePercentileLabel } from "../utils/scoring";

interface ReactionTimeGameProps {
  profile: UserProfile;
  onComplete: (result: GameResult) => void;
}

type ReactionState = "idle" | "waiting" | "ready" | "early";

export function ReactionTimeGame({ profile, onComplete }: ReactionTimeGameProps) {
  const [state, setState] = useState<ReactionState>("idle");
  const [message, setMessage] = useState("Press start, then wait for the signal.");
  const timeoutRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);
  const readyAtRef = useRef(0);
  const averageReaction = averageReactionTime(profile.history);

  function start() {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    setState("waiting");
    setMessage("Hold steady...");
    startedAtRef.current = performance.now();
    const delay = 1200 + Math.random() * 2600;
    timeoutRef.current = window.setTimeout(() => {
      readyAtRef.current = performance.now();
      setState("ready");
      setMessage("Click now!");
    }, delay);
  }

  function reset() {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    setState("idle");
    setMessage("Press start, then wait for the signal.");
  }

  function handlePanelClick() {
    if (state === "waiting") {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }

      setState("early");
      setMessage("Too early. That attempt counts as a control miss.");
      completeAttempt(0, true);
      return;
    }

    if (state === "ready") {
      const reactionTime = Math.round(performance.now() - readyAtRef.current);
      completeAttempt(reactionTime, false);
    }
  }

  function completeAttempt(reactionTime: number, earlyClick: boolean) {
    const categoryScore = reactionTimeToScore(reactionTime || 999, earlyClick);
    const title = earlyClick ? "Early Click Penalty" : `${reactionTime}ms reaction`;
    const durationMs = Math.round(performance.now() - startedAtRef.current);

    onComplete({
      id: buildResultId("reaction"),
      gameType: "reaction",
      title,
      rawScore: reactionTime,
      categoryScore,
      normalizedScore: categoryScore,
      reactionTimeMs: earlyClick ? undefined : reactionTime,
      earlyClick,
      mistakes: earlyClick ? 1 : 0,
      durationMs,
      wasFailure: earlyClick || categoryScore < 250,
      timestamp: new Date().toISOString(),
      percentileLabel: scorePercentileLabel(categoryScore),
      whatImproved: earlyClick ? "Impulse control data was captured." : "Your reaction profile has a fresher speed sample.",
      trainNext: earlyClick
        ? "Wait for the color shift before clicking."
        : reactionTime > 320
          ? "Train faster visual response with another reaction round."
          : "Balance speed with working memory next.",
      metrics: [
        { label: "Reaction", value: earlyClick ? "Early" : `${reactionTime}ms` },
        { label: "Category score", value: `${categoryScore}/1000` },
      ],
    });
  }

  const panelTone =
    state === "ready"
      ? "border-mint/60 bg-mint/18"
      : state === "waiting"
        ? "border-solar/50 bg-solar/12"
        : state === "early"
          ? "border-bloom/50 bg-bloom/12"
          : "border-pulse/30 bg-white/7";

  return (
    <div className="surface p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white/56">Game A</p>
          <h2 className="text-2xl font-bold">Reaction Time</h2>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" type="button" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
          <button className="btn-primary" type="button" onClick={start} disabled={state === "waiting"}>
            <Zap className="h-4 w-4" />
            Start
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handlePanelClick}
        className={`flex min-h-72 w-full flex-col items-center justify-center rounded-lg border p-8 text-center transition ${panelTone}`}
      >
        <Timer className="mb-5 h-12 w-12 text-pulse" />
        <span className="text-4xl font-black text-white">{message}</span>
        <span className="mt-4 text-sm font-semibold text-white/62">The panel records your attempt when you click.</span>
      </button>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="surface-soft p-4">
          <p className="text-sm text-white/56">Best reaction</p>
          <p className="mt-1 text-2xl font-bold">{formatMs(profile.bestReactionTime)}</p>
        </div>
        <div className="surface-soft p-4">
          <p className="text-sm text-white/56">Average reaction</p>
          <p className="mt-1 text-2xl font-bold">{formatMs(averageReaction)}</p>
        </div>
      </div>
    </div>
  );
}
