"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const serialport_1 = require("serialport");
const serialport_2 = require("serialport");
let mainWindow = null;
const serialPorts = new Map();
const parsers = new Map();
const pollingIntervals = new Map();
const isDev = process.env.NODE_ENV === "development";
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 768,
        title: "DynoRace Pro",
        icon: path_1.default.join(__dirname, "../public/favicon.ico"),
        webPreferences: {
            preload: path_1.default.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
        },
        backgroundColor: "#09090b",
    });
    if (isDev) {
        mainWindow.loadURL("http://localhost:5000");
        mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadFile(path_1.default.join(__dirname, "../dist/public/index.html"));
    }
    mainWindow.on("closed", () => {
        mainWindow = null;
        for (const [, port] of serialPorts) {
            if (port.isOpen) port.close();
        }
        serialPorts.clear();
        parsers.clear();
        for (const [, interval] of pollingIntervals) clearInterval(interval);
        pollingIntervals.clear();
    });
}
electron_1.app.whenReady().then(createWindow);
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
electron_1.app.on("activate", () => {
    if (mainWindow === null) {
        createWindow();
    }
});
electron_1.ipcMain.handle("obd:list-ports", async () => {
    try {
        const ports = await serialport_1.SerialPort.list();
        return ports.filter(port => {
            const manufacturer = (port.manufacturer || "").toLowerCase();
            const portPath = port.path || "";
            const vendorId = port.vendorId || "";
            return (manufacturer.includes("elm") ||
                manufacturer.includes("obd") ||
                manufacturer.includes("ftdi") ||
                manufacturer.includes("prolific") ||
                vendorId === "0403" ||
                vendorId === "067B" ||
                portPath.includes("Bluetooth") ||
                portPath.includes("rfcomm") ||
                portPath.includes("tty.OBD") ||
                portPath.includes("tty.SLAB") ||
                portPath.includes("ttyUSB") ||
                portPath.includes("COM"));
        });
    }
    catch (error) {
        console.error("Error listing ports:", error);
        return [];
    }
});
electron_1.ipcMain.handle("obd:connect", async (_event, { portPath, carId }) => {
    try {
        const existing = serialPorts.get(carId);
        if (existing === null || existing === void 0 ? void 0 : existing.isOpen) {
            await new Promise((resolve) => existing.close(() => resolve()));
        }
        const port = new serialport_1.SerialPort({
            path: portPath,
            baudRate: 38400,
            dataBits: 8,
            stopBits: 1,
            parity: "none",
        });
        const parser = port.pipe(new serialport_2.ReadlineParser({ delimiter: "\r" }));
        serialPorts.set(carId, port);
        parsers.set(carId, parser);
        parser.on("data", (data) => {
            const cleanData = data.trim();
            if (cleanData && mainWindow) {
                mainWindow.webContents.send(`obd:data:${carId}`, cleanData);
            }
        });
        await new Promise((resolve, reject) => {
            port.on("open", () => {
                console.log(`Serial port opened for car ${carId}`);
                resolve();
            });
            port.on("error", (err) => {
                console.error(`Serial port error for car ${carId}:`, err);
                reject(err);
            });
        });
        await initializeELM327(carId);
        return { success: true };
    }
    catch (error) {
        console.error("Connection error:", error);
        return { success: false, error: error.message };
    }
});
electron_1.ipcMain.handle("obd:disconnect", async (_event, { carId }) => {
    try {
        stopPollingOBDData(carId);
        const port = serialPorts.get(carId);
        if (port === null || port === void 0 ? void 0 : port.isOpen) {
            await new Promise((resolve) => port.close(() => resolve()));
        }
        serialPorts.delete(carId);
        parsers.delete(carId);
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
electron_1.ipcMain.handle("obd:send-command", async (_event, { command, carId }) => {
    try {
        const port = serialPorts.get(carId);
        if (!(port === null || port === void 0 ? void 0 : port.isOpen)) throw new Error("Port not connected");
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error("Command timeout"));
            }, 2000);
            const parser = parsers.get(carId);
            const responseHandler = (data) => {
                clearTimeout(timeout);
                parser === null || parser === void 0 ? void 0 : parser.removeListener("data", responseHandler);
                resolve(data.trim());
            };
            parser === null || parser === void 0 ? void 0 : parser.on("data", responseHandler);
            port.write(`${command}\r`);
        });
    }
    catch (error) {
        return { error: error.message };
    }
});
electron_1.ipcMain.handle("obd:start-live-data", async (_event, { carId }) => {
    const port = serialPorts.get(carId);
    if (!(port === null || port === void 0 ? void 0 : port.isOpen)) return { success: false, error: "Not connected" };
    startPollingOBDData(carId);
    return { success: true };
});
electron_1.ipcMain.handle("obd:stop-live-data", async (_event, { carId }) => {
    stopPollingOBDData(carId);
    return { success: true };
});
async function initializeELM327(carId) {
    const initCommands = ["ATZ", "ATE0", "ATL0", "ATS0", "ATH0", "ATSP0"];
    for (const cmd of initCommands) {
        await sendCommand(carId, cmd);
        await delay(100);
    }
}
function sendCommand(carId, cmd) {
    return new Promise((resolve) => {
        const port = serialPorts.get(carId);
        const parser = parsers.get(carId);
        if (!(port === null || port === void 0 ? void 0 : port.isOpen)) { resolve(""); return; }
        const timeout = setTimeout(() => resolve(""), 1500);
        const handler = (data) => {
            clearTimeout(timeout);
            parser === null || parser === void 0 ? void 0 : parser.removeListener("data", handler);
            resolve(data.trim());
        };
        parser === null || parser === void 0 ? void 0 : parser.once("data", handler);
        port.write(`${cmd}\r`);
    });
}
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const OBD_PIDS = {
    SPEED: "010D",
    RPM: "010C",
    THROTTLE: "0111",
    COOLANT_TEMP: "0105",
    ENGINE_LOAD: "0104",
};
function parseOBDResponse(response, pid) {
    const cleaned = response.replace(/[\s>]/g, "").toUpperCase();
    if (cleaned.includes("NODATA") || cleaned.includes("ERROR") || cleaned.length < 4) return null;
    try {
        const bytes = cleaned.match(/.{1,2}/g) || [];
        switch (pid) {
            case "010D": return parseInt(bytes[2], 16) * 0.621371;
            case "010C": return ((parseInt(bytes[2], 16) * 256) + parseInt(bytes[3], 16)) / 4;
            case "0111": return (parseInt(bytes[2], 16) * 100) / 255;
            case "0105": return (parseInt(bytes[2], 16) - 40) * 9 / 5 + 32;
            case "0104": return (parseInt(bytes[2], 16) * 100) / 255;
            default: return null;
        }
    }
    catch (_a) {
        return null;
    }
}
function estimateGear(rpm, speed) {
    if (speed < 1 || rpm < 500) return 0;
    const ratio = rpm / speed;
    if (ratio > 150) return 1;
    if (ratio > 100) return 2;
    if (ratio > 70) return 3;
    if (ratio > 50) return 4;
    if (ratio > 35) return 5;
    return 6;
}
async function pollOBDData(carId) {
    const port = serialPorts.get(carId);
    if (!(port === null || port === void 0 ? void 0 : port.isOpen) || !mainWindow) return;
    try {
        const speedResponse = await sendCommand(carId, OBD_PIDS.SPEED);
        const speed = parseOBDResponse(speedResponse, OBD_PIDS.SPEED);
        const rpmResponse = await sendCommand(carId, OBD_PIDS.RPM);
        const rpm = parseOBDResponse(rpmResponse, OBD_PIDS.RPM);
        const throttleResponse = await sendCommand(carId, OBD_PIDS.THROTTLE);
        const throttle = parseOBDResponse(throttleResponse, OBD_PIDS.THROTTLE);
        const telemetry = {
            timestamp: Date.now(),
            mph: speed !== null && speed !== void 0 ? speed : 0,
            rpm: rpm !== null && rpm !== void 0 ? rpm : 0,
            throttlePct: throttle !== null && throttle !== void 0 ? throttle : 0,
            gear: estimateGear(rpm !== null && rpm !== void 0 ? rpm : 0, speed !== null && speed !== void 0 ? speed : 0),
            distanceFt: 0,
        };
        mainWindow.webContents.send(`obd:telemetry:${carId}`, telemetry);
    }
    catch (error) {
        console.error(`OBD polling error for car ${carId}:`, error);
    }
}
function startPollingOBDData(carId) {
    const existing = pollingIntervals.get(carId);
    if (existing) clearInterval(existing);
    const interval = setInterval(() => pollOBDData(carId), 100);
    pollingIntervals.set(carId, interval);
}
function stopPollingOBDData(carId) {
    const interval = pollingIntervals.get(carId);
    if (interval) {
        clearInterval(interval);
        pollingIntervals.delete(carId);
    }
}
