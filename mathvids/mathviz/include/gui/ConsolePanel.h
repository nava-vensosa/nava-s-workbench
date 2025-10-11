#pragma once

#include <vector>
#include <string>
#include <glm/glm.hpp>

// Forward declarations
class CommandParser;
class Scene;
class ScriptPanel;

enum class LogLevel {
    INFO,
    SUCCESS,
    WARNING,
    ERROR
};

class ConsolePanel {
public:
    ConsolePanel(const glm::ivec4& viewport, CommandParser* parser, Scene* scene, ScriptPanel* script_panel);
    ~ConsolePanel();

    void update(float dt);
    void render();
    void handleInput(int key, int action, int mods);

    void setViewport(const glm::ivec4& viewport);
    void setFocused(bool focused) { is_focused_ = focused; }

    // Output
    void print(const std::string& message, LogLevel level = LogLevel::INFO);

    // Command execution
    void executeCommand(const std::string& command);

private:
    void runAnimation();
    void runAnimationFrom(int line_num);
    void parseAndExecute(const std::string& command);

    glm::ivec4 viewport_;
    CommandParser* parser_;
    Scene* scene_;
    ScriptPanel* script_panel_;

    std::vector<std::string> output_lines_;
    char input_buffer_[256];
    std::vector<std::string> command_history_;
    int history_index_;
    bool auto_scroll_;
    bool is_focused_;
};
