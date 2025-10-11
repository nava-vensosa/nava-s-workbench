#!/bin/bash

# Quick build script for MathViz
# Run this from the mathviz directory

set -e  # Exit on error

echo "╔════════════════════════════════════════╗"
echo "║  MathViz - Quick Build Script          ║"
echo "║  Phase 2: Panel System & Input         ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Check for dependencies
echo "Checking dependencies..."

if ! command -v cmake &> /dev/null; then
    echo "❌ CMake not found. Install with: brew install cmake"
    exit 1
fi

if ! brew list glfw &> /dev/null; then
    echo "❌ GLFW not found. Install with: brew install glfw"
    exit 1
fi

if ! brew list glew &> /dev/null; then
    echo "❌ GLEW not found. Install with: brew install glew"
    exit 1
fi

if ! brew list glm &> /dev/null; then
    echo "❌ GLM not found. Install with: brew install glm"
    exit 1
fi

echo "✅ All dependencies found!"
echo ""

# Setup ImGui
if [ ! -d "external/imgui" ]; then
    echo "Setting up Dear ImGui..."
    ./setup_imgui.sh
    echo ""
fi

# Clean build directory if requested
if [ "$1" == "clean" ]; then
    echo "Cleaning build directory..."
    rm -rf build
    echo ""
fi

# Create build directory
if [ ! -d "build" ]; then
    mkdir build
fi

# Build
echo "Building MathViz..."
cd build

if [ ! -f "Makefile" ]; then
    echo "Running CMake..."
    cmake ..
    echo ""
fi

echo "Compiling..."
make -j4

if [ $? -eq 0 ]; then
    echo ""
    echo "╔════════════════════════════════════════╗"
    echo "║  ✅ BUILD SUCCESSFUL!                  ║"
    echo "╚════════════════════════════════════════╝"
    echo ""
    echo "Run with: cd build && ./mathviz"
    echo ""
    echo "Or use: ./quick_build.sh run"
    echo ""
else
    echo ""
    echo "❌ Build failed. Check errors above."
    exit 1
fi

# Run if requested
if [ "$1" == "run" ]; then
    echo "Starting MathViz..."
    echo ""
    ./mathviz
fi
