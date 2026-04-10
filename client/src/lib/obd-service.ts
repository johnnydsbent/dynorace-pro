export interface OBDPort {
  path: string;
  manufacturer?: string;
  serialNumber?: string;
  vendorId?: string;
  productId?: string;
}

export interface OBDTelemetry {
  timestamp: number;
  mph: number;
  rpm: number;
  throttlePct: number;
  gear: number;
  distanceFt: number;
}

export interface OBDConnectionStatus {
  connected: boolean;
  portPath: string | null;
  protocol: "OBD-I" | "OBD-II" | null;
  error: string | null;
}

type TelemetryCallback = (data: OBDTelemetry) => void;
type ErrorCallback = (error: string) => void;

class OBDService {
  private status: OBDConnectionStatus = {
    connected: false,
    portPath: null,
    protocol: null,
    error: null,
  };
  
  private telemetryCallbacks: Set<TelemetryCallback> = new Set();
  private errorCallbacks: Set<ErrorCallback> = new Set();
  private cleanupFn: (() => void) | null = null;
  
  isElectron(): boolean {
    return typeof window !== "undefined" && 
           !!(window as any).electronAPI?.isElectron;
  }
  
  getStatus(): OBDConnectionStatus {
    return { ...this.status };
  }
  
  async listPorts(): Promise<OBDPort[]> {
    if (!this.isElectron()) {
      console.warn("OBD functionality requires the desktop app");
      return [];
    }
    
    try {
      const obd = (window as any).obd;
      return await obd.listPorts();
    } catch (error) {
      console.error("Failed to list ports:", error);
      return [];
    }
  }
  
  async connect(portPath: string): Promise<boolean> {
    if (!this.isElectron()) {
      this.status.error = "OBD connectivity requires the desktop app";
      return false;
    }
    
    try {
      const obd = (window as any).obd;
      const result = await obd.connect(portPath);
      
      if (result.success) {
        this.status = {
          connected: true,
          portPath,
          protocol: "OBD-II",
          error: null,
        };
        
        this.cleanupFn = obd.onTelemetry((data: OBDTelemetry) => {
          this.telemetryCallbacks.forEach(cb => cb(data));
        });
        
        return true;
      } else {
        this.status.error = result.error || "Connection failed";
        return false;
      }
    } catch (error: any) {
      this.status.error = error.message;
      return false;
    }
  }
  
  async disconnect(): Promise<void> {
    if (!this.isElectron()) return;
    
    try {
      const obd = (window as any).obd;
      await obd.stopLiveData();
      await obd.disconnect();
      
      if (this.cleanupFn) {
        this.cleanupFn();
        this.cleanupFn = null;
      }
      
      this.status = {
        connected: false,
        portPath: null,
        protocol: null,
        error: null,
      };
    } catch (error) {
      console.error("Disconnect error:", error);
    }
  }
  
  async startLiveData(): Promise<boolean> {
    if (!this.isElectron() || !this.status.connected) {
      return false;
    }
    
    try {
      const obd = (window as any).obd;
      const result = await obd.startLiveData();
      return result.success;
    } catch (error) {
      console.error("Failed to start live data:", error);
      return false;
    }
  }
  
  async stopLiveData(): Promise<void> {
    if (!this.isElectron()) return;
    
    try {
      const obd = (window as any).obd;
      await obd.stopLiveData();
    } catch (error) {
      console.error("Failed to stop live data:", error);
    }
  }
  
  onTelemetry(callback: TelemetryCallback): () => void {
    this.telemetryCallbacks.add(callback);
    return () => {
      this.telemetryCallbacks.delete(callback);
    };
  }
  
  onError(callback: ErrorCallback): () => void {
    this.errorCallbacks.add(callback);
    return () => {
      this.errorCallbacks.delete(callback);
    };
  }
  
  private notifyError(error: string): void {
    this.errorCallbacks.forEach(cb => cb(error));
  }
  
  async sendRawCommand(command: string): Promise<string> {
    if (!this.isElectron() || !this.status.connected) {
      return "";
    }
    
    try {
      const obd = (window as any).obd;
      return await obd.sendCommand(command);
    } catch (error) {
      console.error("Command error:", error);
      return "";
    }
  }
  
  async getVehicleInfo(): Promise<{ vin?: string; protocol?: string }> {
    if (!this.status.connected) return {};
    
    try {
      const vinResponse = await this.sendRawCommand("0902");
      return {
        vin: vinResponse || undefined,
        protocol: this.status.protocol || undefined,
      };
    } catch {
      return {};
    }
  }
}

export const obdService = new OBDService();
