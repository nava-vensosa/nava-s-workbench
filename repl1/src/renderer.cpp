#include "renderer.h"
#include <iostream>
#include <vector>

// Simple vertex shader
const char* vertexShaderSource = R"(
#version 330 core
layout (location = 0) in vec2 aPos;

uniform mat4 uProjection;

void main() {
    gl_Position = uProjection * vec4(aPos, 0.0, 1.0);
}
)";

// Simple fragment shader
const char* fragmentShaderSource = R"(
#version 330 core
out vec4 FragColor;

uniform vec4 uColor;

void main() {
    FragColor = uColor;
}
)";

Renderer::Renderer() : shaderProgram(0), VAO(0), VBO(0) {
}

Renderer::~Renderer() {
    if (VAO) glDeleteVertexArrays(1, &VAO);
    if (VBO) glDeleteBuffers(1, &VBO);
    if (shaderProgram) glDeleteProgram(shaderProgram);
}

bool Renderer::init() {
    // Create shader program
    shaderProgram = createShaderProgram(vertexShaderSource, fragmentShaderSource);
    if (shaderProgram == 0) {
        return false;
    }

    // Create VAO and VBO
    glGenVertexArrays(1, &VAO);
    glGenBuffers(1, &VBO);

    glBindVertexArray(VAO);
    glBindBuffer(GL_ARRAY_BUFFER, VBO);

    // Position attribute
    glVertexAttribPointer(0, 2, GL_FLOAT, GL_FALSE, 2 * sizeof(float), (void*)0);
    glEnableVertexAttribArray(0);

    glBindBuffer(GL_ARRAY_BUFFER, 0);
    glBindVertexArray(0);

    // Enable blending for transparency
    glEnable(GL_BLEND);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

    return true;
}

void Renderer::clear(float r, float g, float b, float a) {
    glClearColor(r, g, b, a);
    glClear(GL_COLOR_BUFFER_BIT);
}

void Renderer::drawRect(const Rect& rect, float r, float g, float b, float a) {
    // Get current viewport
    GLint viewport[4];
    glGetIntegerv(GL_VIEWPORT, viewport);
    int viewportWidth = viewport[2];
    int viewportHeight = viewport[3];

    // Convert screen coordinates to normalized device coordinates
    float x1 = (rect.x * 2.0f / viewportWidth) - 1.0f;
    float y1 = (rect.y * 2.0f / viewportHeight) - 1.0f;
    float x2 = ((rect.x + rect.width) * 2.0f / viewportWidth) - 1.0f;
    float y2 = ((rect.y + rect.height) * 2.0f / viewportHeight) - 1.0f;

    float vertices[] = {
        x1, y1,  // bottom-left
        x2, y1,  // bottom-right
        x2, y2,  // top-right
        x1, y1,  // bottom-left
        x2, y2,  // top-right
        x1, y2   // top-left
    };

    glUseProgram(shaderProgram);
    glBindVertexArray(VAO);

    // Set color uniform
    GLint colorLoc = glGetUniformLocation(shaderProgram, "uColor");
    glUniform4f(colorLoc, r, g, b, a);

    // Set projection to identity (we're using NDC)
    GLint projLoc = glGetUniformLocation(shaderProgram, "uProjection");
    float identity[16] = {
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    };
    glUniformMatrix4fv(projLoc, 1, GL_FALSE, identity);

    // Upload vertices
    glBindBuffer(GL_ARRAY_BUFFER, VBO);
    glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_DYNAMIC_DRAW);

    // Draw
    glDrawArrays(GL_TRIANGLES, 0, 6);

    glBindVertexArray(0);
    glUseProgram(0);
}

void Renderer::drawBorder(const Rect& rect, float r, float g, float b, float a, int borderWidth) {
    // Top border
    drawRect({rect.x, rect.y + rect.height - borderWidth, rect.width, borderWidth}, r, g, b, a);
    // Bottom border
    drawRect({rect.x, rect.y, rect.width, borderWidth}, r, g, b, a);
    // Left border
    drawRect({rect.x, rect.y, borderWidth, rect.height}, r, g, b, a);
    // Right border
    drawRect({rect.x + rect.width - borderWidth, rect.y, borderWidth, rect.height}, r, g, b, a);
}

