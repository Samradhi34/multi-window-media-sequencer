package com.mediasquence.entity;

import java.io.Serializable;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "sync_state")
@Data
@NoArgsConstructor
public class SyncState implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sync_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "active_media_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private MediaItem activeMediaItem;

    @Column(name = "start_time_ms", nullable = false)
    private Long startTimeMs;

    @Column(name = "duration_seconds", nullable = false)
    private Integer durationSeconds;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    public SyncState(MediaItem activeMediaItem, Long startTimeMs, Integer durationSeconds, Boolean isActive) {
        this.activeMediaItem = activeMediaItem;
        this.startTimeMs = startTimeMs;
        this.durationSeconds = durationSeconds;
        this.isActive = isActive;
    }
}
