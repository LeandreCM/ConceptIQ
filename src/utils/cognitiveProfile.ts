import type { CognitiveDomainId } from "../types/cognition";
import type { GameResult, UserProfile } from "../types";
import type {
  CognitiveAssessmentResult,
  CognitiveEvidenceSource,
  CognitiveHypothesis,
  CognitiveProfile,
  CognitiveRecommendation,
  CognitiveSignal,
  CognitiveVariable,
  CognitiveVariableKey,
  LearningMode,
  SurveyResponse,
} from "../types/cognitiveProfile";

type VariableDefinition = {
  label: string;
  defaultValue: number | boolean | string[];
  kind: "score" | "concern" | "flag" | "list";
};

const VARIABLE_DEFINITIONS: Record<CognitiveVariableKey, VariableDefinition> = {
  attention_score: { label: "Attention", defaultValue: 60, kind: "score" },
  working_memory_score: { label: "Working memory", defaultValue: 60, kind: "score" },
  long_term_memory_score: { label: "Long-term memory", defaultValue: 60, kind: "score" },
  reading_accuracy_score: { label: "Reading accuracy", defaultValue: 60, kind: "score" },
  reading_comprehension_score: { label: "Reading comprehension", defaultValue: 60, kind: "score" },
  math_accuracy_score: { label: "Math accuracy", defaultValue: 60, kind: "score" },
  symbol_accuracy_score: { label: "Symbol accuracy", defaultValue: 60, kind: "score" },
  processing_speed_score: { label: "Processing speed", defaultValue: 60, kind: "score" },
  spatial_reasoning_score: { label: "Spatial reasoning", defaultValue: 60, kind: "score" },
  logic_reasoning_score: { label: "Logic reasoning", defaultValue: 60, kind: "score" },
  motivation_score: { label: "Motivation", defaultValue: 60, kind: "score" },
  confidence_score: { label: "Confidence", defaultValue: 60, kind: "score" },
  test_anxiety_score: { label: "Test anxiety", defaultValue: 30, kind: "concern" },
  instruction_following_score: { label: "Instruction following", defaultValue: 60, kind: "score" },
  dyslexia_flag: { label: "Reading-struggle flag", defaultValue: false, kind: "flag" },
  adhd_flag: { label: "Attention-struggle flag", defaultValue: false, kind: "flag" },
  learning_struggle_flags: { label: "Learning-struggle flags", defaultValue: [], kind: "list" },
  preferred_learning_modes: { label: "Preferred learning modes", defaultValue: [], kind: "list" },
};

const MAX_EVIDENCE_PER_VARIABLE = 8;
const MAX_ASSESSMENTS = 80;
const MAX_SURVEYS = 8;

export function createDefaultCognitiveProfile(now = new Date().toISOString()): CognitiveProfile {
  const variables = {} as Record<CognitiveVariableKey, CognitiveVariable>;

  for (const key of Object.keys(VARIABLE_DEFINITIONS) as CognitiveVariableKey[]) {
    const definition = VARIABLE_DEFINITIONS[key];
    variables[key] = {
      key,
      label: definition.label,
      value: Array.isArray(definition.defaultValue) ? [...definition.defaultValue] : definition.defaultValue,
      confidence: 0,
      evidenceSources: [],
      lastUpdated: now,
    };
  }

  return {
    variables,
    surveyResponses: [],
    assessmentResults: [],
    hypotheses: [],
    recommendations: [],
    lastUpdated: now,
  };
}

