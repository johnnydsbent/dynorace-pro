# DynoRace Pro Installation Guide

Complete installation instructions for Windows PC and macOS.

---

## System Requirements

### Windows PC
- Windows 10 or later (64-bit)
- Node.js 18 or later (for development builds)
- 4GB RAM minimum (8GB recommended)
- 500MB free disk space
- Bluetooth adapter (for OBD-II connectivity)
- USB port (for wired OBD-II adapters)

### macOS
- macOS Monterey (12.0) or later
- Intel Mac or Apple Silicon (M1/M2/M3)
- Node.js 18 or later (for development builds)
- 4GB RAM minimum (8GB recommended)
- 500MB free disk space
- Bluetooth capability (built-in on all modern Macs)

### OBD-II Adapter Requirements
- ELM327-compatible Bluetooth OBD-II adapter
- Supports OBD-II protocol (1996+ vehicles)
- Recommended adapters: OBDLink MX+, BAFX Products, Veepeak

---

## Installation Options

DynoRace Pro can be run in two modes:

| Mode | OBD Support | Use Case |
|------|-------------|----------|
| **Web Browser** | No | Quick access, simulated racing only |
| **Desktop App** | Yes | Full OBD-II connectivity with real vehicles |

---

## Option 1: Web Browser (Simulated Racing Only)

The web version runs in any modern browser but does not support OBD-II connectivity.

### Running the Web Application

1. **Open a terminal/command prompt**
2. **Navigate to the project directory**
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Start the development server:**
   ```bash
   npm run dev
   ```
5. **Open your browser to:** `http://localhost:5000`

The web application provides full simulated racing functionality without OBD-II support.

---

## Option 2: Desktop Application (OBD-II Enabled)

The desktop application uses Electron to provide native Bluetooth access for OBD-II connectivity.

### Prerequisites

1. **Install Node.js 18+** from [nodejs.org](https://nodejs.org)
2. **Pair your Bluetooth OBD-II adapter** (see Bluetooth Pairing section below)

### Running the Desktop App in Development Mode

The desktop app runs alongside the development server for live reload and OBD-II connectivity:

#### Step 1: Install Dependencies
```bash
npm install
```

#### Step 2: Start the Development Server (Terminal 1)
```bash
npm run dev
```
Keep this terminal running. The web server starts at `http://localhost:5000`.

#### Step 3: Build and Launch Electron (Terminal 2)

Open a new terminal and run:
```bash
npx tsc -p electron/tsconfig.json
NODE_ENV=development npx electron electron/main.js
```

On Windows Command Prompt:
```cmd
npx tsc -p electron/tsconfig.json
set NODE_ENV=development && npx electron electron/main.js
```

On Windows PowerShell:
```powershell
npx tsc -p electron/tsconfig.json
$env:NODE_ENV="development"; npx electron electron/main.js
```

The Electron app will open and connect to the development server. OBD-II functionality will now be available.

### Production Builds (Not Yet Configured)

Building standalone distributable installers (.exe, .dmg) is not currently configured in this project. This would require:
- Complete `electron-builder.yml` configuration with appId, productName, and file lists
- Code signing certificates for Windows and macOS
- Asset bundling to package the built frontend with Electron
- Production build scripts

For development and testing, use the development mode described above. See the [electron-builder documentation](https://www.electron.build) for production packaging setup.

---

## Bluetooth Pairing (Required for OBD-II)

Before using OBD-II features, pair your adapter with your computer.

### Windows Bluetooth Pairing

1. **Plug the OBD-II adapter into your vehicle's OBD-II port**
   - Located under the dashboard, driver's side
   - Turn the vehicle ignition to ON (engine can be off)
2. **Open Windows Settings > Bluetooth & devices**
3. **Click Add device > Bluetooth**
4. **Wait for your adapter to appear** (usually named "OBD-II", "ELM327", or "OBDII")
5. **Click on the adapter name to pair**
6. **Enter the pairing code if prompted** (usually `1234` or `0000`)
7. **Wait for "Connected" status**

### macOS Bluetooth Pairing

1. **Plug the OBD-II adapter into your vehicle's OBD-II port**
   - Located under the dashboard, driver's side
   - Turn the vehicle ignition to ON (engine can be off)
2. **Open System Preferences > Bluetooth**
3. **Wait for your adapter to appear in the device list**
4. **Click Connect next to the adapter name**
5. **Enter the pairing code if prompted** (usually `1234` or `0000`)
6. **Status should show "Connected"**

### macOS Permissions

When running the desktop app for the first time on macOS:
1. You may see a security warning - right-click the app and select "Open"
2. Grant Bluetooth access when prompted
3. If not prompted, enable in System Preferences > Privacy & Security > Bluetooth

---

## Verifying Installation

After launching DynoRace Pro, verify the installation:

1. **Application Opens Successfully**
   - The main dashboard should display
   - The "Select Race Type" section should be visible
   - The "Dyno Machines" section shows both Dynojet systems

2. **OBD-II Detection** (Desktop App Only)
   - Look for the "OBD Connection" card on the home screen
   - If running in browser, you'll see "Desktop App Required" message
   - In the desktop app, click the refresh button to scan for adapters
   - Paired adapters should appear in the dropdown

3. **Dyno Health Monitor**
   - Click "Dyno Health" in the header
   - Both Dynojet 1 and Dynojet 2 should show green "Optimal" status
   - Temperature should display around 85°F

---

## Troubleshooting

### Windows Issues

**App won't start**
- Ensure you have the latest Windows updates
- Try running as Administrator (right-click > Run as Administrator)
- Check Windows Defender didn't quarantine the app

**Bluetooth adapter not found**
- Ensure adapter is plugged into vehicle
- Confirm vehicle ignition is ON
- Try removing and re-pairing the adapter
- Restart Bluetooth in Windows Settings

**SmartScreen blocks installation**
- This is normal for new applications
- Click "More info" then "Run anyway"

### macOS Issues

**App is damaged or can't be opened**
- Right-click the app and select Open (don't double-click)
- Go to System Preferences > Privacy & Security > Allow app

**Bluetooth permission denied**
- Open System Preferences > Privacy & Security > Bluetooth
- Ensure DynoRace Pro has a checkmark
- If not listed, reinstall the application

**Adapter not appearing**
- Turn Bluetooth off and on again
- Ensure adapter has power (LED should be on)
- Try forgetting the device and re-pairing

---

## Uninstallation

### Development Installation
Simply delete the project folder to remove DynoRace Pro.

### Distributable Installers

**Windows:**
1. Open Settings > Apps > Installed apps
2. Search for "DynoRace Pro"
3. Click the three dots menu
4. Select **Uninstall**
5. Follow the prompts

**macOS:**
1. Open Applications folder
2. Drag DynoRace Pro to the Trash
3. Empty the Trash

---

## Next Steps

After successful installation, proceed to the [Operation Manual](OPERATION_MANUAL.md) to learn how to:
- Connect to your OBD-II adapter
- Configure race settings
- Run head-to-head drag races
- View and print race results
- Monitor dyno health

---

## Support

For additional help:
- Review the [Operation Manual](OPERATION_MANUAL.md) for usage instructions
- Check the Troubleshooting section above
- Ensure your OBD-II adapter is properly paired with your computer
