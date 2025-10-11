cmake_minimum_required(VERSION 3.15)
project(MathViz VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# Options
option(BUILD_TESTS "Build tests" OFF)

# Find packages
find_package(OpenGL REQUIRED)
find_package(glfw3 REQUIRED)

# GLEW (platform-specific)
if(APPLE)
    find_package(GLEW REQUIRED)
else()
    find_package(GLEW REQUIRED)
endif()

# Dear ImGui (we'll include it as source files)
set(IMGUI_DIR ${CMAKE_CURRENT_SOURCE_DIR}/external/imgui)
file(GLOB IMGUI_SOURCES
    ${IMGUI_DIR}/*.cpp
    ${IMGUI_DIR}/backends/imgui_impl_glfw.cpp
    ${IMGUI_DIR}/backends/imgui_impl_opengl3.cpp
)

# Source files
file(GLOB_RECURSE SOURCES
    "src/*.cpp"
)

# Header files
file(GLOB_RECURSE HEADERS
    "include/*.h"
)

# Main executable
add_executable(mathviz
    ${SOURCES}
    ${IMGUI_SOURCES}
)

target_include_directories(mathviz PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/include
    ${IMGUI_DIR}
    ${IMGUI_DIR}/backends
    ${OPENGL_INCLUDE_DIR}
    ${GLEW_INCLUDE_DIRS}
)

target_link_libraries(mathviz PRIVATE
    OpenGL::GL
    glfw
    GLEW::GLEW
)

# Platform-specific settings
if(APPLE)
    target_link_libraries(mathviz PRIVATE
        "-framework Cocoa"
        "-framework IOKit"
        "-framework CoreVideo"
    )
endif()

# Copy shaders to build directory
file(COPY ${CMAKE_CURRENT_SOURCE_DIR}/shaders
     DESTINATION ${CMAKE_CURRENT_BINARY_DIR})

# Tests
if(BUILD_TESTS)
    enable_testing()
    add_subdirectory(tests)
endif()
