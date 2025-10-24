#include <iostream>
#include <memory>
#include <glad/glad.h>
#include "window_manager.h"
#include "layout_manager.h"
#include "renderer.h"
#include "input_handler.h"
#include "nvim_client.h"
#include "text_buffer.h"

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

    // Setup input callbacks
    inputHandler->setFullscreenToggleCallback([&windowMgr]() {
        windowMgr->toggleFullscreen();
    });

    inputHandler->setWindowSwitchCallback([&inputHandler, &buffers](int window) {
        std::cout << "Switched to window " << window << "\n";
        if (window >= 0 && window < 4) {
            inputHandler->setActiveTextBuffer(buffers[window]);
        }
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
    auto renderTextWindow = [&](const Rect& rect, TextBuffer* buffer, const std::string& title, bool isActive) {
        const int charPixelWidth = 6 * 4;
        const int lineHeight = 7 * 4;
        const int lineSpacing = 16;  // Increased spacing between lines
        const int lineNumWidth = 60;

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

        // Render visible lines
        int startLine = (buffer->getMode() == VimMode::COPY) ? scrollOffset : 0;
        int endLine = std::min((int)lines.size(), startLine + maxVisibleLines);

        for (int i = startLine; i < endLine; i++) {
            int displayRow = i - startLine;
            int yPos = rect.y + rect.height - 60 - ((displayRow + 1) * (lineHeight + lineSpacing));

            // Draw line number (right-justified)
            std::string numStr = std::to_string(i + 1);
            int numWidth = numStr.length() * charPixelWidth;
            int numXPos = rect.x + lineNumWidth - numWidth;
            renderer->drawText(numStr, numXPos, yPos, 0.5f, 0.5f, 0.5f);

            // Draw line content
            int textXPos = rect.x + lineNumWidth + 10;
            if (i < lines.size()) {
                renderer->drawText(lines[i], textXPos, yPos, 0.9f, 0.9f, 0.9f);

                // Draw cursor if this is the active window and current line
                if (isActive && i == cursorRow && buffer->getMode() != VimMode::COPY) {
                    int cursorX = textXPos + (cursorCol * charPixelWidth);
                    Rect cursorRect;
                    // Align cursor bottom with text bottom: yPos is the top, so bottom is yPos - lineHeight
                    if (buffer->getMode() == VimMode::INSERT) {
                        // Line cursor in insert mode (thin vertical line)
                        cursorRect = {cursorX, yPos - lineHeight, 3, lineHeight};
                        renderer->drawRect(cursorRect, 0.9f, 0.9f, 0.9f, 1.0f);
                    } else {
                        // Block cursor in normal mode
                        cursorRect = {cursorX, yPos - lineHeight, charPixelWidth, lineHeight};
                        renderer->drawRect(cursorRect, 0.5f, 0.5f, 0.5f, 0.5f);
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
        // Update layout
        int fbWidth, fbHeight;
        windowMgr->getFramebufferSize(&fbWidth, &fbHeight);
        layoutMgr->update(fbWidth, fbHeight);

        // Process input
        inputHandler->processInput(windowMgr->getWindow());

        // Clear screen
        renderer->clear(0.1f, 0.1f, 0.12f, 1.0f);

        // Get layout rectangles
        Rect videoRect = layoutMgr->getVideoDisplayRect();
        Rect mobileRect = layoutMgr->getMobileDisplayRect();
        Rect dossierRect = layoutMgr->getDossierEditorRect();
        Rect replRect = layoutMgr->getReplEditorRect();
        Rect shellRect = layoutMgr->getShellWindowRect();
        Rect consoleRect = layoutMgr->getConsoleWindowRect();

        // Draw video display placeholder (monitor1)
        renderer->drawRect(videoRect, 0.0f, 0.0f, 0.0f, 1.0f);
        renderer->drawBorder(videoRect, 0.3f, 0.3f, 0.35f, 1.0f, 2);
        renderer->drawText("monitor1", videoRect.x + 5, videoRect.y + videoRect.height - 20, 0.5f, 0.5f, 0.5f);

        // Draw mobile display placeholder (monitor2)
        renderer->drawRect(mobileRect, 0.0f, 0.0f, 0.0f, 1.0f);
        renderer->drawBorder(mobileRect, 0.3f, 0.3f, 0.35f, 1.0f, 2);
        renderer->drawText("monitor2", mobileRect.x + 5, mobileRect.y + mobileRect.height - 20, 0.5f, 0.5f, 0.5f);

        // Draw text editor windows with highlights for active window
        int activeWindow = inputHandler->getActiveWindow();

        // Dossier editor (window 0)
        renderer->drawRect(dossierRect, 0.15f, 0.15f, 0.17f, 1.0f);
        if (activeWindow == 0) {
            renderer->drawBorder(dossierRect, 0.2f, 0.6f, 0.9f, 1.0f, 3);
        } else {
            renderer->drawBorder(dossierRect, 0.3f, 0.3f, 0.35f, 1.0f, 2);
        }
        renderTextWindow(dossierRect, dossierBuffer.get(), "dossier.json", activeWindow == 0);

        // REPL editor (window 1)
        renderer->drawRect(replRect, 0.15f, 0.15f, 0.17f, 1.0f);
        if (activeWindow == 1) {
            renderer->drawBorder(replRect, 0.2f, 0.6f, 0.9f, 1.0f, 3);
        } else {
            renderer->drawBorder(replRect, 0.3f, 0.3f, 0.35f, 1.0f, 2);
        }
        renderTextWindow(replRect, replBuffer.get(), "REPL.txt", activeWindow == 1);

        // Shell window (window 2)
        renderer->drawRect(shellRect, 0.05f, 0.05f, 0.07f, 1.0f);
        if (activeWindow == 2) {
            renderer->drawBorder(shellRect, 0.2f, 0.6f, 0.9f, 1.0f, 3);
        } else {
            renderer->drawBorder(shellRect, 0.3f, 0.3f, 0.35f, 1.0f, 2);
        }
        renderTextWindow(shellRect, shellBuffer.get(), "shell", activeWindow == 2);

        // Console window (window 3)
        renderer->drawRect(consoleRect, 0.05f, 0.05f, 0.07f, 1.0f);
        if (activeWindow == 3) {
            renderer->drawBorder(consoleRect, 0.2f, 0.6f, 0.9f, 1.0f, 3);
        } else {
            renderer->drawBorder(consoleRect, 0.3f, 0.3f, 0.35f, 1.0f, 2);
        }
        renderTextWindow(consoleRect, consoleBuffer.get(), "console", activeWindow == 3);

        // Swap buffers and poll events
        windowMgr->swapBuffers();
        windowMgr->pollEvents();
    }

    std::cout << "Shutting down...\n";
    return 0;
}
