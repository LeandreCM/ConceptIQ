interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  tone?: "cyan" | "mint" | "solar" | "bloom";
}

const tones = {
  cyan: "from-pulse to-cyan-200",
  mint: "from-mint to-emerald-200",
  solar: "from-solar to-orange-200",
  bloom: "from-bloom to-fuchsia-200",
};

export function ProgressBar({ value, max = 100, label, tone = "cyan" }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="space-y-2">
      {label ? (
        <div className="flex items-center justify-between text-xs font-semibold text-white/70">
          <span>{label}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      ) : null}
      <div className="h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${tones[tone]} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
