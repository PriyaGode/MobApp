package com.OriginHubs.Amraj.dto;

import java.time.ZonedDateTime;
import java.util.UUID;

import com.OriginHubs.Amraj.entity.enums.HubStatus;

public record HubDetailResponse(
        UUID id,
        String code,
        String name,
        String location,
        String contactName,
        String contactPhone,
        String contactEmail,
        String city,
        String region,
        String address,
        Double latitude,
        Double longitude,
        HubStatus status,
        ZonedDateTime createdAt,
        ZonedDateTime updatedAt
) {
}
