# DynoRace Pro - Virtual Drag Racing Application

## Overview

DynoRace Pro is a virtual drag racing simulator featuring dual Dynojet dyno simulation. The application allows users to run head-to-head drag races between two virtual cars with realistic physics, real-time telemetry visualization, and detailed race results. It supports multiple race types including dig starts, rolling starts, 1/8 mile, and 1/2 mile races.

**New Features:**
- OBD-II connectivity via Bluetooth ELM327 adapters for real vehicle telemetry
- Desktop application for Windows and MacOS with native Bluetooth access
- Support for both simulated racing and live vehicle data

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Context API for race state (`RaceProvider`), TanStack Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens for racing-themed aesthetics
- **Animations**: Framer Motion for race countdown and telemetry animations
- **Charts**: Recharts for performance visualization

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **Build Tool**: Vite for frontend bundling, esbuild for server bundling
- **API Pattern**: RESTful endpoints under `/api/*` prefix
- **Development**: Vite dev server with HMR proxied through Express

### Desktop Application (Electron)
- **Framework**: Electron for cross-platform desktop app
- **Build Tool**: electron-builder for creating Windows (.exe) and MacOS (.dmg) installers
- **Native Access**: SerialPort library for Bluetooth OBD-II communication
- **Entitlements**: MacOS entitlements for Bluetooth, serial, and USB access

### Monitor Screen
- **Purpose**: Full-screen display for racers optimized for large monitors and 4K projectors
- **Features**: Dual large speedometers, real-time telemetry, progress bars, elapsed timer, leader/winner indicators
- **Access**: `/monitor` route or "Monitor" link in header
- **Full-screen**: Click expand button, auto-hides controls after 3 seconds
- **Typography**: Extra-large (text-7xl to text-9xl) for 15-20 foot viewing distance

### Garage System
- **Purpose**: Persistent storage for car configurations
- **Features**: Create, edit, delete cars with specs (name, make/model, HP, weight, drivetrain, color)
- **Persistence**: Cars saved to `server/data/cars.json` and persist across server restarts
- **Integration**: Garage cars automatically load into race context on app start
- **Access**: `/garage` route or "Garage" link in header

### OBD-II Integration (Dual Simultaneous)
- **Protocol Support**: OBD-II (1996+ vehicles), basic OBD-I support planned
- **Adapter Support**: Bluetooth ELM327 adapters (most common)
- **Dual Connections**: Two independent OBD connections — one per lane (carId 1 or 2)
- **Data Points**: Speed (MPH), RPM, Throttle Position, Gear (estimated), Coolant Temp
- **Communication**: Serial-over-Bluetooth via node-serialport (Map-based dual port management)
- **PIDs Supported**: 010D (Speed), 010C (RPM), 0111 (Throttle), 0105 (Coolant Temp), 0104 (Engine Load)
- **IPC Channels**: `obd:telemetry:1` and `obd:telemetry:2` for per-lane telemetry routing
- **Race Modes**: Lane 1 OBD only, Lane 2 OBD only, Both OBD, or fully simulated

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Zod for runtime validation, drizzle-zod for schema-to-validation integration
- **Storage**: In-memory storage implementation (`server/storage.ts`) with interface for database migration
- **Migrations**: Drizzle Kit for schema migrations (`drizzle.config.ts`)

### Key Design Patterns
- **Shared Types**: TypeScript types defined in `shared/schema.ts` are used by both frontend and backend
- **Path Aliases**: `@/` maps to client source, `@shared/` maps to shared modules
- **Component Structure**: UI primitives in `components/ui/`, feature components at `components/` root
- **Race Simulation**: Client-side physics simulation with configurable parameters based on car horsepower and weight
- **OBD Service**: Singleton service (`client/src/lib/obd-service.ts`) managing Bluetooth connection and telemetry streaming

### Race System Architecture
- **Race Types**: dig (standing start), roll (40 mph rolling start), eighth (1/8 mile), half (1/2 mile)
- **Telemetry**: Real-time speed, RPM, gear, distance, and throttle data sampled at 50ms intervals (100ms for OBD)
- **Christmas Tree**: Authentic drag racing countdown light sequence with reaction time tracking
- **Results**: Comprehensive timing splits (60ft, 330ft, 660ft, trap speed, top speed)

## Building Desktop Application

### Development Mode

To run the Electron desktop app in development mode:

1. **Start the dev server**: `npm run dev` (keep running)
2. **In a new terminal, build Electron**: `npx tsc -p electron/tsconfig.json`
3. **Launch Electron with dev flag**: `NODE_ENV=development npx electron electron/main.js`

The app connects to `http://localhost:5000` when NODE_ENV is set to development.

### Production Installers

**Local Build (ZIP format):**
Run the build script from the project root:
```bash
./scripts/build-electron.sh
```
This creates `release/DynoRace Pro-1.0.0-mac.zip` containing the macOS app bundle.

**GitHub Actions (DMG format):**
The project includes a GitHub Actions workflow (`.github/workflows/build-macos.yml`) that automatically builds a proper .dmg installer on macOS runners:
- **Trigger**: Push a version tag (e.g., `git tag v1.0.0 && git push --tags`)
- **Manual**: Run from GitHub Actions tab using "workflow_dispatch"
- **Output**: DMG file uploaded as artifact and attached to GitHub Release

Note: Building .dmg requires macOS-specific tools and can only be done on actual Mac hardware or GitHub's macOS runners.

## Documentation

- **docs/INSTALLATION_GUIDE.md** - Step-by-step installation instructions for Windows and macOS
- **docs/OPERATION_MANUAL.md** - Complete operation manual for using the application

## External Dependencies

### Database
- **PostgreSQL**: Primary database via `DATABASE_URL` environment variable
- **Drizzle ORM**: Database toolkit with PostgreSQL driver
- **connect-pg-simple**: Session storage for Express (available but sessions not currently implemented)

### Third-Party Services
- No external APIs currently integrated
- Race physics simulation runs client-side or uses live OBD data

### Key NPM Packages
- **@tanstack/react-query**: Server state management and data fetching
- **framer-motion**: Animation library for race UI
- **recharts**: Charting library for performance graphs
- **wouter**: Lightweight React router
- **zod**: Schema validation
- **lucide-react**: Icon library
- **electron**: Desktop application framework
- **electron-builder**: App packaging and distribution
- **serialport**: Serial port communication for OBD adapters

### Development Tools
- **Vite**: Frontend build tool with React plugin
- **tsx**: TypeScript execution for development
- **drizzle-kit**: Database migration management
- **@replit/vite-plugin-***: Replit-specific development plugins
