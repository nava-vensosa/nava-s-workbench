/*
 * Video Capture Implementation
 * Captures webcam feed and converts to Metal texture
 */

#import "video_capture.h"
#import <CoreVideo/CoreVideo.h>

@implementation VideoCapture

- (instancetype)initWithDelegate:(id<VideoCaptureDelegate>)delegate {
    self = [super init];
    if (self) {
        self.delegate = delegate;
        self.captureQueue = dispatch_queue_create("com.haeccstable.capture", DISPATCH_QUEUE_SERIAL);

        // Create texture cache for converting CVPixelBuffer to MTLTexture
        CVReturn result = CVMetalTextureCacheCreate(
            kCFAllocatorDefault,
            nil,
            [delegate device],
            nil,
            &_textureCache
        );

        if (result != kCVReturnSuccess) {
            NSLog(@"Failed to create texture cache: %d", result);
            return nil;
        }

        [self setupCaptureSession];
    }
    return self;
}

- (void)setupCaptureSession {
    self.captureSession = [[AVCaptureSession alloc] init];
    self.captureSession.sessionPreset = AVCaptureSessionPreset1920x1080;

    // Get default video device (webcam)
    AVCaptureDevice *videoDevice = [AVCaptureDevice defaultDeviceWithMediaType:AVMediaTypeVideo];
    if (!videoDevice) {
        NSLog(@"No video device found");
        return;
    }

    NSError *error = nil;

    // Create input
    AVCaptureDeviceInput *videoInput = [AVCaptureDeviceInput deviceInputWithDevice:videoDevice
                                                                             error:&error];
    if (!videoInput) {
        NSLog(@"Failed to create video input: %@", error);
        return;
    }

    if ([self.captureSession canAddInput:videoInput]) {
        [self.captureSession addInput:videoInput];
    }

    // Create output
    self.videoOutput = [[AVCaptureVideoDataOutput alloc] init];

    // Set pixel format to BGRA (Metal-compatible)
    self.videoOutput.videoSettings = @{
        (NSString *)kCVPixelBufferPixelFormatTypeKey: @(kCVPixelFormatType_32BGRA)
    };

    [self.videoOutput setSampleBufferDelegate:self queue:self.captureQueue];

    if ([self.captureSession canAddOutput:self.videoOutput]) {
        [self.captureSession addOutput:self.videoOutput];
    }
}

- (void)startCapture {
    if (!self.captureSession.isRunning) {
        dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_HIGH, 0), ^{
            [self.captureSession startRunning];
            NSLog(@"Video capture started");
        });
    }
}

- (void)stopCapture {
    if (self.captureSession.isRunning) {
        [self.captureSession stopRunning];
        NSLog(@"Video capture stopped");
    }
}

// AVCaptureVideoDataOutputSampleBufferDelegate

- (void)captureOutput:(AVCaptureOutput *)output
didOutputSampleBuffer:(CMSampleBufferRef)sampleBuffer
       fromConnection:(AVCaptureConnection *)connection {

    CVPixelBufferRef pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer);
    if (!pixelBuffer) {
        return;
    }

    size_t width = CVPixelBufferGetWidth(pixelBuffer);
    size_t height = CVPixelBufferGetHeight(pixelBuffer);

    // Create Metal texture from pixel buffer
    CVMetalTextureRef metalTextureRef = NULL;
    CVReturn result = CVMetalTextureCacheCreateTextureFromImage(
        kCFAllocatorDefault,
        self.textureCache,
        pixelBuffer,
        nil,
        MTLPixelFormatBGRA8Unorm,
        width,
        height,
        0,
        &metalTextureRef
    );

    if (result != kCVReturnSuccess || !metalTextureRef) {
        NSLog(@"Failed to create Metal texture: %d", result);
        return;
    }

    id<MTLTexture> texture = CVMetalTextureGetTexture(metalTextureRef);

    // Send texture to delegate
    if (texture && self.delegate) {
        dispatch_async(dispatch_get_main_queue(), ^{
            [self.delegate didCaptureVideoTexture:texture];
        });
    }

    CFRelease(metalTextureRef);
}

- (void)dealloc {
    [self stopCapture];
    if (_textureCache) {
        CFRelease(_textureCache);
    }
}

@end
