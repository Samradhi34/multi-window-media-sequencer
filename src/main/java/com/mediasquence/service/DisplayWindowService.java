package com.mediasquence.service;

import com.mediasquence.dto.request.AddMediaRequest;
import com.mediasquence.dto.request.CreateWindowRequest;
import com.mediasquence.dto.response.WindowPlaybackResponse;
import com.mediasquence.entity.DisplayWindow;

import java.util.List;

public interface DisplayWindowService {
    List<DisplayWindow> getAllWindows();
    DisplayWindow getWindowById(Long windowId);
    DisplayWindow createWindow(CreateWindowRequest request);
    void deleteWindow(Long windowId);
    WindowPlaybackResponse getWindowPlaybackStatus(Long windowId);
    List<WindowPlaybackResponse> getAllWindowsPlaybackStatus();
    WindowPlaybackResponse addMediaToWindow(Long windowId, AddMediaRequest request);
    WindowPlaybackResponse removeMediaFromWindow(Long windowId, Long mediaId);
    WindowPlaybackResponse movePlaylistItem(Long windowId, Long mediaId, String direction);
}
