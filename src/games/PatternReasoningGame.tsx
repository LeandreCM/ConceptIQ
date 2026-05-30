import { useMemo, useState } from "react";
import { CheckCircle2, Play, Puzzle } from "lucide-react";
import { patternQuestions } from "../data/patternQuestions";
import type { GameResult } from "../types";
import { buildResultId, patternRoundToScore, scorePercentileLabel } from "../utils/scoring";
import { ProgressBar } from "../components/ProgressBar";

interface PatternReasoningGameProps {
  onComplete: (result: GameResult) => void;
}

export function PatternReasoningGame({ onComplete }: PatternReasoningGameProps) {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const currentQuestion = patternQuestions[questionIndex];
  const progress = useMemo(() => (answers.length / patternQuestions.length) * 100, [answers.length]);

  function start() {
    setStartedAt(performance.now());
    setQuestionIndex(0);
    setAnswers([]);
  }

  function chooseAnswer(answerIndex: number) {
    if (startedAt === null) {
      return;
    }

    const nextAnswers = [...answers, answerIndex];
    const nextIndex = questionIndex + 1;

    if (nextIndex >= patternQuestions.length) {
      finish(nextAnswers);
      return;
    }

    setAnswers(nextAnswers);
    setQuestionIndex(nextIndex);
  }

  function finish(finalAnswers: number[]) {
    const elapsedMs = Math.round(performance.now() - (startedAt ?? performance.now()));
    const correct = patternQuestions.filter((question, index) => question.answerIndex === finalAnswers[index]).length;
    const mistakes = patternQuestions.length - correct;
    const categoryScore = patternRoundToScore(correct, patternQuestions.length, elapsedMs);

    onComplete({
      id: buildResultId("pattern"),
      gameType: "pattern",
      title: `${correct}/${patternQuestions.length} patterns solved`,
      rawScore: correct,
      categoryScore,
      normalizedScore: categoryScore,
      correctCount: correct,
      totalQuestions: patternQuestions.length,
      elapsedMs,
      durationMs: elapsedMs,
      mistakes,
      accuracy: correct / patternQuestions.length,
      wasFailure: correct < 4,
      timestamp: new Date().toISOString(),
      percentileLabel: scorePercentileLabel(categoryScore),
      whatImproved: correct >= 8 ? "High pattern accuracy registered." : "Your reasoning baseline got a fresh calibration.",
      trainNext: correct >= 8 ? "Try reaction time to raise your speed profile." : "Look for cycles, jumps, and alternating rules.",
      metrics: [
        { label: "Correct", value: `${correct}/${patternQuestions.length}` },
        { label: "Time", value: `${Math.round(elapsedMs / 1000)}s` },
        { label: "Category score", value: `${categoryScore}/1000` },
      ],
    });
  }

  if (startedAt === null) {
    return (
      <div className="surface p-5">
        <div className="flex min-h-80 flex-col items-center justify-center rounded-lg border border-white/10 bg-white/6 p-8 text-center">
          <Puzzle className="mb-5 h-14 w-14 text-pulse" />
          <h2 className="text-3xl font-black">Pattern Reasoning</h2>
          <p className="mt-3 max-w-xl text-white/64">
            Solve 10 symbolic patterns. Accuracy matters most, and speed adds a bonus.
          </p>
          <button className="btn-primary mt-6" type="button" onClick={start}>
            <Play className="h-4 w-4" />
            Start Pattern Set
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="surface p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white/56">Question {questionIndex + 1} of {patternQuestions.length}</p>
          <h2 className="text-2xl font-bold">Find the missing item</h2>
        </div>
        <span className="pill">{answers.length} answered</span>
      </div>
      <ProgressBar value={progress} label="Pattern set progress" tone="bloom" />

      <div className="mt-6 rounded-lg border border-white/10 bg-white/6 p-5">
        <p className="text-sm font-semibold text-white/62">{currentQuestion.prompt}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {currentQuestion.sequence.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="flex h-16 min-w-16 items-center justify-center rounded-lg border border-pulse/24 bg-pulse/10 px-4 text-2xl font-black"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {currentQuestion.options.map((option, index) => (
          <button
            key={`${option}-${index}`}
            type="button"
            className="btn-secondary min-h-16 justify-between text-left text-xl"
            onClick={() => chooseAnswer(index)}
          >
            <span>{option}</span>
            <CheckCircle2 className="h-5 w-5 text-white/40" />
          </button>
        ))}
      </div>
    </div>
  );
}
