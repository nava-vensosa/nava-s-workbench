#include "video_variable.h"
#include <iostream>

VideoVariable::VideoVariable(const std::string& name, VideoVarType type)
    : name(name), type(type), source(nullptr), texture(nullptr), target("") {
}

void VideoVariable::setSource(std::shared_ptr<VideoSource> src) {
    source = src;

    // Create texture lazily when source is set
    if (source && source->isOpen()) {
        texture = std::make_shared<VideoTexture>();
        texture->init(source->getWidth(), source->getHeight());
    }
}

void VideoVariable::setTarget(const std::string& targetName) {
    target = targetName;
}

std::shared_ptr<VideoTexture> VideoVariable::getTexture() {
    // Lazy texture creation
    if (!texture && source && source->isOpen()) {
        texture = std::make_shared<VideoTexture>();
        texture->init(source->getWidth(), source->getHeight());
    }
    return texture;
}

void VideoVariable::execute() {
    // Lazy execution: fetch frame and update texture
    if (!source || !source->isOpen()) return;

    auto frameOpt = source->getFrame();
    if (frameOpt.has_value()) {
        auto frame = frameOpt.value();
        if (!texture) {
            texture = std::make_shared<VideoTexture>();
            texture->init(frame->width, frame->height);
        }
        texture->update(frame);
    }
}
