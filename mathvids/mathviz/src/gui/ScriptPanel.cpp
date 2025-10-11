#include "gui/ScriptPanel.h"
#include <imgui.h>

ScriptPanel::ScriptPanel(const glm::ivec4& viewport)
    : viewport_(viewport)
    , scroll_position_(0)
    , is_focused_(false)
{
    lines_.push_back("# Script commands will appear here");
}

ScriptPanel::~ScriptPanel() {}

void ScriptPanel::update(float dt) {
    // Update logic
}

void ScriptPanel::render() {
    ImGui::SetNextWindowPos(ImVec2(viewport_.x, viewport_.y), ImGuiCond_Always);
    ImGui::SetNextWindowSize(ImVec2(viewport_.z, viewport_.w), ImGuiCond_Always);

    ImGuiWindowFlags flags = ImGuiWindowFlags_NoResize |
                            ImGuiWindowFlags_NoMove |
                            ImGuiWindowFlags_NoCollapse;

    // Set border color based on focus
    if (is_focused_) {
        ImGui::PushStyleColor(ImGuiCol_Border, ImVec4(0.2f, 0.6f, 1.0f, 1.0f));  // Blue border when focused
        ImGui::PushStyleVar(ImGuiStyleVar_WindowBorderSize, 3.0f);
    } else {
        ImGui::PushStyleVar(ImGuiStyleVar_WindowBorderSize, 1.0f);
    }

    ImGui::Begin("Script Panel (Vim Editor - Coming in Phase 4)", nullptr, flags);

    // Display lines (read-only for now)
    ImGui::BeginChild("ScriptContent", ImVec2(0, -30), true);
    for (size_t i = 0; i < lines_.size(); ++i) {
        ImGui::TextUnformatted(lines_[i].c_str());
    }
    ImGui::EndChild();

    ImGui::Text("Line %zu/%zu", lines_.size(), lines_.size());

    ImGui::End();

    ImGui::PopStyleVar();
    if (is_focused_) {
        ImGui::PopStyleColor();
    }
}

void ScriptPanel::handleInput(int key, int action, int mods) {
    // TODO: Vim editor input handling in Phase 4
}

void ScriptPanel::setViewport(const glm::ivec4& viewport) {
    viewport_ = viewport;
}

void ScriptPanel::appendCommand(const std::string& command) {
    // Remove placeholder text if it's the first real command
    if (lines_.size() == 1 && lines_[0].find("# Script") != std::string::npos) {
        lines_.clear();
    }
    lines_.push_back(command);
}

std::vector<std::string> ScriptPanel::getCommands() const {
    std::vector<std::string> commands;
    for (const auto& line : lines_) {
        if (!line.empty() && line[0] != '#') {
            commands.push_back(line);
        }
    }
    return commands;
}

std::vector<std::string> ScriptPanel::getCommandsFrom(int line_num) const {
    std::vector<std::string> commands;
    for (size_t i = line_num; i < lines_.size(); ++i) {
        if (!lines_[i].empty() && lines_[i][0] != '#') {
            commands.push_back(lines_[i]);
        }
    }
    return commands;
}

void ScriptPanel::loadFromFile(const std::string& path) {
    // TODO: Load from file
}

void ScriptPanel::saveToFile(const std::string& path) {
    // TODO: Save to file
}