export function normalizeCognitiveProfile(profile?: Partial<CognitiveProfile> | null): CognitiveProfile {
  const fallback = createDefaultCognitiveProfile();

  if (!profile || typeof profile !== "object") {
    return fallback;
  }

  const variables = { ...fallback.variables };
  for (const key of Object.keys(VARIABLE_DEFINITIONS) as CognitiveVariableKey[]) {
    const incoming = profile.variables?.[key];

    if (!incoming) {
      continue;
    }

    variables[key] = {
      ...variables[key],
      ...incoming,
      evidenceSources: incoming.evidenceSources ?? [],
      lastUpdated: incoming.lastUpdated ?? profile.lastUpdated ?? fallback.lastUpdated,
    };
  }

  return {
    variables,
    surveyResponses: profile.surveyResponses ?? [],
    assessmentResults: profile.assessmentResults ?? [],
    hypotheses: profile.hypotheses ?? [],
    recommendations: profile.recommendations ?? [],
    lastUpdated: profile.lastUpdated ?? fallback.lastUpdated,
  };
}

export function getCognitiveVariableDefinition(key: CognitiveVariableKey) {
  return VARIABLE_DEFINITIONS[key];
}

export function calculateSurveySignals(response: SurveyResponse): CognitiveSignal[] {
  const flags = learningFlagsFromSurvey(response);
  const historyConfidence = (history: SurveyResponse["adhdHistory"]) =>
    history === "diagnosed" ? 72 : history === "suspected" ? 55 : 20;

  return compactSignals([
    scoreSignal("attention_score", difficultyToScore(response.attentionDifficulties), 45, "survey", "Attention self-report", `Reported attention difficulty: ${response.attentionDifficulties}/5.`),
    scoreSignal("attention_score", scaleToScore(response.sleepQuality, 5), 30, "survey", "Sleep quality", `Reported sleep quality: ${response.sleepQuality}/5; sleep can affect attention estimates.`),
    scoreSignal("working_memory_score", difficultyToScore(response.workingMemoryDifficulties), 48, "survey", "Working-memory self-report", `Reported working-memory difficulty: ${response.workingMemoryDifficulties}/5.`),
    scoreSignal("long_term_memory_score", difficultyToScore(response.troubleRememberingInstructions), 34, "survey", "Instruction recall", `Reported trouble remembering instructions: ${response.troubleRememberingInstructions}/5.`),
    scoreSignal("reading_accuracy_score", difficultyToScore(response.readingStruggles), 45, "survey", "Reading self-report", `Reported reading struggles: ${response.readingStruggles}/5.`),
    scoreSignal("reading_comprehension_score", difficultyToScore(response.readingStruggles), 35, "survey", "Reading comprehension self-report", `Reading difficulty may affect comprehension until assessed directly.`),
    scoreSignal("symbol_accuracy_score", difficultyToScore(response.troubleReadingNumbersSymbolsSigns), 50, "survey", "Symbol-reading self-report", `Reported trouble reading numbers, symbols, or negative signs: ${response.troubleReadingNumbersSymbolsSigns}/5.`),
    scoreSignal("math_accuracy_score", difficultyToScore(response.mathStruggles), 45, "survey", "Math self-report", `Reported math struggles: ${response.mathStruggles}/5.`),
    scoreSignal("math_accuracy_score", difficultyToScore(response.troubleReadingNumbersSymbolsSigns), 32, "survey", "Math-symbol interference", "Symbol-reading difficulty can interfere with math accuracy."),
    scoreSignal("spatial_reasoning_score", difficultyToScore(response.spatialReasoningStruggles), 45, "survey", "Spatial self-report", `Reported spatial reasoning struggles: ${response.spatialReasoningStruggles}/5.`),
    scoreSignal("motivation_score", scaleToScore(response.motivationLevel, 10), 44, "survey", "Motivation self-report", `Reported motivation level: ${response.motivationLevel}/10.`),
    scoreSignal("confidence_score", scaleToScore(response.confidenceLevel, 10), 44, "survey", "Confidence self-report", `Reported confidence level: ${response.confidenceLevel}/10.`),
    scoreSignal("test_anxiety_score", scaleToScore(response.testAnxiety, 5), 48, "survey", "Test-anxiety self-report", `Reported anxiety during tests: ${response.testAnxiety}/5.`),
    scoreSignal("instruction_following_score", difficultyToScore(response.troubleFollowingMultiStepTasks), 46, "survey", "Multi-step task self-report", `Reported trouble following multi-step tasks: ${response.troubleFollowingMultiStepTasks}/5.`),
    scoreSignal("processing_speed_score", scaleToScore(response.sleepQuality, 5), 25, "survey", "Sleep-speed context", "Sleep quality can temporarily affect processing-speed estimates."),
    flagSignal("dyslexia_flag", response.dyslexiaHistory === "diagnosed" || response.dyslexiaHistory === "suspected", historyConfidence(response.dyslexiaHistory), "survey", "Reading history", historyDetail("dyslexia", response.dyslexiaHistory)),
    flagSignal("adhd_flag", response.adhdHistory === "diagnosed" || response.adhdHistory === "suspected", historyConfidence(response.adhdHistory), "survey", "Attention history", historyDetail("ADHD", response.adhdHistory)),
    listSignal("learning_struggle_flags", flags, 50, "survey", "Reported learning-struggle flags", flags.length ? flags.join(", ") : "No major self-reported learning-struggle flags."),
    listSignal("preferred_learning_modes", response.preferredLearningModes, 60, "survey", "Preferred learning modes", response.preferredLearningModes.join(", ")),
  ]);
}

