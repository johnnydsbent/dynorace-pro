import { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { Race, Car, DynoMachine, RaceType, RaceStatus, TelemetrySample, RaceResult, DynoHealth, PassLog } from "@shared/schema";
import { getDynoStatus } from "@shared/schema";

export type DataSource = "simulated" | "obd";

interface RaceContextType {
  cars: Car[];
  dynoMachines: DynoMachine[];
  currentRace: Race | null;
  raceHistory: Race[];
  dataSource: DataSource;
  obdConnected: boolean;
  obdConnected2: boolean;
  dynoHealth: DynoHealth[];
  passLogs: PassLog[];
  setCars: (cars: Car[]) => void;
  setDynoMachines: (machines: DynoMachine[]) => void;
  setDataSource: (source: DataSource) => void;
  setObdConnected: (connected: boolean) => void;
  setObdConnected2: (connected: boolean) => void;
  createRace: (raceType: RaceType, leftCar: Car, rightCar: Car, rollSpeed?: 20 | 40 | 60) => void;
  updateRaceStatus: (status: RaceStatus) => void;
  updateTelemetry: (carId: string, sample: TelemetrySample) => void;
  completeRace: (results: RaceResult[], winnerId: string) => void;
  resetRace: () => void;
  resetDynoTemps: () => void;
  refreshCars: () => Promise<void>;
}

const RaceContext = createContext<RaceContextType | undefined>(undefined);

const defaultCars: Car[] = [
  { id: "car1", name: "Dyno 1 Car", makeModel: "2024 Ford Mustang GT", horsepower: 480, weight: 3800, color: "#ef4444", drivetrain: "RWD" },
  { id: "car2", name: "Dyno 2 Car", makeModel: "2024 Chevrolet Camaro SS", horsepower: 455, weight: 3700, color: "#3b82f6", drivetrain: "RWD" },
];

const defaultDynoMachines: DynoMachine[] = [
  { id: "dyno1", name: "Dynojet 1", status: "connected", carId: "car1" },
  { id: "dyno2", name: "Dynojet 2", status: "connected", carId: "car2" },
];

const defaultDynoHealth: DynoHealth[] = [
  { dynoId: "dyno1", dynoName: "Dynojet 1", temperature: 85, status: "optimal", passCount: 0, lastPassTime: null, peakTemperature: 85 },
  { dynoId: "dyno2", dynoName: "Dynojet 2", temperature: 85, status: "optimal", passCount: 0, lastPassTime: null, peakTemperature: 85 },
];

export function RaceProvider({ children }: { children: React.ReactNode }) {
  const [cars, setCars] = useState<Car[]>(defaultCars);
  const [dynoMachines, setDynoMachines] = useState<DynoMachine[]>(defaultDynoMachines);
  const [currentRace, setCurrentRace] = useState<Race | null>(null);
  const [raceHistory, setRaceHistory] = useState<Race[]>([]);
  const [dataSource, setDataSource] = useState<DataSource>("simulated");
  const [obdConnected, setObdConnected] = useState(false);
  const [obdConnected2, setObdConnected2] = useState(false);
  const [dynoHealth, setDynoHealth] = useState<DynoHealth[]>(defaultDynoHealth);
  const [passLogs, setPassLogs] = useState<PassLog[]>([]);

  useEffect(() => {
    fetch("/api/cars")
      .then(res => res.json())
      .then((loadedCars: Car[]) => {
        if (loadedCars.length > 0) {
          setCars(loadedCars);
        }
        setDynoMachines([
          { id: "dyno1", name: "Dynojet 1", status: "connected", carId: loadedCars[0]?.id || null },
          { id: "dyno2", name: "Dynojet 2", status: "connected", carId: loadedCars[1]?.id || null },
        ]);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const cooldownInterval = setInterval(() => {
      setDynoHealth(prev => prev.map(d => {
        if (d.temperature > 85) {
          const newTemp = Math.max(85, d.temperature - 0.5);
          return { ...d, temperature: newTemp, status: getDynoStatus(newTemp) };
        }
        return d;
      }));
    }, 2000);
    return () => clearInterval(cooldownInterval);
  }, []);

  const createRace = useCallback((raceType: RaceType, leftCar: Car, rightCar: Car, rollSpeed?: 20 | 40 | 60) => {
    const isLeftObd = leftCar.id.startsWith("obd-vehicle");
    const isRightObd = rightCar.id.startsWith("obd-vehicle");

    const race: Race = {
      id: `race-${Date.now()}`,
      raceType,
      status: "setup",
      participants: [
        { carId: leftCar.id, lane: "left", driverName: isLeftObd ? "Car 1 (OBD)" : "Driver 1", isObd: isLeftObd, car: leftCar },
        { carId: rightCar.id, lane: "right", driverName: isRightObd ? "Car 2 (OBD)" : "Driver 2", isObd: isRightObd, car: rightCar },
      ],
      results: [],
      telemetry: { [leftCar.id]: [], [rightCar.id]: [] },
      startTime: null,
      endTime: null,
      winner: null,
      rollSpeed: raceType === "roll" ? (rollSpeed || 40) : undefined,
      trackConditions: { temperature: 75, humidity: 45, altitude: 500 },
    };
    setCurrentRace(race);
  }, []);

  const updateRaceStatus = useCallback((status: RaceStatus) => {
    setCurrentRace(prev => {
      if (!prev) return null;
      return { ...prev, status, startTime: status === "racing" ? Date.now() : prev.startTime };
    });
  }, []);

  const updateTelemetry = useCallback((carId: string, sample: TelemetrySample) => {
    setCurrentRace(prev => {
      if (!prev) return null;
      return {
        ...prev,
        telemetry: {
          ...prev.telemetry,
          [carId]: [...(prev.telemetry[carId] || []), sample],
        },
      };
    });
  }, []);

  const completeRace = useCallback((results: RaceResult[], winnerId: string) => {
    setCurrentRace(prev => {
      if (!prev) return null;
      const completed: Race = {
        ...prev,
        status: "complete",
        results,
        winner: winnerId,
        endTime: Date.now(),
      };
      setRaceHistory(history => [...history, completed]);

      const now = Date.now();
      const tempIncrease = prev.raceType === "half" ? 25 : prev.raceType === "dig" ? 18 : prev.raceType === "roll" ? 15 : 12;

      setDynoHealth(health => health.map((d, i) => {
        const newTemp = Math.min(200, d.temperature + tempIncrease + Math.random() * 8);
        const result = results[i];
        const participant = prev.participants[i];
        const car = participant?.car || cars.find(c => c.id === result?.carId);

        const log: PassLog = {
          id: `pass-${Date.now()}-${d.dynoId}`,
          raceId: completed.id,
          dynoId: d.dynoId,
          carName: car?.name || (participant?.isObd ? "OBD Vehicle" : "Unknown"),
          raceType: prev.raceType,
          elapsedTimeMs: result?.elapsedTimeMs || 0,
          topSpeedMph: result?.topSpeedMph || 0,
          temperatureAfter: newTemp,
          timestamp: now,
        };
        setPassLogs(logs => [log, ...logs].slice(0, 100));

        return {
          ...d,
          temperature: newTemp,
          status: getDynoStatus(newTemp),
          passCount: d.passCount + 1,
          lastPassTime: now,
          peakTemperature: Math.max(d.peakTemperature, newTemp),
        };
      }));

      return completed;
    });
  }, [cars]);

  const resetRace = useCallback(() => {
    setCurrentRace(null);
  }, []);

  const resetDynoTemps = useCallback(() => {
    setDynoHealth(prev => prev.map(d => ({
      ...d,
      temperature: 85,
      status: "optimal" as const,
    })));
  }, []);

  const refreshCars = useCallback(async () => {
    try {
      const res = await fetch("/api/cars");
      const loadedCars: Car[] = await res.json();
      setCars(loadedCars);
      setDynoMachines(prev => {
        const isObd1 = prev[0]?.carId?.startsWith("obd-vehicle");
        const isObd2 = prev[1]?.carId?.startsWith("obd-vehicle");
        return [
          { id: "dyno1", name: "Dynojet 1", status: "connected", carId: isObd1 ? prev[0].carId : (loadedCars[0]?.id || null) },
          { id: "dyno2", name: "Dynojet 2", status: "connected", carId: isObd2 ? prev[1].carId : (loadedCars[1]?.id || null) },
        ];
      });
    } catch (error) {
      console.error("Failed to refresh cars:", error);
    }
  }, []);

  return (
    <RaceContext.Provider value={{
      cars,
      dynoMachines,
      currentRace,
      raceHistory,
      dataSource,
      obdConnected,
      obdConnected2,
      dynoHealth,
      passLogs,
      setCars,
      setDynoMachines,
      setDataSource,
      setObdConnected,
      setObdConnected2,
      createRace,
      updateRaceStatus,
      updateTelemetry,
      completeRace,
      resetRace,
      resetDynoTemps,
      refreshCars,
    }}>
      {children}
    </RaceContext.Provider>
  );
}

export function useRace() {
  const context = useContext(RaceContext);
  if (!context) {
    throw new Error("useRace must be used within a RaceProvider");
  }
  return context;
}