// Simple bitmap font - 5x7 pixels per character
// Returns true if pixel should be drawn for given character at position (px, py)
static bool getPixel(char c, int px, int py) {
    // Very simple font for essential characters
    // Each character is 5 pixels wide, 7 pixels tall
    if (px < 0 || px >= 5 || py < 0 || py >= 7) return false;

    // Keep case as-is (we have separate lowercase letters)

    // Define character bitmaps (row by row, top to bottom)
    static const uint32_t font[][7] = {
        // '0' - index 0
        {0b01110, 0b10001, 0b10011, 0b10101, 0b11001, 0b10001, 0b01110},
        // '1' - index 1
        {0b00100, 0b01100, 0b00100, 0b00100, 0b00100, 0b00100, 0b01110},
        // '2' - index 2
        {0b01110, 0b10001, 0b00001, 0b00010, 0b00100, 0b01000, 0b11111},
        // '3' - index 3
        {0b11111, 0b00010, 0b00100, 0b00010, 0b00001, 0b10001, 0b01110},
        // '4' - index 4
        {0b00010, 0b00110, 0b01010, 0b10010, 0b11111, 0b00010, 0b00010},
        // '5' - index 5
        {0b11111, 0b10000, 0b11110, 0b00001, 0b00001, 0b10001, 0b01110},
        // '6' - index 6
        {0b00110, 0b01000, 0b10000, 0b11110, 0b10001, 0b10001, 0b01110},
        // '7' - index 7
        {0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b01000, 0b01000},
        // '8' - index 8
        {0b01110, 0b10001, 0b10001, 0b01110, 0b10001, 0b10001, 0b01110},
        // '9' - index 9
        {0b01110, 0b10001, 0b10001, 0b01111, 0b00001, 0b00010, 0b01100},
        // 'A' - index 10
        {0b01110, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001},
        // 'B' - index 11
        {0b11110, 0b10001, 0b10001, 0b11110, 0b10001, 0b10001, 0b11110},
        // 'C' - index 12
        {0b01110, 0b10001, 0b10000, 0b10000, 0b10000, 0b10001, 0b01110},
        // 'D' - index 13
        {0b11110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b11110},
        // 'E' - index 14
        {0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b11111},
        // 'F' - index 15
        {0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b10000},
        // 'G' - index 16
        {0b01110, 0b10001, 0b10000, 0b10111, 0b10001, 0b10001, 0b01111},
        // 'H' - index 17
        {0b10001, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001},
        // 'I' - index 18
        {0b01110, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b01110},
        // 'J' - index 19
        {0b00111, 0b00010, 0b00010, 0b00010, 0b00010, 0b10010, 0b01100},
        // 'K' - index 20
        {0b10001, 0b10010, 0b10100, 0b11000, 0b10100, 0b10010, 0b10001},
        // 'L' - index 21
        {0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b11111},
        // 'M' - index 22
        {0b10001, 0b11011, 0b10101, 0b10101, 0b10001, 0b10001, 0b10001},
        // 'N' - index 23
        {0b10001, 0b10001, 0b11001, 0b10101, 0b10011, 0b10001, 0b10001},
        // 'O' - index 24
        {0b01110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110},
        // 'P' - index 25
        {0b11110, 0b10001, 0b10001, 0b11110, 0b10000, 0b10000, 0b10000},
        // 'Q' - index 26
        {0b01110, 0b10001, 0b10001, 0b10001, 0b10101, 0b10010, 0b01101},
        // 'R' - index 27
        {0b11110, 0b10001, 0b10001, 0b11110, 0b10100, 0b10010, 0b10001},
        // 'S' - index 28
        {0b01111, 0b10000, 0b10000, 0b01110, 0b00001, 0b00001, 0b11110},
        // 'T' - index 29
        {0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100},
        // 'U' - index 30
        {0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110},
        // 'V' - index 31
        {0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01010, 0b00100},
        // 'W' - index 32
        {0b10001, 0b10001, 0b10001, 0b10101, 0b10101, 0b11011, 0b10001},
        // 'X' - index 33
        {0b10001, 0b10001, 0b01010, 0b00100, 0b01010, 0b10001, 0b10001},
        // 'Y' - index 34
        {0b10001, 0b10001, 0b10001, 0b01010, 0b00100, 0b00100, 0b00100},
        // 'Z' - index 35
        {0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b10000, 0b11111},
        // '.' - index 36
        {0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00100},
        // ' ' - index 37 (space)
        {0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000},
        // 'a' - index 38
        {0b00000, 0b00000, 0b01110, 0b00001, 0b01111, 0b10001, 0b01111},
        // 'b' - index 39
        {0b10000, 0b10000, 0b11110, 0b10001, 0b10001, 0b10001, 0b11110},
        // 'c' - index 40
        {0b00000, 0b00000, 0b01110, 0b10000, 0b10000, 0b10001, 0b01110},
        // 'd' - index 41
        {0b00001, 0b00001, 0b01111, 0b10001, 0b10001, 0b10001, 0b01111},
        // 'e' - index 42
        {0b00000, 0b00000, 0b01110, 0b10001, 0b11111, 0b10000, 0b01110},
        // 'f' - index 43
        {0b00110, 0b01001, 0b01000, 0b11110, 0b01000, 0b01000, 0b01000},
        // 'g' - index 44
        {0b00000, 0b00000, 0b01111, 0b10001, 0b01111, 0b00001, 0b01110},
        // 'h' - index 45
        {0b10000, 0b10000, 0b11110, 0b10001, 0b10001, 0b10001, 0b10001},
        // 'i' - index 46
        {0b00100, 0b00000, 0b01100, 0b00100, 0b00100, 0b00100, 0b01110},
        // 'j' - index 47
        {0b00010, 0b00000, 0b00110, 0b00010, 0b00010, 0b10010, 0b01100},
        // 'k' - index 48
        {0b10000, 0b10000, 0b10010, 0b10100, 0b11000, 0b10100, 0b10010},
        // 'l' - index 49
        {0b01100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b01110},
        // 'm' - index 50
        {0b00000, 0b00000, 0b11010, 0b10101, 0b10101, 0b10101, 0b10001},
        // 'n' - index 51
        {0b00000, 0b00000, 0b11110, 0b10001, 0b10001, 0b10001, 0b10001},
        // 'o' - index 52
        {0b00000, 0b00000, 0b01110, 0b10001, 0b10001, 0b10001, 0b01110},
        // 'p' - index 53
        {0b00000, 0b00000, 0b11110, 0b10001, 0b11110, 0b10000, 0b10000},
        // 'q' - index 54
        {0b00000, 0b00000, 0b01111, 0b10001, 0b01111, 0b00001, 0b00001},
        // 'r' - index 55
        {0b00000, 0b00000, 0b10110, 0b11001, 0b10000, 0b10000, 0b10000},
        // 's' - index 56
        {0b00000, 0b00000, 0b01111, 0b10000, 0b01110, 0b00001, 0b11110},
        // 't' - index 57
        {0b01000, 0b01000, 0b11110, 0b01000, 0b01000, 0b01001, 0b00110},
        // 'u' - index 58
        {0b00000, 0b00000, 0b10001, 0b10001, 0b10001, 0b10011, 0b01101},
        // 'v' - index 59
        {0b00000, 0b00000, 0b10001, 0b10001, 0b10001, 0b01010, 0b00100},
        // 'w' - index 60
        {0b00000, 0b00000, 0b10001, 0b10101, 0b10101, 0b10101, 0b01010},
        // 'x' - index 61
        {0b00000, 0b00000, 0b10001, 0b01010, 0b00100, 0b01010, 0b10001},
        // 'y' - index 62
        {0b00000, 0b00000, 0b10001, 0b10001, 0b01111, 0b00001, 0b01110},
        // 'z' - index 63
        {0b00000, 0b00000, 0b11111, 0b00010, 0b00100, 0b01000, 0b11111},
        // '>' - index 64
        {0b10000, 0b01000, 0b00100, 0b00010, 0b00100, 0b01000, 0b10000},
        // '<' - index 65
        {0b00001, 0b00010, 0b00100, 0b01000, 0b00100, 0b00010, 0b00001},
        // ':' - index 66
        {0b00000, 0b00100, 0b00000, 0b00000, 0b00000, 0b00100, 0b00000},
        // ',' - index 67
        {0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00100, 0b01000},
        // '/' - index 68
        {0b00001, 0b00010, 0b00010, 0b00100, 0b01000, 0b01000, 0b10000},
        // '-' - index 69
        {0b00000, 0b00000, 0b00000, 0b11111, 0b00000, 0b00000, 0b00000},
        // '_' - index 70
        {0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b11111},
        // '(' - index 71
        {0b00010, 0b00100, 0b01000, 0b01000, 0b01000, 0b00100, 0b00010},
        // ')' - index 72
        {0b01000, 0b00100, 0b00010, 0b00010, 0b00010, 0b00100, 0b01000},
        // '[' - index 73
        {0b01110, 0b01000, 0b01000, 0b01000, 0b01000, 0b01000, 0b01110},
        // ']' - index 74
        {0b01110, 0b00010, 0b00010, 0b00010, 0b00010, 0b00010, 0b01110},
        // '=' - index 75
        {0b00000, 0b00000, 0b11111, 0b00000, 0b11111, 0b00000, 0b00000},
        // '+' - index 76
        {0b00000, 0b00100, 0b00100, 0b11111, 0b00100, 0b00100, 0b00000},
        // '"' - index 77
        {0b01010, 0b01010, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000},
        // '\'' - index 78
        {0b00100, 0b00100, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000},
        // ';' - index 79
        {0b00000, 0b00100, 0b00000, 0b00000, 0b00000, 0b00100, 0b01000},
    };

    int idx = -1;
    if (c >= '0' && c <= '9') idx = c - '0';
    else if (c >= 'A' && c <= 'Z') idx = 10 + (c - 'A');
    else if (c >= 'a' && c <= 'z') idx = 38 + (c - 'a');
    else if (c == '.') idx = 36;
    else if (c == ' ') idx = 37;
    else if (c == '>') idx = 64;
    else if (c == '<') idx = 65;
    else if (c == ':') idx = 66;
    else if (c == ',') idx = 67;
    else if (c == '/') idx = 68;
    else if (c == '-') idx = 69;
    else if (c == '_') idx = 70;
    else if (c == '(') idx = 71;
    else if (c == ')') idx = 72;
    else if (c == '[') idx = 73;
    else if (c == ']') idx = 74;
    else if (c == '=') idx = 75;
    else if (c == '+') idx = 76;
    else if (c == '"') idx = 77;
    else if (c == '\'') idx = 78;
    else if (c == ';') idx = 79;
    else return false; // Unknown character

    if (idx < 0) return false;

    uint32_t row = font[idx][py];
    return (row >> (4 - px)) & 1;
}

