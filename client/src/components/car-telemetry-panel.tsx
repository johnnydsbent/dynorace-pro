import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Speedometer } from "./speedometer";
import type { Car, TelemetrySample } from "@shared/schema";
import { motion } from "framer-motion";

interface CarTelemetryPanelProps {
  car: Car;
  telemetry: TelemetrySample | null;
  lane: "left" | "right";
  isLeading?: boolean;
  reactionTime?: number | null;
}

export function CarTelemetryPanel({ car, telemetry, lane, isLeading, reactionTime }: CarTelemetryPanelProps) {
  const speed = telemetry?.mph ?? 0;
  const rpm = telemetry?.rpm ?? 0;
  const gear = telemetry?.gear ?? 0;
  const distance = telemetry?.distanceFt ?? 0;

  const laneColor = lane === "left" ? car.color || "#ef4444" : car.color || "#3b82f6";

  return (
    <Card className="relative overflow-visible">
      {isLeading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-3 left-1/2 -translate-x-1/2 z-10"
        >
          <Badge className="bg-green-500 text-white font-racing uppercase tracking-wider">
            Leading
          </Badge>
        </motion.div>
      )}
      
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: laneColor }}
            />
            <div>
              <h3 className="font-racing font-bold text-lg">{car.name}</h3>
              <p className="text-xs text-muted-foreground">{car.makeModel}</p>
            </div>
          </div>
          <Badge variant="outline" className="font-mono">
            Lane {lane === "left" ? "1" : "2"}
          </Badge>
        </div>

        <div className="flex justify-center mb-6">
          <Speedometer speed={speed} color={laneColor} size="lg" />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-zinc-900 rounded-lg p-3 text-center">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">RPM</div>
            <div className="font-display text-xl font-bold" style={{ color: laneColor }}>
              {rpm.toLocaleString()}
            </div>
          </div>
          <div className="bg-zinc-900 rounded-lg p-3 text-center">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Gear</div>
            <div className="font-display text-xl font-bold" style={{ color: laneColor }}>
              {gear === 0 ? "N" : gear}
            </div>
          </div>
          <div className="bg-zinc-900 rounded-lg p-3 text-center">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Distance</div>
            <div className="font-display text-xl font-bold" style={{ color: laneColor }}>
              {Math.round(distance)}
              <span className="text-xs text-muted-foreground ml-1">ft</span>
            </div>
          </div>
        </div>

        {reactionTime !== null && reactionTime !== undefined && (
          <div className="bg-zinc-900 rounded-lg p-3 text-center">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Reaction Time</div>
            <div className="font-display text-2xl font-bold" style={{ color: laneColor }}>
              {reactionTime.toFixed(3)}
              <span className="text-xs text-muted-foreground ml-1">sec</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
