package com.mediasquence.service.implementation;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.mediasquence.constants.MediaType;
import com.mediasquence.dto.request.CreateMediaRequest;
import com.mediasquence.entity.MediaItem;
import com.mediasquence.exception.ResourceNotFoundException;
import com.mediasquence.mapper.MediaMapper;
import com.mediasquence.repository.MediaItemRepository;
import com.mediasquence.repository.PlaylistItemRepository;
import com.mediasquence.repository.SyncStateRepository;
import com.mediasquence.service.MediaItemService;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Throwable.class)
public class MediaItemServiceImpl implements MediaItemService {

    private final MediaItemRepository mediaItemRepository;
    private final PlaylistItemRepository playlistItemRepository;
    private final SyncStateRepository syncStateRepository;
    private final MediaMapper mediaMapper;

    @PersistenceContext
    private final EntityManager entityManager;

    @Override
    public List<MediaItem> getAllMediaItems() {
        log.debug("Fetching all media catalog items from database");
        return mediaItemRepository.findAll();
    }

    @Override
    public MediaItem getMediaItemById(Long id) {
    	
        if (id == null || id <= 0) {
            log.warn("Invalid media ID passed to getMediaItemById: {}", id);
            throw new IllegalArgumentException("Invalid media ID provided: " + id);
        }
        return mediaItemRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Media item not found with ID: {}", id);
                    return new ResourceNotFoundException("Media item not found with id: " + id);
                });
    }

    @Override
    public MediaItem createMediaItem(CreateMediaRequest request) {
        if (request == null) {
            log.warn("Attempted to create media item with null request payload");
            throw new IllegalArgumentException("CreateMediaRequest payload cannot be null");
        }

        if ((request.getMediaType() == MediaType.VIDEO || request.getMediaType() == MediaType.IMAGE)
                && !StringUtils.hasText(request.getUrl())) {
            log.warn("Validation failed: URL is required for {} media type", request.getMediaType());
            throw new IllegalArgumentException("Asset URL is required for " + request.getMediaType() + " media type");
        }

        if (request.getMediaType() == MediaType.BLANK) {
            request.setUrl(null);
        } else if (StringUtils.hasText(request.getUrl())) {
            String cleanUrl = request.getUrl().toLowerCase().trim().split("\\?")[0];
            boolean isVideoPattern = cleanUrl.endsWith(".mp4") || cleanUrl.endsWith(".webm") || cleanUrl.endsWith(".mov")
                    || cleanUrl.endsWith(".m4v") || cleanUrl.contains("youtube.com") || cleanUrl.contains("youtu.be")
                    || cleanUrl.contains("vimeo.com") || cleanUrl.startsWith("data:video");

            boolean isImagePattern = cleanUrl.endsWith(".jpg") || cleanUrl.endsWith(".jpeg") || cleanUrl.endsWith(".png")
                    || cleanUrl.endsWith(".gif") || cleanUrl.endsWith(".webp") || cleanUrl.endsWith(".svg")
                    || cleanUrl.contains("images.unsplash.com") || cleanUrl.startsWith("data:image");

            if (request.getMediaType() == MediaType.IMAGE && isVideoPattern) {
                log.warn("Validation failed: IMAGE media type specified for video URL: {}", request.getUrl());
                throw new IllegalArgumentException("Selected media type is IMAGE, but the provided URL is a VIDEO format (.mp4, .webm, YouTube, Vimeo, etc.). Please select VIDEO as media type.");
            }

            if (request.getMediaType() == MediaType.VIDEO && isImagePattern) {
                log.warn("Validation failed: VIDEO media type specified for image URL: {}", request.getUrl());
                throw new IllegalArgumentException("Selected media type is VIDEO, but the provided URL is an IMAGE format (.jpg, .png, .gif, etc.). Please select IMAGE as media type.");
            }
        }

        MediaItem mediaItem = mediaMapper.dtoToEntity(request);
        MediaItem savedItem = mediaItemRepository.save(mediaItem);

        log.info("Successfully created media item ID: {}, Title: '{}', Type: '{}', Duration: {}s",
                savedItem.getId(), savedItem.getTitle(), savedItem.getMediaType(), savedItem.getDurationSeconds());

        return savedItem;
    }

    @Override
    public MediaItem updateMediaDuration(Long id, Integer durationSeconds) {
        if (durationSeconds == null || durationSeconds <= 0) {
            log.warn("Invalid duration passed for media ID {}: {}", id, durationSeconds);
            throw new IllegalArgumentException("Duration must be a positive integer in seconds.");
        }
        MediaItem mediaItem = getMediaItemById(id);
        mediaItem.setDurationSeconds(durationSeconds);
        MediaItem saved = mediaItemRepository.save(mediaItem);
        log.info("Updated media item ID {} duration to {} seconds", id, durationSeconds);
        return saved;
    }

    @Override
    public void deleteMediaItem(Long id) {
    	
        MediaItem mediaItem = getMediaItemById(id);

        syncStateRepository.deleteByActiveMediaItemId(id);
        playlistItemRepository.deleteByMediaItemId(id);

        if (entityManager != null) {
            entityManager.flush();
            entityManager.clear();
        }

        mediaItemRepository.deleteById(id);
        mediaItemRepository.flush();

        log.info("Successfully deleted media item ID: {} ('{}')", id, mediaItem.getTitle());
    }
}
