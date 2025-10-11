#include "gui/PanelManager.h"
#include "gui/ViewPanel.h"
#include "gui/ScriptPanel.h"
#include "gui/ConsolePanel.h"
#include "core/Scene.h"
#include "renderer/Renderer.h"
#include "parser/CommandParser.h"

#include <GLFW/glfw3.h>

PanelManager::PanelManager(int window_width, int window_height, Scene* scene, CommandParser* parser)
    : window_size_(window_width, window_height)
    , active_panel_(PanelID::CONSOLE)
    , prefix_active_(false)
    , prefix_key_(GLFW_KEY_B)
    , prefix_mods_(GLFW_MOD_CONTROL)
{
    updatePanelSizes();

    // Create panels
    int top_height = (window_height * 2) / 3;
    int bottom_height = window_height / 3;
    int bottom_width = window_width / 2;

    // View panel (top 2/3)
    glm::ivec4 view_viewport(0, bottom_height, window_width, top_height);
    view_panel_ = std::make_unique<ViewPanel>(view_viewport, scene);

    // Script panel (bottom-left 1/6)
    glm::ivec4 script_viewport(0, 0, bottom_width, bottom_height);
    script_panel_ = std::make_unique<ScriptPanel>(script_viewport);

    // Console panel (bottom-right 1/6)
    glm::ivec4 console_viewport(bottom_width, 0, bottom_width, bottom_height);
    console_panel_ = std::make_unique<ConsolePanel>(console_viewport, parser, scene, script_panel_.get());

    console_panel_->print("MathViz - Mathematical Visualization Engine", LogLevel::INFO);
    console_panel_->print("Type commands to create animations. Use 'run' to execute script.", LogLevel::INFO);
    console_panel_->print("Press Ctrl+B then h/k/l to switch panels.", LogLevel::INFO);
}

PanelManager::~PanelManager() {}

void PanelManager::update(float dt) {
    view_panel_->update(dt);
    script_panel_->update(dt);
    console_panel_->update(dt);
}

void PanelManager::render(Renderer& renderer) {
    view_panel_->render(renderer);
    script_panel_->render();
    console_panel_->render();
}

void PanelManager::handleInput(int key, int action, int mods) {
    // Check for prefix activation (Ctrl+B)
    if (key == prefix_key_ && (mods & prefix_mods_)) {
        prefix_active_ = true;
        return;
    }

    // Handle prefix mode navigation
    if (prefix_active_ && action == GLFW_PRESS) {
        switch (key) {
            case GLFW_KEY_H:
                focusPanel(PanelID::SCRIPT);
                break;
            case GLFW_KEY_K:
                focusPanel(PanelID::VIEW);
                break;
            case GLFW_KEY_L:
                focusPanel(PanelID::CONSOLE);
                break;
        }
        prefix_active_ = false;
        return;
    }

    // Route input to active panel
    switch (active_panel_) {
        case PanelID::VIEW:
            view_panel_->handleInput(key, action, mods);
            break;
        case PanelID::SCRIPT:
            script_panel_->handleInput(key, action, mods);
            break;
        case PanelID::CONSOLE:
            console_panel_->handleInput(key, action, mods);
            break;
    }
}

void PanelManager::focusPanel(PanelID panel) {
    // Unfocus all panels
    view_panel_->setFocused(false);
    script_panel_->setFocused(false);
    console_panel_->setFocused(false);

    // Focus the selected panel
    active_panel_ = panel;
    switch (panel) {
        case PanelID::VIEW:
            view_panel_->setFocused(true);
            break;
        case PanelID::SCRIPT:
            script_panel_->setFocused(true);
            break;
        case PanelID::CONSOLE:
            console_panel_->setFocused(true);
            break;
    }
}

void PanelManager::updatePanelSizes() {
    // Called when window resizes
    // TODO: Implement dynamic resizing
}