void Renderer::drawText(const std::string& text, int x, int y, float r, float g, float b) {
    // Draw simple bitmap text
    const int charWidth = 6;  // 5 pixels + 1 spacing
    const int charHeight = 7;
    const int pixelSize = 4;  // Each font pixel is 4x4 screen pixels (doubled from 2x2)

    int cursorX = x;
    for (char c : text) {
        // Draw each character
        for (int py = 0; py < charHeight; py++) {
            for (int px = 0; px < 5; px++) {
                if (getPixel(c, px, py)) {
                    // Draw a small rectangle for this pixel
                    // Flip Y coordinate since OpenGL Y increases upward but font rows go top-to-bottom
                    Rect pixelRect = {
                        cursorX + px * pixelSize,
                        y - py * pixelSize,  // Subtract py instead of add to flip vertically
                        pixelSize,
                        pixelSize
                    };
                    drawRect(pixelRect, r, g, b, 1.0f);
                }
            }
        }
        cursorX += charWidth * pixelSize;
    }
}

void Renderer::setViewport(int x, int y, int width, int height) {
    glViewport(x, y, width, height);
}

GLuint Renderer::compileShader(const char* source, GLenum shaderType) {
    GLuint shader = glCreateShader(shaderType);
    glShaderSource(shader, 1, &source, nullptr);
    glCompileShader(shader);

    // Check for compilation errors
    GLint success;
    glGetShaderiv(shader, GL_COMPILE_STATUS, &success);
    if (!success) {
        char infoLog[512];
        glGetShaderInfoLog(shader, 512, nullptr, infoLog);
        std::cerr << "Shader compilation failed:\n" << infoLog << "\n";
        return 0;
    }

    return shader;
}

GLuint Renderer::createShaderProgram(const char* vertexSrc, const char* fragmentSrc) {
    GLuint vertexShader = compileShader(vertexSrc, GL_VERTEX_SHADER);
    if (vertexShader == 0) return 0;

    GLuint fragmentShader = compileShader(fragmentSrc, GL_FRAGMENT_SHADER);
    if (fragmentShader == 0) {
        glDeleteShader(vertexShader);
        return 0;
    }

    GLuint program = glCreateProgram();
    glAttachShader(program, vertexShader);
    glAttachShader(program, fragmentShader);
    glLinkProgram(program);

    // Check for linking errors
    GLint success;
    glGetProgramiv(program, GL_LINK_STATUS, &success);
    if (!success) {
        char infoLog[512];
        glGetProgramInfoLog(program, 512, nullptr, infoLog);
        std::cerr << "Shader program linking failed:\n" << infoLog << "\n";
        glDeleteShader(vertexShader);
        glDeleteShader(fragmentShader);
        return 0;
    }

    glDeleteShader(vertexShader);
    glDeleteShader(fragmentShader);

    return program;
}
