# MathViz - Mathematical Visualization Engine

A C++ GUI application for creating educational mathematical visualization videos through live-coding with a three-panel interface.

## Current Status: Phase 1 - Core Infrastructure & GUI Foundation

This is the initial implementation demonstrating:
- Three-panel GUI layout (View, Script, Console)
- GLFW + OpenGL + Dear ImGui integration
- Basic scene graph (Scene → Frame → Body)
- Panel navigation with Prefix + h/k/l (Ctrl+B by default)
- Simple rendering (lines, circles)

## Building

### Prerequisites

- CMake 3.15+
- C++17 compatible compiler (GCC, Clang, MSVC)
- OpenGL 4.1+
- GLFW3
- GLEW
- GLM (OpenGL Mathematics)
- Dear ImGui (included as submodule or copy to `external/imgui/`)

### macOS

```bash
# Install dependencies via Homebrew
brew install cmake glfw glew glm

# Clone Dear ImGui into external/
cd mathviz
git clone https://github.com/ocornut/imgui.git external/imgui

# Build
mkdir build
cd build
cmake ..
make

# Run
./mathviz
```

### Linux

```bash
# Install dependencies (Ubuntu/Debian)
sudo apt-get install cmake libglfw3-dev libglew-dev libglm-dev

# Clone Dear ImGui
cd mathviz
git clone https://github.com/ocornut/imgui.git external/imgui

# Build
mkdir build
cd build
cmake ..
make

# Run
./mathviz
```

### Windows

Use vcpkg for dependencies:

```cmd
vcpkg install glfw3 glew glm

cd mathviz
git clone https://github.com/ocornut/imgui.git external\imgui

mkdir build
cd build
cmake .. -DCMAKE_TOOLCHAIN_FILE=[path to vcpkg]/scripts/buildsystems/vcpkg.cmake
cmake --build .

mathviz.exe
```

## Usage (Phase 1)

Launch the application:
```bash
./mathviz
```

You'll see three panels:
- **Top (View Panel)**: Animation display
- **Bottom-left (Script Panel)**: Command log (Vim editor coming in Phase 4)
- **Bottom-right (Console Panel)**: Live command input

### Panel Navigation

Press `Ctrl+B` then:
- `h` - Focus Script Panel (left)
- `k` - Focus View Panel (up)
- `l` - Focus Console Panel (right)

### Available Commands (Phase 1)

In the Console Panel:
- `clear` - Clear console output
- Type any text and press Enter - it will be logged

More commands will be available in Phase 3 (Command Parser & Scene Graph).

## Project Structure

```
mathviz/
├── CMakeLists.txt
├── README.md
├── include/               # Header files
│   ├── core/             # Scene, Frame, Body, Application
│   ├── gui/              # Panel system
│   ├── renderer/         # OpenGL rendering
│   └── parser/           # Command parser (placeholder)
├── src/                  # Implementation files
│   ├── core/
│   ├── gui/
│   ├── renderer/
│   ├── parser/
│   └── main.cpp
├── shaders/              # GLSL shaders
├── external/
│   └── imgui/           # Dear ImGui library (clone here)
└── tests/               # Unit tests (coming later)
```

## Development Roadmap

- [x] Phase 1: Core Infrastructure & GUI Foundation (Current)
- [ ] Phase 2: Panel System & Input Routing
- [ ] Phase 3: Command Parser & Scene Graph
- [ ] Phase 4: Vim Editor Implementation
- [ ] Phase 5: Math Engine
- [ ] Phase 6-15: Advanced features
- [ ] Phase 16: Font Design Application

See `implementation_guide.md` for full roadmap.

## Next Steps

Phase 2 will implement:
- Full input routing to active panel
- Improved panel focus indication
- Console command history (up/down arrows)
- Basic test scene rendering

Phase 3 will add:
- Command parsing (init, create, set)
- Scene graph construction from commands
- Actual rendering of user-defined shapes

## License

TBD

## Contributing

This is a work in progress. Check the implementation guide for areas to contribute.
