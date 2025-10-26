# Haeccstable Implementation Guide

**Comprehensive builder's guide for Python + Haskell + C++ (Metal) architecture**

This document provides step-by-step instructions for implementing Haeccstable from scratch, organized by development phases.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Development Setup](#development-setup)
3. [Implementation Phases](#implementation-phases)
4. [Testing Strategy](#testing-strategy)
5. [Common Pitfalls](#common-pitfalls)
6. [Performance Optimization](#performance-optimization)

---

## Prerequisites

### Required Tools

- **macOS 11.0+** (Metal API requirement)
- **Python 3.11+** with pip
- **Haskell GHC 9.4+** with Stack or Cabal
- **Xcode 13+** with Command Line Tools
- **C++17** compiler (clang++ from Xcode)

### Python Dependencies

```bash
pip install readline-py  # Command history/completion (if needed)
```

### Haskell Dependencies

```haskell
-- stack.yaml or .cabal file
dependencies:
  - base >= 4.16
  - parsec >= 3.1
  - stm >= 2.5
  - lens >= 5.0
  - vector >= 0.12
  - text >= 1.2
```

### C++ Frameworks

- **Metal** (included with Xcode)
- **AVFoundation** (included with macOS)
- **IOSurface** (included with macOS)
- **SDL2** (optional): `brew install sdl2`

---

## Development Setup

### Project Structure

```
haeccstable/
├── haeccstable.py                  # Main Python REPL entry point
├── repl/                           # Python REPL modules
│   ├── __init__.py
│   ├── command_parser.py
│   ├── project_manager.py
│   ├── monitor_manager.py
│   └── ipc_coordinator.py
├── interpreter/                    # Haskell DSL interpreter
│   ├── src/
│   │   ├── Parser.hs
│   │   ├── TypeChecker.hs
│   │   ├── Evaluator.hs
│   │   ├── Environment.hs
│   │   ├── MathEval.hs
│   │   ├── Timeline.hs
│   │   └── FFI.hs
│   ├── haeccstable-interpreter.cabal
│   └── stack.yaml
├── renderer/                       # C++ Metal renderer
│   ├── src/
│   │   ├── monitor_window.mm
│   │   ├── metal_renderer.mm
│   │   ├── video_source.mm
│   │   ├── layer_compositor.cpp
│   │   ├── math_renderer.cpp
│   │   ├── ipc_server.cpp
│   │   └── shared_memory.cpp
│   ├── include/
│   │   └── [headers]
│   ├── shaders/
│   │   └── composition.metal
│   └── CMakeLists.txt
├── haeccstable_projects/           # User project directories
└── Makefile                        # Build orchestration
```

### Build System (Makefile)

```makefile
.PHONY: all build-interpreter build-renderer clean

all: build-interpreter build-renderer

build-interpreter:
	cd interpreter && stack build

build-renderer:
	mkdir -p renderer/build
	cd renderer/build && cmake .. && make

clean:
	cd interpreter && stack clean
	rm -rf renderer/build
```

---

## Implementation Phases

### Phase 1: Python REPL Foundation (Week 1)

**Goal**: Create basic terminal REPL with command parsing

#### 1.1 Basic REPL Loop

**File**: `haeccstable.py`

```python
#!/usr/bin/env python3
import readline
import sys
from repl.command_parser import CommandParser
from repl.project_manager import ProjectManager
from repl.monitor_manager import MonitorManager

class HaeccstableREPL:
    def __init__(self):
        self.parser = CommandParser()
        self.project_mgr = ProjectManager()
        self.monitor_mgr = MonitorManager()
        self.running = True

    def run(self):
        print("haeccstable v1.0 - Terminal Live Coding Environment")

        while self.running:
            try:
                command = input("haeccstable> ")
                self.execute_command(command)
            except KeyboardInterrupt:
                print("\nUse 'exit' to quit")
            except EOFError:
                break

    def execute_command(self, command):
        cmd_type, args = self.parser.parse(command)

        if cmd_type == 'exit':
            self.exit()
        elif cmd_type == 'select_composition':
            self.project_mgr.select(args['directory'])
        elif cmd_type == 'run':
            self.run_file(args['filename'])
        elif cmd_type == 'open_monitor':
            self.monitor_mgr.open(args['name'])
        elif cmd_type == 'close_monitor':
            self.monitor_mgr.close(args['name'])
        elif cmd_type == 'monitor_command':
            self.monitor_mgr.send_command(args['monitor'], args['command'])
        elif cmd_type == 'update_dossier':
            self.project_mgr.update_dossier()
        elif cmd_type == 'dsl':
            self.execute_dsl(command)

    def run_file(self, filename):
        filepath = self.project_mgr.get_file_path(filename)
        with open(filepath, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    self.execute_dsl(line)

    def execute_dsl(self, code):
        # Call Haskell interpreter via subprocess or FFI
        pass

    def exit(self):
        self.monitor_mgr.close_all()
        self.running = False

if __name__ == '__main__':
    repl = HaeccstableREPL()
    repl.run()
```

#### 1.2 Command Parser

**File**: `repl/command_parser.py`

```python
import re

class CommandParser:
    REPL_COMMANDS = [
        'select_composition', 'run', 'open_monitor',
        'close_monitor', 'update', 'exit'
    ]

    def parse(self, command):
        command = command.strip()

        # Check for REPL commands
        if command == 'exit':
            return ('exit', {})

        if command.startswith('select_composition '):
            directory = command.split(' ', 1)[1]
            return ('select_composition', {'directory': directory})

        if command.startswith('run '):
            filename = command.split(' ', 1)[1]
            return ('run', {'filename': filename})

        if command.startswith('open_monitor '):
            name = command.split(' ', 1)[1]
            return ('open_monitor', {'name': name})

        if command.startswith('close_monitor '):
            name = command.split(' ', 1)[1]
            return ('close_monitor', {'name': name})

        # Check for monitor commands (e.g., "monitor1.fullscreen")
        monitor_cmd = re.match(r'(\w+)\.(borderless|fullscreen)', command)
        if monitor_cmd:
            return ('monitor_command', {
                'monitor': monitor_cmd.group(1),
                'command': monitor_cmd.group(2)
            })

        if command == 'update dossier.json':
            return ('update_dossier', {})

        # Otherwise, treat as DSL code
        return ('dsl', {'code': command})
```

#### 1.3 Project Manager

**File**: `repl/project_manager.py`

```python
import os
import json

class ProjectManager:
    def __init__(self):
        self.projects_dir = 'haeccstable_projects'
        self.current_project = None
        self.current_dir = None

    def select(self, directory):
        project_path = os.path.join(self.projects_dir, directory)

        if not os.path.exists(project_path):
            print(f"Error: Project '{directory}' not found")
            return False

        # Load dossier.json
        dossier_path = os.path.join(project_path, 'dossier.json')
        if os.path.exists(dossier_path):
            with open(dossier_path, 'r') as f:
                self.dossier = json.load(f)
        else:
            self.dossier = {}

        self.current_project = directory
        self.current_dir = project_path
        print(f"Loaded project: {directory}")
        return True

    def get_file_path(self, filename):
        if not self.current_dir:
            raise Exception("No project selected")
        return os.path.join(self.current_dir, filename)

    def update_dossier(self):
        if not self.current_dir:
            print("Error: No project selected")
            return

        # Gather current state and save to dossier.json
        dossier_path = os.path.join(self.current_dir, 'dossier.json')
        with open(dossier_path, 'w') as f:
            json.dump(self.dossier, f, indent=2)

        print("Dossier updated")
```

---

### Phase 2: Monitor Window Processes (Week 1-2)

**Goal**: Launch separate C++ processes for monitor windows

#### 2.1 Monitor Manager

**File**: `repl/monitor_manager.py`

```python
import subprocess
import socket
import time

class MonitorManager:
    def __init__(self):
        self.monitors = {}  # {name: {process, socket, port}}
        self.next_port = 5000

    def open(self, name, width=1920, height=1080):
        if name in self.monitors:
            print(f"Monitor '{name}' already open")
            return

        port = self.next_port
        self.next_port += 1

        # Launch C++ monitor process
        process = subprocess.Popen([
            './renderer/build/monitor_window',
            '--name', name,
            '--width', str(width),
            '--height', str(height),
            '--port', str(port)
        ])

        # Wait for process to initialize
        time.sleep(0.5)

        # Connect to monitor via socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.connect(('localhost', port))

        self.monitors[name] = {
            'process': process,
            'socket': sock,
            'port': port,
            'width': width,
            'height': height
        }

        print(f"Created window '{name}' ({width}x{height})")

    def close(self, name):
        if name not in self.monitors:
            print(f"Monitor '{name}' not open")
            return

        monitor = self.monitors[name]

        # Send close command
        self.send_command(name, 'close')

        # Clean up
        monitor['socket'].close()
        monitor['process'].wait()

        del self.monitors[name]
        print(f"Closed monitor: {name}")

    def close_all(self):
        for name in list(self.monitors.keys()):
            self.close(name)

    def send_command(self, name, command, params=None):
        if name not in self.monitors:
            print(f"Monitor '{name}' not open")
            return

        monitor = self.monitors[name]

        import json
        msg = json.dumps({'command': command, 'params': params or {}})
        monitor['socket'].send((msg + '\n').encode())

    def send_frame(self, name, surface_id):
        """Send IOSurface ID to monitor for rendering"""
        if name not in self.monitors:
            return

        import struct
        monitor = self.monitors[name]
        monitor['socket'].send(struct.pack('I', surface_id))
```

---

### Phase 3: Haskell DSL Interpreter (Week 2-3)

**Goal**: Parse and evaluate DSL code

#### 3.1 Parser (Parsec)

**File**: `interpreter/src/Parser.hs`

```haskell
module Parser (parseProgram, parseStatement) where

import Text.Parsec
import Text.Parsec.String (Parser)
import qualified Text.Parsec.Token as Token
import Text.Parsec.Language (emptyDef)

-- AST Types
data Statement
    = InVar String String          -- in_var name = device
    | OutVar String String         -- out_var name = monitor
    | LayerObj String              -- layer_obj name
    | MathObj String               -- math_obj name
    | Assignment LValue Expression
    | MethodCall String String [Expression]
    deriving (Show)

data LValue = Property String String  -- object.property
    deriving (Show)

data Expression
    = IntLit Int
    | FloatLit Float
    | StringLit String
    | TupleLit (Float, Float)
    | Identifier String
    deriving (Show)

-- Lexer
lexer :: Token.TokenParser ()
lexer = Token.makeTokenParser emptyDef

identifier = Token.identifier lexer
reserved = Token.reserved lexer
symbol = Token.symbol lexer
integer = Token.integer lexer
float = Token.float lexer
stringLiteral = Token.stringLiteral lexer
parens = Token.parens lexer
comma = Token.comma lexer

-- Parser
parseProgram :: String -> Either ParseError [Statement]
parseProgram input = parse (many1 statement <* eof) "" input

parseStatement :: String -> Either ParseError Statement
parseStatement input = parse (statement <* eof) "" input

statement :: Parser Statement
statement = choice
    [ try inVar
    , try outVar
    , try layerObj
    , try mathObj
    , try assignment
    , try methodCall
    ] <* optional (symbol ";")

inVar :: Parser Statement
inVar = do
    reserved "in_var"
    name <- identifier
    symbol "="
    device <- identifier
    return $ InVar name device

outVar :: Parser Statement
outVar = do
    reserved "out_var"
    name <- identifier
    symbol "="
    monitor <- identifier
    return $ OutVar name monitor

layerObj :: Parser Statement
layerObj = do
    reserved "layer_obj"
    name <- identifier
    return $ LayerObj name

assignment :: Parser Statement
assignment = do
    obj <- identifier
    symbol "."
    prop <- identifier
    symbol "="
    expr <- expression
    return $ Assignment (Property obj prop) expr

methodCall :: Parser Statement
methodCall = do
    obj <- identifier
    symbol "."
    method <- identifier
    args <- parens $ expression `sepBy` comma
    return $ MethodCall obj method args

expression :: Parser Expression
expression = choice
    [ try tupleLit
    , try (FloatLit <$> try float)
    , try (IntLit . fromInteger <$> integer)
    , StringLit <$> stringLiteral
    , Identifier <$> identifier
    ]

tupleLit :: Parser Expression
tupleLit = do
    symbol "("
    x <- float
    comma
    y <- float
    symbol ")"
    return $ TupleLit (realToFrac x, realToFrac y)
```

#### 3.2 Evaluator

**File**: `interpreter/src/Evaluator.hs`

```haskell
module Evaluator (execute, evalExpression) where

import Parser
import Environment
import Control.Monad.STM
import Control.Concurrent.STM.TVar

execute :: Statement -> Environment -> IO ()
execute (InVar name device) env = do
    -- Create input variable
    atomically $ modifyTVar (inputs env) (Map.insert name device)
    -- Call C++ FFI to open video device
    putStrLn $ "Created input variable '" ++ name ++ "'"

execute (OutVar name monitor) env = do
    atomically $ modifyTVar (outputs env) (Map.insert name monitor)
    putStrLn $ "Created output variable '" ++ name ++ "'"

execute (LayerObj name) env = do
    atomically $ modifyTVar (layers env) (Map.insert name defaultLayer)
    putStrLn $ "Created layer '" ++ name ++ "'"

execute (Assignment (Property obj prop) expr) env = do
    let value = evalExpression expr env
    -- Update property
    atomically $ modifyLayer obj (\l -> setProperty l prop value)
    putStrLn $ "Set " ++ obj ++ "." ++ prop

execute (MethodCall obj method args) env = do
    -- Execute method
    case method of
        "cast" -> executeCast obj args env
        "project" -> executeProject obj args env
        "transform" -> executeTransform obj args env
        _ -> putStrLn $ "Unknown method: " ++ method

evalExpression :: Expression -> Environment -> Value
evalExpression (IntLit n) _ = VInt n
evalExpression (FloatLit f) _ = VFloat f
evalExpression (StringLit s) _ = VString s
evalExpression (TupleLit (x, y)) _ = VTuple x y
evalExpression (Identifier name) env = lookupVar name env
```

#### 3.3 FFI Exports

**File**: `interpreter/src/FFI.hs`

```haskell
{-# LANGUAGE ForeignFunctionInterface #-}

module FFI where

import Foreign.C.String
import Foreign.C.Types
import Foreign.Ptr
import Parser
import Evaluator
import Environment

-- Initialize environment
foreign export ccall hs_init_environment :: IO (Ptr Environment)

hs_init_environment :: IO (Ptr Environment)
hs_init_environment = do
    env <- createEnvironment
    newStablePtr env >>= return . castStablePtrToPtr

-- Execute DSL code
foreign export ccall hs_execute_code :: CString -> Ptr Environment -> IO CInt

hs_execute_code :: CString -> Ptr Environment -> IO CInt
hs_execute_code cstr envPtr = do
    code <- peekCString cstr
    env <- deRefStablePtr $ castPtrToStablePtr envPtr

    case parseStatement code of
        Left err -> do
            putStrLn $ "Parse error: " ++ show err
            return (-1)
        Right stmt -> do
            execute stmt env
            return 0
```

---

### Phase 4: C++ Metal Renderer (Week 3-4)

**Goal**: Create monitor window with Metal rendering

#### 4.1 Monitor Window (Main Process)

**File**: `renderer/src/monitor_window.mm`

```objective-c++
#import <Cocoa/Cocoa.h>
#import <Metal/Metal.h>
#import <QuartzCore/CAMetalLayer.h>
#include "metal_renderer.h"
#include "ipc_server.h"

@interface MonitorWindow : NSWindow
@end

@implementation MonitorWindow
- (BOOL)canBecomeKeyWindow { return YES; }
- (BOOL)canBecomeMainWindow { return YES; }
@end

int main(int argc, char* argv[]) {
    @autoreleasepool {
        // Parse arguments
        std::string name = "monitor1";
        int width = 1920;
        int height = 1080;
        int port = 5000;

        for (int i = 1; i < argc; i++) {
            if (strcmp(argv[i], "--name") == 0) name = argv[++i];
            if (strcmp(argv[i], "--width") == 0) width = atoi(argv[++i]);
            if (strcmp(argv[i], "--height") == 0) height = atoi(argv[++i]);
            if (strcmp(argv[i], "--port") == 0) port = atoi(argv[++i]);
        }

        // Create window
        NSRect frame = NSMakeRect(100, 100, width, height);
        MonitorWindow* window = [[MonitorWindow alloc]
            initWithContentRect:frame
            styleMask:NSWindowStyleMaskTitled | NSWindowStyleMaskClosable |
                      NSWindowStyleMaskResizable
            backing:NSBackingStoreBuffered
            defer:NO];

        [window setTitle:[NSString stringWithUTF8String:name.c_str()]];

        // Create Metal layer
        CAMetalLayer* metalLayer = [CAMetalLayer layer];
        id<MTLDevice> device = MTLCreateSystemDefaultDevice();
        metalLayer.device = device;
        metalLayer.pixelFormat = MTLPixelFormatBGRA8Unorm;
        metalLayer.framebufferOnly = NO;

        NSView* contentView = [window contentView];
        [contentView setLayer:metalLayer];
        [contentView setWantsLayer:YES];

        // Create renderer
        MetalRenderer renderer(device, metalLayer, width, height);

        // Start IPC server
        IPCServer ipcServer(port, &renderer);
        ipcServer.start();

        // Show window
        [window makeKeyAndOrderFront:nil];

        // Run event loop
        [NSApp run];
    }

    return 0;
}
```

#### 4.2 Metal Renderer

**File**: `renderer/src/metal_renderer.mm`

```objective-c++
class MetalRenderer {
private:
    id<MTLDevice> device;
    id<MTLCommandQueue> commandQueue;
    CAMetalLayer* metalLayer;
    id<MTLRenderPipelineState> pipelineState;

    int baseWidth, baseHeight;
    float aspectRatio;

public:
    MetalRenderer(id<MTLDevice> dev, CAMetalLayer* layer, int w, int h)
        : device(dev), metalLayer(layer), baseWidth(w), baseHeight(h) {

        commandQueue = [device newCommandQueue];
        aspectRatio = (float)w / h;

        createPipeline();
    }

    void createPipeline() {
        id<MTLLibrary> library = [device newDefaultLibrary];
        id<MTLFunction> vertexFunc = [library newFunctionWithName:@"vertex_main"];
        id<MTLFunction> fragmentFunc = [library newFunctionWithName:@"fragment_main"];

        MTLRenderPipelineDescriptor* desc = [MTLRenderPipelineDescriptor new];
        desc.vertexFunction = vertexFunc;
        desc.fragmentFunction = fragmentFunc;
        desc.colorAttachments[0].pixelFormat = MTLPixelFormatBGRA8Unorm;

        NSError* error;
        pipelineState = [device newRenderPipelineStateWithDescriptor:desc error:&error];
    }

    void renderFrame(uint32_t iosurfaceID) {
        // Look up IOSurface
        IOSurfaceRef surface = IOSurfaceLookup(iosurfaceID);
        if (!surface) return;

        // Create texture from IOSurface
        MTLTextureDescriptor* texDesc = [MTLTextureDescriptor
            texture2DDescriptorWithPixelFormat:MTLPixelFormatBGRA8Unorm
            width:IOSurfaceGetWidth(surface)
            height:IOSurfaceGetHeight(surface)
            mipmapped:NO];

        id<MTLTexture> sourceTexture = [device newTextureWithDescriptor:texDesc
                                                              iosurface:surface
                                                                  plane:0];

        // Get drawable
        id<CAMetalDrawable> drawable = [metalLayer nextDrawable];
        if (!drawable) return;

        // Render
        id<MTLCommandBuffer> commandBuffer = [commandQueue commandBuffer];

        MTLRenderPassDescriptor* renderPass = [MTLRenderPassDescriptor new];
        renderPass.colorAttachments[0].texture = drawable.texture;
        renderPass.colorAttachments[0].loadAction = MTLLoadActionClear;
        renderPass.colorAttachments[0].clearColor = MTLClearColorMake(0, 0, 0, 1);

        id<MTLRenderCommandEncoder> encoder =
            [commandBuffer renderCommandEncoderWithDescriptor:renderPass];

        [encoder setRenderPipelineState:pipelineState];
        [encoder setFragmentTexture:sourceTexture atIndex:0];

        // Draw fullscreen quad
        [encoder drawPrimitives:MTLPrimitiveTypeTriangleStrip
                    vertexStart:0
                    vertexCount:4];

        [encoder endEncoding];

        [commandBuffer presentDrawable:drawable];
        [commandBuffer commit];

        CFRelease(surface);
    }
};
```

---

### Phase 5: Zero-Copy Video Pipeline (Week 4-5)

**Goal**: Capture video with zero-copy CVPixelBuffer → IOSurface → MTLTexture

#### 5.1 Video Source

**File**: `renderer/src/video_source.mm`

```objective-c++
@interface VideoSource : NSObject <AVCaptureVideoDataOutputSampleBufferDelegate>
@property (nonatomic, strong) AVCaptureSession* session;
@property (nonatomic, strong) AVCaptureDevice* device;
@property (nonatomic, assign) CVPixelBufferRef latestBuffer;
@property (nonatomic, strong) id<MTLDevice> metalDevice;
@property (nonatomic, assign) CVMetalTextureCacheRef textureCache;
@end

@implementation VideoSource

- (instancetype)initWithDevice:(id<MTLDevice>)device {
    self = [super init];
    _metalDevice = device;

    // Create texture cache
    CVMetalTextureCacheCreate(NULL, NULL, device, NULL, &_textureCache);

    return self;
}

- (BOOL)openDevice:(NSString*)deviceName {
    // Find device
    NSArray* devices = [AVCaptureDevice devicesWithMediaType:AVMediaTypeVideo];
    for (AVCaptureDevice* dev in devices) {
        if ([dev.localizedName isEqualToString:deviceName]) {
            _device = dev;
            break;
        }
    }

    if (!_device) return NO;

    // Create session
    _session = [[AVCaptureSession alloc] init];
    _session.sessionPreset = AVCaptureSessionPreset1920x1080;

    // Add input
    NSError* error;
    AVCaptureDeviceInput* input = [AVCaptureDeviceInput deviceInputWithDevice:_device error:&error];
    [_session addInput:input];

    // Add output
    AVCaptureVideoDataOutput* output = [[AVCaptureVideoDataOutput alloc] init];
    output.videoSettings = @{
        (id)kCVPixelBufferPixelFormatTypeKey: @(kCVPixelFormatType_32BGRA)
    };

    dispatch_queue_t queue = dispatch_queue_create("video_queue", DISPATCH_QUEUE_SERIAL);
    [output setSampleBufferDelegate:self queue:queue];

    [_session addOutput:output];
    [_session startRunning];

    return YES;
}

- (void)captureOutput:(AVCaptureOutput*)output
didOutputSampleBuffer:(CMSampleBufferRef)sampleBuffer
       fromConnection:(AVCaptureConnection*)connection {

    CVPixelBufferRef pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer);
    CVPixelBufferRetain(pixelBuffer);

    if (_latestBuffer) {
        CVPixelBufferRelease(_latestBuffer);
    }

    _latestBuffer = pixelBuffer;
}

- (id<MTLTexture>)getTexture {
    if (!_latestBuffer) return nil;

    // Create Metal texture from CVPixelBuffer (zero-copy via IOSurface)
    CVMetalTextureRef metalTextureRef;
    CVMetalTextureCacheCreateTextureFromImage(
        NULL,
        _textureCache,
        _latestBuffer,
        NULL,
        MTLPixelFormatBGRA8Unorm,
        CVPixelBufferGetWidth(_latestBuffer),
        CVPixelBufferGetHeight(_latestBuffer),
        0,
        &metalTextureRef
    );

    id<MTLTexture> texture = CVMetalTextureGetTexture(metalTextureRef);
    CFRelease(metalTextureRef);

    return texture;
}

@end
```

---

### Phase 6: Filter Pipeline System (Week 5-6)

**Goal**: Implement composable image processing filters with `buffer_obj` and filter primitives

#### 6.1 Add buffer_obj to DSL

**File**: `interpreter/src/Parser.hs`

Add buffer_obj to AST:
```haskell
data Statement
    = InVar String String
    | OutVar String String
    | LayerObj String
    | MathObj String
    | BufferObj String        -- NEW
    | Assignment LValue Expression
    | MethodCall String String [Expression]
```

Parse buffer_obj:
```haskell
bufferObj :: Parser Statement
bufferObj = do
    reserved "buffer_obj"
    name <- identifier
    return $ BufferObj name
```

#### 6.2 Buffer Properties

**File**: `interpreter/src/Evaluator.hs`

```haskell
data Buffer = Buffer {
    bufferWidth :: Int,
    bufferHeight :: Int,
    bufferFormat :: PixelFormat
}

data PixelFormat = RGBA8 | R8 | RG16F | RGBA16F

execute (BufferObj name) env = do
    let buffer = Buffer 0 0 RGBA8  -- Default
    atomically $ modifyTVar (buffers env) (Map.insert name buffer)
    putStrLn $ "Created buffer '" ++ name ++ "'"

-- Handle buffer.canvas assignment
execute (Assignment (Property obj "canvas") (TupleLit (w, h))) env = do
    atomically $ modifyBuffer obj (\b -> b { bufferWidth = w, bufferHeight = h })

-- Handle buffer.format assignment
execute (Assignment (Property obj "format") (StringLit fmt)) env = do
    let format = parseFormat fmt  -- "rgba8" -> RGBA8, etc.
    atomically $ modifyBuffer obj (\b -> b { bufferFormat = format })
```

#### 6.3 Filter Primitives (C++)

**File**: `renderer/src/filter_pipeline.mm`

```objective-c++
class FilterPipeline {
private:
    id<MTLDevice> device;
    id<MTLCommandQueue> commandQueue;

    // Shader cache
    map<string, id<MTLComputePipelineState>> computeShaders;
    map<string, id<MTLRenderPipelineState>> fragmentShaders;

    // Temp texture pool
    vector<id<MTLTexture>> tempTexturePool;

public:
    FilterPipeline(id<MTLDevice> dev) : device(dev) {
        commandQueue = [device newCommandQueue];
        loadShaders();
    }

    void loadShaders() {
        id<MTLLibrary> library = [device newDefaultLibrary];

        // Load compute shaders
        id<MTLFunction> kuwaharaFunc = [library newFunctionWithName:@"kuwahara_filter"];
        computeShaders["kuwahara"] = [device newComputePipelineStateWithFunction:kuwaharaFunc error:nil];

        id<MTLFunction> gaussianFunc = [library newFunctionWithName:@"gaussian_blur"];
        computeShaders["gaussian"] = [device newComputePipelineStateWithFunction:gaussianFunc error:nil];

        // Load fragment shaders
        // ... (sobel, ascii, etc.)
    }

    void applySobel(id<MTLTexture> input, id<MTLTexture> output, float threshold) {
        id<MTLCommandBuffer> commandBuffer = [commandQueue commandBuffer];

        MTLRenderPassDescriptor* renderPass = [MTLRenderPassDescriptor new];
        renderPass.colorAttachments[0].texture = output;
        renderPass.colorAttachments[0].loadAction = MTLLoadActionClear;

        id<MTLRenderCommandEncoder> encoder = [commandBuffer renderCommandEncoderWithDescriptor:renderPass];
        [encoder setRenderPipelineState:fragmentShaders["sobel"]];
        [encoder setFragmentTexture:input atIndex:0];
        [encoder setFragmentBytes:&threshold length:sizeof(float) atIndex:0];
        [encoder drawPrimitives:MTLPrimitiveTypeTriangleStrip vertexStart:0 vertexCount:4];
        [encoder endEncoding];

        [commandBuffer commit];
        [commandBuffer waitUntilCompleted];
    }

    void applyKuwahara(id<MTLTexture> input, id<MTLTexture> output, int kernelSize) {
        id<MTLCommandBuffer> commandBuffer = [commandQueue commandBuffer];
        id<MTLComputeCommandEncoder> encoder = [commandBuffer computeCommandEncoder];

        [encoder setComputePipelineState:computeShaders["kuwahara"]];
        [encoder setTexture:input atIndex:0];
        [encoder setTexture:output atIndex:1];
        [encoder setBytes:&kernelSize length:sizeof(int) atIndex:0];

        MTLSize threadgroupSize = MTLSizeMake(16, 16, 1);
        MTLSize threadgroups = MTLSizeMake(
            (input.width + 15) / 16,
            (input.height + 15) / 16,
            1
        );

        [encoder dispatchThreadgroups:threadgroups threadsPerThreadgroup:threadgroupSize];
        [encoder endEncoding];

        [commandBuffer commit];
        [commandBuffer waitUntilCompleted];
    }

    // Similarly for gaussian, dog, multiply, add, etc.
};
```

#### 6.4 Metal Shaders

**File**: `renderer/shaders/filters.metal`

```metal
#include <metal_stdlib>
using namespace metal;

// Sobel edge detection (fragment shader)
fragment float4 sobel_filter(
    VertexOut in [[stage_in]],
    texture2d<float> input [[texture(0)]],
    constant float& threshold [[buffer(0)]]
) {
    constexpr sampler s(coord::normalized, address::clamp_to_edge, filter::nearest);

    float2 texelSize = 1.0 / float2(input.get_width(), input.get_height());

    // Sobel kernels
    const float3x3 gx = float3x3(-1, 0, 1, -2, 0, 2, -1, 0, 1);
    const float3x3 gy = float3x3(1, 2, 1, 0, 0, 0, -1, -2, -1);

    float sum_x = 0.0, sum_y = 0.0;

    for (int i = -1; i <= 1; i++) {
        for (int j = -1; j <= 1; j++) {
            float2 offset = float2(i, j) * texelSize;
            float4 sample = input.sample(s, in.texCoord + offset);
            float gray = dot(sample.rgb, float3(0.299, 0.587, 0.114));

            sum_x += gray * gx[i+1][j+1];
            sum_y += gray * gy[i+1][j+1];
        }
    }

    float magnitude = sqrt(sum_x * sum_x + sum_y * sum_y);
    return magnitude > threshold ? float4(1) : float4(0);
}

// Kuwahara filter (compute shader)
kernel void kuwahara_filter(
    texture2d<float, access::read> input [[texture(0)]],
    texture2d<float, access::write> output [[texture(1)]],
    constant int& kernel_size [[buffer(0)]],
    uint2 gid [[thread_position_in_grid]]
) {
    if (gid.x >= output.get_width() || gid.y >= output.get_height()) return;

    int radius = kernel_size / 2;
    float min_variance = INFINITY;
    float4 best_color = float4(0);

    // Check 4 quadrants
    for (int quad = 0; quad < 4; quad++) {
        float4 sum = float4(0);
        float4 sum_sq = float4(0);
        int count = 0;

        // Determine quadrant offset
        int dx = (quad & 1) ? 1 : -1;
        int dy = (quad & 2) ? 1 : -1;

        for (int i = 0; i <= radius; i++) {
            for (int j = 0; j <= radius; j++) {
                int2 pos = int2(gid) + int2(i * dx, j * dy);
                if (pos.x >= 0 && pos.x < input.get_width() &&
                    pos.y >= 0 && pos.y < input.get_height()) {

                    float4 pixel = input.read(uint2(pos));
                    sum += pixel;
                    sum_sq += pixel * pixel;
                    count++;
                }
            }
        }

        float4 mean = sum / float(count);
        float4 variance = (sum_sq / float(count)) - (mean * mean);
        float total_variance = variance.r + variance.g + variance.b;

        if (total_variance < min_variance) {
            min_variance = total_variance;
            best_color = mean;
        }
    }

    output.write(best_color, gid);
}

// Difference of Gaussians (compute shader)
kernel void dog_filter(
    texture2d<float, access::read> input [[texture(0)]],
    texture2d<float, access::write> output [[texture(1)]],
    constant float& sigma1 [[buffer(0)]],
    constant float& sigma2 [[buffer(1)]],
    uint2 gid [[thread_position_in_grid]]
) {
    // Apply two Gaussian blurs and subtract
    // (Simplified - actual implementation would be separable)
}
```

#### 6.5 FFI Integration

**File**: `interpreter/src/FFI.hs`

```haskell
-- Export filter operations
foreign export ccall hs_apply_sobel ::
    Ptr CUChar -> Ptr CUChar -> CInt -> CInt -> CFloat -> IO ()

hs_apply_sobel inputPtr outputPtr width height threshold = do
    -- Call C++ FilterPipeline::applySobel via FFI
```

**File**: `renderer/src/filter_bridge.cpp`

```cpp
extern "C" {
    void hs_apply_sobel(unsigned char* input, unsigned char* output,
                       int width, int height, float threshold);
}

// Implementation bridges to FilterPipeline
```

### Phase 7-10: Additional Features

See detailed sections in ARCHITECTURE.md for:
- **Phase 7**: Mathematical rendering (LaTeX, parametric surfaces)
- **Phase 8**: Layer compositing and transforms
- **Phase 9**: Timeline and keyframe system
- **Phase 10**: Asset management and dossier

---

## Testing Strategy

### Unit Tests

**Python**:
```python
# tests/test_command_parser.py
import unittest
from repl.command_parser import CommandParser

class TestCommandParser(unittest.TestCase):
    def setUp(self):
        self.parser = CommandParser()

    def test_parse_select_composition(self):
        cmd_type, args = self.parser.parse("select_composition my_project/")
        self.assertEqual(cmd_type, 'select_composition')
        self.assertEqual(args['directory'], 'my_project/')
```

**Haskell**:
```haskell
-- tests/ParserSpec.hs
import Test.Hspec
import Parser

spec :: Spec
spec = do
    describe "parseStatement" $ do
        it "parses in_var" $ do
            parseStatement "in_var camera = webcam"
                `shouldBe` Right (InVar "camera" "webcam")
```

### Integration Tests

Test critical paths:
1. REPL → Haskell → C++ object creation
2. Video pipeline: Device → Texture → Render
3. IPC: REPL → Monitor (frame transfer)

---

## Common Pitfalls

### 1. IOSurface Lifecycle

**Problem**: IOSurface released before monitor accesses it

**Solution**: Retain surface until monitor confirms rendering:
```objective-c
CFRetain(surface);  // Before sending ID
// ... send ID ...
CFRelease(surface); // After monitor signals done
```

### 2. Metal Context Per Process

**Problem**: Multiple processes can't share one Metal device

**Solution**: Each monitor creates its own `MTLDevice`

### 3. Aspect Ratio Calculation

**Problem**: Integer division loses precision

**Solution**: Use float arithmetic:
```cpp
float aspect = (float)width / height;  // NOT: int/int
```

### 4. Haskell FFI Memory

**Problem**: Haskell GC moves objects, invalidating C++ pointers

**Solution**: Use `StablePtr`:
```haskell
foreign export ccall hs_create_layer :: IO (StablePtr Layer)
```

---

## Performance Optimization

### Profiling Tools

- **Instruments** (macOS): Time Profiler, Metal System Trace
- **Haskell**: `-prof -fprof-auto` flags
- **Python**: `cProfile` module

### Optimization Strategies

1. **Zero-Copy**: Use IOSurface everywhere
2. **Lazy Evaluation**: Let Haskell defer computation
3. **GPU Acceleration**: Metal for all compositing
4. **Process Isolation**: No lock contention
5. **Command Batching**: Send multiple commands per socket write

### Target Metrics

| Metric | Target |
|--------|--------|
| Frame Rate | 60fps |
| Latency | <16ms |
| CPU Usage | <30% |
| Memory | <500MB |

---

This implementation guide provides the foundation for building Haeccstable. Refer to ARCHITECTURE.md for system design and API_REFERENCE.md for DSL specification.
