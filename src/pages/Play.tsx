import { useState } from "react";
import { Brain, Gauge, Puzzle } from "lucide-react";
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

export function Play({ profile, onComplete }: PlayProps) {
  const [selectedGame, setSelectedGame] = useState<GameType>(() => {
    const stored = sessionStorage.getItem(PREFERRED_GAME_KEY) as GameType | null;
    return stored && gameTypes.includes(stored) ? stored : "reaction";
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase text-pulse">Play Lab</p>
          <h1 className="mt-2 text-4xl font-black">Choose your challenge</h1>
          <p className="mt-3 max-w-2xl text-white/64">
            Each completed game updates your local ConceptIQ profile, achievements, and leaderboard entry.
          </p>
        </div>
        <div className="pill">No backend yet - saved in this browser</div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <GameCard
          title="Reaction Time"
          description="A signal appears after a random delay. Click only when it changes."
          stat={`Best ${formatMs(profile.bestReactionTime)}`}
          icon={<Gauge className="h-7 w-7" />}
          active={selectedGame === "reaction"}
          onClick={() => setSelectedGame("reaction")}
        />
        <GameCard
          title="Working Memory"
          description="Hold a sequence in mind, then enter it after it disappears."
          stat={`Best ${profile.bestMemoryScore}/1000`}
          icon={<Brain className="h-7 w-7" />}
          active={selectedGame === "memory"}
          onClick={() => setSelectedGame("memory")}
        />
        <GameCard
          title="Pattern Reasoning"
          description="Solve a full set of symbolic and numeric pattern questions."
          stat={`Best ${profile.bestPatternScore}/1000`}
          icon={<Puzzle className="h-7 w-7" />}
          active={selectedGame === "pattern"}
          onClick={() => setSelectedGame("pattern")}
        />
      </div>

      {selectedGame === "reaction" ? <ReactionTimeGame profile={profile} onComplete={onComplete} /> : null}
      {selectedGame === "memory" ? <WorkingMemoryGame profile={profile} onComplete={onComplete} /> : null}
      {selectedGame === "pattern" ? <PatternReasoningGame onComplete={onComplete} /> : null}
    </div>
  );
}
