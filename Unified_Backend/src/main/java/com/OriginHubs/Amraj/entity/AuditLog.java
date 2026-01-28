package com.OriginHubs.Amraj.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.UuidGenerator;

import com.OriginHubs.Amraj.entity.enums.AuditActionType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "audit_logs", indexes = {
        @Index(name = "idx_audit_created_at", columnList = "created_at"),
        @Index(name = "idx_audit_user_action", columnList = "user_id,action_type")
})
public class AuditLog {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "user_id", nullable = false, columnDefinition = "uuid")
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", nullable = false, length = 60)
    private AuditActionType actionType;

    @Column(name = "entity_type", length = 50)
    private String entityType;

    @Column(name = "entity_id", length = 64)
    private String entityId;

    @Column(name = "hub_id", columnDefinition = "uuid")
    private UUID hubId;

    @Column(name = "region_snapshot", length = 255)
    private String regionSnapshot;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "source", length = 30)
    private String source;

    @Column(name = "severity", length = 20)
    private String severity;

    @Column(name = "summary")
    private String summary;

    @Column(name = "old_data", columnDefinition = "jsonb")
    private String oldData;

    @Column(name = "new_data", columnDefinition = "jsonb")
    private String newData;

    @Column(name = "detail", columnDefinition = "jsonb")
    private String detail;

    @Column(name = "correlation_id", columnDefinition = "uuid")
    private UUID correlationId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    protected AuditLog() {}

    public AuditLog(UUID userId,
                    AuditActionType actionType,
                    String entityType,
                    String entityId,
                    UUID hubId,
                    String regionSnapshot,
                    String ipAddress,
                    String source,
                    String severity,
                    String summary) {
        this.userId = userId;
        this.actionType = actionType;
        this.entityType = entityType;
        this.entityId = entityId;
        this.hubId = hubId;
        this.regionSnapshot = regionSnapshot;
        this.ipAddress = ipAddress;
        this.source = source;
        this.severity = severity;
        this.summary = summary;
    }

    @PrePersist
    void onPersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public AuditActionType getActionType() { return actionType; }
    public String getEntityType() { return entityType; }
    public String getEntityId() { return entityId; }
    public UUID getHubId() { return hubId; }
    public String getRegionSnapshot() { return regionSnapshot; }
    public String getIpAddress() { return ipAddress; }
    public String getSource() { return source; }
    public String getSeverity() { return severity; }
    public String getSummary() { return summary; }
    public String getOldData() { return oldData; }
    public String getNewData() { return newData; }
    public String getDetail() { return detail; }
    public UUID getCorrelationId() { return correlationId; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setRegionSnapshot(String regionSnapshot) { this.regionSnapshot = regionSnapshot; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
    public void setSummary(String summary) { this.summary = summary; }
    public void setOldData(String oldData) { this.oldData = oldData; }
    public void setNewData(String newData) { this.newData = newData; }
    public void setDetail(String detail) { this.detail = detail; }
    public void setCorrelationId(UUID correlationId) { this.correlationId = correlationId; }
}
