package com.OriginHubs.Amraj.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.OriginHubs.Amraj.model.TicketActivityLog;
import com.OriginHubs.Amraj.model.TicketActivityLog.ActivityType;

@Repository
public interface TicketActivityLogRepository extends JpaRepository<TicketActivityLog, Long> {

    /**
     * Find all activity logs for a specific ticket
     */
    List<TicketActivityLog> findByTicketIdOrderByCreatedAtDesc(Long ticketId);

    /**
     * Find all activities performed by a specific user
     */
    List<TicketActivityLog> findByPerformedByOrderByCreatedAtDesc(String performedBy);

    /**
     * Find activities by type for a ticket
     */
    List<TicketActivityLog> findByTicketIdAndActivityType(Long ticketId, ActivityType activityType);

    /**
     * Find activities within a date range
     */
    List<TicketActivityLog> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Find recent activities for a ticket
     */
    List<TicketActivityLog> findTop10ByTicketIdOrderByCreatedAtDesc(Long ticketId);

    /**
     * Count activities for a ticket
     */
    Long countByTicketId(Long ticketId);
}
