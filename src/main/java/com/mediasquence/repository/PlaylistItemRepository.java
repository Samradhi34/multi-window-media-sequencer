package com.mediasquence.repository;

import com.mediasquence.entity.PlaylistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlaylistItemRepository extends JpaRepository<PlaylistItem, Long> {
    @Query("SELECT p FROM PlaylistItem p JOIN FETCH p.mediaItem WHERE p.displayWindow.id = :windowId ORDER BY p.sequenceOrder ASC")
    List<PlaylistItem> findByDisplayWindowIdOrderBySequenceOrderAsc(@Param("windowId") Long windowId);

    @Modifying
    @Query("DELETE FROM PlaylistItem p WHERE p.displayWindow.id = :windowId AND p.mediaItem.id = :mediaId")
    void deleteByDisplayWindowIdAndMediaItemId(@Param("windowId") Long windowId, @Param("mediaId") Long mediaId);

    @Modifying
    @Query("DELETE FROM PlaylistItem p WHERE p.displayWindow.id = :windowId")
    void deleteByDisplayWindowId(@Param("windowId") Long windowId);

    @Modifying
    @Query("DELETE FROM PlaylistItem p WHERE p.mediaItem.id = :mediaId")
    void deleteByMediaItemId(@Param("mediaId") Long mediaId);
}