export function updateCognitiveVariables(
  variables: Record<CognitiveVariableKey, CognitiveVariable>,
  signals: CognitiveSignal[],
  now = new Date().toISOString(),
) {
  const nextVariables = { ...variables };

  for (const signal of signals) {
    const current = nextVariables[signal.variableKey] ?? createDefaultCognitiveProfile(now).variables[signal.variableKey];
    nextVariables[signal.variableKey] = applySignal(current, signal, now);
  }

  return nextVariables;
}

export function generateHypotheses(profile: CognitiveProfile): CognitiveHypothesis[] {
  const now = new Date().toISOString();
  const variables = profile.variables;
  const hypotheses = [
    bottleneckHypothesis(
      "working-memory-bottleneck",
      "Possible working memory bottleneck",
      variables.working_memory_score,
      "Reverse Sequence or Flash Addition",
      "Flash Addition",
      now,
    ),
    bottleneckHypothesis(
      "reading-accuracy-bottleneck",
      "Possible reading accuracy bottleneck",
      variables.reading_accuracy_score,
      "Symbol Accuracy Drill",
      "Short Reading Test",
      now,
      variables.dyslexia_flag.value === true ? 12 : 0,
    ),
    bottleneckHypothesis(
      "symbol-processing-issue",
      "Possible symbol-processing issue",
      variables.symbol_accuracy_score,
      "Symbol Match",
      "Symbol Match",
      now,
    ),
    bottleneckHypothesis(
      "attention-bottleneck",
      "Possible attention bottleneck",
      variables.attention_score,
      "Target Filter",
      "Target Filter",
      now,
      variables.adhd_flag.value === true ? 12 : 0,
    ),
    bottleneckHypothesis(
      "math-fluency-bottleneck",
      "Possible math fluency bottleneck",
      variables.math_accuracy_score,
      "Mental Math",
      "Mental Math",
      now,
    ),
    concernHypothesis(
      "test-anxiety-interference",
      "Possible test anxiety interference",
      variables.test_anxiety_score,
      "Low-pressure baseline assessment",
      "Short, untimed review rounds",
      now,
    ),
    bottleneckHypothesis(
      "motivation-barrier",
      "Possible motivation barrier",
      variables.motivation_score,
      "Motivation check-in",
      "Short daily training path",
      now,
    ),
    bottleneckHypothesis(
      "instruction-following-bottleneck",
      "Possible instruction-following bottleneck",
      variables.instruction_following_score,
      "Follow Instructions",
      "Follow Instructions",
      now,
    ),
  ];

  return hypotheses
    .filter((hypothesis): hypothesis is CognitiveHypothesis => hypothesis !== null && hypothesis.confidence >= 35)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 6);
}

