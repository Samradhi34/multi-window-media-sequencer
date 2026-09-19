package com.mediasquence.service.implementation;

import com.mediasquence.dto.request.AddMediaRequest;
import com.mediasquence.dto.response.SyncStatusResponse;
import com.mediasquence.dto.response.WindowPlaybackResponse;
import com.mediasquence.entity.DisplayWindow;
import com.mediasquence.entity.MediaItem;
import com.mediasquence.entity.PlaylistItem;
import com.mediasquence.exception.ResourceNotFoundException;
import com.mediasquence.repository.DisplayWindowRepository;
import com.mediasquence.repository.MediaItemRepository;
import com.mediasquence.repository.PlaylistItemRepository;
import com.mediasquence.service.DisplayWindowService;
import com.mediasquence.service.SyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Throwable.class)
public class DisplayWindowServiceImpl implements DisplayWindowService {

    private static final int FIVE_HOURS_IN_SECONDS = 5 * 3600; // 18,000 seconds
    private static final int MAX_PLAYLIST_ITEMS = 50;

    private final DisplayWindowRepository displayWindowRepository;
    private final MediaItemRepository mediaItemRepository;
    private final PlaylistItemRepository playlistItemRepository;
    private final SyncService syncService;

    @jakarta.persistence.PersistenceContext
    private jakarta.persistence.EntityManager entityManager;

    @Override
    public List<DisplayWindow> getAllWindows() {
        log.debug("Fetching all display windows with playlist items from database");
        return displayWindowRepository.findAllWithPlaylistItems();
    }

    @Override
    public DisplayWindow getWindowById(Long windowId) {
        if (windowId == null || windowId <= 0) {
            log.warn("Invalid window ID passed to getWindowById: {}", windowId);
            throw new IllegalArgumentException("Invalid window ID provided: " + windowId);
        }
        return displayWindowRepository.findByIdWithPlaylistItems(windowId)
                .orElseGet(() -> displayWindowRepository.findById(windowId)
                        .orElseThrow(() -> {
                            log.warn("Display window not found with ID: {}", windowId);
                            return new ResourceNotFoundException("Display window not found with id: " + windowId);
                        }));
    }

    @Override
    public DisplayWindow createWindow(com.mediasquence.dto.request.CreateWindowRequest request) {
        if (request == null || !org.springframework.util.StringUtils.hasText(request.getName())) {
            throw new IllegalArgumentException("Display window name is required");
        }

        String name = request.getName().trim();
        if (displayWindowRepository.findByName(name).isPresent()) {
            throw new IllegalArgumentException("Display window with name '" + name + "' already exists");
        }

        DisplayWindow window = new DisplayWindow(name, request.getDescription());
        DisplayWindow saved = displayWindowRepository.save(window);
        log.info("Successfully created new display window ID: {} ('{}')", saved.getId(), saved.getName());
        return saved;
    }

    @Override
    @Transactional
    public void deleteWindow(Long windowId) {
        DisplayWindow window = getWindowById(windowId);
        playlistItemRepository.deleteByDisplayWindowId(window.getId());
        displayWindowRepository.delete(window);
        displayWindowRepository.flush();
        if (entityManager != null) {
            entityManager.clear();
        }
        log.info("Successfully deleted display window ID: {} ('{}')", window.getId(), window.getName());
    }

