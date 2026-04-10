import { z } from "zod";

export type RaceType = "dig" | "roll" | "eighth" | "half";
export type RaceStatus = "setup" | "staging" | "countdown" | "racing" | "complete";
export type Lane = "left" | "right";
export type Drivetrain = "RWD" | "FWD" | "AWD";

export interface Car {
  id: string;
  name: string;
  makeModel: string;
  horsepower: number;
  weight: number;
  color: string;
  drivetrain: Drivetrain;
}

export interface DynoMachine {
  id: string;
  name: string;
  status: "connected" | "disconnected" | "calibrating";
  carId: string | null;
}

export interface RaceParticipant {
  carId: string;
  lane: Lane;
  driverName: string;
  rollSpeed?: number;
  isObd?: boolean;
  car?: Car;
}

export interface TelemetrySample {
  timestamp: number;
  mph: number;
  rpm: number;
  gear: number;
  distanceFt: number;
  throttlePct: number;
}

export interface RaceResult {
  carId: string;
  lane: Lane;
  reactionTimeMs: number;
  zeroTo60Ms: number;
  sixtyFtMs: number;
  threeThirtyFtMs: number;
  sixSixtyFtMs: number;
  eighthMileMs: number | null;
  halfMileMs: number | null;
  elapsedTimeMs: number;
  trapSpeedMph: number;
  topSpeedMph: number;
  distanceFt: number;
  falseStart: boolean;
}

export interface Race {
  id: string;
  raceType: RaceType;
  status: RaceStatus;
  participants: RaceParticipant[];
  results: RaceResult[];
  telemetry: Record<string, TelemetrySample[]>;
  startTime: number | null;
  endTime: number | null;
  winner: string | null;
  rollSpeed?: 20 | 40 | 60;
  trackConditions: {
    temperature: number;
    humidity: number;
    altitude: number;
  };
}

export const raceTypeInfo: Record<RaceType, { label: string; description: string; distance: string; distanceFt: number }> = {
  dig: { label: "Dig Racing", description: "From a complete standstill", distance: "1/4 Mile", distanceFt: 1320 },
  roll: { label: "Roll Racing", description: "From a rolling start (20/40/60 MPH)", distance: "1/4 Mile", distanceFt: 1320 },
  eighth: { label: "1/8 Mile", description: "Sprint to 660 feet", distance: "1/8 Mile", distanceFt: 660 },
  half: { label: "1/2 Mile", description: "Half-mile endurance run", distance: "1/2 Mile", distanceFt: 2640 },
};

export const insertCarSchema = z.object({
  name: z.string().min(1, "Name is required"),
  makeModel: z.string().min(1, "Make/Model is required"),
  horsepower: z.number().min(50, "Min 50 HP").max(3000, "Max 3000 HP"),
  weight: z.number().min(1000, "Min 1000 lbs").max(10000, "Max 10000 lbs"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color"),
  drivetrain: z.enum(["RWD", "FWD", "AWD"]),
});

export const insertRaceSchema = z.object({
  raceType: z.enum(["dig", "roll", "eighth", "half"]),
  participants: z.array(z.object({
    carId: z.string(),
    lane: z.enum(["left", "right"]),
    driverName: z.string(),
    rollSpeed: z.number().optional(),
  })).length(2),
  trackConditions: z.object({
    temperature: z.number(),
    humidity: z.number(),
    altitude: z.number(),
  }),
});

export type InsertCar = z.infer<typeof insertCarSchema>;
export type InsertRace = z.infer<typeof insertRaceSchema>;

export type DynoHealthStatus = "optimal" | "warm" | "hot" | "critical";

export interface DynoHealth {
  dynoId: string;
  dynoName: string;
  temperature: number;
  status: DynoHealthStatus;
  passCount: number;
  lastPassTime: number | null;
  peakTemperature: number;
}

export interface PassLog {
  id: string;
  raceId: string;
  dynoId: string;
  carName: string;
  raceType: RaceType;
  elapsedTimeMs: number;
  topSpeedMph: number;
  temperatureAfter: number;
  timestamp: number;
}

export function getDynoStatus(temperature: number): DynoHealthStatus {
  if (temperature < 120) return "optimal";
  if (temperature < 150) return "warm";
  if (temperature < 180) return "hot";
  return "critical";
}
