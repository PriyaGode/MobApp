package com.OriginHubs.Amraj.dto;

import com.OriginHubs.Amraj.entity.enums.AccessLevel;
import com.OriginHubs.Amraj.entity.enums.RoleType;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record UserRoleAssignmentRequest(
        @NotNull(message = "role is required")
        RoleType role,
        @NotNull(message = "accessLevel is required")
        AccessLevel accessLevel,
        UUID hubId
) {
}
