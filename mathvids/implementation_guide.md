# Mathematical Visualization Engine - Implementation Guide

## Overview
This guide provides a technical roadmap for implementing the Mathematical Visualization Engine in C++. It covers architecture, module design, data structures, algorithms, and development phases.

The application features a **three-panel GUI** with Vim-style navigation:
- **Top panel (2/3 screen)**: Animation viewing window
- **Bottom-left panel (1/6 screen)**: Editable script/command log (Vim motions)
- **Bottom-right panel (1/6 screen)**: Live console and command input

## Technology Stack

### Core Language
- **C++17 or later** - Modern C++ features, move semantics, smart pointers

### Graphics & Rendering
- **OpenGL 4.5+** - Modern programmable pipeline with GLSL shaders
- **GLEW** - OpenGL Extension Wrangler for loading extensions
- **GLFW** - Window creation, input handling, and panel management
- **GLM** (OpenGL Mathematics) - Vector/matrix math, transformations

### GUI Framework
- **Dear ImGui** - Immediate-mode GUI for panels, console, basic UI elements
- **Custom Vim Editor** - Text editing with Vim motions for script panel

### Video Encoding
- **FFmpeg (libav)** - Video encoding pipeline
  - `libavcodec` - H.264 codec
  - `libavformat` - MP4 container format
  - `libavutil` - Utilities
  - `libswscale` - Pixel format conversion (RGB → YUV)

### Parsing & Data Structures
- **Custom Markdown Parser** - Lightweight command script parser
- **Standard Library** - `std::vector`, `std::map`, `std::unordered_map`, smart pointers

### Mathematical Libraries
- **Custom Math Engine** - Expression parser and evaluator
  - Alternative: **muParser** or **ExprTk** for expression parsing
- **Eigen** (optional) - Linear algebra for constraint solving

### Font Rendering
- **FreeType** - TrueType font loading and rasterization
- **Custom Font Loader** - Binary .font format support

### Build System
- **CMake** - Cross-platform build configuration
- **vcpkg** or **Conan** - Dependency management (optional but recommended)

## Project Structure

```
mathviz/
├── CMakeLists.txt
├── include/
│   ├── core/
│   │   ├── Scene.h
│   │   ├── Frame.h
│   │   ├── Body.h
│   │   └── Application.h
│   ├── gui/
│   │   ├── PanelManager.h
│   │   ├── ViewPanel.h
│   │   ├── ScriptPanel.h
│   │   ├── ConsolePanel.h
│   │   ├── VimEditor.h
│   │   └── InputRouter.h
│   ├── parser/
│   │   ├── CommandParser.h
│   │   └── ExpressionParser.h
│   ├── math/
│   │   ├── Function.h
│   │   ├── Evaluator.h
│   │   └── Projections.h
│   ├── constraints/
│   │   ├── Constraint.h
│   │   └── ConstraintSolver.h
│   ├── animation/
│   │   ├── Interpolator.h
│   │   └── Easing.h
│   ├── renderer/
│   │   ├── Renderer.h
│   │   ├── Shader.h
│   │   ├── Buffer.h
│   │   └── Texture.h
│   └── export/
│       └── VideoExporter.h
├── src/
│   ├── core/
│   ├── gui/
│   ├── parser/
│   ├── math/
│   ├── constraints/
│   ├── animation/
│   ├── renderer/
│   ├── export/
│   └── main.cpp
├── shaders/
│   ├── line.vert
│   ├── line.frag
│   ├── glow.frag
│   ├── text.vert
│   ├── text.frag
│   └── ...
├── external/
│   └── imgui/           # Dear ImGui library
├── tests/
└── examples/
```

## Module Architecture

### 1. Application Core
**Purpose**: Main application loop, window management, mode coordination

**Classes**:
- `Application` - Entry point, initialization, main loop
- `ExportMode` - Headless video rendering mode (optional command-line flag)

**Responsibilities**:
- Parse command-line arguments (GUI mode vs headless export)
- Initialize GLFW window and OpenGL context
- Initialize Dear ImGui
- Initialize panel manager and all subsystems
- Run main loop at 30fps
- Handle high-level events and shutdown

**Key Methods**:
```cpp
class Application {
public:
    void init(int argc, char** argv);
    void run();
    void shutdown();

private:
    enum class Mode { GUI, EXPORT };
    Mode mode_;

    // GUI mode
    GLFWwindow* window_;
    std::unique_ptr<PanelManager> panel_manager_;

    // Shared systems
    std::unique_ptr<Scene> scene_;
    std::unique_ptr<Renderer> renderer_;
    std::unique_ptr<CommandParser> parser_;

    // Export mode
    std::unique_ptr<VideoExporter> exporter_;

    void runGUIMode();
    void runExportMode(const std::string& script_path, const std::string& output_path);
};
```

**Main Loop (GUI Mode)**:
```cpp
void Application::runGUIMode() {
    while (!glfwWindowShouldClose(window_)) {
        // Poll events
        glfwPollEvents();

        // Start ImGui frame
        ImGui_ImplOpenGL3_NewFrame();
        ImGui_ImplGlfw_NewFrame();
        ImGui::NewFrame();

        // Update scene (animations, constraints)
        float dt = 1.0f / 30.0f; // Fixed timestep
        scene_->update(dt);

        // Update and render all panels
        panel_manager_->update(dt);
        panel_manager_->render(*renderer_);

        // Render ImGui
        ImGui::Render();
        ImGui_ImplOpenGL3_RenderDrawData(ImGui::GetDrawData());

        // Swap buffers
        glfwSwapBuffers(window_);
    }
}
```

### 2. GUI System

#### 2.1 PanelManager
**Purpose**: Manage three-panel layout, input routing, panel focus

**Classes**:
- `PanelManager` - Orchestrates all panels and input routing
- `Panel` - Base class for all panels

**Layout**:
```
┌────────────────────────────────────────┐
│                                        │
│          VIEW PANEL (Top 2/3)          │ Active: renders animation
│                                        │
├────────────────────┬───────────────────┤
│  SCRIPT PANEL      │  CONSOLE PANEL    │
│  (Bottom-left 1/6) │  (Bottom-right    │ Active: Vim editor
│                    │   1/6)            │
└────────────────────┴───────────────────┘
```

