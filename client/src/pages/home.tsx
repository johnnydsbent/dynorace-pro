import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RaceTypeSelector } from "@/components/race-type-selector";
import { DynoStatus } from "@/components/dyno-status";
import { OBDConnectionManager } from "@/components/obd-connection-manager";
import { useRace } from "@/lib/race-context";
import type { RaceType, Car } from "@shared/schema";
import { Play, Settings, History, Gauge, Flag, Bluetooth, Car as CarIcon } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const { cars, dynoMachines, setDynoMachines, createRace, dataSource, obdConnected } = useRace();
  const [selectedRaceType, setSelectedRaceType] = useState<RaceType | null>(null);
  const [leftCarId, setLeftCarId] = useState<string | null>(null);
  const [rightCarId, setRightCarId] = useState<string | null>(null);
  const [rollSpeed, setRollSpeed] = useState<20 | 40 | 60>(40);

  const isOBDMode = dataSource === "obd" && obdConnected;

  useEffect(() => {
    if (cars.length > 0 && !leftCarId) {
      setLeftCarId(cars[0]?.id || null);
    }
    if (cars.length > 1 && !rightCarId) {
      setRightCarId(cars[1]?.id || null);
    }
  }, [cars, leftCarId, rightCarId]);

  useEffect(() => {
    if (isOBDMode) {
      if (dynoMachines[0]?.carId !== "obd-vehicle") {
        setDynoMachines([
          { ...dynoMachines[0], carId: "obd-vehicle" },
          dynoMachines[1],
        ]);
      }
    } else {
      if (dynoMachines[0]?.carId === "obd-vehicle") {
        const firstGarageCarId = cars[0]?.id || null;
        setDynoMachines([
          { ...dynoMachines[0], carId: firstGarageCarId },
          dynoMachines[1],
        ]);
        setLeftCarId(firstGarageCarId);
      }
    }
  }, [isOBDMode, cars, dynoMachines, setDynoMachines]);

  const leftCar = cars.find(c => c.id === leftCarId) || null;
  const rightCar = cars.find(c => c.id === rightCarId) || null;

  const canStartRace = selectedRaceType && 
    (isOBDMode ? rightCar : (leftCar && rightCar)) && 
    dynoMachines.every(d => d.status === "connected");

  const handleSelectLeftCar = (carId: string) => {
    setLeftCarId(carId);
    setDynoMachines([
      { ...dynoMachines[0], carId },
      dynoMachines[1],
    ]);
  };

  const handleSelectRightCar = (carId: string) => {
    setRightCarId(carId);
    setDynoMachines([
      dynoMachines[0],
      { ...dynoMachines[1], carId },
    ]);
  };

  const handleStartRace = () => {
    if (selectedRaceType) {
      const left = isOBDMode 
        ? { id: "obd-vehicle", name: "Your Vehicle", makeModel: "OBD-II Connected", horsepower: 400, weight: 3500, color: "#ef4444", drivetrain: "RWD" as const }
        : leftCar;
      const right = rightCar;
      
      if (left && right) {
        const raceRollSpeed = selectedRaceType === "roll" ? rollSpeed : undefined;
        createRace(selectedRaceType, left, right, raceRollSpeed);
        setLocation("/race");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border-b border-zinc-800">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjIiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLThoLTJ2LTRoMnY0em0wLThoLTJWMTRoMnY0em0wLThoLTJWNmgydjR6bTAgMjRoLTJ2LTRoMnY0em0wIDhoLTJ2LTRoMnY0em0tOC04aC0ydi00aDJ2NHptMC04aC0ydi00aDJ2NHptMC04aC0yVjE0aDJ2NHptMC04aC0yVjZoMnY0em0wIDI0aC0ydi00aDJ2NHptMCA4aC0ydi00aDJ2NHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        
        <div className="relative max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary rounded-lg">
              <Gauge className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-display font-bold tracking-tight text-white">
                DynoRace Pro
              </h1>
              <p className="text-zinc-400">Virtual Drag Racing with Dual Dynojet Simulation</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-6">
            <Badge variant="outline" className="bg-zinc-800/50 border-zinc-700 text-zinc-300">
              <Flag className="w-3 h-3 mr-1" /> Professional Timing
            </Badge>
            <Badge variant="outline" className="bg-zinc-800/50 border-zinc-700 text-zinc-300">
              Real-Time Telemetry
            </Badge>
            <Badge variant="outline" className="bg-zinc-800/50 border-zinc-700 text-zinc-300">
              <Bluetooth className="w-3 h-3 mr-1" /> OBD-II Support
            </Badge>
            <Badge variant="outline" className="bg-zinc-800/50 border-zinc-700 text-zinc-300">
              Desktop App
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-racing uppercase tracking-wider flex items-center gap-2">
                  <Flag className="w-5 h-5" />
                  Select Race Type
                </CardTitle>
                <CardDescription>
                  Choose your racing format and distance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RaceTypeSelector 
                  selected={selectedRaceType} 
                  onSelect={setSelectedRaceType}
                />
                
                {selectedRaceType === "roll" && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <label className="text-sm font-medium mb-3 block">Roll Speed</label>
                    <div className="flex gap-3">
                      {([20, 40, 60] as const).map((speed) => (
                        <Button
                          key={speed}
                          variant={rollSpeed === speed ? "default" : "outline"}
                          className="flex-1 font-mono"
                          onClick={() => setRollSpeed(speed)}
                          data-testid={`button-roll-speed-${speed}`}
                        >
                          {speed} MPH
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Both cars must reach {rollSpeed} MPH before the race starts
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-racing uppercase tracking-wider flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Dyno Machines
                </CardTitle>
                <CardDescription>
                  {isOBDMode 
                    ? "Lane 1: Your vehicle via OBD | Lane 2: Select opponent from garage"
                    : "Select cars for each lane from your garage"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <CarIcon className="w-4 h-4" />
                      Lane 1 {isOBDMode && <Badge variant="secondary" className="text-xs">OBD</Badge>}
                    </label>
                    {isOBDMode ? (
                      <div className="flex items-center gap-2 p-3 rounded-md border border-primary/30 bg-primary/5">
                        <Bluetooth className="w-4 h-4 text-primary" />
                        <span className="font-medium">Your Vehicle (OBD-II)</span>
                      </div>
                    ) : (
                      <Select value={leftCarId || ""} onValueChange={handleSelectLeftCar}>
                        <SelectTrigger data-testid="select-left-car">
                          <SelectValue placeholder="Select a car" />
                        </SelectTrigger>
                        <SelectContent>
                          {cars.map((car) => (
                            <SelectItem key={car.id} value={car.id} data-testid={`option-left-car-${car.id}`}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: car.color }} 
                                />
                                <span>{car.name}</span>
                                <span className="text-muted-foreground text-xs">{car.horsepower} HP</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <DynoStatus 
                      machine={dynoMachines[0]} 
                      car={isOBDMode ? { id: "obd", name: "Your Vehicle", makeModel: "OBD-II", horsepower: 0, weight: 0, color: "#ef4444", drivetrain: "RWD" } : leftCar} 
                      lane="left" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <CarIcon className="w-4 h-4" />
                      Lane 2 {isOBDMode && <Badge variant="outline" className="text-xs">Virtual</Badge>}
                    </label>
                    <Select value={rightCarId || ""} onValueChange={handleSelectRightCar}>
                      <SelectTrigger data-testid="select-right-car">
                        <SelectValue placeholder="Select opponent" />
                      </SelectTrigger>
                      <SelectContent>
                        {cars.map((car) => (
                          <SelectItem key={car.id} value={car.id} data-testid={`option-right-car-${car.id}`}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: car.color }} 
                              />
                              <span>{car.name}</span>
                              <span className="text-muted-foreground text-xs">{car.horsepower} HP</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <DynoStatus 
                      machine={dynoMachines[1]} 
                      car={rightCar} 
                      lane="right" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <OBDConnectionManager />
          </div>

          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6">
                <h3 className="font-racing text-xl font-bold uppercase tracking-wider mb-4">
                  Ready to Race?
                </h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Race Type</span>
                    <span className="font-semibold">
                      {selectedRaceType ? (
                        selectedRaceType === "roll" 
                          ? `${rollSpeed} MPH ROLL` 
                          : selectedRaceType.toUpperCase()
                      ) : "Not selected"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Lane 1</span>
                    <span className="font-semibold">
                      {isOBDMode ? "Your Vehicle (OBD)" : (leftCar?.name || "—")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Lane 2</span>
                    <span className="font-semibold">{rightCar?.name || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Dyno Status</span>
                    <Badge 
                      variant={dynoMachines.every(d => d.status === "connected") ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {dynoMachines.filter(d => d.status === "connected").length}/2 Connected
                    </Badge>
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full font-racing uppercase tracking-wider"
                  disabled={!canStartRace}
                  onClick={handleStartRace}
                  data-testid="button-start-race"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Race
                </Button>

                {!canStartRace && (
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    {!selectedRaceType 
                      ? "Select a race type to continue" 
                      : "Ensure both dyno machines are connected"}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-racing text-lg font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Quick Stats
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Races Today</span>
                    <span className="font-mono font-semibold">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Best ET</span>
                    <span className="font-mono font-semibold">—</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Top Speed</span>
                    <span className="font-mono font-semibold">—</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