    @Override
    public WindowPlaybackResponse getWindowPlaybackStatus(Long windowId) {
        DisplayWindow window = getWindowById(windowId);
        SyncStatusResponse syncStatus = syncService.getCurrentSyncStatus();

        if (syncStatus.isActive()) {
            log.debug("Global sync is active. Returning sync media override for window ID: {}", windowId);
            MediaItem syncMedia = syncStatus.getActiveMediaItem();
            if (syncMedia != null) {
                MediaItem overrideMedia = new MediaItem(
                        syncMedia.getTitle(),
                        syncMedia.getMediaType(),
                        syncMedia.getUrl(),
                        syncStatus.getDurationSeconds()
                );
                overrideMedia.setId(syncMedia.getId());
                syncMedia = overrideMedia;
            }
            return WindowPlaybackResponse.builder()
                    .windowId(window.getId())
                    .windowName(window.getName())
                    .windowDescription(window.getDescription())
                    .activeMediaItem(sanitizeMediaItem(syncMedia))
                    .elapsedSecondsInMedia(syncStatus.getDurationSeconds() - syncStatus.getRemainingSeconds())
                    .remainingSecondsInMedia(syncStatus.getRemainingSeconds())
                    .playlist(sanitizePlaylist(window.getPlaylistItems()))
                    .totalPlaylistDurationSeconds(calculateTotalDuration(window.getPlaylistItems()))
                    .isSyncActive(true)
                    .serverTimeMs(System.currentTimeMillis())
                    .build();
        }

        List<PlaylistItem> playlist = window.getPlaylistItems();
        if (playlist == null || playlist.isEmpty()) {
            log.debug("Window ID: {} playlist is empty. Returning blank fallback media.", windowId);
            MediaItem fallbackBlank = MediaItem.createBlankItem("Empty Playlist Fallback", 300);
            return WindowPlaybackResponse.builder()
                    .windowId(window.getId())
                    .windowName(window.getName())
                    .windowDescription(window.getDescription())
                    .activeMediaItem(fallbackBlank)
                    .elapsedSecondsInMedia(0)
                    .remainingSecondsInMedia(300)
                    .playlist(playlist)
                    .totalPlaylistDurationSeconds(0)
                    .isSyncActive(false)
                    .serverTimeMs(System.currentTimeMillis())
                    .build();
        }

        int totalPlaylistDuration = calculateTotalDuration(playlist);
        if (totalPlaylistDuration <= 0) {
            log.debug("Window ID: {} playlist total duration is 0. Returning blank fallback media.", windowId);
            MediaItem fallbackBlank = MediaItem.createBlankItem("Empty Playlist Fallback", 300);
            return WindowPlaybackResponse.builder()
                    .windowId(window.getId())
                    .windowName(window.getName())
                    .windowDescription(window.getDescription())
                    .activeMediaItem(fallbackBlank)
                    .elapsedSecondsInMedia(0)
                    .remainingSecondsInMedia(300)
                    .playlist(playlist)
                    .totalPlaylistDurationSeconds(0)
                    .isSyncActive(false)
                    .serverTimeMs(System.currentTimeMillis())
                    .build();
        }

        long currentTimeSeconds = System.currentTimeMillis() / 1000;
        
        long cycleTimeSeconds = currentTimeSeconds % FIVE_HOURS_IN_SECONDS;
        int playlistOffsetSeconds = (int) (cycleTimeSeconds % totalPlaylistDuration);

        log.debug("Window ID: {} -> Total playlist duration: {}s, Current 5-hr cycle offset: {}s, Playlist loop offset: {}s",
                windowId, totalPlaylistDuration, cycleTimeSeconds, playlistOffsetSeconds);

        int accumulatedSeconds = 0;
        MediaItem activeMedia = null;
        int elapsedInItem = 0;
        int remainingInItem = 0;

        for (PlaylistItem item : playlist) {
            MediaItem media = item.getMediaItem();
            int itemDuration = media.getDurationSeconds();

            if (accumulatedSeconds + itemDuration > playlistOffsetSeconds) {
                activeMedia = media;
                elapsedInItem = playlistOffsetSeconds - accumulatedSeconds;
                remainingInItem = itemDuration - elapsedInItem;
                break;
            }
            accumulatedSeconds += itemDuration;
        }

        if (activeMedia == null) {
            PlaylistItem lastItem = playlist.get(playlist.size() - 1);
            activeMedia = lastItem.getMediaItem();
            elapsedInItem = 0;
            remainingInItem = activeMedia.getDurationSeconds();
        }

        return WindowPlaybackResponse.builder()
                .windowId(window.getId())
                .windowName(window.getName())
                .windowDescription(window.getDescription())
                .activeMediaItem(sanitizeMediaItem(activeMedia))
                .elapsedSecondsInMedia(elapsedInItem)
                .remainingSecondsInMedia(remainingInItem)
                .playlist(sanitizePlaylist(playlist))
                .totalPlaylistDurationSeconds(totalPlaylistDuration)
                .isSyncActive(false)
                .serverTimeMs(System.currentTimeMillis())
                .build();
    }

    private MediaItem sanitizeMediaItem(MediaItem originalMedia) {
        if (originalMedia == null) return null;
        if (originalMedia.getUrl() != null && originalMedia.getUrl().length() > 500) {
            MediaItem sanitized = new MediaItem(
                    originalMedia.getTitle(),
                    originalMedia.getMediaType(),
                    null,
                    originalMedia.getDurationSeconds()
            );
            sanitized.setId(originalMedia.getId());
            return sanitized;
        }
        return originalMedia;
    }

    private List<PlaylistItem> sanitizePlaylist(List<PlaylistItem> playlistItems) {
        if (playlistItems == null) return java.util.Collections.emptyList();
        return playlistItems.stream().map(item -> {
            MediaItem originalMedia = item.getMediaItem();
            MediaItem sanitizedMedia = originalMedia;
            if (originalMedia != null && originalMedia.getUrl() != null && originalMedia.getUrl().length() > 500) {
                sanitizedMedia = new MediaItem(
                        originalMedia.getTitle(),
                        originalMedia.getMediaType(),
                        null,
                        originalMedia.getDurationSeconds()
                );
                sanitizedMedia.setId(originalMedia.getId());
            }
            PlaylistItem sanitizedItem = new PlaylistItem(item.getDisplayWindow(), sanitizedMedia, item.getSequenceOrder());
            sanitizedItem.setId(item.getId());
            return sanitizedItem;
        }).collect(Collectors.toList());
    }

    @Override
    public List<WindowPlaybackResponse> getAllWindowsPlaybackStatus() {
        log.debug("Calculating continuous playback status for all display windows");
        return displayWindowRepository.findAll().stream()
                .map(window -> getWindowPlaybackStatus(window.getId()))
                .collect(Collectors.toList());
    }

