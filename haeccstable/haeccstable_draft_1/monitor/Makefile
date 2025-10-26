# Haeccstable Monitor Makefile
# Compiles C++/Objective-C++ monitor window with Metal

CXX = clang++
CXXFLAGS = -std=c++17 -Wall -Wextra -ObjC++ -fobjc-arc
FRAMEWORKS = -framework Cocoa -framework Metal -framework MetalKit -framework AVFoundation -framework CoreVideo -framework CoreMedia

TARGET = haeccstable_monitor
SOURCES = main.mm monitor_window.mm video_capture.mm
OBJECTS = $(SOURCES:.mm=.o)

# Shader compilation
METAL_COMPILER = xcrun -sdk macosx metal
METAL_LINKER = xcrun -sdk macosx metallib
SHADER_SOURCE = shaders.metal
SHADER_AIR = shaders.air
SHADER_LIB = default.metallib

all: $(TARGET) $(SHADER_LIB)

$(TARGET): $(OBJECTS)
	$(CXX) $(CXXFLAGS) -o $@ $^ $(FRAMEWORKS)

%.o: %.mm
	$(CXX) $(CXXFLAGS) -c $< -o $@

# Compile Metal shaders
$(SHADER_AIR): $(SHADER_SOURCE)
	$(METAL_COMPILER) -c $< -o $@

$(SHADER_LIB): $(SHADER_AIR)
	$(METAL_LINKER) $< -o $@

clean:
	rm -f $(TARGET) $(OBJECTS) $(SHADER_AIR) $(SHADER_LIB)

.PHONY: all clean
