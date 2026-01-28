package com.OriginHubs.Amraj.dto;

import com.OriginHubs.Amraj.entity.enums.HubStatus;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record HubUpdateRequest(
        @NotBlank(message = "Hub name is required")
        @Size(min = 2, max = 255, message = "Hub name must be between 2 and 255 characters")
        String name,

        @NotBlank(message = "Location is required")
        String location,

        String contactName,

        @Pattern(regexp = "^[+]?[0-9]{10,20}$", message = "Invalid phone number format")
        String contactPhone,

        @Email(message = "Invalid email format")
        String contactEmail,

        String city,

        String region,

        String address,

        Double latitude,

        Double longitude,

        HubStatus status
) {
}
