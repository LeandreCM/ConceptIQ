import type { CognitiveDomainId } from "./cognition";
import type { GameType } from "./index";

export type CognitiveVariableKey =
  | "attention_score"
  | "working_memory_score"
  | "long_term_memory_score"
  | "reading_accuracy_score"
  | "reading_comprehension_score"
  | "math_accuracy_score"
  | "symbol_accuracy_score"
  | "processing_speed_score"
  | "spatial_reasoning_score"
  | "logic_reasoning_score"
  | "motivation_score"
  | "confidence_score"
  | "test_anxiety_score"
  | "instruction_following_score"
  | "dyslexia_flag"
  | "adhd_flag"
  | "learning_struggle_flags"
  | "preferred_learning_modes";

export type CognitiveEvidenceSourceType = "survey" | "assessment" | "game" | "error_pattern" | "system";
export type LearningMode = "visual" | "text" | "audio" | "hands-on" | "examples" | "repetition";
export type ReportedHistory = "none" | "suspected" | "diagnosed" | "prefer-not-to-say";

export interface CognitiveEvidenceSource {
  id: string;
  sourceType: CognitiveEvidenceSourceType;
  label: string;
  detail: string;
  confidence: number;
  createdAt: string;
  relatedGameId?: string;
  relatedDomainId?: CognitiveDomainId;
}

export interface CognitiveVariable {
  key: CognitiveVariableKey;
  label: string;
  value: number | boolean | string[];
  confidence: number;
  evidenceSources: CognitiveEvidenceSource[];
  lastUpdated: string;
}

export interface SurveyResponse {
  id: string;
  completedAt: string;
  ageRange: string;
  educationLevel: string;
  primaryLanguage: string;
  sleepQuality: number;
  attentionDifficulties: number;
  workingMemoryDifficulties: number;
  readingStruggles: number;
  mathStruggles: number;
  spatialReasoningStruggles: number;
  motivationLevel: number;
  confidenceLevel: number;
  dyslexiaHistory: ReportedHistory;
  adhdHistory: ReportedHistory;
  visionHearingIssues: number;
  testAnxiety: number;
  troubleRememberingInstructions: number;
  troubleReadingNumbersSymbolsSigns: number;
  troubleFollowingMultiStepTasks: number;
  preferredLearningModes: LearningMode[];
}

export interface CognitiveAssessmentResult {
  id: string;
  source: "mock" | "game" | "assessment";
  gameType?: GameType;
  cognitiveGameId?: string;
  cognitiveGameName?: string;
  cognitiveDomainId?: CognitiveDomainId;
  normalizedScore: number;
  rawScore: number;
  mistakes: number;
  durationMs: number;
  accuracy?: number;
  errorTags?: string[];
  completedAt: string;
}

export interface CognitiveHypothesis {
  id: string;
  name: string;
  confidence: number;
  supportingEvidence: string[];
  recommendedNextAssessment: string;
  recommendedTrainingActivity: string;
  updatedAt: string;
}

export interface CognitiveRecommendation {
  id: string;
  title: string;
  detail: string;
  priority: "high" | "medium" | "low";
  targetVariable: CognitiveVariableKey;
  recommendedGameId?: string;
}

export interface CognitiveProfile {
  variables: Record<CognitiveVariableKey, CognitiveVariable>;
  surveyResponses: SurveyResponse[];
  assessmentResults: CognitiveAssessmentResult[];
  hypotheses: CognitiveHypothesis[];
  recommendations: CognitiveRecommendation[];
  lastUpdated: string;
}

export interface CognitiveSignal {
  variableKey: CognitiveVariableKey;
  value: number | boolean | string[];
  confidence: number;
  sourceType: CognitiveEvidenceSourceType;
  label: string;
  detail: string;
  relatedGameId?: string;
  relatedDomainId?: CognitiveDomainId;
}