export function generateRecommendations(profile: CognitiveProfile): CognitiveRecommendation[] {
  const hypotheses = profile.hypotheses.length ? profile.hypotheses : generateHypotheses(profile);
  const primary = hypotheses[0];

  if (primary) {
    const targetVariable = variableForHypothesis(primary.id);
    return [
      {
        id: `${primary.id}-recommendation`,
        title: primary.recommendedTrainingActivity,
        detail: `Recommended because ${primary.name.toLowerCase()} is active at ${primary.confidence}% confidence.`,
        priority: primary.confidence >= 70 ? "high" : "medium",
        targetVariable,
        recommendedGameId: gameIdForTraining(primary.recommendedTrainingActivity),
      },
    ];
  }

  const lowest = Object.values(profile.variables)
    .filter((variable) => VARIABLE_DEFINITIONS[variable.key].kind === "score")
    .sort((a, b) => numericValue(a) - numericValue(b))[0];

  return [
    {
      id: "baseline-recommendation",
      title: lowest ? `${lowest.label} baseline` : "Baseline assessment",
      detail: "Complete a few varied games so ConceptIQ can build stronger evidence.",
      priority: "low",
      targetVariable: lowest?.key ?? "working_memory_score",
    },
  ];
}

export function updateUserCognitiveProfile(
  profile: UserProfile,
  input: {
    surveyResponse?: SurveyResponse;
    assessmentResult?: CognitiveAssessmentResult;
    gameResult?: GameResult;
    now?: string;
  },
): UserProfile {
  const now = input.now ?? new Date().toISOString();
  const cognitiveProfile = normalizeCognitiveProfile(profile.cognitiveProfile);
  const surveySignals = input.surveyResponse ? calculateSurveySignals(input.surveyResponse) : [];
  const assessmentResult = input.assessmentResult ?? (input.gameResult ? gameResultToAssessment(input.gameResult) : undefined);
  const assessmentSignals = assessmentResult ? calculateAssessmentSignals(assessmentResult, profile, now) : [];
  const patternSignals = assessmentResult ? calculateRepeatedPatternSignals([...profile.history, input.gameResult].filter(Boolean) as GameResult[], assessmentResult, now) : [];
  const variables = updateCognitiveVariables(cognitiveProfile.variables, [...surveySignals, ...assessmentSignals, ...patternSignals], now);
  const draftProfile: CognitiveProfile = {
    variables,
    surveyResponses: input.surveyResponse
      ? [input.surveyResponse, ...cognitiveProfile.surveyResponses].slice(0, MAX_SURVEYS)
      : cognitiveProfile.surveyResponses,
    assessmentResults: assessmentResult
      ? [assessmentResult, ...cognitiveProfile.assessmentResults].slice(0, MAX_ASSESSMENTS)
      : cognitiveProfile.assessmentResults,
    hypotheses: [],
    recommendations: [],
    lastUpdated: now,
  };
  const hypotheses = generateHypotheses(draftProfile);
  const recommendations = generateRecommendations({ ...draftProfile, hypotheses });

  return {
    ...profile,
    cognitiveProfile: {
      ...draftProfile,
      hypotheses,
      recommendations,
    },
  };
}

export function createMockAssessmentResult(now = new Date().toISOString()): CognitiveAssessmentResult {
  return {
    id: `mock-symbol-${Date.now()}`,
    source: "mock",
    gameType: "memory",
    cognitiveGameId: "symbol-accuracy",
    cognitiveGameName: "Symbol Accuracy",
    cognitiveDomainId: "perception",
    normalizedScore: 420,
    rawScore: 4,
    mistakes: 3,
    durationMs: 52000,
    accuracy: 0.57,
    errorTags: ["symbol_confusion", "negative_sign_miss", "multi_step_error"],
    completedAt: now,
  };
}

export function applyMockAssessmentUpdate(profile: UserProfile) {
  return updateUserCognitiveProfile(profile, { assessmentResult: createMockAssessmentResult() });
}

