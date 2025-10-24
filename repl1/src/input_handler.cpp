#include "input_handler.h"
#include "text_buffer.h"
#include <iostream>

InputHandler::InputHandler()
    : activeWindow(0), altPressed(false), commandMode(false),
      ignoreNextChar(false), activeTextBuffer(nullptr), lastKey(-1) {
}

void InputHandler::setup(GLFWwindow* window) {
    glfwSetWindowUserPointer(window, this);
    glfwSetKeyCallback(window, keyCallbackStatic);
    glfwSetCharCallback(window, charCallbackStatic);
}

void InputHandler::processInput(GLFWwindow* window) {
    // Input processing handled in callbacks
}

void InputHandler::keyCallbackStatic(GLFWwindow* window, int key, int scancode, int action, int mods) {
    InputHandler* handler = static_cast<InputHandler*>(glfwGetWindowUserPointer(window));
    if (!handler) return;

    TextBuffer* buffer = handler->activeTextBuffer;

    // F11 for fullscreen toggle
    if (key == GLFW_KEY_F11 && action == GLFW_PRESS) {
        if (handler->fullscreenToggleCallback) {
            handler->fullscreenToggleCallback();
        }
        return;
    }

    // Track Alt key state
    if (key == GLFW_KEY_LEFT_ALT || key == GLFW_KEY_RIGHT_ALT) {
        handler->altPressed = (action == GLFW_PRESS || action == GLFW_REPEAT);
    }

    // Alt+Space enters command mode (for window switching)
    if (key == GLFW_KEY_SPACE && (mods & GLFW_MOD_ALT) && action == GLFW_PRESS) {
        handler->commandMode = true;
        std::cout << "Command mode: Press F (fullscreen), 1/2/3/4 (switch windows), or [ (copy mode)\n";
        return;
    }

    // In command mode
    if (handler->commandMode && action == GLFW_PRESS) {
        // Check for F to toggle fullscreen
        if (key == GLFW_KEY_F) {
            if (handler->fullscreenToggleCallback) {
                handler->fullscreenToggleCallback();
            }
            handler->commandMode = false;
            return;
        }

        // Check for [ to enter copy mode
        if (key == GLFW_KEY_LEFT_BRACKET) {
            if (buffer) {
                buffer->setMode(VimMode::COPY);
                std::cout << "-- COPY --\n";
            }
            handler->commandMode = false;
            return;
        }

        // Check for window switch keys (1, 2, 3, 4 or numpad 1, 2, 3, 4)
        int newWindow = -1;
        if (key == GLFW_KEY_1 || key == GLFW_KEY_KP_1) newWindow = 0;
        else if (key == GLFW_KEY_2 || key == GLFW_KEY_KP_2) newWindow = 1;
        else if (key == GLFW_KEY_3 || key == GLFW_KEY_KP_3) newWindow = 2;
        else if (key == GLFW_KEY_4 || key == GLFW_KEY_KP_4) newWindow = 3;

        if (newWindow >= 0) {
            handler->activeWindow = newWindow;
            std::cout << "Switched to window " << newWindow << "\n";
            if (handler->windowSwitchCallback) {
                handler->windowSwitchCallback(newWindow);
            }
        }

        handler->commandMode = false;
        return;
    }

    if (!buffer || action == GLFW_RELEASE) return;

    VimMode mode = buffer->getMode();

    // COPY MODE - for scrolling through history
    if (mode == VimMode::COPY) {
        if (key == GLFW_KEY_ESCAPE && action == GLFW_PRESS) {
            buffer->setMode(VimMode::NORMAL);
            std::cout << "Exited copy mode\n";
            return;
        }

        // Vim motion keys for scrolling
        if (action == GLFW_PRESS || action == GLFW_REPEAT) {
            if (key == GLFW_KEY_H || key == GLFW_KEY_LEFT) buffer->scrollUp();
            else if (key == GLFW_KEY_J || key == GLFW_KEY_DOWN) buffer->scrollDown();
            else if (key == GLFW_KEY_K || key == GLFW_KEY_UP) buffer->scrollUp();
            else if (key == GLFW_KEY_L || key == GLFW_KEY_RIGHT) buffer->scrollDown();
        }
        return;
    }

    // INSERT MODE
    if (mode == VimMode::INSERT) {
        if (key == GLFW_KEY_ESCAPE && action == GLFW_PRESS) {
            buffer->setMode(VimMode::NORMAL);
            buffer->moveCursorLeft(); // Move back one character in normal mode
            std::cout << "-- NORMAL --\n";
            return;
        }

        if (action == GLFW_PRESS || action == GLFW_REPEAT) {
            if (key == GLFW_KEY_BACKSPACE) {
                buffer->deleteCharBefore();
            } else if (key == GLFW_KEY_ENTER) {
                buffer->insertNewline();
            } else if (key == GLFW_KEY_LEFT) {
                buffer->moveCursorLeft();
            } else if (key == GLFW_KEY_RIGHT) {
                buffer->moveCursorRight();
            } else if (key == GLFW_KEY_UP) {
                buffer->moveCursorUp();
            } else if (key == GLFW_KEY_DOWN) {
                buffer->moveCursorDown();
            }
        }
        return;
    }

    // NORMAL MODE
    if (mode == VimMode::NORMAL && (action == GLFW_PRESS || action == GLFW_REPEAT)) {
        // Movement commands
        if (key == GLFW_KEY_H || key == GLFW_KEY_LEFT) {
            buffer->moveCursorLeft();
        } else if (key == GLFW_KEY_J || key == GLFW_KEY_DOWN) {
            buffer->moveCursorDown();
        } else if (key == GLFW_KEY_K || key == GLFW_KEY_UP) {
            buffer->moveCursorUp();
        } else if (key == GLFW_KEY_L || key == GLFW_KEY_RIGHT) {
            buffer->moveCursorRight();
        } else if (key == GLFW_KEY_W) {
            buffer->moveCursorWordForward();
        } else if (key == GLFW_KEY_B) {
            if (mods & GLFW_MOD_SHIFT) {
                // B - WORD backward
                buffer->moveCursorWORDBackward();
            } else {
                // b - word backward
                buffer->moveCursorWordBackward();
            }
        } else if (key == GLFW_KEY_E) {
            if (mods & GLFW_MOD_SHIFT) {
                // E - end of WORD
                buffer->moveCursorWORDEnd();
            } else {
                // e - end of word
                buffer->moveCursorWordEnd();
            }
        } else if (key == GLFW_KEY_0) {
            buffer->moveCursorLineStart();
        } else if (key == GLFW_KEY_4 && (mods & GLFW_MOD_SHIFT)) { // $ (Shift+4)
            buffer->moveCursorLineEnd();
        } else if (key == GLFW_KEY_G) {
            if (handler->lastKey == GLFW_KEY_G) {
                // gg - go to first line
                buffer->moveCursorFirstLine();
                handler->lastKey = -1;
            } else if (mods & GLFW_MOD_SHIFT) {
                // G - go to last line
                buffer->moveCursorLastLine();
            } else {
                // First 'g' press
                handler->lastKey = GLFW_KEY_G;
            }
        } else if (key == GLFW_KEY_LEFT_BRACKET && (mods & GLFW_MOD_SHIFT)) { // { (Shift+[)
            buffer->moveCursorPrevParagraph();
        } else if (key == GLFW_KEY_RIGHT_BRACKET && (mods & GLFW_MOD_SHIFT)) { // } (Shift+])
            buffer->moveCursorNextParagraph();
        }

        // Enter insert mode
        else if (key == GLFW_KEY_I) {
            if (mods & GLFW_MOD_SHIFT) {
                // I - insert at beginning of line
                buffer->moveCursorLineStart();
            }
            buffer->setMode(VimMode::INSERT);
            handler->ignoreNextChar = true;
            std::cout << "-- INSERT --\n";
        } else if (key == GLFW_KEY_A) {
            // Enter INSERT mode first so cursor positioning works correctly
            buffer->setMode(VimMode::INSERT);
            if (mods & GLFW_MOD_SHIFT) {
                // A - append at end of line
                buffer->moveCursorLineEnd();
            } else {
                // a - append after cursor
                buffer->moveCursorRight();
            }
            handler->ignoreNextChar = true;
            std::cout << "-- INSERT --\n";
        } else if (key == GLFW_KEY_O) {
            if (mods & GLFW_MOD_SHIFT) {
                // O - open line above
                buffer->moveCursorLineStart();
                buffer->insertNewline();
                buffer->moveCursorUp();
            } else {
                // o - open line below
                buffer->moveCursorLineEnd();
                buffer->insertNewline();
            }
            buffer->setMode(VimMode::INSERT);
            handler->ignoreNextChar = true;
            std::cout << "-- INSERT --\n";
        } else if (key == GLFW_KEY_S) {
            if (mods & GLFW_MOD_SHIFT) {
                // S - substitute line (delete line and enter insert mode)
                buffer->deleteLine();
            } else {
                // s - substitute character (delete char and enter insert mode)
                buffer->deleteChar();
            }
            buffer->setMode(VimMode::INSERT);
            handler->ignoreNextChar = true;
            std::cout << "-- INSERT --\n";
        }

        // Delete operations
        else if (key == GLFW_KEY_X) {
            buffer->deleteChar();
        } else if (key == GLFW_KEY_D) {
            if (handler->lastKey == GLFW_KEY_D) {
                // dd - delete line
                buffer->deleteLine();
                handler->lastKey = -1;
            } else {
                handler->lastKey = GLFW_KEY_D;
            }
        } else {
            // Reset last key if it's not 'd' or 'g'
            if (key != GLFW_KEY_D && key != GLFW_KEY_G) {
                handler->lastKey = -1;
            }
        }
    }
}

void InputHandler::charCallbackStatic(GLFWwindow* window, unsigned int codepoint) {
    InputHandler* handler = static_cast<InputHandler*>(glfwGetWindowUserPointer(window));
    if (!handler) return;

    // Skip character if we just entered insert mode with a command key
    if (handler->ignoreNextChar) {
        handler->ignoreNextChar = false;
        return;
    }

    TextBuffer* buffer = handler->activeTextBuffer;
    if (!buffer) return;

    // Only handle character input in INSERT mode
    if (buffer->getMode() == VimMode::INSERT) {
        // Insert printable ASCII characters
        if (codepoint >= 32 && codepoint < 127) {
            buffer->insertChar((char)codepoint);
        }
    }
}
