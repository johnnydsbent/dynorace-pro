import { useState } from "react";
import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { RaceProvider } from "@/lib/race-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { SplashScreen } from "@/components/splash-screen";
import Home from "@/pages/home";
import Race from "@/pages/race";
import Results from "@/pages/results";
import DynoHealth from "@/pages/dyno-health";
import Monitor from "@/pages/monitor";
import Garage from "@/pages/garage";
import NotFound from "@/pages/not-found";
import { Gauge, Thermometer, Monitor as MonitorIcon, Car } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useRace } from "@/lib/race-context";

const isElectron = typeof window !== "undefined" && !!(window as any).electronAPI?.isElectron;

function Header() {
  const [location] = useLocation();
  const { dynoHealth } = useRace();

  if (location === "/race" || location === "/monitor") return null;

  const hasHotDyno = dynoHealth.some(d => d.status === "hot" || d.status === "critical");

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 hover-elevate rounded-lg p-2 -ml-2">
          <div className="p-2 bg-primary rounded-lg">
            <Gauge className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg">DynoRace Pro</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/garage"
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover-elevate text-sm font-medium"
            data-testid="link-garage"
          >
            <Car className="w-4 h-4" />
            <span className="hidden sm:inline">Garage</span>
          </Link>
          <Link
            href="/monitor"
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover-elevate text-sm font-medium"
            data-testid="link-monitor"
          >
            <MonitorIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Monitor</span>
          </Link>
          <Link
            href="/dyno-health"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg hover-elevate text-sm font-medium ${hasHotDyno ? "bg-red-500/20 text-red-500" : ""}`}
            data-testid="link-dyno-health"
          >
            <Thermometer className={`w-4 h-4 ${hasHotDyno ? "animate-pulse" : ""}`} />
            <span className="hidden sm:inline">Dyno Health</span>
            {hasHotDyno && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/race" component={Race} />
      <Route path="/results" component={Results} />
      <Route path="/dyno-health" component={DynoHealth} />
      <Route path="/monitor" component={Monitor} />
      <Route path="/garage" component={Garage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppShell() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AppRoutes />
    </div>
  );
}

function App() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RaceProvider>
          <TooltipProvider>
            {!splashDone && (
              <SplashScreen onComplete={() => setSplashDone(true)} />
            )}
            {isElectron ? (
              <Router hook={useHashLocation}>
                <AppShell />
              </Router>
            ) : (
              <AppShell />
            )}
            <Toaster />
          </TooltipProvider>
        </RaceProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
