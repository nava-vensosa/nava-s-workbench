#include "output_variable.h"
#include <algorithm>
#include <iostream>

OutputVariable::OutputVariable(const std::string& name, const std::string& target)
    : name(name),
      target(target),
      outputFramebuffer(0),
      outputTexture(0),
      outputDepthBuffer(0),
      outputWidth(0),
      outputHeight(0) {
}

OutputVariable::~OutputVariable() {
    cleanupOutputFramebuffer();
}

void OutputVariable::project(std::shared_ptr<Layer> layer, int zIndex) {
    if (!layer) {
        std::cerr << "ERROR: Cannot project null layer to " << name << "\n";
        return;
    }

    // Check if layer already exists in stack
    for (auto& entry : layerStack) {
        if (entry.layer == layer) {
            // Update z-index
            entry.zIndex = zIndex;
            sortLayerStack();
            std::cout << "Updated layer '" << layer->getName() << "' z-index to "
                      << zIndex << " on " << name << "\n";
            return;
        }
    }

    // Add new layer to stack
    LayerStackEntry entry;
    entry.layer = layer;
    entry.zIndex = zIndex;
    layerStack.push_back(entry);
    sortLayerStack();

    std::cout << "Projected layer '" << layer->getName() << "' onto " << name
              << " at z-index " << zIndex << "\n";
}

void OutputVariable::removeLayer(std::shared_ptr<Layer> layer) {
    auto it = std::remove_if(layerStack.begin(), layerStack.end(),
        [&layer](const LayerStackEntry& entry) {
            return entry.layer == layer;
        });

    if (it != layerStack.end()) {
        std::cout << "Removed layer '" << layer->getName() << "' from " << name << "\n";
        layerStack.erase(it, layerStack.end());
    }
}

void OutputVariable::clearLayers() {
    layerStack.clear();
    std::cout << "Cleared all layers from " << name << "\n";
}

void OutputVariable::sortLayerStack() {
    // Sort by z-index: higher z-index first (back-to-front rendering)
    std::sort(layerStack.begin(), layerStack.end());
}

void OutputVariable::executeLayers() {
    // Execute all layers (fetch frames and update textures)
    for (auto& entry : layerStack) {
        if (entry.layer) {
            entry.layer->execute();
        }
    }
}

void OutputVariable::composite(int parentW, int parentH) {
    // Initialize or resize output framebuffer if needed
    if (outputFramebuffer == 0 || outputWidth != parentW || outputHeight != parentH) {
        if (outputFramebuffer != 0) {
            cleanupOutputFramebuffer();
        }
        initOutputFramebuffer(parentW, parentH);
    }

    // Execute all layers first (fetch latest frames)
    executeLayers();

    // Bind output framebuffer
    glBindFramebuffer(GL_FRAMEBUFFER, outputFramebuffer);
    glViewport(0, 0, outputWidth, outputHeight);

    // Clear to transparent black
    glClearColor(0.0f, 0.0f, 0.0f, 0.0f);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    // Enable alpha blending
    glEnable(GL_BLEND);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

    // Render layers back-to-front (already sorted)
    for (auto& entry : layerStack) {
        if (!entry.layer) continue;

        // Render layer with transforms
        entry.layer->render(outputWidth, outputHeight);

        // TODO: Composite layer onto output framebuffer
        // This will be implemented when we add texture rendering to Renderer
        // For now, we just execute the layer to fetch frames

        // Get layer's output texture
        GLuint layerTexture = entry.layer->getTexture() ? entry.layer->getTexture()->getTextureID() : 0;

        if (layerTexture != 0) {
            // TODO: Render layerTexture to output framebuffer with transforms
            // Apply position: entry.layer->getPosX(), entry.layer->getPosY()
            // Apply scale: entry.layer->getScaleX(), entry.layer->getScaleY()
            // Apply rotation: entry.layer->getRotXY(), entry.layer->getRotY()
            // Apply opacity: entry.layer->getOpacity() / 100.0f (convert to 0-1)
        }
    }

    glDisable(GL_BLEND);

    // Unbind framebuffer
    glBindFramebuffer(GL_FRAMEBUFFER, 0);
}

void OutputVariable::initOutputFramebuffer(int width, int height) {
    if (width <= 0 || height <= 0) {
        std::cerr << "ERROR: Invalid output dimensions " << width << "x" << height << "\n";
        return;
    }

    outputWidth = width;
    outputHeight = height;

    // Generate framebuffer
    glGenFramebuffers(1, &outputFramebuffer);
    glBindFramebuffer(GL_FRAMEBUFFER, outputFramebuffer);

    // Create output texture
    glGenTextures(1, &outputTexture);
    glBindTexture(GL_TEXTURE_2D, outputTexture);
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, nullptr);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);

    // Attach texture to framebuffer
    glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, outputTexture, 0);

    // Create depth buffer
    glGenRenderbuffers(1, &outputDepthBuffer);
    glBindRenderbuffer(GL_RENDERBUFFER, outputDepthBuffer);
    glRenderbufferStorage(GL_RENDERBUFFER, GL_DEPTH24_STENCIL8, width, height);
    glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_STENCIL_ATTACHMENT, GL_RENDERBUFFER, outputDepthBuffer);

    // Check framebuffer completeness
    if (glCheckFramebufferStatus(GL_FRAMEBUFFER) != GL_FRAMEBUFFER_COMPLETE) {
        std::cerr << "ERROR: Output framebuffer not complete for " << name << "\n";
    }

    // Unbind
    glBindFramebuffer(GL_FRAMEBUFFER, 0);
    glBindTexture(GL_TEXTURE_2D, 0);
    glBindRenderbuffer(GL_RENDERBUFFER, 0);

    std::cout << "Initialized output framebuffer for " << name
              << " (" << width << "x" << height << ")\n";
}

void OutputVariable::cleanupOutputFramebuffer() {
    if (outputFramebuffer != 0) {
        glDeleteFramebuffers(1, &outputFramebuffer);
        outputFramebuffer = 0;
    }
    if (outputTexture != 0) {
        glDeleteTextures(1, &outputTexture);
        outputTexture = 0;
    }
    if (outputDepthBuffer != 0) {
        glDeleteRenderbuffers(1, &outputDepthBuffer);
        outputDepthBuffer = 0;
    }
}
