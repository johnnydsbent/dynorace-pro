import { randomUUID } from "crypto";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import type { Race, Car, RaceType, RaceResult, TelemetrySample, InsertRace, InsertCar } from "@shared/schema";

export interface IStorage {
  getCars(): Promise<Car[]>;
  getCar(id: string): Promise<Car | undefined>;
  createCar(car: InsertCar): Promise<Car>;
  updateCar(id: string, car: Partial<InsertCar>): Promise<Car | undefined>;
  deleteCar(id: string): Promise<boolean>;
  
  getRaces(): Promise<Race[]>;
  getRace(id: string): Promise<Race | undefined>;
  createRace(race: InsertRace): Promise<Race>;
  updateRace(id: string, updates: Partial<Race>): Promise<Race | undefined>;
  
  simulateRace(raceId: string): Promise<Race | undefined>;
}

const defaultCars: Car[] = [
  { 
    id: "car1", 
    name: "Dyno 1 Car", 
    makeModel: "2024 Ford Mustang GT", 
    horsepower: 480, 
    weight: 3800, 
    color: "#ef4444",
    drivetrain: "RWD"
  },
  { 
    id: "car2", 
    name: "Dyno 2 Car", 
    makeModel: "2024 Chevrolet Camaro SS", 
    horsepower: 455, 
    weight: 3700, 
    color: "#3b82f6",
    drivetrain: "RWD"
  },
];

const CARS_FILE = join(process.cwd(), "server", "data", "cars.json");

function loadCarsFromFile(): Car[] {
  try {
    if (existsSync(CARS_FILE)) {
      const data = readFileSync(CARS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error loading cars from file:", error);
  }
  return defaultCars;
}

function saveCarsToFile(cars: Car[]): void {
  try {
    const dir = dirname(CARS_FILE);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(CARS_FILE, JSON.stringify(cars, null, 2));
  } catch (error) {
    console.error("Error saving cars to file:", error);
  }
}

function simulateCarRace(
  car: Car,
  targetDistance: number,
  isRoll: boolean
): { telemetry: TelemetrySample[]; result: Partial<RaceResult> } {
  const telemetry: TelemetrySample[] = [];
  let timestamp = 0;
  let speed = isRoll ? 40 : 0;
  let distance = 0;
  let rpm = isRoll ? 4500 : 1000;
  let gear = isRoll ? 2 : 1;
  
  const reactionTime = 0.1 + Math.random() * 0.3;
  const powerToWeight = car.horsepower / (car.weight / 1000);
  const baseAcceleration = powerToWeight * 0.08;
  
  let zeroTo60Time: number | null = null;
  let sixtyFtTime: number | null = null;
  let threeThirtyFtTime: number | null = null;
  let sixSixtyFtTime: number | null = null;
  let topSpeed = speed;
  
  while (distance < targetDistance) {
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
    
    telemetry.push({
      timestamp,
      mph: speed,
      rpm,
      gear,
      distanceFt: distance,
      throttlePct: 95 + Math.random() * 5,
    });
  }
  
  return {
    telemetry,
    result: {
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
    },
  };
}

export class MemStorage implements IStorage {
  private cars: Map<string, Car>;
  private races: Map<string, Race>;

  constructor() {
    this.cars = new Map();
    this.races = new Map();
    
    const loadedCars = loadCarsFromFile();
    loadedCars.forEach(car => this.cars.set(car.id, car));
  }

  private persistCars(): void {
    saveCarsToFile(Array.from(this.cars.values()));
  }

  async getCars(): Promise<Car[]> {
    return Array.from(this.cars.values());
  }

  async getCar(id: string): Promise<Car | undefined> {
    return this.cars.get(id);
  }

  async createCar(insertCar: InsertCar): Promise<Car> {
    const id = randomUUID();
    const car: Car = { ...insertCar, id };
    this.cars.set(id, car);
    this.persistCars();
    return car;
  }

  async updateCar(id: string, updates: Partial<InsertCar>): Promise<Car | undefined> {
    const car = this.cars.get(id);
    if (!car) return undefined;
    
    const updated = { ...car, ...updates };
    this.cars.set(id, updated);
    this.persistCars();
    return updated;
  }

  async deleteCar(id: string): Promise<boolean> {
    const existed = this.cars.has(id);
    if (existed) {
      this.cars.delete(id);
      this.persistCars();
    }
    return existed;
  }

  async getRaces(): Promise<Race[]> {
    return Array.from(this.races.values()).sort((a, b) => 
      (b.startTime || 0) - (a.startTime || 0)
    );
  }

  async getRace(id: string): Promise<Race | undefined> {
    return this.races.get(id);
  }

  async createRace(insertRace: InsertRace): Promise<Race> {
    const id = randomUUID();
    const race: Race = {
      id,
      raceType: insertRace.raceType,
      status: "setup",
      participants: insertRace.participants,
      results: [],
      telemetry: {},
      startTime: null,
      endTime: null,
      winner: null,
      trackConditions: insertRace.trackConditions,
    };
    this.races.set(id, race);
    return race;
  }

  async updateRace(id: string, updates: Partial<Race>): Promise<Race | undefined> {
    const race = this.races.get(id);
    if (!race) return undefined;
    
    const updated = { ...race, ...updates };
    this.races.set(id, updated);
    return updated;
  }

  async simulateRace(raceId: string): Promise<Race | undefined> {
    const race = this.races.get(raceId);
    if (!race) return undefined;
    
    const distanceMap: Record<RaceType, number> = {
      dig: 1320,
      roll: 1320,
      eighth: 660,
      half: 2640,
    };
    
    const targetDistance = distanceMap[race.raceType];
    const isRoll = race.raceType === "roll";
    
    const results: RaceResult[] = [];
    const telemetry: Record<string, TelemetrySample[]> = {};
    
    for (const participant of race.participants) {
      const car = await this.getCar(participant.carId);
      if (!car) continue;
      
      const sim = simulateCarRace(car, targetDistance, isRoll);
      telemetry[car.id] = sim.telemetry;
      
      results.push({
        carId: car.id,
        lane: participant.lane,
        reactionTimeMs: sim.result.reactionTimeMs!,
        zeroTo60Ms: sim.result.zeroTo60Ms!,
        sixtyFtMs: sim.result.sixtyFtMs!,
        threeThirtyFtMs: sim.result.threeThirtyFtMs!,
        sixSixtyFtMs: sim.result.sixSixtyFtMs!,
        eighthMileMs: race.raceType === "eighth" ? sim.result.sixSixtyFtMs! : null,
        halfMileMs: race.raceType === "half" ? sim.result.elapsedTimeMs! : null,
        elapsedTimeMs: sim.result.elapsedTimeMs!,
        trapSpeedMph: sim.result.trapSpeedMph!,
        topSpeedMph: sim.result.topSpeedMph!,
        distanceFt: sim.result.distanceFt!,
        falseStart: false,
      });
    }
    
    const winner = results.reduce((prev, curr) => 
      curr.elapsedTimeMs < prev.elapsedTimeMs ? curr : prev
    );
    
    const updated: Race = {
      ...race,
      status: "complete",
      results,
      telemetry,
      startTime: Date.now() - (winner.elapsedTimeMs || 0),
      endTime: Date.now(),
      winner: winner.carId,
    };
    
    this.races.set(raceId, updated);
    return updated;
  }
}

export const storage = new MemStorage();
