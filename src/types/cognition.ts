import type { GameType } from ".";

export type CognitiveDomainId =
  | "memory"
  | "working-memory"
  | "spatial-reasoning"
  | "logic"
  | "focus-attention"
  | "processing-speed"
  | "pattern-recognition"
  | "verbal-reasoning"
  | "quantitative-reasoning"
  | "systems-thinking";

export interface CognitiveSubdomain {
  id: string;
  name: string;
  description: string;
}

export interface CognitiveGame {
  id: string;
  name: string;
  description: string;
  subdomainIds: string[];
  primarySkill: string;
  metrics: string[];
  playableGameType?: GameType;
  implemented: boolean;
  locked: boolean;
}

export interface CognitiveDomain {
  id: CognitiveDomainId;
  name: string;
  description: string;
  whyItMatters: string;
  subdomains: CognitiveSubdomain[];
  games: CognitiveGame[];
  primaryMetrics: string[];
  iconName: string;
  colorClass: string;
  unlocked: boolean;
}

export interface GameAttempt {
  id: string;
  domainId: CognitiveDomainId;
  gameId: string;
  rawScore: number;
  normalizedScore: number;
  mistakes: number;
  durationMs: number;
  createdAt: string;
}

export interface DomainScore {
  domainId: CognitiveDomainId;
  domainName: string;
  score: number;
  attempts: number;
  unlocked: boolean;
  lastAttemptAt?: string;
}

export interface CognitiveScoreBreakdown {
  overallConceptIQScore: number;
  abilityScore: number;
  growthScore: number;
  consistencyScore: number;
  domainScores: DomainScore[];
  recommendedDomainId: CognitiveDomainId;
  recommendedGameId?: string;
  recommendedGameName?: string;
}
