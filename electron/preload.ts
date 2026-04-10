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
  connect: (portPath: string) => Promise<{ success: boolean; error?: string }>;
  disconnect: () => Promise<{ success: boolean; error?: string }>;
  sendCommand: (command: string) => Promise<string>;
  startLiveData: () => Promise<{ success: boolean; error?: string }>;
  stopLiveData: () => Promise<{ success: boolean; error?: string }>;
  onTelemetry: (callback: (data: OBDTelemetry) => void) => () => void;
  onData: (callback: (data: string) => void) => () => void;
}

const obdApi: OBDApi = {
  listPorts: () => ipcRenderer.invoke("obd:list-ports"),
  connect: (portPath: string) => ipcRenderer.invoke("obd:connect", portPath),
  disconnect: () => ipcRenderer.invoke("obd:disconnect"),
  sendCommand: (command: string) => ipcRenderer.invoke("obd:send-command", command),
  startLiveData: () => ipcRenderer.invoke("obd:start-live-data"),
  stopLiveData: () => ipcRenderer.invoke("obd:stop-live-data"),
  
  onTelemetry: (callback: (data: OBDTelemetry) => void) => {
    const handler = (_event: any, data: OBDTelemetry) => callback(data);
    ipcRenderer.on("obd:telemetry", handler);
    return () => ipcRenderer.removeListener("obd:telemetry", handler);
  },
  
  onData: (callback: (data: string) => void) => {
    const handler = (_event: any, data: string) => callback(data);
    ipcRenderer.on("obd:data", handler);
    return () => ipcRenderer.removeListener("obd:data", handler);
  },
};

contextBridge.exposeInMainWorld("obd", obdApi);

contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,
  platform: process.platform,
});
