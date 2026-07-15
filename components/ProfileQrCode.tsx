"use client";

import { useEffect, useRef } from "react";

type ProfileQrCodeProps = {
  url: string;
  label?: string;
};

export function ProfileQrCode({ url, label = "Scan to view profile" }: ProfileQrCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function renderQrCode() {
      if (!canvasRef.current || !url) {
        return;
      }

      try {
        const QRCode = (await import("qrcode")).default;
        if (cancelled) {
          return;
        }

        await QRCode.toCanvas(canvasRef.current, url, {
          width: 168,
          margin: 1,
          color: {
            dark: "#18181b",
            light: "#ffffff",
          },
        });
      } catch {
        const context = canvasRef.current?.getContext("2d");
        if (context && canvasRef.current) {
          context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
    }

    void renderQrCode();

    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <canvas
        ref={canvasRef}
        width={168}
        height={168}
        className="rounded-lg border border-zinc-200 dark:border-zinc-800"
        aria-label={label}
      />
      <div className="space-y-1 text-center">
        <p className="text-sm font-medium">{label}</p>
        <p className="max-w-[14rem] break-all text-xs text-zinc-500 dark:text-zinc-400">
          {url}
        </p>
      </div>
    </div>
  );
}
