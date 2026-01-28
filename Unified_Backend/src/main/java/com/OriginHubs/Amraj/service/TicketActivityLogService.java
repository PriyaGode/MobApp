package com.OriginHubs.Amraj.service;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.OriginHubs.Amraj.model.TicketActivityLog;
import com.OriginHubs.Amraj.model.TicketActivityLog.ActivityType;
import com.OriginHubs.Amraj.repository.TicketActivityLogRepository;

@Service
public class TicketActivityLogService {

    private static final Logger log = LoggerFactory.getLogger(TicketActivityLogService.class);
    private final TicketActivityLogRepository activityLogRepository;

    public TicketActivityLogService(TicketActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    /**
     * Log a ticket activity
     */
    @Transactional
    public TicketActivityLog logActivity(
            Long ticketId,
            ActivityType activityType,
            String performedBy,
            String performedByRole,
            String oldValue,
            String newValue,
            String comment) {

        TicketActivityLog activityLog = new TicketActivityLog(ticketId, activityType, performedBy);
        activityLog.setPerformedByRole(performedByRole);
        activityLog.setOldValue(oldValue);
        activityLog.setNewValue(newValue);
        activityLog.setComment(comment);

        log.info("Logging activity: {} for ticket {} by {}", activityType, ticketId, performedBy);
        return activityLogRepository.save(activityLog);
    }

    /**
     * Log ticket creation
     */
    @Transactional
    public TicketActivityLog logTicketCreation(Long ticketId, String createdBy, String role) {
        return logActivity(ticketId, ActivityType.CREATED, createdBy, role, null, null, "Ticket created");
    }

    /**
     * Log ticket assignment
     */
    @Transactional
    public TicketActivityLog logAssignment(
            Long ticketId,
            String performedBy,
            String performedByRole,
            String oldAssignee,
            String newAssignee,
            String comment) {

        ActivityType type = (oldAssignee == null || oldAssignee.isEmpty())
                ? ActivityType.ASSIGNED
                : ActivityType.REASSIGNED;

        return logActivity(ticketId, type, performedBy, performedByRole, oldAssignee, newAssignee, comment);
    }

    /**
     * Log status change
     */
    @Transactional
    public TicketActivityLog logStatusChange(
            Long ticketId,
            String performedBy,
            String performedByRole,
            String oldStatus,
            String newStatus,
            String comment) {

        return logActivity(ticketId, ActivityType.STATUS_CHANGED, performedBy, performedByRole,
                oldStatus, newStatus, comment);
    }

    /**
     * Log priority change
     */
    @Transactional
    public TicketActivityLog logPriorityChange(
            Long ticketId,
            String performedBy,
            String performedByRole,
            String oldPriority,
            String newPriority,
            String comment) {

        return logActivity(ticketId, ActivityType.PRIORITY_CHANGED, performedBy, performedByRole,
                oldPriority, newPriority, comment);
    }

    /**
     * Log note addition
     */
    @Transactional
    public TicketActivityLog logNoteAdded(Long ticketId, String performedBy, String performedByRole, String note) {
        return logActivity(ticketId, ActivityType.NOTE_ADDED, performedBy, performedByRole, null, null, note);
    }

    /**
     * Log attachment addition
     */
    @Transactional
    public TicketActivityLog logAttachmentAdded(
            Long ticketId,
            String performedBy,
            String performedByRole,
            String fileName,
            String fileSize) {

        String comment = String.format("Attached file: %s (%s)", fileName, fileSize);
        return logActivity(ticketId, ActivityType.ATTACHMENT_ADDED, performedBy, performedByRole,
                null, fileName, comment);
    }

    /**
     * Log ticket closure
     */
    @Transactional
    public TicketActivityLog logTicketClosure(Long ticketId, String performedBy, String performedByRole,
            String resolution) {
        return logActivity(ticketId, ActivityType.CLOSED, performedBy, performedByRole, null, "CLOSED", resolution);
    }

    /**
     * Get all activities for a ticket
     */
    public List<TicketActivityLog> getTicketActivities(Long ticketId) {
        return activityLogRepository.findByTicketIdOrderByCreatedAtDesc(ticketId);
    }

    /**
     * Get recent activities for a ticket
     */
    public List<TicketActivityLog> getRecentTicketActivities(Long ticketId) {
        return activityLogRepository.findTop10ByTicketIdOrderByCreatedAtDesc(ticketId);
    }

    /**
     * Get activities by user
     */
    public List<TicketActivityLog> getUserActivities(String userId) {
        return activityLogRepository.findByPerformedByOrderByCreatedAtDesc(userId);
    }

    /**
     * Get activities within date range
     */
    public List<TicketActivityLog> getActivitiesByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return activityLogRepository.findByCreatedAtBetween(startDate, endDate);
    }

    /**
     * Count activities for a ticket
     */
    public Long countTicketActivities(Long ticketId) {
        return activityLogRepository.countByTicketId(ticketId);
    }
}
