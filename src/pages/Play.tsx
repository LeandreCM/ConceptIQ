import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Lock, PlayCircle, Route } from "lucide-react";
import { CognitiveDomainIcon } from "../components/CognitiveDomainIcon";
import { GameCard } from "../components/GameCard";
import { ProgressBar } from "../components/ProgressBar";
import { cognitiveDomains } from "../data/cognitiveDomains";
import type { GameType, UserProfile } from "../types";
import type { CognitiveDomain, CognitiveDomainId, CognitiveGame } from "../types/cognition";
import { resolveGameRouteTarget } from "./GameRoute";
import {
  calculateCognitiveScoreBreakdown,
  getDomainById,
  getDomainForGameType,
  getFirstPlayableGame,
  getGameById,
  getGameForGameType,
} from "../utils/cognitiveScoring";
import type { GameRoute } from "../utils/gameRoutes";
import { gameDetailsRoute, gamePlayRoute } from "../utils/gameRoutes";

const PREFERRED_GAME_KEY = "conceptiq-preferred-game";
const PREFERRED_COGNITIVE_GAME_KEY = "conceptiq-preferred-cognitive-game";
const gameTypes: GameType[] = ["reaction", "memory", "pattern"];

interface PlayProps {
  profile: UserProfile;
  gameRoute?: GameRoute;
  onNavigateRoute: (route: string) => void;
}

