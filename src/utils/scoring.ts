import type { CategoryScores, CognitiveAttempt, GameResult, GameType, UserProfile } from "../types";
import { getNewAchievementIds } from "./achievements";
import {
  calculateCognitiveScoreBreakdown,
  getDomainById,
  getDomainForGameType,
  getGameById,
  getGameForGameType,
  scoreForDomain,
} from "./cognitiveScoring";

const GAME_WEIGHTS: CategoryScores = {
  reaction: 0.34,
  memory: 0.33,
  pattern: 0.33,
};

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function reactionTimeToScore(reactionTimeMs: number, earlyClick = false) {
  if (earlyClick) {
    return 0;
  }

  return clamp(Math.round(1000 - (reactionTimeMs - 150) * 2.05), 0, 1000);
}

export function memoryRoundToScore(length: number, accuracy: number) {
  const lengthScore = clamp(length / 12, 0, 1) * 320;
  const accuracyScore = clamp(accuracy, 0, 1) * 680;
  return clamp(Math.round(lengthScore + accuracyScore), 0, 1000);
}

export function patternRoundToScore(correct: number, total: number, elapsedMs: number) {
  const accuracy = total ? correct / total : 0;
  const accuracyScore = accuracy * 780;
  const speedBonus = clamp((180000 - elapsedMs) / 180000, 0, 1) * 220;
  return clamp(Math.round(accuracyScore + speedBonus), 0, 1000);
}

export function calculateAbilityScore(categoryScores: CategoryScores) {
  return clamp(
    Math.round(
      categoryScores.reaction * GAME_WEIGHTS.reaction +
        categoryScores.memory * GAME_WEIGHTS.memory +
        categoryScores.pattern * GAME_WEIGHTS.pattern,
    ),
    0,
    1000,
  );
}

export function calculateConsistencyScore(sessions: string[], now = new Date()) {
  const thirtyDaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;
  const recentSessions = sessions.filter((session) => new Date(session).getTime() >= thirtyDaysAgo);
  const activeDays = new Set(recentSessions.map((session) => session.slice(0, 10))).size;
  const sessionScore = clamp(recentSessions.length / 12, 0, 1) * 760;
  const coverageScore = clamp(activeDays / 10, 0, 1) * 240;

  return clamp(Math.round(sessionScore + coverageScore), 0, 1000);
}

export function calculateGrowthScore(history: GameResult[]) {
  if (history.length < 3) {
    return 0;
  }

  const recent = history.slice(0, 5);
  const previous = history.slice(5, 10);
  const recentAverage = average(recent.map((result) => result.categoryScore));
  const previousAverage = previous.length
    ? average(previous.map((result) => result.categoryScore))
    : average(history.slice(1).map((result) => result.categoryScore));
  const improvement = recentAverage - previousAverage;

  return clamp(Math.round(500 + improvement * 2.4), 0, 1000);
}

export function scorePercentileLabel(score: number) {
  if (score >= 900) return "Top 1% placeholder";
  if (score >= 800) return "Top 5% placeholder";
  if (score >= 650) return "Top 15% placeholder";
  if (score >= 500) return "Above average placeholder";
  if (score >= 300) return "Building range placeholder";
  return "Baseline sample placeholder";
}

