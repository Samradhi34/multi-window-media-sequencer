package com.mediasquence.entity;

import java.io.Serializable;
import java.time.LocalDateTime;

import com.mediasquence.constants.MediaType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "media_items")
@Data
@NoArgsConstructor
public class MediaItem implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "media_id")
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", nullable = false, length = 20)
    private MediaType mediaType;

    @Column(columnDefinition = "TEXT")
    private String url;

    @Column(name = "duration_seconds", nullable = false)
    private Integer durationSeconds;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public MediaItem(String title, MediaType mediaType, String url, Integer durationSeconds) {
        this.title = title;
        this.mediaType = mediaType;
        this.url = url;
        this.durationSeconds = durationSeconds;
        this.createdAt = LocalDateTime.now();
    }

    public static MediaItem createBlankItem(String title, Integer durationSeconds) {
        return new MediaItem(title, MediaType.BLANK, null, durationSeconds);
    }
}
