import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ChristmasTreeProps {
  status: "idle" | "staging" | "countdown" | "go" | "false-start";
  onCountdownComplete?: () => void;
}

export function ChristmasTree({ status, onCountdownComplete }: ChristmasTreeProps) {
  const [activeLights, setActiveLights] = useState<number[]>([]);
  const [greenLight, setGreenLight] = useState(false);
  const [redLight, setRedLight] = useState(false);

  useEffect(() => {
    if (status === "countdown") {
      setActiveLights([]);
      setGreenLight(false);
      setRedLight(false);
      
      const sequence = [
        { lights: [0], delay: 0 },
        { lights: [0, 1], delay: 400 },
        { lights: [0, 1, 2], delay: 800 },
        { lights: [], green: true, delay: 1200 },
      ];

      const timeouts: NodeJS.Timeout[] = [];
      
      sequence.forEach(({ lights, green, delay }) => {
        const timeout = setTimeout(() => {
          if (green) {
            setActiveLights([]);
            setGreenLight(true);
            onCountdownComplete?.();
          } else {
            setActiveLights(lights);
          }
        }, delay);
        timeouts.push(timeout);
      });

      return () => timeouts.forEach(clearTimeout);
    } else if (status === "false-start") {
      setRedLight(true);
      setGreenLight(false);
      setActiveLights([]);
    } else if (status === "go") {
      setGreenLight(true);
      setActiveLights([]);
    } else {
      setActiveLights([]);
      setGreenLight(false);
      setRedLight(false);
    }
  }, [status, onCountdownComplete]);

  const Light = ({ active, color }: { active: boolean; color: string }) => (
    <motion.div
      className={`w-6 h-6 rounded-full border-2 ${
        color === "amber" ? "border-amber-600" : 
        color === "green" ? "border-green-600" : "border-red-600"
      }`}
      animate={{
        backgroundColor: active 
          ? color === "amber" ? "#f59e0b" 
          : color === "green" ? "#22c55e" : "#ef4444"
          : "transparent",
        boxShadow: active 
          ? color === "amber" ? "0 0 20px 8px rgba(245, 158, 11, 0.6)" 
          : color === "green" ? "0 0 20px 8px rgba(34, 197, 94, 0.6)" 
          : "0 0 20px 8px rgba(239, 68, 68, 0.6)"
          : "none",
      }}
      transition={{ duration: 0.1 }}
    />
  );

  return (
    <div className="flex flex-col items-center gap-2 p-4 bg-zinc-900 rounded-lg border border-zinc-700">
      <div className="text-xs font-racing uppercase tracking-wider text-muted-foreground mb-2">
        Christmas Tree
      </div>
      
      <div className="flex gap-6">
        {[0, 1].map((lane) => (
          <div key={lane} className="flex flex-col items-center gap-2">
            <div className="text-[10px] uppercase text-muted-foreground font-medium">
              {lane === 0 ? "Left" : "Right"}
            </div>
            <div className="flex flex-col gap-2 p-2 bg-zinc-800 rounded">
              {[0, 1, 2].map((light) => (
                <Light 
                  key={light} 
                  active={activeLights.includes(light)} 
                  color="amber" 
                />
              ))}
              <Light active={greenLight} color="green" />
              <Light active={redLight} color="red" />
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {greenLight && !redLight && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mt-2 text-green-500 font-display font-bold text-lg tracking-wider"
          >
            GO!
          </motion.div>
        )}
        {redLight && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mt-2 text-red-500 font-display font-bold text-lg tracking-wider"
          >
            FALSE START
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
