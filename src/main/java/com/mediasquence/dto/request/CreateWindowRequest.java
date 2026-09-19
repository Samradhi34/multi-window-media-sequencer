package com.mediasquence.dto.request;

import java.io.Serializable;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateWindowRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotBlank(message = "Window name is required")
    @Size(min = 2, max = 100, message = "Window name must be between 2 and 100 characters")
    private String name;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;
}
