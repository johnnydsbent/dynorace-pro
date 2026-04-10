import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { obdService1, obdService2, type OBDPort, type OBDConnectionStatus } from "@/lib/obd-service";
import { useRace } from "@/lib/race-context";
import { Bluetooth, BluetoothConnected, BluetoothOff, RefreshCw, Usb, Wifi, AlertCircle, CheckCircle2 } from "lucide-react";

interface OBDConnectionManagerProps {
  carId: 1 | 2;
  laneLabel?: string;
  onConnectionChange?: (connected: boolean) => void;
}

export function OBDConnectionManager({ carId, laneLabel, onConnectionChange }: OBDConnectionManagerProps) {
  const { dataSource, setDataSource, setObdConnected, setObdConnected2 } = useRace();
  const obdService = carId === 1 ? obdService1 : obdService2;

  const [ports, setPorts] = useState<OBDPort[]>([]);
  const [selectedPort, setSelectedPort] = useState<string>("");
  const [status, setStatus] = useState<OBDConnectionStatus>(obdService.getStatus());
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const isElectron = obdService.isElectron();

  useEffect(() => {
    if (isElectron) {
      scanForPorts();
    }
  }, [isElectron]);

  const scanForPorts = async () => {
    setIsScanning(true);
    try {
      const foundPorts = await obdService.listPorts();
      setPorts(foundPorts);
      if (foundPorts.length > 0 && !selectedPort) {
        setSelectedPort(foundPorts[0].path);
      }
    } catch (error) {
      console.error("Scan error:", error);
    }
    setIsScanning(false);
  };

  const handleConnect = async () => {
    if (!selectedPort) return;

    setIsConnecting(true);
    const success = await obdService.connect(selectedPort);
    setStatus(obdService.getStatus());
    setIsConnecting(false);

    if (success) {
      await obdService.startLiveData();
      if (carId === 1) {
        setObdConnected(true);
        setDataSource("obd");
      } else {
        setObdConnected2(true);
      }
      onConnectionChange?.(true);
    }
  };

  const handleDisconnect = async () => {
    await obdService.disconnect();
    setStatus(obdService.getStatus());
    if (carId === 1) {
      setObdConnected(false);
      setDataSource("simulated");
    } else {
      setObdConnected2(false);
    }
    onConnectionChange?.(false);
  };

  const getPortIcon = (port: OBDPort) => {
    const path = port.path.toLowerCase();
    if (path.includes("bluetooth") || path.includes("rfcomm")) {
      return <Bluetooth className="w-4 h-4" />;
    }
    if (path.includes("usb") || path.includes("ttyusb")) {
      return <Usb className="w-4 h-4" />;
    }
    return <Wifi className="w-4 h-4" />;
  };

  if (!isElectron) {
    return (
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-1">Desktop App Required</h3>
              <p className="text-xs text-muted-foreground">
                OBD-II connectivity requires the DynoRace Pro desktop application.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const label = laneLabel || `Car ${carId}`;

  return (
    <Card className={status.connected ? "border-green-500/30" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="font-racing uppercase tracking-wider flex items-center gap-2 text-base">
              {status.connected ? (
                <BluetoothConnected className="w-4 h-4 text-green-500" />
              ) : (
                <BluetoothOff className="w-4 h-4 text-muted-foreground" />
              )}
              {label} — OBD-II
            </CardTitle>
            <CardDescription className="text-xs">
              Lane {carId} · Bluetooth ELM327 adapter
            </CardDescription>
          </div>
          <Badge
            variant={status.connected ? "default" : "secondary"}
            className={status.connected ? "bg-green-500 text-xs" : "text-xs"}
          >
            {status.connected ? "Live" : "Disconnected"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {status.connected ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded-lg border border-green-500/20">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
              <div className="text-sm">
                <div className="font-medium">{status.portPath}</div>
                <div className="text-xs text-muted-foreground">Protocol: {status.protocol}</div>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleDisconnect}
              className="w-full text-sm h-8"
              data-testid={`button-disconnect-obd-${carId}`}
            >
              Disconnect
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Select value={selectedPort} onValueChange={setSelectedPort}>
                <SelectTrigger className="flex-1 h-8 text-sm" data-testid={`select-obd-port-${carId}`}>
                  <SelectValue placeholder="Select OBD adapter..." />
                </SelectTrigger>
                <SelectContent>
                  {ports.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No adapters found
                    </SelectItem>
                  ) : (
                    ports.map((port) => (
                      <SelectItem key={port.path} value={port.path}>
                        <div className="flex items-center gap-2">
                          {getPortIcon(port)}
                          <span>{port.path}</span>
                          {port.manufacturer && (
                            <span className="text-xs text-muted-foreground">({port.manufacturer})</span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={scanForPorts}
                disabled={isScanning}
                className="h-8 w-8"
                data-testid={`button-scan-ports-${carId}`}
              >
                <RefreshCw className={`w-3 h-3 ${isScanning ? "animate-spin" : ""}`} />
              </Button>
            </div>

            {status.error && (
              <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-lg border border-destructive/20 text-xs text-destructive">
                <AlertCircle className="w-3 h-3" />
                {status.error}
              </div>
            )}

            <Button
              onClick={handleConnect}
              disabled={!selectedPort || isConnecting}
              className="w-full h-8 text-sm"
              data-testid={`button-connect-obd-${carId}`}
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Bluetooth className="w-3 h-3 mr-2" />
                  Connect to OBD-II
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Pair your ELM327 adapter via Bluetooth first
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