**Key Methods**:
```cpp
enum class PanelID { VIEW, SCRIPT, CONSOLE };

class PanelManager {
public:
    PanelManager(int window_width, int window_height, Scene* scene);

    void update(float dt);
    void render(Renderer& renderer);
    void handleInput(const InputEvent& event);

    // Panel navigation (Prefix + h/j/k/l)
    void focusPanel(PanelID panel);
    PanelID getActivePanel() const { return active_panel_; }

private:
    std::unique_ptr<ViewPanel> view_panel_;
    std::unique_ptr<ScriptPanel> script_panel_;
    std::unique_ptr<ConsolePanel> console_panel_;

    PanelID active_panel_ = PanelID::VIEW;
    InputRouter input_router_;

    // Panel dimensions
    glm::ivec2 window_size_;
    void updatePanelSizes();
};
```

**Panel Focus Navigation**:
```cpp
// User presses Prefix (e.g., Ctrl+B) then h/j/k/l
// h = left (SCRIPT), j = down (stays on bottom row), k = up (VIEW), l = right (CONSOLE)

void PanelManager::handleInput(const InputEvent& event) {
    // Check for Prefix key combo
    if (input_router_.isPrefixMode()) {
        switch (event.key) {
            case GLFW_KEY_H: focusPanel(PanelID::SCRIPT); break;
            case GLFW_KEY_J: /* Stay on bottom row */ break;
            case GLFW_KEY_K: focusPanel(PanelID::VIEW); break;
            case GLFW_KEY_L: focusPanel(PanelID::CONSOLE); break;
        }
        input_router_.exitPrefixMode();
        return;
    }

    // Route input to active panel
    switch (active_panel_) {
        case PanelID::VIEW:
            view_panel_->handleInput(event);
            break;
        case PanelID::SCRIPT:
            script_panel_->handleInput(event);
            break;
        case PanelID::CONSOLE:
            console_panel_->handleInput(event);
            break;
    }
}
```

#### 2.2 ViewPanel
**Purpose**: Display the animation, provides viewport for scene rendering

**Responsibilities**:
- Render scene to panel area
- Handle camera controls (optional: pan, zoom)
- Display playback controls (play, pause, reset)

**Key Methods**:
```cpp
class ViewPanel : public Panel {
public:
    ViewPanel(const glm::ivec4& viewport, Scene* scene);

    void update(float dt) override;
    void render(Renderer& renderer) override;
    void handleInput(const InputEvent& event) override;

private:
    Scene* scene_;
    glm::ivec4 viewport_; // x, y, width, height
    GLuint framebuffer_;
    GLuint texture_;

    // Playback state
    bool is_playing_ = true;
};
```

**Rendering to Panel**:
```cpp
void ViewPanel::render(Renderer& renderer) {
    // Render scene to framebuffer
    glBindFramebuffer(GL_FRAMEBUFFER, framebuffer_);
    glViewport(0, 0, viewport_.z, viewport_.w);
    renderer.clear(scene_->background_color);
    scene_->render(renderer);
    glBindFramebuffer(GL_FRAMEBUFFER, 0);

    // Display framebuffer texture in ImGui window
    ImGui::SetNextWindowPos(ImVec2(viewport_.x, viewport_.y));
    ImGui::SetNextWindowSize(ImVec2(viewport_.z, viewport_.w));
    ImGui::Begin("View", nullptr, ImGuiWindowFlags_NoTitleBar | ImGuiWindowFlags_NoResize);
    ImGui::Image((void*)(intptr_t)texture_, ImVec2(viewport_.z, viewport_.w));
    ImGui::End();
}
```

#### 2.3 ScriptPanel (Vim Editor)
**Purpose**: Display and edit command history/script with Vim motions

**Responsibilities**:
- Display all executed commands in order
- Allow editing with Vim motions (h/j/k/l, i/a/o, d/y/p, gg/G, /)
- Save to .md file
- Highlight active line
- Execute from specific line (run from line N)

**Key Methods**:
```cpp
class ScriptPanel : public Panel {
public:
    ScriptPanel(const glm::ivec4& viewport);

    void update(float dt) override;
    void render(Renderer& renderer) override;
    void handleInput(const InputEvent& event) override;

    // Command history
    void appendCommand(const std::string& command);
    std::vector<std::string> getCommands() const;
    std::vector<std::string> getCommandsFrom(int line_num) const;

    // File operations
    void loadFromFile(const std::string& path);
    void saveToFile(const std::string& path);

private:
    std::unique_ptr<VimEditor> editor_;
    glm::ivec4 viewport_;
};
```

**VimEditor Class**:
```cpp
enum class VimMode { NORMAL, INSERT, VISUAL, COMMAND };

class VimEditor {
public:
    void handleInput(const InputEvent& event);
    void render(); // Uses ImGui for display

    // Text operations
    void insertLine(const std::string& line);
    void deleteLine(int line_num);
    void setContent(const std::vector<std::string>& lines);
    std::vector<std::string> getContent() const;

    // Cursor movement
    void moveCursor(int dx, int dy);
    void setCursor(int line, int col);
    glm::ivec2 getCursor() const { return cursor_; }

    // Vim mode
    VimMode getMode() const { return mode_; }

private:
    VimMode mode_ = VimMode::NORMAL;
    std::vector<std::string> lines_;
    glm::ivec2 cursor_; // (line, column)

    // Vim state
    std::string register_; // Yank buffer
    std::string command_buffer_; // For : commands
    int repeat_count_ = 0; // For commands like 5dd

    // Mode handlers
    void handleNormalMode(const InputEvent& event);
    void handleInsertMode(const InputEvent& event);
    void handleVisualMode(const InputEvent& event);
    void handleCommandMode(const InputEvent& event);

    // Vim commands
    void command_dd(); // Delete line
    void command_yy(); // Yank line
    void command_p();  // Paste
    void command_gg(); // Go to top
    void command_G();  // Go to bottom
    void command_i();  // Enter insert mode
    void command_a();  // Append
    void command_o();  // Open new line
    // ... more Vim commands
};
```

