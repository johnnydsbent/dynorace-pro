import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { raceTypeInfo, type RaceType } from "@shared/schema";
import { Zap, Play, Gauge, Timer } from "lucide-react";

interface RaceTypeSelectorProps {
  selected: RaceType | null;
  onSelect: (type: RaceType) => void;
}

const icons: Record<RaceType, typeof Zap> = {
  dig: Zap,
  roll: Play,
  eighth: Gauge,
  half: Timer,
};

export function RaceTypeSelector({ selected, onSelect }: RaceTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {(Object.entries(raceTypeInfo) as [RaceType, typeof raceTypeInfo.dig][]).map(([type, info]) => {
        const Icon = icons[type];
        const isSelected = selected === type;
        
        return (
          <Card
            key={type}
            className={`cursor-pointer transition-all duration-200 hover-elevate ${
              isSelected 
                ? "ring-2 ring-primary bg-primary/5" 
                : "hover:bg-accent/50"
            }`}
            onClick={() => onSelect(type)}
            data-testid={`card-race-type-${type}`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <Badge variant={isSelected ? "default" : "secondary"} className="text-xs">
                  {info.distance}
                </Badge>
              </div>
              
              <h3 className="font-racing font-bold text-xl mb-1">{info.label}</h3>
              <p className="text-sm text-muted-foreground">{info.description}</p>
              
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Distance</span>
                  <span className="font-mono font-semibold">{info.distanceFt.toLocaleString()} ft</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