export function Play({ profile, gameRoute, onNavigateRoute }: PlayProps) {
  const breakdown = useMemo(() => calculateCognitiveScoreBreakdown(profile), [profile]);
  const preferredGame = sessionStorage.getItem(PREFERRED_GAME_KEY) as GameType | null;
  const preferredCognitiveGameId = sessionStorage.getItem(PREFERRED_COGNITIVE_GAME_KEY);
  const routeTarget = gameRoute ? resolveGameRouteTarget(gameRoute.gameId) : null;
  const preferredCognitiveGame =
    routeTarget?.game ??
    (preferredCognitiveGameId ? getGameById(preferredCognitiveGameId) : null) ??
    (preferredGame && gameTypes.includes(preferredGame) ? getGameForGameType(preferredGame) : null);
  const preferredCognitiveDomain = preferredCognitiveGame
    ? cognitiveDomains.find((domain) => domain.games.some((game) => game.id === preferredCognitiveGame.id))
    : null;
  const preferredDomain = routeTarget?.domain.id ?? preferredCognitiveDomain?.id ?? (preferredGame && gameTypes.includes(preferredGame) ? getDomainForGameType(preferredGame).id : breakdown.recommendedDomainId);
  const [selectedDomainId, setSelectedDomainId] = useState<CognitiveDomainId>(preferredDomain);
  const [focusedGameId, setFocusedGameId] = useState<string | null>(gameRoute?.mode === "details" ? routeTarget?.game.id ?? null : null);
  const selectedDomain = getDomainById(selectedDomainId);
  const selectedScore = breakdown.domainScores.find((score) => score.domainId === selectedDomainId);
  const gameCards = useMemo(
    () => cognitiveDomains.flatMap((domain) => domain.games.map((game) => ({ domain, game }))),
    [],
  );

  useEffect(() => {
    if (!gameRoute || gameRoute.mode !== "details") {
      return;
    }

    const target = resolveGameRouteTarget(gameRoute.gameId);

    if (!target) {
      return;
    }

    setSelectedDomainId(target.domain.id);
    setFocusedGameId(target.game.id);
  }, [gameRoute]);

  function selectDomain(domainId: CognitiveDomainId) {
    setSelectedDomainId(domainId);
    setFocusedGameId(null);
  }

  function startTraining(domain: CognitiveDomain) {
    const playable = getFirstPlayableGame(domain.id);

    if (!playable) {
      return;
    }

    playGame(domain, playable);
  }

  function rememberGamePreference(game: CognitiveGame) {
    if (game.playableGameType) {
      sessionStorage.setItem(PREFERRED_GAME_KEY, game.playableGameType);
    }

    sessionStorage.setItem(PREFERRED_COGNITIVE_GAME_KEY, game.id);
  }

  function playGame(domain: CognitiveDomain, game: CognitiveGame) {
    rememberGamePreference(game);
    setSelectedDomainId(domain.id);
    onNavigateRoute(gamePlayRoute(game.id));
  }

  function showGameDetails(domain: CognitiveDomain, game: CognitiveGame) {
    rememberGamePreference(game);
    setSelectedDomainId(domain.id);
    setFocusedGameId(game.id);
    onNavigateRoute(gameDetailsRoute(game.id));
  }

  if (gameRoute?.mode === "details" && routeTarget) {
    const { domain, game } = routeTarget;
    const domainScore = breakdown.domainScores.find((score) => score.domainId === domain.id);
    const playable = game.implemented && !game.locked;

    return (
      <div className="space-y-5">
        <section className="surface-gradient p-5">
          <div className="flex items-start gap-4">
            <div className={`rounded-lg p-3 ${domain.colorClass}`}>
              <CognitiveDomainIcon iconName={domain.iconName} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold uppercase text-white/50">Game details</p>
              <h1 className="mt-1 text-3xl font-black">{game.name}</h1>
              <p className="mt-2 text-sm leading-6 text-white/64">{game.description}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <button className="btn-primary min-h-12" type="button" onClick={() => playGame(domain, game)} disabled={!playable}>
              <PlayCircle className="h-4 w-4" />
              Play {game.name}
              <ArrowRight className="h-4 w-4" />
            </button>
            <button className="btn-secondary min-h-12" type="button" onClick={() => onNavigateRoute("/#play")}>
              All Games
            </button>
          </div>
        </section>

        <section className="surface p-5">
          <div className="grid grid-cols-2 gap-3">
            <MiniStat label="Domain score" value={String(domainScore?.score ?? 0)} />
            <MiniStat label="Attempts" value={String(domainScore?.attempts ?? 0)} />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <DetailBlock title="Skill tested" items={[game.primarySkill, ...game.metrics]} />
            <DetailBlock
              title="Learning objectives"
              items={[
                `Train ${domain.name}`,
                `Measure ${game.primarySkill}`,
                "Build cleaner score evidence",
              ]}
            />
            <DetailBlock
              title="Difficulty"
              items={[
                game.playableGameType ? "Full core game" : "MVP assessment loop",
                "Adaptive scoring placeholder",
              ]}
            />
            <DetailBlock title="Subdomains" items={game.subdomainIds.map((id) => domain.subdomains.find((subdomain) => subdomain.id === id)?.name ?? id)} />
          </div>
        </section>

        <DomainDetail
          domain={domain}
          score={domainScore?.score ?? 0}
          attempts={domainScore?.attempts ?? 0}
          focusedGameId={game.id}
          onStart={() => playGame(domain, game)}
          onPlayGame={(nextGame) => playGame(domain, nextGame)}
          onDetailsGame={(nextGame) => showGameDetails(domain, nextGame)}
        />
      </div>
    );
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
            <h1 className="mt-1 text-3xl font-black">Cognitive domains</h1>
            <p className="mt-2 text-sm leading-6 text-white/64">
              Pick a domain, review what it measures, then start a playable game or preview future training.
            </p>
          </div>
        </div>
      </section>

      <section className="surface p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase text-white/50">Game library</p>
            <h2 className="mt-1 text-2xl font-black">Pick a game and press Play</h2>
          </div>
          <span className="pill">{gameCards.length} games</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {gameCards.map(({ domain, game }) => (
            <GameCard
              key={game.id}
              title={game.name}
              description={game.description}
              icon={<CognitiveDomainIcon iconName={domain.iconName} />}
              playRoute={gamePlayRoute(game.id)}
              detailsRoute={gameDetailsRoute(game.id)}
              onPlay={() => playGame(domain, game)}
              onDetails={() => showGameDetails(domain, game)}
              stat={`${domain.name} | ${game.primarySkill}`}
              badge={game.implemented && !game.locked ? "Playable" : "Coming Soon"}
              active={focusedGameId === game.id}
              locked={!game.implemented || game.locked}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {cognitiveDomains.map((domain) => {
          const score = breakdown.domainScores.find((domainScore) => domainScore.domainId === domain.id);
          const active = selectedDomainId === domain.id;

          return (
            <button
              key={domain.id}
              type="button"
              onClick={() => selectDomain(domain.id)}
              className={`surface-soft min-h-64 p-5 text-left transition duration-200 hover:border-pulse/40 hover:bg-white/10 active:scale-[0.99] ${
                active ? "border-pulse/60 bg-pulse/10" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className={`rounded-lg p-3 ${domain.colorClass}`}>
                  <CognitiveDomainIcon iconName={domain.iconName} />
                </div>
                <span className={`pill ${domain.unlocked ? "text-mint" : "text-white/50"}`}>
                  {domain.unlocked ? "Unlocked" : "Coming Soon"}
                </span>
              </div>
              <h2 className="mt-5 text-2xl font-black">{domain.name}</h2>
              <p className="mt-2 text-sm leading-6 text-white/62">{domain.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {domain.subdomains.slice(0, 3).map((subdomain) => (
                  <span key={subdomain.id} className="rounded-full bg-white/8 px-2.5 py-1 text-xs font-bold text-white/58">
                    {subdomain.name}
                  </span>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <MiniStat label="Games" value={String(domain.games.length)} />
                <MiniStat label="Score" value={score?.score ? String(score.score) : "0"} />
              </div>
            </button>
          );
        })}
      </section>

      <DomainDetail
        domain={selectedDomain}
        score={selectedScore?.score ?? 0}
        attempts={selectedScore?.attempts ?? 0}
        focusedGameId={focusedGameId}
        onStart={() => startTraining(selectedDomain)}
        onPlayGame={(game) => playGame(selectedDomain, game)}
        onDetailsGame={(game) => showGameDetails(selectedDomain, game)}
      />
    </div>
  );
}

function DomainDetail({
  domain,
  score,
  attempts,
  focusedGameId,
  onStart,
  onPlayGame,
  onDetailsGame,
}: {
  domain: CognitiveDomain;
  score: number;
  attempts: number;
  focusedGameId: string | null;
  onStart: () => void;
  onPlayGame: (game: CognitiveGame) => void;
  onDetailsGame: (game: CognitiveGame) => void;
}) {
  const playable = getFirstPlayableGame(domain.id);

  return (
    <section className="surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase text-white/50">Domain detail</p>
          <h2 className="mt-1 text-3xl font-black">{domain.name}</h2>
        </div>
        <div className={`rounded-lg p-3 ${domain.colorClass}`}>
          <CognitiveDomainIcon iconName={domain.iconName} />
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-white/64">{domain.description}</p>
      <div className="mt-5">
        <ProgressBar value={score} max={1000} label={`${domain.name} score`} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <DetailBlock title="Subdomains" items={domain.subdomains.map((subdomain) => subdomain.name)} />
        <DetailBlock title="Metrics measured" items={domain.primaryMetrics} />
      </div>

      <div className="mt-5">
        <h3 className="text-xl font-black">Games available</h3>
        <div className="mt-3 grid gap-3">
          {domain.games.map((game) => (
            <GameCard
              key={game.id}
              title={game.name}
              description={game.description}
              icon={<CognitiveDomainIcon iconName={domain.iconName} />}
              playRoute={gamePlayRoute(game.id)}
              detailsRoute={gameDetailsRoute(game.id)}
              onPlay={() => onPlayGame(game)}
              onDetails={() => onDetailsGame(game)}
              stat={game.metrics.join(" | ")}
              badge={game.implemented && !game.locked ? "Playable" : "Coming Soon"}
              active={focusedGameId === game.id}
              locked={!game.implemented || game.locked}
            />
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-white/10 bg-white/7 p-4">
        <p className="flex items-center gap-2 text-sm font-bold uppercase text-white/50">
          <CheckCircle2 className="h-4 w-4 text-mint" />
          Why this matters
        </p>
        <p className="mt-2 text-sm leading-6 text-white/64">{domain.whyItMatters}</p>
      </div>

      <button className="btn-primary mt-5 w-full" type="button" onClick={onStart} disabled={!playable}>
        {playable ? <PlayCircle className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
        {playable ? `Start ${playable.name}` : "Unavailable"}
        {playable ? <ArrowRight className="h-4 w-4" /> : null}
      </button>
      <p className="mt-3 text-center text-xs font-bold text-white/42">{attempts} attempt{attempts === 1 ? "" : "s"} in this domain</p>
    </section>
  );
}

function DetailBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/7 p-4">
      <p className="text-sm font-bold uppercase text-white/48">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="rounded-full bg-white/8 px-2.5 py-1 text-xs font-bold text-white/64">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-ink/32 p-3">
      <p className="text-xs font-bold uppercase text-white/42">{label}</p>
      <p className="mt-1 text-xl font-black">{value}</p>
    </div>
  );
}