**Vim Motion Implementation Examples**:
```cpp
void VimEditor::handleNormalMode(const InputEvent& event) {
    switch (event.key) {
        case GLFW_KEY_H: moveCursor(-1, 0); break; // Left
        case GLFW_KEY_J: moveCursor(0, 1); break;  // Down
        case GLFW_KEY_K: moveCursor(0, -1); break; // Up
        case GLFW_KEY_L: moveCursor(1, 0); break;  // Right

        case GLFW_KEY_I: mode_ = VimMode::INSERT; break;
        case GLFW_KEY_A: moveCursor(1, 0); mode_ = VimMode::INSERT; break;
        case GLFW_KEY_O: insertLine(""); moveCursor(0, 1); mode_ = VimMode::INSERT; break;

        case GLFW_KEY_D: // Wait for second 'd'
            if (last_key_ == GLFW_KEY_D) command_dd();
            break;

        case GLFW_KEY_Y:
            if (last_key_ == GLFW_KEY_Y) command_yy();
            break;

        case GLFW_KEY_P: command_p(); break;

        case GLFW_KEY_G:
            if (last_key_ == GLFW_KEY_G) command_gg();
            else last_g_press_ = true;
            break;

        case GLFW_KEY_SLASH: mode_ = VimMode::COMMAND; command_buffer_ = "/"; break;
        case GLFW_KEY_COLON: mode_ = VimMode::COMMAND; command_buffer_ = ":"; break;

        // ... more keys
    }
    last_key_ = event.key;
}

void VimEditor::handleInsertMode(const InputEvent& event) {
    if (event.key == GLFW_KEY_ESCAPE) {
        mode_ = VimMode::NORMAL;
        return;
    }

    // Insert character at cursor
    if (event.action == GLFW_PRESS) {
        lines_[cursor_.y].insert(cursor_.x, 1, event.character);
        cursor_.x++;
    }
}
```

#### 2.4 ConsolePanel
**Purpose**: Live command input, console output, command history

**Responsibilities**:
- Display console output (command feedback, errors, warnings)
- Provide input field for typing commands
- Execute commands on Enter
- Command history (up/down arrows)
- Run animation with `-gg X` flag to start from line X in script panel

**Key Methods**:
```cpp
class ConsolePanel : public Panel {
public:
    ConsolePanel(const glm::ivec4& viewport, CommandParser* parser, Scene* scene);

    void update(float dt) override;
    void render(Renderer& renderer) override;
    void handleInput(const InputEvent& event) override;

    // Output
    void print(const std::string& message, LogLevel level = LogLevel::INFO);

    // Special commands
    void runAnimation(); // Execute all commands in script panel
    void runAnimationFrom(int line_num); // Execute from specific line

private:
    glm::ivec4 viewport_;
    CommandParser* parser_;
    Scene* scene_;

    // Console state
    std::vector<std::string> output_lines_;
    std::string input_buffer_;
    std::vector<std::string> command_history_;
    int history_index_ = -1;

    // Execution
    void executeCommand(const std::string& command);
    void parseAndExecute(const std::string& command);
};
```

**Run Animation Commands**:
```cpp
void ConsolePanel::executeCommand(const std::string& command) {
    // Check for special run commands
    if (command == "run" || command == "r") {
        runAnimation();
        return;
    }

    // Check for run from line: run -gg 10 or r -gg 10
    std::regex run_from_pattern(R"((run|r)\s+-gg\s+(\d+))");
    std::smatch match;
    if (std::regex_match(command, match, run_from_pattern)) {
        int line_num = std::stoi(match[2]);
        runAnimationFrom(line_num);
        return;
    }

    // Normal command execution
    parseAndExecute(command);
}

void ConsolePanel::runAnimation() {
    print("Executing animation from script...", LogLevel::INFO);

    // Get all commands from script panel
    auto commands = panel_manager_->getScriptPanel()->getCommands();

    // Execute each command
    for (const auto& cmd : commands) {
        try {
            auto parsed_cmd = parser_->parseLine(cmd);
            parsed_cmd->execute(*scene_);
            print("> " + cmd, LogLevel::SUCCESS);
        } catch (const std::exception& e) {
            print("ERROR: " + std::string(e.what()), LogLevel::ERROR);
            break; // Stop on error
        }
    }

    print("Animation execution complete.", LogLevel::INFO);
}

void ConsolePanel::runAnimationFrom(int line_num) {
    print("Executing animation from line " + std::to_string(line_num) + "...", LogLevel::INFO);

    // Get commands starting from line_num (0-indexed)
    auto commands = panel_manager_->getScriptPanel()->getCommandsFrom(line_num - 1);

    // Execute each command
    for (const auto& cmd : commands) {
        try {
            auto parsed_cmd = parser_->parseLine(cmd);
            parsed_cmd->execute(*scene_);
            print("> " + cmd, LogLevel::SUCCESS);
        } catch (const std::exception& e) {
            print("ERROR: " + std::string(e.what()), LogLevel::ERROR);
            break;
        }
    }

    print("Animation execution complete.", LogLevel::INFO);
}
```

**Console Rendering**:
```cpp
void ConsolePanel::render(Renderer& renderer) {
    ImGui::SetNextWindowPos(ImVec2(viewport_.x, viewport_.y));
    ImGui::SetNextWindowSize(ImVec2(viewport_.z, viewport_.w));
    ImGui::Begin("Console", nullptr, ImGuiWindowFlags_NoTitleBar | ImGuiWindowFlags_NoResize);

    // Output area (scrollable)
    ImGui::BeginChild("Output", ImVec2(0, -30), true);
    for (const auto& line : output_lines_) {
        ImGui::TextUnformatted(line.c_str());
    }
    if (auto_scroll_) {
        ImGui::SetScrollHereY(1.0f);
    }
    ImGui::EndChild();

    // Input field
    ImGui::Separator();
    ImGui::Text(">");
    ImGui::SameLine();
    if (ImGui::InputText("##input", &input_buffer_, ImGuiInputTextFlags_EnterReturnsTrue)) {
        executeCommand(input_buffer_);
        command_history_.push_back(input_buffer_);
        input_buffer_.clear();
    }

    ImGui::End();
}
```

#### 2.5 InputRouter
**Purpose**: Route keyboard/mouse input to appropriate panel, handle prefix mode

**Responsibilities**:
- Detect prefix key combo (e.g., Ctrl+B)
- Route input to active panel
- Handle global shortcuts

