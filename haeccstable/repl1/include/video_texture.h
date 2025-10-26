#ifndef VIDEO_TEXTURE_H
#define VIDEO_TEXTURE_H

#include <glad/glad.h>
#include <memory>
#include "video_source.h"

// OpenGL constants missing from minimal GLAD loader
// These are standard OpenGL constants with stable values
#ifndef GL_RGB
#define GL_RGB 0x1907
#endif
#ifndef GL_RGB8
#define GL_RGB8 0x8051
#endif
#ifndef GL_PIXEL_UNPACK_BUFFER
#define GL_PIXEL_UNPACK_BUFFER 0x88EC
#endif
#ifndef GL_STREAM_DRAW
#define GL_STREAM_DRAW 0x88E0
#endif
#ifndef GL_WRITE_ONLY
#define GL_WRITE_ONLY 0x88B9
#endif

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
