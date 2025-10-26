#ifndef OUTPUT_VARIABLE_H
#define OUTPUT_VARIABLE_H

#include <string>
#include <vector>
#include <memory>
#include <glad/glad.h>
#include "layer.h"

// Layer stack entry for compositing
struct LayerStackEntry {
    std::shared_ptr<Layer> layer;
    int zIndex;  // 0 = top of stack, higher = further back

    // For sorting: lower zIndex should render last (on top)
    bool operator<(const LayerStackEntry& other) const {
        return zIndex > other.zIndex;  // Reverse sort for back-to-front
    }
};

// Output variable for displaying composited layers
class OutputVariable {
public:
    OutputVariable(const std::string& name, const std::string& target);
    ~OutputVariable();

    // Get variable name
    const std::string& getName() const { return name; }

    // Get target (e.g., "monitor1", "monitor2")
    const std::string& getTarget() const { return target; }

    // Project a layer onto this output at given z-index
    // zIndex: 0 = top of stack, 1 = one layer behind, etc.
    void project(std::shared_ptr<Layer> layer, int zIndex);

    // Remove a layer from the stack
    void removeLayer(std::shared_ptr<Layer> layer);

    // Clear all layers
    void clearLayers();

    // Get layer stack (sorted by z-index for rendering)
    const std::vector<LayerStackEntry>& getLayerStack() const { return layerStack; }

    // Execute all layers in the stack (fetch frames, update textures)
    void executeLayers();

    // Composite all layers and render to output texture
    // parentW/parentH: dimensions of the output display
    void composite(int parentW, int parentH);

    // Get composited output texture
    GLuint getOutputTexture() const { return outputTexture; }

    // Get output dimensions
    int getOutputWidth() const { return outputWidth; }
    int getOutputHeight() const { return outputHeight; }

private:
    std::string name;
    std::string target;  // Display target (monitor1, monitor2, etc.)

    std::vector<LayerStackEntry> layerStack;  // Layers with z-indices

    // Compositor output
    GLuint outputFramebuffer;
    GLuint outputTexture;
    GLuint outputDepthBuffer;
    int outputWidth;
    int outputHeight;

    // Initialize output framebuffer
    void initOutputFramebuffer(int width, int height);

    // Cleanup output framebuffer
    void cleanupOutputFramebuffer();

    // Sort layer stack by z-index (back-to-front)
    void sortLayerStack();
};

#endif // OUTPUT_VARIABLE_H