export function cognitiveVariableStrengths(profile: CognitiveProfile, limit = 4) {
  return Object.values(profile.variables)
    .filter((variable) => VARIABLE_DEFINITIONS[variable.key].kind === "score")
    .sort((a, b) => numericValue(b) - numericValue(a))
    .slice(0, limit);
}

export function cognitiveVariableBottlenecks(profile: CognitiveProfile, limit = 4) {
  return Object.values(profile.variables)
    .filter((variable) => VARIABLE_DEFINITIONS[variable.key].kind === "score")
    .sort((a, b) => numericValue(a) - numericValue(b))
    .slice(0, limit);
}

function calculateAssessmentSignals(result: CognitiveAssessmentResult, profile: UserProfile, now: string): CognitiveSignal[] {
  const score = clamp(result.normalizedScore / 10, 0, 100);
  const confidence = result.source === "game" ? 55 : result.source === "assessment" ? 62 : 48;
  const lowAccuracy = (result.accuracy ?? 1) < 0.65 || result.mistakes >= 3;
  const domainSignals = domainToSignals(result.cognitiveDomainId, score, confidence, result, now);
  const errorSignals = errorTagSignals(result, confidence + (lowAccuracy ? 8 : 0));

  return compactSignals([...domainSignals, ...errorSignals]);
}

function calculateRepeatedPatternSignals(history: GameResult[], result: CognitiveAssessmentResult, now: string): CognitiveSignal[] {
  const related = history
    .filter((entry) => entry?.cognitiveGameId === result.cognitiveGameId || entry?.cognitiveDomainId === result.cognitiveDomainId)
    .slice(0, 6);
  const weakResults = related.filter((entry) => (entry.accuracy ?? entry.normalizedScore / 1000) < 0.65 || (entry.mistakes ?? 0) >= 2);

  if (weakResults.length < 3) {
    return [];
  }

  const confidence = clamp(68 + weakResults.length * 4, 68, 86);
  const detail = `Repeated pattern: ${weakResults.length}/${related.length} recent related attempts had low accuracy or elevated mistakes.`;

  if (/flash|math|number/i.test(`${result.cognitiveGameId} ${result.cognitiveGameName}`)) {
    return [scoreSignal("math_accuracy_score", 40, confidence, "error_pattern", "Repeated math errors", detail, result)];
  }

  if (result.cognitiveDomainId === "working-memory") {
    return [scoreSignal("working_memory_score", 38, confidence, "error_pattern", "Repeated working-memory errors", detail, result)];
  }

  if (result.cognitiveDomainId === "attention") {
    return [scoreSignal("attention_score", 40, confidence, "error_pattern", "Repeated attention errors", detail, result)];
  }

  if (result.cognitiveGameId?.includes("symbol")) {
    return [scoreSignal("symbol_accuracy_score", 38, confidence, "error_pattern", "Repeated symbol errors", detail, result)];
  }

  return [];
}

function domainToSignals(
  domainId: CognitiveDomainId | undefined,
  score: number,
  confidence: number,
  result: CognitiveAssessmentResult,
  now: string,
): CognitiveSignal[] {
  const detail = `${result.cognitiveGameName ?? "Assessment"} produced a normalized score of ${result.normalizedScore}/1000 with ${result.mistakes} mistake${result.mistakes === 1 ? "" : "s"}.`;

  switch (domainId) {
    case "learning-knowledge-integration":
      return [scoreSignal("long_term_memory_score", score, confidence, "game", "Memory performance", detail, result)];
    case "working-memory":
      return [scoreSignal("working_memory_score", score, confidence, "game", "Working-memory performance", detail, result)];
    case "spatial-reasoning":
      return [scoreSignal("spatial_reasoning_score", score, confidence, "game", "Spatial performance", detail, result)];
    case "logic-reasoning":
    case "causal-reasoning":
    case "pattern-recognition":
    case "executive-control":
      return [scoreSignal("logic_reasoning_score", score, confidence, "game", "Reasoning performance", detail, result)];
    case "attention":
      return [scoreSignal("attention_score", score, confidence, "game", "Attention performance", detail, result)];
    case "perception":
      return [
        scoreSignal("symbol_accuracy_score", score, confidence, "game", "Perception performance", detail, result),
        scoreSignal("processing_speed_score", score, confidence - 8, "game", "Visual processing performance", detail, result),
      ];
    case "language-concepts":
      return [
        scoreSignal("reading_comprehension_score", score, confidence, "game", "Verbal comprehension performance", detail, result),
        scoreSignal("reading_accuracy_score", score, confidence - 8, "game", "Reading accuracy performance", detail, result),
      ];
    default:
      return [scoreSignal("processing_speed_score", score, confidence - 12, "game", "General assessment performance", detail, result)];
  }
}

