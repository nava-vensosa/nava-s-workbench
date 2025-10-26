#ifndef NVIM_CLIENT_H
#define NVIM_CLIENT_H

#include <string>
#include <vector>

// Placeholder for Neovim client
// This will be implemented with msgpack-rpc in a future iteration
class NvimClient {
public:
    NvimClient(const std::string& name);
    ~NvimClient();

    bool init();
    void sendKey(const std::string& key);
    void sendChar(unsigned int codepoint);
    std::vector<std::string> getBuffer();

    const std::string& getName() const { return name; }

private:
    std::string name;
    int nvimPid;
    int nvimSocket;
    // For now, we'll use a simple text buffer as placeholder
    std::vector<std::string> textBuffer;
    int cursorRow;
    int cursorCol;
};

#endif // NVIM_CLIENT_H
