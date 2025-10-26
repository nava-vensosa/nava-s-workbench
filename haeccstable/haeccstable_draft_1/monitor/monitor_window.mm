/*
 * Monitor Window Implementation
 * Metal rendering + video capture + socket IPC
 */

#import "monitor_window.h"
#import "video_capture.h"
#import <sys/socket.h>
#import <netinet/in.h>
#import <arpa/inet.h>
#import <unistd.h>
#import <iostream>

@implementation MonitorWindow

- (instancetype)initWithName:(NSString *)name port:(int)port {
    // Create window
    NSRect frame = NSMakeRect(100, 100, 1920, 1080);
    NSWindowStyleMask style = NSWindowStyleMaskTitled |
                               NSWindowStyleMaskClosable |
                               NSWindowStyleMaskMiniaturizable |
                               NSWindowStyleMaskResizable;

    self = [super initWithContentRect:frame
                            styleMask:style
                              backing:NSBackingStoreBuffered
                                defer:NO];

    if (self) {
        self.title = name;
        self.port = port;

        // Setup Metal
        if (![self setupMetal]) {
            return nil;
        }

        // Setup video capture
        self.videoCapture = [[VideoCapture alloc] initWithDelegate:self];

        // Start socket server
        [self startSocketServer];
    }

    return self;
}

- (BOOL)setupMetal {
    // Get default Metal device
    self.device = MTLCreateSystemDefaultDevice();
    if (!self.device) {
        NSLog(@"Metal is not supported on this device");
        return NO;
    }

    NSLog(@"Metal device: %@", self.device.name);

    // Create Metal view
    self.metalView = [[MTKView alloc] initWithFrame:self.contentView.bounds
                                             device:self.device];
    self.metalView.delegate = self;
    self.metalView.clearColor = MTLClearColorMake(0.1, 0.1, 0.1, 1.0);  // Dark gray for debugging
    self.metalView.autoresizingMask = NSViewWidthSizable | NSViewHeightSizable;

    // Enable continuous drawing for live video
    self.metalView.enableSetNeedsDisplay = NO;  // Draw continuously, not on-demand
    self.metalView.paused = NO;
    self.metalView.preferredFramesPerSecond = 60;

    [self.contentView addSubview:self.metalView];

    NSLog(@"Metal view created: %@ x %@", @(self.metalView.bounds.size.width), @(self.metalView.bounds.size.height));

    // Create command queue
    self.commandQueue = [self.device newCommandQueue];

    // Load shaders and create pipeline
    if (![self createRenderPipeline]) {
        return NO;
    }

    NSLog(@"Metal setup complete");

    return YES;
}

- (BOOL)createRenderPipeline {
    NSError *error = nil;

    // Load shader library from compiled metallib
    NSString *metallibPath = @"monitor/default.metallib";
    NSURL *metallibURL = [NSURL fileURLWithPath:metallibPath];

    id<MTLLibrary> library = [self.device newLibraryWithURL:metallibURL error:&error];

    if (!library) {
        // Try loading from default library (if shaders were embedded)
        NSLog(@"Failed to load metallib from %@: %@", metallibPath, error);
        NSLog(@"Trying default library...");

        library = [self.device newDefaultLibrary];

        if (!library) {
            NSLog(@"Failed to load default library");
            return NO;
        }
    }

    NSLog(@"Shader library loaded successfully");

    id<MTLFunction> vertexFunction = [library newFunctionWithName:@"vertex_main"];
    id<MTLFunction> fragmentFunction = [library newFunctionWithName:@"fragment_main"];

    if (!vertexFunction || !fragmentFunction) {
        NSLog(@"Failed to load shader functions");
        NSLog(@"Available functions: %@", library.functionNames);
        return NO;
    }

    NSLog(@"Shader functions loaded: vertex_main, fragment_main");

    // Create pipeline descriptor
    MTLRenderPipelineDescriptor *pipelineDescriptor = [[MTLRenderPipelineDescriptor alloc] init];
    pipelineDescriptor.vertexFunction = vertexFunction;
    pipelineDescriptor.fragmentFunction = fragmentFunction;
    pipelineDescriptor.colorAttachments[0].pixelFormat = self.metalView.colorPixelFormat;

    // Create pipeline state
    self.pipelineState = [self.device newRenderPipelineStateWithDescriptor:pipelineDescriptor
                                                                      error:&error];
    if (!self.pipelineState) {
        NSLog(@"Failed to create pipeline state: %@", error);
        return NO;
    }

    NSLog(@"Render pipeline created successfully");

    return YES;
}

