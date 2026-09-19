package com.mediasquence.mapper;

import com.mediasquence.dto.request.CreateMediaRequest;
import com.mediasquence.entity.MediaItem;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class MediaMapper {
	
    public MediaItem dtoToEntity(CreateMediaRequest request) {
        if (request == null) {
            return null;
        }

        MediaItem mediaItem = new MediaItem();
        BeanUtils.copyProperties(request, mediaItem);
        mediaItem.setCreatedAt(LocalDateTime.now());
        
        if (mediaItem.getTitle() != null) {
            mediaItem.setTitle(mediaItem.getTitle().trim());
        }
        if (mediaItem.getUrl() != null) {
            mediaItem.setUrl(mediaItem.getUrl().trim());
        }

        return mediaItem;
    }

    public <T> T entityToDto(MediaItem entity, Class<T> dtoClass) {
        if (entity == null) {
            return null;
        }

        try {
            T dto = dtoClass.getDeclaredConstructor().newInstance();
            BeanUtils.copyProperties(entity, dto);
            return dto;
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to map entity to DTO: " + e.getMessage(), e);
        }
    }
}
