package com.OriginHubs.Amraj.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "ticket_activity_log")
public class TicketActivityLog {

    public enum ActivityType {
        CREATED,
        ASSIGNED,
        REASSIGNED,
        STATUS_CHANGED,
        PRIORITY_CHANGED,
        COMMENT_ADDED,
        NOTE_ADDED,
        ATTACHMENT_ADDED,
        CLOSED,
        REOPENED,
        RESOLVED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ticket_id", nullable = false)
    private Long ticketId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActivityType activityType;

    @Column(name = "performed_by", nullable = false)
    private String performedBy; // User ID or name of person who performed the action

    @Column(name = "performed_by_role")
    private String performedByRole; // Role of the person (Super Admin, Hub Admin, etc.)

    @Column(name = "old_value")
    private String oldValue; // Previous value (for changes)

    @Column(name = "new_value")
    private String newValue; // New value (for changes)

    @Column(columnDefinition = "TEXT")
    private String comment; // Optional comment explaining the action

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "ip_address")
    private String ipAddress; // For audit purposes

    // Constructors
    public TicketActivityLog() {
        this.createdAt = LocalDateTime.now();
    }

    public TicketActivityLog(Long ticketId, ActivityType activityType, String performedBy) {
        this();
        this.ticketId = ticketId;
        this.activityType = activityType;
        this.performedBy = performedBy;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTicketId() {
        return ticketId;
    }

    public void setTicketId(Long ticketId) {
        this.ticketId = ticketId;
    }

    public ActivityType getActivityType() {
        return activityType;
    }

    public void setActivityType(ActivityType activityType) {
        this.activityType = activityType;
    }

    public String getPerformedBy() {
        return performedBy;
    }

    public void setPerformedBy(String performedBy) {
        this.performedBy = performedBy;
    }

    public String getPerformedByRole() {
        return performedByRole;
    }

    public void setPerformedByRole(String performedByRole) {
        this.performedByRole = performedByRole;
    }

    public String getOldValue() {
        return oldValue;
    }

    public void setOldValue(String oldValue) {
        this.oldValue = oldValue;
    }

    public String getNewValue() {
        return newValue;
    }

    public void setNewValue(String newValue) {
        this.newValue = newValue;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    @Override
    public String toString() {
        return "TicketActivityLog{" +
                "id=" + id +
                ", ticketId=" + ticketId +
                ", activityType=" + activityType +
                ", performedBy='" + performedBy + '\'' +
                ", oldValue='" + oldValue + '\'' +
                ", newValue='" + newValue + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}
