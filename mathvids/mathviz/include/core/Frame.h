#pragma once

#include <vector>
#include <memory>
#include <string>
#include <unordered_map>
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>

// Forward declarations
class Body;
class Renderer;

class Frame {
public:
    Frame(const std::string& name);
    ~Frame();

    void addBody(std::unique_ptr<Body> body);
    Body* getBody(const std::string& name);

    void update(float dt);
    void render(Renderer& renderer);

    // Frame properties
    std::string name;
    glm::vec2 position;  // Relative to scene origin
    glm::vec2 size;
    float border_thickness;
    glm::vec3 border_color;
    glm::vec3 background_color;
    float alpha;

    // Transform
    glm::mat4 getTransform() const;

private:
    std::vector<std::unique_ptr<Body>> bodies_;
    std::unordered_map<std::string, Body*> body_map_;
};
