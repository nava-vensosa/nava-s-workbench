#pragma once

#include <memory>
#include <string>
#include <GLFW/glfw3.h>

// Forward declarations
class PanelManager;
class Renderer;
class Scene;
class CommandParser;

enum class AppMode {
    GUI,
    EXPORT
};

class Application {
public:
    Application();
    ~Application();

    void init(int argc, char** argv);
    void run();
    void shutdown();
    void exportImage(const std::string& filename, int width, int height);

private:
    void initGLFW();
    void initOpenGL();
    void initImGui();
    void runGUIMode();
    void runExportMode(const std::string& script_path, const std::string& output_path);
    void createTestScene();

    AppMode mode_;
    GLFWwindow* window_;
    int window_width_;
    int window_height_;

    // Core systems
    std::unique_ptr<PanelManager> panel_manager_;
    std::unique_ptr<Renderer> renderer_;
    std::unique_ptr<Scene> scene_;
    std::unique_ptr<CommandParser> parser_;
};
