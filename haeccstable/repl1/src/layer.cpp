#include "layer.h"
#include <iostream>
#include <cmath>

Layer::Layer(const std::string& name)
    : name(name),
      canvasWidth(-1),
      canvasHeight(-1),
      aspectRatio(16.0f / 9.0f),  // Default HD aspect ratio
      posX(0.0f),
      posY(0.0f),
      scaleX(1.0f),
      scaleY(1.0f),
      rotXY(0.0f),
      rotY(0.0f),
      opacity(100.0f),  // Default fully opaque
      source(nullptr),
      texture(nullptr),
      framebuffer(0),
      renderTexture(0),
      depthBuffer(0) {
}

Layer::~Layer() {
    cleanupFramebuffer();
}

void Layer::setCanvas(int width, int height) {
    canvasWidth = width;
    canvasHeight = height;

    if (width > 0 && height > 0) {
        aspectRatio = static_cast<float>(width) / static_cast<float>(height);

        // Initialize framebuffer with new dimensions
        if (framebuffer != 0) {
            cleanupFramebuffer();
        }
        initFramebuffer(width, height);

        std::cout << "Layer '" << name << "' canvas set to "
                  << width << "x" << height
                  << " (aspect: " << aspectRatio << ")\n";
    } else if (width == -1 && height == -1) {
        // Auto-detect mode
        std::cout << "Layer '" << name << "' canvas set to auto-detect\n";
    }
}

void Layer::transform(float changeX, float changeY) {
    posX += changeX;
    posY += changeY;
}

void Layer::scale(float scaleW, float scaleH) {
    scaleX *= scaleW;
    scaleY *= scaleH;
}

void Layer::rot(float xyDegrees, float yDegrees) {
    rotXY += xyDegrees;
    rotY += yDegrees;

    // Normalize angles to 0-360
    rotXY = fmod(rotXY, 360.0f);
    rotY = fmod(rotY, 360.0f);
}

void Layer::setOpacity(float opacityPercent) {
    // Clamp to 0-100 range
    opacity = std::max(0.0f, std::min(100.0f, opacityPercent));
}

void Layer::setSource(std::shared_ptr<VideoSource> src) {
    source = src;

    // Create texture lazily when source is set
    if (source && source->isOpen()) {
        texture = std::make_shared<VideoTexture>();
        texture->init(source->getWidth(), source->getHeight());

        // Auto-detect canvas if not set
        if (canvasWidth == -1 || canvasHeight == -1) {
            setCanvas(source->getWidth(), source->getHeight());
        }
    }
}

std::shared_ptr<VideoTexture> Layer::getTexture() {
    // Lazy texture creation
    if (!texture && source && source->isOpen()) {
        texture = std::make_shared<VideoTexture>();
        texture->init(source->getWidth(), source->getHeight());
    }
    return texture;
}

void Layer::execute() {
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

void Layer::render(int parentW, int parentH) {
    // If canvas is auto-detect, use parent dimensions
    int renderWidth = canvasWidth;
    int renderHeight = canvasHeight;

    if (canvasWidth == -1 || canvasHeight == -1) {
        renderWidth = parentW;
        renderHeight = parentH;
        aspectRatio = static_cast<float>(parentW) / static_cast<float>(parentH);
    }

    // Initialize framebuffer if needed
    if (framebuffer == 0 && renderWidth > 0 && renderHeight > 0) {
        initFramebuffer(renderWidth, renderHeight);
    }

    // TODO: Render layer content to framebuffer with transforms
    // This will be implemented when we add the compositor
    // For now, just execute to fetch latest frame
    execute();
}

void Layer::initFramebuffer(int width, int height) {
    if (width <= 0 || height <= 0) return;

    // Generate framebuffer
    glGenFramebuffers(1, &framebuffer);
    glBindFramebuffer(GL_FRAMEBUFFER, framebuffer);

    // Create render texture
    glGenTextures(1, &renderTexture);
    glBindTexture(GL_TEXTURE_2D, renderTexture);
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, nullptr);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);

    // Attach texture to framebuffer
    glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, renderTexture, 0);

    // Create depth buffer
    glGenRenderbuffers(1, &depthBuffer);
    glBindRenderbuffer(GL_RENDERBUFFER, depthBuffer);
    glRenderbufferStorage(GL_RENDERBUFFER, GL_DEPTH24_STENCIL8, width, height);
    glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_STENCIL_ATTACHMENT, GL_RENDERBUFFER, depthBuffer);

    // Check framebuffer completeness
    if (glCheckFramebufferStatus(GL_FRAMEBUFFER) != GL_FRAMEBUFFER_COMPLETE) {
        std::cerr << "ERROR: Framebuffer not complete for layer '" << name << "'\n";
    }

    // Unbind
    glBindFramebuffer(GL_FRAMEBUFFER, 0);
    glBindTexture(GL_TEXTURE_2D, 0);
    glBindRenderbuffer(GL_RENDERBUFFER, 0);

    std::cout << "Initialized framebuffer for layer '" << name
              << "' (" << width << "x" << height << ")\n";
}

void Layer::cleanupFramebuffer() {
    if (framebuffer != 0) {
        glDeleteFramebuffers(1, &framebuffer);
        framebuffer = 0;
    }
    if (renderTexture != 0) {
        glDeleteTextures(1, &renderTexture);
        renderTexture = 0;
    }
    if (depthBuffer != 0) {
        glDeleteRenderbuffers(1, &depthBuffer);
        depthBuffer = 0;
    }
}
