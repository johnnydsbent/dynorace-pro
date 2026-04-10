import { useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WinnerHero } from "@/components/winner-hero";
import { ResultsTable } from "@/components/results-table";
import { PerformanceChart } from "@/components/performance-chart";
import { PrintableResults } from "@/components/printable-results";
import { useRace } from "@/lib/race-context";
import { raceTypeInfo } from "@shared/schema";
import { Printer, RotateCcw, Home, Download, Thermometer, AlertTriangle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export default function Results() {
  const [, setLocation] = useLocation();
  const { currentRace, cars, resetRace, dynoHealth } = useRace();
  const printRef = useRef<HTMLDivElement>(null);

  if (!currentRace || currentRace.status !== "complete") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-racing font-bold mb-4">No Race Results</h2>
            <p className="text-muted-foreground mb-6">
              Complete a race to see results here.
            </p>
            <Button onClick={() => setLocation("/")} data-testid="button-go-home">
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const leftParticipant = currentRace.participants[0];
  const rightParticipant = currentRace.participants[1];
  
  const winnerParticipant = currentRace.winner 
    ? (leftParticipant?.carId === currentRace.winner ? leftParticipant : rightParticipant)
    : null;
  const winnerCar = winnerParticipant?.car || (currentRace.winner ? cars.find(c => c.id === currentRace.winner) : null);
  const winnerResult = currentRace.results.find(r => r.carId === currentRace.winner);
  const loserResult = currentRace.results.find(r => r.carId !== currentRace.winner);

  const leftCar = leftParticipant?.car || cars.find(c => c.id === leftParticipant?.carId);
  const rightCar = rightParticipant?.car || cars.find(c => c.id === rightParticipant?.carId);

  const leftTelemetry = currentRace.telemetry[currentRace.participants[0]?.carId] || [];
  const rightTelemetry = currentRace.telemetry[currentRace.participants[1]?.carId] || [];

  const raceInfo = raceTypeInfo[currentRace.raceType];

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Race Results - ${currentRace.id}</title>
          <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: Inter, sans-serif; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleNewRace = () => {
    resetRace();
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">Race Results</h1>
            <p className="text-sm text-muted-foreground">
              {raceInfo.label} - {raceInfo.distance}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handlePrint} data-testid="button-print-results">
              <Printer className="w-4 h-4 mr-2" />
              Print Results
            </Button>
            <Button onClick={handleNewRace} data-testid="button-new-race">
              <RotateCcw className="w-4 h-4 mr-2" />
              New Race
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {winnerCar && winnerResult && loserResult && (
          <WinnerHero 
            winner={winnerCar} 
            result={winnerResult} 
            loserResult={loserResult}
          />
        )}

        {dynoHealth.length > 0 && (
          <Link href="/dyno-health" className="block" data-testid="link-dyno-health-results">
            <Card className={`hover-elevate cursor-pointer transition-colors ${
              dynoHealth.some(d => d.status === "critical") 
                ? "border-red-500/50 bg-red-500/5" 
                : dynoHealth.some(d => d.status === "hot") 
                ? "border-orange-500/50 bg-orange-500/5" 
                : dynoHealth.some(d => d.status === "warm")
                ? "border-amber-500/30 bg-amber-500/5"
                : "border-green-500/30 bg-green-500/5"
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      dynoHealth.some(d => d.status === "critical")
                        ? "bg-red-500/20"
                        : dynoHealth.some(d => d.status === "hot")
                        ? "bg-orange-500/20"
                        : dynoHealth.some(d => d.status === "warm")
                        ? "bg-amber-500/20"
                        : "bg-green-500/20"
                    }`}>
                      <Thermometer className={`w-5 h-5 ${
                        dynoHealth.some(d => d.status === "critical")
                          ? "text-red-500 animate-pulse"
                          : dynoHealth.some(d => d.status === "hot")
                          ? "text-orange-500"
                          : dynoHealth.some(d => d.status === "warm")
                          ? "text-amber-500"
                          : "text-green-500"
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">Dyno Health Check</span>
                        {dynoHealth.some(d => d.status === "critical") ? (
                          <Badge variant="destructive" className="text-xs animate-pulse">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Critical - Stop Racing
                          </Badge>
                        ) : dynoHealth.some(d => d.status === "hot") ? (
                          <Badge variant="outline" className="bg-orange-500/20 border-orange-500 text-orange-500 text-xs">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Cooldown Recommended
                          </Badge>
                        ) : dynoHealth.some(d => d.status === "warm") ? (
                          <Badge variant="outline" className="bg-amber-500/20 border-amber-500 text-amber-500 text-xs">
                            Warming Up
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-500/20 border-green-500 text-green-500 text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Ready
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Click to view temperatures and pass log
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {dynoHealth.map((dyno) => (
                      <div key={dyno.dynoId} className="text-center">
                        <div className={`font-mono font-bold text-lg ${
                          dyno.status === "critical" ? "text-red-500 animate-pulse" :
                          dyno.status === "hot" ? "text-orange-500" :
                          dyno.status === "warm" ? "text-amber-500" :
                          "text-green-500"
                        }`}>
                          {dyno.temperature.toFixed(0)}°F
                        </div>
                        <div className="text-xs text-muted-foreground">{dyno.dynoName.replace("Dynojet ", "D")}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="font-racing uppercase tracking-wider">
              Detailed Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResultsTable 
              results={currentRace.results} 
              cars={cars} 
              winnerId={currentRace.winner}
            />
          </CardContent>
        </Card>

        {leftCar && rightCar && (
          <PerformanceChart
            leftTelemetry={leftTelemetry}
            rightTelemetry={rightTelemetry}
            leftCar={leftCar}
            rightCar={rightCar}
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle className="font-racing uppercase tracking-wider flex items-center gap-2">
              <Download className="w-5 h-5" />
              Printable Results Sheet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <PrintableResults ref={printRef} race={currentRace} cars={cars} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
