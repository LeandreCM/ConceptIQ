import { Bug, Database, ListTree, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { cognitiveDomains } from "../data/cognitiveDomains";
import type { UserProfile } from "../types";
import { calculateCognitiveScoreBreakdown } from "../utils/cognitiveScoring";
import { categoryLabel, formatDuration, relativeDate } from "../utils/format";

interface DebugProps {
  profile: UserProfile;
}

export function Debug({ profile }: DebugProps) {
  const breakdown = calculateCognitiveScoreBreakdown(profile);

  return (
    <div className="space-y-5">
      <section className="surface-gradient p-5">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-bloom/15 p-3 text-bloom">
            <Bug className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold uppercase text-white/50">Developer</p>
            <h1 className="mt-1 text-3xl font-black">ConceptIQ debug</h1>
            <p className="mt-2 text-sm leading-6 text-white/64">Hidden diagnostics for the cognitive domain system.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <DebugStat label="Domains" value={String(cognitiveDomains.length)} />
        <DebugStat label="Attempts" value={String(profile.attempts.length)} />
        <DebugStat label="ConceptIQ" value={String(breakdown.overallConceptIQScore)} />
      </section>

      <DebugPanel title="Loaded domains" icon={<ListTree className="h-5 w-5" />}>
        <div className="grid gap-3">
          {cognitiveDomains.map((domain) => (
            <div key={domain.id} className="rounded-lg bg-white/7 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-black">{domain.name}</p>
                <span className="pill">{domain.unlocked ? "Unlocked" : "Locked"}</span>
              </div>
              <p className="mt-1 text-xs font-bold text-white/48">{domain.games.length} games | {domain.subdomains.length} subdomains</p>
            </div>
          ))}
        </div>
      </DebugPanel>

      <DebugPanel title="Calculated domain scores" icon={<Database className="h-5 w-5" />}>
        <pre className="max-h-80 overflow-auto rounded-lg bg-ink/60 p-4 text-xs leading-5 text-white/72">
          {JSON.stringify(breakdown, null, 2)}
        </pre>
      </DebugPanel>

      <DebugPanel title="Current user profile" icon={<UserRound className="h-5 w-5" />}>
        <pre className="max-h-80 overflow-auto rounded-lg bg-ink/60 p-4 text-xs leading-5 text-white/72">
          {JSON.stringify(profile, null, 2)}
        </pre>
      </DebugPanel>

      <DebugPanel title="Recent attempts" icon={<Database className="h-5 w-5" />}>
        {profile.attempts.length ? (
          <div className="space-y-3">
            {profile.attempts.slice(0, 10).map((attempt) => (
              <div key={attempt.id} className="rounded-lg border border-white/10 bg-white/7 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black">{categoryLabel(attempt.gameType)}</p>
                    <p className="text-xs font-bold text-white/46">{relativeDate(attempt.attemptedAt)}</p>
                  </div>
                  <span className="pill">{attempt.normalizedScore}/1000</span>
                </div>
                <p className="mt-2 text-sm text-white/58">
                  Raw {attempt.rawScore} | {attempt.mistakes} mistakes | {formatDuration(attempt.durationMs)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-white/14 bg-white/5 p-4 text-center text-white/58">
            No attempts saved yet.
          </div>
        )}
      </DebugPanel>
    </div>
  );
}

function DebugStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-soft p-4">
      <p className="text-sm font-bold text-white/50">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}

function DebugPanel({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="surface p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="rounded-lg bg-white/8 p-2 text-pulse">{icon}</span>
        <h2 className="text-2xl font-black">{title}</h2>
      </div>
      {children}
    </section>
  );
}