**Key Methods**:
```cpp
class InputRouter {
public:
    void setPrefix(int key, int mods); // Set prefix combo (e.g., Ctrl+B)
    bool isPrefixMode() const { return prefix_active_; }
    void exitPrefixMode() { prefix_active_ = false; }

    InputEvent processInput(GLFWwindow* window, int key, int action, int mods);

private:
    int prefix_key_ = GLFW_KEY_B;
    int prefix_mods_ = GLFW_MOD_CONTROL;
    bool prefix_active_ = false;
};

struct InputEvent {
    int key;
    int action;
    int mods;
    char character;
};
```

### 3. Command Parser
**Purpose**: Parse markdown scripts and console commands into executable command objects

**Classes**:
- `CommandParser` - Main parser interface
- `Command` - Base class for all commands (create, set, animate, constrain)
- `CreateCommand`, `SetCommand`, `AnimateCommand`, `ConstrainCommand` - Specific command types

**Parsing Strategy**:
- Line-by-line parsing
- Regex or manual tokenization for command structure
- Property parsing with `key=value` pairs
- Support for arrays `[1, 2, 3]` and nested structures

**Example Command AST**:
```cpp
struct Command {
    virtual ~Command() = default;
    virtual void execute(Scene& scene) = 0;
};

struct CreateCommand : Command {
    std::string type; // "body", "frame", "scene"
    std::string name;
    std::map<std::string, std::string> properties;

    void execute(Scene& scene) override;
};

struct AnimateCommand : Command {
    std::string target; // "body graph"
    std::map<std::string, float> from_state;
    std::map<std::string, float> to_state;
    float duration;
    EasingType easing;

    void execute(Scene& scene) override;
};
```

**Key Parsing Functions**:
```cpp
class CommandParser {
public:
    std::unique_ptr<Command> parseLine(const std::string& line);
    std::vector<std::unique_ptr<Command>> parseFile(const std::string& path);

private:
    std::map<std::string, std::string> parseProperties(const std::string& props);
    std::vector<float> parseArray(const std::string& array);
    glm::vec3 parseColor(const std::string& color); // "#3498db" -> RGB
};
```

### 4. Scene Graph Manager
**Purpose**: Hierarchical data structure for Scene → Frame → Body relationships

**Classes**:
- `Scene` - Root node, owns frames, manages global state
- `Frame` - Coordinate system, owns bodies
- `Body` - Base class for all visual elements
- `TextBody`, `LineBody`, `PointBody`, `ShapeBody`, etc. - Specific body types

**Scene Graph Structure**:
```cpp
class Scene {
public:
    void addFrame(std::unique_ptr<Frame> frame);
    Frame* getFrame(const std::string& name);
    void update(float dt); // Update all animations
    void render(Renderer& renderer);

    // Scene properties
    ResolutionMode resolution_mode;
    int fps;
    glm::vec3 background_color;
    std::string output_path;

private:
    std::vector<std::unique_ptr<Frame>> frames_;
    std::unordered_map<std::string, Frame*> frame_map_;
};

class Frame {
public:
    void addBody(std::unique_ptr<Body> body);
    Body* getBody(const std::string& name);
    void update(float dt);
    void render(Renderer& renderer);

    // Frame properties
    glm::vec2 position; // Relative to scene origin
    glm::vec2 size;
    float border_thickness;
    glm::vec3 border_color;
    glm::vec3 background_color;
    float alpha;

    // Transform matrix (for moving all child bodies)
    glm::mat4 getTransform() const;

private:
    std::vector<std::unique_ptr<Body>> bodies_;
    std::unordered_map<std::string, Body*> body_map_;
};

class Body {
public:
    virtual ~Body() = default;
    virtual void update(float dt) = 0;
    virtual void render(Renderer& renderer) = 0;
    virtual BoundingBox getBounds() const = 0;

    // Common properties
    std::string name;
    glm::vec2 position; // Relative to parent frame
    glm::vec3 color;
    float alpha;
    float glow_intensity;
    glm::vec3 glow_color;

    // Animation state
    std::unique_ptr<AnimationState> animation;
};
```

**Body Type Hierarchy**:
```cpp
class LineBody : public Body {
public:
    // Properties
    std::vector<glm::vec2> points; // Evaluated function or explicit points
    float thickness;
    ThicknessProfile thickness_profile; // Variable thickness
    ColorProfile color_profile; // Gradient

    // Function-based lines
    std::unique_ptr<Function> function;
    glm::vec2 domain;

    void update(float dt) override;
    void render(Renderer& renderer) override;
};

class TextBody : public Body {
public:
    std::string content;
    Font* font;
    float size;
    float tracking;
    bool ligatures_enabled;

    void update(float dt) override;
    void render(Renderer& renderer) override;
};

class VectorFieldBody : public Body {
public:
    std::unique_ptr<VectorFunction> function;
    float grid_spacing;
    float arrow_scale;

    // Field strength visualization
    bool color_by_magnitude;
    std::vector<glm::vec3> magnitude_gradient;
    glm::vec2 magnitude_range;

    bool scale_by_magnitude;
    float min_scale, max_scale;

    void update(float dt) override;
    void render(Renderer& renderer) override;
};
```

### 5. Math Engine
**Purpose**: Parse and evaluate mathematical expressions, functions, derivatives

**Classes**:
- `Expression` - Abstract syntax tree for mathematical expressions
- `Function` - Represents a mathematical function (explicit, implicit, parametric)
- `Evaluator` - Evaluates expressions at given points
- `Differentiator` - Symbolic or numeric differentiation
- `Projections` - 4D+ projection methods

**Function Types**:
```cpp
enum class FunctionType {
    EXPLICIT,     // y = f(x)
    IMPLICIT,     // f(x,y) = 0
    PARAMETRIC_2D, // [x(t), y(t)]
    PARAMETRIC_3D, // [x(t), y(t), z(t)]
    SURFACE,      // z = f(x,y)
    IMPLICIT_4D   // f(x,y,z,w) = 0
};

class Function {
public:
    Function(const std::string& expression, FunctionType type);

    float evaluate(float x) const; // For explicit functions
    float evaluate(float x, float y) const; // For surfaces
    glm::vec2 evaluateParametric(float t) const; // For parametric curves
    glm::vec3 evaluateSurface(float x, float y) const;

    // Derivatives
    float derivative(float x) const;
    glm::vec2 gradient(float x, float y) const;

    // For implicit functions: find points where f(x,y) = 0
    std::vector<glm::vec2> implicitPoints(const BoundingBox& bounds) const;

private:
    std::unique_ptr<Expression> expr_;
    FunctionType type_;
};
```

