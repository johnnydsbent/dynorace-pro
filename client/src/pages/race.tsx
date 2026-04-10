import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChristmasTree } from "@/components/christmas-tree";
import { CarTelemetryPanel } from "@/components/car-telemetry-panel";
import { ProgressTrack } from "@/components/progress-track";
import { LiveMetricsBar } from "@/components/live-metrics-bar";
import { useRace } from "@/lib/race-context";
import { useToast } from "@/hooks/use-toast";
import { obdService } from "@/lib/obd-service";
import { raceTypeInfo } from "@shared/schema";
import type { TelemetrySample, RaceResult } from "@shared/schema";
import { Play, Square, Bluetooth, Car } from "lucide-react";

function simulateRace(
  horsepower: number,
  weight: number,
  targetDistance: number,
  isRoll: boolean,
  rollSpeed: number,
  onTelemetry: (sample: TelemetrySample) => void,
  onComplete: (result: Partial<RaceResult>) => void
): () => void {
  let timestamp = 0;
  let speed = isRoll ? rollSpeed : 0;
  let distance = 0;
  let rpm = isRoll ? (2500 + rollSpeed * 50) : 1000;
  let gear = isRoll ? (rollSpeed >= 50 ? 3 : 2) : 1;
  const reactionTime = 0.1 + Math.random() * 0.3;
  
  const powerToWeight = horsepower / (weight / 1000);
  const baseAcceleration = powerToWeight * 0.08;
  
  let zeroTo60Time: number | null = null;
  let sixtyFtTime: number | null = null;
  let threeThirtyFtTime: number | null = null;
  let sixSixtyFtTime: number | null = null;
  let topSpeed = speed;
  
  const interval = setInterval(() => {
    timestamp += 50;
    
    const randomFactor = 0.95 + Math.random() * 0.1;
    const dragCoefficient = 0.0005;
    const drag = speed * speed * dragCoefficient;
    
    const effectiveAcceleration = Math.max(0, (baseAcceleration * randomFactor) - drag);
    speed += effectiveAcceleration * 0.05;
    
    if (speed > topSpeed) topSpeed = speed;
    
    distance += (speed * 5280 / 3600) * 0.05;
    
    rpm = Math.min(7500, 2000 + (speed * 40) + Math.random() * 200);
    
    if (rpm > 6800 && gear < 6) {
      gear++;
      rpm = 4000;
    }
    
    if (zeroTo60Time === null && speed >= 60) {
      zeroTo60Time = timestamp;
    }
    if (sixtyFtTime === null && distance >= 60) {
      sixtyFtTime = timestamp;
    }
    if (threeThirtyFtTime === null && distance >= 330) {
      threeThirtyFtTime = timestamp;
    }
    if (sixSixtyFtTime === null && distance >= 660) {
      sixSixtyFtTime = timestamp;
    }
    
    onTelemetry({
      timestamp,
      mph: speed,
      rpm,
      gear,
      distanceFt: distance,
      throttlePct: 95 + Math.random() * 5,
    });
    
    if (distance >= targetDistance) {
      clearInterval(interval);
      onComplete({
        reactionTimeMs: reactionTime * 1000,
        zeroTo60Ms: zeroTo60Time ?? timestamp,
        sixtyFtMs: sixtyFtTime ?? timestamp,
        threeThirtyFtMs: threeThirtyFtTime ?? timestamp,
        sixSixtyFtMs: sixSixtyFtTime ?? timestamp,
        elapsedTimeMs: timestamp,
        trapSpeedMph: speed,
        topSpeedMph: topSpeed,
        distanceFt: distance,
        falseStart: false,
      });
    }
  }, 50);
  
  return () => clearInterval(interval);
}

