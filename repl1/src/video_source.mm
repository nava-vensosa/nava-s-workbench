#include "video_source.h"
#import <AVFoundation/AVFoundation.h>
#import <CoreMedia/CoreMedia.h>
#import <CoreGraphics/CoreGraphics.h>
#include <iostream>
#include <mutex>

// Objective-C delegate to receive video frames
@interface VideoFrameDelegateImpl : NSObject <AVCaptureVideoDataOutputSampleBufferDelegate>
{
    VideoSource* cppSource;  // Weak reference to C++ object
    std::mutex frameMutex;
}
- (id)initWithSource:(VideoSource*)source;
- (void)captureOutput:(AVCaptureOutput*)output
    didOutputSampleBuffer:(CMSampleBufferRef)sampleBuffer
    fromConnection:(AVCaptureConnection*)connection;
@end

@implementation VideoFrameDelegateImpl

- (id)initWithSource:(VideoSource*)source {
    self = [super init];
    if (self) {
        cppSource = source;
    }
    return self;
}

- (void)captureOutput:(AVCaptureOutput*)output
    didOutputSampleBuffer:(CMSampleBufferRef)sampleBuffer
    fromConnection:(AVCaptureConnection*)connection {

    // Get image buffer from sample
    CVImageBufferRef imageBuffer = CMSampleBufferGetImageBuffer(sampleBuffer);
    if (!imageBuffer) return;

    // Lock the buffer for reading
    CVPixelBufferLockBaseAddress(imageBuffer, kCVPixelBufferLock_ReadOnly);

    // Get buffer info
    size_t width = CVPixelBufferGetWidth(imageBuffer);
    size_t height = CVPixelBufferGetHeight(imageBuffer);

    // Create new VideoFrame (move semantics for zero-copy)
    auto frame = std::make_shared<VideoFrame>((int)width, (int)height);

    // Copy pixel data (convert to RGB24 if needed)
    OSType pixelFormat = CVPixelBufferGetPixelFormatType(imageBuffer);

    if (pixelFormat == kCVPixelFormatType_32BGRA) {
        // Convert BGRA to RGB
        uint8_t* src = (uint8_t*)CVPixelBufferGetBaseAddress(imageBuffer);
        size_t bytesPerRow = CVPixelBufferGetBytesPerRow(imageBuffer);

        for (size_t y = 0; y < height; y++) {
            for (size_t x = 0; x < width; x++) {
                size_t srcIdx = y * bytesPerRow + x * 4;
                size_t dstIdx = (y * width + x) * 3;

                frame->data[dstIdx + 0] = src[srcIdx + 2];  // R
                frame->data[dstIdx + 1] = src[srcIdx + 1];  // G
                frame->data[dstIdx + 2] = src[srcIdx + 0];  // B
            }
        }
    }

    // Set timestamp
    CMTime timestamp = CMSampleBufferGetPresentationTimeStamp(sampleBuffer);
    frame->timestamp = CMTimeGetSeconds(timestamp);

    // Unlock buffer
    CVPixelBufferUnlockBaseAddress(imageBuffer, kCVPixelBufferLock_ReadOnly);

    // Pass frame to C++ object (thread-safe)
    std::lock_guard<std::mutex> lock(frameMutex);
    if (cppSource) {
        cppSource->onNewFrame(frame);
    }
}

@end

// VideoFrame implementation
VideoFrame::VideoFrame(int w, int h)
    : width(w), height(h), dataSize(w * h * 3), timestamp(0.0) {
    data = std::make_unique<uint8_t[]>(dataSize);
}

// VideoSource implementation
VideoSource::VideoSource()
    : captureSession(nil), captureDevice(nil), deviceInput(nil),
      videoOutput(nil), frameDelegate(nil),
      isActive(false), frameWidth(0), frameHeight(0),
      hasNewFrame(false) {
}

VideoSource::~VideoSource() {
    close();
}

std::vector<VideoSource::DeviceInfo> VideoSource::enumerateDevices() {
    std::vector<DeviceInfo> devices;

    // Get all video devices
    NSArray* avDevices = [AVCaptureDevice devicesWithMediaType:AVMediaTypeVideo];

    for (int i = 0; i < [avDevices count]; i++) {
        AVCaptureDevice* device = [avDevices objectAtIndex:i];

        DeviceInfo info;
        info.index = i;
        info.id = std::string([[device uniqueID] UTF8String]);
        info.name = std::string([[device localizedName] UTF8String]);

        devices.push_back(info);
    }

    return devices;
}

