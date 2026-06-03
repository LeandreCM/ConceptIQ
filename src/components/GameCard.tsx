import type { ReactNode } from "react";
import { Info, PlayCircle } from "lucide-react";

interface GameCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  playRoute: string;
  detailsRoute: string;
  onPlay: () => void;
  onDetails: () => void;
  stat?: string;
  badge?: string;
  active?: boolean;
  locked?: boolean;
}

export function GameCard({
  title,
  description,
  icon,
  playRoute,
  detailsRoute,
  onPlay,
  onDetails,
  stat,
  badge = "Playable",
  active = false,
  locked = false,
}: GameCardProps) {
  return (
    <div
      className={`surface-soft flex h-full min-h-60 w-full flex-col justify-between p-5 text-left transition duration-200 hover:border-pulse/50 hover:bg-white/10 ${
        active ? "border-pulse/60 bg-pulse/10" : ""
      } ${
        locked ? "opacity-45 grayscale hover:border-white/10 hover:bg-white/7" : ""
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="rounded-lg bg-white/8 p-3 text-pulse">{icon}</div>
          <span className={`rounded-full px-3 py-1 text-xs font-black ${locked ? "bg-white/8 text-white/50" : "bg-mint/15 text-mint"}`}>
            {locked ? "Locked" : badge}
          </span>
        </div>
        <h3 className="mt-5 text-xl font-black text-white">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-white/62">{description}</p>
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
          Play
        </button>
        <button
          type="button"
          className="btn-secondary min-h-12"
          onClick={onDetails}
          disabled={locked}
          aria-label={`View ${title} details`}
          data-route={detailsRoute}
        >
          <Info className="h-4 w-4" />
          Details
        </button>
      </div>
    </div>
  );
}
