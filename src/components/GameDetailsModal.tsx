import { Clock, Gauge, Target, X } from "lucide-react";
import type { ReactNode } from "react";
import type { CognitiveDomain, CognitiveGame } from "../types/cognition";

interface GameDetailsModalProps {
  game: CognitiveGame | null;
  domain: CognitiveDomain | null;
  visible: boolean;
  onClose: () => void;
  onPlay: (game: CognitiveGame) => void;
}

export function GameDetailsModal({ game, domain, visible, onClose, onPlay }: GameDetailsModalProps) {
  if (!visible || !game || !domain) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/78 px-4 pb-4 pt-16 backdrop-blur-sm sm:items-center sm:py-6" onClick={onClose}>
      <section
        className="max-h-[86vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/14 bg-[#121827] p-5 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-details-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase text-white/50">{domain.name}</p>
            <h2 id="game-details-title" className="mt-1 text-3xl font-black">{game.name}</h2>
            <p className="mt-3 text-sm leading-6 text-white/66">{game.fullDescription}</p>
          </div>
          <button className="btn-icon flex-none" type="button" onClick={onClose} aria-label="Close game details">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <ModalStat icon={<Gauge className="h-4 w-4" />} label="Difficulty" value={game.difficulty} />
          <ModalStat icon={<Clock className="h-4 w-4" />} label="Estimated time" value={game.estimatedTime} />
        </div>

        <DetailGroup title="Instructions" items={game.instructions} numbered />
        <DetailGroup title="Cognitive variables trained" items={game.cognitiveVariables.map(formatVariable)} />

        <div className="mt-4 rounded-lg border border-pulse/20 bg-pulse/10 p-4">
          <p className="flex items-center gap-2 text-sm font-bold uppercase text-pulse">
            <Target className="h-4 w-4" />
            Example challenge
          </p>
          <p className="mt-2 text-sm leading-6 text-white/74">{game.exampleTask}</p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <MiniBlock title="Recommended level" value={game.recommendedSkillLevel} />
          <MiniBlock title="Primary skill" value={game.primarySkill} />
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-[1fr_auto]">
          <button className="btn-secondary min-h-12" type="button" onClick={onClose}>
            Close
          </button>
          <button className="btn-primary min-h-12" type="button" onClick={() => onPlay(game)}>
            PLAY
          </button>
        </div>
      </section>
    </div>
  );
}

function ModalStat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/7 p-4">
      <p className="flex items-center gap-2 text-xs font-bold uppercase text-white/42">
        {icon}
        {label}
      </p>
      <p className="mt-1 font-black">{value}</p>
    </div>
  );
}

function DetailGroup({ title, items, numbered = false }: { title: string; items: string[]; numbered?: boolean }) {
  return (
    <div className="mt-4 rounded-lg border border-white/10 bg-white/7 p-4">
      <p className="text-sm font-bold uppercase text-white/48">{title}</p>
      <div className="mt-3 space-y-2 text-sm leading-6 text-white/68">
        {items.map((item, index) => (
          <p key={item}>
            {numbered ? <span className="mr-2 font-black text-pulse">{index + 1}.</span> : null}
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function MiniBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/7 p-4">
      <p className="text-xs font-bold uppercase text-white/42">{title}</p>
      <p className="mt-1 text-sm font-bold leading-6 text-white/70">{value}</p>
    </div>
  );
}

function formatVariable(variable: string) {
  return variable.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
