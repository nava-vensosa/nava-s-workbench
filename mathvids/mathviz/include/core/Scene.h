#pragma once

#include <vector>
#include <memory>
#include <string>
#include <unordered_map>
#include <glm/glm.hpp>

// Forward declarations
class Frame;
class Renderer;

enum class ResolutionMode {
    DESKTOP_1080P,
    MOBILE_VERTICAL
};

class Scene {
public:
    Scene();
    ~Scene();

    void addFrame(std::unique_ptr<Frame> frame);
    Frame* getFrame(const std::string& name);

    void update(float dt);
    void render(Renderer& renderer);
    void clear();

    // Scene properties
    ResolutionMode resolution_mode;
    int fps;
    glm::vec3 background_color;
    std::string output_path;

    // Resolution info
    glm::ivec2 getResolution() const;
    glm::vec2 getOrigin() const;

private:
    std::vector<std::unique_ptr<Frame>> frames_;
    std::unordered_map<std::string, Frame*> frame_map_;
};
