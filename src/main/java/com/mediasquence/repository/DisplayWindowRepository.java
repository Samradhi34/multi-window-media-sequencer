package com.mediasquence.repository;

import com.mediasquence.entity.DisplayWindow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DisplayWindowRepository extends JpaRepository<DisplayWindow, Long> {
    Optional<DisplayWindow> findByName(String name);

    @Query("SELECT DISTINCT w FROM DisplayWindow w LEFT JOIN FETCH w.playlistItems p LEFT JOIN FETCH p.mediaItem ORDER BY w.id ASC")
    List<DisplayWindow> findAllWithPlaylistItems();

    @Query("SELECT DISTINCT w FROM DisplayWindow w LEFT JOIN FETCH w.playlistItems p LEFT JOIN FETCH p.mediaItem WHERE w.id = :id")
    Optional<DisplayWindow> findByIdWithPlaylistItems(@Param("id") Long id);
}

