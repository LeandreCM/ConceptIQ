import { AlertTriangle, Brain, ClipboardList, Gauge, Lightbulb, LineChart, RotateCcw, ShieldCheck, Target, Trophy } from "lucide-react";
import type { ReactNode } from "react";
import { CognitiveDomainIcon } from "../components/CognitiveDomainIcon";
import { ProgressBar } from "../components/ProgressBar";
import { RankBadge } from "../components/RankBadge";
import { ScoreLineChart } from "../components/ScoreLineChart";
import type { PageKey, UserProfile } from "../types";
import type { CognitiveHypothesis, CognitiveVariable } from "../types/cognitiveProfile";
import type { DomainScore } from "../types/cognition";
import { sessionsInLast30Days } from "../utils/achievements";
import {
  calculateCognitiveScoreBreakdown,
  getBottomDomainScores,
  getDomainById,
  getGameById,
  getTopDomainScores,
} from "../utils/cognitiveScoring";
import { cognitiveVariableBottlenecks, cognitiveVariableStrengths, getCognitiveVariableDefinition } from "../utils/cognitiveProfile";
import { categoryLabel, formatDuration, formatScore, formatSigned, relativeDate } from "../utils/format";
import { scoreTrend } from "../utils/profileInsights";

interface ProfileProps {
  profile: UserProfile;
  onProfileChange: (profile: UserProfile) => Promise<void> | void;
  onReset: () => Promise<void> | void;
  onNavigate: (page: PageKey) => void;
}