export function buildResultId(gameType: GameType) {
  return `${gameType}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function applyGameResultToProfile(
  profile: UserProfile,
  result: GameResult,
  sessionGameCount: number,
) {
  const domain = result.cognitiveDomainId ? getDomainById(result.cognitiveDomainId) : getDomainForGameType(result.gameType);
  const cognitiveGame = result.cognitiveGameId ? getGameById(result.cognitiveGameId) : getGameForGameType(result.gameType);
  const domainScoreBefore = scoreForDomain(profile.categoryScores, domain.id, profile.domainScores);
  const categoryScores = {
    ...profile.categoryScores,
    [result.gameType]: smoothCategoryScore(profile.categoryScores[result.gameType], result.categoryScore),
  };
  const domainScores = {
    ...profile.domainScores,
    [domain.id]: smoothCategoryScore(domainScoreBefore, result.categoryScore),
  };
  const sessions = [...profile.sessions, result.timestamp];
  const provisionalHistory = [result, ...profile.history];
  const cognitiveBreakdown = calculateCognitiveScoreBreakdown({
    ...profile,
    categoryScores,
    domainScores,
    sessions,
    history: provisionalHistory,
  });
  const conceptIQAfter = cognitiveBreakdown.overallConceptIQScore;
  const domainScoreAfter =
    cognitiveBreakdown.domainScores.find((domainScore) => domainScore.domainId === domain.id)?.score ?? domainScoreBefore;
  const recommendedGameType =
    (cognitiveBreakdown.recommendedGameId
      ? getGameById(cognitiveBreakdown.recommendedGameId)?.playableGameType
      : undefined) ?? result.gameType;
  const recommendedCognitiveGame = cognitiveBreakdown.recommendedGameId
    ? cognitiveBreakdown.recommendedGameName
    : undefined;
  const failCounts = {
    ...profile.failCounts,
    [result.gameType]: profile.failCounts[result.gameType] + (result.wasFailure ? 1 : 0),
  };
  const enrichedResult: GameResult = {
    ...result,
    normalizedScore: result.normalizedScore ?? result.categoryScore,
    mistakes: result.mistakes ?? 0,
    durationMs: result.durationMs ?? result.elapsedMs ?? result.reactionTimeMs ?? 0,
    conceptIQBefore: profile.conceptIQScore,
    conceptIQAfter,
    conceptIQChange: conceptIQAfter - profile.conceptIQScore,
    cognitiveDomainId: domain.id,
    cognitiveDomainName: domain.name,
    cognitiveGameId: cognitiveGame?.id,
    cognitiveGameName: cognitiveGame?.name,
    skillTested: cognitiveGame?.primarySkill ?? domain.primaryMetrics[0],
    domainScoreBefore,
    domainScoreAfter,
    domainScoreChange: domainScoreAfter - domainScoreBefore,
    recommendedCognitiveDomainId: cognitiveBreakdown.recommendedDomainId,
    recommendedCognitiveGameId: cognitiveBreakdown.recommendedGameId,
    recommendedCognitiveGameName: recommendedCognitiveGame,
  };
  const history = [enrichedResult, ...profile.history];
  const attempt = resultToAttempt(enrichedResult);
  const nextProfile: UserProfile = {
    ...profile,
    conceptIQScore: conceptIQAfter,
    abilityScore: cognitiveBreakdown.abilityScore,
    growthScore: cognitiveBreakdown.growthScore,
    consistencyScore: cognitiveBreakdown.consistencyScore,
    gamesPlayed: profile.gamesPlayed + 1,
    bestReactionTime:
      typeof result.reactionTimeMs === "number" && !result.earlyClick
        ? profile.bestReactionTime === null
          ? result.reactionTimeMs
          : Math.min(profile.bestReactionTime, result.reactionTimeMs)
        : profile.bestReactionTime,
    bestMemoryScore:
      result.gameType === "memory"
        ? Math.max(profile.bestMemoryScore, result.categoryScore)
        : profile.bestMemoryScore,
    bestPatternScore:
      result.gameType === "pattern"
        ? Math.max(profile.bestPatternScore, result.categoryScore)
        : profile.bestPatternScore,
    sessions,
    categoryScores,
    domainScores,
    attempts: [attempt, ...profile.attempts],
    failCounts,
    history,
    maxGamesInSession: Math.max(profile.maxGamesInSession, sessionGameCount),
  };
  const unlockedAchievementIds = getNewAchievementIds(nextProfile);
  const bestStatImproved = getBestStatImproved(profile, nextProfile, enrichedResult);
  const finalProfile = {
    ...nextProfile,
    achievementsUnlocked: [...new Set([...nextProfile.achievementsUnlocked, ...unlockedAchievementIds])],
  };
  const finalResult = {
    ...enrichedResult,
    bestStatImproved,
    recommendedGameType,
    unlockedAchievementIds,
  };
  const finalHistory = [finalResult, ...profile.history];
  const finalAttempts = [resultToAttempt(finalResult), ...profile.attempts];
  const finalProfileWithResult = {
    ...finalProfile,
    history: finalHistory,
    attempts: finalAttempts,
  };

  return { profile: finalProfileWithResult, result: finalResult };
}

export function getRecommendedGameType(profile: UserProfile): GameType {
  const entries = Object.entries(profile.categoryScores) as Array<[GameType, number]>;
  const attemptedTypes = new Set(profile.attempts.map((attempt) => attempt.gameType));
  const untried = entries.find(([type]) => !attemptedTypes.has(type));

  if (untried) {
    return untried[0];
  }

  return entries.sort((a, b) => a[1] - b[1])[0][0];
}

function getBestStatImproved(previous: UserProfile, next: UserProfile, result: GameResult) {
  const candidates = [
    { label: "ConceptIQ Score", delta: next.conceptIQScore - previous.conceptIQScore },
    { label: "Growth Score", delta: next.growthScore - previous.growthScore },
    { label: "Consistency Score", delta: next.consistencyScore - previous.consistencyScore },
    {
      label: "Reaction Time",
      delta:
        previous.bestReactionTime !== null &&
        next.bestReactionTime !== null &&
        next.bestReactionTime < previous.bestReactionTime
          ? previous.bestReactionTime - next.bestReactionTime
          : 0,
      suffix: "ms faster",
    },
    { label: "Working Memory", delta: next.bestMemoryScore - previous.bestMemoryScore },
    { label: "Pattern Reasoning", delta: next.bestPatternScore - previous.bestPatternScore },
  ];
  const best = candidates.sort((a, b) => b.delta - a.delta)[0];

  if (best.delta > 0) {
    return `${best.label} +${Math.round(best.delta)}${best.suffix ? ` ${best.suffix}` : ""}`;
  }

  return result.wasFailure ? "Control data captured" : "Profile calibration improved";
}

function resultToAttempt(result: GameResult): CognitiveAttempt {
  const scoreBefore = result.conceptIQBefore ?? 0;
  const scoreAfter = result.conceptIQAfter ?? scoreBefore;

  return {
    id: result.id,
    attemptedAt: result.timestamp,
    gameType: result.gameType,
    rawScore: result.rawScore,
    normalizedScore: result.normalizedScore ?? result.categoryScore,
    mistakes: result.mistakes ?? 0,
    durationMs: result.durationMs ?? result.elapsedMs ?? result.reactionTimeMs ?? 0,
    scoreBefore,
    scoreAfter,
    scoreChange: result.conceptIQChange ?? scoreAfter - scoreBefore,
  };
}

function smoothCategoryScore(previous: number, latest: number) {
  if (previous <= 0) {
    return latest;
  }

  return clamp(Math.round(previous * 0.65 + latest * 0.35), 0, 1000);
}

function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
