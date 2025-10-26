/*
 * Video Capture Header
 * AVFoundation webcam capture with Metal texture output
 */

#import <Foundation/Foundation.h>
#import <AVFoundation/AVFoundation.h>
#import <Metal/Metal.h>

@protocol VideoCaptureDelegate <NSObject>
- (void)didCaptureVideoTexture:(id<MTLTexture>)texture;
- (id<MTLDevice>)device;
@end

@interface VideoCapture : NSObject <AVCaptureVideoDataOutputSampleBufferDelegate>

@property (nonatomic, weak) id<VideoCaptureDelegate> delegate;
@property (nonatomic, strong) AVCaptureSession *captureSession;
@property (nonatomic, strong) AVCaptureVideoDataOutput *videoOutput;
@property (nonatomic, strong) dispatch_queue_t captureQueue;
@property (nonatomic, assign) CVMetalTextureCacheRef textureCache;

- (instancetype)initWithDelegate:(id<VideoCaptureDelegate>)delegate;
- (void)startCapture;
- (void)stopCapture;

@end
