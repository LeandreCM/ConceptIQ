import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Play, RotateCcw } from "lucide-react";
import { getMiniGameChallenges } from "../data/cognitiveGameChallenges";
import type { GameResult, GameType } from "../types";
import type { CognitiveDomain, CognitiveGame } from "../types/cognition";
import { buildResultId, scorePercentileLabel } from "../utils/scoring";

const STIMULUS_FLASH_MS = 1000;

interface MiniCognitiveGameProps {
  domain: CognitiveDomain;
  game: CognitiveGame;
  onComplete: (result: GameResult) => void;
}

export function MiniCognitiveGame({ domain, game, onComplete }: MiniCognitiveGameProps) {
  const challenges = getMiniGameChallenges(game.id);
  const [started, setStarted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [stimulusIndex, setStimulusIndex] = useState(0);
  const [stimulusComplete, setStimulusComplete] = useState(false);
  const startedAtRef = useRef(0);
  const currentChallenge = challenges[questionIndex];
  const stimulusItems = currentChallenge.stimulus ?? [];
  const hasTimedStimulus = stimulusItems.length > 0;
  const choicesVisible = !hasTimedStimulus || stimulusComplete;

  useEffect(() => {
    const items = currentChallenge.stimulus ?? [];

    if (!started || !items.length) {
      setStimulusIndex(0);
      setStimulusComplete(false);
      return;
    }

    setSelectedAnswer(null);
    setStimulusIndex(0);
    setStimulusComplete(false);

    let nextIndex = 0;
    const timer = window.setInterval(() => {
      nextIndex += 1;

      if (nextIndex >= items.length) {
        window.clearInterval(timer);
        setStimulusComplete(true);
        setStimulusIndex(items.length - 1);
        return;
      }

      setStimulusIndex(nextIndex);
    }, STIMULUS_FLASH_MS);

    return () => window.clearInterval(timer);
  }, [currentChallenge, started]);

  function start() {
    setStarted(true);
    setQuestionIndex(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setStimulusIndex(0);
    setStimulusComplete(false);
    startedAtRef.current = performance.now();
  }

  function chooseAnswer(answerIndex: number) {
    if (!choicesVisible) {
      return;
    }

    setSelectedAnswer(answerIndex);
  }

  function submitAnswer() {
    if (!choicesVisible || selectedAnswer === null) {
      return;
    }

    const nextAnswers = [...answers, selectedAnswer];
    const nextIndex = questionIndex + 1;

    if (nextIndex >= challenges.length) {
      finish(nextAnswers);
      return;
    }

    setAnswers(nextAnswers);
    setQuestionIndex(nextIndex);
    setSelectedAnswer(null);
  }

  function finish(finalAnswers: number[]) {
    const durationMs = Math.round(performance.now() - startedAtRef.current);
    const correct = challenges.filter((challenge, index) => challenge.answerIndex === finalAnswers[index]).length;
    const mistakes = challenges.length - correct;
    const accuracy = challenges.length ? correct / challenges.length : 0;
    const speedBonus = Math.max(0, 1 - durationMs / 90000) * 150;
    const categoryScore = Math.max(0, Math.min(1000, Math.round(accuracy * 850 + speedBonus)));
    const gameType = game.playableGameType ?? persistenceGameTypeForDomain(domain.id);

    onComplete({
      id: buildResultId(gameType),
      gameType,
      title: `${correct}/${challenges.length} ${game.name}`,
      rawScore: correct,
      categoryScore,
      normalizedScore: categoryScore,
      percentileLabel: scorePercentileLabel(categoryScore),
      whatImproved: `${game.primarySkill} sample captured.`,
      trainNext: accuracy >= 0.8 ? `Try another ${domain.name} game to broaden the signal.` : `Repeat ${game.name} to stabilize this skill.`,
      timestamp: new Date().toISOString(),
      metrics: [
        { label: "Game", value: game.name },
        { label: "Domain", value: domain.name },
        { label: "Accuracy", value: `${Math.round(accuracy * 100)}%` },
        { label: "Correct", value: `${correct}/${challenges.length}` },
      ],
      mistakes,
      durationMs,
      accuracy,
      correctCount: correct,
      totalQuestions: challenges.length,
      wasFailure: accuracy < 0.5,
      cognitiveDomainId: domain.id,
      cognitiveDomainName: domain.name,
      cognitiveGameId: game.id,
      cognitiveGameName: game.name,
      skillTested: game.primarySkill,
    });
  }

  if (!started) {
    return (
      <div className="surface p-5">
        <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-white/10 bg-white/6 p-8 text-center">
          <div className={`mb-5 rounded-lg p-3 ${domain.colorClass}`}>
            <Play className="h-8 w-8" />
          </div>
          <p className="text-sm font-bold uppercase text-white/50">{domain.name}</p>
          <h2 className="mt-2 text-3xl font-black">{game.name}</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/64">{game.description}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {game.metrics.map((metric) => (
              <span key={metric} className="pill">{metric}</span>
            ))}
          </div>
          <button className="btn-primary mt-6" type="button" onClick={start}>
            <Play className="h-4 w-4" />
            Start Round
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="surface p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase text-white/50">
            Question {questionIndex + 1} of {challenges.length}
          </p>
          <h2 className="mt-1 text-2xl font-black">{game.name}</h2>
        </div>
        <button className="btn-secondary" type="button" onClick={start}>
          <RotateCcw className="h-4 w-4" />
          Restart
        </button>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/7 p-5">
        <p className="text-lg font-black leading-7">{currentChallenge.prompt}</p>
        {hasTimedStimulus ? (
          <div className="mt-5 flex flex-col items-center gap-4">
            <div className="flex h-28 w-28 items-center justify-center rounded-full border border-pulse/30 bg-pulse/12 shadow-glow">
              {stimulusComplete ? (
                <span className="text-sm font-black uppercase text-pulse">Choose</span>
              ) : (
                <span key={`${questionIndex}-${stimulusIndex}`} className="animate-pulse text-5xl font-black text-pulse">
                  {stimulusItems[stimulusIndex]}
                </span>
              )}
            </div>
            <div className="w-full max-w-sm">
              <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase text-white/46">
                <span>{stimulusComplete ? "Sequence complete" : `Flash ${stimulusIndex + 1} of ${stimulusItems.length}`}</span>
                <span>{(STIMULUS_FLASH_MS / 1000).toFixed(1)}s each</span>
              </div>
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${stimulusItems.length}, minmax(0, 1fr))` }}>
                {stimulusItems.map((item, index) => (
                  <span
                    key={`${item}-${index}`}
                    className={`h-2 rounded-full ${index <= stimulusIndex ? "bg-pulse" : "bg-white/12"}`}
                    aria-label={`Stimulus ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {choicesVisible ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {currentChallenge.options.map((option, index) => (
            <button
              key={`${option}-${index}`}
              type="button"
              onClick={() => chooseAnswer(index)}
              className={`btn-secondary min-h-16 justify-between text-left ${selectedAnswer === index ? "border-pulse/60 bg-pulse/10" : ""}`}
            >
              <span>{option}</span>
              <CheckCircle2 className={`h-5 w-5 ${selectedAnswer === index ? "text-pulse" : "text-white/36"}`} />
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-white/10 bg-white/7 p-4 text-center">
          <p className="text-sm font-bold text-white/58">Keep the running total in mind. Choices unlock when the sequence ends.</p>
        </div>
      )}

      <div className="mt-5 rounded-lg bg-white/7 p-4">
        <p className="text-sm font-bold text-white/50">Skill tested</p>
        <p className="mt-1 font-black">{game.primarySkill}</p>
      </div>

      <button className="btn-primary mt-5 w-full" type="button" onClick={submitAnswer} disabled={!choicesVisible || selectedAnswer === null}>
        {questionIndex + 1 >= challenges.length ? "Finish Round" : "Next Question"}
      </button>
    </div>
  );
}

function persistenceGameTypeForDomain(domainId: CognitiveDomain["id"]): GameType {
  if (domainId === "attention" || domainId === "perception" || domainId === "executive-control") {
    return "reaction";
  }

  if (domainId === "working-memory" || domainId === "language-concepts" || domainId === "learning-knowledge-integration") {
    return "memory";
  }

  return "pattern";
}
