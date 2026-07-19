"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

type AnimatedCounterProps = {
  value: number | string;
  className?: string;
  durationMs?: number;
};

export function AnimatedCounter({
  value,
  className = "",
  durationMs = 700,
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return;
    }

    if (value === 0) {
      setDisplay(0);
      return;
    }

    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(value * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, durationMs]);

  if (typeof value === "string") {
    return <span className={className}>{value}</span>;
  }

  return <span className={className}>{display}</span>;
}

type AnimatedProgressBarProps = {
  percentage: number;
  className?: string;
  barClassName?: string;
  delayMs?: number;
};

export function AnimatedProgressBar({
  percentage,
  className = "h-2.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800",
  barClassName = "h-full rounded-full bg-zinc-900 dark:bg-zinc-100",
  delayMs = 0,
}: AnimatedProgressBarProps) {
  const width = `${Math.min(Math.max(percentage, 0), 100)}%`;

  return (
    <div className={className} role="presentation">
      <div
        className={`portfolio-bar-grow ${barClassName}`}
        style={{ width, animationDelay: `${delayMs}ms` }}
      />
    </div>
  );
}

export function FadeInSection({
  children,
  className = "",
  delayMs = 0,
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}) {
  return (
    <div
      className={`portfolio-fade-in ${className}`}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
}
