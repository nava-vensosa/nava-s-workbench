# Fibril Controller Circuit Design

A low-latency musical instrument controller implementing the Fibril algorithm on Raspberry Pi 5 hardware with comprehensive input sensing and real-time audio/visual output.

## Table of Contents
- [Project Overview](#project-overview)
- [Hardware Platform](#hardware-platform)
- [Input Interface Design](#input-interface-design)
- [R/2R Ladder Design](#r2r-ladder-design)
- [Power Supply Analysis](#power-supply-analysis)
- [ADC Requirements](#adc-requirements)
- [Software Stack](#software-stack)
- [Pin Allocation](#pin-allocation)
- [Next Steps](#next-steps)

---

## Project Overview

The Fibril Controller is a hardware interface for the Fibril algorithm—a vectorized Bayesian MIDI note selection system. This controller provides an expressive, low-latency (<5ms) input system for musical performance, combining:

- **40 GPIO pins** for button arrays with simultaneous press detection
- **18 analog inputs** for continuous parameter control (potentiometers)
- **Dual output** via HDMI (visual feedback) and stereo instrument jack (audio)
- **Real-time processing** using Python/NumPy, C, and Swift with Metal rendering

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FIBRIL CONTROLLER                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  INPUT LAYER                  PROCESSING LAYER               │
│  ┌──────────────┐            ┌──────────────┐               │
│  │ Button Arrays│───────────▶│  Raspberry   │               │
│  │ (R/2R ADC)   │  GPIO/ADC  │  Pi 5        │               │
│  │              │            │              │               │
│  │ 18 Pots      │───────────▶│ • Python/    │               │
│  │ (0-3.3V)     │  ADC       │   NumPy Core │               │
│  │              │            │ • C GPIO Poll│               │
│  │ Toggles      │───────────▶│ • Swift/Metal│               │
│  └──────────────┘            │   Render     │               │
│                              └──────┬───────┘               │
│                                     │                        │
│                              OUTPUT LAYER                    │
│                              ┌──────▼───────┐               │
│                              │ HDMI Display │               │
│                              │ Audio Out    │               │
│                              └──────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

For details on the Fibril algorithm implementation, see [NUMPY_IMPLEMENTATION.md](./NUMPY_IMPLEMENTATION.md).

---

## Hardware Platform

### Raspberry Pi 5 Specifications

| Feature | Specification | Relevance to Project |
|---------|--------------|---------------------|
| **GPIO Pins** | 40-pin header (28 usable GPIO) | Need ~15-20 for button arrays |
| **ADC** | None (external required) | Must add MCP3008 or ADS1115 |
| **CPU** | Quad-core ARM Cortex-A76 @ 2.4GHz | Sufficient for real-time processing |
| **RAM** | 4GB/8GB LPDDR4X | Adequate for NumPy operations |
| **Power** | 5V/5A via USB-C (25W) | Powering peripherals requires analysis |
| **GPIO Power Pins** | 5V and 3.3V rails available | Limited current capacity |
| **HDMI** | 2× micro-HDMI 4K60 | Visual feedback output |
| **Audio** | 4-pole 3.5mm A/V jack | Requires external DAC for quality |

### Key Limitations

1. **No built-in ADC**: Raspberry Pi 5 cannot directly read analog voltages from potentiometers or R/2R ladders
2. **Limited GPIO current**: Each pin sources max 16mA; total GPIO rail limited to ~50mA
3. **Audio quality**: Onboard audio insufficient for professional instrument output

---

## Input Interface Design

### Component Inventory

| Component Type | Quantity | Buttons per Array | ADC Channels Needed | GPIO Pins Alternative |
|----------------|----------|-------------------|---------------------|----------------------|
| **Rank Arrays** | 8 | 4 | 8 | 32 (if using GPIO directly) |
| **KeySelector Arrays** | 4 | 3 | 4 | 12 |
| **VL Toggle Arrays** | 2 | 2 | 2 | 4 |
| **Sustain Toggle** | 1 | 1 | 0 | 1 (direct GPIO) |
| **Scramble Arrays** | 3 | 3 | 3 | 9 |
| **Scramble Selector** | 1 | 3 | 1 | 3 |
| **Potentiometers** | 18 | N/A | 18 | N/A |
| **TOTAL** | **37** | **90 buttons** | **36 ADC channels** | **61 GPIO pins** |

### Design Decision: R/2R Ladders + External ADC

Since we need to detect **multiple simultaneous button presses** within each array, and the Raspberry Pi lacks sufficient GPIO pins (need 61, have ~28 usable), we will:

1. Use **R/2R ladder networks** to convert button combinations into unique voltage levels
2. Read these voltages via **external multi-channel ADC modules**
3. Reserve direct GPIO for the single Sustain Toggle

### Button Array Mapping

#### Rank Arrays (8 arrays × 4 buttons)
- **Purpose**: Select pitch rank for note generation
- **Simultaneous presses**: Yes (e.g., pressing buttons 1+3 creates chord)
- **Voltage levels needed**: 2⁴ = 16 distinct voltage states per array

#### KeySelector Arrays (4 arrays × 3 buttons)
- **Purpose**: Choose key/scale context
- **Simultaneous presses**: Yes (mode modifiers)
- **Voltage levels needed**: 2³ = 8 distinct states per array

#### Scramble Arrays (3 arrays × 3 buttons)
- **Purpose**: Control algorithmic randomization
- **Simultaneous presses**: Yes
- **Voltage levels needed**: 2³ = 8 distinct states per array

#### VL Toggle Arrays (2 arrays × 2 buttons)
- **Purpose**: Voice leading mode toggles
- **Simultaneous presses**: Possible (both pressed = third state)
- **Voltage levels needed**: 2² = 4 distinct states per array

#### Scramble Selector (1 array × 3 buttons)
- **Purpose**: Choose scramble algorithm
- **Simultaneous presses**: Yes
- **Voltage levels needed**: 2³ = 8 distinct states

---

## R/2R Ladder Design

### Multi-Button Detection Challenge

Standard R/2R ladders assume **one button pressed at a time**. For **simultaneous detection**, each button combination must produce a unique voltage. With 4 buttons, we have 16 possible states (including all released).

### Circuit Design

```
    3.3V
     │
     ├──────[R]────┤ Button 0 (MSB)
     │             │
     ├────[2R]─────┤ Button 1
     │             │
     ├────[4R]─────┤ Button 2
     │             │
     ├────[8R]─────┤ Button 3 (LSB)
     │             │
     └─────[Rload]─┴──────> To ADC Input
                   │
                  GND
```

### Recommended Component Values

| Parameter | Value | Reasoning |
|-----------|-------|-----------|
| **Base Resistor (R)** | 10kΩ | Low power consumption, sufficient resolution |
| **Button 0 Resistor** | 10kΩ | MSB, largest voltage contribution |
| **Button 1 Resistor** | 20kΩ | 2× base |
| **Button 2 Resistor** | 40kΩ | 4× base |
| **Button 3 Resistor** | 80kΩ | 8× base (LSB) |
| **Load Resistor (Rload)** | 10kΩ | Pull-down to GND |
| **Supply Voltage** | 3.3V | Match Raspberry Pi GPIO logic level |

### Voltage Levels (4-Button Array Example)

| Buttons Pressed | Binary | Approx. Voltage | ADC Value (12-bit) |
|-----------------|--------|-----------------|-------------------|
| None | 0000 | 0.00V | 0 |
| Button 3 | 0001 | 0.25V | 310 |
| Button 2 | 0010 | 0.48V | 595 |
| Button 2+3 | 0011 | 0.69V | 860 |
| Button 1 | 0100 | 0.89V | 1100 |
| ... | ... | ... | ... |
| All 4 | 1111 | 3.08V | 3820 |

**Note**: Actual voltages depend on resistor tolerances (use 1% or better for consistency).

### ADC Resolution Requirements

- **12-bit ADC** (4096 levels): ~0.8mV per step → sufficient for 16-state detection with noise margin
- **10-bit ADC** (1024 levels): Marginal, requires excellent resistor matching
- **Recommendation**: Use 16-bit ADC (ADS1115) for maximum reliability

---

## Power Supply Analysis

### Current Draw Calculations

#### Button Arrays (R/2R Ladders)
- **Per array** (all buttons pressed): I = 3.3V / 10kΩ = 0.33mA
- **Total 18 arrays**: 18 × 0.33mA = **6mA**

#### Potentiometers
- Assuming 10kΩ pots with 3.3V supply
- **Per pot** (mid-position): ~0.17mA
- **Total 18 pots**: 18 × 0.17mA = **3mA**

#### External ADC Modules
- **MCP3008** (8-channel SPI): ~1mA per chip @ 3.3V
- Need 5 chips (36 channels): 5 × 1mA = **5mA**
- **Alternative ADS1115** (4-channel I2C): ~150µA per chip
- Need 9 chips: 9 × 0.15mA = **1.4mA**

#### Total Current Draw
- **Sensor circuits**: 6mA + 3mA = 9mA
- **ADCs (MCP3008)**: 5mA
- **Total**: **~14mA from 3.3V rail**

### Raspberry Pi 5 Power Budget

| Rail | Max Current | Our Usage | Headroom |
|------|-------------|-----------|----------|
| **3.3V GPIO** | 500mA | 14mA | ✅ Excellent (486mA free) |
| **5V GPIO** | 1.5A total | 0mA (not used) | N/A |

### Recommendation: Use Onboard 3.3V Supply

**✅ YES**, the Raspberry Pi 5's onboard 3.3V regulator can reliably power all sensors and ADCs.

- Our total draw (14mA) is only **3% of the 500mA capacity**
- Leaves ample headroom for peak transients and future expansion
- No external power supply needed for sensor circuits

**Audio Output**: Use external USB audio interface or I2S DAC for professional stereo instrument output (powered via USB or separate 5V).

---

## ADC Requirements

### Why External ADC?

Raspberry Pi 5 has **no analog-to-digital converter**. To read potentiometers and R/2R ladder voltages, we must add external ADC chips.

### ADC Options Comparison

| Feature | MCP3008 | ADS1115 |
|---------|---------|---------|
| **Resolution** | 10-bit (1024 levels) | 16-bit (65536 levels) |
| **Channels** | 8 single-ended | 4 single-ended |
| **Interface** | SPI | I2C |
| **Sample Rate** | 200kSPS | 860 SPS |
| **Voltage Range** | 0-3.3V | 0-5.5V (programmable gain) |
| **Chips Needed** | 5 (40 channels) | 9 (36 channels) |
| **Cost per Chip** | ~$3 | ~$5 |
| **Total Cost** | ~$15 | ~$45 |

### Recommendation: **MCP3008** (SPI)

**Rationale**:
- **Sufficient resolution** for R/2R ladder state detection (10-bit = 1024 levels for 16 states)
- **High sample rate** (200kSPS) supports <5ms latency requirement
- **Lower cost** ($15 vs $45 for full system)
- **SPI** allows daisy-chaining with chip-select pins

**Alternative**: Use ADS1115 if you need higher precision for subtle potentiometer gestures or plan to implement dynamic gain.

### Channel Allocation (MCP3008 Strategy)

| ADC Chip | Channels | Assignment |
|----------|----------|------------|
| MCP3008 #1 | 8 | Rank Arrays 1-8 |
| MCP3008 #2 | 8 | KeySelector 1-4, VL Toggles 1-2, Scramble 1-2 |
| MCP3008 #3 | 8 | Scramble 3, Scramble Selector, Pots 1-6 |
| MCP3008 #4 | 8 | Pots 7-14 |
| MCP3008 #5 | 8 | Pots 15-18, spares |

**Total**: 5× MCP3008 chips, connected via SPI bus with individual chip-select (CS) pins.

---

## Software Stack

### Multi-Language Architecture

The Fibril Controller uses three languages, each optimized for specific tasks:

```
┌─────────────────────────────────────────────────┐
│              APPLICATION LAYER                  │
│  ┌──────────────────────────────────────────┐  │
│  │  Swift + Metal (macOS/iPadOS)            │  │
│  │  • Cocoa window management               │  │
│  │  • Metal GPU rendering (live visuals)    │  │
│  │  • Real-time data visualization          │  │
│  └────────────────┬─────────────────────────┘  │
│                   │ (Network/IPC)               │
├───────────────────┼─────────────────────────────┤
│  ┌────────────────▼─────────────────────────┐  │
│  │  Python + NumPy (Raspberry Pi)           │  │
│  │  • Fibril algorithm core                 │  │
│  │  • Bayesian note selection               │  │
│  │  • MIDI generation                       │  │
│  │  • Rule application logic                │  │
│  └────────────────┬─────────────────────────┘  │
│                   │                             │
│  ┌────────────────▼─────────────────────────┐  │
│  │  C (Raspberry Pi - Hardware Layer)       │  │
│  │  • GPIO polling (<5ms latency)           │  │
│  │  • SPI communication (MCP3008)           │  │
│  │  • ADC value buffering                   │  │
│  │  • Audio output (I2S/ALSA)               │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### Component Responsibilities

#### 1. C (Low-Latency Hardware Interface)
**Purpose**: Direct hardware access with minimal overhead

- **GPIO Polling**: Read Sustain Toggle state via `libgpiod` or direct `/dev/gpiomem` access
- **SPI Communication**: Read MCP3008 ADC values at 200kHz+
- **Buffering**: Circular buffer for sensor data with timestamp synchronization
- **Audio Output**: ALSA or I2S driver for stereo instrument jack
- **Latency Target**: <1ms sensor read cycle

**Libraries**:
- `pigpio` or `libgpiod` for GPIO
- `spidev` for SPI communication
- `alsa-lib` for audio output

#### 2. Python + NumPy (Algorithm Core)
**Purpose**: Implement Fibril algorithm and MIDI logic

- **Fibril Engine**: Vectorized Bayesian note selection (see [NUMPY_IMPLEMENTATION.md](./NUMPY_IMPLEMENTATION.md))
- **Sensor Mapping**: Convert ADC values to button states and parameter values
- **MIDI Generation**: Convert Fibril output to MIDI note-on/note-off events
- **State Management**: Track musical context, scales, voice leading rules
- **IPC**: Send sensor/MIDI data to visualization layer (OSC, WebSocket, or shared memory)

**Libraries**:
- `numpy` for vectorized operations
- `python-rtmidi` for MIDI output
- `python-osc` or `websockets` for visualization communication

#### 3. Swift + Metal (Visualization)
**Purpose**: GPU-accelerated real-time graphics on macOS/iPadOS

- **Cocoa Windows**: Native macOS window management (AppKit/SwiftUI)
- **Metal Rendering**: GPU compute shaders for particle systems, waveforms, or abstract data viz
- **Data Ingestion**: Receive sensor/MIDI streams from Python via network/IPC
- **Performance Meters**: Display button states, potentiometer values, note activity
- **Target**: 60fps+ rendering

**Frameworks**:
- `AppKit` or `SwiftUI` for UI
- `Metal` for GPU rendering
- `Network` framework for TCP/UDP communication

### Development Environment Setup

#### Raspberry Pi 5 (Debian-based OS)
```bash
# System dependencies
sudo apt update
sudo apt install python3-pip python3-numpy python3-dev
sudo apt install libasound2-dev libgpiod-dev
sudo apt install build-essential git

# Python packages
pip3 install python-rtmidi python-osc spidev

# C compilation
gcc -o fibril_gpio fibril_gpio.c -lgpiod -lspidev -O3
```

#### macOS (Swift Development)
```bash
# Install Xcode from App Store
# Create new Swift project with Metal template
# Configure network listener for Python data stream
```

### Inter-Process Communication

**Recommended**: Use **OSC (Open Sound Control)** protocol over UDP for low-latency, flexible messaging between Python and Swift.

- Python sends: `/sensors/rank/0`, `/midi/note/60/100`, `/pots/0/0.72`
- Swift receives and renders in real-time
- Latency: <5ms over local network

---

## Pin Allocation

### Raspberry Pi 5 GPIO Pinout (40-pin header)

```
    3.3V  (1) (2)  5V
   GPIO2  (3) (4)  5V
   GPIO3  (5) (6)  GND
   GPIO4  (7) (8)  GPIO14
     GND  (9) (10) GPIO15
  GPIO17 (11) (12) GPIO18
  GPIO27 (13) (14) GND
  GPIO22 (15) (16) GPIO23
    3.3V (17) (18) GPIO24
  GPIO10 (19) (20) GND
   GPIO9 (21) (22) GPIO25
  GPIO11 (23) (24) GPIO8
     GND (25) (26) GPIO7
   GPIO0 (27) (28) GPIO1
   GPIO5 (29) (30) GND
   GPIO6 (31) (32) GPIO12
  GPIO13 (33) (34) GND
  GPIO19 (35) (36) GPIO16
  GPIO26 (37) (38) GPIO20
     GND (39) (40) GPIO21
```

### Preliminary Pin Mapping

| GPIO Pin | Function | Notes |
|----------|----------|-------|
| **GPIO2, GPIO3** | I2C (Reserved) | For future expansion |
| **GPIO4** | Sustain Toggle Input | Direct digital read |
| **GPIO7** | SPI CS0 (MCP3008 #1) | Rank Arrays 1-8 |
| **GPIO8** | SPI CS1 (MCP3008 #2) | KeySelector, VL, Scramble |
| **GPIO9** | SPI MISO | Data from MCP3008 |
| **GPIO10** | SPI MOSI | Data to MCP3008 |
| **GPIO11** | SPI SCLK | Clock for SPI |
| **GPIO17** | SPI CS2 (MCP3008 #3) | Pots 1-6 + Scramble |
| **GPIO22** | SPI CS3 (MCP3008 #4) | Pots 7-14 |
| **GPIO27** | SPI CS4 (MCP3008 #5) | Pots 15-18 + spares |
| **GPIO18, 19, 20, 21** | I2S Audio Output | For high-quality DAC |
| **Remaining** | Future expansion | Button LEDs, status indicators |

### SPI Configuration

- **Mode**: SPI Mode 0 (CPOL=0, CPHA=0)
- **Clock Speed**: 1.35MHz (max for MCP3008)
- **Bus**: SPI0 (`/dev/spidev0.0`, `/dev/spidev0.1`)

### I2S Audio (Optional)

If using I2S DAC for stereo output:
- **GPIO18**: I2S BCLK (bit clock)
- **GPIO19**: I2S LRCLK (left/right clock)
- **GPIO21**: I2S DOUT (data out)

---

## Next Steps

### Phase 1: Prototype and Validation ✓ (Current)
- [x] Define system architecture
- [x] Calculate power requirements
- [x] Choose ADC solution (MCP3008)
- [x] Determine resistor values for R/2R ladders
- [ ] **User Review**: Verify README.md accuracy and completeness

### Phase 2: Hardware Implementation Guide (Next)
After README approval, create detailed hardware guide with:

1. **Circuit Schematics**
   - Complete R/2R ladder diagrams for each button array configuration
   - MCP3008 wiring diagrams with pinouts
   - Power distribution schematic
   - I2S audio output circuit

2. **Component Sourcing List**
   - Bill of materials (BOM) with part numbers and suppliers
   - Resistor specifications (1% tolerance, wattage)
   - Potentiometer types (linear vs. logarithmic taper)
   - Recommended PCB layout (or breadboard strategy)

3. **Assembly Instructions**
   - Step-by-step wiring guide
   - Soldering tips for R/2R networks
   - Breadboard layout diagrams
   - Cable management for 18 potentiometers

4. **Testing and Calibration**
   - ADC value verification script (Python)
   - Button state detection validation
   - Latency measurement methodology
   - Audio output quality checks

5. **Enclosure Design**
   - Ergonomic layout for buttons and pots
   - Panel mount specifications
   - 3D-printable enclosure files (optional)

### Phase 3: Software Development
- Implement C GPIO/SPI polling daemon
- Port Fibril algorithm to production code
- Create Swift visualization application
- Integrate OSC communication layer

### Phase 4: Integration and Performance Tuning
- End-to-end latency profiling
- Real-time performance optimization
- User acceptance testing with musicians

---

## References

- **Fibril Algorithm**: [NUMPY_IMPLEMENTATION.md](./NUMPY_IMPLEMENTATION.md)
- **Raspberry Pi 5 Datasheet**: [raspberrypi.com/documentation](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html)
- **MCP3008 Datasheet**: [Microchip MCP3004/3008](https://www.microchip.com/en-us/product/mcp3008)
- **R/2R Ladder Theory**: [Electronics Tutorials - DAC](https://www.electronics-tutorials.ws/combination/r-2r-dac.html)

---

## Contributing

This is a personal hardware project. For questions or collaboration inquiries, please open an issue or contact the project maintainer.

## License

[Specify license - MIT, GPL, proprietary, etc.]

---

**Document Status**: Draft for review
**Last Updated**: 2025-11-11
**Next Review**: After Phase 2 hardware implementation guide completion
