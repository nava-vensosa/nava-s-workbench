#include "gui/ViewPanel.h"
#include "core/Scene.h"
#include "renderer/Renderer.h"

#include <imgui.h>
#include <stdexcept>

ViewPanel::ViewPanel(const glm::ivec4& viewport, Scene* scene)
    : scene_(scene)
    , viewport_(viewport)
    , framebuffer_(0)
    , texture_(0)
    , renderbuffer_(0)
    , is_playing_(true)
    , is_focused_(false)
{
    initFramebuffer();
}

ViewPanel::~ViewPanel() {
    if (framebuffer_) {
        glDeleteFramebuffers(1, &framebuffer_);
    }
    if (texture_) {
        glDeleteTextures(1, &texture_);
    }
    if (renderbuffer_) {
        glDeleteRenderbuffers(1, &renderbuffer_);
    }
}

void ViewPanel::initFramebuffer() {
    // Create framebuffer
    glGenFramebuffers(1, &framebuffer_);
    glBindFramebuffer(GL_FRAMEBUFFER, framebuffer_);

    // Create texture
    glGenTextures(1, &texture_);
    glBindTexture(GL_TEXTURE_2D, texture_);
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, viewport_.z, viewport_.w, 0, GL_RGB, GL_UNSIGNED_BYTE, nullptr);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, texture_, 0);

    // Create renderbuffer for depth/stencil
    glGenRenderbuffers(1, &renderbuffer_);
    glBindRenderbuffer(GL_RENDERBUFFER, renderbuffer_);
    glRenderbufferStorage(GL_RENDERBUFFER, GL_DEPTH24_STENCIL8, viewport_.z, viewport_.w);
    glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_STENCIL_ATTACHMENT, GL_RENDERBUFFER, renderbuffer_);

    // Check framebuffer completeness
    if (glCheckFramebufferStatus(GL_FRAMEBUFFER) != GL_FRAMEBUFFER_COMPLETE) {
        throw std::runtime_error("Framebuffer is not complete");
    }

    glBindFramebuffer(GL_FRAMEBUFFER, 0);
}

void ViewPanel::update(float dt) {
    // Update logic
}

void ViewPanel::render(Renderer& renderer) {
    // Render scene to framebuffer
    glBindFramebuffer(GL_FRAMEBUFFER, framebuffer_);
    glViewport(0, 0, viewport_.z, viewport_.w);

    scene_->render(renderer);

    glBindFramebuffer(GL_FRAMEBUFFER, 0);

    // Display framebuffer texture in ImGui window
    ImGui::SetNextWindowPos(ImVec2(viewport_.x, viewport_.y), ImGuiCond_Always);
    ImGui::SetNextWindowSize(ImVec2(viewport_.z, viewport_.w), ImGuiCond_Always);

    ImGuiWindowFlags flags = ImGuiWindowFlags_NoTitleBar |
                            ImGuiWindowFlags_NoResize |
                            ImGuiWindowFlags_NoMove |
                            ImGuiWindowFlags_NoCollapse;

    // Set border color based on focus
    if (is_focused_) {
        ImGui::PushStyleColor(ImGuiCol_Border, ImVec4(0.2f, 0.6f, 1.0f, 1.0f));  // Blue border when focused
        ImGui::PushStyleVar(ImGuiStyleVar_WindowBorderSize, 3.0f);
    } else {
        ImGui::PushStyleVar(ImGuiStyleVar_WindowBorderSize, 1.0f);
    }

    ImGui::Begin("View Panel", nullptr, flags);
    ImGui::Image((void*)(intptr_t)texture_, ImVec2(viewport_.z, viewport_.w), ImVec2(0, 1), ImVec2(1, 0));
    ImGui::End();

    ImGui::PopStyleVar();
    if (is_focused_) {
        ImGui::PopStyleColor();
    }
}

void ViewPanel::handleInput(int key, int action, int mods) {
    // TODO: Handle input (play/pause, etc.)
}

void ViewPanel::setViewport(const glm::ivec4& viewport) {
    viewport_ = viewport;
    // TODO: Recreate framebuffer with new size
}