**Expression Parsing**:
Use recursive descent parser or integrate library like muParser:
```cpp
class ExpressionParser {
public:
    std::unique_ptr<Expression> parse(const std::string& expr);

private:
    enum class TokenType { NUMBER, VARIABLE, OPERATOR, FUNCTION, LPAREN, RPAREN };
    struct Token { TokenType type; std::string value; };

    std::vector<Token> tokenize(const std::string& expr);
    std::unique_ptr<Expression> parseExpression(const std::vector<Token>& tokens);
};
```

**4D Projections**:
```cpp
class Projections {
public:
    static glm::vec3 stereographic(glm::vec4 point);
    static glm::vec3 perspective(glm::vec4 point, float w_distance);
    static glm::vec3 orthographic(glm::vec4 point, float w_slice);
};
```

### 6. Constraint Solver
**Purpose**: Maintain geometric relationships between bodies during animations

**Classes**:
- `Constraint` - Base class for all constraints
- `ColinearConstraint`, `CotangentConstraint`, `PerpendicularConstraint`, etc.
- `ConstraintSolver` - Solves constraint systems, detects conflicts

**Constraint Interface**:
```cpp
class Constraint {
public:
    virtual ~Constraint() = default;
    virtual bool isSatisfied(const Scene& scene) const = 0;
    virtual void apply(Scene& scene) = 0; // Adjust bodies to satisfy constraint
    virtual bool conflictsWith(const Constraint& other) const = 0;

protected:
    std::vector<std::string> body_names_;
};

class ColinearConstraint : public Constraint {
public:
    ColinearConstraint(const std::vector<std::string>& point_names);
    bool isSatisfied(const Scene& scene) const override;
    void apply(Scene& scene) override;
};

class CotangentConstraint : public Constraint {
public:
    CotangentConstraint(const std::string& line_name,
                        const std::string& curve_name,
                        const std::string& point_name);
    bool isSatisfied(const Scene& scene) const override;
    void apply(Scene& scene) override;
};
```

**Constraint Solver**:
```cpp
class ConstraintSolver {
public:
    void addConstraint(std::unique_ptr<Constraint> constraint);
    void solve(Scene& scene); // Iteratively apply constraints
    void checkConflicts(); // Throw error if constraints conflict

private:
    std::vector<std::unique_ptr<Constraint>> constraints_;
    int max_iterations_ = 10; // Iterative solving
    float tolerance_ = 0.001f;
};
```

**Solving Strategy**:
1. Iterate through all constraints
2. Check if satisfied
3. If not, apply adjustment
4. Repeat until all satisfied or max iterations reached
5. Use Gauss-Seidel or Jacobi iteration for stability

### 7. Interpolation & Animation System
**Purpose**: Smooth transitions between states with configurable easing

**Classes**:
- `Interpolator` - Generic interpolation for any property
- `EasingFunction` - Different easing curves
- `AnimationState` - Tracks ongoing animations for a body

**Easing Functions**:
```cpp
enum class EasingType {
    LINEAR,
    EASE_IN,
    EASE_OUT,
    EASE_IN_OUT,
    EXPONENTIAL,
    LOGARITHMIC,
    BOUNCE
};

class Easing {
public:
    static float apply(float t, EasingType type); // t in [0,1], returns [0,1]

private:
    static float easeIn(float t);
    static float easeOut(float t);
    static float easeInOut(float t);
    // ... other easing functions
};
```

**Interpolator**:
```cpp
template<typename T>
class Interpolator {
public:
    Interpolator(const T& from, const T& to, float duration, EasingType easing)
        : from_(from), to_(to), duration_(duration), easing_(easing), time_(0.0f) {}

    T get(float dt) {
        time_ += dt;
        if (time_ >= duration_) {
            time_ = duration_;
            finished_ = true;
        }
        float t = Easing::apply(time_ / duration_, easing_);
        return lerp(from_, to_, t);
    }

    bool isFinished() const { return finished_; }

private:
    T from_, to_;
    float duration_;
    float time_;
    EasingType easing_;
    bool finished_ = false;

    T lerp(const T& a, const T& b, float t) const; // Linear interpolation
};
```

**Animation State**:
```cpp
class AnimationState {
public:
    void addInterpolation(const std::string& property,
                         std::unique_ptr<Interpolator<float>> interpolator);

    void update(float dt, Body& body);
    bool isComplete() const;

private:
    std::map<std::string, std::unique_ptr<Interpolator<float>>> interpolations_;
};
```

**Usage**:
```cpp
// Animate body graph alpha from 0.0 to 1.0 over 2.0 seconds
auto anim = std::make_unique<AnimationState>();
anim->addInterpolation("alpha",
    std::make_unique<Interpolator<float>>(0.0f, 1.0f, 2.0f, EasingType::EASE_IN_OUT));
body->animation = std::move(anim);
```

### 8. OpenGL Renderer
**Purpose**: Render scene graph to framebuffer using modern OpenGL

**Classes**:
- `Renderer` - Main rendering interface
- `Shader` - GLSL shader program wrapper
- `VertexBuffer`, `IndexBuffer` - GPU buffer management
- `Texture` - Texture management (for text rendering)

**Rendering Strategy**:
- Use Vertex Array Objects (VAO) and Vertex Buffer Objects (VBO)
- Batch similar geometry when possible
- Use instancing for particle systems
- Implement glow effect with post-processing (ping-pong blur on bloom buffer)

**Renderer Interface**:
```cpp
class Renderer {
public:
    void init(int width, int height);
    void clear(const glm::vec3& color);
    void setProjection(const glm::mat4& proj);
    void setView(const glm::mat4& view);

    // Rendering primitives
    void drawLine(const std::vector<glm::vec2>& points, const LineStyle& style);
    void drawText(const std::string& text, const glm::vec2& pos, const TextStyle& style);
    void drawShape(const std::vector<glm::vec2>& vertices, const ShapeStyle& style);
    void drawVectorField(const VectorFieldData& data);
    void drawParticles(const std::vector<Particle>& particles);

    // Post-processing
    void applyGlow(float intensity, float radius);

    // Framebuffer capture for export
    std::vector<uint8_t> captureFrame();

private:
    std::unique_ptr<Shader> line_shader_;
    std::unique_ptr<Shader> text_shader_;
    std::unique_ptr<Shader> glow_shader_;
    // ... other shaders

    GLuint main_fbo_;
    GLuint glow_fbo_;
    // ... framebuffers
};
```

