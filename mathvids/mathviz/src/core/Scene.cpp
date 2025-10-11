#include "core/Scene.h"
#include "core/Frame.h"
#include "renderer/Renderer.h"

Scene::Scene()
    : resolution_mode(ResolutionMode::DESKTOP_1080P)
    , fps(30)
    , background_color(0.1f, 0.1f, 0.1f)
    , output_path("")
{}

Scene::~Scene() {}

void Scene::addFrame(std::unique_ptr<Frame> frame) {
    frame_map_[frame->name] = frame.get();
    frames_.push_back(std::move(frame));
}

Frame* Scene::getFrame(const std::string& name) {
    auto it = frame_map_.find(name);
    if (it != frame_map_.end()) {
        return it->second;
    }
    return nullptr;
}

void Scene::update(float dt) {
    for (auto& frame : frames_) {
        frame->update(dt);
    }
}

void Scene::render(Renderer& renderer) {
    renderer.clear(background_color);

    for (auto& frame : frames_) {
        frame->render(renderer);
    }
}

void Scene::clear() {
    frames_.clear();
    frame_map_.clear();
}

glm::ivec2 Scene::getResolution() const {
    switch (resolution_mode) {
        case ResolutionMode::DESKTOP_1080P:
            return glm::ivec2(1920, 1080);
        case ResolutionMode::MOBILE_VERTICAL:
            return glm::ivec2(1080, 1920);
        default:
            return glm::ivec2(1920, 1080);
    }
}

glm::vec2 Scene::getOrigin() const {
    glm::ivec2 res = getResolution();
    return glm::vec2(res.x / 2.0f, res.y / 2.0f);
}
