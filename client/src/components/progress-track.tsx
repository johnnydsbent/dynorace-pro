import { motion } from "framer-motion";

interface ProgressTrackProps {
  leftProgress: number;
  rightProgress: number;
  totalDistance: number;
  leftColor?: string;
  rightColor?: string;
}

export function ProgressTrack({ 
  leftProgress, 
  rightProgress, 
  totalDistance,
  leftColor = "#ef4444",
  rightColor = "#3b82f6"
}: ProgressTrackProps) {
  const leftPercent = Math.min((leftProgress / totalDistance) * 100, 100);
  const rightPercent = Math.min((rightProgress / totalDistance) * 100, 100);

  const markers = [
    { position: 0, label: "Start" },
    { position: 60 / totalDistance * 100, label: "60ft" },
    { position: 330 / totalDistance * 100, label: "330ft" },
    { position: 660 / totalDistance * 100, label: "660ft" },
    { position: 100, label: "Finish" },
  ].filter(m => m.position <= 100);

  return (
    <div className="w-full bg-zinc-900 rounded-lg p-4 border border-zinc-800">
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-4 font-medium">
        Track Position
      </div>
      
      <div className="relative h-16">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-1 bg-zinc-700 rounded-full relative">
            {markers.map((marker, i) => (
              <div 
                key={i}
                className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
                style={{ left: `${marker.position}%` }}
              >
                <div className="w-0.5 h-4 bg-zinc-600" />
                <span className="text-[10px] text-muted-foreground mt-1 whitespace-nowrap">
                  {marker.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute top-1 left-0 right-0">
          <motion.div
            className="absolute w-4 h-4 rounded-full flex items-center justify-center"
            style={{ 
              backgroundColor: leftColor,
              boxShadow: `0 0 12px ${leftColor}`,
              left: `calc(${leftPercent}% - 8px)`,
            }}
            animate={{ left: `calc(${leftPercent}% - 8px)` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            <span className="text-[8px] font-bold text-white">1</span>
          </motion.div>
        </div>

        <div className="absolute bottom-1 left-0 right-0">
          <motion.div
            className="absolute w-4 h-4 rounded-full flex items-center justify-center"
            style={{ 
              backgroundColor: rightColor,
              boxShadow: `0 0 12px ${rightColor}`,
            }}
            animate={{ left: `calc(${rightPercent}% - 8px)` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            <span className="text-[8px] font-bold text-white">2</span>
          </motion.div>
        </div>
      </div>

      <div className="flex justify-between mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: leftColor }} />
          <span className="text-muted-foreground">{Math.round(leftProgress)} ft</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: rightColor }} />
          <span className="text-muted-foreground">{Math.round(rightProgress)} ft</span>
        </div>
      </div>
    </div>
  );
}
