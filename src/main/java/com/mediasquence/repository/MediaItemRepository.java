package com.mediasquence.repository;

import com.mediasquence.constants.MediaType;
import com.mediasquence.entity.MediaItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MediaItemRepository extends JpaRepository<MediaItem, Long> {
    List<MediaItem> findByMediaType(MediaType mediaType);
}
