package com.OriginHubs.Amraj.dto;

import java.time.Instant;
import java.util.UUID;

import com.OriginHubs.Amraj.entity.enums.ActivityType;

public record LoginHistoryResponse(
        UUID id,
        String userId,
        String userName,
        ActivityType activityType,
        String description,
        String ipAddress,
        String deviceInfo,
        Instant timestamp
) {
}
