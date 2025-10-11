#include "core/Application.h"
#include "core/Scene.h"
#include "core/Frame.h"
#include "core/Body.h"
#include "gui/PanelManager.h"
#include "renderer/Renderer.h"
#include "parser/CommandParser.h"

#include <GL/glew.h>
#include <GLFW/glfw3.h>
#include <imgui.h>
#include <imgui_impl_glfw.h>
#include <imgui_impl_opengl3.h>

#include <iostream>
#include <stdexcept>
#include <cmath>

Application::Application()
    : mode_(AppMode::GUI)
    , window_(nullptr)
    , window_width_(1920)
    , window_height_(1080)
{}

Application::~Application() {}

void Application::init(int argc, char** argv) {
    // Parse command-line arguments
    // For now, just default to GUI mode
    mode_ = AppMode::GUI;

    if (mode_ == AppMode::GUI) {
        initGLFW();
        initOpenGL();
        initImGui();

        // Initialize core systems
        scene_ = std::make_unique<Scene>();
        renderer_ = std::make_unique<Renderer>();
        parser_ = std::make_unique<CommandParser>(scene_.get());

        renderer_->init(window_width_, window_height_);

        // Initialize panel manager
        panel_manager_ = std::make_unique<PanelManager>(
            window_width_, window_height_, scene_.get(), parser_.get());

        // Create test scene with demo shapes
        createTestScene();

        std::cout << "MathViz initialized in GUI mode" << std::endl;
    }
}

void Application::initGLFW() {
    if (!glfwInit()) {
        throw std::runtime_error("Failed to initialize GLFW");
    }

    // OpenGL 4.1 for macOS compatibility
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 4);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 1);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
    glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);

    window_ = glfwCreateWindow(window_width_, window_height_, "MathViz", nullptr, nullptr);
    if (!window_) {
        glfwTerminate();
        throw std::runtime_error("Failed to create GLFW window");
    }

    glfwMakeContextCurrent(window_);
    glfwSwapInterval(1);  // Enable vsync

    // Set user pointer for callbacks
    glfwSetWindowUserPointer(window_, this);

    // Set keyboard callback
    glfwSetKeyCallback(window_, [](GLFWwindow* window, int key, int scancode, int action, int mods) {
        Application* app = static_cast<Application*>(glfwGetWindowUserPointer(window));
        if (app && app->panel_manager_) {
            app->panel_manager_->handleInput(key, action, mods);
        }
    });
}

void Application::initOpenGL() {
    glewExperimental = GL_TRUE;
    GLenum err = glewInit();
    if (err != GLEW_OK) {
        throw std::runtime_error(std::string("Failed to initialize GLEW: ") +
                                 reinterpret_cast<const char*>(glewGetErrorString(err)));
    }

    glEnable(GL_BLEND);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

    std::cout << "OpenGL Version: " << glGetString(GL_VERSION) << std::endl;
    std::cout << "GLSL Version: " << glGetString(GL_SHADING_LANGUAGE_VERSION) << std::endl;
}

void Application::initImGui() {
    IMGUI_CHECKVERSION();
    ImGui::CreateContext();
    ImGuiIO& io = ImGui::GetIO();
    io.ConfigFlags |= ImGuiConfigFlags_NavEnableKeyboard;

    ImGui::StyleColorsDark();

    ImGui_ImplGlfw_InitForOpenGL(window_, true);
    ImGui_ImplOpenGL3_Init("#version 410");

    std::cout << "Dear ImGui initialized" << std::endl;
}

void Application::run() {
    if (mode_ == AppMode::GUI) {
        runGUIMode();
    }
}

