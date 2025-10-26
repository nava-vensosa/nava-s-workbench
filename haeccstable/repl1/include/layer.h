#ifndef LAYER_H
#define LAYER_H

#include <string>
#include <memory>
#include <glad/glad.h>
#include "video_source.h"
#include "video_texture.h"

// Layer object for video composition
// Supports transforms, opacity, and aspect-ratio preserving scaling
class Layer {
public:
    Layer(const std::string& name);
    ~Layer();

    // Get layer name
    const std::string& getName() const { return name; }

    // Canvas size (-1 = auto-detect from parent)
    void setCanvas(int width, int height);
    int getCanvasWidth() const { return canvasWidth; }
    int getCanvasHeight() const { return canvasHeight; }
    float getAspectRatio() const { return aspectRatio; }

    // Transform operations (from README layer_syntax)
    void transform(float changeX, float changeY);      // Position offset
    void scale(float scaleW, float scaleH);            // Scale factors
    void rot(float xyDegrees, float yDegrees);         // Rotation (xy plane, y axis)
    void setOpacity(float opacityPercent);             // 0-100, default=100

    // Get transform properties
    float getPosX() const { return posX; }
    float getPosY() const { return posY; }
    float getScaleX() const { return scaleX; }
    float getScaleY() const { return scaleY; }
    float getRotXY() const { return rotXY; }
    float getRotY() const { return rotY; }
    float getOpacity() const { return opacity; }

    // Video source binding
    void setSource(std::shared_ptr<VideoSource> src);
    std::shared_ptr<VideoSource> getSource() const { return source; }

    // Texture access (lazy - creates on first access)
    std::shared_ptr<VideoTexture> getTexture();

    // Execute layer (fetch frame and update texture)
    void execute();

    // Render layer to framebuffer with transforms
    // parentW/parentH used for auto canvas detection and aspect-ratio preserving
    void render(int parentW, int parentH);

    // Get framebuffer texture ID
    GLuint getFramebufferTexture() const { return renderTexture; }

private:
    std::string name;

    // Canvas properties
    int canvasWidth;       // -1 = auto-detect
    int canvasHeight;      // -1 = auto-detect
    float aspectRatio;     // Preserve when scaling

    // Transform properties
    float posX, posY;          // Position offset (pixels)
    float scaleX, scaleY;      // Scale factors (default 1.0)
    float rotXY;               // Rotation in XY plane (degrees clockwise)
    float rotY;                // Rotation around Y axis (degrees clockwise)
    float opacity;             // 0-100 (default 100 = fully opaque)

    // Video source
    std::shared_ptr<VideoSource> source;
    std::shared_ptr<VideoTexture> texture;

    // Offscreen rendering
    GLuint framebuffer;
    GLuint renderTexture;
    GLuint depthBuffer;

    // Initialize framebuffer for offscreen rendering
    void initFramebuffer(int width, int height);

    // Clean up framebuffer
    void cleanupFramebuffer();
};

#endif // LAYER_H
