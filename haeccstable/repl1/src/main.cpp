#include <iostream>
#include <memory>
#include <sstream>
#include <fstream>
#include <glad/glad.h>
#include "window_manager.h"
#include "layout_manager.h"
#include "renderer.h"
#include "input_handler.h"
#include "nvim_client.h"
#include "text_buffer.h"
#include "repl_interpreter.h"
#include "dossier_manager.h"

int main(int argc, char** argv) {
    std::cout << "REPL1 - Live Coding Environment for Video and Animation\n";
    std::cout << "Initializing...\n";

    // Create window manager
    auto windowMgr = std::make_unique<WindowManager>(1920, 1080, "REPL1");
    if (!windowMgr->init()) {
        std::cerr << "Failed to initialize window\n";
        return -1;
    }

    // Initialize GLAD
    if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress)) {
        std::cerr << "Failed to initialize GLAD\n";
        return -1;
    }

    // Create layout manager
    auto layoutMgr = std::make_unique<LayoutManager>();

    // Create renderer
    auto renderer = std::make_unique<Renderer>();
    if (!renderer->init()) {
        std::cerr << "Failed to initialize renderer\n";
        return -1;
    }

    // Create input handler
    auto inputHandler = std::make_unique<InputHandler>();
    inputHandler->setup(windowMgr->getWindow());

    // Create text buffers for each window
    auto dossierBuffer = std::make_unique<TextBuffer>(100);
    auto replBuffer = std::make_unique<TextBuffer>(100);
    auto shellBuffer = std::make_unique<TextBuffer>(100);
    auto consoleBuffer = std::make_unique<TextBuffer>(100);

    // Store pointers for easy access
    TextBuffer* buffers[] = {
        dossierBuffer.get(),
        replBuffer.get(),
        shellBuffer.get(),
        consoleBuffer.get()
    };

    // Set initial active buffer
    inputHandler->setActiveTextBuffer(buffers[0]);

    // Track current tab (0 = Tab 1, 1 = Tab 2)
    int currentTab = 0;

    // Setup input callbacks
    inputHandler->setFullscreenToggleCallback([&windowMgr]() {
        windowMgr->toggleFullscreen();
    });

    inputHandler->setWindowSwitchCallback([&inputHandler, &buffers, &currentTab](int window) {
        // Remap window numbers based on current tab
        int actualWindow = window;

        if (currentTab == 1) {
            // Tab 2 mapping: 1->REPL(1), 2->console(3), 3->shell(2)
            if (window == 0) actualWindow = 1;      // 1 -> REPL
            else if (window == 1) actualWindow = 3; // 2 -> console
            else if (window == 2) actualWindow = 2; // 3 -> shell
            else if (window == 3) actualWindow = -1; // 4 -> invalid (no window 4 on Tab 2)
        }
        // Tab 1 uses default mapping: 0->dossier, 1->REPL, 2->shell, 3->console

        if (actualWindow >= 0 && actualWindow < 4) {
            std::cout << "Switched to window " << actualWindow << "\n";
            inputHandler->setActiveWindow(actualWindow);  // Update activeWindow for highlighting
            inputHandler->setActiveTextBuffer(buffers[actualWindow]);
        }
    });

    inputHandler->setTabSwitchCallback([&currentTab](int direction) {
        currentTab = (currentTab + direction + 4) % 4;  // Wrap between 0 and 3 (4 tabs)
        std::cout << "Switched to Tab " << (currentTab + 1) << "\n";
    });

    // Create REPL interpreter
    auto replInterpreter = std::make_unique<ReplInterpreter>();

    // Create DossierManager and connect to interpreter
    auto dossierManager = std::make_shared<DossierManager>();
    dossierManager->updateVideoDevices();
    dossierManager->updateMonitors();
    replInterpreter->setDossierManager(dossierManager);

    // Shell command history
    std::vector<std::string> commandHistory;
    int historyIndex = 0;  // Points to current position in history

    // Helper function to process #import directives in REPL buffer
    auto processImportDirectives = [&replBuffer]() {
        bool foundImport = true;
        while (foundImport) {
            foundImport = false;
            const auto& lines = replBuffer->getLines();

            for (size_t i = 0; i < lines.size(); i++) {
                std::string line = lines[i];
                // Trim whitespace
                size_t start = line.find_first_not_of(" \t");
                if (start == std::string::npos) continue;

                std::string trimmed = line.substr(start);

                // Check for #import directive
                if (trimmed.find("#import ") == 0) {
                    std::string presetFile = trimmed.substr(8); // Skip "#import "
                    // Trim whitespace from preset filename
                    size_t fileStart = presetFile.find_first_not_of(" \t");
                    size_t fileEnd = presetFile.find_last_not_of(" \t\r\n");
                    if (fileStart != std::string::npos && fileEnd != std::string::npos) {
                        presetFile = presetFile.substr(fileStart, fileEnd - fileStart + 1);
                    }

                    // Read preset file
                    std::string presetPath = "../presets/" + presetFile;
                    std::ifstream inFile(presetPath);

                    if (inFile.is_open()) {
                        std::string presetContent;
                        std::string pline;
                        while (std::getline(inFile, pline)) {
                            presetContent += pline + "\n";
                        }
                        inFile.close();

                        // Replace the #import line with preset content
                        // Delete the import line
                        replBuffer->setCursor(i, 0);
                        replBuffer->deleteLine();

                        // Insert preset content at this position
                        bool firstLine = true;
                        for (char c : presetContent) {
                            if (c == '\n') {
                                if (!firstLine || i > 0) {
                                    replBuffer->insertNewline();
                                }
                                firstLine = false;
                            } else {
                                replBuffer->insertChar(c);
                            }
                        }

                        foundImport = true;
                        std::cout << "Processed #import directive: " << presetFile << "\n";
                        break; // Restart scan since buffer changed
                    } else {
                        std::cerr << "ERROR: Could not open preset file: " << presetPath << "\n";
                    }
                }
            }
        }
    };

    // Setup shell command execution callback
    auto executeShellCommand = [&shellBuffer, &consoleBuffer, &replBuffer, &dossierBuffer, &replInterpreter, &dossierManager, &commandHistory, &historyIndex, &processImportDirectives](const std::string& command) {
        std::cout << "Executing shell command: " << command << "\n";

        // Add command to history
        if (!command.empty()) {
            commandHistory.push_back(command);
            historyIndex = commandHistory.size();  // Point to end (one past last command)
        }

        // Add command to shell history and clear command line
        if (shellBuffer->getLineCount() > 0) {
            auto& lines = shellBuffer->getLines();
            std::string cmd = lines.back();  // Get command line

            // Insert command into history (before last line)
            shellBuffer->setCursor(shellBuffer->getLineCount() - 1, 0);
            shellBuffer->insertChar('>');
            shellBuffer->insertChar(' ');
            for (char c : cmd) {
                shellBuffer->insertChar(c);
            }
            shellBuffer->insertNewline();

            // Clear the command line (current last line)
            int lastLine = shellBuffer->getLineCount() - 1;
            shellBuffer->setCursor(lastLine, 0);
            while (shellBuffer->getLineCount() > 0 && !shellBuffer->getLines().back().empty()) {
                shellBuffer->deleteChar();
            }
        }

        // Parse and execute command
        if (command == "clear console") {
            // Clear console buffer completely
            while (consoleBuffer->getLineCount() > 1) {
                consoleBuffer->setCursor(0, 0);
                consoleBuffer->deleteLine();
            }
            // Clear the last remaining line
            if (consoleBuffer->getLineCount() > 0) {
                consoleBuffer->setCursor(0, 0);
                while (!consoleBuffer->getLines()[0].empty()) {
                    consoleBuffer->deleteChar();
                }
            }
            std::cout << "Console cleared\n";
        }
        else if (command.find("clear ") == 0) {
            std::string target = command.substr(6);
            if (target == "REPL.txt") {
                // Clear REPL buffer
                while (replBuffer->getLineCount() > 1) {
                    replBuffer->setCursor(0, 0);
                    replBuffer->deleteLine();
                }
                // Clear the last remaining line
                if (replBuffer->getLineCount() > 0) {
                    replBuffer->setCursor(0, 0);
                    while (!replBuffer->getLines()[0].empty()) {
                        replBuffer->deleteChar();
                    }
                }
                std::cout << "REPL.txt cleared\n";
            }
        }
        else if (command.find("run ") == 0) {
            std::string target = command.substr(4);
            if (target == "REPL.txt") {
                // Process any #import directives first
                processImportDirectives();

                // Collect all lines from REPL buffer
                std::string code;
                const auto& lines = replBuffer->getLines();
                for (const auto& line : lines) {
                    code += line + "\n";
                }

                // Execute the code
                std::cout << "Running REPL code:\n" << code << "\n";
                auto outputs = replInterpreter->execute(code);

                // Display output in console
                for (const auto& output : outputs) {
                    consoleBuffer->addOutputLine(output);
                }

                std::cout << "Execution complete. " << outputs.size() << " output lines.\n";
            }
        }
        else if (command == "update dossier.json") {
            // Update device/monitor enumeration
            dossierManager->updateVideoDevices();
            dossierManager->updateMonitors();

            // Generate JSON
            std::string jsonContent = dossierManager->toJSON();

            // Update dossier buffer with JSON content
            // Clear existing buffer
            while (dossierBuffer->getLineCount() > 1) {
                dossierBuffer->setCursor(0, 0);
                dossierBuffer->deleteLine();
            }
            if (dossierBuffer->getLineCount() > 0) {
                dossierBuffer->setCursor(0, 0);
                while (!dossierBuffer->getLines()[0].empty()) {
                    dossierBuffer->deleteChar();
                }
            }

            // Add JSON lines to dossier buffer
            std::istringstream jsonStream(jsonContent);
            std::string line;
            bool firstLine = true;
            while (std::getline(jsonStream, line)) {
                if (!firstLine) {
                    dossierBuffer->insertNewline();
                }
                firstLine = false;
                for (char c : line) {
                    dossierBuffer->insertChar(c);
                }
            }

            // Save to file
            dossierManager->saveToFile("dossier.json");

            consoleBuffer->addOutputLine("Updated dossier.json");
            std::cout << "Updated dossier.json\n";
        }
        else if (command.find("import ") == 0) {
            // Parse: import REPL.txt <presetfile>
            std::istringstream cmdStream(command.substr(7)); // Skip "import "
            std::string targetFile, presetFile;
            cmdStream >> targetFile >> presetFile;

            if (targetFile == "REPL.txt" && !presetFile.empty()) {
                // Read preset file from presets directory
                std::string presetPath = "../presets/" + presetFile;
                std::ifstream inFile(presetPath);

                if (inFile.is_open()) {
                    std::string presetContent;
                    std::string line;
                    while (std::getline(inFile, line)) {
                        presetContent += line + "\n";
                    }
                    inFile.close();

                    // Append preset content to REPL buffer
                    // Move cursor to end
                    if (replBuffer->getLineCount() > 0) {
                        int lastLine = replBuffer->getLineCount() - 1;
                        int lastCol = replBuffer->getLines()[lastLine].length();
                        replBuffer->setCursor(lastLine, lastCol);
                        replBuffer->insertNewline();
                    }

                    // Insert preset content
                    for (char c : presetContent) {
                        if (c == '\n') {
                            replBuffer->insertNewline();
                        } else {
                            replBuffer->insertChar(c);
                        }
                    }

                    // Process any #import directives in the buffer
                    processImportDirectives();

                    consoleBuffer->addOutputLine("Imported " + presetFile + " into REPL.txt");
                    std::cout << "Imported " << presetFile << " into REPL.txt\n";
                } else {
                    consoleBuffer->addOutputLine("ERROR: Could not open preset file: " + presetPath);
                    std::cout << "ERROR: Could not open preset file: " << presetPath << "\n";
                }
            } else {
                consoleBuffer->addOutputLine("ERROR: Invalid import command. Usage: import REPL.txt <presetfile>");
                std::cout << "ERROR: Invalid import command. Usage: import REPL.txt <presetfile>\n";
            }
        }
        else {
            consoleBuffer->addOutputLine("Unknown command: " + command);
            std::cout << "Unknown command: " << command << "\n";
        }
    };

    // Register the shell command callback
    inputHandler->setShellCommandCallback(executeShellCommand);

    // Register shell history callback
    inputHandler->setShellHistoryCallback([&commandHistory, &historyIndex](int direction) -> std::string {
        if (commandHistory.empty()) {
            return "";
        }

        if (direction < 0) {
            // UP - go to previous command
            if (historyIndex > 0) {
                historyIndex--;
            }
        } else {
            // DOWN - go to next command
            if (historyIndex < (int)commandHistory.size()) {
                historyIndex++;
            }
        }

        // Return command at current index (or empty if at end)
        if (historyIndex >= 0 && historyIndex < (int)commandHistory.size()) {
            return commandHistory[historyIndex];
        }
        return "";  // Empty command line when at the end
    });

    std::cout << "Initialization complete!\n";
    std::cout << "Controls:\n";
    std::cout << "  Alt+Space, then F - Toggle fullscreen\n";
    std::cout << "  Alt+Space, then [1/2/3/4] - Switch between text windows\n";
    std::cout << "    1: dossier.json\n";
    std::cout << "    2: REPL.txt\n";
    std::cout << "    3: shell\n";
    std::cout << "    4: console\n";
    std::cout << "  Alt+Space, then [ - Enter copy mode (scroll with hjkl)\n";
    std::cout << "  Vim modes: i (insert), ESC (normal), hjkl (move), x (delete), dd (delete line)\n";

    // Helper function to render text buffer content
    // windowType: "editor" (dossier/REPL), "console", "shell"
    auto renderTextWindow = [&](const Rect& rect, TextBuffer* buffer, const std::string& title, bool isActive, const std::string& windowType) {
        const int charPixelWidth = 6 * 4;
        const int lineHeight = 7 * 4;
        const int lineSpacing = 16;  // Increased spacing between lines
        const int lineNumWidth = (windowType == "editor") ? 60 : 0;

        // Draw title
        renderer->drawText(title, rect.x + 5, rect.y + rect.height - 20, 0.7f, 0.7f, 0.7f);

        // Get buffer lines
        const auto& lines = buffer->getLines();
        int cursorRow = buffer->getCursorRow();
        int cursorCol = buffer->getCursorCol();
        int scrollOffset = buffer->getScrollOffset();

        // Calculate how many lines we can display
        int availableHeight = rect.height - 60; // Leave space for title and mode
        int maxVisibleLines = availableHeight / (lineHeight + lineSpacing);

        // Update buffer with visible line count for auto-scrolling
        buffer->setVisibleLines(maxVisibleLines);

        if (windowType == "shell") {
            // Shell: show history above, command line at bottom
            // Last line is the command line, everything else is history
            int historyLines = lines.size() > 1 ? lines.size() - 1 : 0;
            int displayLines = maxVisibleLines - 1; // Reserve one line for command input

            // Render history (scrollable)
            int historyStart = (buffer->getMode() == VimMode::COPY) ? scrollOffset : std::max(0, historyLines - displayLines);
            int historyEnd = std::min(historyLines, historyStart + displayLines);

            for (int i = historyStart; i < historyEnd; i++) {
                int displayRow = i - historyStart;
                int yPos = rect.y + rect.height - 60 - ((displayRow + 1) * (lineHeight + lineSpacing));
                renderer->drawText(lines[i], rect.x + 10, yPos, 0.7f, 0.7f, 0.7f);
            }

            // Render command line at bottom
            if (lines.size() > 0) {
                int cmdLineY = rect.y + 40; // Just above mode indicator
                renderer->drawText("> ", rect.x + 10, cmdLineY, 0.9f, 0.9f, 0.9f);
                int cmdTextX = rect.x + 10 + (2 * charPixelWidth); // After "> "
                renderer->drawText(lines[lines.size() - 1], cmdTextX, cmdLineY, 0.9f, 0.9f, 0.9f);

                // Draw cursor on command line in INSERT/NORMAL mode
                if (isActive && buffer->getMode() != VimMode::COPY) {
                    int cursorX = cmdTextX + (cursorCol * charPixelWidth);
                    Rect cursorRect;
                    if (buffer->getMode() == VimMode::INSERT) {
                        cursorRect = {cursorX, cmdLineY - lineHeight, 3, lineHeight};
                        renderer->drawRect(cursorRect, 0.9f, 0.9f, 0.9f, 1.0f);
                    } else {
                        cursorRect = {cursorX, cmdLineY - lineHeight, charPixelWidth, lineHeight};
                        renderer->drawRect(cursorRect, 0.5f, 0.5f, 0.5f, 0.5f);
                    }
                }
            }
        } else {
            // Editor or Console: normal rendering
            int startLine = (buffer->getMode() == VimMode::COPY) ? scrollOffset : 0;
            int endLine = std::min((int)lines.size(), startLine + maxVisibleLines);

            for (int i = startLine; i < endLine; i++) {
                int displayRow = i - startLine;
                int yPos = rect.y + rect.height - 60 - ((displayRow + 1) * (lineHeight + lineSpacing));

                // Draw line number (only for editors)
                if (windowType == "editor") {
                    std::string numStr = std::to_string(i + 1);
                    int numWidth = numStr.length() * charPixelWidth;
                    int numXPos = rect.x + lineNumWidth - numWidth;
                    renderer->drawText(numStr, numXPos, yPos, 0.5f, 0.5f, 0.5f);
                }

                // Draw line content
                int textXPos = rect.x + lineNumWidth + 10;
                if (i < lines.size()) {
                    renderer->drawText(lines[i], textXPos, yPos, 0.9f, 0.9f, 0.9f);

                    // Draw cursor (for editors and console in NORMAL/COPY mode)
                    if (isActive && i == cursorRow && buffer->getMode() != VimMode::COPY) {
                        int cursorX = textXPos + (cursorCol * charPixelWidth);
                        Rect cursorRect;
                        if (buffer->getMode() == VimMode::INSERT) {
                            // Console never enters INSERT mode, so only editors get thin cursor
                            if (windowType == "editor") {
                                cursorRect = {cursorX, yPos - lineHeight, 3, lineHeight};
                                renderer->drawRect(cursorRect, 0.9f, 0.9f, 0.9f, 1.0f);
                            }
                        } else {
                            // NORMAL mode cursor for both editors and console
                            cursorRect = {cursorX, yPos - lineHeight, charPixelWidth, lineHeight};
                            renderer->drawRect(cursorRect, 0.5f, 0.5f, 0.5f, 0.5f);
                        }
                    }
                }
            }
        }

        // Draw mode indicator at bottom
        if (isActive) {
            const char* modeStr = "";
            if (buffer->getMode() == VimMode::NORMAL) modeStr = "NORMAL";
            else if (buffer->getMode() == VimMode::INSERT) modeStr = "INSERT";
            else if (buffer->getMode() == VimMode::COPY) modeStr = "COPY";

            renderer->drawText(modeStr, rect.x + 5, rect.y + 10, 0.9f, 0.9f, 0.2f);
        }
    };

    // Main loop
    while (!windowMgr->shouldClose()) {
        // Update layout based on current tab
        int fbWidth, fbHeight;
        windowMgr->getFramebufferSize(&fbWidth, &fbHeight);
        if (currentTab == 0) {
            layoutMgr->update(fbWidth, fbHeight);  // Tab 1: main display
        } else if (currentTab == 1) {
            layoutMgr->updateTab2(fbWidth, fbHeight);  // Tab 2: REPL focus
        } else if (currentTab == 2) {
            layoutMgr->updateTab3(fbWidth, fbHeight);  // Tab 3: fullscreen monitor1
        } else if (currentTab == 3) {
            layoutMgr->updateTab4(fbWidth, fbHeight);  // Tab 4: centered monitor2
        }

        // Execute video pipeline (fetch frames and composite outputs)
        replInterpreter->executeVideoPipeline();

        // Process input
        inputHandler->processInput(windowMgr->getWindow());

        // Clear screen
        renderer->clear(0.1f, 0.1f, 0.12f, 1.0f);

        // Get active window for highlighting
        int activeWindow = inputHandler->getActiveWindow();

        // Render based on current tab
        if (currentTab == 0) {
            // TAB 1: Main display with all 6 windows
            Rect videoRect = layoutMgr->getVideoDisplayRect();
            Rect mobileRect = layoutMgr->getMobileDisplayRect();
            Rect dossierRect = layoutMgr->getDossierEditorRect();
            Rect replRect = layoutMgr->getReplEditorRect();
            Rect shellRect = layoutMgr->getShellWindowRect();
            Rect consoleRect = layoutMgr->getConsoleWindowRect();

            // Draw video display (monitor1)
            renderer->drawRect(videoRect, 0.0f, 0.0f, 0.0f, 1.0f);
            auto monitor1Output = replInterpreter->getOutputVariable("monitor1");
            if (monitor1Output && monitor1Output->getOutputTexture() != 0) {
                renderer->drawTexture(monitor1Output->getOutputTexture(), videoRect);
            }
            renderer->drawBorder(videoRect, 0.3f, 0.3f, 0.35f, 1.0f, 2);
            renderer->drawText("monitor1", videoRect.x + 5, videoRect.y + videoRect.height - 20, 0.5f, 0.5f, 0.5f);

            // Draw mobile display (monitor2)
            renderer->drawRect(mobileRect, 0.0f, 0.0f, 0.0f, 1.0f);
            auto monitor2Output = replInterpreter->getOutputVariable("monitor2");
            if (monitor2Output && monitor2Output->getOutputTexture() != 0) {
                renderer->drawTexture(monitor2Output->getOutputTexture(), mobileRect);
            }
            renderer->drawBorder(mobileRect, 0.3f, 0.3f, 0.35f, 1.0f, 2);
            renderer->drawText("monitor2", mobileRect.x + 5, mobileRect.y + mobileRect.height - 20, 0.5f, 0.5f, 0.5f);

            // Dossier editor (window 0)
            renderer->drawRect(dossierRect, 0.15f, 0.15f, 0.17f, 1.0f);
            if (activeWindow == 0) {
                renderer->drawBorder(dossierRect, 0.2f, 0.6f, 0.9f, 1.0f, 3);
            } else {
                renderer->drawBorder(dossierRect, 0.3f, 0.3f, 0.35f, 1.0f, 2);
            }
            renderTextWindow(dossierRect, dossierBuffer.get(), "dossier.json", activeWindow == 0, "editor");

            // REPL editor (window 1)
            renderer->drawRect(replRect, 0.15f, 0.15f, 0.17f, 1.0f);
            if (activeWindow == 1) {
                renderer->drawBorder(replRect, 0.2f, 0.6f, 0.9f, 1.0f, 3);
            } else {
                renderer->drawBorder(replRect, 0.3f, 0.3f, 0.35f, 1.0f, 2);
            }
            renderTextWindow(replRect, replBuffer.get(), "REPL.txt", activeWindow == 1, "editor");

            // Shell window (window 2)
            renderer->drawRect(shellRect, 0.05f, 0.05f, 0.07f, 1.0f);
            if (activeWindow == 2) {
                renderer->drawBorder(shellRect, 0.2f, 0.6f, 0.9f, 1.0f, 3);
            } else {
                renderer->drawBorder(shellRect, 0.3f, 0.3f, 0.35f, 1.0f, 2);
            }
            renderTextWindow(shellRect, shellBuffer.get(), "shell", activeWindow == 2, "shell");

            // Console window (window 3)
            renderer->drawRect(consoleRect, 0.05f, 0.05f, 0.07f, 1.0f);
            if (activeWindow == 3) {
                renderer->drawBorder(consoleRect, 0.2f, 0.6f, 0.9f, 1.0f, 3);
            } else {
                renderer->drawBorder(consoleRect, 0.3f, 0.3f, 0.35f, 1.0f, 2);
            }
            renderTextWindow(consoleRect, consoleBuffer.get(), "console", activeWindow == 3, "console");

        } else if (currentTab == 1) {
            // TAB 2: REPL focus layout
            Rect replRect = layoutMgr->getTab2ReplRect();
            Rect shellRect = layoutMgr->getTab2ShellRect();
            Rect consoleRect = layoutMgr->getTab2ConsoleRect();

            // REPL editor (window 1) - full width, top half
            renderer->drawRect(replRect, 0.15f, 0.15f, 0.17f, 1.0f);
            if (activeWindow == 1) {
                renderer->drawBorder(replRect, 0.2f, 0.6f, 0.9f, 1.0f, 3);
            } else {
                renderer->drawBorder(replRect, 0.3f, 0.3f, 0.35f, 1.0f, 2);
            }
            renderTextWindow(replRect, replBuffer.get(), "REPL.txt", activeWindow == 1, "editor");

            // Console window (window 3) - full width, 3rd quarter
            renderer->drawRect(consoleRect, 0.05f, 0.05f, 0.07f, 1.0f);
            if (activeWindow == 3) {
                renderer->drawBorder(consoleRect, 0.2f, 0.6f, 0.9f, 1.0f, 3);
            } else {
                renderer->drawBorder(consoleRect, 0.3f, 0.3f, 0.35f, 1.0f, 2);
            }
            renderTextWindow(consoleRect, consoleBuffer.get(), "console", activeWindow == 3, "console");

            // Shell window (window 2) - full width, bottom quarter
            renderer->drawRect(shellRect, 0.05f, 0.05f, 0.07f, 1.0f);
            if (activeWindow == 2) {
                renderer->drawBorder(shellRect, 0.2f, 0.6f, 0.9f, 1.0f, 3);
            } else {
                renderer->drawBorder(shellRect, 0.3f, 0.3f, 0.35f, 1.0f, 2);
            }
            renderTextWindow(shellRect, shellBuffer.get(), "shell", activeWindow == 2, "shell");
        } else if (currentTab == 2) {
            // TAB 3: Fullscreen monitor1 display (1920x1080 aspect ratio)
            Rect monitor1Rect = layoutMgr->getTab3Monitor1Rect();

            // Draw black background for letterboxing/pillarboxing
            renderer->drawRect({0, 0, fbWidth, fbHeight}, 0.0f, 0.0f, 0.0f, 1.0f);

            // Draw monitor1 output
            auto monitor1Output = replInterpreter->getOutputVariable("monitor1");
            if (monitor1Output && monitor1Output->getOutputTexture() != 0) {
                renderer->drawTexture(monitor1Output->getOutputTexture(), monitor1Rect);
            }
        } else if (currentTab == 3) {
            // TAB 4: Centered monitor2 display (mobile aspect ratio)
            Rect monitor2Rect = layoutMgr->getTab4Monitor2Rect();

            // Draw black background for letterboxing/pillarboxing
            renderer->drawRect({0, 0, fbWidth, fbHeight}, 0.0f, 0.0f, 0.0f, 1.0f);

            // Draw monitor2 output
            auto monitor2Output = replInterpreter->getOutputVariable("monitor2");
            if (monitor2Output && monitor2Output->getOutputTexture() != 0) {
                renderer->drawTexture(monitor2Output->getOutputTexture(), monitor2Rect);
            }
        }

        // Draw tab indicator in top-right corner
        std::string tabIndicator = "Tab " + std::to_string(currentTab + 1);
        // Each character is 6 pixels * 4 scale = 24 pixels wide
        // "Tab X" is 5 characters = 120 pixels + 10 padding
        renderer->drawText(tabIndicator, fbWidth - 130, fbHeight - 30, 0.5f, 0.8f, 0.5f);

        // Swap buffers and poll events
        windowMgr->swapBuffers();
        windowMgr->pollEvents();
    }

    std::cout << "Shutting down...\n";
    return 0;
}
