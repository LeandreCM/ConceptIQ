import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Lock, PlayCircle, Route } from "lucide-react";
import { CognitiveDomainIcon } from "../components/CognitiveDomainIcon";
import { ProgressBar } from "../components/ProgressBar";
import { cognitiveDomains } from "../data/cognitiveDomains";
import { MiniCognitiveGame } from "../games/MiniCognitiveGame";
import { PatternReasoningGame } from "../games/PatternReasoningGame";
import { ReactionTimeGame } from "../games/ReactionTimeGame";
import { WorkingMemoryGame } from "../games/WorkingMemoryGame";
import type { GameResult, GameType, UserProfile } from "../types";
import type { CognitiveDomain, CognitiveDomainId, CognitiveGame } from "../types/cognition";
import {
  calculateCognitiveScoreBreakdown,
  getDomainById,
  getDomainForGameType,
  getFirstPlayableGame,
  getGameById,
  getGameForGameType,
} from "../utils/cognitiveScoring";

const PREFERRED_GAME_KEY = "conceptiq-preferred-game";
const PREFERRED_COGNITIVE_GAME_KEY = "conceptiq-preferred-cognitive-game";
const gameTypes: GameType[] = ["reaction", "memory", "pattern"];

interface PlayProps {
  profile: UserProfile;
  onComplete: (result: GameResult) => void;
}

export function Play({ profile, onComplete }: PlayProps) {
  const breakdown = useMemo(() => calculateCognitiveScoreBreakdown(profile), [profile]);
  const preferredGame = sessionStorage.getItem(PREFERRED_GAME_KEY) as GameType | null;
  const preferredCognitiveGameId = sessionStorage.getItem(PREFERRED_COGNITIVE_GAME_KEY);
  const preferredCognitiveGame =
    (preferredCognitiveGameId ? getGameById(preferredCognitiveGameId) : null) ??
    (preferredGame && gameTypes.includes(preferredGame) ? getGameForGameType(preferredGame) : null);
  const preferredCognitiveDomain = preferredCognitiveGame
    ? cognitiveDomains.find((domain) => domain.games.some((game) => game.id === preferredCognitiveGame.id))
    : null;
  const preferredDomain = preferredCognitiveDomain?.id ?? (preferredGame && gameTypes.includes(preferredGame) ? getDomainForGameType(preferredGame).id : breakdown.recommendedDomainId);
  const [selectedDomainId, setSelectedDomainId] = useState<CognitiveDomainId>(preferredDomain);
  const [activeGameId, setActiveGameId] = useState<string | null>(preferredCognitiveGame?.id ?? null);
  const selectedDomain = getDomainById(selectedDomainId);
  const selectedScore = breakdown.domainScores.find((score) => score.domainId === selectedDomainId);
  const activeGame = activeGameId ? getGameById(activeGameId) : null;

  function selectDomain(domainId: CognitiveDomainId) {
    setSelectedDomainId(domainId);
    setActiveGameId(null);
  }

  function startTraining(domain: CognitiveDomain) {
    const playable = getFirstPlayableGame(domain.id);

    if (!playable) {
      return;
    }

    if (playable.playableGameType) {
      sessionStorage.setItem(PREFERRED_GAME_KEY, playable.playableGameType);
    }

    sessionStorage.setItem(PREFERRED_COGNITIVE_GAME_KEY, playable.id);
    setSelectedDomainId(domain.id);
    setActiveGameId(playable.id);
  }

  function startGame(domain: CognitiveDomain, game: CognitiveGame) {
    if (game.playableGameType) {
      sessionStorage.setItem(PREFERRED_GAME_KEY, game.playableGameType);
    }

    sessionStorage.setItem(PREFERRED_COGNITIVE_GAME_KEY, game.id);
    setSelectedDomainId(domain.id);
    setActiveGameId(game.id);
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
        onStart={() => startTraining(selectedDomain)}
        onStartGame={(game) => startGame(selectedDomain, game)}
      />

      {activeGame ? (
        <section className="space-y-3">
          <div className="surface-soft p-4">
            <p className="text-sm font-bold uppercase text-white/50">Now training</p>
            <p className="mt-1 text-xl font-black">{activeGame.name}</p>
          </div>
          {activeGame.playableGameType === "reaction" ? <ReactionTimeGame profile={profile} onComplete={onComplete} /> : null}
          {activeGame.playableGameType === "memory" ? <WorkingMemoryGame profile={profile} onComplete={onComplete} /> : null}
          {activeGame.playableGameType === "pattern" ? <PatternReasoningGame onComplete={onComplete} /> : null}
          {!activeGame.playableGameType ? (
            <MiniCognitiveGame domain={selectedDomain} game={activeGame} onComplete={onComplete} />
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

function DomainDetail({
  domain,
  score,
  attempts,
  onStart,
  onStartGame,
}: {
  domain: CognitiveDomain;
  score: number;
  attempts: number;
  onStart: () => void;
  onStartGame: (game: CognitiveGame) => void;
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
            <div key={game.id} className="rounded-lg border border-white/10 bg-white/7 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black">{game.name}</p>
                  <p className="mt-1 text-sm leading-6 text-white/58">{game.description}</p>
                </div>
                <span className="rounded-full bg-mint/15 px-3 py-1 text-xs font-black text-mint">
                  Playable
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {game.metrics.map((metric) => (
                  <span key={metric} className="rounded-full bg-ink/38 px-2.5 py-1 text-xs font-bold text-white/56">
                    {metric}
                  </span>
                ))}
              </div>
              <button className="btn-secondary mt-4 w-full" type="button" onClick={() => onStartGame(game)}>
                Start {game.name}
              </button>
            </div>
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
