cmake_minimum_required(VERSION 3.15)
project(REPL1 VERSION 1.0.0 LANGUAGES CXX C)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# Platform-specific settings
if(APPLE)
    set(CMAKE_OSX_DEPLOYMENT_TARGET "10.15" CACHE STRING "Minimum OS X deployment version")
endif()

# Dependencies
find_package(OpenGL REQUIRED)
find_package(glfw3 3.3 REQUIRED)

# GLAD for OpenGL loading (we'll include this directly)
add_library(glad STATIC
    external/glad/src/glad.c
)
target_include_directories(glad PUBLIC external/glad/include)

# msgpack-c for Neovim RPC
# TODO: Add msgpack when we implement full Neovim integration
# For now, we're using placeholder implementation

# Source files
set(SOURCES
    src/main.cpp
    src/window_manager.cpp
    src/layout_manager.cpp
    src/renderer.cpp
    src/input_handler.cpp
    src/nvim_client.cpp
    src/display_buffer.cpp
    src/text_buffer.cpp
)

# Main executable
add_executable(repl1 ${SOURCES})

target_include_directories(repl1 PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/include
    ${OPENGL_INCLUDE_DIR}
)

target_link_libraries(repl1 PRIVATE
    glfw
    glad
    OpenGL::GL
)

# Platform-specific libraries
if(UNIX AND NOT APPLE)
    target_link_libraries(repl1 PRIVATE pthread dl)
endif()

if(APPLE)
    target_link_libraries(repl1 PRIVATE
        "-framework Cocoa"
        "-framework IOKit"
        "-framework CoreVideo"
    )
endif()

# Copy shaders to build directory
file(COPY ${CMAKE_CURRENT_SOURCE_DIR}/shaders DESTINATION ${CMAKE_CURRENT_BINARY_DIR})