function errorTagSignals(result: CognitiveAssessmentResult, confidence: number): CognitiveSignal[] {
  const tags = new Set(result.errorTags ?? []);
  const signals: CognitiveSignal[] = [];

  if (tags.has("symbol_confusion") || tags.has("negative_sign_miss")) {
    signals.push(scoreSignal("symbol_accuracy_score", 35, confidence, "error_pattern", "Symbol accuracy error pattern", "Missed symbols, signs, or symbol-like items were observed.", result));
  }

  if (tags.has("multi_step_error")) {
    signals.push(scoreSignal("instruction_following_score", 42, confidence, "error_pattern", "Multi-step task error pattern", "Errors appeared during multi-step instructions.", result));
  }

  if (tags.has("attention_lapse")) {
    signals.push(scoreSignal("attention_score", 40, confidence, "error_pattern", "Attention lapse pattern", "Errors suggest possible attention drift during the task.", result));
  }

  return signals;
}

function gameResultToAssessment(result: GameResult): CognitiveAssessmentResult {
  const errorTags: string[] = [];

  if ((result.mistakes ?? 0) >= 2 && result.cognitiveGameId?.includes("symbol")) {
    errorTags.push("symbol_confusion");
  }

  if ((result.mistakes ?? 0) >= 2 && /math|ratio|estimate|addition|number/i.test(`${result.cognitiveGameId} ${result.cognitiveGameName}`)) {
    errorTags.push("negative_sign_miss");
  }

  if ((result.mistakes ?? 0) >= 2 && /instruction|process|rule|sequence/i.test(`${result.cognitiveGameId} ${result.cognitiveGameName}`)) {
    errorTags.push("multi_step_error");
  }

  if (result.wasFailure && result.gameType === "reaction") {
    errorTags.push("attention_lapse");
  }

  return {
    id: result.id,
    source: "game",
    gameType: result.gameType,
    cognitiveGameId: result.cognitiveGameId,
    cognitiveGameName: result.cognitiveGameName,
    cognitiveDomainId: result.cognitiveDomainId,
    normalizedScore: result.normalizedScore ?? result.categoryScore,
    rawScore: result.rawScore,
    mistakes: result.mistakes ?? 0,
    durationMs: result.durationMs ?? 0,
    accuracy: result.accuracy,
    errorTags,
    completedAt: result.timestamp,
  };
}

