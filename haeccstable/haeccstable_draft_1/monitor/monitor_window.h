/*
 * Monitor Window Header
 * NSWindow with Metal rendering and socket IPC
 */

#import <Cocoa/Cocoa.h>
#import <Metal/Metal.h>
#import <MetalKit/MetalKit.h>

@class VideoCapture;
@protocol VideoCaptureDelegate;

@interface MonitorWindow : NSWindow <MTKViewDelegate, VideoCaptureDelegate>

@property (nonatomic, strong) id<MTLDevice> device;
@property (nonatomic, strong) id<MTLCommandQueue> commandQueue;
@property (nonatomic, strong) id<MTLRenderPipelineState> pipelineState;
@property (nonatomic, strong) id<MTLTexture> videoTexture;
@property (nonatomic, strong) VideoCapture *videoCapture;
@property (nonatomic, strong) MTKView *metalView;
@property (nonatomic, assign) int socketFd;
@property (nonatomic, assign) int port;

- (instancetype)initWithName:(NSString *)name port:(int)port;
- (void)startSocketServer;
- (void)handleCommand:(NSDictionary *)command;

@end