**Shader Examples**:

*line.vert*:
```glsl
#version 450 core
layout(location = 0) in vec2 position;
layout(location = 1) in vec3 color;
layout(location = 2) in float thickness;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;

out vec3 frag_color;
out float frag_thickness;

void main() {
    gl_Position = projection * view * model * vec4(position, 0.0, 1.0);
    frag_color = color;
    frag_thickness = thickness;
}
```

*glow.frag*:
```glsl
#version 450 core
in vec2 tex_coords;
out vec4 frag_color;

uniform sampler2D scene_texture;
uniform float glow_intensity;
uniform float glow_radius;

void main() {
    // Gaussian blur for glow effect
    vec3 color = vec3(0.0);
    float total_weight = 0.0;

    for (float x = -glow_radius; x <= glow_radius; x += 1.0) {
        for (float y = -glow_radius; y <= glow_radius; y += 1.0) {
            vec2 offset = vec2(x, y) / textureSize(scene_texture, 0);
            float weight = exp(-(x*x + y*y) / (2.0 * glow_radius * glow_radius));
            color += texture(scene_texture, tex_coords + offset).rgb * weight;
            total_weight += weight;
        }
    }

    frag_color = vec4(color / total_weight * glow_intensity, 1.0);
}
```

**Line Rendering with Variable Thickness**:
- Generate quad strip along line with perpendicular offsets
- Use geometry shader or CPU-side tessellation
- Support variable thickness via attribute array

**Text Rendering**:
- Use FreeType to rasterize glyphs to texture atlas
- Render quads with glyph textures
- Support kerning, tracking, ligatures
- For handwriting animation: reveal glyphs stroke-by-stroke (requires stroke order data)

**Glow Implementation**:
1. Render scene to texture
2. Extract bright regions (threshold)
3. Apply Gaussian blur (separable: horizontal + vertical passes)
4. Blend blurred texture with original scene

### 9. Export Pipeline
**Purpose**: Capture frames and encode to video using FFmpeg

**Classes**:
- `VideoExporter` - FFmpeg integration
- `FrameEncoder` - Encode individual frames

**Video Export Flow**:
1. Initialize FFmpeg codec (H.264) and container (MP4)
2. For each frame:
   - Render scene to framebuffer
   - Capture pixel data (RGB)
   - Convert RGB to YUV (using libswscale)
   - Encode frame with libavcodec
   - Write to output file
3. Finalize and close video file

**VideoExporter Interface**:
```cpp
class VideoExporter {
public:
    void init(const std::string& output_path, int width, int height, int fps);
    void addFrame(const std::vector<uint8_t>& rgb_data);
    void finalize();

private:
    AVFormatContext* format_ctx_;
    AVCodecContext* codec_ctx_;
    AVStream* stream_;
    SwsContext* sws_ctx_; // RGB to YUV conversion
    AVFrame* frame_;
    AVPacket* packet_;
    int frame_count_;
};
```

**FFmpeg Initialization**:
```cpp
void VideoExporter::init(const std::string& output_path, int width, int height, int fps) {
    // Allocate format context
    avformat_alloc_output_context2(&format_ctx_, nullptr, nullptr, output_path.c_str());

    // Find H.264 codec
    const AVCodec* codec = avcodec_find_encoder(AV_CODEC_ID_H264);

    // Create stream
    stream_ = avformat_new_stream(format_ctx_, nullptr);

    // Allocate codec context
    codec_ctx_ = avcodec_alloc_context3(codec);
    codec_ctx_->width = width;
    codec_ctx_->height = height;
    codec_ctx_->time_base = {1, fps};
    codec_ctx_->framerate = {fps, 1};
    codec_ctx_->pix_fmt = AV_PIX_FMT_YUV420P;
    codec_ctx_->bit_rate = 4000000; // 4 Mbps

    // Open codec
    avcodec_open2(codec_ctx_, codec, nullptr);

    // Copy parameters to stream
    avcodec_parameters_from_context(stream_->codecpar, codec_ctx_);

    // Open output file
    avio_open(&format_ctx_->pb, output_path.c_str(), AVIO_FLAG_WRITE);
    avformat_write_header(format_ctx_, nullptr);

    // Initialize swscale for RGB -> YUV conversion
    sws_ctx_ = sws_getContext(width, height, AV_PIX_FMT_RGB24,
                              width, height, AV_PIX_FMT_YUV420P,
                              SWS_BICUBIC, nullptr, nullptr, nullptr);

    // Allocate frame
    frame_ = av_frame_alloc();
    frame_->format = AV_PIX_FMT_YUV420P;
    frame_->width = width;
    frame_->height = height;
    av_frame_get_buffer(frame_, 0);
}
```

### 10. Font System
**Purpose**: Load and render TrueType fonts and custom binary fonts

**Classes**:
- `Font` - Abstract font interface
- `TTFFont` - TrueType font loader (uses FreeType)
- `CustomFont` - Binary .font format loader
- `FontCache` - Texture atlas for rendered glyphs

**Font Interface**:
```cpp
class Font {
public:
    virtual ~Font() = default;
    virtual Glyph getGlyph(char32_t codepoint) = 0;
    virtual float getKerning(char32_t left, char32_t right) = 0;

    float size;
    float tracking;
    float leading;
};

struct Glyph {
    glm::vec2 bearing; // Offset from baseline
    glm::vec2 size;
    float advance;
    glm::vec4 tex_coords; // In atlas

    // For handwriting animation
    std::vector<Stroke> strokes; // Stroke order data
};

struct Stroke {
    std::vector<glm::vec2> points;
};
```

**Hot Reload**:
- Watch font files for changes (file modification time)
- Reload font and regenerate texture atlas when changed
- Update all TextBody instances using that font

## Development Phases

### Phase 1: Core Infrastructure & GUI Foundation (2-3 weeks)
**Goals**: Set up project, initialize window and GUI, basic rendering

