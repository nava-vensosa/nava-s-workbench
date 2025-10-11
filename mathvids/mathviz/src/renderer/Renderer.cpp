#include "renderer/Renderer.h"
#include "renderer/Shader.h"

#include <GL/glew.h>
#include <glm/gtc/type_ptr.hpp>
#include <cmath>

Renderer::Renderer()
    : width_(0)
    , height_(0)
    , projection_(1.0f)
    , view_(1.0f)
    , line_vao_(0)
    , line_vbo_(0)
{}

Renderer::~Renderer() {
    if (line_vao_) {
        glDeleteVertexArrays(1, &line_vao_);
    }
    if (line_vbo_) {
        glDeleteBuffers(1, &line_vbo_);
    }
}

void Renderer::init(int width, int height) {
    width_ = width;
    height_ = height;

    // Setup orthographic projection
    projection_ = glm::ortho(0.0f, (float)width, 0.0f, (float)height, -1.0f, 1.0f);

    initShaders();

    // Create VAO and VBO for line rendering
    glGenVertexArrays(1, &line_vao_);
    glGenBuffers(1, &line_vbo_);
}

void Renderer::initShaders() {
    // Simple line shader
    const char* vertex_source = R"(
        #version 410 core
        layout(location = 0) in vec2 position;

        uniform mat4 projection;
        uniform mat4 view;

        void main() {
            gl_Position = projection * view * vec4(position, 0.0, 1.0);
        }
    )";

    const char* fragment_source = R"(
        #version 410 core
        out vec4 frag_color;

        uniform vec3 color;

        void main() {
            frag_color = vec4(color, 1.0);
        }
    )";

    line_shader_ = std::make_unique<Shader>();
    line_shader_->loadFromSource(vertex_source, fragment_source);
}

void Renderer::clear(const glm::vec3& color) {
    glClearColor(color.r, color.g, color.b, 1.0f);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
}

void Renderer::setViewport(int x, int y, int width, int height) {
    glViewport(x, y, width, height);
}

void Renderer::setProjection(const glm::mat4& proj) {
    projection_ = proj;
}

void Renderer::setView(const glm::mat4& view) {
    view_ = view;
}

void Renderer::drawLine(const std::vector<glm::vec2>& points, const glm::vec3& color, float thickness) {
    if (points.size() < 2) return;

    line_shader_->use();
    line_shader_->setUniform("projection", projection_);
    line_shader_->setUniform("view", view_);
    line_shader_->setUniform("color", color);

    glBindVertexArray(line_vao_);
    glBindBuffer(GL_ARRAY_BUFFER, line_vbo_);
    glBufferData(GL_ARRAY_BUFFER, points.size() * sizeof(glm::vec2), points.data(), GL_DYNAMIC_DRAW);

    glEnableVertexAttribArray(0);
    glVertexAttribPointer(0, 2, GL_FLOAT, GL_FALSE, sizeof(glm::vec2), (void*)0);

    glLineWidth(thickness);
    glDrawArrays(GL_LINE_STRIP, 0, points.size());

    glBindVertexArray(0);
}

void Renderer::drawCircle(const glm::vec2& center, float radius, const glm::vec3& color) {
    std::vector<glm::vec2> points;
    const int segments = 64;

    for (int i = 0; i <= segments; ++i) {
        float angle = (i / (float)segments) * 2.0f * M_PI;
        points.push_back(center + glm::vec2(cos(angle), sin(angle)) * radius);
    }

    drawLine(points, color, 2.0f);
}
