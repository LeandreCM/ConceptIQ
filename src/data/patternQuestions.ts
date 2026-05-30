import type { PatternQuestion } from "../types";

export const patternQuestions: PatternQuestion[] = [
  {
    id: 1,
    prompt: "Numbers double each step.",
    sequence: ["2", "4", "8", "16", "?"],
    options: ["24", "30", "32", "36"],
    answerIndex: 2,
  },
  {
    id: 2,
    prompt: "Letter gaps grow by one.",
    sequence: ["A", "C", "F", "J", "?"],
    options: ["L", "M", "O", "P"],
    answerIndex: 2,
  },
  {
    id: 3,
    prompt: "The symbols alternate.",
    sequence: ["▲", "●", "▲", "●", "▲", "?"],
    options: ["▲", "◆", "●", "■"],
    answerIndex: 2,
  },
  {
    id: 4,
    prompt: "A classic growth pattern.",
    sequence: ["1", "1", "2", "3", "5", "?"],
    options: ["6", "7", "8", "10"],
    answerIndex: 2,
  },
  {
    id: 5,
    prompt: "Odd jumps increase by two.",
    sequence: ["3", "6", "11", "18", "?"],
    options: ["24", "25", "27", "30"],
    answerIndex: 2,
  },
  {
    id: 6,
    prompt: "Letters step backward with growing gaps.",
    sequence: ["Z", "Y", "W", "T", "?"],
    options: ["P", "Q", "R", "S"],
    answerIndex: 0,
  },
  {
    id: 7,
    prompt: "A three-symbol cycle repeats.",
    sequence: ["□", "◇", "○", "□", "◇", "?"],
    options: ["◇", "□", "○", "△"],
    answerIndex: 2,
  },
  {
    id: 8,
    prompt: "Perfect squares rise in order.",
    sequence: ["4", "9", "16", "25", "?"],
    options: ["30", "32", "36", "49"],
    answerIndex: 2,
  },
  {
    id: 9,
    prompt: "Double, then subtract two.",
    sequence: ["5", "10", "8", "16", "14", "?"],
    options: ["22", "24", "26", "28"],
    answerIndex: 3,
  },
  {
    id: 10,
    prompt: "Letter pairs move forward together.",
    sequence: ["MN", "OP", "QR", "?"],
    options: ["RS", "ST", "TU", "UV"],
    answerIndex: 1,
  },
];
