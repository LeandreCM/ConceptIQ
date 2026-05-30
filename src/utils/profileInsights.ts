import type { CategoryScores, GameResult, GameType, UserProfile } from "../types";
import { categoryLabel } from "./format";
import { getRecommendedGameType } from "./scoring";

export interface TrainingRecommendation {
  gameType: GameType;
  label: string;
  reason: string;
}

export function getTrainingRecommendation(profile: UserProfile, result?: GameResult | null): TrainingRecommendation {
  const gameType = result?.recommendedGameType ?? getRecommendedGameType(profile);
  const reasonByType: Record<GameType, string> = {
    reaction: "Your speed lane has the most room to move right now.",
    memory: "Your recall profile will lift the overall score fastest.",
    pattern: "Reasoning work is the cleanest next lever for score growth.",
  };

  return {
    gameType,
    label: categoryLabel(gameType),
    reason: result?.trainNext ?? reasonByType[gameType],
  };
}

export function getStrengths(profile: UserProfile) {
  const entries = sortedCategories(profile.categoryScores, "desc");
  const active = entries.filter(([, score]) => score > 0);

  if (!active.length) {
    return ["No strengths mapped yet. Complete any challenge to calibrate your profile."];
  }

  return active.slice(0, 2).map(([type, score]) => `${categoryLabel(type)}: ${Math.round(score)}/1000`);
}

export function getWeaknesses(profile: UserProfile) {
  const entries = sortedCategories(profile.categoryScores, "asc");
  const active = entries.filter(([, score]) => score > 0);

  if (active.length < 3) {
    const missing = entries.filter(([, score]) => score === 0).map(([type]) => categoryLabel(type));
    return missing.length
      ? missing.map((label) => `${label}: needs a first attempt`)
      : ["Keep playing to reveal sharper weakness signals."];
  }

  return active.slice(0, 2).map(([type, score]) => `${categoryLabel(type)}: ${Math.round(score)}/1000`);
}

export function scoreTrend(profile: UserProfile) {
  return profile.attempts
    .slice()
    .reverse()
    .map((attempt) => ({
      label: new Date(attempt.attemptedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      value: attempt.scoreAfter,
    }));
}

function sortedCategories(scores: CategoryScores, direction: "asc" | "desc") {
  const entries = Object.entries(scores) as Array<[GameType, number]>;
  return entries.sort((a, b) => (direction === "asc" ? a[1] - b[1] : b[1] - a[1]));
}
