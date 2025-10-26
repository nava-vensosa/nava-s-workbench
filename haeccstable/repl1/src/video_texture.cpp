#include "video_texture.h"
#include <iostream>

VideoTexture::VideoTexture()
    : textureID(0), pboID(0), width(0), height(0),
      usePBO(false), lastFrameTimestamp(-1.0) {  // Disable PBO - GLAD loader too minimal
}

VideoTexture::~VideoTexture() {
    if (textureID) {
        glDeleteTextures(1, &textureID);
    }
    if (pboID) {
        glDeleteBuffers(1, &pboID);
    }
}

bool VideoTexture::init(int w, int h) {
    width = w;
    height = h;

    // Create OpenGL texture
    glGenTextures(1, &textureID);
    glBindTexture(GL_TEXTURE_2D, textureID);

    // Set texture parameters
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);

    // Allocate texture storage (GL_RGB8 is the modern sized internal format)
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB8, width, height, 0,
                 GL_RGB, GL_UNSIGNED_BYTE, nullptr);

    // Create PBO for async uploads (if supported)
    if (usePBO) {
        glGenBuffers(1, &pboID);
        glBindBuffer(GL_PIXEL_UNPACK_BUFFER, pboID);
        glBufferData(GL_PIXEL_UNPACK_BUFFER, width * height * 3,
                     nullptr, GL_STREAM_DRAW);
        glBindBuffer(GL_PIXEL_UNPACK_BUFFER, 0);
    }

    glBindTexture(GL_TEXTURE_2D, 0);

    std::cout << "VideoTexture initialized: " << width << "x" << height
              << (usePBO ? " (with PBO)" : "") << std::endl;

    return true;
}

void VideoTexture::update(std::shared_ptr<VideoFrame> frame) {
    if (!frame || !textureID) return;

    // Lazy update: skip if same frame
    if (frame->timestamp == lastFrameTimestamp) {
        return;
    }

    glBindTexture(GL_TEXTURE_2D, textureID);

    // Direct upload (synchronous) - using glTexImage2D since glTexSubImage2D not in minimal GLAD
    // This re-uploads the entire texture, which is less efficient but works
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB8, frame->width, frame->height, 0,
                 GL_RGB, GL_UNSIGNED_BYTE, frame->data.get());

    glBindTexture(GL_TEXTURE_2D, 0);

    lastFrameTimestamp = frame->timestamp;
}
