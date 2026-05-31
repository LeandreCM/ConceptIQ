import { useMemo, useRef, useState } from "react";
import { Brain, Check, EyeOff, Play } from "lucide-react";
import type { GameResult, UserProfile } from "../types";
import { buildResultId, memoryRoundToScore, scorePercentileLabel } from "../utils/scoring";

interface WorkingMemoryGameProps {
  profile: UserProfile;
  onComplete: (result: GameResult) => void;
}

const SYMBOLS = ["2", "7", "4", "9", "A", "K", "M", "R", "Q", "S", "X", "Z"];

export function WorkingMemoryGame({ profile, onComplete }: WorkingMemoryGameProps) {
  const startingLength = useMemo(() => Math.min(10, 4 + Math.floor(profile.bestMemoryScore / 220)), [profile.bestMemoryScore]);
  const [length, setLength] = useState(startingLength);
  const [sequence, setSequence] = useState<string[]>([]);
  const [visible, setVisible] = useState(false);
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const startedAtRef = useRef(0);

  function startRound() {
    const nextSequence = Array.from({ length }, () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
    setSequence(nextSequence);
    setInput("");
    setStarted(true);
    setVisible(true);
    startedAtRef.current = performance.now();

    window.setTimeout(() => {
      setVisible(false);
    }, 1800 + length * 260);
  }

  function submit() {
    const answer = input.replace(/\s+/g, "").toUpperCase();
    const target = sequence.join("").toUpperCase();
    const correctCharacters = target
      .split("")
      .filter((character, index) => character === answer[index]).length;
    const accuracy = target.length ? correctCharacters / target.length : 0;
    const mistakes = Math.max(target.length, answer.length) - correctCharacters;
    const durationMs = Math.round(performance.now() - startedAtRef.current);
    const perfectRound = accuracy === 1;
    const categoryScore = memoryRoundToScore(length, accuracy);

    if (perfectRound) {
      setLength((current) => Math.min(12, current + 1));
    } else {
      setLength((current) => Math.max(4, current - 1));
    }

    onComplete({
      id: buildResultId("memory"),
      gameType: "memory",
      title: perfectRound ? "Perfect Memory Round" : `${Math.round(accuracy * 100)}% recall`,
      rawScore: correctCharacters,
      categoryScore,
      normalizedScore: categoryScore,
      memoryLength: length,
      accuracy,
      mistakes,
      durationMs,
      perfectRound,
      wasFailure: accuracy < 0.5,
      timestamp: new Date().toISOString(),
      percentileLabel: scorePercentileLabel(categoryScore),
      whatImproved: perfectRound ? "Sequence span increased for your next memory round." : "Recall accuracy was logged for calibration.",
      trainNext: perfectRound ? "Try pattern reasoning while your working memory is warm." : "Repeat memory with a shorter sequence and rebuild accuracy.",
      metrics: [
        { label: "Sequence length", value: String(length) },
        { label: "Accuracy", value: `${Math.round(accuracy * 100)}%` },
        { label: "Category score", value: `${categoryScore}/1000` },
      ],
    });
  }

  return (
    <div className="surface p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white/56">Memory round</p>
          <h2 className="text-2xl font-bold">Working Memory</h2>
        </div>
        <button className="btn-primary" type="button" onClick={startRound}>
          <Play className="h-4 w-4" />
          New Sequence
        </button>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/6 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="pill">Length {length}</span>
          <span className="pill">Best {profile.bestMemoryScore}/1000</span>
        </div>
        <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-white/16 bg-ink/50 p-4">
          {visible ? (
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
              {sequence.map((item, index) => (
                <span
                  key={`${item}-${index}`}
                  className="flex h-14 w-14 items-center justify-center rounded-lg bg-pulse/14 text-2xl font-black text-white"
                >
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-center">
              <EyeOff className="mx-auto mb-3 h-9 w-9 text-white/42" />
              <p className="text-lg font-bold">{started ? "Sequence hidden" : "Start a round to reveal the sequence"}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-white/64">Type the sequence without spaces</span>
          <input
            className="w-full rounded-lg border border-white/10 bg-white/8 px-4 py-3 text-lg font-semibold text-white placeholder:text-white/34"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Example: 274AK"
            disabled={!started || visible}
          />
        </label>
        <button className="btn-secondary self-end" type="button" onClick={submit} disabled={!started || visible || !input}>
          <Check className="h-4 w-4" />
          Submit
        </button>
      </div>
    </div>
  );
}
