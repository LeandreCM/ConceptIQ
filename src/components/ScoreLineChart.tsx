interface ScorePoint {
  label: string;
  value: number;
}

interface ScoreLineChartProps {
  points: ScorePoint[];
}

export function ScoreLineChart({ points }: ScoreLineChartProps) {
  const chartPoints = points.slice(-12);
  const width = 640;
  const height = 220;
  const padding = 28;
  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;
  const values = chartPoints.map((point) => point.value);
  const min = Math.max(0, Math.min(...values, 0) - 40);
  const max = Math.min(1000, Math.max(...values, 100) + 40);
  const range = Math.max(1, max - min);
  const coordinates = chartPoints.map((point, index) => {
    const x = padding + (chartPoints.length === 1 ? plotWidth : (index / (chartPoints.length - 1)) * plotWidth);
    const y = padding + plotHeight - ((point.value - min) / range) * plotHeight;
    return { ...point, x, y };
  });
  const path = coordinates.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

  return (
    <div className="surface p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Score Over Time</h2>
        <span className="pill">Last {chartPoints.length || 0} attempts</span>
      </div>
      {chartPoints.length ? (
        <svg className="h-64 w-full" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="ConceptIQ score over time chart">
          <defs>
            <linearGradient id="scoreLine" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#36f3ff" />
              <stop offset="100%" stopColor="#6dff9d" />
            </linearGradient>
          </defs>
          {[0, 250, 500, 750, 1000].map((tick) => {
            const y = padding + plotHeight - ((tick - min) / range) * plotHeight;
            if (y < padding || y > height - padding) return null;

            return (
              <g key={tick}>
                <line x1={padding} x2={width - padding} y1={y} y2={y} stroke="rgba(255,255,255,0.08)" />
                <text x={0} y={y + 4} fill="rgba(255,255,255,0.48)" fontSize="12">
                  {tick}
                </text>
              </g>
            );
          })}
          <path d={path} fill="none" stroke="url(#scoreLine)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5" />
          {coordinates.map((point) => (
            <g key={`${point.label}-${point.x}`}>
              <circle cx={point.x} cy={point.y} r="6" fill="#070812" stroke="#36f3ff" strokeWidth="3" />
              <text x={point.x} y={height - 6} fill="rgba(255,255,255,0.56)" fontSize="12" textAnchor="middle">
                {point.label}
              </text>
            </g>
          ))}
        </svg>
      ) : (
        <div className="rounded-lg border border-dashed border-white/16 bg-white/5 p-8 text-center text-white/58">
          Play a challenge to start your score chart.
        </div>
      )}
    </div>
  );
}
