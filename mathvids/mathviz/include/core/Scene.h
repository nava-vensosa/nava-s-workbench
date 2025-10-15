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
    DESKTOP_1080P,        // 1920x1080 (16:9)
    MOBILE_VERTICAL,      // 1080x1920 (9:16)
    POSTER_2_3,           // 1200x1800 (2:3 portrait)
    POSTER_2_3_PRINT,     // 2400x3600 (2:3 high-res)
    SQUARE_1080,          // 1080x1080 (1:1)
    SQUARE_2000,          // 2000x2000 (1:1 high-res)
    CUSTOM                // User-specified dimensions
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

    // Custom resolution (used when resolution_mode == CUSTOM)
    int custom_width;
    int custom_height;

    // Resolution info
    glm::ivec2 getResolution() const;
    glm::vec2 getOrigin() const;
    void setCustomResolution(int width, int height);

    // Allow parser access to frames
    friend class CommandParser;

private:
    std::vector<std::unique_ptr<Frame>> frames_;
    std::unordered_map<std::string, Frame*> frame_map_;
};
