package com.mediasquence.service.implementation;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mediasquence.dto.request.SyncTriggerRequest;
import com.mediasquence.dto.response.SyncStatusResponse;
import com.mediasquence.entity.MediaItem;
import com.mediasquence.entity.SyncState;
import com.mediasquence.exception.ResourceNotFoundException;
import com.mediasquence.repository.MediaItemRepository;
import com.mediasquence.repository.SyncStateRepository;
import com.mediasquence.service.SyncService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Throwable.class)
public class SyncServiceImpl implements SyncService {

    private final SyncStateRepository syncStateRepository;
    private final MediaItemRepository mediaItemRepository;

    @Override
    public SyncStatusResponse getCurrentSyncStatus() {
        SyncState syncState = syncStateRepository.findTopByOrderByIdDesc().orElse(null);

        if (syncState == null || !Boolean.TRUE.equals(syncState.getIsActive())) {
            return SyncStatusResponse.builder()
                    .isActive(false)
                    .activeMediaItem(null)
                    .startTimeMs(null)
                    .durationSeconds(0)
                    .remainingSeconds(0)
                    .serverTimeMs(System.currentTimeMillis())
                    .build();
        }

        long currentTimeMs = System.currentTimeMillis();
        long elapsedMs = currentTimeMs - syncState.getStartTimeMs();
        long durationMs = (long) syncState.getDurationSeconds() * 1000;

        if (elapsedMs >= durationMs) {
            log.debug("Global sync broadcast duration of {}s expired. Reverting windows to normal playlist playback.",
                    syncState.getDurationSeconds());
            return SyncStatusResponse.builder()
                    .isActive(false)
                    .activeMediaItem(null)
                    .startTimeMs(syncState.getStartTimeMs())
                    .durationSeconds(syncState.getDurationSeconds())
                    .remainingSeconds(0)
                    .serverTimeMs(System.currentTimeMillis())
                    .build();
        }

        int remainingSec = (int) Math.ceil((durationMs - elapsedMs) / 1000.0);
        log.debug("Global sync active for media ID: {}. Remaining seconds: {}s",
                syncState.getActiveMediaItem().getId(), remainingSec);

        return SyncStatusResponse.builder()
                .isActive(true)
                .activeMediaItem(syncState.getActiveMediaItem())
                .startTimeMs(syncState.getStartTimeMs())
                .durationSeconds(syncState.getDurationSeconds())
                .remainingSeconds(remainingSec)
                .serverTimeMs(System.currentTimeMillis())
                .build();
    }

    @Override
    @Transactional
    public SyncStatusResponse triggerSync(SyncTriggerRequest request) {
        MediaItem mediaItem = mediaItemRepository.findById(request.getMediaId())
                .orElseThrow(() -> {
                    log.warn("Media item ID: {} not found when triggering global sync", request.getMediaId());
                    return new ResourceNotFoundException("Media item not found with id: " + request.getMediaId());
                });

        SyncState syncState = new SyncState(
                mediaItem,
                System.currentTimeMillis(),
                request.getDurationSeconds(),
                true
        );

        SyncState savedState = syncStateRepository.save(syncState);
        log.info("Triggered global sync for media ID: {} ('{}') for duration: {}s across all display windows",
                mediaItem.getId(), mediaItem.getTitle(), request.getDurationSeconds());

        return SyncStatusResponse.builder()
                .isActive(true)
                .activeMediaItem(savedState.getActiveMediaItem())
                .startTimeMs(savedState.getStartTimeMs())
                .durationSeconds(savedState.getDurationSeconds())
                .remainingSeconds(savedState.getDurationSeconds())
                .serverTimeMs(System.currentTimeMillis())
                .build();
    }

    @Override
    @Transactional
    public void cancelSync() {
        SyncState syncState = syncStateRepository.findTopByOrderByIdDesc().orElse(null);
        if (syncState != null && Boolean.TRUE.equals(syncState.getIsActive())) {
            syncState.setIsActive(false);
            syncStateRepository.save(syncState);
            log.info("Cancelled active global sync broadcast");
        } else {
            log.debug("Cancel sync invoked but no active sync was running");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public SyncState getRawSyncState() {
        return syncStateRepository.findTopByOrderByIdDesc().orElse(null);
    }
}
