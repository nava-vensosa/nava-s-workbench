#include "gui/ConsolePanel.h"
#include "gui/ScriptPanel.h"
#include "parser/CommandParser.h"
#include "core/Scene.h"

#include <imgui.h>
#include <cstring>
#include <regex>

ConsolePanel::ConsolePanel(const glm::ivec4& viewport, CommandParser* parser, Scene* scene, ScriptPanel* script_panel)
    : viewport_(viewport)
    , parser_(parser)
    , scene_(scene)
    , script_panel_(script_panel)
    , history_index_(-1)
    , auto_scroll_(true)
    , is_focused_(true)  // Console starts focused
{
    std::memset(input_buffer_, 0, sizeof(input_buffer_));
}

ConsolePanel::~ConsolePanel() {}

void ConsolePanel::update(float dt) {
    // Update logic
}

void ConsolePanel::render() {
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

    ImGui::Begin("Console Panel", nullptr, flags);

    // Output area
    ImGui::BeginChild("ConsoleOutput", ImVec2(0, -30), true);
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

    ImGuiInputTextFlags input_flags = ImGuiInputTextFlags_EnterReturnsTrue |
                                     ImGuiInputTextFlags_CallbackHistory;

    auto callback = [](ImGuiInputTextCallbackData* data) -> int {
        ConsolePanel* console = (ConsolePanel*)data->UserData;
        if (data->EventFlag == ImGuiInputTextFlags_CallbackHistory) {
            if (data->EventKey == ImGuiKey_UpArrow) {
                if (!console->command_history_.empty()) {
                    if (console->history_index_ == -1) {
                        console->history_index_ = console->command_history_.size() - 1;
                    } else if (console->history_index_ > 0) {
                        console->history_index_--;
                    }
                    if (console->history_index_ >= 0 && console->history_index_ < (int)console->command_history_.size()) {
                        data->DeleteChars(0, data->BufTextLen);
                        data->InsertChars(0, console->command_history_[console->history_index_].c_str());
                    }
                }
            } else if (data->EventKey == ImGuiKey_DownArrow) {
                if (!console->command_history_.empty()) {
                    if (console->history_index_ >= 0 && console->history_index_ < (int)console->command_history_.size() - 1) {
                        console->history_index_++;
                        data->DeleteChars(0, data->BufTextLen);
                        data->InsertChars(0, console->command_history_[console->history_index_].c_str());
                    } else if (console->history_index_ == (int)console->command_history_.size() - 1) {
                        console->history_index_ = -1;
                        data->DeleteChars(0, data->BufTextLen);
                    }
                }
            }
        }
        return 0;
    };

    if (ImGui::InputText("##console_input", input_buffer_, sizeof(input_buffer_), input_flags, callback, this)) {
        std::string command(input_buffer_);
        if (!command.empty()) {
            executeCommand(command);
            command_history_.push_back(command);
            history_index_ = -1;
        }
        std::memset(input_buffer_, 0, sizeof(input_buffer_));
        ImGui::SetKeyboardFocusHere(-1);  // Keep focus on input
    }

    // Auto-focus input when panel is focused
    if (is_focused_ && !ImGui::IsAnyItemActive()) {
        ImGui::SetKeyboardFocusHere(-1);
    }

    ImGui::End();

    ImGui::PopStyleVar();
    if (is_focused_) {
        ImGui::PopStyleColor();
    }
}

void ConsolePanel::handleInput(int key, int action, int mods) {
    // TODO: Handle up/down for command history
}

void ConsolePanel::setViewport(const glm::ivec4& viewport) {
    viewport_ = viewport;
}

void ConsolePanel::print(const std::string& message, LogLevel level) {
    std::string prefix;
    switch (level) {
        case LogLevel::INFO:    prefix = "[INFO] "; break;
        case LogLevel::SUCCESS: prefix = "[OK] "; break;
        case LogLevel::WARNING: prefix = "[WARN] "; break;
        case LogLevel::ERROR:   prefix = "[ERROR] "; break;
    }
    output_lines_.push_back(prefix + message);
}

void ConsolePanel::executeCommand(const std::string& command) {
    print("> " + command, LogLevel::INFO);

    // Check for special commands
    if (command == "run" || command == "r") {
        runAnimation();
        return;
    }

    // Check for run from line
    std::regex run_from_pattern(R"((run|r)\s+-gg\s+(\d+))");
    std::smatch match;
    if (std::regex_match(command, match, run_from_pattern)) {
        int line_num = std::stoi(match[2]);
        runAnimationFrom(line_num);
        return;
    }

    // Check for clear command
    if (command == "clear") {
        output_lines_.clear();
        return;
    }

    // Regular command execution
    parseAndExecute(command);
}

void ConsolePanel::runAnimation() {
    print("Executing script...", LogLevel::INFO);

    auto commands = script_panel_->getCommands();
    if (commands.empty()) {
        print("No commands in script", LogLevel::WARNING);
        return;
    }

    for (const auto& cmd : commands) {
        try {
            parser_->parseLine(cmd);
            print(cmd, LogLevel::SUCCESS);
        } catch (const std::exception& e) {
            print(std::string("Error: ") + e.what(), LogLevel::ERROR);
            break;
        }
    }

    print("Script execution complete", LogLevel::INFO);
}

void ConsolePanel::runAnimationFrom(int line_num) {
    print("Executing from line " + std::to_string(line_num) + "...", LogLevel::INFO);

    auto commands = script_panel_->getCommandsFrom(line_num - 1);
    if (commands.empty()) {
        print("No commands from line " + std::to_string(line_num), LogLevel::WARNING);
        return;
    }

    for (const auto& cmd : commands) {
        try {
            parser_->parseLine(cmd);
            print(cmd, LogLevel::SUCCESS);
        } catch (const std::exception& e) {
            print(std::string("Error: ") + e.what(), LogLevel::ERROR);
            break;
        }
    }

    print("Script execution complete", LogLevel::INFO);
}

void ConsolePanel::parseAndExecute(const std::string& command) {
    try {
        parser_->parseLine(command);
        script_panel_->appendCommand(command);
        print("Command executed", LogLevel::SUCCESS);
    } catch (const std::exception& e) {
        print(std::string("Error: ") + e.what(), LogLevel::ERROR);
    }
}
