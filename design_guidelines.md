# Virtual Drag Racing Application - Design Guidelines

## Design Approach

**Reference-Based:** Inspired by professional racing simulators (iRacing, Gran Turismo) and real-world drag racing timing systems. Focus on high-contrast readability, real-time data visualization, and competitive racing aesthetics.

## Core Design Principles

1. **Instant Readability:** Critical race data must be readable at a glance during high-speed events
2. **Professional Racing Feel:** Mimic authentic drag strip timing systems and professional dyno interfaces
3. **Data Hierarchy:** Live race data prioritized over decorative elements
4. **Competitive Energy:** Design conveys speed, precision, and competition

## Typography

**Primary Font:** Rajdhani (Google Fonts) - Bold, technical, racing-inspired
- Headers: 700 weight, uppercase for race states/titles
- Live Data: 600 weight, tabular numbers for consistent alignment
- Body/Labels: 500 weight

**Secondary Font:** Inter (Google Fonts) - Clean data display
- Results tables, settings, secondary information

**Scale:**
- Race Timer/Speed: text-6xl to text-8xl (massive, instantly readable)
- Section Headers: text-3xl to text-4xl
- Data Labels: text-sm uppercase tracking-wide
- Body: text-base

## Layout System

**Spacing Units:** Tailwind 2, 4, 8, 16 units for consistency
- Component padding: p-4 to p-8
- Section spacing: space-y-8 to space-y-16
- Tight data rows: space-y-2

**Grid Structure:**
- Race View: Full-screen layout with side-by-side car comparison
- Results: 2-column split (summary + detailed breakdown)
- Setup Screen: 3-column grid for race type selection

## Component Library

### Race Interface (Main Screen)

**Dual Dyno Display:**
- Split-screen vertical layout (50/50)
- Left: Car 1 | Right: Car 2
- Each side shows: Car name, Current Speed (huge), RPM, Gear, Distance traveled
- Center: Countdown tree lights (amber/green racing lights)
- Bottom bar: Progress indicators showing position on track (1/8 mile markers)

**Live Metrics Bar (Top):**
- Race type indicator (Dig/Roll/1-8 Mile/1-2 Mile)
- Elapsed time
- Current leader indicator

**Reaction Time Display:**
- Christmas tree staging lights pattern
- Red light detection for false starts
- Reaction time in milliseconds (displayed after green)

### Pre-Race Setup Screen

**Race Type Selection Cards:**
- Large clickable cards in 2x2 grid
- "Dig Racing" | "Roll Racing" | "1/8 Mile" | "1/2 Mile"
- Each card shows: Icon, title, brief description, track length
- Active selection: prominent visual treatment

**Dyno Machine Status:**
- Connection indicators for both dyno units
- Car profiles (name, make/model, power rating)
- Ready status badges

### Results Sheet Screen

**Race Summary Panel:**
- Winner announcement (prominent)
- Side-by-side comparison bars for key metrics
- Time difference/margin of victory

**Detailed Results Table:**
- Reaction Time
- 0-60 mph time
- 60-130 mph time (for roll racing)
- Top Speed
- ET (Elapsed Time)
- Trap Speed
- Distance traveled

**Performance Graph:**
- Speed vs. Time line chart comparing both cars
- Clearly marked milestones (60mph, 100mph points)

**Printable Format:**
- Race header with date/time, track conditions
- Organized data table with clear labels
- QR code for digital access
- Sponsor/branding footer area

### Navigation

**Top Bar:**
- Logo/branding left
- Race mode selector center
- Settings/print controls right

**Quick Actions:**
- "New Race" button (primary CTA)
- "View History" link
- "Print Results" action

## Visual Elements

**Progress Indicators:**
- Horizontal bars showing distance covered on track
- Real-time position markers
- Finish line indicator

**Status Badges:**
- Connection status (dyno machines)
- Race state (Staging/Racing/Complete)
- Warning indicators (false start, mechanical issue)

**Data Visualization:**
- Real-time speed graphs (minimalist line charts)
- Comparison bars for results
- Speedometer-style gauges for RPM

## Images

**Hero Section:** Full-width background image of a professional drag strip at night with timing lights, serves as backdrop for race type selection screen. Image should be slightly darkened (overlay) for text readability.

**Car Placeholders:** During race view, use silhouette graphics or make/model badges rather than full photos to maintain focus on data.

**Background Treatment:** Dark, slightly textured background throughout application to simulate nighttime drag strip atmosphere without distracting from data.

## Interaction States

**Race Countdown:**
- Staging lights animate sequentially
- Amber lights sequence (countdown)
- Green light (go)
- Red light (false start)

**Live Updates:**
- Speed numbers count up smoothly
- Progress bars fill in real-time
- Distance markers highlight as passed

**Transitions:**
- Quick fade between race states (300ms)
- Smooth scale transitions for winner announcement
- No distracting animations during active racing

## Accessibility

- High contrast ratios (minimum 7:1 for racing data)
- Large, legible typography for split-second readability
- Clear visual hierarchies
- Color not sole indicator (use icons + text)
- Keyboard navigation for all controls