export default function Race() {
  const [, setLocation] = useLocation();
  const { currentRace, cars, updateRaceStatus, updateTelemetry, completeRace, resetRace, dataSource, obdConnected, setObdConnected, setDataSource } = useRace();
  const { toast } = useToast();
  const [treeStatus, setTreeStatus] = useState<"idle" | "staging" | "countdown" | "go" | "false-start">("idle");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [leftTelemetry, setLeftTelemetry] = useState<TelemetrySample | null>(null);
  const [rightTelemetry, setRightTelemetry] = useState<TelemetrySample | null>(null);
  const [leftReaction, setLeftReaction] = useState<number | null>(null);
  const [rightReaction, setRightReaction] = useState<number | null>(null);
  const [leftAtRollSpeed, setLeftAtRollSpeed] = useState(false);
  const [rightAtRollSpeed, setRightAtRollSpeed] = useState(false);
  
  const raceStartTimeRef = useRef<number | null>(null);
  const cleanupRef = useRef<(() => void)[]>([]);
  const resultsRef = useRef<{ left: Partial<RaceResult> | null; right: Partial<RaceResult> | null }>({
    left: null,
    right: null,
  });
  const obdDataRef = useRef<{
    startTime: number | null;
    distance: number;
    topSpeed: number;
    zeroTo60Time: number | null;
    sixtyFtTime: number | null;
    threeThirtyFtTime: number | null;
    sixSixtyFtTime: number | null;
    lastSpeed: number;
    lastTimestamp: number;
  }>({
    startTime: null,
    distance: 0,
    topSpeed: 0,
    zeroTo60Time: null,
    sixtyFtTime: null,
    threeThirtyFtTime: null,
    sixSixtyFtTime: null,
    lastSpeed: 0,
    lastTimestamp: 0,
  });
  
  const isUsingOBD = dataSource === "obd" && obdConnected;
  
  const cleanupAllSubscriptions = useCallback(() => {
    cleanupRef.current.forEach(fn => fn());
    cleanupRef.current = [];
  }, []);
  
  useEffect(() => {
    return () => {
      cleanupAllSubscriptions();
    };
  }, [cleanupAllSubscriptions]);

  useEffect(() => {
    if (!currentRace) {
      setLocation("/");
    }
  }, [currentRace, setLocation]);

  useEffect(() => {
    if (!currentRace) return;
    
    const isRoll = currentRace.raceType === "roll";
    
    if (currentRace.status === "setup") {
      setLeftAtRollSpeed(false);
      setRightAtRollSpeed(false);
    }
    
    if (!isRoll) {
      setLeftAtRollSpeed(true);
      setRightAtRollSpeed(true);
      return;
    }
    
    const rollSpeedTarget = currentRace.rollSpeed || 40;
    
    if (!isUsingOBD) {
      setLeftAtRollSpeed(true);
      setRightAtRollSpeed(true);
      return;
    }
    
    setRightAtRollSpeed(true);
    
    if (currentRace.status === "staging" || currentRace.status === "countdown") {
      const checkInterval = setInterval(() => {
        if (leftTelemetry && leftTelemetry.mph >= rollSpeedTarget - 2) {
          setLeftAtRollSpeed(true);
        } else if (leftTelemetry && leftTelemetry.mph < rollSpeedTarget - 5) {
          setLeftAtRollSpeed(false);
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }
  }, [currentRace, isUsingOBD, leftTelemetry]);

  useEffect(() => {
    if (currentRace?.status === "racing" && raceStartTimeRef.current) {
      const interval = setInterval(() => {
        setElapsedTime(Date.now() - raceStartTimeRef.current!);
      }, 10);
      return () => clearInterval(interval);
    }
  }, [currentRace?.status]);

  const handleStartSequence = useCallback(() => {
    if (!currentRace) return;
    
    updateRaceStatus("staging");
    setTreeStatus("staging");
    
    setTimeout(() => {
      setTreeStatus("countdown");
      updateRaceStatus("countdown");
    }, 1000);
  }, [currentRace, updateRaceStatus]);

  const handleCountdownComplete = useCallback(() => {
    if (!currentRace) return;
    
    setTreeStatus("go");
    updateRaceStatus("racing");
    raceStartTimeRef.current = Date.now();
    
    const leftParticipant = currentRace.participants[0];
    const rightParticipant = currentRace.participants[1];
    const leftCar = leftParticipant?.car || cars.find(c => c.id === leftParticipant?.carId);
    const rightCar = rightParticipant?.car || cars.find(c => c.id === rightParticipant?.carId);
    const targetDistance = raceTypeInfo[currentRace.raceType].distanceFt;
    const isRoll = currentRace.raceType === "roll";
    const rollSpeedValue = currentRace.rollSpeed || 40;
    
    if (isUsingOBD) {
      obdDataRef.current = {
        startTime: Date.now(),
        distance: 0,
        topSpeed: isRoll ? rollSpeedValue : 0,
        zeroTo60Time: null,
        sixtyFtTime: null,
        threeThirtyFtTime: null,
        sixSixtyFtTime: null,
        lastSpeed: isRoll ? rollSpeedValue : 0,
        lastTimestamp: Date.now(),
      };
      
      const reactionTime = 0.15 + Math.random() * 0.1;
      setLeftReaction(reactionTime);
      
      let obdRaceCompleted = false;
      
      const unsubscribe = obdService.onTelemetry((obdTelemetry) => {
        if (obdRaceCompleted) return;
        
        const now = Date.now();
        const elapsed = now - (obdDataRef.current.startTime || now);
        const deltaTime = (now - obdDataRef.current.lastTimestamp) / 1000;
        
        const avgSpeed = (obdTelemetry.mph + obdDataRef.current.lastSpeed) / 2;
        const distanceIncrement = (avgSpeed * 5280 / 3600) * deltaTime;
        obdDataRef.current.distance += distanceIncrement;
        obdDataRef.current.lastSpeed = obdTelemetry.mph;
        obdDataRef.current.lastTimestamp = now;
        
        if (obdTelemetry.mph > obdDataRef.current.topSpeed) {
          obdDataRef.current.topSpeed = obdTelemetry.mph;
        }
        
        if (obdDataRef.current.zeroTo60Time === null && obdTelemetry.mph >= 60) {
          obdDataRef.current.zeroTo60Time = elapsed;
        }
        if (obdDataRef.current.sixtyFtTime === null && obdDataRef.current.distance >= 60) {
          obdDataRef.current.sixtyFtTime = elapsed;
        }
        if (obdDataRef.current.threeThirtyFtTime === null && obdDataRef.current.distance >= 330) {
          obdDataRef.current.threeThirtyFtTime = elapsed;
        }
        if (obdDataRef.current.sixSixtyFtTime === null && obdDataRef.current.distance >= 660) {
          obdDataRef.current.sixSixtyFtTime = elapsed;
        }
        
        const sample: TelemetrySample = {
          timestamp: elapsed,
          mph: obdTelemetry.mph,
          rpm: obdTelemetry.rpm,
          gear: obdTelemetry.gear,
          distanceFt: obdDataRef.current.distance,
          throttlePct: obdTelemetry.throttlePct,
        };
        
        setLeftTelemetry(sample);
        if (leftCar) {
          updateTelemetry(leftCar.id, sample);
        }
        
        if (obdDataRef.current.distance >= targetDistance) {
          obdRaceCompleted = true;
          unsubscribe();
          obdService.stopLiveData();
          
          const result: Partial<RaceResult> = {
            reactionTimeMs: reactionTime * 1000,
            zeroTo60Ms: obdDataRef.current.zeroTo60Time ?? elapsed,
            sixtyFtMs: obdDataRef.current.sixtyFtTime ?? elapsed,
            threeThirtyFtMs: obdDataRef.current.threeThirtyFtTime ?? elapsed,
            sixSixtyFtMs: obdDataRef.current.sixSixtyFtTime ?? elapsed,
            elapsedTimeMs: elapsed,
            trapSpeedMph: obdTelemetry.mph,
            topSpeedMph: obdDataRef.current.topSpeed,
            distanceFt: obdDataRef.current.distance,
            falseStart: false,
          };
          
          resultsRef.current.left = result;
          checkRaceComplete();
        }
      });
      
      const errorUnsubscribe = obdService.onError((error) => {
        console.error("OBD error during race:", error);
        unsubscribe();
        obdService.stopLiveData();
        cleanupAllSubscriptions();
        setObdConnected(false);
        setDataSource("simulated");
        toast({
          title: "OBD Connection Lost",
          description: "Bluetooth adapter disconnected. Race aborted.",
          variant: "destructive",
        });
        resetRace();
        setLocation("/");
      });
      
      cleanupRef.current.push(unsubscribe);
      cleanupRef.current.push(errorUnsubscribe);
      cleanupRef.current.push(() => obdService.stopLiveData());
      obdService.startLiveData();
      
      if (rightCar) {
        const cleanup = simulateRace(
          rightCar.horsepower,
          rightCar.weight,
          targetDistance,
          isRoll,
          rollSpeedValue,
          (sample) => {
            setRightTelemetry(sample);
            updateTelemetry(rightCar.id, sample);
            if (sample.timestamp === 50) {
              const rt = 0.1 + Math.random() * 0.3;
              setRightReaction(rt);
            }
          },
          (result) => {
            resultsRef.current.right = result;
            checkRaceComplete();
          }
        );
        cleanupRef.current.push(cleanup);
      }
      
    } else {
      if (leftCar) {
        const cleanup = simulateRace(
          leftCar.horsepower,
          leftCar.weight,
          targetDistance,
          isRoll,
          rollSpeedValue,
          (sample) => {
            setLeftTelemetry(sample);
            updateTelemetry(leftCar.id, sample);
            if (sample.timestamp === 50) {
              const rt = 0.1 + Math.random() * 0.3;
              setLeftReaction(rt);
            }
          },
          (result) => {
            resultsRef.current.left = result;
            checkRaceComplete();
          }
        );
        cleanupRef.current.push(cleanup);
      }
      
      if (rightCar) {
        const cleanup = simulateRace(
          rightCar.horsepower,
          rightCar.weight,
          targetDistance,
          isRoll,
          rollSpeedValue,
          (sample) => {
            setRightTelemetry(sample);
            updateTelemetry(rightCar.id, sample);
            if (sample.timestamp === 50) {
              const rt = 0.1 + Math.random() * 0.3;
              setRightReaction(rt);
            }
          },
          (result) => {
            resultsRef.current.right = result;
            checkRaceComplete();
          }
        );
        cleanupRef.current.push(cleanup);
      }
    }
  }, [currentRace, cars, updateRaceStatus, updateTelemetry, isUsingOBD]);

  const checkRaceComplete = useCallback(() => {
    if (!currentRace) return;
    
    const { left, right } = resultsRef.current;
    if (!left || !right) return;
    
    const leftCarId = currentRace.participants[0]?.carId;
    const rightCarId = currentRace.participants[1]?.carId;
    
    if (!leftCarId || !rightCarId) return;
    
    const leftResult: RaceResult = {
      carId: leftCarId,
      lane: "left",
      reactionTimeMs: left.reactionTimeMs!,
      zeroTo60Ms: left.zeroTo60Ms!,
      sixtyFtMs: left.sixtyFtMs!,
      threeThirtyFtMs: left.threeThirtyFtMs!,
      sixSixtyFtMs: left.sixSixtyFtMs!,
      eighthMileMs: currentRace.raceType === "eighth" || currentRace.raceType === "dig" || currentRace.raceType === "roll" ? left.sixSixtyFtMs! : null,
      halfMileMs: currentRace.raceType === "half" ? left.elapsedTimeMs! : null,
      elapsedTimeMs: left.elapsedTimeMs!,
      trapSpeedMph: left.trapSpeedMph!,
      topSpeedMph: left.topSpeedMph!,
      distanceFt: left.distanceFt!,
      falseStart: false,
    };
    
    const rightResult: RaceResult = {
      carId: rightCarId,
      lane: "right",
      reactionTimeMs: right.reactionTimeMs!,
      zeroTo60Ms: right.zeroTo60Ms!,
      sixtyFtMs: right.sixtyFtMs!,
      threeThirtyFtMs: right.threeThirtyFtMs!,
      sixSixtyFtMs: right.sixSixtyFtMs!,
      eighthMileMs: currentRace.raceType === "eighth" || currentRace.raceType === "dig" || currentRace.raceType === "roll" ? right.sixSixtyFtMs! : null,
      halfMileMs: currentRace.raceType === "half" ? right.elapsedTimeMs! : null,
      elapsedTimeMs: right.elapsedTimeMs!,
      trapSpeedMph: right.trapSpeedMph!,
      topSpeedMph: right.topSpeedMph!,
      distanceFt: right.distanceFt!,
      falseStart: false,
    };
    
    const winnerId = leftResult.elapsedTimeMs < rightResult.elapsedTimeMs ? leftCarId : rightCarId;
    
    cleanupAllSubscriptions();
    completeRace([leftResult, rightResult], winnerId);
    
    setTimeout(() => {
      setLocation("/results");
    }, 1500);
  }, [currentRace, completeRace, setLocation, cleanupAllSubscriptions]);

  const handleAbort = useCallback(() => {
    cleanupAllSubscriptions();
    resetRace();
    setLocation("/");
  }, [resetRace, setLocation, cleanupAllSubscriptions]);

  if (!currentRace) return null;

  const leftCar = currentRace.participants[0]?.car || cars.find(c => c.id === currentRace.participants[0]?.carId);
  const rightCar = currentRace.participants[1]?.car || cars.find(c => c.id === currentRace.participants[1]?.carId);
  const targetDistance = raceTypeInfo[currentRace.raceType].distanceFt;

  const leftDistance = leftTelemetry?.distanceFt ?? 0;
  const rightDistance = rightTelemetry?.distanceFt ?? 0;
  
  const leader = leftDistance > rightDistance ? leftCar?.name : 
                 rightDistance > leftDistance ? rightCar?.name : null;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <LiveMetricsBar
        raceType={currentRace.raceType}
        status={currentRace.status}
        elapsedTime={elapsedTime}
        leader={leader || null}
      />

      <div className="flex-1 flex flex-col p-6 gap-6">
        <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-6 flex-1">
          {leftCar && (
            <CarTelemetryPanel
              car={leftCar}
              telemetry={leftTelemetry}
              lane="left"
              isLeading={leader === leftCar.name}
              reactionTime={leftReaction}
            />
          )}

          <div className="flex flex-col items-center justify-center gap-6">
            {isUsingOBD && (
              <Badge variant="outline" className="bg-blue-500/20 border-blue-500 text-blue-400 font-racing">
                <Bluetooth className="w-3 h-3 mr-1" />
                Live OBD Mode
              </Badge>
            )}
            {!isUsingOBD && (
              <Badge variant="outline" className="bg-zinc-500/20 border-zinc-500 text-zinc-400 font-racing">
                <Car className="w-3 h-3 mr-1" />
                Simulated Mode
              </Badge>
            )}
            
            <ChristmasTree status={treeStatus} onCountdownComplete={handleCountdownComplete} />
            
            {currentRace.status === "setup" && (
              <Button
                size="lg"
                onClick={handleStartSequence}
                className="font-racing uppercase tracking-wider"
                data-testid="button-begin-race"
              >
                <Play className="w-5 h-5 mr-2" />
                Begin Race
              </Button>
            )}
            
            {(currentRace.status === "staging" || currentRace.status === "countdown") && (
              <div className="text-center space-y-3">
                <p className="text-amber-500 font-racing uppercase tracking-wider animate-pulse">
                  Staging...
                </p>
                
                {currentRace.raceType === "roll" && (
                  <div className="bg-zinc-900/80 rounded-lg p-4 border border-zinc-800">
                    <p className="text-xs text-muted-foreground mb-2 font-racing uppercase">
                      Roll Speed: {currentRace.rollSpeed || 40} MPH
                    </p>
                    <div className="flex items-center justify-center gap-6">
                      <div className="flex items-center gap-2">
                        <div 
                          className={`w-3 h-3 rounded-full ${leftAtRollSpeed ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}
                          data-testid="indicator-left-roll-ready"
                        />
                        <span className={`text-sm font-mono ${leftAtRollSpeed ? 'text-green-400' : 'text-red-400'}`}>
                          Lane 1 {leftAtRollSpeed ? 'Ready' : 'Waiting'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div 
                          className={`w-3 h-3 rounded-full ${rightAtRollSpeed ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}
                          data-testid="indicator-right-roll-ready"
                        />
                        <span className={`text-sm font-mono ${rightAtRollSpeed ? 'text-green-400' : 'text-red-400'}`}>
                          Lane 2 {rightAtRollSpeed ? 'Ready' : 'Waiting'}
                        </span>
                      </div>
                    </div>
                    {leftAtRollSpeed && rightAtRollSpeed && (
                      <p className="text-green-400 text-xs mt-2 font-racing uppercase">
                        Both cars at speed - Race starting!
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {currentRace.status !== "complete" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAbort}
                className="text-destructive border-destructive/50"
                data-testid="button-abort-race"
              >
                <Square className="w-4 h-4 mr-2" />
                Abort Race
              </Button>
            )}
          </div>

          {rightCar && (
            <CarTelemetryPanel
              car={rightCar}
              telemetry={rightTelemetry}
              lane="right"
              isLeading={leader === rightCar.name}
              reactionTime={rightReaction}
            />
          )}
        </div>

        <ProgressTrack
          leftProgress={leftDistance}
          rightProgress={rightDistance}
          totalDistance={targetDistance}
          leftColor={leftCar?.color}
          rightColor={rightCar?.color}
        />
      </div>
    </div>
  );
}
