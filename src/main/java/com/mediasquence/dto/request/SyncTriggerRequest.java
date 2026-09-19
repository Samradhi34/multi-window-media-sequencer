package com.mediasquence.dto.request;

import java.io.Serializable;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SyncTriggerRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotNull(message = "Media ID is required for sync playback")
    @Min(value = 1, message = "Media ID must be a positive number")
    private Long mediaId;

    @NotNull(message = "Sync duration is required")
    @Min(value = 1, message = "Sync duration must be at least 1 second")
    @Max(value = 18000, message = "Sync duration cannot exceed 5 hours (18,000 seconds)")
    private Integer durationSeconds;
}
