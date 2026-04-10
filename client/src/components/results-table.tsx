import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { RaceResult, Car } from "@shared/schema";
import { Trophy, Medal } from "lucide-react";

interface ResultsTableProps {
  results: RaceResult[];
  cars: Car[];
  winnerId: string | null;
}

export function ResultsTable({ results, cars, winnerId }: ResultsTableProps) {
  const getCarById = (id: string) => cars.find(c => c.id === id);

  const formatTime = (ms: number | null) => {
    if (ms === null) return "—";
    return (ms / 1000).toFixed(3);
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-racing uppercase tracking-wider">Driver</TableHead>
            <TableHead className="text-right font-racing uppercase tracking-wider">Reaction</TableHead>
            <TableHead className="text-right font-racing uppercase tracking-wider">0-60 MPH</TableHead>
            <TableHead className="text-right font-racing uppercase tracking-wider">60ft</TableHead>
            <TableHead className="text-right font-racing uppercase tracking-wider">330ft</TableHead>
            <TableHead className="text-right font-racing uppercase tracking-wider">660ft</TableHead>
            <TableHead className="text-right font-racing uppercase tracking-wider">ET</TableHead>
            <TableHead className="text-right font-racing uppercase tracking-wider">Trap Speed</TableHead>
            <TableHead className="text-right font-racing uppercase tracking-wider">Top Speed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result, index) => {
            const car = getCarById(result.carId);
            const isWinner = result.carId === winnerId;
            
            return (
              <TableRow 
                key={result.carId} 
                className={isWinner ? "bg-green-500/5" : ""}
                data-testid={`row-result-${result.carId}`}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    {isWinner ? (
                      <Trophy className="w-5 h-5 text-amber-500" />
                    ) : (
                      <Medal className="w-5 h-5 text-zinc-500" />
                    )}
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: car?.color }}
                    />
                    <div>
                      <div className="font-semibold">{car?.name}</div>
                      <div className="text-xs text-muted-foreground">{car?.makeModel}</div>
                    </div>
                    {isWinner && (
                      <Badge className="bg-green-500 text-white ml-2">Winner</Badge>
                    )}
                    {result.falseStart && (
                      <Badge variant="destructive" className="ml-2">False Start</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {formatTime(result.reactionTimeMs)} s
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {formatTime(result.zeroTo60Ms)} s
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {formatTime(result.sixtyFtMs)} s
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {formatTime(result.threeThirtyFtMs)} s
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {formatTime(result.sixSixtyFtMs)} s
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums font-bold">
                  {formatTime(result.elapsedTimeMs)} s
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {result.trapSpeedMph.toFixed(1)} mph
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {result.topSpeedMph.toFixed(1)} mph
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
