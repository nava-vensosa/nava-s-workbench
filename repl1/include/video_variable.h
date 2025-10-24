#ifndef VIDEO_VARIABLE_H
#define VIDEO_VARIABLE_H

#include <memory>
#include <string>
#include "video_source.h"
#include "video_texture.h"

// Type of video variable
enum class VideoVarType {
    INPUT,      // in_var (video source)
    OUTPUT,     // out_var (display target)
    TRANSFORM   // Future: effect/transform variables
};

// REPL video variable (lazy evaluated)
class VideoVariable {
public:
    VideoVariable(const std::string& name, VideoVarType type);
    ~VideoVariable() = default;

    // Get variable name
    const std::string& getName() const { return name; }

    // Get variable type
    VideoVarType getType() const { return type; }

    // For INPUT variables: set video source
    void setSource(std::shared_ptr<VideoSource> src);
    std::shared_ptr<VideoSource> getSource() const { return source; }

    // For OUTPUT variables: set display target
    void setTarget(const std::string& targetName);
    const std::string& getTarget() const { return target; }

    // Get texture (lazy - creates on first access)
    std::shared_ptr<VideoTexture> getTexture();

    // Execute variable (fetch frame and update texture)
    void execute();

private:
    std::string name;
    VideoVarType type;

    // For INPUT
    std::shared_ptr<VideoSource> source;
    std::shared_ptr<VideoTexture> texture;

    // For OUTPUT
    std::string target;  // e.g., "monitor1", "monitor2"
};

#endif // VIDEO_VARIABLE_H
