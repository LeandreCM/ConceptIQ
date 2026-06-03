import { ChevronDown, ChevronRight } from "lucide-react";
import { CognitiveDomainIcon } from "./CognitiveDomainIcon";
import { GameCard } from "./GameCard";
import { ProgressBar } from "./ProgressBar";
import type { CognitiveDomain, CognitiveGame } from "../types/cognition";

interface DomainSectionProps {
  domain: CognitiveDomain;
  progress: number;
  score: number;
  gameCount: number;
  expanded: boolean;
  onToggle: () => void;
  onPlay: (game: CognitiveGame) => void;
  onDetails: (game: CognitiveGame) => void;
}

export function DomainSection({
  domain,
  progress,
  score,
  gameCount,
  expanded,
  onToggle,
  onPlay,
  onDetails,
}: DomainSectionProps) {
  const ToggleIcon = expanded ? ChevronDown : ChevronRight;

  return (
    <section className="surface overflow-hidden p-0">
      <button
        type="button"
        className="w-full p-5 text-left transition hover:bg-white/5"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <div className="flex items-start gap-4">
          <div className={`rounded-lg p-3 ${domain.colorClass}`}>
            <CognitiveDomainIcon iconName={domain.iconName} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black">{domain.name}</h2>
                <p className="mt-2 text-sm leading-6 text-white/62">{domain.description}</p>
              </div>
              <ToggleIcon className="mt-1 h-5 w-5 flex-none text-white/46" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <MiniStat label="Progress" value={`${progress}%`} />
              <MiniStat label="Games" value={String(gameCount)} />
            </div>
            <div className="mt-4">
              <ProgressBar value={progress} max={100} label={`${domain.name} progress`} />
            </div>
            <p className="mt-2 text-xs font-bold uppercase text-white/42">Score {score}/1000</p>
          </div>
        </div>
      </button>

      {expanded ? (
        <div className="border-t border-white/10 p-5 pt-4">
          <div className="mb-4 flex flex-wrap gap-2">
            {domain.primaryMetrics.map((metric) => (
              <span key={metric} className="pill">{metric}</span>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {domain.games.map((game) => (
              <GameCard
                key={game.id}
                title={game.name}
                description={game.description}
                difficulty={game.difficulty}
                estimatedTime={game.estimatedTime}
                cognitiveVariables={game.cognitiveVariables}
                icon={<CognitiveDomainIcon iconName={domain.iconName} />}
                playRoute={game.playRoute}
                onPlay={() => onPlay(game)}
                onDetails={() => onDetails(game)}
                stat={game.primarySkill}
                badge="Ready"
                locked={!game.implemented || game.locked}
              />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/7 p-3">
      <p className="text-xs font-bold uppercase text-white/42">{label}</p>
      <p className="mt-1 text-xl font-black">{value}</p>
    </div>
  );
}
