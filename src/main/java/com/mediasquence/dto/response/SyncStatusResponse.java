package com.mediasquence.dto.response;

import java.io.Serializable;

import com.mediasquence.entity.MediaItem;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SyncStatusResponse implements Serializable {

    private static final long serialVersionUID = 1L;

    private boolean isActive;
    private MediaItem activeMediaItem;
    private Long startTimeMs;
    private Integer durationSeconds;
    private Integer remainingSeconds;
    private Long serverTimeMs;
}
