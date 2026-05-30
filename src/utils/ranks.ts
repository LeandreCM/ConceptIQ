import type { Rank } from "../types";

export const ranks: Rank[] = [
  { name: "New Neuron", min: 0, max: 99, accent: "bg-white/20 text-white" },
  { name: "Spark", min: 100, max: 199, accent: "bg-solar/20 text-solar" },
  { name: "Pattern Seeker", min: 200, max: 349, accent: "bg-pulse/20 text-pulse" },
  { name: "Brain Builder", min: 350, max: 499, accent: "bg-mint/20 text-mint" },
  { name: "Big Brain", min: 500, max: 649, accent: "bg-bloom/20 text-bloom" },
  { name: "Cognitive Operator", min: 650, max: 799, accent: "bg-emerald-300/20 text-emerald-200" },
  { name: "System Thinker", min: 800, max: 899, accent: "bg-cyan-300/20 text-cyan-100" },
  { name: "Galaxy Brain", min: 900, max: 999, accent: "bg-fuchsia-300/20 text-fuchsia-100" },
  { name: "Concept Titan", min: 1000, max: 1000, accent: "bg-white text-ink" },
];

export function getRankForScore(score: number) {
  return ranks.find((rank) => score >= rank.min && score <= rank.max) ?? ranks[0];
}

export function getNextRank(score: number) {
  return ranks.find((rank) => rank.min > score) ?? null;
}

export function getRankProgress(score: number) {
  const rank = getRankForScore(score);
  if (rank.max === rank.min) {
    return 100;
  }

  return Math.round(((score - rank.min) / (rank.max - rank.min + 1)) * 100);
}
