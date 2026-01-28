package com.OriginHubs.Amraj.dto;

import java.time.Instant;
import java.util.UUID;

import com.OriginHubs.Amraj.entity.enums.AccessLevel;
import com.OriginHubs.Amraj.entity.enums.RoleType;
import com.OriginHubs.Amraj.entity.enums.UserStatus;

public record UserSummaryResponse(
        UUID id,
        String userId,
        String fullName,
        RoleType role,
        UserStatus status,
        String assignedHubName,
        String assignedHubCode,
        AccessLevel accessLevel,
        Instant lastLogin,
        String lastLoginIp,
        String lastLoginDevice
) {
}
