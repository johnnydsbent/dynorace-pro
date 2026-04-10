import { motion } from "framer-motion";
import { Trophy, Zap } from "lucide-react";
import type { Car, RaceResult } from "@shared/schema";

interface WinnerHeroProps {
  winner: Car;
  result: RaceResult;
  loserResult: RaceResult;
}

export function WinnerHero({ winner, result, loserResult }: WinnerHeroProps) {
  const margin = Math.abs(result.elapsedTimeMs - loserResult.elapsedTimeMs);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500/20 via-amber-600/10 to-transparent border border-amber-500/30 p-8"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative flex items-center justify-between gap-8 flex-wrap">
        <div className="flex items-center gap-6">
          <motion.div
            initial={{ rotate: -20, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="p-4 bg-amber-500 rounded-xl"
          >
            <Trophy className="w-12 h-12 text-white" />
          </motion.div>
          
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-sm uppercase tracking-wider text-amber-500 font-semibold mb-1"
            >
              Winner
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-display font-bold"
            >
              {winner.name}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground"
            >
              {winner.makeModel}
            </motion.p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="flex gap-8"
        >
          <div className="text-center">
            <div className="text-sm uppercase tracking-wider text-muted-foreground mb-1">
              Elapsed Time
            </div>
            <div className="text-3xl font-display font-bold text-amber-500 tabular-nums">
              {(result.elapsedTimeMs / 1000).toFixed(3)}
              <span className="text-lg text-muted-foreground ml-1">sec</span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm uppercase tracking-wider text-muted-foreground mb-1">
              Margin of Victory
            </div>
            <div className="text-3xl font-display font-bold text-green-500 tabular-nums">
              +{(margin / 1000).toFixed(3)}
              <span className="text-lg text-muted-foreground ml-1">sec</span>
            </div>
          </div>

          <div className="text-center">
            <div className="text-sm uppercase tracking-wider text-muted-foreground mb-1">
              Top Speed
            </div>
            <div className="text-3xl font-display font-bold tabular-nums">
              {result.topSpeedMph.toFixed(1)}
              <span className="text-lg text-muted-foreground ml-1">mph</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
