import { ArrowLeft } from "lucide-react";
import { CognitiveDomainIcon } from "../components/CognitiveDomainIcon";
import { MiniCognitiveGame } from "../games/MiniCognitiveGame";
import { PatternReasoningGame } from "../games/PatternReasoningGame";
import { ReactionTimeGame } from "../games/ReactionTimeGame";
import { WorkingMemoryGame } from "../games/WorkingMemoryGame";
import type { GameResult, UserProfile } from "../types";
import type { CognitiveDomain, CognitiveGame } from "../types/cognition";
import { getFirstPlayableGame, getGameById } from "../utils/cognitiveScoring";
import { cognitiveDomains } from "../data/cognitiveDomains";

interface GameRouteScreenProps {
  gameId: string;
  profile: UserProfile;
  onComplete: (result: GameResult) => void;
  onBackToTrain: () => void;
}

export function GameRouteScreen({ gameId, profile, onComplete, onBackToTrain }: GameRouteScreenProps) {
  const target = resolveGameRouteTarget(gameId);

  if (!target) {
    return (
      <div className="space-y-5">
        <section className="surface-gradient p-5">
          <p className="text-sm font-bold uppercase text-white/50">Game not found</p>
          <h1 className="mt-1 text-3xl font-black">This training route is unavailable</h1>
          <p className="mt-2 text-sm leading-6 text-white/64">Return to Train and pick an available game.</p>
          <button className="btn-primary mt-5" type="button" onClick={onBackToTrain}>
            <ArrowLeft className="h-4 w-4" />
            Back to Train
          </button>
        </section>
      </div>
    );
  }

  const { domain, game } = target;

  return (
    <div className="space-y-5">
      <section className="surface-gradient p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <div className={`rounded-lg p-3 ${domain.colorClass}`}>
              <CognitiveDomainIcon iconName={domain.iconName} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold uppercase text-white/50">Now training</p>
              <h1 className="mt-1 text-3xl font-black">{game.name}</h1>
              <p className="mt-2 text-sm leading-6 text-white/64">{game.description}</p>
            </div>
          </div>
        </div>
        <div className="mt-5">
          <button className="btn-secondary" type="button" onClick={onBackToTrain}>
            <ArrowLeft className="h-4 w-4" />
            Train
          </button>
        </div>
      </section>

      <GameRunner domain={domain} game={game} profile={profile} onComplete={onComplete} />
    </div>
  );
}

export function GameRunner({
  domain,
  game,
  profile,
  onComplete,
}: {
  domain: CognitiveDomain;
  game: CognitiveGame;
  profile: UserProfile;
  onComplete: (result: GameResult) => void;
}) {
  if (game.playableGameType === "reaction") {
    return <ReactionTimeGame profile={profile} domain={domain} game={game} onComplete={onComplete} />;
  }

  if (game.playableGameType === "memory") {
    return <WorkingMemoryGame profile={profile} domain={domain} game={game} onComplete={onComplete} />;
  }

  if (game.playableGameType === "pattern") {
    return <PatternReasoningGame domain={domain} game={game} onComplete={onComplete} />;
  }

  return <MiniCognitiveGame domain={domain} game={game} onComplete={onComplete} />;
}

export function resolveGameRouteTarget(gameId: string) {
  const directGame = getGameById(gameId);

  if (directGame) {
    const domain = cognitiveDomains.find((candidate) => candidate.games.some((game) => game.id === directGame.id));

    if (domain) {
      return { domain, game: directGame };
    }
  }

  const domain = cognitiveDomains.find((candidate) => candidate.id === gameId);
  const firstGame = domain ? getFirstPlayableGame(domain.id) : undefined;

  if (domain && firstGame) {
    return { domain, game: firstGame };
  }

  return null;
}
