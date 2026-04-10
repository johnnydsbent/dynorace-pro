"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const obdApi = {
    listPorts: () => electron_1.ipcRenderer.invoke("obd:list-ports"),
    connect: (portPath, carId) => electron_1.ipcRenderer.invoke("obd:connect", { portPath, carId }),
    disconnect: (carId) => electron_1.ipcRenderer.invoke("obd:disconnect", { carId }),
    sendCommand: (command, carId) => electron_1.ipcRenderer.invoke("obd:send-command", { command, carId }),
    startLiveData: (carId) => electron_1.ipcRenderer.invoke("obd:start-live-data", { carId }),
    stopLiveData: (carId) => electron_1.ipcRenderer.invoke("obd:stop-live-data", { carId }),
    onTelemetry: (carId, callback) => {
        const channel = `obd:telemetry:${carId}`;
        const handler = (_event, data) => callback(data);
        electron_1.ipcRenderer.on(channel, handler);
        return () => electron_1.ipcRenderer.removeListener(channel, handler);
    },
    onData: (carId, callback) => {
        const channel = `obd:data:${carId}`;
        const handler = (_event, data) => callback(data);
        electron_1.ipcRenderer.on(channel, handler);
        return () => electron_1.ipcRenderer.removeListener(channel, handler);
    },
};
electron_1.contextBridge.exposeInMainWorld("obd", obdApi);
electron_1.contextBridge.exposeInMainWorld("electronAPI", {
    isElectron: true,
    platform: process.platform,
});
