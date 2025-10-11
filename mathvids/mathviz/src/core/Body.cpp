#include "core/Body.h"
#include "renderer/Renderer.h"

void LineBody::update(float dt) {
    // TODO: Animation updates
}

void LineBody::render(Renderer& renderer) {
    if (points.size() >= 2) {
        renderer.drawLine(points, color, thickness);
    }
}
