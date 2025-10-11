#!/bin/bash

# Setup script for cloning Dear ImGui

echo "Setting up Dear ImGui..."

# Create external directory if it doesn't exist
mkdir -p external

# Clone Dear ImGui if not already present
if [ ! -d "external/imgui" ]; then
    echo "Cloning Dear ImGui..."
    git clone https://github.com/ocornut/imgui.git external/imgui
    echo "Dear ImGui cloned successfully!"
else
    echo "Dear ImGui already exists in external/imgui"
fi

# Check if imgui backends exist
if [ -d "external/imgui/backends" ]; then
    echo "ImGui backends found!"
    echo ""
    echo "Setup complete! You can now build the project:"
    echo "  mkdir build && cd build"
    echo "  cmake .."
    echo "  make"
else
    echo "Warning: ImGui backends not found. Make sure you cloned the correct version."
fi
