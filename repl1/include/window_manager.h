#ifndef WINDOW_MANAGER_H
#define WINDOW_MANAGER_H

#define GLFW_INCLUDE_NONE
#include <GLFW/glfw3.h>

class WindowManager {
public:
    WindowManager(int width, int height, const char* title);
    ~WindowManager();

    bool init();
    void toggleFullscreen();
    bool shouldClose();
    void swapBuffers();
    void pollEvents();
    GLFWwindow* getWindow() { return window; }
    void getFramebufferSize(int* width, int* height);

private:
    GLFWwindow* window;
    int windowedWidth;
    int windowedHeight;
    int windowedPosX;
    int windowedPosY;
    bool isFullscreen;
};

#endif // WINDOW_MANAGER_H