    @Override
    public WindowPlaybackResponse addMediaToWindow(Long windowId, AddMediaRequest request) {
        if (request == null || request.getMediaId() == null) {
            log.warn("Attempted to add null media payload to window ID: {}", windowId);
            throw new IllegalArgumentException("AddMediaRequest or mediaId cannot be null");
        }

        DisplayWindow window = getWindowById(windowId);
        MediaItem mediaItem = mediaItemRepository.findById(request.getMediaId())
                .orElseThrow(() -> {
                    log.warn("Media item ID: {} not found when adding to window ID: {}", request.getMediaId(), windowId);
                    return new ResourceNotFoundException("Media item not found with id: " + request.getMediaId());
                });

        if (window.getPlaylistItems().size() >= MAX_PLAYLIST_ITEMS) {
            log.warn("Window ID: {} playlist capacity reached limit of {} items", windowId, MAX_PLAYLIST_ITEMS);
            throw new IllegalArgumentException("Window playlist limit reached (" + MAX_PLAYLIST_ITEMS + " items max)");
        }

        int nextOrder = window.getPlaylistItems().size() + 1;
        PlaylistItem playlistItem = new PlaylistItem(window, mediaItem, nextOrder);

        playlistItemRepository.save(playlistItem);
        playlistItemRepository.flush();
        entityManager.clear();

        log.info("Successfully added media ID: {} ('{}') to window ID: {} at position #{}",
                mediaItem.getId(), mediaItem.getTitle(), windowId, nextOrder);
        
        return getWindowPlaybackStatus(windowId);
    }

    @Override
    public WindowPlaybackResponse removeMediaFromWindow(Long windowId, Long mediaId) {
        if (mediaId == null || mediaId <= 0) {
            log.warn("Invalid media ID passed for removal from window ID: {}", windowId);
            throw new IllegalArgumentException("Invalid media ID for removal: " + mediaId);
        }

        DisplayWindow window = getWindowById(windowId);
        
        List<PlaylistItem> existingItems = playlistItemRepository.findByDisplayWindowIdOrderBySequenceOrderAsc(windowId);
        boolean existsInPlaylist = existingItems.stream()
                .anyMatch(item -> item.getMediaItem() != null && item.getMediaItem().getId().equals(mediaId));

        if (!existsInPlaylist) {
            log.warn("Media ID: {} is not present in playlist for window ID: {}", mediaId, windowId);
            throw new ResourceNotFoundException("Media item with ID " + mediaId + " is not assigned to playlist of window '" + window.getName() + "'");
        }

        playlistItemRepository.deleteByDisplayWindowIdAndMediaItemId(window.getId(), mediaId);

        List<PlaylistItem> remainingItems = playlistItemRepository.findByDisplayWindowIdOrderBySequenceOrderAsc(windowId);
        for (int i = 0; i < remainingItems.size(); i++) {
            PlaylistItem item = remainingItems.get(i);
            item.setSequenceOrder(i + 1);
            playlistItemRepository.save(item);
        }
        playlistItemRepository.flush();
        entityManager.clear();

        log.info("Successfully removed media ID: {} from window ID: {} and re-indexed sequence items", mediaId, windowId);

        return getWindowPlaybackStatus(windowId);
    }

    @Override
    public WindowPlaybackResponse movePlaylistItem(Long windowId, Long mediaId, String direction) {
        List<PlaylistItem> playlist = playlistItemRepository.findByDisplayWindowIdOrderBySequenceOrderAsc(windowId);

        int index = -1;
        for (int i = 0; i < playlist.size(); i++) {
            if (playlist.get(i).getMediaItem() != null && playlist.get(i).getMediaItem().getId().equals(mediaId)) {
                index = i;
                break;
            }
        }

        if (index == -1) {
            throw new ResourceNotFoundException("Media ID " + mediaId + " not found in playlist of window ID " + windowId);
        }

        int targetIndex = "up".equalsIgnoreCase(direction) ? index - 1 : index + 1;
        if (targetIndex >= 0 && targetIndex < playlist.size()) {
            PlaylistItem current = playlist.get(index);
            PlaylistItem target = playlist.get(targetIndex);

            int tempOrder = current.getSequenceOrder();
            current.setSequenceOrder(target.getSequenceOrder());
            target.setSequenceOrder(tempOrder);

            playlistItemRepository.save(current);
            playlistItemRepository.save(target);
            playlistItemRepository.flush();
            entityManager.clear();
            log.info("Moved media ID {} in window ID {} {}", mediaId, windowId, direction);
        }

        return getWindowPlaybackStatus(windowId);
    }

    private int calculateTotalDuration(List<PlaylistItem> playlistItems) {
        if (playlistItems == null) return 0;
        return playlistItems.stream()
                .map(PlaylistItem::getMediaItem)
                .filter(media -> media != null && media.getDurationSeconds() != null)
                .mapToInt(MediaItem::getDurationSeconds)
                .sum();
    }
}
