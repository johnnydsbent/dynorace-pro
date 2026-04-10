import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DynoMachine, Car } from "@shared/schema";
import { Wifi, WifiOff, Settings } from "lucide-react";

interface DynoStatusProps {
  machine: DynoMachine;
  car: Car | null;
  lane: "left" | "right";
}

export function DynoStatus({ machine, car, lane }: DynoStatusProps) {
  const statusColors = {
    connected: "bg-green-500/20 text-green-500 border-green-500/30",
    disconnected: "bg-red-500/20 text-red-500 border-red-500/30",
    calibrating: "bg-amber-500/20 text-amber-500 border-amber-500/30",
  };

  const StatusIcon = machine.status === "connected" ? Wifi : 
                     machine.status === "disconnected" ? WifiOff : Settings;

  return (
    <Card className={`${lane === "left" ? "border-l-4 border-l-red-500" : "border-l-4 border-l-blue-500"}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg font-racing">{machine.name}</CardTitle>
          <Badge variant="outline" className={statusColors[machine.status]}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {machine.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {car ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: car.color }}
              />
              <div>
                <div className="font-semibold">{car.name}</div>
                <div className="text-sm text-muted-foreground">{car.makeModel}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-muted/50 rounded p-2">
                <div className="text-muted-foreground text-xs">Power</div>
                <div className="font-mono font-semibold">{car.horsepower} HP</div>
              </div>
              <div className="bg-muted/50 rounded p-2">
                <div className="text-muted-foreground text-xs">Weight</div>
                <div className="font-mono font-semibold">{car.weight.toLocaleString()} lbs</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No car loaded
          </div>
        )}
      </CardContent>
    </Card>
  );
}
