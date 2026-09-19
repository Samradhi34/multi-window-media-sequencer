package com.mediasquence.dto.response;

import java.io.Serializable;
import java.util.List;

import com.mediasquence.entity.MediaItem;
import com.mediasquence.entity.PlaylistItem;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WindowPlaybackResponse implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long windowId;
    private String windowName;
    private String windowDescription;
    private MediaItem activeMediaItem;
    private Integer elapsedSecondsInMedia;
    private Integer remainingSecondsInMedia;
    private List<PlaylistItem> playlist;
    private Integer totalPlaylistDurationSeconds;
    private boolean isSyncActive;
    private Long serverTimeMs;
}
