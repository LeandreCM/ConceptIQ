import type { ReactNode } from "react";
import { Clock, Gauge, Info, PlayCircle } from "lucide-react";
import type { GameDifficulty } from "../types/cognition";

interface GameCardProps {
  title: string;
  description: string;
  difficulty: GameDifficulty;
  estimatedTime: string;
  cognitiveVariables: string[];
  onPlay: () => void;
  onDetails: () => void;
  icon?: ReactNode;
  playRoute?: string;
  stat?: string;
  badge?: string;
  active?: boolean;
  locked?: boolean;
}

export function GameCard({
  title,
  description,
  difficulty,
  estimatedTime,
  cognitiveVariables,
  onPlay,
  onDetails,
  icon,
  playRoute,
  stat,
  badge = "Playable",
  active = false,
  locked = false,
}: GameCardProps) {
  return (
    <article
      className={`surface-soft flex h-full min-h-64 w-full flex-col justify-between p-5 text-left transition duration-200 hover:border-pulse/50 hover:bg-white/10 ${
        active ? "border-pulse/60 bg-pulse/10" : ""
      } ${
        locked ? "opacity-45 grayscale hover:border-white/10 hover:bg-white/7" : ""
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          {icon ? <div className="rounded-lg bg-white/8 p-3 text-pulse">{icon}</div> : null}
          <span className={`rounded-full px-3 py-1 text-xs font-black ${locked ? "bg-white/8 text-white/50" : "bg-mint/15 text-mint"}`}>
            {locked ? "Locked" : badge}
          </span>
        </div>
        <h3 className="mt-5 text-xl font-black text-white">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-white/62">{description}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <MiniMeta icon={<Gauge className="h-4 w-4" />} label="Difficulty" value={difficulty} />
          <MiniMeta icon={<Clock className="h-4 w-4" />} label="Time" value={estimatedTime} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {cognitiveVariables.slice(0, 3).map((variable) => (
            <span key={variable} className="rounded-full bg-white/8 px-2.5 py-1 text-xs font-bold text-white/58">
              {formatVariable(variable)}
            </span>
          ))}
        </div>
        {stat ? <p className={`mt-4 text-xs font-bold uppercase ${locked ? "text-white/50" : "text-mint"}`}>{stat}</p> : null}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <button
          type="button"
          className="btn-primary min-h-12"
          onClick={onPlay}
          disabled={locked}
          aria-label={`Play ${title}`}
          data-route={playRoute}
        >
          <PlayCircle className="h-4 w-4" />
          PLAY
        </button>
        <button
          type="button"
          className="btn-secondary min-h-12"
          onClick={onDetails}
          disabled={locked}
          aria-label={`View ${title} details`}
        >
          <Info className="h-4 w-4" />
          DETAILS
        </button>
      </div>
    </article>
  );
}

function MiniMeta({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-ink/32 p-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase text-white/42">
        {icon}
        {label}
      </div>
      <p className="mt-1 font-black text-white">{value}</p>
    </div>
  );
}

function formatVariable(variable: string) {
  return variable.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
