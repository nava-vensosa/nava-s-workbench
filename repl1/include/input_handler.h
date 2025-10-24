#ifndef INPUT_HANDLER_H
#define INPUT_HANDLER_H

#define GLFW_INCLUDE_NONE
#include <GLFW/glfw3.h>
#include <functional>

class TextBuffer;

class InputHandler {
public:
    InputHandler();

    void setup(GLFWwindow* window);
    void processInput(GLFWwindow* window);

    // Callbacks
    void setWindowSwitchCallback(std::function<void(int)> callback) { windowSwitchCallback = callback; }
    void setFullscreenToggleCallback(std::function<void()> callback) { fullscreenToggleCallback = callback; }
    void setCharCallback(std::function<void(unsigned int)> callback) { charCallback = callback; }
    void setKeyCallback(std::function<void(int, int, int, int)> callback) { keyCallback = callback; }

    int getActiveWindow() const { return activeWindow; }

    // Text buffer management
    void setActiveTextBuffer(TextBuffer* buffer) { activeTextBuffer = buffer; }

private:
    static void keyCallbackStatic(GLFWwindow* window, int key, int scancode, int action, int mods);
    static void charCallbackStatic(GLFWwindow* window, unsigned int codepoint);

    std::function<void(int)> windowSwitchCallback;
    std::function<void()> fullscreenToggleCallback;
    std::function<void(unsigned int)> charCallback;
    std::function<void(int, int, int, int)> keyCallback;

    int activeWindow; // 0=dossier, 1=repl, 2=shell, 3=console
    bool altPressed;
    bool commandMode; // True when Alt+Space has been pressed, waiting for window number
    bool ignoreNextChar; // True when we just entered insert mode with a command key

    TextBuffer* activeTextBuffer; // Pointer to the active window's text buffer
    int lastKey; // For handling commands like 'dd'
};

#endif // INPUT_HANDLER_H
