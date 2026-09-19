package com.mediasquence.dto.request;

import java.io.Serializable;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddMediaRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotNull(message = "Media ID is required")
    @Min(value = 1, message = "Media ID must be a positive number")
    private Long mediaId;
}
