import type { ReactNode } from "react";
import type { CognitiveDomainId } from "./cognition";
import type { CognitiveProfile } from "./cognitiveProfile";

export type PageKey =
  | "home"
  | "play"
  | "results"
  | "profile"
  | "leaderboard"
  | "achievements"
  | "survey"
  | "settings"
  | "debug";

export type GameType = "reaction" | "memory" | "pattern";

export type CategoryScores = Record<GameType, number>;

export interface GameMetric {
  label: string;
  value: string;
}

export interface GameResult {
  id: string;
  gameType: GameType;
  title: string;
  rawScore: number;
  categoryScore: number;
  normalizedScore: number;
  percentileLabel: string;
  whatImproved: string;
  trainNext: string;
  timestamp: string;
  metrics: GameMetric[];
  mistakes: number;
  durationMs: number;
  accuracy?: number;
  reactionTimeMs?: number;
  memoryLength?: number;
  correctCount?: number;
  totalQuestions?: number;
  elapsedMs?: number;
  wasFailure?: boolean;
  earlyClick?: boolean;
  perfectRound?: boolean;
  conceptIQBefore?: number;
  conceptIQAfter?: number;
  conceptIQChange?: number;
  bestStatImproved?: string;
  recommendedGameType?: GameType;
  unlockedAchievementIds?: string[];
  cognitiveDomainId?: CognitiveDomainId;
  cognitiveDomainName?: string;
  cognitiveGameId?: string;
  cognitiveGameName?: string;
  skillTested?: string;
  domainScoreBefore?: number;
  domainScoreAfter?: number;
  domainScoreChange?: number;
  recommendedCognitiveDomainId?: CognitiveDomainId;
  recommendedCognitiveGameId?: string;
  recommendedCognitiveGameName?: string;
}

export interface CognitiveAttempt {
  id: string;
  attemptedAt: string;
  gameType: GameType;
  rawScore: number;
  normalizedScore: number;
  mistakes: number;
  durationMs: number;
  scoreBefore: number;
  scoreAfter: number;
  scoreChange: number;
}

export interface UserProfile {
  id?: string;
  username: string;
  displayName: string;
  conceptIQScore: number;
  abilityScore: number;
  growthScore: number;
  consistencyScore: number;
  gamesPlayed: number;
  bestReactionTime: number | null;
  bestMemoryScore: number;
  bestPatternScore: number;
  achievementsUnlocked: string[];
  sessions: string[];
  categoryScores: CategoryScores;
  domainScores: Partial<Record<CognitiveDomainId, number>>;
  history: GameResult[];
  attempts: CognitiveAttempt[];
  failCounts: CategoryScores;
  maxGamesInSession: number;
  cognitiveProfile: CognitiveProfile;
}

export interface Rank {
  name: string;
  min: number;
  max: number;
  accent: string;
}

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  category: "score" | "speed" | "memory" | "pattern" | "growth" | "consistency" | "grit" | "domain";
  target: number;
  icon: ReactNode;
}

export interface LeaderboardUser {
  id?: string;
  username: string;
  displayName?: string;
  conceptIQScore: number;
  growthScore: number;
  consistencyScore: number;
  categoryScores: CategoryScores;
  bestReactionTime: number | null;
  averageReactionTime: number | null;
  isCurrentUser?: boolean;
}

export interface PatternQuestion {
  id: number;
  prompt: string;
  sequence: string[];
  options: string[];
  answerIndex: number;
}
