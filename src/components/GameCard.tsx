import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

interface GameCardProps {
  title: string;
  description: string;
  stat: string;
  icon: ReactNode;
  active?: boolean;
  locked?: boolean;
  onClick: () => void;
}

export function GameCard({ title, description, stat, icon, active = false, locked = false, onClick }: GameCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={locked}
      className={`surface-soft flex h-full min-h-44 w-full flex-col justify-between p-5 text-left transition duration-200 hover:border-pulse/50 hover:bg-white/10 active:scale-[0.99] ${
        active ? "border-pulse/60 bg-pulse/10" : ""
      } ${
        locked ? "cursor-not-allowed opacity-45 grayscale hover:border-white/10 hover:bg-white/7" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-lg bg-white/8 p-3 text-pulse">{icon}</div>
        <ChevronRight className={`h-5 w-5 ${locked ? "text-white/24" : "text-white/42"}`} />
      </div>
      <div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-white/62">{description}</p>
        <p className={`mt-4 text-xs font-bold uppercase ${locked ? "text-white/50" : "text-mint"}`}>{stat}</p>
      </div>
    </button>
  );
}
