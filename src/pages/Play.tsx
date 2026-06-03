import { useMemo, useState } from "react";
import { Route, Sparkles } from "lucide-react";
import { DomainSection } from "../components/DomainSection";
import { GameDetailsModal } from "../components/GameDetailsModal";
import { cognitiveDomains } from "../data/cognitiveDomains";
import type { GameType, UserProfile } from "../types";
import type { CognitiveDomain, CognitiveDomainId, CognitiveGame } from "../types/cognition";
import {
  calculateCognitiveScoreBreakdown,
  getDomainForGameType,
  getGameById,
  getGameForGameType,
} from "../utils/cognitiveScoring";
import { gamePlayRoute } from "../utils/gameRoutes";

const PREFERRED_GAME_KEY = "conceptiq-preferred-game";
const PREFERRED_COGNITIVE_GAME_KEY = "conceptiq-preferred-cognitive-game";
const gameTypes: GameType[] = ["reaction", "memory", "pattern"];

interface PlayProps {
  profile: UserProfile;
  onNavigateRoute: (route: string) => void;
}

interface SelectedGame {
  domain: CognitiveDomain;
  game: CognitiveGame;
}

export function Play({ profile, onNavigateRoute }: PlayProps) {
  const breakdown = useMemo(() => calculateCognitiveScoreBreakdown(profile), [profile]);
  const preferredDomainId = preferredDomainFromSession(breakdown.recommendedDomainId);
  const [expandedDomainIds, setExpandedDomainIds] = useState<Set<CognitiveDomainId>>(
    () => new Set([preferredDomainId]),
  );
  const [selectedGame, setSelectedGame] = useState<SelectedGame | null>(null);

  function toggleDomain(domainId: CognitiveDomainId) {
    setExpandedDomainIds((current) => {
      const next = new Set(current);

      if (next.has(domainId)) {
        next.delete(domainId);
      } else {
        next.add(domainId);
      }

      return next;
    });
  }

  function rememberGamePreference(game: CognitiveGame) {
    if (game.playableGameType) {
      sessionStorage.setItem(PREFERRED_GAME_KEY, game.playableGameType);
    }

    sessionStorage.setItem(PREFERRED_COGNITIVE_GAME_KEY, game.id);
  }

  function playGame(domain: CognitiveDomain, game: CognitiveGame) {
    rememberGamePreference(game);
    setSelectedGame(null);
    setExpandedDomainIds((current) => new Set([...current, domain.id]));
    onNavigateRoute(game.playRoute || gamePlayRoute(game.id));
  }

  function showDetails(domain: CognitiveDomain, game: CognitiveGame) {
    setSelectedGame({ domain, game });
  }

  return (
    <div className="space-y-4">
      <section className="surface-gradient p-5">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-pulse/15 p-3 text-pulse">
            <Route className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold uppercase text-white/50">Train</p>
            <h1 className="mt-1 text-3xl font-black">Cognitive Architecture</h1>
            <p className="mt-2 text-sm leading-6 text-white/64">
              Choose a domain, view its games, and press PLAY to start immediately. DETAILS opens a quick modal without leaving Train.
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="pill">{cognitiveDomains.length} domains</span>
          <span className="pill">{cognitiveDomains.reduce((total, domain) => total + domain.games.length, 0)} games</span>
          <span className="pill">No streak pressure</span>
        </div>
      </section>

      <section className="surface-soft p-4">
        <div className="flex items-start gap-3">
          <span className="rounded-lg bg-mint/15 p-2 text-mint">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold uppercase text-white/50">Recommended first</p>
            <p className="mt-1 text-lg font-black">{recommendedLabel(breakdown.recommendedDomainId, breakdown.recommendedGameId)}</p>
          </div>
        </div>
      </section>

      <div className="space-y-3">
        {cognitiveDomains.map((domain) => {
          const score = breakdown.domainScores.find((domainScore) => domainScore.domainId === domain.id);
          const progress = Math.round(((score?.score ?? 0) / 1000) * 100);

          return (
            <DomainSection
              key={domain.id}
              domain={domain}
              progress={progress}
              score={score?.score ?? 0}
              gameCount={domain.games.length}
              expanded={expandedDomainIds.has(domain.id)}
              onToggle={() => toggleDomain(domain.id)}
              onPlay={(game) => playGame(domain, game)}
              onDetails={(game) => showDetails(domain, game)}
            />
          );
        })}
      </div>

      <GameDetailsModal
        game={selectedGame?.game ?? null}
        domain={selectedGame?.domain ?? null}
        visible={Boolean(selectedGame)}
        onClose={() => setSelectedGame(null)}
        onPlay={(game) => {
          if (selectedGame) {
            playGame(selectedGame.domain, game);
          }
        }}
      />
    </div>
  );
}

function preferredDomainFromSession(fallback: CognitiveDomainId) {
  const preferredGame = sessionStorage.getItem(PREFERRED_GAME_KEY) as GameType | null;
  const preferredCognitiveGameId = sessionStorage.getItem(PREFERRED_COGNITIVE_GAME_KEY);
  const preferredCognitiveGame = preferredCognitiveGameId ? getGameById(preferredCognitiveGameId) : null;

  if (preferredCognitiveGame) {
    const domain = cognitiveDomains.find((candidate) => candidate.games.some((game) => game.id === preferredCognitiveGame.id));

    if (domain) {
      return domain.id;
    }
  }

  if (preferredGame && gameTypes.includes(preferredGame)) {
    return getDomainForGameType(preferredGame).id;
  }

  return fallback;
}

function recommendedLabel(domainId: CognitiveDomainId, gameId?: string) {
  const domain = cognitiveDomains.find((candidate) => candidate.id === domainId);
  const game = gameId ? getGameById(gameId) : getGameForGameType("reaction");

  if (domain && game) {
    return `${domain.name}: ${game.name}`;
  }

  return domain?.name ?? "Start with Attention";
}