bool VideoSource::open(int deviceIndex) {
    NSArray* devices = [AVCaptureDevice devicesWithMediaType:AVMediaTypeVideo];

    if (deviceIndex < 0 || deviceIndex >= [devices count]) {
        std::cerr << "Video device index out of range: " << deviceIndex << std::endl;
        return false;
    }

    captureDevice = [devices objectAtIndex:deviceIndex];
    return open(std::string([[captureDevice uniqueID] UTF8String]));
}

bool VideoSource::open(const std::string& deviceId) {
    if (isActive) {
        close();
    }

    // Find device by ID
    NSString* nsDeviceId = [NSString stringWithUTF8String:deviceId.c_str()];
    captureDevice = [AVCaptureDevice deviceWithUniqueID:nsDeviceId];

    if (!captureDevice) {
        std::cerr << "Could not find video device: " << deviceId << std::endl;
        return false;
    }

    // Create capture session
    captureSession = [[AVCaptureSession alloc] init];
    [captureSession setSessionPreset:AVCaptureSessionPreset640x480];

    // Create device input
    NSError* error = nil;
    deviceInput = [AVCaptureDeviceInput deviceInputWithDevice:captureDevice error:&error];

    if (error) {
        std::cerr << "Failed to create device input: "
                  << [[error localizedDescription] UTF8String] << std::endl;
        return false;
    }

    if (![captureSession canAddInput:deviceInput]) {
        std::cerr << "Cannot add device input to session" << std::endl;
        return false;
    }

    [captureSession addInput:deviceInput];

    // Create video output
    videoOutput = [[AVCaptureVideoDataOutput alloc] init];

    // Set pixel format to BGRA
    NSDictionary* settings = @{
        (NSString*)kCVPixelBufferPixelFormatTypeKey: @(kCVPixelFormatType_32BGRA)
    };
    [videoOutput setVideoSettings:settings];

    // Create delegate
    frameDelegate = [[VideoFrameDelegateImpl alloc] initWithSource:this];

    // Set delegate queue (serial queue for frame delivery)
    dispatch_queue_t queue = dispatch_queue_create("VideoFrameQueue", DISPATCH_QUEUE_SERIAL);
    [videoOutput setSampleBufferDelegate:(id<AVCaptureVideoDataOutputSampleBufferDelegate>)frameDelegate queue:queue];

    if (![captureSession canAddOutput:videoOutput]) {
        std::cerr << "Cannot add video output to session" << std::endl;
        return false;
    }

    [captureSession addOutput:videoOutput];

    // Get frame dimensions
    CMFormatDescriptionRef formatDesc = [[captureDevice activeFormat] formatDescription];
    CMVideoDimensions dimensions = CMVideoFormatDescriptionGetDimensions(formatDesc);
    frameWidth = dimensions.width;
    frameHeight = dimensions.height;

    // Start capture
    [captureSession startRunning];

    isActive = true;
    std::cout << "Video source opened: " << deviceId
              << " (" << frameWidth << "x" << frameHeight << ")" << std::endl;

    return true;
}

void VideoSource::onNewFrame(std::shared_ptr<VideoFrame> frame) {
    // Called from delegate thread - store latest frame
    latestFrame = frame;
    hasNewFrame = true;
}

std::optional<std::shared_ptr<VideoFrame>> VideoSource::getFrame() {
    // Lazy evaluation: only return frame if new one is available
    if (!isActive || !hasNewFrame) {
        return std::nullopt;
    }

    hasNewFrame = false;  // Mark as consumed
    return latestFrame;   // Return shared_ptr (zero-copy)
}

void VideoSource::close() {
    if (!isActive) return;

    if (captureSession) {
        [captureSession stopRunning];
        captureSession = nil;
    }

    deviceInput = nil;
    videoOutput = nil;
    frameDelegate = nil;
    captureDevice = nil;

    latestFrame.reset();
    hasNewFrame = false;
    isActive = false;

    std::cout << "Video source closed" << std::endl;
}
