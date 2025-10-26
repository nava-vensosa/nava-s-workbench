/*
 * Haeccstable Metal Shaders
 * Simple video passthrough for MVP
 */

#include <metal_stdlib>
using namespace metal;

// Vertex output / fragment input
struct VertexOut {
    float4 position [[position]];
    float2 texCoord;
};

// Vertex shader - creates fullscreen quad
vertex VertexOut vertex_main(uint vertexID [[vertex_id]]) {
    // Create a fullscreen quad using 6 vertices (2 triangles)
    // Vertices: (0,0), (1,0), (1,1), (0,0), (1,1), (0,1)

    float2 positions[6] = {
        float2(-1.0, -1.0),  // Bottom-left
        float2( 1.0, -1.0),  // Bottom-right
        float2( 1.0,  1.0),  // Top-right
        float2(-1.0, -1.0),  // Bottom-left
        float2( 1.0,  1.0),  // Top-right
        float2(-1.0,  1.0)   // Top-left
    };

    float2 texCoords[6] = {
        float2(0.0, 1.0),  // Bottom-left (flipped for Metal)
        float2(1.0, 1.0),  // Bottom-right
        float2(1.0, 0.0),  // Top-right
        float2(0.0, 1.0),  // Bottom-left
        float2(1.0, 0.0),  // Top-right
        float2(0.0, 0.0)   // Top-left
    };

    VertexOut out;
    out.position = float4(positions[vertexID], 0.0, 1.0);
    out.texCoord = texCoords[vertexID];

    return out;
}

// Fragment shader - samples video texture
fragment float4 fragment_main(VertexOut in [[stage_in]],
                               texture2d<float> videoTexture [[texture(0)]]) {

    constexpr sampler textureSampler(mag_filter::linear, min_filter::linear);

    // Sample the video texture
    float4 color = videoTexture.sample(textureSampler, in.texCoord);

    return color;
}
