#ifndef RENDERER_H
#define RENDERER_H

#include "layout_manager.h"
#include <glad/glad.h>
#include <string>

class Renderer {
public:
    Renderer();
    ~Renderer();

    bool init();
    void clear(float r, float g, float b, float a);
    void drawRect(const Rect& rect, float r, float g, float b, float a);
    void drawBorder(const Rect& rect, float r, float g, float b, float a, int borderWidth);
    void drawText(const std::string& text, int x, int y, float r, float g, float b);
    void setViewport(int x, int y, int width, int height);

private:
    GLuint shaderProgram;
    GLuint VAO, VBO;

    bool loadShaders();
    GLuint compileShader(const char* source, GLenum shaderType);
    GLuint createShaderProgram(const char* vertexSrc, const char* fragmentSrc);
};

#endif // RENDERER_H
