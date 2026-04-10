import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRace } from "@/lib/race-context";
import { raceTypeInfo } from "@shared/schema";
import { motion } from "framer-motion";
import { 
  Maximize, Minimize, Home, Flag, Timer, Gauge, 
  Activity, Zap, ArrowUp, Trophy, AlertTriangle 
} from "lucide-react";

function MonitorSpeedometer({ speed, maxSpeed = 200, color = "#ef4444", label }: { 
  speed: number; 
  maxSpeed?: number; 
  color?: string;
  label: string;
}) {
  const percentage = Math.min(speed / maxSpeed, 1);
  const rotation = -135 + (percentage * 270);

  return (
    <div className="relative flex flex-col items-center">
      <div className="w-80 h-80 xl:w-96 xl:h-96 2xl:w-[28rem] 2xl:h-[28rem] relative flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-zinc-800"
            strokeDasharray="212"
            strokeDashoffset="53"
            transform="rotate(135 50 50)"
            strokeLinecap="round"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray="212"
            strokeDashoffset={212 - (percentage * 159)}
            transform="rotate(135 50 50)"
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 12px ${color})` }}
          />
          <motion.line
            x1="50"
            y1="50"
            x2="50"
            y2="18"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            animate={{ rotate: rotation }}
            style={{ transformOrigin: "50px 50px" }}
            transition={{ type: "spring", stiffness: 80, damping: 12 }}
          />
          <circle cx="50" cy="50" r="5" fill={color} />
        </svg>
        
        <div className="flex flex-col items-center z-10">
          <motion.span 
            className="text-7xl xl:text-8xl 2xl:text-9xl font-display font-bold tabular-nums"
            style={{ color, textShadow: `0 0 30px ${color}40` }}
          >
            {Math.round(speed)}
          </motion.span>
          <span className="text-xl xl:text-2xl uppercase tracking-widest text-zinc-400 font-medium">MPH</span>
        </div>
      </div>
      <div className="text-2xl xl:text-3xl font-display font-bold uppercase tracking-wider mt-4" style={{ color }}>
        {label}
      </div>
    </div>
  );
}

function LargeMetricCard({ icon: Icon, label, value, unit, color = "text-foreground" }: {
  icon: typeof Gauge;
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
}) {
  return (
    <div className="flex flex-col items-center p-4 xl:p-6 bg-zinc-900/50 rounded-lg border border-zinc-800">
      <Icon className="w-6 h-6 xl:w-8 xl:h-8 text-zinc-500 mb-2" />
      <span className="text-sm xl:text-base uppercase tracking-wider text-zinc-500 mb-1">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl xl:text-4xl 2xl:text-5xl font-display font-bold tabular-nums ${color}`}>
          {value}
        </span>
        {unit && <span className="text-lg xl:text-xl text-zinc-500">{unit}</span>}
      </div>
    </div>
  );
}

