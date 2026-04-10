import { useRace } from "@/lib/race-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Thermometer, AlertTriangle, CheckCircle, Clock, Gauge, RotateCcw, Flame, History } from "lucide-react";
import { raceTypeInfo } from "@shared/schema";
import type { DynoHealthStatus } from "@shared/schema";

function getStatusColor(status: DynoHealthStatus): string {
  switch (status) {
    case "optimal": return "text-green-500";
    case "warm": return "text-amber-500";
    case "hot": return "text-orange-500";
    case "critical": return "text-red-500";
  }
}

function getStatusBg(status: DynoHealthStatus): string {
  switch (status) {
    case "optimal": return "bg-green-500/20 border-green-500";
    case "warm": return "bg-amber-500/20 border-amber-500";
    case "hot": return "bg-orange-500/20 border-orange-500";
    case "critical": return "bg-red-500/20 border-red-500";
  }
}

function formatTime(timestamp: number | null): string {
  if (!timestamp) return "Never";
  const diff = Date.now() - timestamp;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
  return `${Math.floor(diff / 3600000)} hr ago`;
}

function formatElapsedTime(ms: number): string {
  const seconds = ms / 1000;
  return `${seconds.toFixed(3)}s`;
}

export default function DynoHealth() {
  const { dynoHealth, passLogs, resetDynoTemps } = useRace();
  
  const hasHotDyno = dynoHealth.some(d => d.status === "hot" || d.status === "critical");
  const totalPasses = dynoHealth.reduce((sum, d) => sum + d.passCount, 0);
  
  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Dyno Health Monitor</h1>
          <p className="text-muted-foreground">Track dynojet temperatures and facility pass logs</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline" className="gap-1">
            <History className="w-3 h-3" />
            {totalPasses} Total Passes
          </Badge>
          
          {hasHotDyno && (
            <Badge variant="outline" className="bg-red-500/20 border-red-500 text-red-500 gap-1 animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              Cooldown Recommended
            </Badge>
          )}
          
          <Button variant="outline" size="sm" onClick={resetDynoTemps} data-testid="button-reset-temps">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Temps
          </Button>
        </div>
      </div>
      
      {hasHotDyno && (
        <Card className="border-red-500/50 bg-red-500/10">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 bg-red-500/20 rounded-lg">
              <Flame className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold text-red-500">High Temperature Warning</h3>
              <p className="text-sm text-muted-foreground">
                One or more dynos are running hot. Allow them to cool before the next race to prevent damage.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid md:grid-cols-2 gap-6">
        {dynoHealth.map((dyno) => (
          <Card key={dyno.dynoId} className={`${getStatusBg(dyno.status)} border-2`}>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${dyno.status === "critical" ? "bg-red-500" : dyno.status === "hot" ? "bg-orange-500" : dyno.status === "warm" ? "bg-amber-500" : "bg-green-500"}`}>
                  <Thermometer className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">{dyno.dynoName}</CardTitle>
                  <p className="text-sm text-muted-foreground">Pass #{dyno.passCount}</p>
                </div>
              </div>
              
              <Badge variant="outline" className={getStatusBg(dyno.status)}>
                {dyno.status === "optimal" && <CheckCircle className="w-3 h-3 mr-1" />}
                {dyno.status === "warm" && <Thermometer className="w-3 h-3 mr-1" />}
                {(dyno.status === "hot" || dyno.status === "critical") && <AlertTriangle className="w-3 h-3 mr-1" />}
                {dyno.status.charAt(0).toUpperCase() + dyno.status.slice(1)}
              </Badge>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Temperature</span>
                  <span className={`font-mono font-bold text-xl ${getStatusColor(dyno.status)}`}>
                    {dyno.temperature.toFixed(0)}°F
                  </span>
                </div>
                
                <Progress 
                  value={Math.min(100, ((dyno.temperature - 85) / (200 - 85)) * 100)} 
                  className="h-3"
                />
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>85°F (Idle)</span>
                  <span>120°F</span>
                  <span>150°F</span>
                  <span>180°F+</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Last Pass</p>
                    <p className="font-medium text-sm">{formatTime(dyno.lastPassTime)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Peak Temp</p>
                    <p className="font-medium text-sm">{dyno.peakTemperature.toFixed(0)}°F</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Pass Log
            </CardTitle>
            <p className="text-sm text-muted-foreground">Recent race passes across all dynos</p>
          </div>
          
          <Badge variant="secondary">{passLogs.length} entries</Badge>
        </CardHeader>
        
        <CardContent>
          {passLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No passes recorded yet</p>
              <p className="text-sm">Complete a race to see pass logs here</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {passLogs.map((log) => (
                  <div 
                    key={log.id}
                    className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-muted/50 hover-elevate"
                    data-testid={`log-entry-${log.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono">
                        {log.dynoId === "dyno1" ? "D1" : "D2"}
                      </Badge>
                      <div>
                        <p className="font-medium">{log.carName}</p>
                        <p className="text-xs text-muted-foreground">
                          {raceTypeInfo[log.raceType]?.label || log.raceType}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="text-right">
                        <p className="font-mono font-bold">{formatElapsedTime(log.elapsedTimeMs)}</p>
                        <p className="text-xs text-muted-foreground">ET</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-mono font-bold">{log.topSpeedMph.toFixed(1)} mph</p>
                        <p className="text-xs text-muted-foreground">Top Speed</p>
                      </div>
                      
                      <div className="text-right">
                        <p className={`font-mono font-bold ${log.temperatureAfter >= 180 ? "text-red-500" : log.temperatureAfter >= 150 ? "text-orange-500" : log.temperatureAfter >= 120 ? "text-amber-500" : "text-green-500"}`}>
                          {log.temperatureAfter.toFixed(0)}°F
                        </p>
                        <p className="text-xs text-muted-foreground">Temp After</p>
                      </div>
                      
                      <div className="text-right text-muted-foreground">
                        <p className="text-xs">{formatTime(log.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
