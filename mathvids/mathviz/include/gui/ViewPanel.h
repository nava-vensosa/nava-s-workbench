#pragma once

#include <GL/glew.h>
#include <glm/glm.hpp>

// Forward declarations
class Scene;
class Renderer;

class ViewPanel {
public:
    ViewPanel(const glm::ivec4& viewport, Scene* scene);
    ~ViewPanel();

    void update(float dt);
    void render(Renderer& renderer);
    void handleInput(int key, int action, int mods);

    void setViewport(const glm::ivec4& viewport);
    void setFocused(bool focused) { is_focused_ = focused; }

private:
    void initFramebuffer();

    Scene* scene_;
    glm::ivec4 viewport_;  // x, y, width, height
    GLuint framebuffer_;
    GLuint texture_;
    GLuint renderbuffer_;
    bool is_playing_;
    bool is_focused_;
};