**Tasks**:
- [ ] Project setup: CMakeLists.txt, directory structure
- [ ] Install dependencies: GLFW, GLEW, GLM, Dear ImGui, FFmpeg
- [ ] Initialize GLFW window and OpenGL context
- [ ] Integrate Dear ImGui (ImGui_ImplGlfw, ImGui_ImplOpenGL3)
- [ ] Implement basic three-panel layout with ImGui
- [ ] Implement basic Renderer class
- [ ] Write shaders for solid-color lines and shapes
- [ ] Test: Render simple shapes to top panel

**Deliverable**: Application with three-panel GUI layout rendering basic shapes

### Phase 2: Panel System & Input Routing (2 weeks)
**Goals**: Functional panels with focus navigation and input routing

**Tasks**:
- [ ] Implement PanelManager class
- [ ] Implement ViewPanel (renders scene to framebuffer texture)
- [ ] Implement ScriptPanel skeleton (simple text display)
- [ ] Implement ConsolePanel skeleton (output + input field)
- [ ] Implement InputRouter with prefix key combo (Ctrl+B + h/j/k/l)
- [ ] Panel focus switching and visual indication
- [ ] Test: Navigate between panels, type in console

**Deliverable**: Functional panel system with navigation

### Phase 3: Command Parser & Scene Graph (2 weeks)
**Goals**: Parse commands from console, build scene graph

**Tasks**:
- [ ] Implement CommandParser for basic commands (init, create, set)
- [ ] Parse properties: colors, positions, sizes
- [ ] Implement Scene, Frame, Body hierarchy
- [ ] Implement CreateCommand, SetCommand execution
- [ ] Connect console input to command parser
- [ ] Execute commands and update scene graph
- [ ] Log executed commands to script panel
- [ ] Test: Type commands in console, see results in view panel

**Deliverable**: Working command execution from console to scene graph

### Phase 4: Vim Editor Implementation (2 weeks)
**Goals**: Full Vim motions in script panel

**Tasks**:
- [ ] Implement VimEditor class with mode system (normal, insert, visual, command)
- [ ] Basic Vim motions: h/j/k/l, w/b/e, gg/G, 0/$
- [ ] Insert mode: i/a/o, Esc to exit
- [ ] Delete/yank/paste: dd/yy/p, visual mode selection
- [ ] Search: /, n/N for next/previous
- [ ] Command mode: :w (save), :q (quit), :wq
- [ ] Line editing in script panel
- [ ] Test: Edit multi-line scripts with Vim motions

**Deliverable**: Fully functional Vim editor in script panel

### Phase 5: Math Engine (2-3 weeks)
**Goals**: Parse and evaluate mathematical expressions

**Tasks**:
- [ ] Implement expression parser (or integrate muParser)
- [ ] Support basic operations: +, -, *, /, ^, sin, cos, exp, log
- [ ] Implement Function class (explicit, parametric)
- [ ] Evaluate functions at points to generate line geometry
- [ ] Numeric differentiation for derivatives
- [ ] Test: Plot y=sin(x), parametric spiral

**Deliverable**: Render function graphs and parametric curves

### Phase 6: Animation & Interpolation (1-2 weeks)
**Goals**: Smooth transitions between states

**Tasks**:
- [ ] Implement Easing functions
- [ ] Implement Interpolator template
- [ ] Implement AnimateCommand parsing and execution
- [ ] Update loop: interpolate animated properties each frame
- [ ] Test: Animate circle radius, line opacity, frame position

**Deliverable**: Smooth animations between states

### Phase 7: Constraints System (2 weeks)
**Goals**: Geometric relationships maintained during animations

**Tasks**:
- [ ] Implement Constraint base class
- [ ] Implement ColinearConstraint, PerpendicularConstraint, ParallelConstraint
- [ ] Implement CotangentConstraint (tangent to curve)
- [ ] Implement ConstraintSolver with iterative solving
- [ ] Conflict detection
- [ ] Test: Point constrained to curve, tangent line following point

**Deliverable**: Constraints that adjust bodies dynamically

### Phase 8: Advanced Rendering (2-3 weeks)
**Goals**: Text, glow effects, variable thickness, gradients

**Tasks**:
- [ ] Integrate FreeType for text rendering
- [ ] Render text with kerning, tracking
- [ ] Implement glow post-processing (Gaussian blur)
- [ ] Variable thickness line rendering (geometry shader or tessellation)
- [ ] Color gradients along lines
- [ ] Test: Render glowing text, gradient lines

**Deliverable**: Beautiful text and glowing effects

### Phase 9: Particle Systems (1-2 weeks)
**Goals**: Dynamic particle effects

**Tasks**:
- [ ] Implement ParticleBody class
- [ ] Particle emitters, spawn patterns
- [ ] Particle following paths (functions, vector fields)
- [ ] Instanced rendering for performance
- [ ] Test: Particles flowing along sin(x), vector field

**Deliverable**: Animated particle systems

### Phase 10: 3D & 4D Visualization (2 weeks)
**Goals**: Surfaces, wireframes, 4D projections

**Tasks**:
- [ ] 3D camera and perspective projection
- [ ] Surface evaluation and tessellation
- [ ] Wireframe rendering
- [ ] 4D projection methods (stereographic, perspective, orthographic)
- [ ] Test: Render paraboloid, hypersphere projection

**Deliverable**: 3D mathematical surfaces and 4D slices

### Phase 11: Vector Fields (1 week)
**Goals**: Directional vector fields with magnitude visualization

**Tasks**:
- [ ] VectorFieldBody class
- [ ] Evaluate vector function on grid
- [ ] Render arrows with color/size based on magnitude
- [ ] Test: Gradient field, rotational field

**Deliverable**: Beautiful vector fields

### Phase 12: Script Execution & Run Commands (1 week)
**Goals**: Execute scripts from script panel, run from specific lines

**Tasks**:
- [ ] Implement `run` and `run -gg X` commands in console
- [ ] Execute all commands from script panel sequentially
- [ ] Execute from specific line number
- [ ] Handle execution errors gracefully (stop on error)
- [ ] Visual feedback during execution (highlight current line in script panel)
- [ ] Test: Run full animation script, run from line 10

**Deliverable**: Full script execution capability with line-specific starts

### Phase 13: Export Pipeline (1-2 weeks)
**Goals**: Render to video file

