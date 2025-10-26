#ifndef DISPLAY_BUFFER_H
#define DISPLAY_BUFFER_H

#include <glad/glad.h>

// Framebuffer for video displays
class DisplayBuffer {
public:
    DisplayBuffer(int width, int height);
    ~DisplayBuffer();

    bool init();
    void bind();
    void unbind();
    void clear(float r, float g, float b, float a);
    GLuint getTexture() const { return texture; }

private:
    int width;
    int height;
    GLuint framebuffer;
    GLuint texture;
    GLuint renderbuffer;
};

#endif // DISPLAY_BUFFER_H
