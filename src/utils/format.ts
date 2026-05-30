import type { CategoryScores, GameResult, GameType } from "../types";

export function formatScore(score: number) {
  return Math.round(score).toLocaleString();
}

export function formatMs(ms: number | null | undefined) {
  return typeof ms === "number" ? `${Math.round(ms)}ms` : "Not set";
}

export function formatSigned(value: number | undefined) {
  if (!value) {
    return "0";
  }

  return value > 0 ? `+${value}` : `${value}`;
}

export function formatDuration(ms: number | undefined) {
  if (typeof ms !== "number" || ms <= 0) {
    return "0s";
  }

  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }

  return `${Math.round(ms / 1000)}s`;
}

export function categoryLabel(type: GameType) {
  const labels: Record<GameType, string> = {
    reaction: "Reaction Time",
    memory: "Working Memory",
    pattern: "Pattern Reasoning",
  };

  return labels[type];
}

export function strongestCategory(scores: CategoryScores) {
  const entries = Object.entries(scores) as Array<[GameType, number]>;
  const [type] = entries.sort((a, b) => b[1] - a[1])[0];
  return categoryLabel(type);
}

export function averageReactionTime(history: GameResult[]) {
  const reactionTimes = history
    .filter((result) => result.gameType === "reaction" && !result.earlyClick)
    .map((result) => result.reactionTimeMs)
    .filter((value): value is number => typeof value === "number");

  if (!reactionTimes.length) {
    return null;
  }

  const total = reactionTimes.reduce((sum, value) => sum + value, 0);
  return Math.round(total / reactionTimes.length);
}

export function relativeDate(value: string) {
  const date = new Date(value);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