export function Profile({ profile, onReset, onNavigate }: ProfileProps) {
  const breakdown = calculateCognitiveScoreBreakdown(profile);
  const cognitiveProfile = profile.cognitiveProfile;
  const domainScores = breakdown.domainScores;
  const topStrengths = getTopDomainScores(profile, 3);
  const bottlenecks = getBottomDomainScores(profile, 3);
  const variableStrengths = cognitiveVariableStrengths(cognitiveProfile, 3);
  const variableBottlenecks = cognitiveVariableBottlenecks(cognitiveProfile, 3);
  const hypotheses = cognitiveProfile.hypotheses;
  const primaryRecommendation = cognitiveProfile.recommendations[0];
  const recommendedDomain = getDomainById(breakdown.recommendedDomainId);
  const recommendedGame = breakdown.recommendedGameId ? getGameById(breakdown.recommendedGameId) : undefined;
  const monthlySessions = sessionsInLast30Days(profile.sessions);
  const latestSurvey = cognitiveProfile.surveyResponses[0];

  return (
    <div className="space-y-5">
      <section className="surface-gradient p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase text-white/50">Cognitive profile</p>
            <h1 className="mt-1 text-3xl font-black">{profile.displayName || profile.username}</h1>
          </div>
          <RankBadge score={breakdown.overallConceptIQScore} compact />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_0.85fr]">
          <div className="rounded-lg border border-white/10 bg-ink/38 p-5">
            <p className="text-sm font-bold uppercase text-pulse">ConceptIQ Score</p>
            <p className="mt-2 text-6xl font-black">{formatScore(breakdown.overallConceptIQScore)}</p>
            <div className="mt-5">
              <ProgressBar value={breakdown.overallConceptIQScore} max={1000} label="Overall cognitive rating" />
            </div>
          </div>
          <RankBadge score={breakdown.overallConceptIQScore} />
        </div>
      </section>

      <section className="rounded-lg border border-solar/25 bg-solar/10 p-4">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-none text-solar" />
          <div className="text-sm leading-6 text-white/70">
            <p className="font-black text-white">ConceptIQ is not a medical diagnostic tool.</p>
            <p>This profile estimates learning patterns and possible bottlenecks. For medical or learning-disability diagnosis, consult a qualified professional.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <SummaryCard label="Ability" value={formatScore(breakdown.abilityScore)} detail="Playable domains" icon={<Brain className="h-5 w-5" />} />
        <SummaryCard label="Growth" value={formatScore(breakdown.growthScore)} detail="Recent movement" icon={<LineChart className="h-5 w-5" />} tone="mint" />
        <SummaryCard label="Consistency" value={formatScore(breakdown.consistencyScore)} detail={`${monthlySessions} sessions in 30 days`} icon={<ShieldCheck className="h-5 w-5" />} tone="solar" />
      </section>

      <section className="surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase text-white/50">Learning pattern profile</p>
            <h2 className="mt-1 text-2xl font-black">Tracked variables and hypotheses</h2>
            <p className="mt-2 text-sm leading-6 text-white/62">
              {latestSurvey ? `Last survey completed ${relativeDate(latestSurvey.completedAt)}.` : "Complete the intake survey to add self-report evidence."}
            </p>
          </div>
          <button className="btn-secondary" type="button" onClick={() => onNavigate("survey")}>
            <ClipboardList className="h-4 w-4" />
            {latestSurvey ? "Update Survey" : "Start Survey"}
          </button>
        </div>

        {primaryRecommendation ? (
          <div className="mt-5 rounded-lg border border-pulse/20 bg-pulse/10 p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="mt-0.5 h-5 w-5 flex-none text-pulse" />
              <div>
                <p className="text-sm font-bold uppercase text-pulse">Recommended training path</p>
                <h3 className="mt-1 text-xl font-black">{primaryRecommendation.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/64">{primaryRecommendation.detail}</p>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <VariableList title="Profile strengths" icon={<Trophy className="h-5 w-5" />} variables={variableStrengths} fallback="Complete survey and games to reveal strengths." />
        <VariableList title="Possible bottlenecks" icon={<Target className="h-5 w-5" />} variables={variableBottlenecks} fallback="No bottlenecks yet." />
      </section>

      <section className="surface p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase text-white/50">Active hypotheses</p>
            <h2 className="mt-1 text-2xl font-black">Evidence-backed flags</h2>
          </div>
          <span className="pill">{hypotheses.length} active</span>
        </div>
        {hypotheses.length ? (
          <div className="space-y-3">
            {hypotheses.map((hypothesis) => (
              <HypothesisCard key={hypothesis.id} hypothesis={hypothesis} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-white/14 bg-white/5 p-5 text-sm font-bold leading-6 text-white/56">
            Complete the intake survey and a few games to generate possible bottleneck hypotheses.
          </div>
        )}
      </section>

      <section className="surface p-5">
        <div className="mb-4 flex items-center gap-3">
          <span className="rounded-lg bg-white/8 p-2 text-pulse"><Gauge className="h-5 w-5" /></span>
          <h2 className="text-2xl font-black">Tracked variables</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.values(cognitiveProfile.variables).map((variable) => (
            <VariableCard key={variable.key} variable={variable} />
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <DomainList title="Top strengths" icon={<Trophy className="h-5 w-5" />} scores={topStrengths} fallback="Complete a few rounds to reveal strengths." />
        <DomainList title="Bottlenecks" icon={<Target className="h-5 w-5" />} scores={bottlenecks} fallback="No bottlenecks yet." />
      </section>

      <section className="surface p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase text-white/50">Domain score bars</p>
            <h2 className="mt-1 text-2xl font-black">10-domain map</h2>
          </div>
          <span className="pill">{profile.gamesPlayed} games</span>
        </div>
        <div className="space-y-5">
          {domainScores.map((domainScore) => {
            const domain = getDomainById(domainScore.domainId);

            return (
              <div key={domainScore.domainId}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`rounded-lg p-2 ${domain.colorClass}`}>
                      <CognitiveDomainIcon iconName={domain.iconName} className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-black">{domainScore.domainName}</p>
                      <p className="text-xs font-bold text-white/46">
                        {domainScore.unlocked ? `${domainScore.attempts} attempts` : "Coming Soon"}
                      </p>
                    </div>
                  </div>
                  <span className="font-black">{Math.round(domainScore.score)}</span>
                </div>
                <ProgressBar value={domainScore.score} max={1000} />
              </div>
            );
          })}
        </div>
      </section>

      <section className="surface p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase text-white/50">Recommended domain</p>
            <h2 className="mt-1 text-2xl font-black">{recommendedDomain.name}</h2>
          </div>
          <span className={`rounded-lg p-3 ${recommendedDomain.colorClass}`}>
            <CognitiveDomainIcon iconName={recommendedDomain.iconName} />
          </span>
        </div>
        <p className="text-sm leading-6 text-white/64">
          {recommendedGame ? `Train ${recommendedGame.name}: ${recommendedGame.description}` : recommendedDomain.description}
        </p>
      </section>

      <ScoreLineChart points={scoreTrend(profile)} />

      <section className="surface p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-black">Training history</h2>
          <span className="pill">{profile.attempts.length} attempts</span>
        </div>
        {profile.attempts.length ? (
          <div className="space-y-3">
            {profile.attempts.slice(0, 8).map((attempt) => (
              <div key={attempt.id} className="rounded-lg border border-white/10 bg-white/7 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-white/50">{relativeDate(attempt.attemptedAt)}</p>
                    <p className="mt-1 text-lg font-black">{categoryLabel(attempt.gameType)}</p>
                  </div>
                  <span className="pill">{formatSigned(attempt.scoreChange)}</span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <MiniMetric label="Score" value={`${attempt.normalizedScore}`} />
                  <MiniMetric label="Mistakes" value={`${attempt.mistakes}`} />
                  <MiniMetric label="Time" value={formatDuration(attempt.durationMs)} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-white/14 bg-white/5 p-6 text-center text-white/58">
            Complete a game to start your history.
          </div>
        )}
        <button className="btn-secondary mt-5 w-full border-bloom/30 text-bloom hover:bg-bloom/10" type="button" onClick={onReset}>
          <RotateCcw className="h-4 w-4" />
          Reset Progress
        </button>
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  icon,
  tone = "cyan",
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  tone?: "cyan" | "mint" | "solar";
}) {
  const toneClass = tone === "mint" ? "bg-mint/15 text-mint" : tone === "solar" ? "bg-solar/15 text-solar" : "bg-pulse/15 text-pulse";

  return (
    <div className="surface-soft p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-white/50">{label}</p>
          <p className="mt-2 text-3xl font-black">{value}</p>
        </div>
        <span className={`rounded-lg p-2.5 ${toneClass}`}>{icon}</span>
      </div>
      <p className="mt-3 text-sm text-white/56">{detail}</p>
    </div>
  );
}

function VariableList({ title, icon, variables, fallback }: { title: string; icon: ReactNode; variables: CognitiveVariable[]; fallback: string }) {
  return (
    <div className="surface p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="rounded-lg bg-white/8 p-2 text-pulse">{icon}</span>
        <h2 className="text-2xl font-black">{title}</h2>
      </div>
      {variables.length ? (
        <div className="space-y-3">
          {variables.map((variable) => (
            <div key={variable.key} className="rounded-lg bg-white/7 p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="font-black">{variable.label}</span>
                <span className="font-black">{formatVariableValue(variable)}</span>
              </div>
              <ProgressBar value={typeof variable.value === "number" ? variable.value : 0} max={100} />
              <p className="mt-2 text-xs font-bold text-white/44">{Math.round(variable.confidence)}% confidence</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-white/14 bg-white/5 p-4 text-sm font-bold leading-6 text-white/56">
          {fallback}
        </div>
      )}
    </div>
  );
}

function HypothesisCard({ hypothesis }: { hypothesis: CognitiveHypothesis }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/7 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-black">{hypothesis.name}</h3>
          <p className="mt-1 text-sm font-bold text-white/50">{hypothesis.confidence}% confidence</p>
        </div>
        <span className="rounded-full bg-pulse/14 px-3 py-1 text-sm font-black text-pulse">Possible indicator</span>
      </div>
      <div className="mt-3">
        <ProgressBar value={hypothesis.confidence} max={100} />
      </div>
      <div className="mt-4 rounded-lg bg-ink/36 p-3">
        <p className="text-sm font-bold uppercase text-white/46">Evidence</p>
        {hypothesis.supportingEvidence.length ? (
          <ul className="mt-2 space-y-2 text-sm leading-6 text-white/64">
            {hypothesis.supportingEvidence.map((evidence) => (
              <li key={evidence}>{evidence}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm leading-6 text-white/58">More survey or game data needed.</p>
        )}
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <MiniMetric label="Next assessment" value={hypothesis.recommendedNextAssessment} />
        <MiniMetric label="Training activity" value={hypothesis.recommendedTrainingActivity} />
      </div>
    </div>
  );
}

function VariableCard({ variable }: { variable: CognitiveVariable }) {
  const definition = getCognitiveVariableDefinition(variable.key);
  const latestEvidence = variable.evidenceSources[0];
  const numericValue = typeof variable.value === "number" ? variable.value : null;

  return (
    <div className="rounded-lg border border-white/10 bg-white/7 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-black">{variable.label}</p>
          <p className="mt-1 text-xs font-bold uppercase text-white/42">{definition.kind === "concern" ? "Concern signal" : definition.kind}</p>
        </div>
        <span className="font-black">{formatVariableValue(variable)}</span>
      </div>
      {numericValue !== null ? (
        <div className="mt-3">
          <ProgressBar value={numericValue} max={100} />
        </div>
      ) : null}
      <div className="mt-3 flex items-center justify-between gap-3 text-xs font-bold text-white/44">
        <span>{Math.round(variable.confidence)}% confidence</span>
        <span>{relativeDate(variable.lastUpdated)}</span>
      </div>
      {latestEvidence ? (
        <p className="mt-3 text-sm leading-6 text-white/58">{latestEvidence.detail}</p>
      ) : (
        <p className="mt-3 text-sm leading-6 text-white/42">No evidence yet.</p>
      )}
    </div>
  );
}

function DomainList({ title, icon, scores, fallback }: { title: string; icon: ReactNode; scores: DomainScore[]; fallback: string }) {
  return (
    <div className="surface p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="rounded-lg bg-white/8 p-2 text-pulse">{icon}</span>
        <h2 className="text-2xl font-black">{title}</h2>
      </div>
      {scores.length ? (
        <div className="space-y-3">
          {scores.map((score) => (
            <div key={score.domainId} className="rounded-lg bg-white/7 p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="font-black">{score.domainName}</span>
                <span className="font-black">{score.score}</span>
              </div>
              <ProgressBar value={score.score} max={1000} />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-white/14 bg-white/5 p-4 text-sm font-bold leading-6 text-white/56">
          {fallback}
        </div>
      )}
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-ink/35 p-3">
      <p className="text-xs font-bold text-white/44">{label}</p>
      <p className="mt-1 font-black">{value}</p>
    </div>
  );
}

function formatVariableValue(variable: CognitiveVariable) {
  if (typeof variable.value === "number") {
    return `${Math.round(variable.value)}`;
  }

  if (typeof variable.value === "boolean") {
    return variable.value ? "Flagged" : "Clear";
  }

  return variable.value.length ? variable.value.join(", ") : "None";
}