- (void)startSocketServer {
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        // Create socket
        int serverFd = socket(AF_INET, SOCK_STREAM, 0);
        if (serverFd < 0) {
            NSLog(@"Failed to create socket");
            return;
        }

        // Set socket options
        int opt = 1;
        setsockopt(serverFd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

        // Bind
        struct sockaddr_in address;
        address.sin_family = AF_INET;
        address.sin_addr.s_addr = INADDR_ANY;
        address.sin_port = htons(self.port);

        if (bind(serverFd, (struct sockaddr *)&address, sizeof(address)) < 0) {
            NSLog(@"Failed to bind socket to port %d", self.port);
            close(serverFd);
            return;
        }

        // Listen
        if (listen(serverFd, 3) < 0) {
            NSLog(@"Failed to listen");
            close(serverFd);
            return;
        }

        NSLog(@"Socket server listening on port %d", self.port);

        // Accept connection
        struct sockaddr_in clientAddr;
        socklen_t addrLen = sizeof(clientAddr);
        int clientFd = accept(serverFd, (struct sockaddr *)&clientAddr, &addrLen);

        if (clientFd < 0) {
            NSLog(@"Failed to accept connection");
            close(serverFd);
            return;
        }

        NSLog(@"Client connected");
        self.socketFd = clientFd;

        // Read commands
        char buffer[4096];
        while (true) {
            ssize_t bytesRead = recv(clientFd, buffer, sizeof(buffer) - 1, 0);
            if (bytesRead <= 0) {
                break;  // Connection closed
            }

            buffer[bytesRead] = '\0';

            // Parse JSON command
            NSString *jsonString = [NSString stringWithUTF8String:buffer];
            NSData *jsonData = [jsonString dataUsingEncoding:NSUTF8StringEncoding];
            NSError *error = nil;
            NSDictionary *command = [NSJSONSerialization JSONObjectWithData:jsonData
                                                                    options:0
                                                                      error:&error];

            if (command) {
                dispatch_async(dispatch_get_main_queue(), ^{
                    [self handleCommand:command];
                });
            }
        }

        close(clientFd);
        close(serverFd);
    });
}

- (void)handleCommand:(NSDictionary *)command {
    NSString *type = command[@"type"];

    if ([type isEqualToString:@"start_capture"]) {
        NSString *device = command[@"device"];
        NSLog(@"Starting capture from: %@", device);

        // Start video capture if not already running
        if (!self.videoCapture.captureSession.isRunning) {
            [self.videoCapture startCapture];
        }

    } else if ([type isEqualToString:@"project_layer"]) {
        NSLog(@"Project layer command received");

        // For MVP, ensure video capture is running
        // In full implementation, this would composite layers at z-index
        if (!self.videoCapture.captureSession.isRunning) {
            [self.videoCapture startCapture];
        }

    } else {
        NSLog(@"Unknown command: %@", type);
    }
}

// MTKViewDelegate methods

- (void)mtkView:(MTKView *)view drawableSizeWillChange:(CGSize)size {
    // Handle resize
}

- (void)drawInMTKView:(MTKView *)view {
    // Create command buffer
    id<MTLCommandBuffer> commandBuffer = [self.commandQueue commandBuffer];

    // Get current render pass descriptor
    MTLRenderPassDescriptor *renderPassDescriptor = view.currentRenderPassDescriptor;
    if (!renderPassDescriptor) {
        return;
    }

    // Create render encoder
    id<MTLRenderCommandEncoder> renderEncoder =
        [commandBuffer renderCommandEncoderWithDescriptor:renderPassDescriptor];

    if (!self.videoTexture) {
        // No video yet - just clear to black
        [renderEncoder endEncoding];
        [commandBuffer presentDrawable:view.currentDrawable];
        [commandBuffer commit];
        return;
    }

    // Set pipeline
    [renderEncoder setRenderPipelineState:self.pipelineState];

    // Bind texture
    [renderEncoder setFragmentTexture:self.videoTexture atIndex:0];

    // Draw fullscreen quad (Metal provides implicit quad for us)
    // We'll use 6 vertices (2 triangles) to form a quad
    [renderEncoder drawPrimitives:MTLPrimitiveTypeTriangle
                      vertexStart:0
                      vertexCount:6];

    [renderEncoder endEncoding];

    // Present
    [commandBuffer presentDrawable:view.currentDrawable];
    [commandBuffer commit];
}

// Video capture callback
- (void)didCaptureVideoTexture:(id<MTLTexture>)texture {
    static BOOL firstFrame = YES;

    self.videoTexture = texture;

    if (firstFrame) {
        NSLog(@"First video frame received: %ldx%ld", texture.width, texture.height);
        firstFrame = NO;
    }
}

@end
