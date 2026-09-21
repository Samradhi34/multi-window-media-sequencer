package com.mediasquence.entity;

import java.io.Serializable;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import com.fasterxml.jackson.annotation.JsonIgnore;

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
import lombok.ToString;

@Entity
@Table(name = "playlist_items")
@Data
@NoArgsConstructor
public class PlaylistItem implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "playlist_item_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "window_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    private DisplayWindow displayWindow;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "media_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private MediaItem mediaItem;

    @Column(name = "sequence_order", nullable = false)
    private Integer sequenceOrder;

    public PlaylistItem(DisplayWindow displayWindow, MediaItem mediaItem, Integer sequenceOrder) {
        this.displayWindow = displayWindow;
        this.mediaItem = mediaItem;
        this.sequenceOrder = sequenceOrder;
    }
}
