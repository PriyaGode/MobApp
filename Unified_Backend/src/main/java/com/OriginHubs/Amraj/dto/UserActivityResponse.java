package com.OriginHubs.Amraj.dto;

import com.OriginHubs.Amraj.entity.enums.ActivityType;
import java.time.Instant;
import java.util.UUID;

public record UserActivityResponse(
        UUID id,
        String userId,
        ActivityType activityType,
        String description,
        Instant createdAt
) {
}
