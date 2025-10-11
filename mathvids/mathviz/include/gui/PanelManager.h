#pragma once

#include <memory>
#include <glm/glm.hpp>

// Forward declarations
class ViewPanel;
class ScriptPanel;
class ConsolePanel;
class Scene;
class Renderer;
class CommandParser;

enum class PanelID {
    VIEW,
    SCRIPT,
    CONSOLE
};

class PanelManager {
public:
    PanelManager(int window_width, int window_height, Scene* scene, CommandParser* parser);
    ~PanelManager();

    void update(float dt);
    void render(Renderer& renderer);
    void handleInput(int key, int action, int mods);

    void focusPanel(PanelID panel);
    PanelID getActivePanel() const { return active_panel_; }

    ScriptPanel* getScriptPanel() { return script_panel_.get(); }
    ConsolePanel* getConsolePanel() { return console_panel_.get(); }

private:
    void updatePanelSizes();

    std::unique_ptr<ViewPanel> view_panel_;
    std::unique_ptr<ScriptPanel> script_panel_;
    std::unique_ptr<ConsolePanel> console_panel_;

    PanelID active_panel_;
    glm::ivec2 window_size_;

    // Prefix mode tracking
    bool prefix_active_;
    int prefix_key_;
    int prefix_mods_;
};
