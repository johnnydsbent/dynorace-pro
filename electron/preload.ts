import { contextBridge, ipcRenderer } from "electron";

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

export interface OBDApi {
  listPorts: () => Promise<OBDPort[]>;
  connect: (portPath: string, carId: number) => Promise<{ success: boolean; error?: string }>;
  disconnect: (carId: number) => Promise<{ success: boolean; error?: string }>;
  sendCommand: (command: string, carId: number) => Promise<string>;
  startLiveData: (carId: number) => Promise<{ success: boolean; error?: string }>;
  stopLiveData: (carId: number) => Promise<{ success: boolean; error?: string }>;
  onTelemetry: (carId: number, callback: (data: OBDTelemetry) => void) => () => void;
  onData: (carId: number, callback: (data: string) => void) => () => void;
}

const obdApi: OBDApi = {
  listPorts: () => ipcRenderer.invoke("obd:list-ports"),
  connect: (portPath: string, carId: number) => ipcRenderer.invoke("obd:connect", { portPath, carId }),
  disconnect: (carId: number) => ipcRenderer.invoke("obd:disconnect", { carId }),
  sendCommand: (command: string, carId: number) => ipcRenderer.invoke("obd:send-command", { command, carId }),
  startLiveData: (carId: number) => ipcRenderer.invoke("obd:start-live-data", { carId }),
  stopLiveData: (carId: number) => ipcRenderer.invoke("obd:stop-live-data", { carId }),

  onTelemetry: (carId: number, callback: (data: OBDTelemetry) => void) => {
    const channel = `obd:telemetry:${carId}`;
    const handler = (_event: any, data: OBDTelemetry) => callback(data);
    ipcRenderer.on(channel, handler);
    return () => ipcRenderer.removeListener(channel, handler);
  },

  onData: (carId: number, callback: (data: string) => void) => {
    const channel = `obd:data:${carId}`;
    const handler = (_event: any, data: string) => callback(data);
    ipcRenderer.on(channel, handler);
    return () => ipcRenderer.removeListener(channel, handler);
  },
};

contextBridge.exposeInMainWorld("obd", obdApi);

contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,
  platform: process.platform,
});
