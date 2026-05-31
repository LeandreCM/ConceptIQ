import { useRef, useState } from "react";
import { CheckCircle2, Play, RotateCcw } from "lucide-react";
import { getMiniGameChallenges } from "../data/cognitiveGameChallenges";
import type { GameResult, GameType } from "../types";
import type { CognitiveDomain, CognitiveGame } from "../types/cognition";
import { buildResultId, scorePercentileLabel } from "../utils/scoring";

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
  const startedAtRef = useRef(0);
  const currentChallenge = challenges[questionIndex];

  function start() {
    setStarted(true);
    setQuestionIndex(0);
    setAnswers([]);
    setSelectedAnswer(null);
    startedAtRef.current = performance.now();
  }

  function chooseAnswer(answerIndex: number) {
    setSelectedAnswer(answerIndex);
  }

  function submitAnswer() {
    if (selectedAnswer === null) {
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
        {currentChallenge.stimulus ? (
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {currentChallenge.stimulus.map((item, index) => (
              <span key={`${item}-${index}`} className="flex h-14 min-w-14 items-center justify-center rounded-lg bg-pulse/14 px-4 text-2xl font-black">
                {item}
              </span>
            ))}
          </div>
        ) : null}
      </div>

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

      <div className="mt-5 rounded-lg bg-white/7 p-4">
        <p className="text-sm font-bold text-white/50">Skill tested</p>
        <p className="mt-1 font-black">{game.primarySkill}</p>
      </div>

      <button className="btn-primary mt-5 w-full" type="button" onClick={submitAnswer} disabled={selectedAnswer === null}>
        {questionIndex + 1 >= challenges.length ? "Finish Round" : "Next Question"}
      </button>
    </div>
  );
}

function persistenceGameTypeForDomain(domainId: CognitiveDomain["id"]): GameType {
  if (domainId === "processing-speed" || domainId === "focus-attention") {
    return "reaction";
  }

  if (domainId === "memory" || domainId === "working-memory" || domainId === "verbal-reasoning" || domainId === "quantitative-reasoning") {
    return "memory";
  }

  return "pattern";
}
