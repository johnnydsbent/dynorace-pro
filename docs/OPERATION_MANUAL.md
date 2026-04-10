# DynoRace Pro Operation Manual

Step-by-step guide to operating DynoRace Pro for virtual drag racing.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Main Dashboard Overview](#main-dashboard-overview)
3. [Connecting to OBD-II](#connecting-to-obd-ii)
4. [Selecting a Race Type](#selecting-a-race-type)
5. [Starting a Race](#starting-a-race)
6. [Racing Interface](#racing-interface)
7. [Race Results](#race-results)
8. [Dyno Health Monitoring](#dyno-health-monitoring)
9. [Tips and Best Practices](#tips-and-best-practices)

---

## Getting Started

### Launching the Application

**Web Browser (Development):**
1. Run `npm run dev` in the project directory
2. Open your browser to `http://localhost:5000`
3. The main dashboard will display
4. Note: OBD-II connectivity requires the desktop application

**Desktop App (Electron):**
1. Build and run the Electron app (see Installation Guide)
2. The application will open to the main dashboard
3. Full OBD-II connectivity is available

### Understanding Data Sources

DynoRace Pro supports two data sources:

| Mode | Description | Requirements |
|------|-------------|--------------|
| **Simulated** | Virtual race using physics simulation | None (default) |
| **OBD-II Live** | Real vehicle telemetry | Desktop app + OBD adapter |

---

## Main Dashboard Overview

The main dashboard contains these key sections:

### Header
- **DynoRace Pro Logo** - Click to return home from any page
- **Dyno Health Link** - Click to view dyno temperatures (shows warning icon if dynos are hot)
- **Theme Toggle** - Switch between light and dark mode

### Select Race Type (Left Panel)
Choose from four racing formats:
- **Dig Racing** - Standing start, 1/4 mile
- **Roll Racing** - 40 MPH rolling start
- **1/8 Mile** - 660 feet from standing start
- **1/2 Mile** - Half-mile runway racing

### Dyno Machines (Left Panel)
Shows the status of both Dynojet systems:
- **Dynojet 1 (Lane 1)** - Left lane vehicle
- **Dynojet 2 (Lane 2)** - Right lane vehicle
- Connection status and assigned vehicle info

### OBD Connection (Left Panel)
Manage Bluetooth OBD-II adapter connection (desktop app only)

### Ready to Race (Right Panel)
- Summary of current race configuration
- Start Race button (enabled when ready)
- Quick Stats showing session data

---

## Connecting to OBD-II

### Prerequisites
- DynoRace Pro desktop application (not browser)
- Bluetooth ELM327 OBD-II adapter
- Adapter paired with your computer (see Installation Guide)
- Vehicle with ignition ON

### Connection Steps

1. **Ensure Adapter is Paired**
   - Adapter should be plugged into vehicle OBD-II port
   - Vehicle ignition turned to ON position
   - Adapter LED should be illuminated

2. **Locate the OBD Connection Panel**
   - Scroll down on the main dashboard
   - Find the "OBD Connection" card

3. **Scan for Adapters**
   - Click the refresh button next to the port dropdown
   - Wait for the scan to complete
   - Available adapters will appear in the dropdown

4. **Select Your Adapter**
   - Click the dropdown menu
   - Select your adapter from the list
   - Adapters show as path (e.g., "COM3" on Windows, "/dev/tty.OBD" on Mac)

5. **Connect**
   - Click the **Connect to OBD-II** button
   - Wait for connection to establish
   - Status will change to "Connected"
   - The ELM327 adapter will be initialized automatically

6. **Enable Live Data**
   - After connection, toggle "Use Live Vehicle Data" to ON
   - Racing will now use real-time telemetry from your vehicle

### Connection Status Indicators

| Status | Meaning |
|--------|---------|
| Green "Connected" badge | Successfully connected to adapter |
| Gray "Disconnected" badge | No active connection |
| Red error message | Connection failed (check troubleshooting) |

### Disconnecting

1. Click the **Disconnect** button in the OBD Connection panel
2. Status will return to "Disconnected"
3. Racing will automatically switch back to simulated mode

---

## Selecting a Race Type

### Available Race Types

#### Dig Racing (1/4 Mile)
- **Description:** Traditional drag racing from a standing start
- **Distance:** 1,320 feet (1/4 mile)
- **Start:** Both vehicles begin from 0 MPH
- **Best for:** Classic drag racing experience

#### Roll Racing (40 MPH Start)
- **Description:** Racing from a rolling start
- **Distance:** 1/4 mile
- **Start:** Both vehicles begin at 40 MPH
- **Best for:** Highway-style acceleration contests

#### 1/8 Mile
- **Description:** Shorter drag racing format
- **Distance:** 660 feet (1/8 mile)
- **Start:** Standing start from 0 MPH
- **Best for:** Quick races, lower-powered vehicles

#### 1/2 Mile
- **Description:** Extended distance racing
- **Distance:** 2,640 feet (1/2 mile)
- **Start:** Standing start from 0 MPH
- **Best for:** Top speed testing, high-powered vehicles

### Selecting Your Race

1. Find the "Select Race Type" section
2. Click on your desired race format
3. The selected option will highlight
4. Your selection appears in the "Ready to Race" summary

---

## Starting a Race

### Pre-Race Checklist

Before starting, verify:
- [ ] Race type is selected (one of the four options highlighted)
- [ ] Both dyno machines are available in the Dyno Machines section
- [ ] If using OBD, adapter shows "Connected" in the OBD Connection panel
- [ ] Lane assignments show the correct vehicles

### Starting the Race

1. Review the "Ready to Race" panel on the right
2. Confirm all settings are correct
3. Click the **Start Race** button
4. You'll be taken to the racing interface

### Race Cannot Start?

If the Start Race button is disabled:
- Ensure a race type is selected
- Verify both dynos are connected
- Check for any error messages

---

## Racing Interface

### Christmas Tree Staging Lights

The race begins with an authentic drag racing light sequence:

1. **Pre-Stage** (Yellow) - First car staged
2. **Stage** (Yellow) - Second car staged
3. **Amber Sequence** - Three amber lights count down
4. **Green Light** - GO! Race begins
5. **Red Light** - Displayed on false start

### Race Display Layout

```
+------------------+------------------+
|     LANE 1       |     LANE 2       |
|  (Left Dyno)     |  (Right Dyno)    |
+------------------+------------------+
|   Speedometer    |   Speedometer    |
|    [0-200 MPH]   |    [0-200 MPH]   |
+------------------+------------------+
|   RPM Gauge      |   RPM Gauge      |
+------------------+------------------+
|   Live Metrics   |   Live Metrics   |
| - Speed          | - Speed          |
| - RPM            | - RPM            |
| - Distance       | - Distance       |
| - Gear           | - Gear           |
+------------------+------------------+
```

### Real-Time Telemetry

During the race, you'll see live updates for each lane:
- **Speed (MPH)** - Current velocity
- **RPM** - Engine revolutions per minute
- **Distance** - Distance traveled in feet
- **Gear** - Current gear (estimated)
- **Throttle** - Throttle position percentage

### Race Controls

- **Abort Race** - Cancel the race and return home
- **View Results** - Appears when race completes

---

## Race Results

After crossing the finish line, the results screen displays:

### Timing Data

| Metric | Description |
|--------|-------------|
| **Reaction Time** | Time between green light and launch |
| **60 ft** | Time to cover first 60 feet |
| **330 ft** | Time at 330-foot mark |
| **660 ft (1/8)** | Time at 1/8 mile mark |
| **Elapsed Time** | Total time from start to finish |
| **Trap Speed** | Speed at the finish line |
| **Top Speed** | Maximum speed reached |

### Winner Declaration

- Winning lane is highlighted
- Winner's time displayed prominently
- Margin of victory shown

### Results Options

1. **Print Results**
   - Click "Print Results" button in the header
   - Opens a printable results sheet in a new window
   - Includes all timing data and race details

2. **New Race**
   - Click "New Race" button in the header
   - Returns to the home dashboard
   - Previous race data is saved to the pass log

3. **Dyno Health Check**
   - A color-coded indicator shows dyno temperatures after the race
   - Green = Ready for more passes
   - Amber = Warming up, monitor temperatures
   - Orange/Red = Cooldown recommended before next race
   - Click the indicator to view detailed temperatures and pass log

---

## Garage

The Garage allows you to create, customize, and save car configurations that persist across sessions.

### Accessing the Garage

1. Click "Garage" in the header navigation
2. Or navigate directly to `/garage`

### Managing Cars

**Adding a New Car:**
1. Click "Add Car" button
2. Fill in car details:
   - **Car Name**: A friendly name for the car
   - **Make/Model**: e.g., "2024 Ford Mustang GT"
   - **Drivetrain**: RWD, FWD, or AWD
   - **Horsepower**: Use slider (50-2000 HP)
   - **Weight**: Use slider (1500-6000 lbs)
   - **Color**: Pick from color picker or enter hex value
3. Click "Add Car" to save

**Editing a Car:**
1. Click the pencil icon on any car card
2. Modify the settings
3. Click "Save Changes"

**Deleting a Car:**
1. Click the trash icon on any car card
2. Confirm deletion in the dialog

### Car Specifications

Cars show key performance metrics:
- **Horsepower (HP)**: Engine power output
- **Weight (lbs)**: Vehicle weight
- **HP/ton**: Power-to-weight ratio (higher is faster)
- **Drivetrain**: RWD, FWD, or AWD badge

### Persistence

All car configurations are automatically saved and will persist:
- Across browser refreshes
- Across server restarts
- Cars are stored in `server/data/cars.json`

---

## Monitor Screen

The Monitor Screen provides a full-screen display optimized for large monitors and 4K projectors, allowing racers to see their progress in real-time.

### Accessing the Monitor Screen

1. Click "Monitor" in the header navigation
2. Or navigate directly to `/monitor`

### Display Features

The Monitor Screen shows:
- **Dual Large Speedometers**: Extra-large gauges for both lanes, visible from 15-20 feet away
- **Real-time Telemetry**: RPM, gear, distance, and dyno temperature for each lane
- **Race Progress Bar**: Visual indicator showing both cars' progress toward the finish line
- **Elapsed Timer**: Large countdown timer visible from distance
- **Leader Indicator**: Shows which car is currently in the lead
- **Winner Display**: Prominent winner announcement when race completes

### Full-Screen Mode

- Click the expand button in the top-right corner to enter full-screen mode
- Move the mouse to show/hide the control bar
- Controls auto-hide after 3 seconds for clean projection
- Press Escape or click minimize button to exit full-screen

### Recommended Setup

1. **Split Screen**: Run the main application on your control screen, monitor view on the racer-facing display
2. **4K Projector**: Full-screen mode on projector for optimal visibility
3. **Large Monitor**: Position where racers can see their telemetry in real-time

### Display Tips

- High-contrast black background works in any lighting condition
- Large typography (8xl-9xl) ensures readability from distance
- Color-coded lanes match car configuration
- Hot dyno warnings appear prominently with pulsing indicators

---

## Dyno Health Monitoring

### Accessing Dyno Health

1. Click **Dyno Health** in the header
2. Or look for the thermometer icon (pulses red when hot)

### Temperature Status Levels

| Status | Temperature | Indicator |
|--------|-------------|-----------|
| **Optimal** | Below 120°F | Green |
| **Warm** | 120-150°F | Amber |
| **Hot** | 150-180°F | Orange |
| **Critical** | Above 180°F | Red |

### Temperature Behavior

- Dynos start at 85°F (room temperature)
- Each race increases temperature:
  - Dig Racing: +15-23°F
  - Roll Racing: +12-20°F
  - 1/8 Mile: +10-18°F
  - 1/2 Mile: +22-30°F
- Dynos cool down over time (0.5°F every 2 seconds)

### Dyno Health Dashboard

Each dyno card displays:
- Current temperature with gauge
- Status badge (Optimal/Warm/Hot/Critical)
- Total pass count
- Time since last pass
- Peak temperature reached

### Pass Log

The Pass Log section shows recent race history:
- Dyno identifier (D1 or D2)
- Car name
- Race type
- Elapsed time
- Top speed
- Temperature after the pass
- Timestamp

### Managing High Temperatures

When dynos run hot:
1. A warning banner appears at the top
2. Header icon pulses red
3. **Allow cooldown** before the next race
4. Or click **Reset Temps** to manually reset (simulates cooling period)

---

## Tips and Best Practices

### For Best OBD-II Performance

1. **Position the adapter securely**
   - Ensure firm connection to OBD port
   - Avoid dangling cables

2. **Keep adapter close**
   - Bluetooth range is typically 30 feet
   - Stay in or near the vehicle

3. **Monitor connection**
   - Watch for disconnection warnings
   - Reconnect if needed before racing

### For Accurate Race Results

1. **Warm up the dynos**
   - Run a few practice passes first
   - Let simulation stabilize

2. **Consistent race conditions**
   - Note the track conditions displayed
   - Temperature and humidity affect times

3. **Monitor dyno temperatures**
   - Don't run consecutive races when hot
   - Allow cooldown between sessions

### Data Management

1. **Track your progress**
   - Use the pass log to monitor improvement
   - Compare times across race types

2. **Print results**
   - Keep records of personal bests
   - Document vehicle modifications

---

## Quick Reference

### Status Icons

| Icon | Meaning |
|------|---------|
| Green badge | Connected/Optimal |
| Amber/Orange indicator | Warning/Hot temperature |
| Red indicator | Error/Critical |
| Pulsing thermometer | Dyno needs cooldown |

---

## Need Help?

- Review the [Installation Guide](INSTALLATION_GUIDE.md) for setup issues
- Check the Dyno Health page for system status
- Ensure OBD adapter is properly connected
- Try restarting the application if issues persist
