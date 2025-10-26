#ifndef VIDEO_SOURCE_H
#define VIDEO_SOURCE_H

#include <memory>
#include <string>
#include <vector>
#include <optional>

// Forward declare platform-specific types
#ifdef __OBJC__
@class AVCaptureSession;
@class AVCaptureDevice;
@class AVCaptureDeviceInput;
@class AVCaptureVideoDataOutput;
@class VideoFrameDelegateImpl;
#else
typedef struct objc_object AVCaptureSession;
typedef struct objc_object AVCaptureDevice;
typedef struct objc_object AVCaptureDeviceInput;
typedef struct objc_object AVCaptureVideoDataOutput;
typedef struct objc_object VideoFrameDelegateImpl;
#endif

// Represents a single video frame (RAII wrapper)
struct VideoFrame {
    std::unique_ptr<uint8_t[]> data;  // RGB24 data
    int width;
    int height;
    size_t dataSize;
    double timestamp;  // Frame timestamp in seconds

    VideoFrame(int w, int h);
    ~VideoFrame() = default;

    // Move only (no copies to save memory)
    VideoFrame(VideoFrame&&) noexcept = default;
    VideoFrame& operator=(VideoFrame&&) noexcept = default;
    VideoFrame(const VideoFrame&) = delete;
    VideoFrame& operator=(const VideoFrame&) = delete;
};

// Lazy video source - only captures frames when requested
class VideoSource {
public:
    // Device info for enumeration
    struct DeviceInfo {
        std::string id;          // Unique device identifier
        std::string name;        // Human-readable name
        int index;               // Index for quick access
    };

    VideoSource();
    ~VideoSource();

    // Enumerate available video devices
    static std::vector<DeviceInfo> enumerateDevices();

    // Open device by index or ID string
    bool open(int deviceIndex = 0);
    bool open(const std::string& deviceId);

    // Check if source is active
    bool isOpen() const { return isActive; }

    // Get current frame dimensions
    int getWidth() const { return frameWidth; }
    int getHeight() const { return frameHeight; }

    // Lazy frame fetch - only captures new frame when called
    // Returns nullptr if no new frame is available
    std::optional<std::shared_ptr<VideoFrame>> getFrame();

    // Close the video source
    void close();

private:
    // Platform-specific capture session
    AVCaptureSession* captureSession;
    AVCaptureDevice* captureDevice;
    AVCaptureDeviceInput* deviceInput;
    AVCaptureVideoDataOutput* videoOutput;
    VideoFrameDelegateImpl* frameDelegate;

    bool isActive;
    int frameWidth;
    int frameHeight;

    // Latest frame (shared ownership for zero-copy)
    std::shared_ptr<VideoFrame> latestFrame;
    bool hasNewFrame;

public:
    // Frame callback from delegate (must be public for Objective-C delegate)
    void onNewFrame(std::shared_ptr<VideoFrame> frame);
};

#endif // VIDEO_SOURCE_H
