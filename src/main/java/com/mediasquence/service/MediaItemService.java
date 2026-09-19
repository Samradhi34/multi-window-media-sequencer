package com.mediasquence.service;

import com.mediasquence.dto.request.CreateMediaRequest;
import com.mediasquence.entity.MediaItem;

import java.util.List;

public interface MediaItemService {
    List<MediaItem> getAllMediaItems();
    MediaItem getMediaItemById(Long id);
    MediaItem createMediaItem(CreateMediaRequest request);
    MediaItem updateMediaDuration(Long id, Integer durationSeconds);
    void deleteMediaItem(Long id);
}
