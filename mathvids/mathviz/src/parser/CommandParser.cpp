#include "parser/CommandParser.h"
#include "core/Scene.h"

CommandParser::CommandParser(Scene* scene)
    : scene_(scene)
{}

CommandParser::~CommandParser() {}

void CommandParser::parseLine(const std::string& line) {
    // Placeholder - will be implemented in Phase 3
    // For now, just print the command
}
