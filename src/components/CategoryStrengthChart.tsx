import type { CategoryScores, GameType } from "../types";
import { categoryLabel } from "../utils/format";

interface CategoryStrengthChartProps {
  scores: CategoryScores;
}

const tones: Record<GameType, string> = {
  reaction: "#36f3ff",
  memory: "#6dff9d",
  pattern: "#ff5fa2",
};

export function CategoryStrengthChart({ scores }: CategoryStrengthChartProps) {
  const entries = Object.entries(scores) as Array<[GameType, number]>;
  const width = 620;
  const height = 220;
  const left = 150;
  const barHeight = 30;
  const gap = 34;
  const maxWidth = width - left - 34;

  return (
    <div className="surface p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Category Strengths</h2>
        <span className="pill">0-1000</span>
      </div>
      <svg className="h-64 w-full" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Category strengths chart">
        {[0, 250, 500, 750, 1000].map((tick) => {
          const x = left + (tick / 1000) * maxWidth;
          return (
            <g key={tick}>
              <line x1={x} x2={x} y1="16" y2={height - 28} stroke="rgba(255,255,255,0.08)" />
              <text x={x} y={height - 8} fill="rgba(255,255,255,0.48)" fontSize="12" textAnchor="middle">
                {tick}
              </text>
            </g>
          );
        })}
        {entries.map(([type, score], index) => {
          const y = 32 + index * (barHeight + gap);
          const barWidth = Math.max(6, (score / 1000) * maxWidth);

          return (
            <g key={type}>
              <text x="0" y={y + 21} fill="rgba(255,255,255,0.78)" fontSize="16" fontWeight="700">
                {categoryLabel(type)}
              </text>
              <rect x={left} y={y} width={maxWidth} height={barHeight} rx="8" fill="rgba(255,255,255,0.08)" />
              <rect x={left} y={y} width={barWidth} height={barHeight} rx="8" fill={tones[type]} opacity="0.86" />
              <text x={Math.min(left + barWidth + 10, left + maxWidth - 8)} y={y + 21} fill="rgba(255,255,255,0.86)" fontSize="14" fontWeight="800" textAnchor="start">
                {Math.round(score)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
