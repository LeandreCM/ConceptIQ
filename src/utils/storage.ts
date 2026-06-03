import type { CognitiveAttempt, GameResult, UserProfile } from "../types";
import { createDefaultCognitiveProfile, normalizeCognitiveProfile } from "./cognitiveProfile";

const PROFILE_KEY = "conceptiq-profile";
const LAST_RESULT_KEY = "conceptiq-last-result";
const SESSION_COUNT_KEY = "conceptiq-session-game-count";

export const defaultProfile: UserProfile = {
  username: "Local Thinker",
  displayName: "Local Thinker",
  conceptIQScore: 0,
  abilityScore: 0,
  growthScore: 0,
  consistencyScore: 0,
  gamesPlayed: 0,
  bestReactionTime: null,
  bestMemoryScore: 0,
  bestPatternScore: 0,
  achievementsUnlocked: [],
  sessions: [],
  categoryScores: {
    reaction: 0,
    memory: 0,
    pattern: 0,
  },
  domainScores: {},
  history: [],
  attempts: [],
  failCounts: {
    reaction: 0,
    memory: 0,
    pattern: 0,
  },
  maxGamesInSession: 0,
  cognitiveProfile: createDefaultCognitiveProfile(),
};

export function loadProfile(): UserProfile {
  const stored = localStorage.getItem(PROFILE_KEY);

  if (!stored) {
    return defaultProfile;
  }

  try {
    const parsed = JSON.parse(stored) as Partial<UserProfile>;
    const history = (parsed.history ?? []).map(normalizeResult);
    const attempts = parsed.attempts ?? history.map(resultToAttempt).filter((attempt): attempt is CognitiveAttempt => attempt !== null);

    return {
      ...defaultProfile,
      ...parsed,
      displayName: parsed.displayName ?? parsed.username ?? defaultProfile.displayName,
      categoryScores: { ...defaultProfile.categoryScores, ...parsed.categoryScores },
      domainScores: { ...defaultProfile.domainScores, ...parsed.domainScores },
      failCounts: { ...defaultProfile.failCounts, ...parsed.failCounts },
      achievementsUnlocked: parsed.achievementsUnlocked ?? [],
      sessions: parsed.sessions ?? [],
      history,
      attempts,
      cognitiveProfile: normalizeCognitiveProfile(parsed.cognitiveProfile),
    };
  } catch {
    return defaultProfile;
  }
}

export function saveProfile(profile: UserProfile) {
  // Future backend integration can replace this profile and attempt write with API calls while keeping callers unchanged.
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function resetProfile() {
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(LAST_RESULT_KEY);
  sessionStorage.removeItem(SESSION_COUNT_KEY);
}

export function loadLastResult() {
  const stored = localStorage.getItem(LAST_RESULT_KEY);

  if (!stored) {
    return null;
  }

  try {
    return normalizeResult(JSON.parse(stored) as GameResult);
  } catch {
    return null;
  }
}

export function saveLastResult(result: GameResult) {
  localStorage.setItem(LAST_RESULT_KEY, JSON.stringify(result));
}

export function getSessionGameCount() {
  return Number(sessionStorage.getItem(SESSION_COUNT_KEY) ?? "0");
}

export function saveSessionGameCount(count: number) {
  sessionStorage.setItem(SESSION_COUNT_KEY, String(count));
}

function resultToAttempt(result: GameResult): CognitiveAttempt | null {
  if (typeof result.conceptIQBefore !== "number" || typeof result.conceptIQAfter !== "number") {
    return null;
  }

  return {
    id: result.id,
    attemptedAt: result.timestamp,
    gameType: result.gameType,
    rawScore: result.rawScore,
    normalizedScore: result.normalizedScore ?? result.categoryScore,
    mistakes: result.mistakes ?? 0,
    durationMs: result.durationMs ?? result.elapsedMs ?? result.reactionTimeMs ?? 0,
    scoreBefore: result.conceptIQBefore,
    scoreAfter: result.conceptIQAfter,
    scoreChange: result.conceptIQChange ?? result.conceptIQAfter - result.conceptIQBefore,
  };
}

function normalizeResult(result: GameResult): GameResult {
  return {
    ...result,
    normalizedScore: result.normalizedScore ?? result.categoryScore,
    mistakes: result.mistakes ?? 0,
    durationMs: result.durationMs ?? result.elapsedMs ?? result.reactionTimeMs ?? 0,
  };
}
