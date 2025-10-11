#pragma once

#include <GL/glew.h>
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <vector>
#include <memory>

class Shader;

class Renderer {
public:
    Renderer();
    ~Renderer();

    void init(int width, int height);
    void clear(const glm::vec3& color);
    void setViewport(int x, int y, int width, int height);
    void setProjection(const glm::mat4& proj);
    void setView(const glm::mat4& view);

    // Drawing primitives
    void drawLine(const std::vector<glm::vec2>& points, const glm::vec3& color, float thickness);
    void drawCircle(const glm::vec2& center, float radius, const glm::vec3& color);

    // Getters
    glm::mat4 getProjection() const { return projection_; }
    glm::mat4 getView() const { return view_; }

private:
    void initShaders();

    int width_, height_;
    glm::mat4 projection_;
    glm::mat4 view_;

    std::unique_ptr<Shader> line_shader_;
    GLuint line_vao_;
    GLuint line_vbo_;
};
