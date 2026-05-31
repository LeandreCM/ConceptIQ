import { achievements } from "../data/achievements";
import type { UserProfile } from "../types";
import type { CognitiveDomainId } from "../types/cognition";
import { scoreForDomain } from "./cognitiveScoring";
import { calculateConsistencyScore, clamp } from "./scoring";

export function getNewAchievementIds(profile: UserProfile) {
  return achievements
    .filter((achievement) => !profile.achievementsUnlocked.includes(achievement.id))
    .filter((achievement) => isAchievementUnlocked(profile, achievement.id))
    .map((achievement) => achievement.id);
}

export function isAchievementUnlocked(profile: UserProfile, achievementId: string) {
  switch (achievementId) {
    case "big-brain":
      return profile.conceptIQScore >= 500;
    case "galaxy-brain":
      return profile.conceptIQScore >= 900;
    case "lightning-thinker":
      return profile.bestReactionTime !== null && profile.bestReactionTime < 250;
    case "human-calculator":
      return domainScore(profile, "quantitative-reasoning") >= 500 || profile.history.some((result) => result.gameType === "memory" && result.perfectRound);
    case "pattern-hunter":
      return profile.history.some(
        (result) => result.gameType === "pattern" && (result.correctCount ?? 0) >= 8,
      );
    case "comeback-arc":
      return profile.history.some((result) => (result.conceptIQChange ?? 0) >= 50);
    case "consistency-beast":
      return sessionsInLast30Days(profile.sessions) >= 10;
    case "brain-melt":
      return Math.max(profile.failCounts.reaction, profile.failCounts.memory, profile.failCounts.pattern) >= 5;
    case "one-more-rep":
      return profile.maxGamesInSession >= 3;
    case "the-outlier":
      return profile.conceptIQScore >= 980;
    case "memory-keeper":
      return domainScore(profile, "memory") >= 500;
    case "process-master":
      return profile.history.some((result) => result.cognitiveGameId === "process-order" && (result.accuracy ?? 0) >= 0.9);
    case "working-memory-beast":
      return domainScore(profile, "working-memory") >= 500;
    case "spatial-wizard":
      return domainScore(profile, "spatial-reasoning") >= 500;
    case "logic-lord":
      return domainScore(profile, "logic") >= 500;
    case "focus-monk":
      return domainScore(profile, "focus-attention") >= 500;
    case "verbal-analyst":
      return domainScore(profile, "verbal-reasoning") >= 500;
    case "system-architect":
      return domainScore(profile, "systems-thinking") >= 500;
    default:
      return false;
  }
}

export function getAchievementProgress(profile: UserProfile, achievementId: string) {
  switch (achievementId) {
    case "big-brain":
      return progress(profile.conceptIQScore, 500);
    case "galaxy-brain":
      return progress(profile.conceptIQScore, 900);
    case "lightning-thinker":
      if (profile.bestReactionTime === null) return 0;
      return clamp(Math.round(((650 - profile.bestReactionTime) / 400) * 100), 0, 100);
    case "human-calculator":
      return Math.max(progress(domainScore(profile, "quantitative-reasoning"), 500), isAchievementUnlocked(profile, achievementId) ? 100 : 0);
    case "pattern-hunter":
      return progress(
        Math.max(
          0,
          ...profile.history
            .filter((result) => result.gameType === "pattern")
            .map((result) => result.correctCount ?? 0),
        ),
        8,
      );
    case "comeback-arc":
      return progress(
        Math.max(0, ...profile.history.map((result) => result.conceptIQChange ?? 0)),
        50,
      );
    case "consistency-beast":
      return progress(sessionsInLast30Days(profile.sessions), 10);
    case "brain-melt":
      return progress(
        Math.max(profile.failCounts.reaction, profile.failCounts.memory, profile.failCounts.pattern),
        5,
      );
    case "one-more-rep":
      return progress(profile.maxGamesInSession, 3);
    case "the-outlier":
      return progress(profile.conceptIQScore, 980);
    case "memory-keeper":
      return progress(domainScore(profile, "memory"), 500);
    case "process-master":
      return isAchievementUnlocked(profile, achievementId) ? 100 : 0;
    case "working-memory-beast":
      return progress(domainScore(profile, "working-memory"), 500);
    case "spatial-wizard":
      return progress(domainScore(profile, "spatial-reasoning"), 500);
    case "logic-lord":
      return progress(domainScore(profile, "logic"), 500);
    case "focus-monk":
      return progress(domainScore(profile, "focus-attention"), 500);
    case "verbal-analyst":
      return progress(domainScore(profile, "verbal-reasoning"), 500);
    case "system-architect":
      return progress(domainScore(profile, "systems-thinking"), 500);
    default:
      return 0;
  }
}

export function achievementTargetLabel(achievementId: string) {
  const labels: Record<string, string> = {
    "big-brain": "500 ConceptIQ",
    "galaxy-brain": "900 ConceptIQ",
    "lightning-thinker": "<250ms",
    "human-calculator": "500 Quantitative",
    "pattern-hunter": "8 correct",
    "comeback-arc": "+50 score change",
    "consistency-beast": "10 sessions",
    "brain-melt": "5 misses",
    "one-more-rep": "3 games",
    "the-outlier": "top 1%",
    "memory-keeper": "500 Memory",
    "process-master": "future process game",
    "working-memory-beast": "500 Working Memory",
    "spatial-wizard": "500 Spatial",
    "logic-lord": "500 Logic",
    "focus-monk": "500 Focus",
    "verbal-analyst": "500 Verbal",
    "system-architect": "500 Systems",
  };

  return labels[achievementId] ?? "Goal";
}

export function sessionsInLast30Days(sessions: string[]) {
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  return sessions.filter((session) => new Date(session).getTime() >= thirtyDaysAgo).length;
}

export function consistencyMonitorValue(profile: UserProfile) {
  return calculateConsistencyScore(profile.sessions);
}

function progress(value: number, target: number) {
  return clamp(Math.round((value / target) * 100), 0, 100);
}

function domainScore(profile: UserProfile, domainId: CognitiveDomainId) {
  return scoreForDomain(profile.categoryScores, domainId);
}
