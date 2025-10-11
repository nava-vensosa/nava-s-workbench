#include "core/Frame.h"
#include "core/Body.h"
#include "renderer/Renderer.h"

Frame::Frame(const std::string& name)
    : name(name)
    , position(0.0f, 0.0f)
    , size(1600.0f, 900.0f)
    , border_thickness(0.0f)
    , border_color(1.0f, 1.0f, 1.0f)
    , background_color(0.0f, 0.0f, 0.0f)
    , alpha(1.0f)
{}

Frame::~Frame() {}

void Frame::addBody(std::unique_ptr<Body> body) {
    body_map_[body->name] = body.get();
    bodies_.push_back(std::move(body));
}

Body* Frame::getBody(const std::string& name) {
    auto it = body_map_.find(name);
    if (it != body_map_.end()) {
        return it->second;
    }
    return nullptr;
}

void Frame::update(float dt) {
    for (auto& body : bodies_) {
        body->update(dt);
    }
}

void Frame::render(Renderer& renderer) {
    // TODO: Render frame border and background
    // For now, just render bodies
    for (auto& body : bodies_) {
        body->render(renderer);
    }
}

glm::mat4 Frame::getTransform() const {
    glm::mat4 transform(1.0f);
    transform = glm::translate(transform, glm::vec3(position, 0.0f));
    return transform;
}
