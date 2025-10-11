#pragma once

#include <vector>
#include <string>
#include <glm/glm.hpp>

class ScriptPanel {
public:
    ScriptPanel(const glm::ivec4& viewport);
    ~ScriptPanel();

    void update(float dt);
    void render();
    void handleInput(int key, int action, int mods);

    void setViewport(const glm::ivec4& viewport);
    void setFocused(bool focused) { is_focused_ = focused; }

    // Command management
    void appendCommand(const std::string& command);
    std::vector<std::string> getCommands() const;
    std::vector<std::string> getCommandsFrom(int line_num) const;

    // File operations (placeholder for now)
    void loadFromFile(const std::string& path);
    void saveToFile(const std::string& path);

private:
    glm::ivec4 viewport_;
    std::vector<std::string> lines_;
    int scroll_position_;
    bool is_focused_;
};