function applySignal(variable: CognitiveVariable, signal: CognitiveSignal, now: string): CognitiveVariable {
  const evidence = signalToEvidence(signal, now);
  const definition = VARIABLE_DEFINITIONS[variable.key];

  if (definition.kind === "flag") {
    const nextValue = Boolean(variable.value) || Boolean(signal.value);
    return {
      ...variable,
      value: nextValue,
      confidence: nextValue ? clamp(variable.confidence + signal.confidence * 0.45, signal.confidence, 95) : variable.confidence,
      evidenceSources: prependEvidence(variable.evidenceSources, evidence),
      lastUpdated: now,
    };
  }

  if (definition.kind === "list") {
    const current = Array.isArray(variable.value) ? variable.value : [];
    const incoming = Array.isArray(signal.value) ? signal.value : [];
    const merged = [...new Set([...current, ...incoming])];

    return {
      ...variable,
      value: merged,
      confidence: clamp(Math.max(variable.confidence, signal.confidence), 0, 95),
      evidenceSources: prependEvidence(variable.evidenceSources, evidence),
      lastUpdated: now,
    };
  }

  const previousValue = numericValue(variable);
  const signalValue = typeof signal.value === "number" ? signal.value : previousValue;
  const previousWeight = Math.max(variable.confidence, 12);
  const signalWeight = Math.max(signal.confidence, 12);
  const nextValue = clamp(Math.round((previousValue * previousWeight + signalValue * signalWeight) / (previousWeight + signalWeight)), 0, 100);
  const agreementBonus = Math.abs(previousValue - signalValue) <= 12 && variable.confidence > 0 ? 6 : 0;
  const sourceBonus = new Set([...variable.evidenceSources.map((source) => source.sourceType), signal.sourceType]).size >= 2 ? 5 : 0;

  return {
    ...variable,
    value: nextValue,
    confidence: clamp(Math.round(variable.confidence + signal.confidence * 0.34 + agreementBonus + sourceBonus), 0, 95),
    evidenceSources: prependEvidence(variable.evidenceSources, evidence),
    lastUpdated: now,
  };
}

function bottleneckHypothesis(
  id: string,
  name: string,
  variable: CognitiveVariable,
  recommendedNextAssessment: string,
  recommendedTrainingActivity: string,
  now: string,
  extraConfidence = 0,
) {
  const value = numericValue(variable);
  const severity = clamp(60 - value, 0, 60);
  const confidence = clamp(Math.round(variable.confidence * 0.72 + severity * 0.65 + extraConfidence), 0, 95);

  if (confidence < 35) {
    return null;
  }

  return hypothesisFromVariable(id, name, confidence, variable, recommendedNextAssessment, recommendedTrainingActivity, now);
}

function concernHypothesis(
  id: string,
  name: string,
  variable: CognitiveVariable,
  recommendedNextAssessment: string,
  recommendedTrainingActivity: string,
  now: string,
) {
  const value = numericValue(variable);
  const severity = clamp(value - 45, 0, 55);
  const confidence = clamp(Math.round(variable.confidence * 0.74 + severity * 0.7), 0, 95);

  if (confidence < 35) {
    return null;
  }

  return hypothesisFromVariable(id, name, confidence, variable, recommendedNextAssessment, recommendedTrainingActivity, now);
}

function hypothesisFromVariable(
  id: string,
  name: string,
  confidence: number,
  variable: CognitiveVariable,
  recommendedNextAssessment: string,
  recommendedTrainingActivity: string,
  now: string,
): CognitiveHypothesis {
  return {
    id,
    name,
    confidence,
    supportingEvidence: variable.evidenceSources.slice(0, 4).map((source) => source.detail),
    recommendedNextAssessment,
    recommendedTrainingActivity,
    updatedAt: now,
  };
}

function scoreSignal(
  variableKey: CognitiveVariableKey,
  value: number,
  confidence: number,
  sourceType: CognitiveSignal["sourceType"],
  label: string,
  detail: string,
  result?: Pick<CognitiveAssessmentResult, "cognitiveGameId" | "cognitiveDomainId">,
): CognitiveSignal {
  return {
    variableKey,
    value: clamp(Math.round(value), 0, 100),
    confidence: clamp(confidence, 0, 95),
    sourceType,
    label,
    detail,
    relatedGameId: result?.cognitiveGameId,
    relatedDomainId: result?.cognitiveDomainId,
  };
}

function flagSignal(
  variableKey: CognitiveVariableKey,
  value: boolean,
  confidence: number,
  sourceType: CognitiveSignal["sourceType"],
  label: string,
  detail: string,
): CognitiveSignal {
  return { variableKey, value, confidence, sourceType, label, detail };
}

