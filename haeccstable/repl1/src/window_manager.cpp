#include <glad/glad.h>
#include "window_manager.h"
#include <iostream>

static void errorCallback(int error, const char* description) {
    std::cerr << "GLFW Error " << error << ": " << description << "\n";
}

static void framebufferSizeCallback(GLFWwindow* window, int width, int height) {
    glViewport(0, 0, width, height);
}

WindowManager::WindowManager(int width, int height, const char* title)
    : window(nullptr), windowedWidth(width), windowedHeight(height),
      windowedPosX(0), windowedPosY(0), isFullscreen(false) {
}

WindowManager::~WindowManager() {
    if (window) {
        glfwDestroyWindow(window);
    }
    glfwTerminate();
}

bool WindowManager::init() {
    glfwSetErrorCallback(errorCallback);

    if (!glfwInit()) {
        std::cerr << "Failed to initialize GLFW\n";
        return false;
    }

    // Set OpenGL version (3.3 Core)
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);

#ifdef __APPLE__
    glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);
#endif

    // Create window
    window = glfwCreateWindow(windowedWidth, windowedHeight, "REPL1", nullptr, nullptr);
    if (!window) {
        std::cerr << "Failed to create GLFW window\n";
        glfwTerminate();
        return false;
    }

    // Store window position for fullscreen toggle
    glfwGetWindowPos(window, &windowedPosX, &windowedPosY);

    glfwMakeContextCurrent(window);
    glfwSetFramebufferSizeCallback(window, framebufferSizeCallback);

    // Enable vsync
    glfwSwapInterval(1);

    return true;
}

void WindowManager::toggleFullscreen() {
    if (isFullscreen) {
        // Switch to windowed mode
        glfwSetWindowMonitor(window, nullptr, windowedPosX, windowedPosY,
                            windowedWidth, windowedHeight, 0);
        isFullscreen = false;
        std::cout << "Switched to windowed mode\n";
    } else {
        // Save current window position and size
        glfwGetWindowPos(window, &windowedPosX, &windowedPosY);
        glfwGetWindowSize(window, &windowedWidth, &windowedHeight);

        // Switch to fullscreen
        GLFWmonitor* monitor = glfwGetPrimaryMonitor();
        const GLFWvidmode* mode = glfwGetVideoMode(monitor);
        glfwSetWindowMonitor(window, monitor, 0, 0, mode->width, mode->height, mode->refreshRate);
        isFullscreen = true;
        std::cout << "Switched to fullscreen mode\n";
    }
}

bool WindowManager::shouldClose() {
    return glfwWindowShouldClose(window);
}

void WindowManager::swapBuffers() {
    glfwSwapBuffers(window);
}

void WindowManager::pollEvents() {
    glfwPollEvents();
}

void WindowManager::getFramebufferSize(int* width, int* height) {
    glfwGetFramebufferSize(window, width, height);
}
