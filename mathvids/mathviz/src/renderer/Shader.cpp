#include "renderer/Shader.h"
#include <glm/gtc/type_ptr.hpp>
#include <fstream>
#include <sstream>
#include <iostream>

Shader::Shader()
    : program_(0)
    , vertex_shader_(0)
    , fragment_shader_(0)
{}

Shader::~Shader() {
    if (program_) {
        glDeleteProgram(program_);
    }
}

void Shader::loadFromSource(const std::string& vertex_source, const std::string& fragment_source) {
    vertex_shader_ = compileShader(GL_VERTEX_SHADER, vertex_source);
    fragment_shader_ = compileShader(GL_FRAGMENT_SHADER, fragment_source);

    program_ = glCreateProgram();
    glAttachShader(program_, vertex_shader_);
    glAttachShader(program_, fragment_shader_);
    glLinkProgram(program_);
    checkLinkErrors(program_);

    glDeleteShader(vertex_shader_);
    glDeleteShader(fragment_shader_);
}

void Shader::loadFromFile(const std::string& vertex_path, const std::string& fragment_path) {
    // Load vertex shader
    std::ifstream vertex_file(vertex_path);
    std::stringstream vertex_stream;
    vertex_stream << vertex_file.rdbuf();
    std::string vertex_source = vertex_stream.str();

    // Load fragment shader
    std::ifstream fragment_file(fragment_path);
    std::stringstream fragment_stream;
    fragment_stream << fragment_file.rdbuf();
    std::string fragment_source = fragment_stream.str();

    loadFromSource(vertex_source, fragment_source);
}

void Shader::use() {
    glUseProgram(program_);
}

void Shader::setUniform(const std::string& name, int value) {
    GLint location = glGetUniformLocation(program_, name.c_str());
    glUniform1i(location, value);
}

void Shader::setUniform(const std::string& name, float value) {
    GLint location = glGetUniformLocation(program_, name.c_str());
    glUniform1f(location, value);
}

void Shader::setUniform(const std::string& name, const glm::vec2& value) {
    GLint location = glGetUniformLocation(program_, name.c_str());
    glUniform2fv(location, 1, glm::value_ptr(value));
}

void Shader::setUniform(const std::string& name, const glm::vec3& value) {
    GLint location = glGetUniformLocation(program_, name.c_str());
    glUniform3fv(location, 1, glm::value_ptr(value));
}

void Shader::setUniform(const std::string& name, const glm::vec4& value) {
    GLint location = glGetUniformLocation(program_, name.c_str());
    glUniform4fv(location, 1, glm::value_ptr(value));
}

void Shader::setUniform(const std::string& name, const glm::mat4& value) {
    GLint location = glGetUniformLocation(program_, name.c_str());
    glUniformMatrix4fv(location, 1, GL_FALSE, glm::value_ptr(value));
}

GLuint Shader::compileShader(GLenum type, const std::string& source) {
    GLuint shader = glCreateShader(type);
    const char* src = source.c_str();
    glShaderSource(shader, 1, &src, nullptr);
    glCompileShader(shader);

    std::string type_str = (type == GL_VERTEX_SHADER) ? "VERTEX" : "FRAGMENT";
    checkCompileErrors(shader, type_str);

    return shader;
}

void Shader::checkCompileErrors(GLuint shader, const std::string& type) {
    GLint success;
    GLchar info_log[1024];

    glGetShaderiv(shader, GL_COMPILE_STATUS, &success);
    if (!success) {
        glGetShaderInfoLog(shader, 1024, nullptr, info_log);
        std::cerr << "Shader compilation error (" << type << "):\n" << info_log << std::endl;
    }
}

void Shader::checkLinkErrors(GLuint program) {
    GLint success;
    GLchar info_log[1024];

    glGetProgramiv(program, GL_LINK_STATUS, &success);
    if (!success) {
        glGetProgramInfoLog(program, 1024, nullptr, info_log);
        std::cerr << "Shader linking error:\n" << info_log << std::endl;
    }
}
