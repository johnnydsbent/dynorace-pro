import { useEffect, useState } from "react";
import { Gauge } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const start = Date.now();
    const duration = 1600;

    const frame = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);
      if (pct < 100) {
        requestAnimationFrame(frame);
      } else {
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(onComplete, 400);
        }, 100);
      }
    };

    requestAnimationFrame(frame);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-zinc-950 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
      style={{ transition: "opacity 0.4s ease-out" }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative flex flex-col items-center gap-8 px-8 text-center">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/20 scale-150" style={{ animationDuration: "1.5s" }} />
          <div className="relative p-5 bg-primary rounded-2xl shadow-2xl shadow-primary/30">
            <Gauge className="w-14 h-14 text-primary-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-5xl font-display font-bold tracking-tight text-white">
            DynoRace Pro
          </h1>
          <p className="text-zinc-400 text-lg tracking-widest uppercase font-light">
            Virtual Drag Racing
          </p>
        </div>

        <div className="w-72 space-y-2">
          <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-red-500 rounded-full transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-zinc-600 font-mono tracking-wider uppercase">
            {progress < 30
              ? "Initializing dynos..."
              : progress < 60
              ? "Loading garage..."
              : progress < 90
              ? "Calibrating sensors..."
              : "Ready to race"}
          </p>
        </div>

        <div className="flex gap-6 text-xs text-zinc-700 font-mono tracking-wider">
          <span>DYNOJET SIMULATION</span>
          <span>·</span>
          <span>OBD-II READY</span>
          <span>·</span>
          <span>PRO TIMING</span>
        </div>
      </div>
    </div>
  );
}
