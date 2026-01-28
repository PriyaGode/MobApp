package com.OriginHubs.Amraj.dto;

import java.util.UUID;

import com.OriginHubs.Amraj.entity.enums.HubStatus;

public record HubSummaryResponse(
        UUID id,
        String code,
        String name,
        String location,
        String contactName,
        String contactPhone,
        String contactEmail,
        String city,
        String region,
        Double latitude,
        Double longitude,
        HubStatus status
) {
}