function listSignal(
  variableKey: CognitiveVariableKey,
  value: string[],
  confidence: number,
  sourceType: CognitiveSignal["sourceType"],
  label: string,
  detail: string,
): CognitiveSignal {
  return { variableKey, value, confidence, sourceType, label, detail };
}

function signalToEvidence(signal: CognitiveSignal, now: string): CognitiveEvidenceSource {
  return {
    id: `${signal.sourceType}-${signal.variableKey}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    sourceType: signal.sourceType,
    label: signal.label,
    detail: signal.detail,
    confidence: signal.confidence,
    createdAt: now,
    relatedGameId: signal.relatedGameId,
    relatedDomainId: signal.relatedDomainId,
  };
}

function prependEvidence(existing: CognitiveEvidenceSource[], evidence: CognitiveEvidenceSource) {
  return [evidence, ...existing].slice(0, MAX_EVIDENCE_PER_VARIABLE);
}

function numericValue(variable: CognitiveVariable) {
  return typeof variable.value === "number" ? variable.value : variable.value === true ? 100 : 0;
}

function compactSignals(signals: CognitiveSignal[]) {
  return signals.filter((signal) => signal.confidence > 0);
}

function difficultyToScore(value: number, max = 5) {
  return clamp(Math.round(100 - ((value - 1) / (max - 1)) * 80), 0, 100);
}

function scaleToScore(value: number, max: number) {
  return clamp(Math.round((value / max) * 100), 0, 100);
}

function learningFlagsFromSurvey(response: SurveyResponse) {
  const flags: string[] = [];

  if (response.readingStruggles >= 4) flags.push("reported reading difficulty");
  if (response.mathStruggles >= 4) flags.push("reported math difficulty");
  if (response.attentionDifficulties >= 4) flags.push("reported attention difficulty");
  if (response.workingMemoryDifficulties >= 4) flags.push("reported working-memory difficulty");
  if (response.troubleReadingNumbersSymbolsSigns >= 4) flags.push("reported number/symbol difficulty");
  if (response.troubleFollowingMultiStepTasks >= 4) flags.push("reported multi-step task difficulty");
  if (response.visionHearingIssues >= 4) flags.push("reported vision/hearing factor");
  if (response.dyslexiaHistory === "diagnosed" || response.dyslexiaHistory === "suspected") flags.push("reading-struggle history");
  if (response.adhdHistory === "diagnosed" || response.adhdHistory === "suspected") flags.push("attention-struggle history");

  return flags;
}

function historyDetail(label: string, value: SurveyResponse["adhdHistory"]) {
  if (value === "diagnosed") {
    return `User reported a history of ${label}. ConceptIQ treats this only as context, not a diagnosis.`;
  }

  if (value === "suspected") {
    return `User reported suspected ${label}. ConceptIQ treats this as a possible learning-struggle flag.`;
  }

  if (value === "prefer-not-to-say") {
    return `User preferred not to share ${label} history.`;
  }

  return `User did not report ${label} history.`;
}

function variableForHypothesis(id: string): CognitiveVariableKey {
  if (id.includes("working-memory")) return "working_memory_score";
  if (id.includes("reading")) return "reading_accuracy_score";
  if (id.includes("symbol")) return "symbol_accuracy_score";
  if (id.includes("attention")) return "attention_score";
  if (id.includes("math")) return "math_accuracy_score";
  if (id.includes("anxiety")) return "test_anxiety_score";
  if (id.includes("motivation")) return "motivation_score";
  if (id.includes("instruction")) return "instruction_following_score";
  return "working_memory_score";
}

function gameIdForTraining(training: string) {
  const lower = training.toLowerCase();
  if (lower.includes("flash")) return "flash-addition";
  if (lower.includes("symbol")) return "symbol-match";
  if (lower.includes("target")) return "target-filter";
  if (lower.includes("mental math")) return "mental-math";
  if (lower.includes("instructions")) return "follow-instructions";
  if (lower.includes("reading")) return "short-reading-test";
  return undefined;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
