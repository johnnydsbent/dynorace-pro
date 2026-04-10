import { Badge } from "@/components/ui/badge";
import { raceTypeInfo, type RaceType, type RaceStatus } from "@shared/schema";
import { Timer, Flag, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface LiveMetricsBarProps {
  raceType: RaceType;
  status: RaceStatus;
  elapsedTime: number;
  leader: string | null;
}

export function LiveMetricsBar({ raceType, status, elapsedTime, leader }: LiveMetricsBarProps) {
  const info = raceTypeInfo[raceType];
  
  const statusColors = {
    setup: "bg-muted text-muted-foreground",
    staging: "bg-amber-500/20 text-amber-500 border-amber-500/30",
    countdown: "bg-amber-500/20 text-amber-500 border-amber-500/30",
    racing: "bg-green-500/20 text-green-500 border-green-500/30",
    complete: "bg-blue-500/20 text-blue-500 border-blue-500/30",
  };

  const statusLabels = {
    setup: "Setting Up",
    staging: "Staging",
    countdown: "Countdown",
    racing: "Racing",
    complete: "Complete",
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${seconds}.${milliseconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-3">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="font-racing uppercase tracking-wider">
            <Flag className="w-3 h-3 mr-1" />
            {info.label}
          </Badge>
          <Badge variant="outline" className={statusColors[status]}>
            {status === "racing" ? (
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                {statusLabels[status]}
              </motion.span>
            ) : (
              statusLabels[status]
            )}
          </Badge>
        </div>

        <div className="flex items-center gap-6">
          {status === "racing" || status === "complete" ? (
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-muted-foreground" />
              <span className="font-display text-xl font-bold tabular-nums">
                {formatTime(elapsedTime)}
              </span>
              <span className="text-xs text-muted-foreground">sec</span>
            </div>
          ) : null}

          {leader && (status === "racing" || status === "complete") && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground uppercase">Leader:</span>
              <span className="font-racing font-semibold">{leader}</span>
            </div>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          <span className="font-mono">{info.distanceFt.toLocaleString()}</span> ft race
        </div>
      </div>
    </div>
  );
}
