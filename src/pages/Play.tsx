import { useState } from "react";
import type { ReactNode } from "react";
import { Brain, Calculator, Cuboid, Gauge, Lock, Puzzle, Route, Scale } from "lucide-react";
import { GameCard } from "../components/GameCard";
import { PatternReasoningGame } from "../games/PatternReasoningGame";
import { ReactionTimeGame } from "../games/ReactionTimeGame";
import { WorkingMemoryGame } from "../games/WorkingMemoryGame";
import type { GameResult, GameType, UserProfile } from "../types";
import { formatMs } from "../utils/format";

const PREFERRED_GAME_KEY = "conceptiq-preferred-game";
const gameTypes: GameType[] = ["reaction", "memory", "pattern"];

interface PlayProps {
  profile: UserProfile;
  onComplete: (result: GameResult) => void;
}

type TrainingCategory = {
  id: GameType | "math" | "logic" | "spatial";
  title: string;
  description: string;
  stat: string;
  icon: ReactNode;
  locked?: boolean;
};

export function Play({ profile, onComplete }: PlayProps) {
  const [selectedGame, setSelectedGame] = useState<GameType>(() => {
    const stored = sessionStorage.getItem(PREFERRED_GAME_KEY) as GameType | null;
    return stored && gameTypes.includes(stored) ? stored : "reaction";
  });

  const categories: TrainingCategory[] = [
    {
      id: "reaction",
      title: "Reaction",
      description: "Respond to the signal without jumping early.",
      stat: `Best ${formatMs(profile.bestReactionTime)}`,
      icon: <Gauge className="h-7 w-7" />,
    },
    {
      id: "memory",
      title: "Memory",
      description: "Hold and rebuild short symbol sequences.",
      stat: `Best ${profile.bestMemoryScore}/1000`,
      icon: <Brain className="h-7 w-7" />,
    },
    {
      id: "pattern",
      title: "Pattern",
      description: "Solve symbolic and numeric pattern sets.",
      stat: `Best ${profile.bestPatternScore}/1000`,
      icon: <Puzzle className="h-7 w-7" />,
    },
    {
      id: "math",
      title: "Math",
      description: "Mental arithmetic drills are coming soon.",
      stat: "Locked",
      icon: <Calculator className="h-7 w-7" />,
      locked: true,
    },
    {
      id: "logic",
      title: "Logic",
      description: "Deduction and rule switching will unlock later.",
      stat: "Locked",
      icon: <Scale className="h-7 w-7" />,
      locked: true,
    },
    {
      id: "spatial",
      title: "Spatial",
      description: "Rotation and visual mapping rounds are planned.",
      stat: "Locked",
      icon: <Cuboid className="h-7 w-7" />,
      locked: true,
    },
  ];

  function chooseCategory(category: TrainingCategory) {
    if (category.locked || !gameTypes.includes(category.id as GameType)) {
      return;
    }

    setSelectedGame(category.id as GameType);
  }

  return (
    <div className="space-y-5">
      <section className="surface-gradient p-5">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-pulse/15 p-3 text-pulse">
            <Route className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold uppercase text-white/50">Train</p>
            <h1 className="mt-1 text-3xl font-black">Choose today's focus</h1>
            <p className="mt-2 text-sm leading-6 text-white/64">Pick a short round. Your result updates score, profile, achievements, and leaderboard position.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {categories.map((category) => (
          <GameCard
            key={category.id}
            title={category.title}
            description={category.description}
            stat={category.stat}
            icon={category.locked ? <Lock className="h-7 w-7" /> : category.icon}
            active={category.id === selectedGame}
            locked={category.locked}
            onClick={() => chooseCategory(category)}
          />
        ))}
      </section>

      <section>
        {selectedGame === "reaction" ? <ReactionTimeGame profile={profile} onComplete={onComplete} /> : null}
        {selectedGame === "memory" ? <WorkingMemoryGame profile={profile} onComplete={onComplete} /> : null}
        {selectedGame === "pattern" ? <PatternReasoningGame onComplete={onComplete} /> : null}
      </section>
    </div>
  );
}
