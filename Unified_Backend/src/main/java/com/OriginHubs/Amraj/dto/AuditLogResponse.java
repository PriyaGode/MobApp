package com.OriginHubs.Amraj.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.OriginHubs.Amraj.entity.AuditLog;
import com.OriginHubs.Amraj.entity.enums.AuditActionType;

public class AuditLogResponse {
    private UUID id;
    private UUID userId;
    private AuditActionType actionType;
    private LocalDateTime timestamp;
    private UUID hubId;
    private String regionSnapshot;
    private String ipAddress;
    private String summary;

    public AuditLogResponse(UUID id, UUID userId, AuditActionType actionType, LocalDateTime timestamp,
                            UUID hubId, String regionSnapshot, String ipAddress, String summary) {
        this.id = id;
        this.userId = userId;
        this.actionType = actionType;
        this.timestamp = timestamp;
        this.hubId = hubId;
        this.regionSnapshot = regionSnapshot;
        this.ipAddress = ipAddress;
        this.summary = summary;
    }

    public static AuditLogResponse fromEntity(AuditLog log) {
        return new AuditLogResponse(
                log.getId(),
                log.getUserId(),
                log.getActionType(),
                log.getCreatedAt(),
                log.getHubId(),
                log.getRegionSnapshot(),
                log.getIpAddress(),
                log.getSummary()
        );
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public AuditActionType getActionType() { return actionType; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public UUID getHubId() { return hubId; }
    public String getRegionSnapshot() { return regionSnapshot; }
    public String getIpAddress() { return ipAddress; }
    public String getSummary() { return summary; }
}
