#ifndef VIDEO_TEXTURE_H
#define VIDEO_TEXTURE_H

#include <glad/glad.h>
#include <memory>
#include "video_source.h"

// Efficient GPU texture manager for video frames
// Uses PBO (Pixel Buffer Objects) for async uploads
class VideoTexture {
public:
    VideoTexture();
    ~VideoTexture();

    // Initialize texture with dimensions
    bool init(int width, int height);

    // Upload video frame to GPU (lazy - only if frame changed)
    // Uses PBO for async transfer
    void update(std::shared_ptr<VideoFrame> frame);

    // Get OpenGL texture ID
    GLuint getTextureID() const { return textureID; }

    // Get dimensions
    int getWidth() const { return width; }
    int getHeight() const { return height; }

    // Check if texture is ready
    bool isReady() const { return textureID != 0; }

private:
    GLuint textureID;      // OpenGL texture object
    GLuint pboID;          // Pixel Buffer Object for async upload
    int width;
    int height;
    bool usePBO;           // Whether PBO is supported

    // Track last uploaded frame
    double lastFrameTimestamp;
};

#endif // VIDEO_TEXTURE_H
