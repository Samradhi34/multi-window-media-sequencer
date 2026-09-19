package com.mediasquence.controller;

import com.mediasquence.dto.request.CreateMediaRequest;
import com.mediasquence.dto.response.GenericResponseHandlers;
import com.mediasquence.entity.MediaItem;
import com.mediasquence.service.MediaItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(originPatterns = "*")
public class MediaItemController {

    private final MediaItemService mediaItemService;

    @GetMapping
    public ResponseEntity<?> getAllMediaItems() {
        log.debug("REST request to fetch all media catalog items");
        List<MediaItem> items = mediaItemService.getAllMediaItems();
        return new GenericResponseHandlers.Builder()
                .setStatus(HttpStatus.OK)
                .setMessage("Media catalog retrieved successfully")
                .setData(items)
                .create();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMediaItemById(@PathVariable("id") Long id) {
        log.debug("REST request to fetch media item by ID: {}", id);
        MediaItem item = mediaItemService.getMediaItemById(id);
        return new GenericResponseHandlers.Builder()
                .setStatus(HttpStatus.OK)
                .setMessage("Media item retrieved successfully")
                .setData(item)
                .create();
    }

    @PostMapping
    public ResponseEntity<?> createMediaItem(@Valid @RequestBody CreateMediaRequest request) {
        log.info("REST request to create media asset title: '{}', type: '{}', duration: {}s",
                request.getTitle(), request.getMediaType(), request.getDurationSeconds());
        MediaItem createdItem = mediaItemService.createMediaItem(request);
        return new GenericResponseHandlers.Builder()
                .setStatus(HttpStatus.CREATED)
                .setMessage("Media item created successfully")
                .setData(createdItem)
                .create();
    }

    @org.springframework.web.bind.annotation.PutMapping("/{id}/duration")
    public ResponseEntity<?> updateMediaDuration(@PathVariable("id") Long id,
            @RequestBody java.util.Map<String, Integer> payload) {
        Integer duration = payload.get("durationSeconds");
        log.info("REST request to update duration for media asset ID: {} to {}s", id, duration);
        MediaItem updated = mediaItemService.updateMediaDuration(id, duration);
        return new GenericResponseHandlers.Builder()
                .setStatus(HttpStatus.OK)
                .setMessage("Media duration updated successfully")
                .setData(updated)
                .create();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMediaItem(@PathVariable("id") Long id) {
        log.info("REST request to delete media asset ID: {}", id);
        mediaItemService.deleteMediaItem(id);
        return new GenericResponseHandlers.Builder()
                .setStatus(HttpStatus.OK)
                .setMessage("Media item deleted successfully")
                .create();
    }
}
