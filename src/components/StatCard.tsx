import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  detail?: string;
  icon: ReactNode;
  tone?: "cyan" | "mint" | "solar" | "bloom";
}

const toneStyles = {
  cyan: "bg-pulse/15 text-pulse",
  mint: "bg-mint/15 text-mint",
  solar: "bg-solar/15 text-solar",
  bloom: "bg-bloom/15 text-bloom",
};

export function StatCard({ label, value, detail, icon, tone = "cyan" }: StatCardProps) {
  return (
    <div className="surface-soft p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white/58">{label}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
        </div>
        <div className={`rounded-lg p-2.5 ${toneStyles[tone]}`}>{icon}</div>
      </div>
      {detail ? <p className="mt-3 text-sm text-white/58">{detail}</p> : null}
    </div>
  );
}
