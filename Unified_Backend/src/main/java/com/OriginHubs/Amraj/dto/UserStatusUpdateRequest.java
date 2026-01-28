package com.OriginHubs.Amraj.dto;

import com.OriginHubs.Amraj.entity.enums.UserStatus;
import jakarta.validation.constraints.NotNull;

public record UserStatusUpdateRequest(
        @NotNull(message = "status is required")
        UserStatus status
) {
}
