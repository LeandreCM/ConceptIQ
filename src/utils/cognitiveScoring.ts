import { cognitiveDomains } from "../data/cognitiveDomains";
import type { CategoryScores, GameResult, GameType, LeaderboardUser, UserProfile } from "../types";
import type { CognitiveDomain, CognitiveDomainId, CognitiveGame, CognitiveScoreBreakdown, DomainScore } from "../types/cognition";

const GAME_TO_DOMAIN: Record<GameType, CognitiveDomainId> = {
  reaction: "attention",
  memory: "working-memory",
  pattern: "pattern-recognition",
};

const IMPLEMENTED_DOMAIN_IDS = cognitiveDomains
  .filter((domain) => domain.games.some((game) => game.implemented))
  .map((domain) => domain.id);

export function calculateCognitiveScoreBreakdown(profile: UserProfile): CognitiveScoreBreakdown {
  const domainScores = calculateDomainScores(profile);
  const implementedScores = domainScores.filter((score) => IMPLEMENTED_DOMAIN_IDS.includes(score.domainId));
  const abilityScore = clamp(Math.round(average(implementedScores.map((score) => score.score))), 0, 1000);
  const growthScore = calculateGrowthScore(profile.history);
  const consistencyScore = calculateConsistencyScore(profile.sessions);
  const recommended = getRecommendedDomainScore(domainScores);
  const recommendedGame = getFirstPlayableGame(recommended.domainId);

  return {
    overallConceptIQScore: abilityScore,
    abilityScore,
    growthScore,
    consistencyScore,
    domainScores,
    recommendedDomainId: recommended.domainId,
    recommendedGameId: recommendedGame?.id,
    recommendedGameName: recommendedGame?.name,
  };
}

export function calculateDomainScores(profile: UserProfile): DomainScore[] {
  return cognitiveDomains.map((domain) => {
    const relatedResults = profile.history.filter((result) => getDomainIdForResult(result) === domain.id);
    const score = scoreForDomain(profile.categoryScores, domain.id, profile.domainScores);

    return {
      domainId: domain.id,
      domainName: domain.name,
      score,
      attempts: relatedResults.length,
      unlocked: domain.unlocked,
      lastAttemptAt: relatedResults[0]?.timestamp,
    };
  });
}

export function getDomainIdForGameType(gameType: GameType): CognitiveDomainId {
  return GAME_TO_DOMAIN[gameType];
}

export function getDomainIdForResult(result: GameResult): CognitiveDomainId {
  return normalizeDomainId(result.cognitiveDomainId) ?? getDomainIdForGameType(result.gameType);
}

export function getDomainForGameType(gameType: GameType): CognitiveDomain {
  return getDomainById(getDomainIdForGameType(gameType));
}

export function getDomainById(domainId: CognitiveDomainId): CognitiveDomain {
  return cognitiveDomains.find((domain) => domain.id === domainId) ?? cognitiveDomains[0];
}

export function getGameById(gameId: string): CognitiveGame | undefined {
  return cognitiveDomains.flatMap((domain) => domain.games).find((game) => game.id === gameId);
}

export function getGameForGameType(gameType: GameType): CognitiveGame | undefined {
  return cognitiveDomains.flatMap((domain) => domain.games).find((game) => game.playableGameType === gameType);
}

export function getFirstPlayableGame(domainId: CognitiveDomainId): CognitiveGame | undefined {
  return getDomainById(domainId).games.find((game) => game.implemented && !game.locked);
}

export function getRecommendedDomain(profile: UserProfile) {
  const breakdown = calculateCognitiveScoreBreakdown(profile);
  return getDomainById(breakdown.recommendedDomainId);
}

export function getTopDomainScores(profile: UserProfile, count = 3) {
  return calculateDomainScores(profile)
    .filter((domainScore) => domainScore.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
}

export function getBottomDomainScores(profile: UserProfile, count = 3) {
  return calculateDomainScores(profile)
    .slice()
    .sort((a, b) => a.score - b.score)
    .slice(0, count);
}

export function domainScoreForLeaderboardUser(user: LeaderboardUser, domainId: CognitiveDomainId) {
  return scoreForDomain(user.categoryScores, domainId);
}

export function strongestCognitiveDomainName(scores: CategoryScores) {
  const best = cognitiveDomains
    .map((domain) => ({ name: domain.name, score: scoreForDomain(scores, domain.id) }))
    .sort((a, b) => b.score - a.score)[0];

  return best?.score ? best.name : "Uncalibrated";
}

export function scoreForDomain(
  categoryScores: CategoryScores,
  domainId: CognitiveDomainId,
  domainScores: Partial<Record<CognitiveDomainId, number>> = {},
) {
  if (typeof domainScores[domainId] === "number") {
    return domainScores[domainId] ?? 0;
  }

  switch (domainId) {
    case "attention":
    case "perception":
    case "executive-control":
      return categoryScores.reaction;
    case "working-memory":
    case "language-concepts":
    case "learning-knowledge-integration":
      return categoryScores.memory;
    case "pattern-recognition":
    case "spatial-reasoning":
    case "logic-reasoning":
    case "causal-reasoning":
      return categoryScores.pattern;
    default:
      return 0;
  }
}

function normalizeDomainId(domainId?: string): CognitiveDomainId | undefined {
  switch (domainId) {
    case "memory":
      return "learning-knowledge-integration";
    case "logic":
      return "logic-reasoning";
    case "focus-attention":
    case "processing-speed":
      return "attention";
    case "verbal-reasoning":
      return "language-concepts";
    case "quantitative-reasoning":
      return "working-memory";
    case "systems-thinking":
      return "causal-reasoning";
    case "attention":
    case "working-memory":
    case "perception":
    case "pattern-recognition":
    case "spatial-reasoning":
    case "language-concepts":
    case "logic-reasoning":
    case "causal-reasoning":
    case "learning-knowledge-integration":
    case "executive-control":
      return domainId;
    default:
      return undefined;
  }
}

function getRecommendedDomainScore(domainScores: DomainScore[]) {
  const implemented = domainScores.filter((score) => IMPLEMENTED_DOMAIN_IDS.includes(score.domainId));
  const untried = implemented.find((score) => score.attempts === 0);

  if (untried) {
    return untried;
  }

  return implemented.sort((a, b) => a.score - b.score)[0] ?? domainScores[0];
}

function calculateConsistencyScore(sessions: string[], now = new Date()) {
  const thirtyDaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;
  const recentSessions = sessions.filter((session) => new Date(session).getTime() >= thirtyDaysAgo);
  const activeDays = new Set(recentSessions.map((session) => session.slice(0, 10))).size;
  const sessionScore = clamp(recentSessions.length / 12, 0, 1) * 760;
  const coverageScore = clamp(activeDays / 10, 0, 1) * 240;

  return clamp(Math.round(sessionScore + coverageScore), 0, 1000);
}

function calculateGrowthScore(history: GameResult[]) {
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

function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
