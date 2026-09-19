package com.mediasquence.dto.request;

import java.io.Serializable;

import com.mediasquence.constants.MediaType;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateMediaRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotBlank(message = "Title is required")
    @Size(min = 2, max = 150, message = "Title must be between 2 and 150 characters")
    private String title;

    @NotNull(message = "Media type is required")
    private MediaType mediaType;

    private String url;

    @NotNull(message = "Duration in seconds is required")
    @Min(value = 1, message = "Duration must be at least 1 second")
    @Max(value = 18000, message = "Duration cannot exceed 5 hours (18,000 seconds)")
    private Integer durationSeconds;
}
