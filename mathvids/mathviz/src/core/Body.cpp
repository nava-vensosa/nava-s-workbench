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

void TextBody::update(float dt) {
    // TODO: Animation updates
}

void TextBody::render(Renderer& renderer) {
    if (!content.empty()) {
        renderer.drawText(content, position, color, font_size);
    }
}
