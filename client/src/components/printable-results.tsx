import { forwardRef } from "react";
import type { Race, Car, RaceResult } from "@shared/schema";
import { raceTypeInfo } from "@shared/schema";
import { Trophy, Flag, Timer, Gauge, Zap } from "lucide-react";

interface PrintableResultsProps {
  race: Race;
  cars: Car[];
}

export const PrintableResults = forwardRef<HTMLDivElement, PrintableResultsProps>(
  ({ race, cars }, ref) => {
    const getCarById = (id: string) => cars.find(c => c.id === id);
    const winnerCar = race.winner ? getCarById(race.winner) : null;
    const raceInfo = raceTypeInfo[race.raceType];

    const formatTime = (ms: number | null) => {
      if (ms === null) return "—";
      return (ms / 1000).toFixed(3);
    };

    const formatDate = (timestamp: number | null) => {
      if (!timestamp) return "—";
      return new Date(timestamp).toLocaleString();
    };

    return (
      <div 
        ref={ref} 
        className="bg-white text-black p-8 max-w-4xl mx-auto print:p-4"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        <div className="border-b-2 border-black pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                DynoRace Pro
              </h1>
              <p className="text-gray-600 text-sm">Virtual Drag Racing Results</p>
            </div>
            <div className="text-right text-sm">
              <div><strong>Race ID:</strong> {race.id}</div>
              <div><strong>Date:</strong> {formatDate(race.startTime)}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-100 p-3 rounded">
            <div className="text-xs text-gray-600 uppercase">Race Type</div>
            <div className="font-bold">{raceInfo.label}</div>
          </div>
          <div className="bg-gray-100 p-3 rounded">
            <div className="text-xs text-gray-600 uppercase">Distance</div>
            <div className="font-bold">{raceInfo.distanceFt.toLocaleString()} ft</div>
          </div>
          <div className="bg-gray-100 p-3 rounded">
            <div className="text-xs text-gray-600 uppercase">Track Conditions</div>
            <div className="font-bold text-sm">
              {race.trackConditions.temperature}°F | {race.trackConditions.humidity}% Humidity
            </div>
          </div>
        </div>

        {winnerCar && (
          <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-4 mb-6 flex items-center gap-4">
            <Trophy className="w-10 h-10 text-amber-500" />
            <div>
              <div className="text-xs uppercase text-amber-600 font-semibold">Winner</div>
              <div className="text-2xl font-bold">{winnerCar.name}</div>
              <div className="text-sm text-gray-600">{winnerCar.makeModel}</div>
            </div>
          </div>
        )}

        <h2 className="text-xl font-bold mb-3 border-b pb-2">Detailed Results</h2>
        
        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-2 font-semibold">Driver / Vehicle</th>
              <th className="text-right p-2 font-semibold">Reaction</th>
              <th className="text-right p-2 font-semibold">0-60 MPH</th>
              <th className="text-right p-2 font-semibold">60ft</th>
              <th className="text-right p-2 font-semibold">330ft</th>
              <th className="text-right p-2 font-semibold">660ft</th>
              <th className="text-right p-2 font-semibold">ET</th>
              <th className="text-right p-2 font-semibold">Trap</th>
              <th className="text-right p-2 font-semibold">Top Speed</th>
            </tr>
          </thead>
          <tbody>
            {race.results.map((result) => {
              const car = getCarById(result.carId);
              const isWinner = result.carId === race.winner;
              
              return (
                <tr key={result.carId} className={isWinner ? "bg-green-50" : ""}>
                  <td className="p-2 border-b">
                    <div className="font-semibold">{car?.name} {isWinner && "★"}</div>
                    <div className="text-xs text-gray-600">{car?.makeModel}</div>
                  </td>
                  <td className="text-right p-2 border-b font-mono">{formatTime(result.reactionTimeMs)}s</td>
                  <td className="text-right p-2 border-b font-mono">{formatTime(result.zeroTo60Ms)}s</td>
                  <td className="text-right p-2 border-b font-mono">{formatTime(result.sixtyFtMs)}s</td>
                  <td className="text-right p-2 border-b font-mono">{formatTime(result.threeThirtyFtMs)}s</td>
                  <td className="text-right p-2 border-b font-mono">{formatTime(result.sixSixtyFtMs)}s</td>
                  <td className="text-right p-2 border-b font-mono font-bold">{formatTime(result.elapsedTimeMs)}s</td>
                  <td className="text-right p-2 border-b font-mono">{result.trapSpeedMph.toFixed(1)} mph</td>
                  <td className="text-right p-2 border-b font-mono">{result.topSpeedMph.toFixed(1)} mph</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <h2 className="text-xl font-bold mb-3 border-b pb-2">Vehicle Specifications</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          {race.participants.map((p) => {
            const car = getCarById(p.carId);
            if (!car) return null;
            
            return (
              <div key={car.id} className="border rounded p-3">
                <div className="font-bold mb-2">{car.name} - Lane {p.lane === "left" ? "1" : "2"}</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-600">Make/Model:</span> {car.makeModel}</div>
                  <div><span className="text-gray-600">Horsepower:</span> {car.horsepower} HP</div>
                  <div><span className="text-gray-600">Weight:</span> {car.weight.toLocaleString()} lbs</div>
                  <div><span className="text-gray-600">Power/Weight:</span> {(car.horsepower / (car.weight / 1000)).toFixed(1)} HP/1000lb</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t-2 border-gray-300 pt-4 mt-8 text-center text-xs text-gray-500">
          <p>DynoRace Pro - Professional Virtual Drag Racing</p>
          <p>Powered by Dynojet Technology Simulation</p>
          <p className="mt-2">Results generated on {new Date().toLocaleString()}</p>
        </div>
      </div>
    );
  }
);

PrintableResults.displayName = "PrintableResults";
