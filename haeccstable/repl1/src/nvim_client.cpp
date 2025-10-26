#include "nvim_client.h"
#include <iostream>

NvimClient::NvimClient(const std::string& name)
    : name(name), nvimPid(-1), nvimSocket(-1), cursorRow(0), cursorCol(0) {
}

NvimClient::~NvimClient() {
    // Cleanup will be implemented when we add real Neovim integration
}

bool NvimClient::init() {
    std::cout << "Initializing Neovim client for " << name << "\n";

    // For now, just create an empty text buffer
    textBuffer.push_back("// " + name);
    textBuffer.push_back("");

    // TODO: In a future iteration, we will:
    // 1. Spawn a Neovim process with --embed flag
    // 2. Connect to it via Unix socket or stdio
    // 3. Set up msgpack-rpc communication
    // 4. Subscribe to UI events
    // 5. Render the Neovim grid to an OpenGL texture

    return true;
}

void NvimClient::sendKey(const std::string& key) {
    // Placeholder - will send key to Neovim via RPC
    std::cout << "Sending key to " << name << ": " << key << "\n";
}

void NvimClient::sendChar(unsigned int codepoint) {
    // Placeholder - will send character to Neovim via RPC
    std::cout << "Sending char to " << name << ": " << (char)codepoint << "\n";
}

std::vector<std::string> NvimClient::getBuffer() {
    return textBuffer;
}
