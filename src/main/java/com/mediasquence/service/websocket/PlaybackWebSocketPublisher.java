package com.mediasquence.service.websocket;

import com.mediasquence.dto.response.SyncStatusResponse;
import com.mediasquence.dto.response.WindowPlaybackResponse;
import com.mediasquence.service.DisplayWindowService;
import com.mediasquence.service.SyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class PlaybackWebSocketPublisher {

    private final SimpMessagingTemplate messagingTemplate;
    private final DisplayWindowService displayWindowService;
    private final SyncService syncService;

    @Scheduled(fixedRate = 1000)
    public void broadcastPlaybackStatus() {
        try {
            List<WindowPlaybackResponse> statuses = displayWindowService.getAllWindowsPlaybackStatus();
            messagingTemplate.convertAndSend("/topic/playback", statuses);

            SyncStatusResponse syncStatus = syncService.getCurrentSyncStatus();
            if (syncStatus != null && syncStatus.isActive()) {
                messagingTemplate.convertAndSend("/topic/sync", syncStatus);
            }
        } catch (Exception e) {
            log.debug("WebSocket broadcast skipped: {}", e.getMessage());
        }
    }

    public void broadcastInstantUpdate() {
        try {
            List<WindowPlaybackResponse> statuses = displayWindowService.getAllWindowsPlaybackStatus();
            messagingTemplate.convertAndSend("/topic/playback", statuses);
            SyncStatusResponse syncStatus = syncService.getCurrentSyncStatus();
            messagingTemplate.convertAndSend("/topic/sync", syncStatus);
        } catch (Exception e) {
            log.debug("WebSocket instant broadcast failed: {}", e.getMessage());
        }
    }
}
