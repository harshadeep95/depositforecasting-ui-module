import { cn } from "@/lib/utils";

/** Tiny inline trend sparkline — no axes, purely indicative of direction. */
export function Sparkline({
  values,
  positive = true,
  width = 84,
  height = 26,
  className,
}: {
  values: number[];
  positive?: boolean;
  width?: number;
  height?: number;
  className?: string;
}) {
  if (!values.length) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = values.length > 1 ? width / (values.length - 1) : width;
  const pts = values.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / span) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const stroke = positive ? "var(--status-go)" : "var(--status-stop)";
  const last = pts[pts.length - 1]!.split(",");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={cn("overflow-visible", className)} role="img" aria-hidden>
      <polyline points={pts.join(" ")} fill="none" stroke={stroke} strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r={2} fill={stroke} />
    </svg>
  );
}