function ProgressBar({ leftDistance, rightDistance, totalDistance, leftColor, rightColor }: {
  leftDistance: number;
  rightDistance: number;
  totalDistance: number;
  leftColor: string;
  rightColor: string;
}) {
  const leftPct = Math.min((leftDistance / totalDistance) * 100, 100);
  const rightPct = Math.min((rightDistance / totalDistance) * 100, 100);

  return (
    <div className="w-full bg-zinc-900 rounded-lg p-4 xl:p-6 border border-zinc-800">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm xl:text-base uppercase tracking-wider text-zinc-500">Race Progress</span>
        <span className="text-sm xl:text-base text-zinc-400 font-mono">{totalDistance.toLocaleString()} ft</span>
      </div>
      <div className="relative h-8 xl:h-10 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div 
          className="absolute top-0 left-0 h-1/2 rounded-tl-full"
          style={{ backgroundColor: leftColor, width: `${leftPct}%` }}
          animate={{ width: `${leftPct}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        />
        <motion.div 
          className="absolute bottom-0 left-0 h-1/2 rounded-bl-full"
          style={{ backgroundColor: rightColor, width: `${rightPct}%` }}
          animate={{ width: `${rightPct}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        />
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50" />
      </div>
      <div className="flex justify-between mt-2 text-xs xl:text-sm text-zinc-500">
        <span>Start</span>
        <span>1/4</span>
        <span>1/2</span>
        <span>3/4</span>
        <span>Finish</span>
      </div>
    </div>
  );
}

export default function Monitor() {
  const [, setLocation] = useLocation();
  const { currentRace, cars, dynoHealth } = useRace();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentRace?.status === "racing" && currentRace.startTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - currentRace.startTime!);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [currentRace?.status, currentRace?.startTime]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    timeout = setTimeout(() => setShowControls(false), 3000);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const leftParticipant = currentRace?.participants[0];
  const rightParticipant = currentRace?.participants[1];
  const leftCar = leftParticipant?.car || cars.find(c => c.id === leftParticipant?.carId);
  const rightCar = rightParticipant?.car || cars.find(c => c.id === rightParticipant?.carId);
  
  const leftTelemetry = currentRace?.telemetry[leftParticipant?.carId || ""] || [];
  const rightTelemetry = currentRace?.telemetry[rightParticipant?.carId || ""] || [];
  
  const leftLatest = leftTelemetry[leftTelemetry.length - 1] || { mph: 0, rpm: 0, gear: 0, distanceFt: 0 };
  const rightLatest = rightTelemetry[rightTelemetry.length - 1] || { mph: 0, rpm: 0, gear: 0, distanceFt: 0 };

  const raceInfo = currentRace ? raceTypeInfo[currentRace.raceType] : null;
  const totalDistance = raceInfo?.distanceFt || 1320;

  const leader = leftLatest.distanceFt > rightLatest.distanceFt 
    ? leftCar?.name 
    : rightLatest.distanceFt > leftLatest.distanceFt 
    ? rightCar?.name 
    : null;

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${seconds}.${milliseconds.toString().padStart(2, "0")}`;
  };

  const hasHotDyno = dynoHealth.some(d => d.status === "hot" || d.status === "critical");

  if (!currentRace) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-8">
        <Gauge className="w-24 h-24 text-zinc-600 mb-8" />
        <h1 className="text-4xl xl:text-6xl font-display font-bold mb-4">Race Monitor</h1>
        <p className="text-xl xl:text-2xl text-zinc-500 mb-8">Waiting for race to start...</p>
        <Button variant="outline" onClick={() => setLocation("/")} data-testid="button-monitor-home">
          <Home className="w-5 h-5 mr-2" />
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <motion.div 
        className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4"
        animate={{ opacity: showControls ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-lg xl:text-xl px-4 py-2 font-display uppercase tracking-wider">
              <Flag className="w-5 h-5 mr-2" />
              {raceInfo?.label}
            </Badge>
            
            {currentRace.status === "racing" && (
              <Badge className="text-lg xl:text-xl px-4 py-2 bg-green-500/20 text-green-500 border-green-500/30 animate-pulse">
                <Activity className="w-5 h-5 mr-2" />
                LIVE
              </Badge>
            )}
            
            {hasHotDyno && (
              <Badge variant="destructive" className="text-lg xl:text-xl px-4 py-2 animate-pulse">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Dyno Hot
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/")} data-testid="button-monitor-exit">
              <Home className="w-6 h-6" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleFullscreen} data-testid="button-fullscreen">
              {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="h-screen flex flex-col p-4 xl:p-8 pt-20">
        <div className="flex-1 grid grid-cols-3 gap-4 xl:gap-8">
          <div className="flex flex-col items-center justify-center space-y-6">
            <MonitorSpeedometer 
              speed={leftLatest.mph} 
              color={leftCar?.color || "#ef4444"} 
              label={leftCar?.name || "Lane 1"}
            />
            
            <div className="grid grid-cols-2 gap-3 xl:gap-4 w-full max-w-md">
              <LargeMetricCard 
                icon={Activity} 
                label="RPM" 
                value={Math.round(leftLatest.rpm).toLocaleString()} 
                color="text-amber-500"
              />
              <LargeMetricCard 
                icon={Zap} 
                label="Gear" 
                value={leftLatest.gear || "N"} 
                color="text-blue-500"
              />
              <LargeMetricCard 
                icon={ArrowUp} 
                label="Distance" 
                value={Math.round(leftLatest.distanceFt).toLocaleString()} 
                unit="ft"
              />
              <LargeMetricCard 
                icon={Gauge} 
                label="Dyno" 
                value={`${dynoHealth[0]?.temperature.toFixed(0) || 85}°F`}
                color={dynoHealth[0]?.status === "hot" || dynoHealth[0]?.status === "critical" ? "text-orange-500" : "text-green-500"}
              />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center space-y-8">
            {currentRace.status === "racing" || currentRace.status === "complete" ? (
              <>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Timer className="w-8 h-8 xl:w-10 xl:h-10 text-zinc-500" />
                    <span className="text-lg xl:text-xl uppercase tracking-wider text-zinc-500">Elapsed Time</span>
                  </div>
                  <motion.div 
                    className="text-6xl xl:text-7xl 2xl:text-8xl font-display font-bold tabular-nums text-white"
                    style={{ textShadow: "0 0 30px rgba(255,255,255,0.3)" }}
                  >
                    {formatTime(elapsedTime)}
                  </motion.div>
                  <span className="text-xl xl:text-2xl text-zinc-500">seconds</span>
                </div>

                {leader && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <Trophy className="w-6 h-6 xl:w-8 xl:h-8 text-yellow-500" />
                      <span className="text-lg xl:text-xl uppercase tracking-wider text-zinc-500">Leader</span>
                    </div>
                    <div className="text-3xl xl:text-4xl font-display font-bold text-yellow-500">
                      {leader}
                    </div>
                  </div>
                )}

                {currentRace.status === "complete" && currentRace.winner && (
                  <motion.div 
                    className="text-center p-6 xl:p-8 bg-yellow-500/10 rounded-lg border border-yellow-500/30"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 100 }}
                  >
                    <Trophy className="w-12 h-12 xl:w-16 xl:h-16 text-yellow-500 mx-auto mb-4" />
                    <div className="text-2xl xl:text-3xl uppercase tracking-wider text-yellow-500 mb-2">Winner</div>
                    <div className="text-4xl xl:text-5xl font-display font-bold text-white">
                      {currentRace.winner === leftParticipant?.carId ? leftCar?.name : rightCar?.name}
                    </div>
                  </motion.div>
                )}
              </>
            ) : (
              <div className="text-center">
                <div className="text-4xl xl:text-6xl font-display font-bold text-zinc-500 uppercase tracking-wider">
                  {currentRace.status === "staging" ? "Staging" : 
                   currentRace.status === "countdown" ? "Get Ready" : 
                   "Preparing"}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-center space-y-6">
            <MonitorSpeedometer 
              speed={rightLatest.mph} 
              color={rightCar?.color || "#3b82f6"} 
              label={rightCar?.name || "Lane 2"}
            />
            
            <div className="grid grid-cols-2 gap-3 xl:gap-4 w-full max-w-md">
              <LargeMetricCard 
                icon={Activity} 
                label="RPM" 
                value={Math.round(rightLatest.rpm).toLocaleString()} 
                color="text-amber-500"
              />
              <LargeMetricCard 
                icon={Zap} 
                label="Gear" 
                value={rightLatest.gear || "N"} 
                color="text-blue-500"
              />
              <LargeMetricCard 
                icon={ArrowUp} 
                label="Distance" 
                value={Math.round(rightLatest.distanceFt).toLocaleString()} 
                unit="ft"
              />
              <LargeMetricCard 
                icon={Gauge} 
                label="Dyno" 
                value={`${dynoHealth[1]?.temperature.toFixed(0) || 85}°F`}
                color={dynoHealth[1]?.status === "hot" || dynoHealth[1]?.status === "critical" ? "text-orange-500" : "text-green-500"}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 xl:mt-8">
          <ProgressBar 
            leftDistance={leftLatest.distanceFt}
            rightDistance={rightLatest.distanceFt}
            totalDistance={totalDistance}
            leftColor={leftCar?.color || "#ef4444"}
            rightColor={rightCar?.color || "#3b82f6"}
          />
        </div>
      </div>
    </div>
  );
}