void Application::runGUIMode() {
    float last_time = glfwGetTime();
    const float fixed_dt = 1.0f / 30.0f;

    while (!glfwWindowShouldClose(window_)) {
        glfwPollEvents();

        float current_time = glfwGetTime();
        float dt = current_time - last_time;
        last_time = current_time;

        // Start ImGui frame
        ImGui_ImplOpenGL3_NewFrame();
        ImGui_ImplGlfw_NewFrame();
        ImGui::NewFrame();

        // Update scene
        scene_->update(fixed_dt);

        // Update and render panels
        panel_manager_->update(fixed_dt);
        panel_manager_->render(*renderer_);

        // Render ImGui
        ImGui::Render();
        int display_w, display_h;
        glfwGetFramebufferSize(window_, &display_w, &display_h);
        glViewport(0, 0, display_w, display_h);

        glClearColor(0.1f, 0.1f, 0.1f, 1.0f);
        glClear(GL_COLOR_BUFFER_BIT);

        ImGui_ImplOpenGL3_RenderDrawData(ImGui::GetDrawData());

        glfwSwapBuffers(window_);
    }
}

void Application::runExportMode(const std::string& script_path, const std::string& output_path) {
    // TODO: Implement export mode in Phase 13
    throw std::runtime_error("Export mode not yet implemented");
}

void Application::createTestScene() {
    // Create a test frame
    auto frame = std::make_unique<Frame>("test_frame");
    frame->position = glm::vec2(0.0f, 0.0f);
    frame->size = glm::vec2(1600.0f, 900.0f);

    // Create a simple line (sine wave)
    auto sine_line = std::make_unique<LineBody>("sine_wave");
    sine_line->color = glm::vec3(0.2f, 0.6f, 1.0f);  // Blue
    sine_line->thickness = 3.0f;

    // Generate sine wave points
    for (float x = -800.0f; x <= 800.0f; x += 10.0f) {
        float y = 100.0f * sin(x * 0.01f);
        sine_line->points.push_back(glm::vec2(960.0f + x, 540.0f + y));
    }

    // Create a circle
    auto circle_line = std::make_unique<LineBody>("circle");
    circle_line->color = glm::vec3(1.0f, 0.4f, 0.4f);  // Red
    circle_line->thickness = 2.0f;

    // Generate circle points
    const float radius = 150.0f;
    const int segments = 64;
    for (int i = 0; i <= segments; ++i) {
        float angle = (i / (float)segments) * 2.0f * M_PI;
        float x = radius * cos(angle);
        float y = radius * sin(angle);
        circle_line->points.push_back(glm::vec2(960.0f + x, 540.0f + y));
    }

    // Create axes
    auto x_axis = std::make_unique<LineBody>("x_axis");
    x_axis->color = glm::vec3(0.3f, 0.3f, 0.3f);  // Gray
    x_axis->thickness = 1.0f;
    x_axis->points.push_back(glm::vec2(160.0f, 540.0f));
    x_axis->points.push_back(glm::vec2(1760.0f, 540.0f));

    auto y_axis = std::make_unique<LineBody>("y_axis");
    y_axis->color = glm::vec3(0.3f, 0.3f, 0.3f);  // Gray
    y_axis->thickness = 1.0f;
    y_axis->points.push_back(glm::vec2(960.0f, 90.0f));
    y_axis->points.push_back(glm::vec2(960.0f, 990.0f));

    // Add bodies to frame
    frame->addBody(std::move(x_axis));
    frame->addBody(std::move(y_axis));
    frame->addBody(std::move(sine_line));
    frame->addBody(std::move(circle_line));

    // Add frame to scene
    scene_->addFrame(std::move(frame));

    std::cout << "Test scene created with sine wave, circle, and axes" << std::endl;
}

void Application::shutdown() {
    if (mode_ == AppMode::GUI) {
        ImGui_ImplOpenGL3_Shutdown();
        ImGui_ImplGlfw_Shutdown();
        ImGui::DestroyContext();

        if (window_) {
            glfwDestroyWindow(window_);
        }
        glfwTerminate();
    }

    std::cout << "MathViz shutdown complete" << std::endl;
}
