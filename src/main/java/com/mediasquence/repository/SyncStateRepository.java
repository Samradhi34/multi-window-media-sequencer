package com.mediasquence.repository;

import com.mediasquence.entity.SyncState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SyncStateRepository extends JpaRepository<SyncState, Long> {
    Optional<SyncState> findTopByOrderByIdDesc();

    @Modifying
    @Query("DELETE FROM SyncState s WHERE s.activeMediaItem.id = :mediaId")
    void deleteByActiveMediaItemId(@Param("mediaId") Long mediaId);
}
