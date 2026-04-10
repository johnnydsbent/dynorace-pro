import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { obdService, type OBDPort, type OBDConnectionStatus } from "@/lib/obd-service";
import { useRace } from "@/lib/race-context";
import { Bluetooth, BluetoothConnected, BluetoothOff, RefreshCw, Usb, Wifi, AlertCircle, CheckCircle2, Car } from "lucide-react";

interface OBDConnectionManagerProps {
  onConnectionChange?: (connected: boolean) => void;
}

export function OBDConnectionManager({ onConnectionChange }: OBDConnectionManagerProps) {
  const { dataSource, setDataSource, setObdConnected } = useRace();
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
      setObdConnected(true);
      setDataSource("obd");
      onConnectionChange?.(true);
    }
  };

  const handleDisconnect = async () => {
    await obdService.disconnect();
    setStatus(obdService.getStatus());
    setObdConnected(false);
    setDataSource("simulated");
    onConnectionChange?.(false);
  };

  const handleDataSourceToggle = (checked: boolean) => {
    if (checked && status.connected) {
      setDataSource("obd");
    } else {
      setDataSource("simulated");
    }
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
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500/20 rounded-lg">
              <AlertCircle className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Desktop App Required</h3>
              <p className="text-sm text-muted-foreground mb-4">
                OBD-II connectivity requires the DynoRace Pro desktop application. 
                Download the app for Windows or MacOS to connect to your vehicle's diagnostic system.
              </p>
              <div className="flex gap-3">
                <Badge variant="outline">Windows</Badge>
                <Badge variant="outline">MacOS</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="font-racing uppercase tracking-wider flex items-center gap-2">
              {status.connected ? (
                <BluetoothConnected className="w-5 h-5 text-green-500" />
              ) : (
                <BluetoothOff className="w-5 h-5 text-muted-foreground" />
              )}
              OBD Connection
            </CardTitle>
            <CardDescription>
              Connect to your vehicle via Bluetooth OBD-II adapter
            </CardDescription>
          </div>
          <Badge 
            variant={status.connected ? "default" : "secondary"}
            className={status.connected ? "bg-green-500" : ""}
          >
            {status.connected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {status.connected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <div>
                <div className="font-medium">Connected to {status.portPath}</div>
                <div className="text-sm text-muted-foreground">
                  Protocol: {status.protocol}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="data-source" className="text-sm">
                  Use Live Vehicle Data
                </Label>
              </div>
              <Switch
                id="data-source"
                checked={dataSource === "obd"}
                onCheckedChange={handleDataSourceToggle}
                data-testid="switch-data-source"
              />
            </div>

            <div className="text-xs text-muted-foreground text-center">
              {dataSource === "obd" 
                ? "Racing with live OBD-II telemetry" 
                : "Using simulated race data"}
            </div>
            
            <Button 
              variant="outline" 
              onClick={handleDisconnect}
              className="w-full"
              data-testid="button-disconnect-obd"
            >
              Disconnect
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Select value={selectedPort} onValueChange={setSelectedPort}>
                <SelectTrigger className="flex-1" data-testid="select-obd-port">
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
                            <span className="text-xs text-muted-foreground">
                              ({port.manufacturer})
                            </span>
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
                data-testid="button-scan-ports"
              >
                <RefreshCw className={`w-4 h-4 ${isScanning ? "animate-spin" : ""}`} />
              </Button>
            </div>

            {status.error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20 text-sm text-destructive">
                <AlertCircle className="w-4 h-4" />
                {status.error}
              </div>
            )}

            <Button
              onClick={handleConnect}
              disabled={!selectedPort || isConnecting}
              className="w-full"
              data-testid="button-connect-obd"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Bluetooth className="w-4 h-4 mr-2" />
                  Connect to OBD-II
                </>
              )}
            </Button>

            <div className="text-xs text-muted-foreground text-center">
              Make sure your ELM327 adapter is paired via Bluetooth
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
