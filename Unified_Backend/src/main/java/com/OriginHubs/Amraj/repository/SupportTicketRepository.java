package com.OriginHubs.Amraj.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.OriginHubs.Amraj.model.SupportTicket;
import com.OriginHubs.Amraj.model.SupportTicket.TicketStatus;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {

    List<SupportTicket> findByUserId(String userId);

    List<SupportTicket> findByStatus(TicketStatus status);

    List<SupportTicket> findByAssignedTo(String assignedTo);

    List<SupportTicket> findByUserIdAndStatus(String userId, TicketStatus status);

    List<SupportTicket> findByCategory(String category);

    @Query("SELECT t FROM SupportTicket t WHERE t.createdAt BETWEEN :startDate AND :endDate")
    List<SupportTicket> findByCreatedAtBetween(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT t FROM SupportTicket t WHERE t.userId = :userId ORDER BY t.createdAt DESC")
    List<SupportTicket> findByUserIdOrderByCreatedAtDesc(@Param("userId") String userId);

    @Query("SELECT t FROM SupportTicket t WHERE t.userId = :userId ORDER BY t.updatedAt DESC")
    List<SupportTicket> findByUserIdOrderByUpdatedAtDesc(@Param("userId") String userId);

    Long countByStatus(TicketStatus status);

    Long countByUserId(String userId);
}
