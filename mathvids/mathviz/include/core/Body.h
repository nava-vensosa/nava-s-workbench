#pragma once

#include <string>
#include <memory>
#include <vector>
#include <glm/glm.hpp>

// Forward declarations
class Renderer;

class Body {
public:
    Body(const std::string& name) : name(name) {}
    virtual ~Body() = default;

    virtual void update(float dt) = 0;
    virtual void render(Renderer& renderer) = 0;

    // Common properties
    std::string name;
    glm::vec2 position;  // Relative to parent frame
    glm::vec3 color;
    float alpha;
    float glow_intensity;
    glm::vec3 glow_color;
};

// Simple line body for testing
class LineBody : public Body {
public:
    LineBody(const std::string& name) : Body(name) {}

    void update(float dt) override;
    void render(Renderer& renderer) override;

    // Line properties
    std::vector<glm::vec2> points;
    float thickness;
};
