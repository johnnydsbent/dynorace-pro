"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const obdApi = {
    listPorts: () => electron_1.ipcRenderer.invoke("obd:list-ports"),
    connect: (portPath) => electron_1.ipcRenderer.invoke("obd:connect", portPath),
    disconnect: () => electron_1.ipcRenderer.invoke("obd:disconnect"),
    sendCommand: (command) => electron_1.ipcRenderer.invoke("obd:send-command", command),
    startLiveData: () => electron_1.ipcRenderer.invoke("obd:start-live-data"),
    stopLiveData: () => electron_1.ipcRenderer.invoke("obd:stop-live-data"),
    onTelemetry: (callback) => {
        const handler = (_event, data) => callback(data);
        electron_1.ipcRenderer.on("obd:telemetry", handler);
        return () => electron_1.ipcRenderer.removeListener("obd:telemetry", handler);
    },
    onData: (callback) => {
        const handler = (_event, data) => callback(data);
        electron_1.ipcRenderer.on("obd:data", handler);
        return () => electron_1.ipcRenderer.removeListener("obd:data", handler);
    },
};
electron_1.contextBridge.exposeInMainWorld("obd", obdApi);
electron_1.contextBridge.exposeInMainWorld("electronAPI", {
    isElectron: true,
    platform: process.platform,
});
