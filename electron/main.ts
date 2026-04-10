import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";
import { SerialPort } from "serialport";
import { ReadlineParser } from "serialport";

let mainWindow: BrowserWindow | null = null;
let serialPort: SerialPort | null = null;
let parser: ReadlineParser | null = null;

const isDev = process.env.NODE_ENV === "development";

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    title: "DynoRace Pro",
    icon: path.join(__dirname, "../public/favicon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    backgroundColor: "#09090b",
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5000");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
    if (serialPort?.isOpen) {
      serialPort.close();
    }
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.handle("obd:list-ports", async () => {
  try {
    const ports = await SerialPort.list();
    return ports.filter(port => {
      const manufacturer = (port.manufacturer || "").toLowerCase();
      const path = port.path || "";
      const vendorId = port.vendorId || "";
      
      return (
        manufacturer.includes("elm") ||
        manufacturer.includes("obd") ||
        manufacturer.includes("ftdi") ||
        manufacturer.includes("prolific") ||
        vendorId === "0403" ||
        vendorId === "067B" ||
        path.includes("Bluetooth") ||
        path.includes("rfcomm") ||
        path.includes("tty.OBD") ||
        path.includes("tty.SLAB") ||
        path.includes("ttyUSB") ||
        path.includes("COM")
      );
    });
  } catch (error) {
    console.error("Error listing ports:", error);
    return [];
  }
});

ipcMain.handle("obd:connect", async (_event, portPath: string) => {
  try {
    if (serialPort?.isOpen) {
      await new Promise<void>((resolve) => serialPort!.close(() => resolve()));
    }

    serialPort = new SerialPort({
      path: portPath,
      baudRate: 38400,
      dataBits: 8,
      stopBits: 1,
      parity: "none",
    });

    parser = serialPort.pipe(new ReadlineParser({ delimiter: "\r" }));

    parser.on("data", (data: string) => {
      const cleanData = data.trim();
      if (cleanData && mainWindow) {
        mainWindow.webContents.send("obd:data", cleanData);
      }
    });

    await new Promise<void>((resolve, reject) => {
      serialPort!.on("open", () => {
        console.log("Serial port opened");
        resolve();
      });
      serialPort!.on("error", (err) => {
        console.error("Serial port error:", err);
        reject(err);
      });
    });

    await initializeELM327();
    return { success: true };
  } catch (error: any) {
    console.error("Connection error:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("obd:disconnect", async () => {
  try {
    if (serialPort?.isOpen) {
      await new Promise<void>((resolve) => serialPort!.close(() => resolve()));
    }
    serialPort = null;
    parser = null;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("obd:send-command", async (_event, command: string) => {
  try {
    if (!serialPort?.isOpen) {
      throw new Error("Port not connected");
    }
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Command timeout"));
      }, 2000);

      const responseHandler = (data: string) => {
        clearTimeout(timeout);
        parser?.removeListener("data", responseHandler);
        resolve(data.trim());
      };

      parser?.on("data", responseHandler);
      serialPort!.write(`${command}\r`);
    });
  } catch (error: any) {
    return { error: error.message };
  }
});

ipcMain.handle("obd:start-live-data", async () => {
  if (!serialPort?.isOpen) {
    return { success: false, error: "Not connected" };
  }

  startPollingOBDData();
  return { success: true };
});

ipcMain.handle("obd:stop-live-data", async () => {
  stopPollingOBDData();
  return { success: true };
});

let pollingInterval: NodeJS.Timeout | null = null;

async function initializeELM327() {
  const initCommands = [
    "ATZ",
    "ATE0",
    "ATL0",
    "ATS0",
    "ATH0",
    "ATSP0",
  ];

  for (const cmd of initCommands) {
    await sendCommand(cmd);
    await delay(100);
  }
}

function sendCommand(cmd: string): Promise<string> {
  return new Promise((resolve) => {
    if (!serialPort?.isOpen) {
      resolve("");
      return;
    }

    const timeout = setTimeout(() => resolve(""), 1500);
    
    const handler = (data: string) => {
      clearTimeout(timeout);
      parser?.removeListener("data", handler);
      resolve(data.trim());
    };

    parser?.once("data", handler);
    serialPort.write(`${cmd}\r`);
  });
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const OBD_PIDS = {
  SPEED: "010D",
  RPM: "010C",
  THROTTLE: "0111",
  COOLANT_TEMP: "0105",
  ENGINE_LOAD: "0104",
  FUEL_LEVEL: "012F",
};

function parseOBDResponse(response: string, pid: string): number | null {
  const cleaned = response.replace(/[\s>]/g, "").toUpperCase();
  
  if (cleaned.includes("NODATA") || cleaned.includes("ERROR") || cleaned.length < 4) {
    return null;
  }

  try {
    const bytes = cleaned.match(/.{1,2}/g) || [];
    
    switch (pid) {
      case "010D":
        const speedByte = parseInt(bytes[2], 16);
        return speedByte * 0.621371;
        
      case "010C":
        const rpmA = parseInt(bytes[2], 16);
        const rpmB = parseInt(bytes[3], 16);
        return ((rpmA * 256) + rpmB) / 4;
        
      case "0111":
        const throttleByte = parseInt(bytes[2], 16);
        return (throttleByte * 100) / 255;
        
      case "0105":
        const tempByte = parseInt(bytes[2], 16);
        return (tempByte - 40) * 9/5 + 32;
        
      case "0104":
        const loadByte = parseInt(bytes[2], 16);
        return (loadByte * 100) / 255;
        
      default:
        return null;
    }
  } catch {
    return null;
  }
}

async function pollOBDData() {
  if (!serialPort?.isOpen || !mainWindow) return;

  try {
    const speedResponse = await sendCommand(OBD_PIDS.SPEED);
    const speed = parseOBDResponse(speedResponse, OBD_PIDS.SPEED);

    const rpmResponse = await sendCommand(OBD_PIDS.RPM);
    const rpm = parseOBDResponse(rpmResponse, OBD_PIDS.RPM);

    const throttleResponse = await sendCommand(OBD_PIDS.THROTTLE);
    const throttle = parseOBDResponse(throttleResponse, OBD_PIDS.THROTTLE);

    const telemetry = {
      timestamp: Date.now(),
      mph: speed ?? 0,
      rpm: rpm ?? 0,
      throttlePct: throttle ?? 0,
      gear: estimateGear(rpm ?? 0, speed ?? 0),
      distanceFt: 0,
    };

    mainWindow.webContents.send("obd:telemetry", telemetry);
  } catch (error) {
    console.error("OBD polling error:", error);
  }
}

function estimateGear(rpm: number, speed: number): number {
  if (speed < 1 || rpm < 500) return 0;
  
  const ratio = rpm / speed;
  
  if (ratio > 150) return 1;
  if (ratio > 100) return 2;
  if (ratio > 70) return 3;
  if (ratio > 50) return 4;
  if (ratio > 35) return 5;
  return 6;
}

function startPollingOBDData() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }
  pollingInterval = setInterval(pollOBDData, 100);
}

function stopPollingOBDData() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}