**Tasks**:
- [ ] Integrate FFmpeg libav libraries
- [ ] Initialize codec and format context
- [ ] Capture framebuffer each frame
- [ ] Convert RGB to YUV, encode, write to file
- [ ] Test: Export simple animation to MP4

**Deliverable**: Working video export

### Phase 14: Drawing Animations (1-2 weeks)
**Goals**: Stroke-by-stroke reveal animations

**Tasks**:
- [ ] Line drawing animation: interpolate along length
- [ ] Text writing animation: stroke order data
- [ ] Surface build animation: progressive reveal
- [ ] Test: Text written letter-by-letter

**Deliverable**: Handwriting-style animations

### Phase 15: Polish & Optimization (2 weeks)
**Goals**: Performance, UX, bug fixes

**Tasks**:
- [ ] Profile and optimize rendering (batch draw calls)
- [ ] Optimize constraint solver (sparse matrices if needed)
- [ ] Error handling and user-friendly messages
- [ ] Mobile resolution mode
- [ ] Documentation and examples
- [ ] Test: Render complex scenes at 30fps

**Deliverable**: Production-ready GUI application

### Phase 16: Font Design Application (Separate, 3-4 weeks)
**Goals**: Companion font design tool

**Tasks**:
- [ ] GUI application (Qt or immediate-mode GUI like Dear ImGui)
- [ ] Glyph canvas with bezier curve editing
- [ ] Serif editing tools
- [ ] Kerning pair table editor
- [ ] Ligature definitions
- [ ] Export to .ttf and binary .font format
- [ ] Integration with visualization engine

**Deliverable**: Font design application compatible with mathviz

## Testing Strategy

### Unit Tests
- Math engine: expression parsing, function evaluation
- Interpolation: easing functions, lerp correctness
- Constraints: individual constraint satisfaction
- Parser: command parsing edge cases

### Integration Tests
- Scene graph construction from scripts
- Animation execution and state updates
- Constraint solving with multiple constraints
- Rendering pipeline (shader compilation, draw calls)

### End-to-End Tests
- Full scripts that produce expected output
- Visual regression testing (render frames, compare with baseline images)
- Export test: generate video, verify file integrity

### Performance Tests
- Rendering complex scenes (1000+ objects) at 30fps
- Constraint solving with 100+ constraints
- Export speed: target real-time (1 second of video per 1 second of rendering)

## Performance Considerations

### Rendering Optimization
- **Batch draw calls**: Group similar geometry (all lines, all particles)
- **Instanced rendering**: Particles, vector field arrows
- **Level of detail**: Reduce tesselation for distant/small objects
- **Frustum culling**: Don't render off-screen objects
- **Shader optimization**: Minimize texture lookups, branching

### Constraint Solver Optimization
- **Sparse matrices**: If using linear algebra approach
- **Iterative refinement**: Gauss-Seidel converges quickly for most cases
- **Early termination**: Stop if constraints satisfied within tolerance
- **Constraint ordering**: Prioritize high-impact constraints

### Math Engine Optimization
- **Expression caching**: Cache parsed expressions
- **Function sampling**: Pre-compute function values for static curves
- **SIMD**: Vectorize function evaluation for multiple points (AVX2)

### Memory Management
- **Object pooling**: Reuse body objects instead of allocating/deallocating
- **Smart pointers**: Use `std::unique_ptr` and `std::shared_ptr` appropriately
- **Vertex buffer reuse**: Update buffers instead of recreating

### Export Optimization
- **Headless rendering**: Use EGL or GLFW offscreen context (no window overhead)
- **Hardware encoding**: Use GPU-accelerated H.264 encoding if available (NVENC, QuickSync)
- **Parallel encoding**: Render and encode in separate threads (producer-consumer)

## Edge Cases & Error Handling

### Parser Errors
- Invalid syntax: clear error messages with line numbers
- Unknown commands: suggest similar commands
- Type errors: "expected number, got string"

### Math Errors
- Division by zero: clamp to large value or skip
- Domain errors: sqrt(-1), log(0) → skip evaluation
- Non-convergent implicit functions: warn user

### Constraint Errors
- Conflicting constraints: detect and report specific conflict
- Unsatisfiable constraints: warn after max iterations
- Over-constrained systems: report degree of freedom issue

### Rendering Errors
- Shader compilation failure: print error log
- Texture allocation failure: reduce resolution or warn
- Framebuffer incomplete: check format support

### Export Errors
- FFmpeg initialization failure: check codec availability
- Disk space: check before starting export
- Write errors: handle gracefully, don't corrupt file

## Future Extensions

### Advanced Features
- **Shader effects**: Custom shaders for bodies (procedural textures, distortions)
- **Audio sync**: Visualizations synced to audio waveforms
- **Camera paths**: Animated camera movement through 3D scenes
- **Physics**: Gravity, collisions for particle systems
- **Custom body types**: Plugin system for user-defined bodies

### UX Improvements
- **GUI mode**: Visual editor for scene composition (optional)
- **Live preview**: Render while typing commands
- **Command history**: Up/down arrows for command recall
- **Autocomplete**: Tab completion for commands and properties
- **Undo/redo**: Command history with rewind

### Performance
- **GPU compute shaders**: Function evaluation, particle simulation
- **Multi-threaded rendering**: Command list generation on separate thread
- **Vulkan backend**: Modern graphics API for better performance

## Conclusion

This implementation guide provides a comprehensive roadmap for building the Mathematical Visualization Engine with its three-panel GUI interface. The phased approach ensures steady progress with testable milestones. Key architectural decisions include:

- **Modern C++** with smart pointers and value semantics
- **Three-panel GUI** with Vim-style navigation and live coding
- **Dear ImGui** for lightweight, OpenGL-integrated interface
- **Custom Vim editor** for script editing with full motion support
- **OpenGL 4.5+** for performant rendering
- **FFmpeg** for reliable video encoding
- **Scene graph** for clear hierarchical organization (Scene → Frame → Body)
- **Constraint solver** for dynamic geometric relationships
- **Modular design** for maintainability and extensibility

Following this guide, the project can be completed in approximately **4-5 months** of focused development (15 phases), with the font application as a parallel effort (Phase 16). The result will be a powerful, intuitive GUI application for creating stunning mathematical visualizations through live coding or scripted animation.
