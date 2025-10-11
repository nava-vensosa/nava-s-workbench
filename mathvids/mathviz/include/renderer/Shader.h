#pragma once

#include <GL/glew.h>
#include <glm/glm.hpp>
#include <string>

class Shader {
public:
    Shader();
    ~Shader();

    void loadFromSource(const std::string& vertex_source, const std::string& fragment_source);
    void loadFromFile(const std::string& vertex_path, const std::string& fragment_path);

    void use();
    void setUniform(const std::string& name, int value);
    void setUniform(const std::string& name, float value);
    void setUniform(const std::string& name, const glm::vec2& value);
    void setUniform(const std::string& name, const glm::vec3& value);
    void setUniform(const std::string& name, const glm::vec4& value);
    void setUniform(const std::string& name, const glm::mat4& value);

    GLuint getProgram() const { return program_; }

private:
    GLuint compileShader(GLenum type, const std::string& source);
    void checkCompileErrors(GLuint shader, const std::string& type);
    void checkLinkErrors(GLuint program);

    GLuint program_;
    GLuint vertex_shader_;
    GLuint fragment_shader_;
};
